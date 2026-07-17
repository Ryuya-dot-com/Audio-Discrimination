'use strict';

const assert = require('node:assert/strict');
const safety = require('../session_safety.js');

const existing = { session_run_id: 'run-1', owner: 'owner-a', revision: 7 };

assert.equal(safety.checkpointWriteAllowed(null, {
  sessionRunId: 'run-1', owner: 'owner-a', revision: 0
}), true);
assert.equal(safety.checkpointWriteAllowed(existing, {
  sessionRunId: 'run-1', owner: 'owner-a', revision: 7
}), true);
assert.equal(safety.checkpointWriteAllowed(existing, {
  sessionRunId: 'run-1', owner: 'owner-a', revision: 6
}), false);
assert.equal(safety.checkpointWriteAllowed(existing, {
  sessionRunId: 'run-1', owner: 'owner-b', revision: 7
}), false);
assert.equal(safety.checkpointWriteAllowed(existing, {
  sessionRunId: 'run-1',
  owner: 'owner-b',
  revision: 7,
  takeover: { sessionRunId: 'run-1', owner: 'owner-a', revision: 7 }
}), true);
assert.equal(safety.checkpointWriteAllowed(existing, {
  sessionRunId: 'run-1',
  owner: 'owner-b',
  revision: 7,
  takeover: { sessionRunId: 'run-1', owner: 'owner-a', revision: 6 }
}), false);
assert.equal(safety.checkpointWriteAllowed(existing, {
  sessionRunId: 'run-2', owner: 'owner-b', revision: 7
}), false);

assert.equal(safety.checkpointDeleteAllowed(null, ''), true);
assert.equal(safety.checkpointDeleteAllowed(existing, 'run-1'), true);
assert.equal(safety.checkpointDeleteAllowed(existing, ''), false);
assert.equal(safety.checkpointDeleteAllowed(existing, 'run-2'), false);

assert.equal(safety.deletionBarrierBlocks('2026-07-18T00:00:00.000Z', Date.parse('2026-07-18T00:00:00.000Z')), true);
assert.equal(safety.deletionBarrierBlocks('2026-07-18T00:00:00.001Z', Date.parse('2026-07-18T00:00:00.000Z')), false);
assert.equal(safety.csvSafeString('=HYPERLINK("https://example.org")').startsWith("'="), true);
assert.equal(safety.csvSafeString('\t@SUM(1,2)').startsWith("'\t@"), true);
assert.equal(safety.csvSafeString('ordinary text'), 'ordinary text');

console.log('Session safety unit tests passed.');
