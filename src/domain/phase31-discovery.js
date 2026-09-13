// @ts-check
import crypto from 'node:crypto';
import { CanonicalStore, DELIVERY_STRATEGIES } from './canonical-store.js';
import { executeProviderRoute } from '../runtime/provider-adapters.js';
import { MAX_DISCOVERY_ROUNDS, isRecord, parsePhase31Json, renderPhase31Prompt, requiredText, text, validatePhase31Analysis } from './phase31-contract.js';
import { Phase31FreeFirst } from './phase31-free-first.js';

export class Phase31Discovery {
  /** @param {import('node:sqlite').DatabaseSync} db @param {{executeRoute?:typeof executeProviderRoute}} [options] */
  constructor(db, options = {}) {
    this.db = db;
    this.store = new CanonicalStore(db);
    this.routes = new Phase31FreeFirst(db);
    this.executeRoute = options.executeRoute ?? executeProviderRoute;
  }

  getSnapshot({ workspaceId, intakeId }) {
    const base = this.store.getIntakeSnapshot({ workspaceId, intakeId });
    const runs = this.db.prepare('SELECT * FROM phase31_discovery_runs WHERE workspace_id=? AND intake_id=? ORDER BY round_number').all(workspaceId, intakeId);
    const latest = runs.at(-1) ?? null;
    const questions = latest ? this.db.prepare('SELECT * FROM phase31_discovery_questions WHERE workspace_id=? AND intake_id=? AND analysis_run_id=? ORDER BY created_at,id').all(workspaceId, intakeId, latest.id) : [];
    const findings = latest ? this.db.prepare('SELECT * FROM phase31_discovery_findings WHERE workspace_id=? AND intake_id=? AND analysis_run_id=? ORDER BY created_at,id').all(workspaceId, intakeId, latest.id) : [];
    const research = latest ? this.db.prepare('SELECT * FROM phase31_research_decisions WHERE workspace_id=? AND analysis_run_id=?').get(workspaceId, latest.id) ?? null : null;
    const strategy = latest ? this.db.prepare('SELECT * FROM phase31_strategy_recommendations WHERE workspace_id=? AND analysis_run_id=?').get(workspaceId, latest.id) ?? null : null;
    return { ...base, phase31: {
      runs,
      latestRun: latest ? { ...latest, output: json(latest.output_json, null), usage: json(latest.usage_json, {}) } : null,
      questions: questions.map((q) => ({ ...q, impactAreas: json(q.impact_areas_json, []) })),
      findings: findings.map((f) => ({ ...f, evidenceRefs: json(f.evidence_refs_json, []) })),
      researchDecision: research ? { ...research, topics: json(research.topics_json, []) } : null,
      strategyRecommendation: strategy ? { ...strategy, alternatives: json(strategy.alternatives_json, []), evidenceRefs: json(strategy.evidence_refs_json, []) } : null
    } };
  }

