const statusEl = document.querySelector('#system-status');
const errorEl = document.querySelector('#error');
const workspaceSelect = document.querySelector('#workspace-select');
const dashboardWorkspace = document.querySelector('#dashboard-workspace');
const workspaceNameWrap = document.querySelector('#workspace-name-wrap');
const projectMode = document.querySelector('#project-mode');
const clientNameWrap = document.querySelector('#client-name-wrap');
const startForm = document.querySelector('#start-form');
const discoveryPanel = document.querySelector('#discovery-panel');
const questionForm = document.querySelector('#question-form');
const questionsEl = document.querySelector('#questions');
const analysisSummary = document.querySelector('#analysis-summary');
const researchBlock = document.querySelector('#research-block');
const reviewPanel = document.querySelector('#review-panel');
const reviewForm = document.querySelector('#review-form');
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
    renderStrategyOptions();
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

function renderStrategyOptions() {
  const target = document.querySelector('#review-strategy');
  target.replaceChildren();
  for (const strategy of bootstrap.deliveryStrategies) target.add(new Option(strategyLabel(strategy), strategy));
}

workspaceSelect.addEventListener('change', syncWorkspaceFields);
projectMode.addEventListener('change', syncModeFields);
dashboardWorkspace.addEventListener('change', refreshCommandCenter);
document.querySelector('#refresh-command-center').addEventListener('click', refreshCommandCenter);
document.querySelector('#new-project-button').addEventListener('click', () => window.location.reload());

function syncWorkspaceFields() { workspaceNameWrap.classList.toggle('hidden', workspaceSelect.value !== '__new__'); }
function syncModeFields() {
  const isClient = projectMode.value === 'client';
  clientNameWrap.classList.toggle('hidden', !isClient);
  clientNameWrap.querySelector('input').required = isClient;
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
    document.querySelector('#raw-request-summary').textContent = `Raw request: ${snapshot.intake.raw_request}\nRequested solution: ${snapshot.intake.requested_solution ?? 'none recorded'}`;
    discoveryPanel.classList.remove('hidden');
    reviewPanel.classList.add('hidden');
    acceptedPanel.classList.add('hidden');
    discoveryPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    await analyzeCurrentIntake();
  } catch (error) { showError(error); }
});

async function analyzeCurrentIntake() {
  if (!snapshot) return;
  clearError();
  analysisSummary.textContent = 'Analyzing material unknowns and challenging the requested solution…';
  questionForm.classList.add('hidden');
  reviewPanel.classList.add('hidden');
  researchBlock.classList.add('hidden');
  try {
    snapshot = await api(`/api/phase31/intakes/${encodeURIComponent(snapshot.intake.id)}/analyze`, {
      method: 'POST', body: { workspaceId: snapshot.intake.workspace_id }
    });
    renderPhase31(snapshot);
  } catch (error) {
    analysisSummary.textContent = 'Adaptive analysis is blocked.';
    showError(error);
  }
}

questionForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!snapshot) return;
  clearError();
  const responses = [...document.querySelectorAll('.question')].map((question) => ({
    questionKey: question.dataset.questionKey,
    responseState: question.querySelector('.response-state').value,
    answerText: question.querySelector('.response-answer').value
  }));
  try {
    snapshot = await api(`/api/phase31/intakes/${encodeURIComponent(snapshot.intake.id)}/questions`, {
      method: 'PUT', body: { workspaceId: snapshot.intake.workspace_id, responses }
    });
    await analyzeCurrentIntake();
  } catch (error) { showError(error); }
});

reviewForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!snapshot) return;
  clearError();
  const recommendation = snapshot.phase31.strategyRecommendation;
  const chosenStrategy = document.querySelector('#review-strategy').value;
  const overrides = {
    problem: document.querySelector('#review-problem').value,
    desiredOutcome: document.querySelector('#review-outcome').value,
    primaryUsers: nullableValue(document.querySelector('#review-users').value),
    constraints: nullableValue(document.querySelector('#review-constraints').value),
    success: document.querySelector('#review-success').value,
    nonGoals: document.querySelector('#review-non-goals').value.split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
    strategy: chosenStrategy
  };
  if (chosenStrategy !== recommendation.strategy) overrides.strategyRationale = document.querySelector('#review-strategy-rationale').value;
  try {
    snapshot = await api(`/api/phase31/intakes/${encodeURIComponent(snapshot.intake.id)}/accept`, {
      method: 'POST',
      body: { workspaceId: snapshot.intake.workspace_id, expectedProjectVersion: snapshot.project.version, overrides }
    });
    const workspaceId = snapshot.intake.workspace_id;
    const projectId = snapshot.project.id;
    const graph = await api(`/api/projects/${encodeURIComponent(projectId)}/work-graph/initialize`, { method: 'POST', body: { workspaceId } });
    const pack = await api(`/api/projects/${encodeURIComponent(projectId)}/project-pack`, { method: 'POST', body: { workspaceId } });
    discoveryPanel.classList.add('hidden');
    reviewPanel.classList.add('hidden');
    acceptedPanel.classList.remove('hidden');
    const clientNote = snapshot.engagement ? ` Engagement remains ${snapshot.engagement.status}; internal acceptance did not fabricate client acceptance.` : '';
    document.querySelector('#accepted-summary').textContent = `${snapshot.project.title} is now ${snapshot.project.operational_status} in ${snapshot.project.lifecycle_phase}. Accepted strategy: ${strategyLabel(snapshot.acceptedBrief.delivery_strategy)}.${clientNote}`;
    document.querySelector('#bootstrap-summary').textContent = `${graph.nodes.length} initial Phase 1 WorkItems are still present for compatibility. Project Pack v${pack.version} generated. Phase 3.2 will replace universal graph generation with case-specific workforce/work-graph generation.`;
    bootstrap = await api('/api/workspaces');
    renderWorkspaceOptions();
    dashboardWorkspace.value = workspaceId;
    await refreshCommandCenter();
    acceptedPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) { showError(error); }
});

