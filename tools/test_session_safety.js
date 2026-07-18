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

for (const dangerous of [
  '=HYPERLINK("https://example.org")',
  '  +SUM(1,2)',
  '\t-CMD',
  '\r\n@SUM(1,2)'
]) {
  assert.equal(safety.csvSafeString(dangerous), `'${dangerous}`);
}
assert.equal(safety.csvSafeString('ordinary text'), 'ordinary text');

const escapedCells = new Map([
  ['ordinary text', 'ordinary text'],
  ['value,with,commas', '"value,with,commas"'],
  ['value "with" quotes', '"value ""with"" quotes"'],
  ['line one\rline two', '"line one\rline two"'],
  ['line one\nline two', '"line one\nline two"'],
  ['  +SUM(1,2)', '"\'  +SUM(1,2)"'],
  [42, '42'],
  [null, ''],
  [undefined, '']
]);
function parseSingleCsvCell(serialized) {
  if (!serialized.startsWith('"')) return serialized;
  assert.equal(serialized.endsWith('"'), true);
  return serialized.slice(1, -1).replace(/""/g, '"');
}
for (const [input, expected] of escapedCells) {
  const escaped = safety.csvEscapeCell(input);
  assert.equal(escaped, expected);
  const normalized = input === null || input === undefined
    ? ''
    : typeof input === 'string' ? safety.csvSafeString(input) : String(input);
  assert.equal(parseSingleCsvCell(escaped), normalized);
}

console.log('Session safety unit tests passed.');
