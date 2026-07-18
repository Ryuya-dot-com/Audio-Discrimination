'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const DeploymentPolicy = require(path.join(__dirname, '..', 'deployment_policy.js'));

function config(overrides = {}) {
  return DeploymentPolicy.validateConfig({
    schema_version: 1,
    deployment_id: 'study-production',
    environment: 'production',
    research_session_enabled: true,
    researcher_ui_enabled: true,
    researcher_origin: 'https://research.example.edu',
    participant_origin: 'https://listen.example.edu',
    public_participant_base_url: 'https://listen.example.edu/battery/',
    allowed_return_url_origins: ['https://return.example.edu'],
    local_test_sessions_enabled: true,
    ...overrides
  });
}

const production = config();
const researcher = DeploymentPolicy.contextFor(production, 'https://research.example.edu/battery/');
assert.equal(researcher.researcherUiAllowed, true);
assert.equal(researcher.supervisedSessionAllowed, true);
assert.equal(researcher.participantLinkIssuanceAllowed, false);
assert.equal(researcher.participantSessionAllowed, false);

const participant = DeploymentPolicy.contextFor(production, 'https://listen.example.edu/battery/');
assert.equal(participant.researcherUiAllowed, false);
assert.equal(participant.supervisedSessionAllowed, false);
assert.equal(participant.participantLinkIssuanceAllowed, false);
assert.equal(participant.participantSessionAllowed, false);
assert.equal(DeploymentPolicy.SIGNED_PARTICIPANT_LINKS_SUPPORTED, false);

const arbitrary = DeploymentPolicy.contextFor(production, 'https://preview.example.net/battery/');
assert.equal(arbitrary.researcherUiAllowed, false);
assert.equal(arbitrary.supervisedSessionAllowed, false);
assert.equal(arbitrary.participantSessionAllowed, false);

const local = DeploymentPolicy.contextFor(production, 'http://127.0.0.1:8765/index.html');
assert.equal(local.sessionType, 'test');
assert.equal(local.researcherUiAllowed, true);
assert.equal(local.supervisedSessionAllowed, true);
assert.equal(local.participantLinkIssuanceAllowed, true);
assert.equal(local.participantSessionAllowed, true);
assert.equal(
  DeploymentPolicy.participantBaseUrl(production, 'http://127.0.0.1:8765/index.html?lang=ja'),
  'http://127.0.0.1:8765/'
);

const noLocal = config({ local_test_sessions_enabled: false });
assert.equal(
  DeploymentPolicy.contextFor(noLocal, 'http://localhost:8765/').supervisedSessionAllowed,
  false
);

assert.equal(
  DeploymentPolicy.participantBaseUrl(production, 'https://research.example.edu/battery/'),
  'https://listen.example.edu/battery/'
);
assert.equal(DeploymentPolicy.returnUrlOriginAllowed(production, 'https://return.example.edu/upload'), true);
assert.equal(DeploymentPolicy.returnUrlOriginAllowed(production, 'https://evil.example/upload'), false);
assert.equal(DeploymentPolicy.returnUrlOriginAllowed(production, 'https://return.example.edu.evil.test/'), false);

assert.throws(
  () => config({ environment: 'preview', research_session_enabled: true }),
  /preview deployment cannot enable research sessions/
);
assert.throws(
  () => config({ researcher_origin: 'https://research.example.edu/path' }),
  /exact HTTPS origin/
);
assert.throws(
  () => config({ public_participant_base_url: 'https://research.example.edu/battery/' }),
  /use participant_origin/
);
assert.throws(
  () => DeploymentPolicy.validateConfig({ ...JSON.parse(JSON.stringify({
    schema_version: 1,
    deployment_id: 'study-production',
    environment: 'production',
    research_session_enabled: true,
    researcher_ui_enabled: true,
    researcher_origin: 'https://research.example.edu',
    participant_origin: 'https://listen.example.edu',
    public_participant_base_url: 'https://listen.example.edu/battery/',
    allowed_return_url_origins: [],
    local_test_sessions_enabled: true
  })), unexpected: true }),
  /keys do not match/
);

console.log('Deployment policy verification passed.');