function renderPhase31(current) {
  document.querySelector('#intake-status').textContent = current.intake.status;
  const run = current.phase31.latestRun;
  const strategy = current.phase31.strategyRecommendation;
  const research = current.phase31.researchDecision;
  const challenge = current.phase31.findings.filter((item) => item.finding_type === 'challenge').map((item) => item.statement);
  analysisSummary.textContent = [
    `Analysis round: ${run?.round_number ?? '—'}`,
    `Requested solution preserved: ${current.intake.requested_solution ?? 'none recorded'}`,
    `Challenge: ${challenge.join(' | ') || 'none recorded'}`,
    `Research: ${research ? (research.research_required ? `required — ${research.rationale}` : `not required — ${research.rationale}`) : 'not evaluated'}`,
    `Recommended strategy: ${strategy ? strategyLabel(strategy.strategy) : 'none'}`,
    `Why: ${strategy?.rationale ?? '—'}`,
    `Alternatives: ${(strategy?.alternatives ?? []).map((item) => `${strategyLabel(item.strategy)} — ${item.reason}`).join(' | ') || 'none'}`
  ].join('\n');

  if (current.phase31.questions.length > 0) {
    renderQuestions(current.phase31.questions);
    questionForm.classList.remove('hidden');
    reviewPanel.classList.add('hidden');
    return;
  }
  questionForm.classList.add('hidden');

  if (research?.research_required === 1) {
    researchBlock.classList.remove('hidden');
    researchBlock.textContent = `Acceptance blocked: material external research is required before this Project Brief can be accepted. Topics: ${(research.topics ?? []).join(', ')}`;
    reviewPanel.classList.add('hidden');
    return;
  }
  researchBlock.classList.add('hidden');
  populateReview(current);
  reviewPanel.classList.remove('hidden');
  reviewPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderQuestions(questions) {
  questionsEl.replaceChildren();
  for (const question of questions) {
    const wrapper = document.createElement('fieldset');
    wrapper.className = 'question';
    wrapper.dataset.questionKey = question.question_key;
    wrapper.innerHTML = `
      <legend>${escapeHtml(question.prompt)}</legend>
      <p class="muted"><strong>Why this matters:</strong> ${escapeHtml(question.materiality_reason)}<br><strong>May change:</strong> ${escapeHtml(question.impactAreas.join(', '))}</p>
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

function populateReview(current) {
  const candidate = current.phase31.latestRun?.output?.brief ?? {};
  const strategy = current.phase31.strategyRecommendation;
  document.querySelector('#review-problem').value = candidate.problem ?? '';
  document.querySelector('#review-outcome').value = candidate.desired_outcome ?? '';
  document.querySelector('#review-users').value = candidate.primary_users ?? '';
  document.querySelector('#review-constraints').value = candidate.constraints ?? '';
  document.querySelector('#review-success').value = candidate.success ?? '';
  document.querySelector('#review-non-goals').value = (candidate.non_goals ?? []).join('\n');
  document.querySelector('#review-strategy').value = strategy.strategy;
  document.querySelector('#review-strategy-rationale').value = '';
  document.querySelector('#review-summary').textContent = `Model recommendation: ${strategyLabel(strategy.strategy)}\nEvidence refs: ${(strategy.evidenceRefs ?? []).join(', ')}\nRequested solution remains: ${current.intake.requested_solution ?? 'none recorded'}\nNothing becomes canonical until you accept this form.`;
}

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
    <div><p class="eyebrow">${escapeHtml(project.kind)}</p><h3>${escapeHtml(project.title)}</h3><p class="muted">${escapeHtml(project.phase)} · ${escapeHtml(project.status)} · ${escapeHtml(project.health)}</p></div>
    <div class="project-metrics"><span>${project.nextReadyCount} ready</span><span>${project.attentionCount} attention</span></div>
    <div class="button-row"><button class="secondary compact inspect-project" type="button">Inspect</button><button class="secondary compact run-next" type="button" ${project.nextReadyCount === 0 ? 'disabled' : ''}>Run next mock task</button></div>
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
    await api(`/api/assignments/${encodeURIComponent(assignmentId)}/evidence`, { method: 'POST', body: { workspaceId, projectId, level: 'L2', summary: 'Synthetic Phase 1 compatibility evidence produced by the local mock worker.' } });
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

async function api(url, options = {}) {
  const response = await fetch(url, {
    method: options.method ?? 'GET', cache: 'no-store',
    headers: options.body ? { 'content-type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? `Request failed: ${response.status}`);
  return body;
}

function strategyLabel(value) {
  const labels = { process_change: 'Process change', adopt_existing: 'Adopt an existing solution', configure: 'Configure an existing system', integrate: 'Integrate existing systems', automate: 'Automate a workflow', custom_build: 'Custom build', hybrid: 'Hybrid approach', research_pilot: 'Research or pilot first', defer: 'Decline or defer' };
  return labels[value] ?? value;
}
function nullableValue(value) { return typeof value === 'string' && value.trim() ? value.trim() : null; }
function showError(error) { errorEl.textContent = error instanceof Error ? error.message : String(error); }
function clearError() { errorEl.textContent = ''; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]); }
