const statusEl = document.querySelector('#system-status');
const errorEl = document.querySelector('#error');
const workspaceSelect = document.querySelector('#workspace-select');
const dashboardWorkspace = document.querySelector('#dashboard-workspace');
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
const repositoryProposalButton = document.querySelector('#repository-proposal-button');
const repositoryApprovalBox = document.querySelector('#repository-approval-box');

let bootstrap = null;
let snapshot = null;
let repositoryProposal = null;
let repositoryApproval = null;

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
    await refreshCommandCenter();
  } catch (error) {
    showError(error);
    statusEl.textContent = 'Local system unavailable';
  }
}

function renderWorkspaceOptions() {
  const previousDashboard = dashboardWorkspace.value;
  workspaceSelect.replaceChildren();
  workspaceSelect.add(new Option('Create new workspace', '__new__'));
  dashboardWorkspace.replaceChildren(new Option('Choose workspace…', ''));
  for (const workspace of bootstrap.workspaces) {
    workspaceSelect.add(new Option(workspace.name, workspace.id));
    dashboardWorkspace.add(new Option(workspace.name, workspace.id));
  }
  if (bootstrap.workspaces.length > 0) {
    workspaceSelect.value = bootstrap.workspaces[0].id;
    dashboardWorkspace.value = bootstrap.workspaces.some((item) => item.id === previousDashboard) ? previousDashboard : bootstrap.workspaces[0].id;
  }
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
dashboardWorkspace.addEventListener('change', refreshCommandCenter);
document.querySelector('#refresh-command-center').addEventListener('click', refreshCommandCenter);

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
    const workspaceId = snapshot.intake.workspace_id;
    const projectId = snapshot.project.id;
    const graph = await api(`/api/projects/${encodeURIComponent(projectId)}/work-graph/initialize`, { method: 'POST', body: { workspaceId } });
    const pack = await api(`/api/projects/${encodeURIComponent(projectId)}/project-pack`, { method: 'POST', body: { workspaceId } });

    reviewPanel.classList.add('hidden');
    acceptedPanel.classList.remove('hidden');
    const clientNote = snapshot.engagement ? ` Engagement remains ${snapshot.engagement.status}; internal acceptance did not fabricate client acceptance.` : '';
    document.querySelector('#accepted-summary').textContent = `${snapshot.project.title} is now ${snapshot.project.operational_status} in ${snapshot.project.lifecycle_phase}. Working strategy: ${strategyLabel(snapshot.acceptedBrief.delivery_strategy)}.${clientNote}`;
    document.querySelector('#bootstrap-summary').textContent = `${graph.nodes.length} initial WorkItems created. Project Pack v${pack.version} generated deterministically.`;
    repositoryProposalButton.classList.toggle('hidden', !['custom_build', 'hybrid'].includes(snapshot.acceptedBrief.delivery_strategy));
    repositoryApprovalBox.classList.add('hidden');
    repositoryProposal = null;
    repositoryApproval = null;

    bootstrap = await api('/api/workspaces');
    renderWorkspaceOptions();
    dashboardWorkspace.value = workspaceId;
    await refreshCommandCenter();
    acceptedPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    showError(error);
  }
});

repositoryProposalButton.addEventListener('click', async () => {
  if (!snapshot) return;
  clearError();
  try {
    const workspaceId = snapshot.intake.workspace_id;
    const projectId = snapshot.project.id;
    repositoryProposal = await api(`/api/projects/${encodeURIComponent(projectId)}/repository-proposals`, {
      method: 'POST', body: { workspaceId, reason: 'The accepted delivery strategy requires a source repository.', desiredVisibility: 'private' }
    });
    repositoryApproval = await api(`/api/repository-proposals/${encodeURIComponent(repositoryProposal.id)}/request-approval`, {
      method: 'POST', body: { workspaceId, projectId }
    });
    repositoryApprovalBox.classList.remove('hidden');
    repositoryApprovalBox.innerHTML = `<p><strong>Repository approval required.</strong> This Phase 1 action creates only a mock repository reference.</p><button type="button" id="approve-repository">Approve mock repository</button>`;
    document.querySelector('#approve-repository').addEventListener('click', approveMockRepository);
    await refreshCommandCenter();
  } catch (error) { showError(error); }
});

async function approveMockRepository() {
  if (!snapshot || !repositoryProposal || !repositoryApproval) return;
  try {
    const workspaceId = snapshot.intake.workspace_id;
    const projectId = snapshot.project.id;
    await api(`/api/approvals/${encodeURIComponent(repositoryApproval.id)}/resolve`, {
      method: 'POST', body: { workspaceId, projectId, decision: 'approved', evidence: ['operator-ui-approval'] }
    });
    const result = await api(`/api/repository-proposals/${encodeURIComponent(repositoryProposal.id)}/mock-execute`, {
      method: 'POST', body: { workspaceId, projectId }
    });
    repositoryApprovalBox.innerHTML = `<p><strong>Mock repository approved.</strong><br><code>${escapeHtml(result.repository_ref)}</code></p>`;
    await refreshCommandCenter();
  } catch (error) { showError(error); }
}

document.querySelector('#new-project-button').addEventListener('click', () => window.location.reload());

