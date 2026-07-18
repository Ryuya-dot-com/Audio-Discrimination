(function attachSessionSafety(root) {
  'use strict';

  function deletionBarrierBlocks(sessionStartedAt, barrierValue) {
    const startedAtMs = Date.parse(String(sessionStartedAt || ''));
    const barrier = Number(barrierValue || 0);
    return Number.isFinite(startedAtMs) && Number.isFinite(barrier) && barrier > 0 && startedAtMs <= barrier;
  }

  function checkpointWriteAllowed(existing, context) {
    if (!existing) return true;
    if (!context || !context.sessionRunId || !context.owner) return false;
    if (existing.session_run_id !== context.sessionRunId) return false;

    const existingRevision = Number(existing.revision || 0);
    if (existing.owner === context.owner) {
      return existingRevision === Number(context.revision || 0);
    }

    const takeover = context.takeover;
    return Boolean(
      takeover &&
      takeover.sessionRunId === existing.session_run_id &&
      takeover.owner === existing.owner &&
      takeover.revision === existingRevision
    );
  }

  function checkpointDeleteAllowed(existing, expectedSessionRunId) {
    if (!existing) return true;
    return Boolean(
      expectedSessionRunId &&
      existing.session_run_id === expectedSessionRunId
    );
  }

  function csvSafeString(value) {
    let text = String(value);
    if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
    return text;
  }

  function csvEscapeCell(value) {
    if (value === undefined || value === null) return '';
    const text = typeof value === 'string' ? csvSafeString(value) : String(value);
    if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  }

  const api = Object.freeze({
    checkpointDeleteAllowed,
    checkpointWriteAllowed,
    csvEscapeCell,
    csvSafeString,
    deletionBarrierBlocks
  });

  if (typeof module === 'object' && module.exports) module.exports = api;
  root.SessionSafety = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
