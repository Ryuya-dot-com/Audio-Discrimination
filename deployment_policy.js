(function attachDeploymentPolicy(root) {
  'use strict';

  const CONFIG_SCHEMA_VERSION = 1;
  // Remote research links remain fail-closed until the participant runtime
  // verifies a configuration signed by an authenticated issuer.
  const SIGNED_PARTICIPANT_LINKS_SUPPORTED = false;
  const DEPLOYMENT_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_.-]{0,63}$/;
  const ENVIRONMENTS = Object.freeze(['preview', 'staging', 'production']);
  const EXACT_KEYS = Object.freeze([
    'schema_version',
    'deployment_id',
    'environment',
    'research_session_enabled',
    'researcher_ui_enabled',
    'researcher_origin',
    'participant_origin',
    'public_participant_base_url',
    'allowed_return_url_origins',
    'local_test_sessions_enabled'
  ]);

  function assertExactKeys(value) {
    const actual = Object.keys(value).sort();
    const expected = [...EXACT_KEYS].sort();
    if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
      throw new Error('Deployment configuration keys do not match schema 1.');
    }
  }

  function normalizeExactHttpsOrigin(value, label) {
    if (typeof value !== 'string' || !value) throw new Error(`${label} must be an HTTPS origin.`);
    const url = new URL(value);
    if (
      url.protocol !== 'https:' || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash || url.origin === 'null' ||
      value !== url.origin
    ) {
      throw new Error(`${label} must be an exact HTTPS origin without a trailing slash.`);
    }
    return url.origin;
  }

  function normalizeParticipantBaseUrl(value, participantOrigin) {
    if (typeof value !== 'string' || !value) {
      throw new Error('public_participant_base_url must be an absolute HTTPS URL.');
    }
    const url = new URL(value);
    if (
      url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
      url.origin !== participantOrigin || !url.pathname.endsWith('/') || url.toString() !== value
    ) {
      throw new Error('public_participant_base_url must be canonical, end in /, and use participant_origin.');
    }
    return url.toString();
  }

  function validateConfig(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('Deployment configuration must be a JSON object.');
    }
    assertExactKeys(value);
    if (value.schema_version !== CONFIG_SCHEMA_VERSION) {
      throw new Error('Unsupported deployment configuration schema.');
    }
    if (!DEPLOYMENT_ID_PATTERN.test(String(value.deployment_id || ''))) {
      throw new Error('deployment_id is invalid.');
    }
    if (!ENVIRONMENTS.includes(value.environment)) {
      throw new Error('environment is invalid.');
    }
    for (const key of ['research_session_enabled', 'researcher_ui_enabled', 'local_test_sessions_enabled']) {
      if (typeof value[key] !== 'boolean') throw new Error(`${key} must be a boolean.`);
    }
    if (value.environment === 'preview' && value.research_session_enabled) {
      throw new Error('A preview deployment cannot enable research sessions.');
    }
    const researcherOrigin = normalizeExactHttpsOrigin(value.researcher_origin, 'researcher_origin');
    const participantOrigin = normalizeExactHttpsOrigin(value.participant_origin, 'participant_origin');
    const publicParticipantBaseUrl = normalizeParticipantBaseUrl(
      value.public_participant_base_url,
      participantOrigin
    );
    if (!Array.isArray(value.allowed_return_url_origins)) {
      throw new Error('allowed_return_url_origins must be an array.');
    }
    const allowedReturnUrlOrigins = value.allowed_return_url_origins.map((origin, index) => (
      normalizeExactHttpsOrigin(origin, `allowed_return_url_origins[${index}]`)
    ));
    if (new Set(allowedReturnUrlOrigins).size !== allowedReturnUrlOrigins.length) {
      throw new Error('allowed_return_url_origins must not contain duplicates.');
    }
    return Object.freeze({
      schemaVersion: CONFIG_SCHEMA_VERSION,
      deploymentId: value.deployment_id,
      environment: value.environment,
      researchSessionEnabled: value.research_session_enabled,
      researcherUiEnabled: value.researcher_ui_enabled,
      researcherOrigin,
      participantOrigin,
      publicParticipantBaseUrl,
      allowedReturnUrlOrigins: Object.freeze(allowedReturnUrlOrigins),
      localTestSessionsEnabled: value.local_test_sessions_enabled
    });
  }

  function isLoopbackLocation(locationUrl) {
    const url = locationUrl instanceof URL ? locationUrl : new URL(locationUrl);
    return ['http:', 'https:'].includes(url.protocol) &&
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  }

  function contextFor(config, locationUrl) {
    const url = locationUrl instanceof URL ? locationUrl : new URL(locationUrl);
    const localTest = isLoopbackLocation(url) && config.localTestSessionsEnabled;
    const exactHttps = url.protocol === 'https:';
    const researchDeployment = ['production', 'staging'].includes(config.environment) &&
      config.researchSessionEnabled;
    const researcherOriginMatch = exactHttps && url.origin === config.researcherOrigin;
    const participantOriginMatch = exactHttps && url.origin === config.participantOrigin;
    const signedRemoteParticipantAllowed = researchDeployment &&
      SIGNED_PARTICIPANT_LINKS_SUPPORTED;
    return Object.freeze({
      localTest,
      sessionType: localTest ? 'test' : 'research',
      researcherUiAllowed: localTest || (
        config.researcherUiEnabled && researcherOriginMatch
      ),
      supervisedSessionAllowed: localTest || (
        researchDeployment && config.researcherUiEnabled && researcherOriginMatch
      ),
      participantLinkIssuanceAllowed: localTest || (
        signedRemoteParticipantAllowed && config.researcherUiEnabled && researcherOriginMatch
      ),
      participantSessionAllowed: localTest || (
        signedRemoteParticipantAllowed && participantOriginMatch
      ),
      deploymentPreviewOnly: !localTest && config.environment === 'preview',
      researcherOriginMatch,
      participantOriginMatch
    });
  }

  function participantBaseUrl(config, locationUrl) {
    const url = locationUrl instanceof URL ? new URL(locationUrl.toString()) : new URL(locationUrl);
    if (isLoopbackLocation(url) && config.localTestSessionsEnabled) {
      url.search = '';
      url.hash = '';
      const pathname = url.pathname.replace(/[^/]*$/, '');
      url.pathname = pathname || '/';
      return url.toString();
    }
    return config.publicParticipantBaseUrl;
  }

  function returnUrlOriginAllowed(config, value) {
    try {
      const url = value instanceof URL ? value : new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password &&
        config.allowedReturnUrlOrigins.includes(url.origin);
    } catch (error) {
      return false;
    }
  }

  const api = Object.freeze({
    CONFIG_SCHEMA_VERSION,
    SIGNED_PARTICIPANT_LINKS_SUPPORTED,
    validateConfig,
    isLoopbackLocation,
    contextFor,
    participantBaseUrl,
    returnUrlOriginAllowed
  });

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.DeploymentPolicy = api;
}(typeof globalThis !== 'undefined' ? globalThis : this));
