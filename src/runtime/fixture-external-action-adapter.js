// @ts-check

export class FixtureExternalActionAdapter {
  constructor() {
    this.provider = 'fixture';
    this.version = 'phase-4.0-v1';
    this.state = new Map();
    this.nextMode = 'success';
  }

  setNextMode(mode) {
    if (!['success', 'fail', 'uncertain_applied', 'uncertain_not_applied', 'drift'].includes(mode)) throw new TypeError(`fixture_mode_invalid:${mode}`);
    this.nextMode = mode;
  }

  execute(plan) {
    const mode = this.nextMode;
    this.nextMode = 'success';
    const key = plan.idempotency_key;
    if (mode === 'fail') return { outcome: 'failed', errorClass: 'fixture_confirmed_failure', result: { applied: false } };
    if (mode === 'uncertain_not_applied') return { outcome: 'uncertain', errorClass: 'fixture_transport_unknown', result: { applied: 'unknown' } };
    if (mode === 'drift') {
      this.state.set(key, { planSha256: 'unexpected-drift', target: plan.target });
      return { outcome: 'uncertain', errorClass: 'fixture_transport_unknown', result: { applied: 'unknown' } };
    }
    this.state.set(key, { planSha256: plan.plan_sha256, target: plan.target });
    if (mode === 'uncertain_applied') return { outcome: 'uncertain', errorClass: 'fixture_transport_unknown', result: { applied: 'unknown' } };
    return { outcome: 'succeeded', result: { applied: true }, providerOperationRef: `fixture:operation:${key}`, providerResourceRef: `fixture:resource:${key}` };
  }

  reconcile(plan) {
    const row = this.state.get(plan.idempotency_key);
    if (!row) return { classification: 'not_applied', observedState: { exists: false } };
    if (row.planSha256 !== plan.plan_sha256) return { classification: 'drifted', observedState: { exists: true, planSha256: row.planSha256 } };
    return { classification: 'confirmed', observedState: { exists: true, planSha256: row.planSha256, target: row.target } };
  }
}
