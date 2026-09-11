// @ts-check

/**
 * @param {unknown} value
 * @returns {asserts value is {service:string, phase:string, gate:string, database:{status:string,migrations:number}}}
 */
export function assertFoundationStatus(value) {
  if (!isRecord(value)) throw new TypeError('foundation status must be an object');
  assertNonEmptyString(value.service, 'service');
  assertNonEmptyString(value.phase, 'phase');
  assertNonEmptyString(value.gate, 'gate');
  if (!isRecord(value.database)) throw new TypeError('database must be an object');
  assertNonEmptyString(value.database.status, 'database.status');
  if (!Number.isInteger(value.database.migrations) || value.database.migrations < 0) {
    throw new TypeError('database.migrations must be a non-negative integer');
  }
}

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** @param {unknown} value @param {string} field */
function assertNonEmptyString(value, field) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${field} must be a non-empty string`);
  }
}
