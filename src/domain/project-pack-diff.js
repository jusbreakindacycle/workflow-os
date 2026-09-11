// @ts-check

/**
 * Compare two persisted Project Pack versions without turning the diff into canonical state.
 * @param {import('node:sqlite').DatabaseSync} db
 * @param {{workspaceId:string, projectId:string, fromVersion:number, toVersion:number}} input
 */
export function diffProjectPackVersions(db, { workspaceId, projectId, fromVersion, toVersion }) {
  const from = load(db, workspaceId, projectId, fromVersion);
  const to = load(db, workspaceId, projectId, toVersion);
  const changes = [];
  walk('$', parse(from.content_json), parse(to.content_json), changes);
  return {
    workspaceId,
    projectId,
    from: { id: from.id, version: from.version, briefVersion: from.brief_version, sha256: from.content_sha256 },
    to: { id: to.id, version: to.version, briefVersion: to.brief_version, sha256: to.content_sha256 },
    changed: changes.length > 0,
    changes
  };
}

function load(db, workspaceId, projectId, version) {
  if (!Number.isInteger(version) || version < 1) throw new TypeError('project_pack_version_must_be_positive_integer');
  const row = db.prepare('SELECT * FROM project_pack_versions WHERE workspace_id = ? AND project_id = ? AND version = ?').get(workspaceId, projectId, version);
  if (!row) throw new Error(`project_pack_version_not_found:${projectId}:${version}`);
  if (!row.content_json) throw new Error(`project_pack_content_missing:${projectId}:${version}`);
  return row;
}

function parse(text) {
  try { return JSON.parse(text); }
  catch { throw new Error('project_pack_content_invalid_json'); }
}

function walk(path, before, after, changes) {
  if (Object.is(before, after)) return;
  if (Array.isArray(before) || Array.isArray(after)) {
    if (JSON.stringify(before) !== JSON.stringify(after)) changes.push({ path, before, after });
    return;
  }
  const beforeObject = isObject(before);
  const afterObject = isObject(after);
  if (beforeObject && afterObject) {
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
    for (const key of keys) walk(`${path}.${key}`, before[key], after[key], changes);
    return;
  }
  changes.push({ path, before, after });
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
