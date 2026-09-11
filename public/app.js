const statusEl = document.querySelector('#system-status');
const errorEl = document.querySelector('#error');
const workspaceSelect = document.querySelector('#workspace-select');
const workspaceNameWrap = document.querySelector('#workspace-name-wrap');
const projectMode = document.querySelector('#project-mode');
const clientNameWrap = document.querySelector('#client-name-wrap');
const startForm = document.querySelector('#start-form');
const discoveryPanel = document.querySelector('#discovery-panel');
const discoveryForm = document.querySelector('#discovery-form');
const questionsEl = document.querySelector('#questions');
const strategySelect = document.querySelector('#strategy-select');
const reviewPanel = document.querySelector('#review-panel');
const acceptButton = document.querySelector('#accept-button');
const acceptedPanel = document.querySelector('#accepted-panel');

let bootstrap = null;
let snapshot = null;

await initialize();

async function initialize() {
  try {
    const [health, data] = await Promise.all([api('/api/health'), api('/api/workspaces')]);
    bootstrap = data;
    statusEl.textContent = `${health.phase} / ${health.gate} · ${health.database.migrations} migrations`;
    renderWorkspaceOptions();
    renderStrategies();
    renderQuestions();
    syncModeFields();
  } catch (error) {
    showError(error);
    statusEl.textContent = 'Local system unavailable';
  }
}

function renderWorkspaceOptions() {
  workspaceSelect.replaceChildren();
  const create = new Option('Create new workspace', '__new__');
  workspaceSelect.add(create);
  for (const workspace of bootstrap.workspaces) workspaceSelect.add(new Option(workspace.name, workspace.id));
  if (bootstrap.workspaces.length > 0) workspaceSelect.value = bootstrap.workspaces[0].id;
  syncWorkspaceFields();
}

function renderStrategies() {
  strategySelect.replaceChildren(new Option('Choose a working strategy…', ''));
  for (const strategy of bootstrap.deliveryStrategies) strategySelect.add(new Option(strategyLabel(strategy), strategy));
}

function renderQuestions() {
  questionsEl.replaceChildren();
  for (const question of bootstrap.discoveryQuestions) {
    const wrapper = document.createElement('fieldset');
    wrapper.className = 'question';
    wrapper.dataset.questionKey = question.key;
    wrapper.innerHTML = `
      <legend>${escapeHtml(question.prompt)}</legend>
      <div class="question-controls">
        <select class="response-state" aria-label="Answer state for ${escapeHtml(question.prompt)}">
          <option value="answered">I can answer</option>
          <option value="unknown">I don't know</option>
          <option value="skipped">Skip for now</option>
        </select>
        <textarea class="response-answer" rows="3" placeholder="Plain-language answer"></textarea>
      </div>`;
    const state = wrapper.querySelector('.response-state');
    const answer = wrapper.querySelector('.response-answer');
    state.addEventListener('change', () => {
      answer.disabled = state.value !== 'answered';
      if (answer.disabled) answer.value = '';
    });
    questionsEl.append(wrapper);
  }
}

workspaceSelect.addEventListener('change', syncWorkspaceFields);
projectMode.addEventListener('change', syncModeFields);

function syncWorkspaceFields() {
  workspaceNameWrap.classList.toggle('hidden', workspaceSelect.value !== '__new__');
}

function syncModeFields() {
  const isClient = projectMode.value === 'client';
  clientNameWrap.classList.toggle('hidden', !isClient);
  const input = clientNameWrap.querySelector('input');
  input.required = isClient;
}

startForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();
  const data = new FormData(startForm);
  const body = {
    mode: data.get('mode'),
    title: data.get('title'),
    rawRequest: data.get('rawRequest'),
    requestedSolution: data.get('requestedSolution'),
    clientName: data.get('clientName')
  };
  if (workspaceSelect.value === '__new__') body.workspaceName = data.get('workspaceName');
  else body.workspaceId = workspaceSelect.value;

  try {
    snapshot = await api('/api/intakes', { method: 'POST', body });
    document.querySelector('#project-title').textContent = snapshot.project.title;
    document.querySelector('#intake-status').textContent = snapshot.intake.status;
    document.querySelector('#raw-request-summary').textContent = `Raw request: ${snapshot.intake.raw_request}`;
    discoveryPanel.classList.remove('hidden');
    reviewPanel.classList.add('hidden');
    acceptedPanel.classList.add('hidden');
    discoveryPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    showError(error);
  }
});

discoveryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();
  if (!snapshot) return;
  const responses = [...document.querySelectorAll('.question')].map((question) => ({
    questionKey: question.dataset.questionKey,
    responseState: question.querySelector('.response-state').value,
    answerText: question.querySelector('.response-answer').value
  }));

  try {
    snapshot = await api(`/api/intakes/${encodeURIComponent(snapshot.intake.id)}/discovery`, {
      method: 'PUT',
      body: { workspaceId: snapshot.intake.workspace_id, responses }
    });
    snapshot = await api(`/api/intakes/${encodeURIComponent(snapshot.intake.id)}/strategy`, {
      method: 'PUT',
      body: {
        workspaceId: snapshot.intake.workspace_id,
        strategy: strategySelect.value,
        rationale: document.querySelector('#strategy-rationale').value
      }
    });
    document.querySelector('#intake-status').textContent = snapshot.intake.status;
    renderReview(snapshot);
    reviewPanel.classList.remove('hidden');
    reviewPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    showError(error);
  }
});

acceptButton.addEventListener('click', async () => {
  clearError();
  if (!snapshot) return;
  try {
    snapshot = await api(`/api/intakes/${encodeURIComponent(snapshot.intake.id)}/accept`, {
      method: 'POST',
      body: {
        workspaceId: snapshot.intake.workspace_id,
        expectedProjectVersion: snapshot.project.version
      }
    });
    reviewPanel.classList.add('hidden');
    acceptedPanel.classList.remove('hidden');
    const clientNote = snapshot.engagement ? ` Engagement remains ${snapshot.engagement.status}; internal acceptance did not fabricate client acceptance.` : '';
    document.querySelector('#accepted-summary').textContent = `${snapshot.project.title} is now ${snapshot.project.operational_status} in ${snapshot.project.lifecycle_phase}. Working strategy: ${strategyLabel(snapshot.acceptedBrief.delivery_strategy)}.${clientNote}`;
    acceptedPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    showError(error);
  }
});

document.querySelector('#new-project-button').addEventListener('click', () => window.location.reload());

function renderReview(current) {
  const responseMap = new Map(current.responses.map((row) => [row.question_key, row]));
  const lines = [
    `Project: ${current.project.title}`,
    `Problem: ${displayResponse(responseMap.get('problem'))}`,
    `Desired outcome: ${displayResponse(responseMap.get('desired_outcome'))}`,
    `Primary users: ${displayResponse(responseMap.get('primary_users'))}`,
    `Constraints: ${displayResponse(responseMap.get('constraints'))}`,
    `Success: ${displayResponse(responseMap.get('success'))}`,
    `Requested solution: ${current.intake.requested_solution ?? 'none recorded'}`,
    `Working strategy: ${strategyLabel(current.strategy.strategy)}`
  ];
  document.querySelector('#review-summary').textContent = lines.join('\n');
}

function displayResponse(row) {
  if (!row) return 'not answered';
  if (row.response_state === 'answered') return row.answer_text;
  if (row.response_state === 'unknown') return "I don't know";
  return 'skipped';
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    cache: 'no-store',
    headers: options.body ? { 'content-type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? `Request failed: ${response.status}`);
  return body;
}

function strategyLabel(value) {
  const labels = {
    process_change: 'Process change',
    adopt_existing: 'Adopt an existing solution',
    configure: 'Configure an existing system',
    integrate: 'Integrate existing systems',
    automate: 'Automate a workflow',
    custom_build: 'Custom build',
    hybrid: 'Hybrid approach',
    research_pilot: 'Research or pilot first',
    defer: 'Decline or defer'
  };
  return labels[value] ?? value;
}

function showError(error) {
  errorEl.textContent = error instanceof Error ? error.message : String(error);
}
function clearError() { errorEl.textContent = ''; }
function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}