  async analyze({ workspaceId, intakeId }) {
    const current = this.getSnapshot({ workspaceId, intakeId });
    if (current.intake.status === 'accepted') throw new Error('intake_already_accepted');
    if (current.phase31.questions.some((q) => q.status === 'open')) throw new Error('phase31_previous_questions_unresolved');
    const round = current.phase31.runs.length + 1;
    if (round > MAX_DISCOVERY_ROUNDS) throw new Error('phase31_discovery_round_limit_reached');
    const selected = this.routes.select({ workspaceId });
    const input = this.#input(current, round);
    const prompt = renderPhase31Prompt(input);
    const id = crypto.randomUUID();
    this.db.prepare(`INSERT INTO phase31_discovery_runs (id,workspace_id,project_id,intake_id,round_number,route_id,status,input_sha256,created_at) VALUES (?,?,?,?,?,?,'running',?,?)`)
      .run(id, workspaceId, current.project.id, intakeId, round, selected.route.id, hash(prompt), now());
    this.#event(current.project.id, workspaceId, 'phase31.discovery.analysis_started', 'phase31_discovery_run', id, round, { routeId: selected.route.id, roundNumber: round });
    try {
      const result = await this.executeRoute({ route: selected.route, connection: selected.connection, prompt });
      const analysis = validatePhase31Analysis(parsePhase31Json(result.text), input);
      const output = JSON.stringify(analysis);
      this.#tx(() => {
        this.db.prepare("UPDATE phase31_discovery_runs SET status='succeeded',output_sha256=?,output_json=?,usage_json=?,external_ref=?,finished_at=? WHERE id=? AND workspace_id=?")
          .run(hash(output), output, JSON.stringify(result.usage ?? {}), result.externalRef ?? null, now(), id, workspaceId);
        this.#supersede(workspaceId, intakeId, id);
        this.#persist(workspaceId, current.project.id, intakeId, id, analysis);
        this.db.prepare('UPDATE project_intakes SET status=?,updated_at=? WHERE id=? AND workspace_id=?').run(analysis.questions.length ? 'discovery' : 'review', now(), intakeId, workspaceId);
        this.#event(current.project.id, workspaceId, 'phase31.discovery.analysis_succeeded', 'phase31_discovery_run', id, round, { questionCount: analysis.questions.length, researchRequired: analysis.research.required, strategy: analysis.strategy.strategy });
      });
      this.routes.account({ workspaceId, route: selected.route, result });
      return this.getSnapshot({ workspaceId, intakeId });
    } catch (error) {
      this.db.prepare("UPDATE phase31_discovery_runs SET status='failed',error_text=?,finished_at=? WHERE id=? AND workspace_id=?").run(limit(message(error), 1000), now(), id, workspaceId);
      this.#event(current.project.id, workspaceId, 'phase31.discovery.analysis_failed', 'phase31_discovery_run', id, round, {}, message(error));
      throw error;
    }
  }

  answerQuestions({ workspaceId, intakeId, responses }) {
    if (!Array.isArray(responses) || !responses.length) throw new TypeError('phase31_responses_required');
    const current = this.getSnapshot({ workspaceId, intakeId });
    const run = current.phase31.latestRun;
    if (!run || run.status !== 'succeeded') throw new Error('phase31_successful_analysis_required');
    const byKey = new Map(current.phase31.questions.map((q) => [q.question_key, q]));
    this.#tx(() => {
      for (const response of responses) {
        if (!isRecord(response)) throw new TypeError('phase31_response_object_required');
        const key = requiredText(response.questionKey, 'questionKey');
        const question = byKey.get(key);
        if (!question) throw new Error(`phase31_question_not_found:${key}`);
        if (question.status !== 'open') throw new Error(`phase31_question_not_open:${key}:${question.status}`);
        const state = requiredText(response.responseState, 'responseState');
        if (!['answered', 'unknown', 'skipped'].includes(state)) throw new TypeError(`phase31_invalid_response_state:${state}`);
        const answer = state === 'answered' ? requiredText(response.answerText, `${key}.answerText`) : null;
        this.db.prepare("UPDATE phase31_discovery_questions SET status=?,answer_text=?,answered_at=? WHERE id=? AND workspace_id=? AND status='open'").run(state, answer, now(), question.id, workspaceId);
        const statement = state === 'answered' ? answer : `${question.prompt} — ${state === 'unknown' ? 'operator does not know' : 'operator skipped'}`;
        this.db.prepare(`INSERT INTO phase31_discovery_findings (id,workspace_id,project_id,intake_id,analysis_run_id,finding_type,statement,canonical_status,source_ref,evidence_refs_json,created_at) VALUES (?,?,?,?,?,?,?,'accepted',?,?,?)`)
          .run(crypto.randomUUID(), workspaceId, current.project.id, intakeId, run.id, state === 'answered' ? 'operator_answer' : 'unknown', statement, `phase31_question:${question.id}`, JSON.stringify([`phase31_question:${question.id}`]), now());
      }
      this.#event(current.project.id, workspaceId, 'phase31.discovery.answers_recorded', 'project_intake', intakeId, run.round_number, { responseCount: responses.length }, null, 'operator');
    });
    return this.getSnapshot({ workspaceId, intakeId });
  }

  accept({ workspaceId, intakeId, expectedProjectVersion, overrides = {} }) {
    const current = this.getSnapshot({ workspaceId, intakeId });
    const run = current.phase31.latestRun;
    if (!run || run.status !== 'succeeded') throw new Error('phase31_successful_analysis_required');
    if (current.phase31.questions.length) throw new Error('phase31_reanalysis_required_after_questions');
    if (current.phase31.researchDecision?.research_required === 1) throw new Error('phase31_research_required_before_acceptance');
    const recommendation = current.phase31.strategyRecommendation;
    if (!recommendation || recommendation.status !== 'proposed') throw new Error('phase31_strategy_recommendation_required');
    const candidate = run.output?.brief;
    if (!candidate) throw new Error('phase31_brief_candidate_required');
    const brief = {
      problem: override(overrides, 'problem', candidate.problem), desiredOutcome: override(overrides, 'desiredOutcome', candidate.desired_outcome),
      primaryUsers: override(overrides, 'primaryUsers', candidate.primary_users), constraints: override(overrides, 'constraints', candidate.constraints),
      success: override(overrides, 'success', candidate.success), nonGoals: Array.isArray(overrides.nonGoals) ? overrides.nonGoals.filter((v) => text(v)) : candidate.non_goals
    };
    requiredText(brief.problem, 'problem'); requiredText(brief.desiredOutcome, 'desiredOutcome'); requiredText(brief.success, 'success');
    const chosen = text(overrides.strategy) ?? recommendation.strategy;
    if (!DELIVERY_STRATEGIES.includes(chosen)) throw new TypeError(`phase31_invalid_strategy:${chosen}`);
    const changed = chosen !== recommendation.strategy;
    const rationale = changed ? requiredText(overrides.strategyRationale, 'strategyRationale') : (text(overrides.strategyRationale) ?? recommendation.rationale);
    this.store.saveDiscoveryResponses({ workspaceId, intakeId, responses: [answered('problem', brief.problem), answered('desired_outcome', brief.desiredOutcome), legacy('primary_users', brief.primaryUsers), legacy('constraints', brief.constraints), answered('success', brief.success)] });
    this.store.setWorkingDeliveryStrategy({ workspaceId, intakeId, strategy: chosen, rationale });
    let accepted = this.store.acceptProjectIntake({ workspaceId, intakeId, expectedProjectVersion });
    this.#tx(() => {
      const time = now();
      this.db.prepare("UPDATE phase31_strategy_recommendations SET status=?,resolved_at=? WHERE id=? AND workspace_id=?").run(changed ? 'rejected' : 'accepted', time, recommendation.id, workspaceId);
      if (current.phase31.researchDecision) this.db.prepare("UPDATE phase31_research_decisions SET status='accepted',resolved_at=? WHERE id=? AND workspace_id=?").run(time, current.phase31.researchDecision.id, workspaceId);
      const scope = json(accepted.acceptedBrief.working_scope_json, {});
      scope.nonGoals = brief.nonGoals; scope.phase31AnalysisRunId = run.id; scope.phase31StrategyRecommendationId = recommendation.id;
      this.db.prepare('UPDATE project_briefs SET working_scope_json=? WHERE id=? AND workspace_id=?').run(JSON.stringify(scope), accepted.acceptedBrief.id, workspaceId);
      this.#event(accepted.project.id, workspaceId, 'phase31.discovery.accepted', 'project_brief', accepted.acceptedBrief.id, accepted.acceptedBrief.version, { analysisRunId: run.id, strategyRecommendationId: recommendation.id, recommendedStrategy: recommendation.strategy, acceptedStrategy: chosen, recommendationAccepted: !changed }, null, 'operator');
    });
    return this.getSnapshot({ workspaceId, intakeId });
  }

  #input(current, round) {
    const history = this.db.prepare(`SELECT q.question_key,q.prompt,q.status,q.answer_text,q.materiality_reason,q.impact_areas_json,r.round_number FROM phase31_discovery_questions q JOIN phase31_discovery_runs r ON r.id=q.analysis_run_id WHERE q.workspace_id=? AND q.intake_id=? AND q.status IN ('answered','unknown','skipped') ORDER BY r.round_number,q.created_at`).all(current.intake.workspace_id, current.intake.id)
      .map((row) => ({ ...row, impactAreas: json(row.impact_areas_json, []) }));
    return { phase: '3.1', round, maxRounds: MAX_DISCOVERY_ROUNDS, rawRequest: current.intake.raw_request, requestedSolution: current.intake.requested_solution, mode: current.intake.input_class, projectTitle: current.project.title, previousAnswers: history };
  }

  #persist(workspaceId, projectId, intakeId, runId, analysis) {
    const time = now();
    for (const f of analysis.findings) this.db.prepare(`INSERT INTO phase31_discovery_findings (id,workspace_id,project_id,intake_id,analysis_run_id,finding_type,statement,canonical_status,source_ref,evidence_refs_json,created_at) VALUES (?,?,?,?,?,?,?,'proposed',?,?,?)`).run(crypto.randomUUID(), workspaceId, projectId, intakeId, runId, f.type, f.statement, f.source_ref ?? 'model_analysis', JSON.stringify(f.evidence_refs), time);
    for (const q of analysis.questions) this.db.prepare(`INSERT INTO phase31_discovery_questions (id,workspace_id,project_id,intake_id,analysis_run_id,question_key,prompt,materiality_reason,impact_areas_json,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,'open',?)`).run(crypto.randomUUID(), workspaceId, projectId, intakeId, runId, q.key, q.prompt, q.materiality_reason, JSON.stringify(q.impact_areas), time);
    this.db.prepare(`INSERT INTO phase31_research_decisions (id,workspace_id,project_id,intake_id,analysis_run_id,research_required,rationale,topics_json,status,created_at) VALUES (?,?,?,?,?,?,?,?, 'proposed',?)`).run(crypto.randomUUID(), workspaceId, projectId, intakeId, runId, analysis.research.required ? 1 : 0, analysis.research.rationale, JSON.stringify(analysis.research.topics), time);
    this.db.prepare(`INSERT INTO phase31_strategy_recommendations (id,workspace_id,project_id,intake_id,analysis_run_id,strategy,rationale,alternatives_json,evidence_refs_json,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,'proposed',?)`).run(crypto.randomUUID(), workspaceId, projectId, intakeId, runId, analysis.strategy.strategy, analysis.strategy.rationale, JSON.stringify(analysis.strategy.alternatives), JSON.stringify(analysis.strategy.evidence_refs), time);
  }

  #supersede(workspaceId, intakeId, currentRun) {
    this.db.prepare("UPDATE phase31_discovery_questions SET status='superseded' WHERE workspace_id=? AND intake_id=? AND analysis_run_id<>? AND status='open'").run(workspaceId, intakeId, currentRun);
    this.db.prepare("UPDATE phase31_discovery_findings SET canonical_status='superseded' WHERE workspace_id=? AND intake_id=? AND analysis_run_id<>? AND canonical_status='proposed'").run(workspaceId, intakeId, currentRun);
    this.db.prepare("UPDATE phase31_research_decisions SET status='superseded' WHERE workspace_id=? AND intake_id=? AND analysis_run_id<>? AND status='proposed'").run(workspaceId, intakeId, currentRun);
    this.db.prepare("UPDATE phase31_strategy_recommendations SET status='superseded' WHERE workspace_id=? AND intake_id=? AND analysis_run_id<>? AND status='proposed'").run(workspaceId, intakeId, currentRun);
  }

  #event(projectId, workspaceId, eventType, entityType, entityId, entityVersion, payload = {}, reason = null, actorType = 'system') {
    this.store.recordEvent({ workspaceId, projectId, eventType, actorType, entityType, entityId, entityVersion, payload, reason });
  }
  #tx(fn) { this.db.exec('BEGIN IMMEDIATE'); try { const out = fn(); this.db.exec('COMMIT'); return out; } catch (e) { this.db.exec('ROLLBACK'); throw e; } }
}

function answered(questionKey, answerText) { return { questionKey, responseState: 'answered', answerText }; }
function legacy(questionKey, value) { return text(value) ? answered(questionKey, value) : { questionKey, responseState: 'unknown' }; }
function override(values, key, fallback) { if (values?.[key] === undefined) return fallback; if (values[key] === null || values[key] === '') return null; return requiredText(values[key], key); }
function json(value, fallback) { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function now() { return new Date().toISOString(); }
function hash(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
function message(error) { return error instanceof Error ? error.message : String(error); }
function limit(value, size) { return value.length <= size ? value : `${value.slice(0, size)}…`; }