async function refreshCommandCenter() {
  const workspaceId = dashboardWorkspace.value;
  const portfolio = document.querySelector('#portfolio');
  const attentionList = document.querySelector('#attention-list');
  const activityList = document.querySelector('#activity-list');
  if (!workspaceId) {
    portfolio.textContent = 'Create a workspace/project below to populate the portfolio.';
    attentionList.replaceChildren();
    activityList.replaceChildren();
    document.querySelector('#attention-count').textContent = '0';
    return;
  }
  try {
    const center = await api(`/api/command-center?workspaceId=${encodeURIComponent(workspaceId)}`);
    document.querySelector('#attention-count').textContent = String(center.needsMyAttention.length);
    portfolio.replaceChildren();
    if (center.projects.length === 0) portfolio.textContent = 'No projects in this workspace yet.';
    for (const project of center.projects) portfolio.append(renderProjectCard(project, workspaceId));
    renderAttention(center.needsMyAttention, attentionList);
    renderActivity(center.activityFeed, activityList);
  } catch (error) { showError(error); }
}

function renderProjectCard(project, workspaceId) {
  const card = document.createElement('article');
  card.className = 'project-card';
  card.innerHTML = `
    <div>
      <p class="eyebrow">${escapeHtml(project.kind)}</p>
      <h3>${escapeHtml(project.title)}</h3>
      <p class="muted">${escapeHtml(project.phase)} · ${escapeHtml(project.status)} · ${escapeHtml(project.health)}</p>
    </div>
    <div class="project-metrics">
      <span>${project.nextReadyCount} ready</span>
      <span>${project.attentionCount} attention</span>
    </div>
    <div class="button-row">
      <button class="secondary compact inspect-project" type="button">Inspect</button>
      <button class="secondary compact run-next" type="button" ${project.nextReadyCount === 0 ? 'disabled' : ''}>Run next mock task</button>
    </div>
    <pre class="project-detail hidden"></pre>`;
  card.querySelector('.inspect-project').addEventListener('click', async () => {
    const detail = await api(`/api/projects/${encodeURIComponent(project.id)}/command-center?workspaceId=${encodeURIComponent(workspaceId)}`);
    const target = card.querySelector('.project-detail');
    target.classList.toggle('hidden');
    target.textContent = summarizeProject(detail);
  });
  card.querySelector('.run-next').addEventListener('click', () => runNextMockTask(workspaceId, project.id));
  return card;
}

async function runNextMockTask(workspaceId, projectId) {
  clearError();
  try {
    const detail = await api(`/api/projects/${encodeURIComponent(projectId)}/command-center?workspaceId=${encodeURIComponent(workspaceId)}`);
    const next = detail.nextReady[0];
    if (!next) throw new Error('No eligible WorkItem is ready.');
    const created = await api(`/api/projects/${encodeURIComponent(projectId)}/assignments`, { method: 'POST', body: { workspaceId, workItemId: next.id } });
    const assignmentId = created.row.id;
    await api(`/api/assignments/${encodeURIComponent(assignmentId)}/start`, { method: 'POST', body: { workspaceId, projectId } });
    await api(`/api/assignments/${encodeURIComponent(assignmentId)}/finish`, { method: 'POST', body: { workspaceId, projectId } });
    await api(`/api/assignments/${encodeURIComponent(assignmentId)}/evidence`, { method: 'POST', body: { workspaceId, projectId, level: 'L2', summary: 'Synthetic Phase 1 evidence produced by the local mock worker.' } });
    await api(`/api/assignments/${encodeURIComponent(assignmentId)}/verify`, { method: 'POST', body: { workspaceId, projectId, outcome: 'pass', level: 'L2', summary: 'Synthetic verifier accepted the bounded mock result.' } });
    await api(`/api/projects/${encodeURIComponent(projectId)}/readiness/refresh`, { method: 'POST', body: { workspaceId } });
    await api(`/api/projects/${encodeURIComponent(projectId)}/project-pack`, { method: 'POST', body: { workspaceId } });
    await refreshCommandCenter();
  } catch (error) { showError(error); }
}

function renderAttention(items, target) {
  target.replaceChildren();
  if (items.length === 0) { target.textContent = 'Nothing currently needs operator attention.'; return; }
  for (const item of items) {
    const row = document.createElement('div');
    row.className = 'feed-row';
    row.innerHTML = `<strong>${escapeHtml(item.type)}</strong><span>${escapeHtml(item.title)}</span>`;
    target.append(row);
  }
}

function renderActivity(items, target) {
  target.replaceChildren();
  if (items.length === 0) { target.textContent = 'No activity yet.'; return; }
  for (const item of items.slice(0, 30)) {
    const row = document.createElement('div');
    row.className = 'feed-row';
    row.innerHTML = `<strong>${escapeHtml(item.event_type)}</strong><span>${escapeHtml(item.reason ?? item.entity_type)}</span>`;
    target.append(row);
  }
}

function summarizeProject(detail) {
  const next = detail.nextReady.map((item) => item.title).join(', ') || 'none';
  const attention = detail.needsMyAttention.map((item) => `${item.type}: ${item.title}`).join('\n') || 'none';
  const assignments = detail.activeAssignments.map((item) => `${item.status}: ${item.recovery_state}`).join('\n') || 'none';
  return `Brief v${detail.project.current_brief_version ?? '—'}\nNext ready: ${next}\nAttention:\n${attention}\nActive assignments:\n${assignments}`;
}

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

function showError(error) { errorEl.textContent = error instanceof Error ? error.message : String(error); }
function clearError() { errorEl.textContent = ''; }
function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}
