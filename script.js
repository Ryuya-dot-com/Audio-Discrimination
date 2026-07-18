const TASKS = [
  {
    id: 'duration',
    label: 'Duration discrimination',
    displayLabel: 'Listening Task 3',
    folder: 'duration_discrimination',
    csvName: 'duration_discrimination',
    displayLabelKey: 'task3Label',
    displayDetailKey: 'task3Detail',
    levelSize: 2.5,
    thresholdUnit: 'ms',
    thresholdMeasure: 'duration difference',
    thresholdMeasureKey: 'durationDifference'
  },
  {
    id: 'formant',
    label: 'Formant discrimination',
    displayLabel: 'Listening Task 2',
    folder: 'formant_discrimination',
    csvName: 'formant_discrimination',
    displayLabelKey: 'task2Label',
    displayDetailKey: 'task2Detail',
    levelSize: 2,
    thresholdUnit: 'Hz',
    thresholdMeasure: 'F2 difference',
    thresholdMeasureKey: 'f2Difference'
  },
  {
    id: 'pitch',
    label: 'Pitch discrimination',
    displayLabel: 'Listening Task 1',
    folder: 'pitch_discrimination',
    csvName: 'pitch_discrimination',
    displayLabelKey: 'task1Label',
    displayDetailKey: 'task1Detail',
    levelSize: 0.3,
    thresholdUnit: 'Hz',
    thresholdMeasure: 'F0 difference',
    thresholdMeasureKey: 'f0Difference'
  },
  {
    id: 'risetime',
    label: 'Rise time discrimination',
    displayLabel: 'Listening Task 4',
    folder: 'risetime_discrimination',
    csvName: 'risetime_discrimination',
    displayLabelKey: 'task4Label',
    displayDetailKey: 'task4Detail',
    levelSize: 2.85,
    thresholdUnit: 'ms',
    thresholdMeasure: 'rise-time difference',
    thresholdMeasureKey: 'riseTimeDifference'
  }
];

const BASE_CONFIG = {
  startingStep: 51, // file 51 corresponds to published Level 50
  numSteps: 101,
  interStimulusDelay: 500,
  postSequenceDelay: 500,
  postResponseDelay: 1000
};

const IMPLEMENTATION = Object.freeze({
  batteryVersion: '5.3.0',
  trialSchemaVersion: 11,
  wideSchemaVersion: 9,
  checkpointSchemaVersion: 3,
  resultBundleSchemaVersion: 3,
  appBuildId: 'audio-discrimination-5.3.0',
  procedureScope: 'study_profile_binds_adaptive_procedure_scoring_and_stimulus_set',
  taskOrderMethod: 'subject_id_seeded_shuffle',
  reversalDefinition: 'intended_nonzero_staircase_direction_change',
  stimulusErrorPolicy: 'fatal_no_substitution'
});

const PARTICIPANT_LINK = Object.freeze({
  mode: 'participant',
  schemaVersion: '3',
  feedbackModes: Object.freeze(['practice_only', 'detailed']),
  parameterNames: Object.freeze([
    'mode',
    'link_version',
    'battery_version',
    'deployment_id',
    'deployment_config_sha256',
    'session_type',
    'protocol',
    'protocol_version',
    'catalog_sha256',
    'stimulus_set',
    'manifest_sha256',
    'tasks',
    'feedback',
    'lang',
    'study_id',
    'condition_id',
    'site_id',
    'distribution_id',
    'study_title',
    'institution',
    'consent_version',
    'expected_minutes',
    'consent_url',
    'contact_url',
    'return_url'
  ])
});

const PARTICIPANT_CODE_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,31}$/;
const STUDY_CODE_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
const VERSION_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
const SUPPORTED_LANGUAGES = Object.freeze(['en', 'ja']);
const CHECKPOINT_KEY_PREFIX = 'audio-discrimination-checkpoint-v2:';
const MAX_STUDY_URL_LENGTH = 1024;
const MAX_PARTICIPANT_LINK_LENGTH = 4096;
const DISPLAY_CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/;
const DEPLOYMENT_CONFIG_FILE = 'deployment-config.json';
const APP_BUILD_ASSETS = Object.freeze([
  DEPLOYMENT_CONFIG_FILE,
  'deployment_policy.js',
  'index.html',
  'result_bundle.js',
  'session_safety.js',
  'script.js'
]);

const STIMULUS_CATALOG = Object.freeze({
  schemaVersion: 1,
  file: 'STIMULUS_CATALOG.json',
  sha256: '6d39d80db95f4402137313aeec096d1837bf8f0fe3a3c4f25cb7b511933ce59d',
  auditDate: '2026-07-17',
  bindings: Object.freeze({
    kachlicka2019: 'kachlicka2019-reconstruction-v1',
    saitoTierney2024: 'saito-tierney2024-reconstruction-v1',
    sun2021: 'sun2021-reconstruction-v1'
  })
});

const STIMULUS_SETS = Object.freeze({
  'kachlicka2019-reconstruction-v1': {
    id: 'kachlicka2019-reconstruction-v1',
    version: 1,
    kind: 'transformed_official_distribution',
    claim: 'reported_parameter_reconstruction_not_original_study_files',
    root: 'stimulus_sets/kachlicka2019-reconstruction-v1',
    manifest: 'stimulus_sets/kachlicka2019-reconstruction-v1/STIMULUS_MANIFEST.json',
    manifestSha256: '2397a7c6a737d723e1e7260377e49ba3dcbc316b4483093ff7ec9c6b213e9426',
    aggregateSha256: 'ec00a36f74a48ac6e6edcfc77db9817e6cbe34d300c0f62617129d3d43d919c8',
    auditDate: '2026-07-17',
    validationStatus: 'passed',
    targetProtocolId: 'kachlicka2019',
    targetCitation: 'Kachlicka, Saito, & Tierney (2019)',
    targetSourceLocator: 'Brain and Language, 192, p. 17, section 2.2.2',
    parameterProfileId: 'kachlicka2019',
    parentStimulusSetId: 'saito-tierney-offline-osf-6p8hv-e8ebb0a5',
    parentManifest: 'STIMULUS_MANIFEST.json',
    parentAggregateSha256: 'e8ebb0a5c1a52f5fd2a8be9c8755c33865611c601bdb20c3e7af90a5e589c118',
    parentSourceLocator: 'https://osf.io/bkj6v/',
    parentSourceArchiveSha256: '70dc8bea86020110f81c2932d5eb05f06f2aaa6f2de3469663e501fbacd96bdb',
    generatorApplication: 'Praat',
    generatorVersion: '6.4.19',
    generatorScript: 'tools/reconstruct_stimuli.praat',
    generatorScriptSha256: 'cdd146dc820435fb7769a102d9042701d99115c0744d157f72cd788dee5d9cb4',
    parametersFile: 'PARAMETERS.json',
    parametersSha256: 'aa53c437761709ec41139afc8fa42acd81f0b0b5edd2600b89610075d6aa05b1',
    license: '',
    licenseNote: 'The parent OSF project does not declare a license. Generation and local research use do not establish permission to redistribute this derivative.',
    tasks: {
      pitch: {
        folder: 'pitch_discrimination',
        fileCount: 101,
        taskSha256: '4e9f67110108717d0f0df438da424e9e5e4c179c8b584812b5a385134fbcb3b4',
        transformation: 'replace_50ms_linear_envelope_with_15ms'
      },
      formant: {
        folder: 'formant_discrimination',
        fileCount: 101,
        taskSha256: '650433d17e9919d49c47bacdd94205bdb081ff726197ec60a8536f8392639a79',
        transformation: 'tile_steady_100hz_cycle_then_apply_15ms_linear_envelope'
      },
      duration: {
        folder: 'duration_discrimination',
        fileCount: 101,
        taskSha256: '83e3f0ad2174cc6e16330518e6f7239bfeea86188a46185705138ca7caaf2c94',
        transformation: 'replace_50ms_linear_envelope_with_15ms'
      },
      risetime: {
        folder: 'risetime_discrimination',
        fileCount: 101,
        taskSha256: '6e451686bc03e951ab1a21cd685355810be0418832aa7d33ba2d34fb0b53eda7',
        transformation: 'identity_pcm_reencode'
      }
    }
  },
  'saito-tierney2024-reconstruction-v1': {
    id: 'saito-tierney2024-reconstruction-v1',
    version: 1,
    kind: 'transformed_official_distribution',
    claim: 'reported_parameter_reconstruction_not_original_study_files',
    root: 'stimulus_sets/saito-tierney2024-reconstruction-v1',
    manifest: 'stimulus_sets/saito-tierney2024-reconstruction-v1/STIMULUS_MANIFEST.json',
    manifestSha256: '79a74c43a6ef9804b666d27f454553d558c1adb35ebc9aeb05ed12c8e0993c3e',
    aggregateSha256: 'a09c4360ebb6e68488c431a9366c3bca0ce6b1e23483927aeb55d6e0522031b1',
    auditDate: '2026-07-17',
    validationStatus: 'passed',
    targetProtocolId: 'saitoTierney2024',
    targetCitation: 'Saito & Tierney (2024; online 2022)',
    targetSourceLocator: 'Studies in Second Language Acquisition, 46, pp. 1213–1215',
    parameterProfileId: 'saito_tierney2024',
    parentStimulusSetId: 'saito-tierney-offline-osf-6p8hv-e8ebb0a5',
    parentManifest: 'STIMULUS_MANIFEST.json',
    parentAggregateSha256: 'e8ebb0a5c1a52f5fd2a8be9c8755c33865611c601bdb20c3e7af90a5e589c118',
    parentSourceLocator: 'https://osf.io/bkj6v/',
    parentSourceArchiveSha256: '70dc8bea86020110f81c2932d5eb05f06f2aaa6f2de3469663e501fbacd96bdb',
    generatorApplication: 'Praat',
    generatorVersion: '6.4.19',
    generatorScript: 'tools/reconstruct_stimuli.praat',
    generatorScriptSha256: 'cdd146dc820435fb7769a102d9042701d99115c0744d157f72cd788dee5d9cb4',
    parametersFile: 'PARAMETERS.json',
    parametersSha256: '26a88845dd1d7607c1bf6a8a487cdbf7609433754f927e3a3b36b9a09fb16245',
    license: '',
    licenseNote: 'The parent OSF project does not declare a license. Generation and local research use do not establish permission to redistribute this derivative.',
    tasks: {
      pitch: {
        folder: 'pitch_discrimination',
        fileCount: 101,
        taskSha256: '26e60076ed0da80d4a327bedfd88dce55ff7f6c7031e6bcb87972f20138f90bf',
        transformation: 'crop_to_250ms_and_place_source_50ms_offset_at_new_endpoint'
      },
      formant: {
        folder: 'formant_discrimination',
        fileCount: 101,
        taskSha256: '650433d17e9919d49c47bacdd94205bdb081ff726197ec60a8536f8392639a79',
        transformation: 'tile_steady_100hz_cycle_then_apply_15ms_linear_envelope'
      },
      duration: {
        folder: 'duration_discrimination',
        fileCount: 101,
        taskSha256: 'c785683a4da9cda0e43643dac68825809c892c6f1481a1caf5e654d19d6d1975',
        transformation: 'identity_pcm_reencode'
      }
    }
  },
  'sun2021-reconstruction-v1': {
    id: 'sun2021-reconstruction-v1',
    version: 1,
    kind: 'transformed_official_distribution',
    claim: 'reported_parameter_reconstruction_not_original_study_files',
    root: 'stimulus_sets/sun2021-reconstruction-v1',
    manifest: 'stimulus_sets/sun2021-reconstruction-v1/STIMULUS_MANIFEST.json',
    manifestSha256: 'bf8662c1402de28889bc1cfc951aa0a42d998c6118a3344aa35e5e06055b009a',
    aggregateSha256: 'ec00a36f74a48ac6e6edcfc77db9817e6cbe34d300c0f62617129d3d43d919c8',
    auditDate: '2026-07-17',
    validationStatus: 'passed',
    targetProtocolId: 'sun2021',
    targetCitation: 'Sun, Saito, & Tierney (2021)',
    targetSourceLocator: 'Studies in Second Language Acquisition, 43, pp. 558–559',
    parameterProfileId: 'sun2021',
    parentStimulusSetId: 'saito-tierney-offline-osf-6p8hv-e8ebb0a5',
    parentManifest: 'STIMULUS_MANIFEST.json',
    parentAggregateSha256: 'e8ebb0a5c1a52f5fd2a8be9c8755c33865611c601bdb20c3e7af90a5e589c118',
    parentSourceLocator: 'https://osf.io/bkj6v/',
    parentSourceArchiveSha256: '70dc8bea86020110f81c2932d5eb05f06f2aaa6f2de3469663e501fbacd96bdb',
    generatorApplication: 'Praat',
    generatorVersion: '6.4.19',
    generatorScript: 'tools/reconstruct_stimuli.praat',
    generatorScriptSha256: 'cdd146dc820435fb7769a102d9042701d99115c0744d157f72cd788dee5d9cb4',
    parametersFile: 'PARAMETERS.json',
    parametersSha256: 'a34ae2c8cd1a7d393a1eef7f3f964da02ae2e0e7cb644881f7cacddf3b6c128a',
    license: '',
    licenseNote: 'The parent OSF project does not declare a license. Generation and local research use do not establish permission to redistribute this derivative.',
    tasks: {
      pitch: {
        folder: 'pitch_discrimination',
        fileCount: 101,
        taskSha256: '4e9f67110108717d0f0df438da424e9e5e4c179c8b584812b5a385134fbcb3b4',
        transformation: 'replace_50ms_linear_envelope_with_15ms'
      },
      formant: {
        folder: 'formant_discrimination',
        fileCount: 101,
        taskSha256: '650433d17e9919d49c47bacdd94205bdb081ff726197ec60a8536f8392639a79',
        transformation: 'tile_steady_100hz_cycle_then_apply_15ms_linear_envelope'
      },
      duration: {
        folder: 'duration_discrimination',
        fileCount: 101,
        taskSha256: '83e3f0ad2174cc6e16330518e6f7239bfeea86188a46185705138ca7caaf2c94',
        transformation: 'replace_50ms_linear_envelope_with_15ms'
      },
      risetime: {
        folder: 'risetime_discrimination',
        fileCount: 101,
        taskSha256: '6e451686bc03e951ab1a21cd685355810be0418832aa7d33ba2d34fb0b53eda7',
        transformation: 'identity_pcm_reencode'
      }
    }
  }
});

const PROTOCOL_PRESETS = {
  sun2021: {
    id: 'sun2021',
    version: 'sun2021-staircase-v3',
    stimulusSetId: 'sun2021-reconstruction-v1',
    stimulusBindingId: 'sun2021-staircase-v3__sun2021-reconstruction-v1',
    citation: 'Sun, Saito, & Tierney (2021)',
    sourceLocator: 'Studies in Second Language Acquisition, 43, pp. 558–559',
    sourceAuditStatus: 'audited_against_cambridge_primary_source',
    stimulusCompatibility: 'reported_parameter_reconstruction_not_original_study_files',
    mainStudyTaskIds: ['pitch', 'formant', 'duration', 'risetime'],
    stimulusCompatibilityByTask: {
      pitch: 'reported_parameters_reconstructed_not_original_waveforms',
      formant: 'reported_parameters_reconstructed_not_original_waveforms',
      duration: 'reported_parameters_reconstructed_not_original_waveforms',
      risetime: 'reported_parameters_reconstructed_not_original_waveforms'
    },
    maxTrials: 70,
    targetReversals: 8,
    firstScoredReversal: 3,
    correctResponsesForHarder: 2,
    singleCorrectBeforeFirstIncorrect: true,
    stepSizes: [10, 5, 2, 1, 1, 1, 1, 1],
    thresholdAggregation: 'arithmetic_mean',
    reversalLevelTiming: 'after_step_update'
  },
  kachlicka2019: {
    id: 'kachlicka2019',
    version: 'kachlicka2019-staircase-v2',
    stimulusSetId: 'kachlicka2019-reconstruction-v1',
    stimulusBindingId: 'kachlicka2019-staircase-v2__kachlicka2019-reconstruction-v1',
    citation: 'Kachlicka, Saito, & Tierney (2019)',
    sourceLocator: 'Brain and Language, 192, p. 17, section 2.2.2',
    sourceAuditStatus: 'locally_audited_primary_source',
    stimulusCompatibility: 'reported_parameter_reconstruction_not_original_study_files',
    mainStudyTaskIds: ['pitch', 'formant', 'duration', 'risetime'],
    stimulusCompatibilityByTask: {
      pitch: 'reported_parameters_reconstructed_not_original_waveforms',
      formant: 'reported_parameters_reconstructed_not_original_waveforms',
      duration: 'reported_parameters_reconstructed_not_original_waveforms',
      risetime: 'reported_parameters_reconstructed_not_original_waveforms'
    },
    maxTrials: 70,
    targetReversals: 8,
    firstScoredReversal: 2,
    correctResponsesForHarder: 3,
    singleCorrectBeforeFirstIncorrect: false,
    stepSizes: [10, 5, 2, 1, 1, 1, 1, 1],
    thresholdAggregation: 'arithmetic_mean',
    reversalLevelTiming: 'before_step_update'
  },
  saitoTierney2024: {
    id: 'saitoTierney2024',
    version: 'saito-tierney-2024-staircase-v1',
    stimulusSetId: 'saito-tierney2024-reconstruction-v1',
    stimulusBindingId: 'saito-tierney-2024-staircase-v1__saito-tierney2024-reconstruction-v1',
    citation: 'Saito & Tierney (2024; online 2022)',
    sourceLocator: 'Studies in Second Language Acquisition, 46, pp. 1213–1215',
    sourceAuditStatus: 'locally_audited_primary_source',
    stimulusCompatibility: 'reported_parameter_reconstruction_not_original_study_files',
    mainStudyTaskIds: ['formant', 'pitch', 'duration'],
    stimulusCompatibilityByTask: {
      pitch: 'reported_duration_reconstructed_with_unreported_ramp_retained',
      formant: 'reported_parameters_reconstructed_not_original_waveforms',
      duration: 'reported_continuum_reconstructed_with_unreported_ramp_retained',
      risetime: 'not_available_in_bound_stimulus_set'
    },
    maxTrials: 70,
    targetReversals: 8,
    firstScoredReversal: 3,
    correctResponsesForHarder: 3,
    singleCorrectBeforeFirstIncorrect: false,
    stepSizes: [10, 5, 1, 1, 1, 1, 1, 1],
    thresholdAggregation: 'arithmetic_mean',
    reversalLevelTiming: 'before_step_update'
  }
};

let config = Object.freeze({ ...BASE_CONFIG, ...PROTOCOL_PRESETS.kachlicka2019 });

const practiceConfig = {
  trials: 5,
  baseStep: 1,
  differentStep: 100
};

const I18N = {
  en: {
    'app.title': 'Audio Discrimination Battery',
    'language.label': 'Language',
    'language.english': 'English',
    'language.japanese': '日本語',
    'session.stop': 'Stop session',
    'session.stopConfirm': 'Stop this session and delete its unsent local data from this browser? This cannot be undone.',
    'researcherSetup.tag': 'Researcher setup',
    'researcherSetup.title': 'Configure the listening battery',
    'researcherSetup.intro': 'Select the tasks, study profile, and feedback shown to participants. Each profile fixes both the adaptive procedure and its matching stimulus set.',
    'researcherSetup.tasks.legend': 'Tasks',
    'researcherSetup.tasks.help': 'Task availability follows the selected study profile. Participant task screens use neutral Listening Task labels; the generated URL carries named task settings.',
    'researcherSetup.protocol.label': 'Study profile (procedure and stimuli)',
    'researcherSetup.feedback.label': 'Participant feedback',
    'researcherSetup.lock': 'Start a supervised session on this device',
    'researcherSetup.build': 'Build {build} | asset-set SHA-256: {buildSha} | script SHA-256: {scriptSha}',
    'researcherSetup.buildUnavailable': 'The served build identity could not be verified. Reload the page before starting or creating a participant link.',
    'studyDetails.legend': 'Study details',
    'studyDetails.help': 'These non-participant details identify the study, support consent and recovery, and are stored in the result package. Do not enter direct identifiers.',
    'studyDetails.studyId.label': 'Study ID',
    'studyDetails.studyId.placeholder': 'e.g., AP_STUDY_01',
    'studyDetails.conditionId.label': 'Condition ID',
    'studyDetails.conditionId.placeholder': 'e.g., BASELINE',
    'studyDetails.siteId.label': 'Site ID',
    'studyDetails.siteId.placeholder': 'e.g., TOKYO_LAB',
    'studyDetails.distributionId.label': 'Distribution ID',
    'studyDetails.distributionId.placeholder': 'e.g., WAVE_01',
    'studyDetails.title.label': 'Participant-facing study title',
    'studyDetails.title.placeholder': 'e.g., Listening Study',
    'studyDetails.institution.label': 'Institution',
    'studyDetails.institution.placeholder': 'e.g., Example University',
    'studyDetails.consentVersion.label': 'Consent version',
    'studyDetails.consentVersion.placeholder': 'e.g., 2026-01',
    'studyDetails.minutes.label': 'Expected duration (minutes)',
    'studyDetails.publicUrlHelp': 'These URLs are included in local TEST links and are reserved for a future signed remote-link flow. Use public study pages only; never include credentials, access tokens, or participant-specific secrets.',
    'studyDetails.consentUrl.label': 'Consent information URL (HTTPS)',
    'studyDetails.contactUrl.label': 'Researcher contact URL (HTTPS)',
    'studyDetails.returnUrl.label': 'Remote result-return portal (HTTPS)',
    'studyDetails.returnUrl.help': 'Required when testing the remote-return flow. Production remote links remain disabled; a future approved portal must provide its own upload receipt.',
    'studyDetails.invalid': 'Complete every study detail with the required format. Use HTTPS links and do not include usernames or passwords in URLs.',
    'studyDetails.returnRequired': 'Add an approved HTTPS result-return portal before creating a remote participant link.',
    'participantLink.title': 'Participant link (local TEST only)',
    'participantLink.intro': 'Create a local TEST link that fixes the study metadata, procedure, stimuli, tasks, feedback, return portal, and starting language. Production remote-link issuance is disabled until an authenticated issuer and signature verification are integrated.',
    'participantLink.limitations': 'Local TEST links are reusable and unsigned. They are not proof of identity, a one-time invitation, or a blinding mechanism, and must never be distributed for research data collection.',
    'participantLink.startLanguage.label': 'Participant starting language',
    'participantLink.language.en': 'English',
    'participantLink.language.ja': 'Japanese',
    'participantLink.create': 'Create participant link',
    'participantLink.label': 'Generated participant link',
    'participantLink.copy': 'Copy link',
    'participantLink.open': 'Open participant view',
    'participantLink.created': 'Participant link created. Starting language: {language}. Check the settings before sharing it.',
    'participantLink.localPreview': 'Local preview link created. Starting language: {language}. Do not distribute this link; create the study link from the deployed HTTPS app.',
    'participantLink.unshareable': 'This build creates participant links only for visibly labelled local TEST sessions. Production remote links remain disabled until signed-link verification is integrated.',
    'participantLink.copied': 'Participant link copied.',
    'participantLink.copyFailed': 'The link could not be copied automatically. Select and copy it from the field.',
    'participantLink.openFailed': 'The participant view could not be opened. Copy the link and open it in a new tab.',
    'participantLink.loaded': 'Study settings were loaded from the participant link. Research settings cannot be changed on this page.',
    'deployment.testBanner': 'TEST SESSION — LOCAL TEST DATA — DO NOT COMBINE WITH RESEARCH DATA',
    'deployment.stagingBanner': 'STAGING DEPLOYMENT — verify the deployment environment before use',
    'deployment.blocked.tag': 'Deployment unavailable',
    'deployment.blocked.title': 'This deployment cannot run a session',
    'deployment.blocked.message': 'The frozen deployment configuration is missing, invalid, or does not authorize this origin. Stop here and contact the study administrator.',
    'deployment.previewOnly': 'This deployment is preview-only. Research sessions and participant-link creation are disabled.',
    'deployment.originBlocked': 'This origin is not authorized by the frozen deployment configuration.',
    'deployment.returnOriginBlocked': 'The result-return portal origin is not on this deployment’s approved allowlist.',
    'deployment.testLinkCreated': 'Local TEST link created. It produces test-only output and must not be distributed as a research link.',
    'invalidLink.tag': 'Invalid study link',
    'invalidLink.title': 'This study link cannot be used',
    'invalidLink.message': 'The link is incomplete, altered, or for a different battery version. Stop here and ask the researcher for a new link.',
    'landing.tag': 'Study information',
    'landing.studyId': 'Study ID',
    'landing.condition': 'Condition',
    'landing.site': 'Site',
    'landing.duration': 'Expected duration',
    'landing.durationValue': 'About {minutes} minutes',
    'landing.consentVersion': 'Consent version',
    'landing.voluntary': 'Participation is voluntary. You may stop before submitting results. Follow the study consent information for withdrawal or deletion requests.',
    'landing.localStorage': 'A pseudonymous recovery copy is stored in this browser until the session is explicitly cleared. Do not use a shared device unless the study permits it.',
    'landing.remoteWorkflow': 'For remote participation, completion requires downloading a ZIP, uploading it in the approved portal, checking the portal receipt, and then clearing this browser copy. The app does not upload automatically.',
    'landing.openConsent': 'Open consent information',
    'landing.contactResearcher': 'Contact the research team',
    'landing.confirmConsent': 'I confirm that I completed the study’s consent process and want to continue.',
    'landing.continue': 'Continue to equipment check',
    'landing.consentRequired': 'Open and complete the study consent process, then confirm it before continuing.',
    'preflight.tag': 'Equipment check',
    'preflight.title': 'Prepare for the listening tasks',
    'preflight.intro': 'Complete this check before entering the participant code. Use headphones, a quiet place, and a stable connection.',
    'preflight.headphones': 'My headphones are connected and working.',
    'preflight.environment': 'I am in a quiet place and have silenced notifications and calls.',
    'preflight.volume': 'I will set a comfortable volume during the test sound and will not change it after starting.',
    'preflight.continuity': 'I can complete each main task without pausing, replaying, refreshing, or switching tabs.',
    'preflight.export': 'This browser and device can download a ZIP and upload it through the approved return portal.',
    'preflight.playTest': 'Play test sound',
    'preflight.notTested': 'Test sound not yet completed.',
    'preflight.playing': 'Playing the test sound…',
    'preflight.passed': 'Test sound completed. Confirm that it was clear and comfortable.',
    'preflight.failed': 'The test sound could not be played reliably. Check the connection, browser, and file access, then retry.',
    'preflight.interrupted': 'The test sound was interrupted. Return to this page and play it again.',
    'preflight.incomplete': 'Complete every equipment check and successfully play the test sound before continuing.',
    'preflight.offline': 'A network connection is required to load the study audio.',
    'preflight.continue': 'Continue to participant code',
    'resume.tag': 'Saved session found',
    'resume.title': 'Resume your saved session?',
    'resume.help': 'Resume only if this is your session. Starting over deletes its local response data and participant code; a non-identifying deletion time remains to stop another open tab from recreating it.',
    'resume.description': 'Saved {saved}; status {status}.',
    'resume.code.label': 'Re-enter the participant code',
    'resume.code.placeholder': 'e.g., P001',
    'resume.code.help': 'Enter the pseudonymous code supplied for this saved session. The page does not display the stored code.',
    'resume.code.error': 'The code does not match this saved session.',
    'resume.incompatible': 'A saved session from a different study configuration is present in this browser. It cannot be resumed with this link. Delete it only if the approved retention procedure allows that action.',
    'resume.resume': 'Resume saved session',
    'resume.discard': 'Delete it and start over',
    'resume.interrupted': 'The browser closed during an audio presentation. Replaying it will be recorded as a protocol deviation.',
    'checkpoint.unavailable': 'This browser cannot save a reliable recovery checkpoint. The session cannot start here.',
    'checkpoint.conflict': 'This session was changed in another tab. This tab has stopped to protect the data.',
    'checkpoint.sharedOrigin': 'This GitHub Pages origin is shared with other project sites. It may be used for previewing, but research sessions are blocked until the app is deployed on a dedicated HTTPS origin.',
    'task.duration': 'Duration discrimination',
    'task.formant': 'Formant discrimination',
    'task.pitch': 'Pitch discrimination',
    'task.risetime': 'Rise-time discrimination',
    'protocol.sun2021.label': 'Sun, Saito, & Tierney (2021)',
    'protocol.kachlicka2019.label': 'Kachlicka et al. (2019)',
    'protocol.saitoTierney2024.label': 'Saito & Tierney (2024; online 2022)',
    'protocol.sun2021.description': '70 trials or 8 reversals; harder after 1 correct response until the first error and after 2 consecutive correct responses thereafter; step sizes 10 → 5 → 2 → 1; threshold based on reversals 3 onward. Uses a reconstruction of the reported stimulus parameters, not the original study files.',
    'protocol.kachlicka2019.description': '70 trials or 8 reversals; harder after 3 consecutive correct responses; step sizes 10 → 5 → 2 → 1; threshold based on reversals 2 onward. Uses a reconstruction of the reported stimulus parameters, not the original study files.',
    'protocol.saitoTierney2024.description': '70 trials or 8 reversals; harder after 3 consecutive correct responses; step sizes 10 → 5 → 1; threshold based on reversals 3 onward. Uses a reconstruction of the reported stimulus parameters, not the original study files. Rise-time is unavailable in this profile.',
    'feedback.practiceOnly.label': 'Practice feedback only',
    'feedback.detailed.label': 'Detailed completion feedback',
    'feedback.practiceOnly.description': 'Correctness is shown during the five practice trials. Main trials show no correctness or progress, and the automatic completion feedback is only a completion message. This display setting does not access-protect the researcher-results screen.',
    'feedback.detailed.description': 'Correctness is shown during practice only. After all main tasks, estimated thresholds are shown without pass/fail or normative judgments.',
    'setup.tag': 'Participant setup',
    'setup.title': 'Enter the participant code',
    'setup.intro': 'The participant code determines a reproducible task order for this session.',
    'setup.subjectId.label': 'Participant code',
    'setup.subjectId.placeholder': 'e.g., P001',
    'setup.subjectId.help': 'Enter the pseudonymous study code supplied by the researcher. Do not enter a name, email address, student number, or health information.',
    'setup.subjectId.error': 'Use 1–32 letters, numbers, hyphens, or underscores, beginning with a letter.',
    'setup.buildUnavailable': 'The served build identity is not available. Reload this page before starting.',
    'setup.continue': 'Set order and continue',
    'setup.editSettings': 'Edit researcher settings',
    'overview.tag': 'Order confirmation',
    'overview.title': 'Order for this session',
    'overview.orderList.label': 'Task order',
    'overview.help': 'The order is locked to the participant code. Stay in the same browser until everything is finished.',
    'overview.codeLabel': 'Participant code:',
    'overview.codeCheck': 'Check this code carefully before starting. It identifies every result file.',
    'overview.editCode': 'Correct participant code',
    'overview.begin': 'Start the first task',
    'instructions.tag': 'Task instructions',
    'instructions.taskName': 'Task name',
    'instructions.taskDetail': 'Three sounds will play in sequence.',
    'instructions.sequence': 'Only the first or third sound differs from the others.',
    'instructions.choose': 'After playback, choose the number (1 or 3) that sounds different.',
    'instructions.practice': 'Practice has 5 trials with correctness feedback. Start the main task with Space or the button after practice.',
    'instructions.main': 'The main task does not show correctness or trial progress. Conditions adjust automatically.',
    'instructions.startPractice': 'Start practice',
    'instructions.startMain': 'Start main task (Spacebar also works)',
    'instructions.practiceStatus': 'Complete 5 practice trials, then start the main task with Space or the button.',
    'trial.sessionTag': 'Listening task',
    'trial.heading': 'Make your choice',
    'trial.prompt': 'Which sound is different? Choose 1 or 3.',
    'trial.playing': 'Playing audio...',
    'trial.first': '1',
    'trial.third': '3',
    'trial.chooseFirst': 'Choose the first sound',
    'trial.chooseThird': 'Choose the third sound',
    'technicalError.tag': 'Technical interruption',
    'technicalError.title': 'The sound could not be played reliably',
    'technicalError.intro': 'Do not answer this trial. Check the connection and headphones, then retry. The last committed response has been saved locally.',
    'technicalError.storageTitle': 'The session could not be saved safely',
    'technicalError.storageIntro': 'Do not continue in this tab. Use the active session in the other tab, or end here and save any available partial results.',
    'technicalError.deleteTitle': 'The browser copy could not be deleted safely',
    'technicalError.deleteIntro': 'The local response data may still be present. Do not close this page or claim deletion. Retry, or follow the study-approved instructions for clearing site data and contact the research team.',
    'technicalError.interruptionTitle': 'The current trial was interrupted',
    'technicalError.interruptionIntro': 'Do not answer this trial. Returning after leaving the page requires a replay, which will be recorded as a protocol deviation.',
    'technicalError.codeLabel': 'Error code:',
    'technicalError.retry': 'Retry this trial',
    'technicalError.retrying': 'Reloading the required audio…',
    'technicalError.retryDelete': 'Retry deleting the browser copy',
    'technicalError.deleteFailedStatus': 'Deletion still could not be verified. The local copy may remain.',
    'technicalError.end': 'End and save partial results',
    'technicalError.contact': 'Contact the research team',
    'withdrawn.tag': 'Session stopped',
    'withdrawn.title': 'The session has been stopped',
    'withdrawn.intro': 'The unsent response data and participant code have been deleted from this browser. A non-identifying deletion time remains to prevent another open tab from restoring the session. Files already saved in Downloads are not deleted. Follow the consent information for any data submitted outside this app.',
    'taskComplete.tag': 'Task complete',
    'taskComplete.title': 'One task is finished',
    'taskComplete.hint': 'Continue when you are ready.',
    'taskComplete.next': 'Next task',
    'complete.tag': 'All tasks complete',
    'complete.title': 'Thank you',
    'complete.intro': 'You have completed all listening tasks. Keep this page open and follow the researcher’s instructions.',
    'complete.technicalTitle': 'Session ended because of a technical problem',
    'complete.technicalTag': 'Technical stop',
    'complete.technicalIntro': 'No further trials will run. The package is marked as a technical failure and may contain partial results only.',
    'complete.feedbackPending': 'Your session is complete.',
    'complete.showResearcherResults': 'Researcher: show results',
    'complete.returnTitle': 'Return your results',
    'complete.notSent': 'This app has not sent your results. Download the result package, upload it through the approved return portal, and keep the portal’s receipt.',
    'complete.downloadBundle': 'Download result package',
    'complete.openPortal': 'Open result-return portal',
    'complete.confirmReturn': 'I have the portal receipt; clear this browser copy',
    'complete.returnConfirm': 'Confirm only after the approved portal has issued a receipt. Clear the local browser copy now? A ZIP already saved in Downloads will not be deleted.',
    'complete.downloadFirst': 'Start the ZIP download and verify that the file is present before opening the return portal.',
    'complete.bundleReady': 'The result-package download was started. Verify that the ZIP is present, then upload it in the approved portal and keep the portal receipt.',
    'complete.sessionReference': 'Support reference — participant code: {id}; session run ID: {run}',
    'complete.researcherConfirm': 'This control is not access-protected. Continue only after the device has been handed back to the authorized researcher.',
    'returned.tag': 'Return confirmed',
    'returned.title': 'The local browser copy has been cleared',
    'returned.intro': 'You confirmed that the return portal issued a receipt. The app cleared the local response data and participant code, but it cannot verify the portal upload and cannot delete a ZIP already saved in Downloads. Handle that file according to the consent information.',
    'researcherResults.tag': 'Researcher results',
    'researcherResults.title': 'Session results',
    'researcherResults.intro': 'Review task metrics and download the trial-level or wide-format CSV before starting the next participant.',
    'researcherResults.metrics.title': 'Task metrics',
    'researcherResults.metrics.regionLabel': 'Task metrics',
    'researcherResults.metrics.caption': 'Estimated thresholds and completion metrics by task',
    'researcherResults.metrics.order': 'Order',
    'researcherResults.metrics.task': 'Task',
    'researcherResults.metrics.level': 'Threshold level',
    'researcherResults.metrics.physical': 'Physical threshold',
    'researcherResults.metrics.trials': 'Trials',
    'researcherResults.metrics.reversals': 'Reversals',
    'researcherResults.metrics.usedReversals': 'Scored levels',
    'researcherResults.metrics.stopReason': 'Stop reason',
    'researcherResults.metrics.validity': 'Estimate available',
    'researcherResults.wide.title': 'Wide-format preview',
    'researcherResults.wide.regionLabel': 'Wide-format result preview',
    'researcherResults.wide.pending': 'The participant-level summary will appear here when the session is complete.',
    'researcherResults.saveWarning': 'A recovery copy remains in this browser until explicitly cleared. Download and verify the ZIP result package before starting the next participant.',
    'researcherResults.downloadTrial': 'Download trial CSV',
    'researcherResults.downloadWide': 'Download wide CSV',
    'researcherResults.downloadBundle': 'Download complete result package',
    'researcherResults.exportPending': 'Download the complete result package before setting up the next participant.',
    'researcherResults.bundleReady': 'Complete result package download started. Verify that the ZIP file is present before clearing this session.',
    'researcherResults.nextParticipant': 'Set up next participant',
    'researcherResults.nextConfirm': 'Start the next participant and permanently clear this session from the browser? Confirm that the ZIP result package has been retained.',
    task1Label: 'Listening Task 1',
    task2Label: 'Listening Task 2',
    task3Label: 'Listening Task 3',
    task4Label: 'Listening Task 4',
    participantTaskLabel: 'Listening Task {number}',
    task1Detail: 'Three sounds play in sequence. Only the first or third differs. Choose the sound that is different.',
    task2Detail: 'Three sounds play in sequence. Only the first or third differs. Choose the sound that is different.',
    task3Detail: 'Three sounds play in sequence. Only the first or third differs. Choose the sound that is different.',
    task4Detail: 'Three sounds play in sequence. Only the first or third differs. Choose the sound that is different.',
    durationDifference: 'duration difference',
    f2Difference: 'F2 difference',
    f0Difference: 'F0 difference',
    riseTimeDifference: 'rise-time difference',
    thresholdLabel: 'Estimated threshold (mean of reversals {start} onward)',
    thresholdValue: 'Level {level} ({measure}: {physical} {unit})',
    taskStage: 'Task {current}/{total} | {stage}',
    taskCount: 'Task {current}/{total}',
    taskNumber: 'Task {number}',
    instructionsStage: 'Instructions',
    practiceStage: 'Practice',
    testStage: 'Main task',
    taskModeHeading: '{task} — {mode}',
    practicePrompt: 'One sound is clearly different. Choose 1 or 3.',
    testPrompt: 'Which sound is different? Choose 1 or 3.',
    practiceProgress: '{prefix} | Practice {current}/{total}',
    playingAudio: 'Playing audio...',
    loadingAudio: 'Loading audio...',
    startMainAfterPractice: 'Start main task after practice (Spacebar also works)',
    finishPracticeStatus: 'Finish {count} practice trials, then start the main task with Space or the button below.',
    startPractice: 'Start practice',
    practiceInProgress: 'Practice in progress ({count} total). After playback, choose 1 or 3.',
    practicePlaying: 'Practice {current}/{total}: Playing audio...',
    practiceChoose: 'Practice {current}/{total}: Choose 1 or 3.',
    audioError: 'Audio could not be loaded. Check the network and file placement, then reload the page.',
    completePracticeFirst: 'Complete all {count} practice trials before starting the main task.',
    preparingMain: 'Preparing the main task...',
    selectOneOrThree: 'Select 1 or 3.',
    practiceCorrect: 'Correct. Moving to the next practice trial.',
    practiceIncorrect: 'Not quite. The different sound was {answer}.',
    practiceCompleteStatus: 'Practice is complete. Start the main task with Space or the button below.',
    startMainEnabled: 'Start main task (Spacebar enabled)',
    practiceCompletedButton: 'Practice completed',
    pressSpaceToStart: 'Press Space or use the button below to start the main task.',
    preparingNextTrial: 'Preparing the next trial...',
    taskCompletedTitle: '{task} completed',
    thresholdUnavailable: 'A threshold estimate was not calculated because there were insufficient scored reversals.',
    responsesRecorded: 'Task complete. Your responses have been recorded.',
    allTasksFinishedParticipant: 'All listening tasks are finished. Continue to the completion screen.',
    nextTaskHint: 'Next: “{task}”. Continue when you are ready.',
    finishParticipantSession: 'Finish session',
    nextTask: 'Next task',
    participantCompletionOnly: 'Your responses have been recorded. Detailed results are available to the researcher.',
    participantDetailedCaution: 'Lower thresholds indicate detection of a smaller difference under these test conditions. These are experimental estimates, not diagnoses or fixed measures of ability.',
    notAvailable: 'N/A',
    valid: 'Yes',
    notValid: 'No',
    stopReason_target_reversals: 'Target reversals',
    stopReason_max_trials: 'Maximum trials',
    researcherMeta: 'Participant {id} | Run {run} | {protocol} | {count} task(s) completed | {status}',
    participantSetupDescription: '{count} listening tasks are configured. Enter the pseudonymous study code supplied by the researcher to create a reproducible order.',
    participantSetupDescriptionOne: '1 listening task is configured. Enter the pseudonymous study code supplied by the researcher to create a reproducible order.',
    selectAtLeastOneTask: 'Select at least one task.',
    unavailableTaskSelection: 'The selected study profile does not provide every selected task. Review the task selection.',
    taskUnavailableInProfile: 'Unavailable in the selected study profile.'
  },
  ja: {
    'app.title': '聴覚弁別課題バッテリー',
    'language.label': '言語',
    'language.english': 'English',
    'language.japanese': '日本語',
    'session.stop': 'セッションを中止',
    'session.stopConfirm': 'このセッションを中止し、未送信のローカルデータをこのブラウザから削除しますか？この操作は取り消せません。',
    'researcherSetup.tag': '研究者設定',
    'researcherSetup.title': '聴覚課題を設定する',
    'researcherSetup.intro': '実施する課題、研究プロファイル、参加者へのフィードバックを選択してください。各プロファイルは、適応手続きと対応する刺激セットを一体として固定します。',
    'researcherSetup.tasks.legend': '実施する課題',
    'researcherSetup.tasks.help': '実施できる課題は、選択した研究プロファイルに従います。参加者の課題画面には中立的な「リスニング課題」名を表示しますが、生成URLには課題設定名が含まれます。',
    'researcherSetup.protocol.label': '研究プロファイル（手続き・刺激）',
    'researcherSetup.feedback.label': '参加者へのフィードバック',
    'researcherSetup.lock': 'この端末で監督下セッションを開始',
    'researcherSetup.build': 'ビルド {build}｜asset-set SHA-256: {buildSha}｜script SHA-256: {scriptSha}',
    'researcherSetup.buildUnavailable': '配信中ビルドの同一性を検証できませんでした。開始または参加者用リンク作成前にページを再読み込みしてください。',
    'studyDetails.legend': '研究情報',
    'studyDetails.help': '研究の識別、同意、問い合わせ、結果回収に必要な非個人情報です。結果パッケージに保存されます。直接識別子は入力しないでください。',
    'studyDetails.studyId.label': '研究ID',
    'studyDetails.studyId.placeholder': '例：AP_STUDY_01',
    'studyDetails.conditionId.label': '条件ID',
    'studyDetails.conditionId.placeholder': '例：BASELINE',
    'studyDetails.siteId.label': '実施サイトID',
    'studyDetails.siteId.placeholder': '例：TOKYO_LAB',
    'studyDetails.distributionId.label': '配布ID',
    'studyDetails.distributionId.placeholder': '例：WAVE_01',
    'studyDetails.title.label': '参加者に表示する研究名',
    'studyDetails.title.placeholder': '例：リスニング研究',
    'studyDetails.institution.label': '実施機関',
    'studyDetails.institution.placeholder': '例：○○大学',
    'studyDetails.consentVersion.label': '同意文書版',
    'studyDetails.consentVersion.placeholder': '例：2026-01',
    'studyDetails.minutes.label': '所要時間の目安（分）',
    'studyDetails.publicUrlHelp': 'これらのURLはローカルTEST用リンクに含まれ、将来の署名付き遠隔リンクでも使用する予定です。公開用の研究ページだけを使用し、認証情報、アクセストークン、参加者固有の秘密値を含めないでください。',
    'studyDetails.consentUrl.label': '同意説明URL（HTTPS）',
    'studyDetails.contactUrl.label': '研究者連絡先URL（HTTPS）',
    'studyDetails.returnUrl.label': '遠隔結果返却ポータル（HTTPS）',
    'studyDetails.returnUrl.help': '遠隔返却フローのTEST時に必須です。本番の遠隔リンクは無効であり、将来使用する承認済みポータルは独自のアップロード受領証を発行する必要があります。',
    'studyDetails.invalid': '研究情報を指定形式ですべて入力してください。URLはHTTPSとし、ユーザー名やパスワードを含めないでください。',
    'studyDetails.returnRequired': '遠隔参加者用リンクを作成する前に、承認済みのHTTPS結果返却ポータルを指定してください。',
    'participantLink.title': '参加者用リンク（ローカルTEST専用）',
    'participantLink.intro': '研究情報、手続き、刺激、課題、フィードバック、結果返却先、開始言語を固定したローカルTEST用リンクを作成します。認証済み発行者と署名検証を統合するまで、本番の遠隔リンク発行は無効です。',
    'participantLink.limitations': 'ローカルTEST用リンクは再利用可能で未署名です。本人確認、一回限りの招待、盲検化にはならず、研究データ収集には決して配布しないでください。',
    'participantLink.startLanguage.label': '参加者画面の開始言語',
    'participantLink.language.en': '英語',
    'participantLink.language.ja': '日本語',
    'participantLink.create': '参加者用リンクを作成',
    'participantLink.label': '作成した参加者用リンク',
    'participantLink.copy': 'リンクをコピー',
    'participantLink.open': '参加者画面を開く',
    'participantLink.created': '参加者用リンクを作成しました。開始言語：{language}。共有前に設定内容を確認してください。',
    'participantLink.localPreview': 'ローカル検証用リンクを作成しました。開始言語：{language}。このリンクは配布せず、公開済みHTTPSアプリから研究用リンクを作成してください。',
    'participantLink.unshareable': 'このビルドで作成できるのは、明示的に表示されたローカルTESTセッションのリンクだけです。署名付きリンク検証を統合するまで、本番の遠隔リンクは無効です。',
    'participantLink.copied': '参加者用リンクをコピーしました。',
    'participantLink.copyFailed': 'リンクを自動でコピーできませんでした。入力欄から選択してコピーしてください。',
    'participantLink.openFailed': '参加者画面を開けませんでした。リンクをコピーして新しいタブで開いてください。',
    'participantLink.loaded': '参加者用リンクから実施設定を読み込みました。このページでは研究設定を変更できません。',
    'deployment.testBanner': 'テストセッション — ローカル検証データ — 研究データと混在禁止',
    'deployment.stagingBanner': 'ステージング環境 — 使用前に配備環境を確認してください',
    'deployment.blocked.tag': '配備を利用できません',
    'deployment.blocked.title': 'この配備ではセッションを実行できません',
    'deployment.blocked.message': '固定された配備設定が欠損、不正、または現在のoriginを許可していません。ここで停止し、研究管理者へ連絡してください。',
    'deployment.previewOnly': 'この配備はプレビュー専用です。研究セッションと参加者用リンク作成は無効です。',
    'deployment.originBlocked': '現在のoriginは固定された配備設定で許可されていません。',
    'deployment.returnOriginBlocked': '結果返却ポータルのoriginが、この配備の承認済みallowlistに含まれていません。',
    'deployment.testLinkCreated': 'ローカルのテスト用リンクを作成しました。テスト専用出力となるため、研究用リンクとして配布しないでください。',
    'invalidLink.tag': '無効な研究リンク',
    'invalidLink.title': 'この研究リンクは使用できません',
    'invalidLink.message': 'リンクが不完全、変更済み、または別のバッテリー版用です。ここで停止し、研究者に新しいリンクを依頼してください。',
    'landing.tag': '研究情報',
    'landing.studyId': '研究ID',
    'landing.condition': '条件',
    'landing.site': '実施サイト',
    'landing.duration': '所要時間の目安',
    'landing.durationValue': '約{minutes}分',
    'landing.consentVersion': '同意文書版',
    'landing.voluntary': '参加は任意です。結果を提出する前なら中止できます。参加取り消しや削除依頼は、研究の同意説明に従ってください。',
    'landing.localStorage': 'セッションを明示的に消去するまで、仮名化された復旧用コピーがこのブラウザに保存されます。研究で許可されていない限り、共有端末を使用しないでください。',
    'landing.remoteWorkflow': '遠隔参加では、ZIPの保存、承認済みポータルへのアップロード、受領証の確認、このブラウザ内コピーの消去までが必要です。このアプリは自動アップロードしません。',
    'landing.openConsent': '同意説明を開く',
    'landing.contactResearcher': '研究チームに連絡',
    'landing.confirmConsent': '研究の同意手続きを完了し、続行を希望します。',
    'landing.continue': '機器確認へ進む',
    'landing.consentRequired': '研究の同意手続きを開いて完了し、続行前に確認欄を選択してください。',
    'preflight.tag': '機器確認',
    'preflight.title': 'リスニング課題の準備',
    'preflight.intro': '参加者コード入力前に確認してください。ヘッドホン、静かな環境、安定した接続が必要です。',
    'preflight.headphones': 'ヘッドホンが接続され、正常に動作しています。',
    'preflight.environment': '静かな場所におり、通知と着信をオフにしました。',
    'preflight.volume': 'テスト音で快適な音量に調整し、開始後は変更しません。',
    'preflight.continuity': '各本試行を一時停止、再生、再読み込み、タブ切り替えなしで完了できます。',
    'preflight.export': 'このブラウザと端末でZIPを保存し、承認済み返却ポータルへアップロードできます。',
    'preflight.playTest': 'テスト音を再生',
    'preflight.notTested': 'テスト音はまだ完了していません。',
    'preflight.playing': 'テスト音を再生しています…',
    'preflight.passed': 'テスト音が完了しました。明瞭かつ快適に聞こえたことを確認してください。',
    'preflight.failed': 'テスト音を確実に再生できませんでした。接続、ブラウザ、音声ファイルへのアクセスを確認し、再試行してください。',
    'preflight.interrupted': 'テスト音が中断されました。このページへ戻り、もう一度再生してください。',
    'preflight.incomplete': 'すべての機器確認を選択し、テスト音を正常に完了してから進んでください。',
    'preflight.offline': '研究音声の読み込みにはネットワーク接続が必要です。',
    'preflight.continue': '参加者コードへ進む',
    'resume.tag': '保存済みセッション',
    'resume.title': '保存済みセッションを再開しますか？',
    'resume.help': '自分のセッションである場合だけ再開してください。最初からやり直すとローカル回答データと参加者コードを削除し、別タブによる再作成防止用の個人を識別しない削除時刻だけを残します。',
    'resume.description': '保存日時 {saved}／状態 {status}',
    'resume.code.label': '参加者コードを再入力',
    'resume.code.placeholder': '例：P001',
    'resume.code.help': 'この保存済みセッションに割り当てられた仮名コードを入力してください。保存されているコードは画面に表示しません。',
    'resume.code.error': '入力したコードは、この保存済みセッションと一致しません。',
    'resume.incompatible': 'このブラウザには、別の研究設定の保存済みセッションがあります。このリンクでは再開できません。承認済みの保管手順で認められている場合だけ削除してください。',
    'resume.resume': '保存済みセッションを再開',
    'resume.discard': '削除して最初から開始',
    'resume.interrupted': '音声提示中にブラウザが閉じられました。再生すると手順上の逸脱として記録されます。',
    'checkpoint.unavailable': 'このブラウザでは復旧用チェックポイントを確実に保存できません。ここではセッションを開始できません。',
    'checkpoint.conflict': '別のタブでこのセッションが更新されました。データ保護のため、このタブは停止しました。',
    'checkpoint.sharedOrigin': 'このGitHub Pagesオリジンは他のプロジェクトサイトと共有されています。プレビューには使用できますが、専用HTTPSオリジンへ配置するまで研究セッションは開始できません。',
    'task.duration': '持続時間弁別',
    'task.formant': 'フォルマント弁別',
    'task.pitch': 'ピッチ弁別',
    'task.risetime': '立ち上がり時間弁別',
    'protocol.sun2021.label': 'Sun, Saito, & Tierney (2021)',
    'protocol.kachlicka2019.label': 'Kachlicka et al. (2019)',
    'protocol.saitoTierney2024.label': 'Saito & Tierney (2024；オンライン公開2022)',
    'protocol.sun2021.description': '70試行または8反転。初誤答までは1正答、その後は2連続正答で難化します。ステップ幅は10→5→2→1、閾値は第3反転以降に基づきます。原研究の音声ファイルではなく、論文の報告パラメータに基づく再構成刺激を使用します。',
    'protocol.kachlicka2019.description': '70試行または8反転。3連続正答で難化します。ステップ幅は10→5→2→1、閾値は第2反転以降に基づきます。原研究の音声ファイルではなく、論文の報告パラメータに基づく再構成刺激を使用します。',
    'protocol.saitoTierney2024.description': '70試行または8反転。3連続正答で難化します。ステップ幅は10→5→1、閾値は第3反転以降に基づきます。原研究の音声ファイルではなく、論文の報告パラメータに基づく再構成刺激を使用します。このプロファイルでは立ち上がり時間弁別を選択できません。',
    'feedback.practiceOnly.label': '練習のみ',
    'feedback.detailed.label': '終了後に推定閾値を表示',
    'feedback.practiceOnly.description': '5回の練習では正誤を表示します。本試行では正誤も進捗も表示せず、自動表示する終了時フィードバックは完了メッセージだけです。この表示設定は研究者用結果画面へのアクセス制御ではありません。',
    'feedback.detailed.description': '正誤を表示するのは練習だけです。全課題終了後に推定閾値を表示しますが、合否や規準集団との比較は示しません。',
    'setup.tag': '参加者設定',
    'setup.title': '参加者コードを入力してください',
    'setup.intro': '参加者コードに基づいて、このセッションの課題順を再現可能な形で決定します。',
    'setup.subjectId.label': '参加者コード',
    'setup.subjectId.placeholder': '例：P001',
    'setup.subjectId.help': '研究者から指定された仮名化済みの研究用コードを入力してください。氏名、メールアドレス、学籍番号、健康情報は入力しないでください。',
    'setup.subjectId.error': '半角英字で始まる1～32文字の半角英数字・ハイフン・アンダースコアを使ってください。',
    'setup.buildUnavailable': '配信中ビルドの同一性を確認できません。開始前にこのページを再読み込みしてください。',
    'setup.continue': '順序を決定して次へ',
    'setup.editSettings': '研究者設定を変更',
    'overview.tag': '順序の確認',
    'overview.title': 'このセッションの実施順',
    'overview.orderList.label': '課題の実施順',
    'overview.help': '順序は参加者コードに基づいて固定されています。すべて終了するまで同じブラウザを使用してください。',
    'overview.codeLabel': '参加者コード：',
    'overview.codeCheck': '開始前にこのコードを慎重に確認してください。すべての結果ファイルの識別に使われます。',
    'overview.editCode': '参加者コードを修正',
    'overview.begin': '最初の課題を開始',
    'instructions.tag': '課題の説明',
    'instructions.taskName': '課題名',
    'instructions.taskDetail': '3つの音が順番に再生されます。',
    'instructions.sequence': '1番目または3番目の音だけが、ほかの音と異なります。',
    'instructions.choose': '再生後、異なって聞こえた音の番号（1または3）を選んでください。',
    'instructions.practice': '正誤表示のある練習を5回行います。練習後、スペースキーまたはボタンで本試行を開始します。',
    'instructions.main': '本試行中は正誤や進捗を表示しません。条件は回答に応じて自動調整されます。',
    'instructions.startPractice': '練習を開始',
    'instructions.startMain': '本試行を開始（スペースキーも使用できます）',
    'instructions.practiceStatus': '5回の練習後、スペースキーまたはボタンで本試行を開始してください。',
    'trial.sessionTag': 'リスニング課題',
    'trial.heading': '回答してください',
    'trial.prompt': '異なる音はどちらですか？ 1または3を選んでください。',
    'trial.playing': '音を再生しています…',
    'trial.first': '1',
    'trial.third': '3',
    'trial.chooseFirst': '1番目の音を選択',
    'trial.chooseThird': '3番目の音を選択',
    'technicalError.tag': '技術的中断',
    'technicalError.title': '音声を確実に再生できませんでした',
    'technicalError.intro': 'この試行には回答しないでください。接続とヘッドホンを確認し、再試行してください。最後に確定した回答まではローカル保存されています。',
    'technicalError.storageTitle': 'セッションを安全に保存できませんでした',
    'technicalError.storageIntro': 'このタブで続行しないでください。別のタブで有効なセッションを使用するか、ここで終了して利用可能な部分結果を保存してください。',
    'technicalError.deleteTitle': 'ブラウザ内コピーを安全に削除できませんでした',
    'technicalError.deleteIntro': 'ローカル回答データが残っている可能性があります。このページを閉じたり、削除済みと扱ったりしないでください。再試行するか、研究で承認されたサイトデータ消去手順に従い、研究チームへ連絡してください。',
    'technicalError.interruptionTitle': '現在の試行が中断されました',
    'technicalError.interruptionIntro': 'この試行には回答しないでください。ページから離れた後は再生が必要で、手順上の逸脱として記録されます。',
    'technicalError.codeLabel': 'エラーコード：',
    'technicalError.retry': 'この試行を再試行',
    'technicalError.retrying': '必要な音声を再読み込みしています…',
    'technicalError.retryDelete': 'ブラウザ内コピーの削除を再試行',
    'technicalError.deleteFailedStatus': '削除をまだ検証できません。ローカルコピーが残っている可能性があります。',
    'technicalError.end': '終了して部分結果を保存',
    'technicalError.contact': '研究チームに連絡',
    'withdrawn.tag': 'セッション中止',
    'withdrawn.title': 'セッションを中止しました',
    'withdrawn.intro': '未送信の回答データと参加者コードはこのブラウザから削除されました。別の開いているタブによる復元を防ぐため、個人を識別しない削除時刻だけが残ります。ダウンロード済みファイルは削除されません。このアプリ外へ提出済みのデータは同意説明に従ってください。',
    'taskComplete.tag': '課題完了',
    'taskComplete.title': '1つの課題が終了しました',
    'taskComplete.hint': '準備ができたら次へ進んでください。',
    'taskComplete.next': '次の課題へ',
    'complete.tag': '全課題完了',
    'complete.title': 'ご協力ありがとうございました',
    'complete.intro': 'すべてのリスニング課題が終了しました。このページを開いたまま、研究者の指示に従ってください。',
    'complete.technicalTitle': '技術的問題のためセッションを終了しました',
    'complete.technicalTag': '技術的終了',
    'complete.technicalIntro': '以降の試行は実施しません。パッケージには技術的失敗と記録され、部分結果だけが含まれる場合があります。',
    'complete.feedbackPending': 'セッションが完了しました。',
    'complete.showResearcherResults': '研究者：結果を表示',
    'complete.returnTitle': '結果を返却',
    'complete.notSent': 'このアプリから結果は送信されていません。結果パッケージを保存し、承認済み返却ポータルからアップロードし、ポータルの受領証を保管してください。',
    'complete.downloadBundle': '結果パッケージを保存',
    'complete.openPortal': '結果返却ポータルを開く',
    'complete.confirmReturn': 'ポータルの受領証を確認済み：ブラウザ内コピーを消去',
    'complete.returnConfirm': '承認済みポータルから受領証が発行された後だけ確認してください。ブラウザ内コピーを消去しますか？ダウンロードフォルダのZIPは削除されません。',
    'complete.downloadFirst': 'ポータルを開く前にZIP保存を開始し、ファイルが存在することを確認してください。',
    'complete.bundleReady': '結果パッケージの保存を開始しました。次に、そのZIPファイルを承認済みポータルへアップロードし、受領証を保管してください。',
    'complete.sessionReference': '問い合わせ用参照情報―参加者コード：{id}／セッション実行ID：{run}',
    'complete.researcherConfirm': 'この操作にはアクセス制御がありません。端末が権限を持つ研究者へ返された後だけ続行してください。',
    'returned.tag': '返却確認済み',
    'returned.title': 'ブラウザ内コピーを消去しました',
    'returned.intro': '結果返却ポータルの受領証を確認したとの申告に基づき、ローカル回答データと参加者コードを消去しました。このアプリはポータルへの送信完了を検証できず、ダウンロード済みZIPも削除できません。同意説明に従ってそのファイルを扱ってください。',
    'researcherResults.tag': '研究者用結果',
    'researcherResults.title': 'セッション結果',
    'researcherResults.intro': '次の参加者を設定する前に、課題別指標を確認し、試行単位またはワイド型CSVを保存してください。',
    'researcherResults.metrics.title': '課題別指標',
    'researcherResults.metrics.regionLabel': '課題別指標',
    'researcherResults.metrics.caption': '課題別の推定閾値と完了指標',
    'researcherResults.metrics.order': '順序',
    'researcherResults.metrics.task': '課題',
    'researcherResults.metrics.level': '閾値Level',
    'researcherResults.metrics.physical': '物理閾値',
    'researcherResults.metrics.trials': '試行数',
    'researcherResults.metrics.reversals': '反転数',
    'researcherResults.metrics.usedReversals': '採用Level',
    'researcherResults.metrics.stopReason': '終了理由',
    'researcherResults.metrics.validity': '推定値あり',
    'researcherResults.wide.title': 'ワイド型プレビュー',
    'researcherResults.wide.regionLabel': 'ワイド型結果のプレビュー',
    'researcherResults.wide.pending': 'セッション完了後、参加者単位の要約がここに表示されます。',
    'researcherResults.saveWarning': '明示的に消去するまで、このブラウザに復旧用コピーが残ります。次の参加者を開始する前にZIP結果パッケージを保存し、内容を確認してください。',
    'researcherResults.downloadTrial': '試行単位CSVを保存',
    'researcherResults.downloadWide': 'ワイド型CSVを保存',
    'researcherResults.downloadBundle': '完全な結果パッケージを保存',
    'researcherResults.exportPending': '次の参加者を設定する前に、完全な結果パッケージを保存してください。',
    'researcherResults.bundleReady': '完全な結果パッケージの保存を開始しました。セッションを消去する前にZIPファイルが存在することを確認してください。',
    'researcherResults.nextParticipant': '次の参加者を設定',
    'researcherResults.nextConfirm': '次の参加者を開始し、このセッションをブラウザから完全に消去しますか？ZIP結果パッケージが保管されていることを確認してください。',
    task1Label: 'リスニング課題1',
    task2Label: 'リスニング課題2',
    task3Label: 'リスニング課題3',
    task4Label: 'リスニング課題4',
    participantTaskLabel: 'リスニング課題{number}',
    task1Detail: '3つの音が順番に再生されます。1番目または3番目だけが異なります。異なる音を選んでください。',
    task2Detail: '3つの音が順番に再生されます。1番目または3番目だけが異なります。異なる音を選んでください。',
    task3Detail: '3つの音が順番に再生されます。1番目または3番目だけが異なります。異なる音を選んでください。',
    task4Detail: '3つの音が順番に再生されます。1番目または3番目だけが異なります。異なる音を選んでください。',
    durationDifference: '持続時間差',
    f2Difference: 'F2差',
    f0Difference: 'F0差',
    riseTimeDifference: '立ち上がり時間差',
    thresholdLabel: '推定閾値（第{start}反転以降の平均）',
    thresholdValue: 'Level {level}（{measure}: {physical} {unit}）',
    taskStage: '課題 {current}/{total}｜{stage}',
    taskCount: '課題 {current}/{total}',
    taskNumber: '課題 {number}',
    instructionsStage: '説明',
    practiceStage: '練習',
    testStage: '本試行',
    taskModeHeading: '{task} — {mode}',
    practicePrompt: '明らかに異なる音が1つあります。1または3を選んでください。',
    testPrompt: '異なる音はどちらですか？ 1または3を選んでください。',
    practiceProgress: '{prefix}｜練習 {current}/{total}',
    playingAudio: '音を再生しています…',
    loadingAudio: '音声を読み込んでいます…',
    startMainAfterPractice: '練習後に本試行を開始（スペースキーも使用できます）',
    finishPracticeStatus: '{count}回の練習後、スペースキーまたは下のボタンで本試行を開始してください。',
    startPractice: '練習を開始',
    practiceInProgress: '練習中です（全{count}回）。再生後、1または3を選んでください。',
    practicePlaying: '練習 {current}/{total}：音を再生しています…',
    practiceChoose: '練習 {current}/{total}：1または3を選んでください。',
    audioError: '音声を読み込めませんでした。ネットワークとファイル配置を確認し、ページを再読み込みしてください。',
    completePracticeFirst: '本試行を開始する前に、{count}回の練習をすべて完了してください。',
    preparingMain: '本試行を準備しています…',
    selectOneOrThree: '1または3を選んでください。',
    practiceCorrect: '正解です。次の練習へ進みます。',
    practiceIncorrect: '正解は{answer}番でした。次の練習へ進みます。',
    practiceCompleteStatus: '練習が終了しました。スペースキーまたは下のボタンで本試行を開始してください。',
    startMainEnabled: '本試行を開始（スペースキー使用可）',
    practiceCompletedButton: '練習完了',
    pressSpaceToStart: 'スペースキーまたは下のボタンで本試行を開始してください。',
    preparingNextTrial: '次の試行を準備しています…',
    taskCompletedTitle: '{task}が終了しました',
    thresholdUnavailable: '採用できる反転点が不足しているため、推定閾値を計算できませんでした。',
    responsesRecorded: '課題が終了し、回答が記録されました。',
    allTasksFinishedParticipant: 'すべてのリスニング課題が終了しました。完了画面へ進んでください。',
    nextTaskHint: '次は「{task}」です。準備ができたら進んでください。',
    finishParticipantSession: 'セッションを終了',
    nextTask: '次の課題へ',
    participantCompletionOnly: '回答は記録されました。詳しい結果は研究者が確認できます。',
    participantDetailedCaution: '値が低いほど、この検査条件ではより小さな差を検出できたことを示します。これは実験上の推定値であり、診断や固定的な能力評価ではありません。',
    notAvailable: '算出不可',
    valid: 'あり',
    notValid: 'なし',
    stopReason_target_reversals: '規定反転数に到達',
    stopReason_max_trials: '最大試行数に到達',
    researcherMeta: '参加者 {id}｜実行ID {run}｜{protocol}｜完了課題数 {count}｜{status}',
    participantSetupDescription: '{count}件のリスニング課題が設定されています。研究者から指定された仮名化済みコードを入力すると、再現可能な実施順を作成します。',
    participantSetupDescriptionOne: '1件のリスニング課題が設定されています。研究者から指定された仮名化済みコードを入力すると、再現可能な実施順を作成します。',
    selectAtLeastOneTask: '少なくとも1つの課題を選択してください。',
    unavailableTaskSelection: '選択した研究プロファイルでは実施できない課題が含まれています。課題選択を確認してください。',
    taskUnavailableInProfile: '選択した研究プロファイルでは実施できません。'
  }
};

function isSupportedLanguage(language) {
  return SUPPORTED_LANGUAGES.includes(language);
}

function t(key, variables = {}) {
  const dictionary = isSupportedLanguage(currentLanguage) ? I18N[currentLanguage] : I18N.en;
  const template = dictionary[key] ?? I18N.en[key] ?? key;
  return String(template).replace(/\{(\w+)\}/g, (match, name) => (
    Object.prototype.hasOwnProperty.call(variables, name) ? variables[name] : match
  ));
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
    element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
  });
}

function renderDeploymentState() {
  const context = deploymentContext;
  if (elements.deploymentBanner) {
    const bannerKey = context?.localTest
      ? 'deployment.testBanner'
      : deploymentConfig?.environment === 'staging'
        ? 'deployment.stagingBanner'
        : '';
    elements.deploymentBanner.hidden = !bannerKey;
    elements.deploymentBanner.textContent = bannerKey ? t(bannerKey) : '';
  }
  const warningKey = context?.deploymentPreviewOnly
    ? 'deployment.previewOnly'
    : 'deployment.originBlocked';
  if (elements.deploymentOriginWarning) {
    elements.deploymentOriginWarning.hidden = Boolean(context?.supervisedSessionAllowed);
    elements.deploymentOriginWarning.textContent = t(warningKey);
  }
  if (elements.participantOriginWarning) {
    elements.participantOriginWarning.hidden = Boolean(context?.participantSessionAllowed);
    elements.participantOriginWarning.textContent = t(warningKey);
  }
  if (elements.lockSettings) elements.lockSettings.disabled = !context?.supervisedSessionAllowed;
  if (elements.createParticipantLink) {
    elements.createParticipantLink.disabled = !context?.participantLinkIssuanceAllowed;
  }
}

function renderBuildInfo() {
  if (!elements.buildInfo) return;
  elements.buildInfo.textContent = t('researcherSetup.build', {
    build: IMPLEMENTATION.appBuildId,
    buildSha: appBuildSha256 || t('notAvailable'),
    scriptSha: appScriptSha256 || t('notAvailable')
  });
  renderDeploymentState();
}

function setLanguage(language, { preserveParticipantLink = false } = {}) {
  if (!isSupportedLanguage(language)) return;
  currentLanguage = language;
  if (!preserveParticipantLink && configurationSource === 'researcher_ui') clearParticipantLink();
  applyStaticTranslations();
  renderDeploymentState();
  renderBuildInfo();
  elements.langEn.setAttribute('aria-pressed', String(language === 'en'));
  elements.langJa.setAttribute('aria-pressed', String(language === 'ja'));
  updateResearcherDescriptions();
  updateParticipantSetupCopy();
  if (researcherErrorKey) elements.researcherError.textContent = t(researcherErrorKey);
  if (elements.subjectId.getAttribute('aria-invalid') === 'true') {
    elements.subjectIdError.textContent = t('setup.subjectId.error');
  }
  if (studyMetadata.studyId) renderParticipantLanding();

  const activeSection = document.querySelector('.card.active');
  if (activeSection && activeSection.id === 'preflight') renderPreflightStatus();
  if (activeSection && activeSection.id === 'overview') renderOrderList();
  if (currentTask) {
    elements.taskTitle.textContent = taskDisplayLabel(currentTask);
    elements.taskDetail.textContent = taskDisplayDetail(currentTask);
    if (activeSection && activeSection.id === 'instructions') {
      elements.taskTag.textContent = t('taskStage', {
        current: currentTaskIndex + 1,
        total: taskOrder.length,
        stage: t('instructionsStage')
      });
      if (practiceState.completed) {
        elements.startPractice.textContent = t('practiceCompletedButton');
        elements.startTest.textContent = t('startMainEnabled');
        elements.practiceStatus.textContent = t('practiceCompleteStatus');
      }
    }
    if (activeSection && activeSection.id === 'trial') {
      elements.feedback.textContent = '';
      setSessionUi(trialState.mode === 'practice' ? 'practice' : 'test');
      if (responseWindowStart) {
        elements.playbackStatus.textContent = trialState.mode === 'practice'
          ? t('practiceChoose', { current: practiceState.currentTrial + 1, total: practiceConfig.trials })
          : t('selectOneOrThree');
      }
    }
    if (activeSection && activeSection.id === 'taskComplete') {
      const isLastTask = currentTaskIndex === taskOrder.length - 1;
      const nextTask = taskOrder[currentTaskIndex + 1];
      elements.completeTitle.textContent = t('taskCompletedTitle', { task: taskDisplayLabel(currentTask) });
      elements.taskCompleteHint.textContent = isLastTask
        ? t('allTasksFinishedParticipant')
        : t('nextTaskHint', { task: taskDisplayLabel(nextTask) });
      elements.nextTaskButton.textContent = isLastTask ? t('finishParticipantSession') : t('nextTask');
      renderTaskCompleteThreshold();
    }
  }
  if (activeSection && activeSection.id === 'complete') renderParticipantCompletion();
  if (activeSection && activeSection.id === 'researcherResults' && taskSummaries.length) renderResearcherResults();
  if (activeSection && activeSection.id === 'technicalError') {
    const storageError = technicalErrorCode === 'CHECKPOINT_WRITE_FAILED' || technicalErrorCode === 'CHECKPOINT_CONFLICT';
    const interrupted = ['VISIBILITY_INTERRUPTION', 'PARTICIPANT_STOP_CANCELLED'].includes(technicalErrorCode);
    const deleteError = technicalErrorCode === 'CHECKPOINT_DELETE_FAILED';
    elements.technicalErrorTitle.textContent = t(
      deleteError ? 'technicalError.deleteTitle' : storageError ? 'technicalError.storageTitle' : interrupted ? 'technicalError.interruptionTitle' : 'technicalError.title'
    );
    elements.technicalErrorIntro.textContent = t(
      deleteError ? 'technicalError.deleteIntro' : storageError ? 'technicalError.storageIntro' : interrupted ? 'technicalError.interruptionIntro' : 'technicalError.intro'
    );
    elements.retryAudio.textContent = t(deleteError ? 'technicalError.retryDelete' : 'technicalError.retry');
  }
}

const elements = {
  deploymentBlocked: document.getElementById('deploymentBlocked'),
  deploymentBlockedMessage: document.getElementById('deploymentBlockedMessage'),
  deploymentBanner: document.getElementById('deploymentBanner'),
  invalidLink: document.getElementById('invalidLink'),
  researcherSetup: document.getElementById('researcherSetup'),
  participantLanding: document.getElementById('participantLanding'),
  preflight: document.getElementById('preflight'),
  resumeSession: document.getElementById('resumeSession'),
  setup: document.getElementById('setup'),
  overview: document.getElementById('overview'),
  instructions: document.getElementById('instructions'),
  trial: document.getElementById('trial'),
  technicalError: document.getElementById('technicalError'),
  withdrawn: document.getElementById('withdrawn'),
  taskComplete: document.getElementById('taskComplete'),
  complete: document.getElementById('complete'),
  returned: document.getElementById('returned'),
  researcherResults: document.getElementById('researcherResults'),
  sessionControls: document.getElementById('sessionControls'),
  stopSession: document.getElementById('stopSession'),
  langEn: document.getElementById('langEn'),
  langJa: document.getElementById('langJa'),
  studyId: document.getElementById('studyId'),
  conditionId: document.getElementById('conditionId'),
  siteId: document.getElementById('siteId'),
  distributionId: document.getElementById('distributionId'),
  studyTitle: document.getElementById('studyTitle'),
  institutionName: document.getElementById('institutionName'),
  consentVersion: document.getElementById('consentVersion'),
  expectedMinutes: document.getElementById('expectedMinutes'),
  consentUrl: document.getElementById('consentUrl'),
  contactUrl: document.getElementById('contactUrl'),
  returnUrl: document.getElementById('returnUrl'),
  taskSelections: document.querySelectorAll('input[name="taskSelection"]'),
  protocolPreset: document.getElementById('protocolPreset'),
  protocolDescription: document.getElementById('protocolDescription'),
  feedbackMode: document.getElementById('feedbackMode'),
  feedbackDescription: document.getElementById('feedbackDescription'),
  researcherError: document.getElementById('researcherError'),
  buildInfo: document.getElementById('buildInfo'),
  deploymentOriginWarning: document.getElementById('deploymentOriginWarning'),
  lockSettings: document.getElementById('lockSettings'),
  createParticipantLink: document.getElementById('createParticipantLink'),
  participantLinkLanguage: document.getElementById('participantLinkLanguage'),
  participantLinkOutput: document.getElementById('participantLinkOutput'),
  participantLink: document.getElementById('participantLink'),
  copyParticipantLink: document.getElementById('copyParticipantLink'),
  openParticipantLink: document.getElementById('openParticipantLink'),
  participantLinkStatus: document.getElementById('participantLinkStatus'),
  participantLandingTitle: document.getElementById('participantLandingTitle'),
  participantInstitution: document.getElementById('participantInstitution'),
  participantStudyId: document.getElementById('participantStudyId'),
  participantConditionId: document.getElementById('participantConditionId'),
  participantSiteId: document.getElementById('participantSiteId'),
  participantExpectedMinutes: document.getElementById('participantExpectedMinutes'),
  participantConsentVersion: document.getElementById('participantConsentVersion'),
  participantConsentLink: document.getElementById('participantConsentLink'),
  participantContactLink: document.getElementById('participantContactLink'),
  remoteWorkflowNotice: document.getElementById('remoteWorkflowNotice'),
  remotePortalPreview: document.getElementById('remotePortalPreview'),
  landingReturnPortal: document.getElementById('landingReturnPortal'),
  participantOriginWarning: document.getElementById('participantOriginWarning'),
  consentConfirmed: document.getElementById('consentConfirmed'),
  landingError: document.getElementById('landingError'),
  continueToPreflight: document.getElementById('continueToPreflight'),
  preflightChecks: document.querySelectorAll('input[name="preflightCheck"]'),
  remoteExportCheck: document.getElementById('remoteExportCheck'),
  checkExport: document.getElementById('checkExport'),
  playTestSound: document.getElementById('playTestSound'),
  preflightStatus: document.getElementById('preflightStatus'),
  preflightError: document.getElementById('preflightError'),
  continueToCode: document.getElementById('continueToCode'),
  resumeDescription: document.getElementById('resumeDescription'),
  resumeParticipantCode: document.getElementById('resumeParticipantCode'),
  resumeCodeError: document.getElementById('resumeCodeError'),
  resumeSavedSession: document.getElementById('resumeSavedSession'),
  discardSavedSession: document.getElementById('discardSavedSession'),
  subjectId: document.getElementById('subjectId'),
  participantSetupDescription: document.getElementById('participantSetupDescription'),
  participantLinkNotice: document.getElementById('participantLinkNotice'),
  subjectIdError: document.getElementById('subjectIdError'),
  editSettings: document.getElementById('editSettings'),
  decideOrder: document.getElementById('decideOrder'),
  orderList: document.getElementById('orderList'),
  overviewParticipantCode: document.getElementById('overviewParticipantCode'),
  editParticipantCode: document.getElementById('editParticipantCode'),
  beginBattery: document.getElementById('beginBattery'),
  taskTag: document.getElementById('taskTag'),
  taskTitle: document.getElementById('taskTitle'),
  taskDetail: document.getElementById('taskDetail'),
  startPractice: document.getElementById('startPractice'),
  startTest: document.getElementById('startTest'),
  practiceStatus: document.getElementById('practiceStatus'),
  sessionTag: document.getElementById('sessionTag'),
  trialHeading: document.getElementById('trialHeading'),
  trialPrompt: document.getElementById('trialPrompt'),
  playbackStatus: document.getElementById('playbackStatus'),
  choose1: document.getElementById('choose1'),
  choose3: document.getElementById('choose3'),
  feedback: document.getElementById('feedback'),
  taskProgress: document.getElementById('taskProgress'),
  technicalErrorTitle: document.getElementById('technicalErrorTitle'),
  technicalErrorIntro: document.getElementById('technicalErrorIntro'),
  technicalErrorCode: document.getElementById('technicalErrorCode'),
  technicalErrorStatus: document.getElementById('technicalErrorStatus'),
  retryAudio: document.getElementById('retryAudio'),
  endTechnicalSession: document.getElementById('endTechnicalSession'),
  technicalContactLink: document.getElementById('technicalContactLink'),
  withdrawnContactLink: document.getElementById('withdrawnContactLink'),
  returnedContactLink: document.getElementById('returnedContactLink'),
  completeTitle: document.getElementById('completeTitle'),
  thresholdText: document.getElementById('thresholdText'),
  taskCompleteHint: document.getElementById('taskCompleteHint'),
  nextTaskButton: document.getElementById('nextTaskButton'),
  participantCompleteTitle: document.getElementById('participantCompleteTitle'),
  participantCompleteTag: document.getElementById('participantCompleteTag'),
  participantCompleteIntro: document.getElementById('participantCompleteIntro'),
  feedbackSummary: document.getElementById('feedbackSummary'),
  remoteReturnActions: document.getElementById('remoteReturnActions'),
  participantDownloadBundle: document.getElementById('participantDownloadBundle'),
  participantReturnPortal: document.getElementById('participantReturnPortal'),
  confirmReturnAndDelete: document.getElementById('confirmReturnAndDelete'),
  remoteSessionReference: document.getElementById('remoteSessionReference'),
  participantReturnStatus: document.getElementById('participantReturnStatus'),
  supervisedResultActions: document.getElementById('supervisedResultActions'),
  showResearcherResults: document.getElementById('showResearcherResults'),
  summaryList: document.getElementById('summaryList'),
  researcherMeta: document.getElementById('researcherMeta'),
  metricsTable: document.getElementById('metricsTable'),
  widePreview: document.getElementById('widePreview'),
  downloadBundle: document.getElementById('downloadBundle'),
  downloadCsv: document.getElementById('downloadCsv'),
  downloadWideCsv: document.getElementById('downloadWideCsv'),
  nextParticipant: document.getElementById('nextParticipant'),
  exportStatus: document.getElementById('exportStatus')
};

let subjectId = '';
let taskOrder = [];
let currentTaskIndex = 0;
let currentTask = null;
let stimOrder = [];
let responseWindowStart = null;
let trialState = {};
let audioPool = [];
let baseAudioA = null;
let baseAudioB = null;
let warmupPromise = null;
let state = createState();
let practiceState = createPracticeState();
let awaitingTestStart = false;
let settingsLocked = false;
let sessionCompletedAt = '';
let sessionLanguageAtStart = '';
let sessionLanguageAtCompletion = '';
let sessionDefinition = null;
let currentLanguage = 'en';
let sessionRunId = '';
let configurationSource = 'researcher_ui';
let participantLinkSchemaVersion = '';
let participantLinkValidationStatus = 'not_applicable';
let participantLinkConfig = '';
let configuredInitialLanguage = 'en';
let researcherErrorKey = '';
let administrationMode = 'supervised';
let studyMetadata = Object.freeze({});
let sessionStatus = 'not_started';
let sessionStartedAt = '';
let sessionEndedAt = '';
let sessionPhase = 'not_started';
let statusReason = '';
let technicalErrorCode = '';
let lastFailedTrialMode = '';
let preflightAudioPassed = false;
let preflightAudio = null;
let preflightTestState = 'not_tested';
let preflightGeneration = 0;
let preflightAbortController = null;
let playbackAbortController = null;
let resultsBundleDownloaded = false;
let pendingCheckpoint = null;
let checkpointRevision = 0;
let checkpointOwner = '';
let checkpointTakeover = null;
let pendingDeletionAction = null;
let activePresentation = null;
let resumeCount = 0;
let interruptedPresentationCount = 0;
let replayedInterruptedPresentation = false;
let runGeneration = 0;
let appScriptSha256 = '';
let appBuildSha256 = '';
let appAssetSha256 = Object.freeze({});
let deploymentConfig = null;
let deploymentContext = null;
let deploymentConfigSha256 = '';
let deploymentConfigError = '';
let buildIdentityPromise = Promise.resolve(false);
let sessionScriptSha256 = '';
let sessionBuildSha256 = '';
let sessionDeploymentConfigSha256 = '';
let sessionType = '';
let taskStartedAt = '';
let taskCompletedAt = '';
let consentConfirmedAt = '';
let preflightCompletedAt = '';
let visibilityInterruptionCount = 0;
const researcherSettings = {
  selectedTaskIds: TASKS.map(task => task.id),
  protocolId: 'kachlicka2019',
  feedbackMode: 'practice_only'
};
const currentResults = [];
const allResults = [];
const taskSummaries = [];

function createState(startingStep = config.startingStep) {
  return {
    currentStep: startingStep,
    currentTrial: 0,
    numReversals: 0,
    lastDirection: 0,
    correctStreak: 0,
    hasIncorrectResponse: false,
    reversalLevels: []
  };
}

function createPracticeState() {
  return {
    currentTrial: 0,
    order: [],
    completed: false,
    correctCount: 0
  };
}

function normalizedPathname() {
  const path = window.location.pathname.replace(/\/+/g, '/');
  return path.endsWith('/') ? path : path.slice(0, path.lastIndexOf('/') + 1);
}

function checkpointKey() {
  return `${CHECKPOINT_KEY_PREFIX}${encodeURIComponent(normalizedPathname())}`;
}

function checkpointDeletionBarrierKey() {
  return `${checkpointKey()}:deletion-barrier`;
}

function readCheckpointDeletionBarrier() {
  try {
    const value = Number(localStorage.getItem(checkpointDeletionBarrierKey()) || 0);
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch (error) {
    return 0;
  }
}

function sessionAuthorizationAllowed(source = configurationSource) {
  if (!deploymentConfig || !deploymentContext || !sessionType) return false;
  if (source === 'participant_link') return deploymentContext.participantSessionAllowed;
  return deploymentContext.supervisedSessionAllowed;
}

function assertSessionAuthorization(source = configurationSource) {
  if (!sessionAuthorizationAllowed(source)) throw new Error('Deployment origin is not authorized.');
  const expectedType = deploymentContext.localTest ? 'test' : 'research';
  if (sessionType !== expectedType) throw new Error('Session type does not match deployment context.');
}

function normalizeHttpsUrl(value, { required = true } = {}) {
  const raw = String(value || '').trim();
  if (!raw && !required) return '';
  if (raw.length > MAX_STUDY_URL_LENGTH || DISPLAY_CONTROL_CHARACTER_PATTERN.test(raw)) {
    throw new Error('Invalid HTTPS URL.');
  }
  const url = new URL(raw);
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('Invalid HTTPS URL.');
  }
  const normalized = url.toString();
  if (normalized.length > MAX_STUDY_URL_LENGTH) throw new Error('Invalid HTTPS URL.');
  return normalized;
}

function validateStudyMetadata(metadata, { requireReturnUrl = false } = {}) {
  const expectedMinutes = Number(metadata.expectedMinutes);
  if (
    !STUDY_CODE_PATTERN.test(String(metadata.studyId || '')) ||
    !STUDY_CODE_PATTERN.test(String(metadata.conditionId || '')) ||
    !STUDY_CODE_PATTERN.test(String(metadata.siteId || '')) ||
    !STUDY_CODE_PATTERN.test(String(metadata.distributionId || '')) ||
    !VERSION_CODE_PATTERN.test(String(metadata.consentVersion || '')) ||
    !String(metadata.studyTitle || '').trim() || String(metadata.studyTitle).length > 120 ||
    DISPLAY_CONTROL_CHARACTER_PATTERN.test(String(metadata.studyTitle || '')) ||
    !String(metadata.institutionName || '').trim() || String(metadata.institutionName).length > 120 ||
    DISPLAY_CONTROL_CHARACTER_PATTERN.test(String(metadata.institutionName || '')) ||
    !Number.isInteger(expectedMinutes) || expectedMinutes < 1 || expectedMinutes > 240
  ) {
    throw new Error('Invalid study metadata.');
  }
  const returnUrl = normalizeHttpsUrl(metadata.returnUrl, { required: requireReturnUrl });
  if (returnUrl && (
    !deploymentConfig || !globalThis.DeploymentPolicy ||
    !DeploymentPolicy.returnUrlOriginAllowed(deploymentConfig, returnUrl)
  )) {
    throw new Error('Return URL origin is not allowed.');
  }
  return Object.freeze({
    studyId: String(metadata.studyId).trim(),
    conditionId: String(metadata.conditionId).trim(),
    siteId: String(metadata.siteId).trim(),
    distributionId: String(metadata.distributionId).trim(),
    studyTitle: String(metadata.studyTitle).trim(),
    institutionName: String(metadata.institutionName).trim(),
    consentVersion: String(metadata.consentVersion).trim(),
    expectedMinutes,
    consentUrl: normalizeHttpsUrl(metadata.consentUrl),
    contactUrl: normalizeHttpsUrl(metadata.contactUrl),
    returnUrl
  });
}

function getStudyMetadataFromForm({ requireReturnUrl = false } = {}) {
  return validateStudyMetadata({
    studyId: elements.studyId.value,
    conditionId: elements.conditionId.value,
    siteId: elements.siteId.value,
    distributionId: elements.distributionId.value,
    studyTitle: elements.studyTitle.value,
    institutionName: elements.institutionName.value,
    consentVersion: elements.consentVersion.value,
    expectedMinutes: elements.expectedMinutes.valueAsNumber,
    consentUrl: elements.consentUrl.value,
    contactUrl: elements.contactUrl.value,
    returnUrl: elements.returnUrl.value
  }, { requireReturnUrl });
}

function renderParticipantLanding() {
  elements.participantLandingTitle.textContent = studyMetadata.studyTitle;
  elements.participantInstitution.textContent = studyMetadata.institutionName;
  elements.participantStudyId.textContent = studyMetadata.studyId;
  elements.participantConditionId.textContent = studyMetadata.conditionId;
  elements.participantSiteId.textContent = studyMetadata.siteId;
  elements.participantExpectedMinutes.textContent = t('landing.durationValue', {
    minutes: studyMetadata.expectedMinutes
  });
  elements.participantConsentVersion.textContent = studyMetadata.consentVersion;
  [elements.participantConsentLink].forEach(link => { link.href = studyMetadata.consentUrl; });
  [elements.participantContactLink, elements.technicalContactLink, elements.withdrawnContactLink,
    elements.returnedContactLink]
    .forEach(link => { link.href = studyMetadata.contactUrl; });
  elements.participantReturnPortal.href = studyMetadata.returnUrl || '#';
  elements.landingReturnPortal.href = studyMetadata.returnUrl || '#';
  const remote = administrationMode === 'remote_manual_upload';
  elements.remoteWorkflowNotice.hidden = !remote;
  elements.remotePortalPreview.hidden = !remote;
  elements.remoteExportCheck.hidden = !remote;
  elements.checkExport.disabled = !remote;
  renderDeploymentState();
}

function checkpointSettings() {
  const stimulusSet = getActiveStimulusSet();
  return {
    protocol_id: config.id,
    protocol_version: config.version,
    selected_task_ids: researcherSettings.selectedTaskIds.slice(),
    feedback_mode: researcherSettings.feedbackMode,
    session_type: sessionType,
    deployment_id: deploymentConfig?.deploymentId || '',
    deployment_config_sha256: deploymentConfigSha256,
    catalog_sha256: STIMULUS_CATALOG.sha256,
    stimulus_set_id: stimulusSet.id,
    manifest_sha256: stimulusSet.manifestSha256
  };
}

function serializeTaskSummaries() {
  return taskSummaries.map(summary => ({
    task_id: summary.task.id,
    order: summary.order,
    threshold: summary.threshold,
    thresholdPhysical: summary.thresholdPhysical,
    thresholdFileIndex: summary.thresholdFileIndex,
    trialsCompleted: summary.trialsCompleted,
    reversalsCompleted: summary.reversalsCompleted,
    scoredReversalLevels: summary.scoredReversalLevels.slice(),
    terminationReason: summary.terminationReason,
    thresholdAvailable: summary.thresholdAvailable,
    practiceCorrect: summary.practiceCorrect,
    stimulusSubstitutionCount: summary.stimulusSubstitutionCount,
    medianRtMs: summary.medianRtMs,
    startedAtUtc: summary.startedAtUtc || '',
    completedAtUtc: summary.completedAtUtc || ''
  }));
}

function compactCheckpointRow(row) {
  const compact = { ...row };
  ['consent_url', 'contact_url', 'return_url', 'participant_link_config', 'app_url']
    .forEach(key => { delete compact[key]; });
  return compact;
}

function expandCheckpointRow(row) {
  return {
    ...row,
    consent_url: studyMetadata.consentUrl,
    contact_url: studyMetadata.contactUrl,
    return_url: studyMetadata.returnUrl,
    participant_link_config: participantLinkConfig,
    app_url: window.location.href.split('#')[0]
  };
}

function checkpointSnapshot(phase = sessionPhase, presentation = activePresentation) {
  return {
    checkpoint_schema_version: IMPLEMENTATION.checkpointSchemaVersion,
    battery_version: IMPLEMENTATION.batteryVersion,
    session_type: sessionType,
    deployment_id: deploymentConfig?.deploymentId || '',
    deployment_environment: deploymentConfig?.environment || '',
    deployment_config_sha256: sessionDeploymentConfigSha256,
    app_origin: window.location.origin,
    saved_at_utc: new Date().toISOString(),
    revision: checkpointRevision + 1,
    owner: checkpointOwner,
    session_status: sessionStatus,
    phase,
    status_reason: statusReason,
    session_started_at_utc: sessionStartedAt,
    session_ended_at_utc: sessionEndedAt,
    resume_count: resumeCount,
    interrupted_presentation_count: interruptedPresentationCount,
    visibility_interruption_count: visibilityInterruptionCount,
    active_presentation: presentation,
    subject_id: subjectId,
    session_run_id: sessionRunId,
    current_language: currentLanguage,
    session_language_at_start: sessionLanguageAtStart,
    session_language_at_completion: sessionLanguageAtCompletion,
    session_completed_at: sessionCompletedAt,
    configuration_source: configurationSource,
    administration_mode: administrationMode,
    participant_link_schema_version: participantLinkSchemaVersion,
    participant_link_validation_status: participantLinkValidationStatus,
    participant_link_config: participantLinkConfig,
    configured_initial_language: configuredInitialLanguage,
    app_script_sha256: sessionScriptSha256,
    app_build_sha256: sessionBuildSha256,
    study_metadata: { ...studyMetadata },
    consent_confirmed_at_utc: consentConfirmedAt,
    preflight_completed_at_utc: preflightCompletedAt,
    preflight_audio_passed: preflightAudioPassed,
    settings: checkpointSettings(),
    task_order_ids: taskOrder.map(task => task.id),
    current_task_index: currentTaskIndex,
    current_task_id: currentTask ? currentTask.id : '',
    task_started_at_utc: taskStartedAt,
    task_completed_at_utc: taskCompletedAt,
    staircase_state: { ...state, reversalLevels: state.reversalLevels.slice() },
    practice_state: { ...practiceState, order: practiceState.order.slice() },
    stimulus_order: stimOrder.slice(),
    current_results: phase === 'task_complete' || phase === 'complete'
      ? []
      : currentResults.map(compactCheckpointRow),
    all_results: allResults.map(compactCheckpointRow),
    task_summaries: serializeTaskSummaries()
  };
}

function saveCheckpoint(phase = sessionPhase, presentation = activePresentation) {
  if (!sessionRunId || !sessionDefinition) return true;
  const deletionBarrier = readCheckpointDeletionBarrier();
  if (SessionSafety.deletionBarrierBlocks(sessionStartedAt, deletionBarrier)) {
    throw new Error('Checkpoint deleted.');
  }
  const existingRaw = localStorage.getItem(checkpointKey());
  if (existingRaw) {
    const existing = JSON.parse(existingRaw);
    if (!SessionSafety.checkpointWriteAllowed(existing, {
      sessionRunId,
      owner: checkpointOwner,
      revision: checkpointRevision,
      takeover: checkpointTakeover
    })) {
      throw new Error('Checkpoint conflict.');
    }
  }
  const snapshot = checkpointSnapshot(phase, presentation);
  localStorage.setItem(checkpointKey(), JSON.stringify(snapshot));
  const stored = localStorage.getItem(checkpointKey());
  if (!stored) throw new Error('Checkpoint verification failed.');
  const verified = JSON.parse(stored);
  if (
    verified.session_run_id !== snapshot.session_run_id ||
    verified.owner !== snapshot.owner ||
    Number(verified.revision || 0) !== snapshot.revision
  ) throw new Error('Checkpoint verification failed.');
  const barrierAfterWrite = readCheckpointDeletionBarrier();
  if (SessionSafety.deletionBarrierBlocks(sessionStartedAt, barrierAfterWrite)) {
    const staleRaw = localStorage.getItem(checkpointKey());
    if (staleRaw) {
      const stale = JSON.parse(staleRaw);
      if (
        stale.session_run_id === snapshot.session_run_id &&
        stale.owner === snapshot.owner &&
        Number(stale.revision || 0) === snapshot.revision
      ) localStorage.removeItem(checkpointKey());
    }
    throw new Error('Checkpoint deleted.');
  }
  checkpointTakeover = null;
  checkpointRevision = snapshot.revision;
  sessionPhase = phase;
  activePresentation = presentation;
  return true;
}

function probeCheckpointStorage() {
  const key = `${checkpointKey()}:probe`;
  try {
    localStorage.setItem(key, '1');
    const ok = localStorage.getItem(key) === '1';
    localStorage.removeItem(key);
    return ok;
  } catch (error) {
    return false;
  }
}

function deleteCheckpoint(
  expectedSessionRunId = sessionRunId || pendingCheckpoint?.session_run_id || '',
  expectedRaw = pendingCheckpoint?.corrupt ? pendingCheckpoint.raw_checkpoint || '' : ''
) {
  try {
    const existingRaw = localStorage.getItem(checkpointKey());
    if (existingRaw) {
      if (expectedRaw) {
        if (existingRaw !== expectedRaw) return false;
      } else {
        const existing = JSON.parse(existingRaw);
        if (!SessionSafety.checkpointDeleteAllowed(existing, expectedSessionRunId)) return false;
      }
    }
    const previousBarrier = readCheckpointDeletionBarrier();
    const barrier = Math.max(Date.now(), previousBarrier + 1);
    localStorage.setItem(checkpointDeletionBarrierKey(), String(barrier));
    if (Number(localStorage.getItem(checkpointDeletionBarrierKey())) !== barrier) return false;
    const beforeRemoveRaw = localStorage.getItem(checkpointKey());
    if (beforeRemoveRaw) {
      if (expectedRaw) {
        if (beforeRemoveRaw !== expectedRaw) return false;
      } else {
        const beforeRemove = JSON.parse(beforeRemoveRaw);
        if (!SessionSafety.checkpointDeleteAllowed(beforeRemove, expectedSessionRunId)) return false;
      }
    }
    localStorage.removeItem(checkpointKey());
    if (localStorage.getItem(checkpointKey()) !== null) return false;
    pendingCheckpoint = null;
    checkpointRevision = 0;
    checkpointTakeover = null;
    return true;
  } catch (error) {
    console.error('Checkpoint deletion failed:', error);
    return false;
  }
}

function readCheckpoint() {
  let raw = '';
  try {
    raw = localStorage.getItem(checkpointKey());
    if (!raw) return null;
    const snapshot = JSON.parse(raw);
    if (!snapshot || snapshot.checkpoint_schema_version !== IMPLEMENTATION.checkpointSchemaVersion) {
      return { corrupt: true, raw_checkpoint: raw };
    }
    return snapshot;
  } catch (error) {
    return raw ? { corrupt: true, raw_checkpoint: raw } : null;
  }
}

function fileStepToLevel(fileStep) {
  return fileStep - 1;
}

function levelToPhysical(level, task = currentTask) {
  return level * task.levelSize;
}

function taskDisplayLabel(task) {
  const orderIndex = taskOrder.findIndex(item => item.id === task.id);
  return orderIndex >= 0
    ? t('participantTaskLabel', { number: orderIndex + 1 })
    : t(task.displayLabelKey);
}

function taskDisplayDetail(task) {
  return t(task.displayDetailKey);
}

function taskIsInSourceMainStudy(taskId) {
  return config.mainStudyTaskIds.includes(taskId);
}

function taskStimulusCompatibility(taskId) {
  return config.stimulusCompatibilityByTask[taskId] || 'not_assessed';
}

function getStimulusSetForProtocol(protocol) {
  const catalogSetId = STIMULUS_CATALOG.bindings[protocol.id];
  if (!catalogSetId || protocol.stimulusSetId !== catalogSetId) {
    throw new Error(`Invalid protocol/stimulus binding for ${protocol.id}.`);
  }
  const stimulusSet = STIMULUS_SETS[catalogSetId];
  if (
    !stimulusSet ||
    stimulusSet.id !== catalogSetId ||
    stimulusSet.targetProtocolId !== protocol.id ||
    stimulusSet.validationStatus !== 'passed'
  ) {
    throw new Error(`Stimulus set ${catalogSetId} is unavailable or unvalidated.`);
  }
  return stimulusSet;
}

function getActiveStimulusSet() {
  if (!sessionDefinition || !sessionDefinition.stimulusSet) {
    throw new Error('No stimulus set is locked for this session.');
  }
  return sessionDefinition.stimulusSet;
}

function getStimulusTaskSpec(task, stimulusSet = getActiveStimulusSet()) {
  const taskId = typeof task === 'string' ? task : task.id;
  const taskSpec = stimulusSet.tasks[taskId];
  if (!taskSpec) {
    throw new Error(`Task ${taskId} is not available in stimulus set ${stimulusSet.id}.`);
  }
  return taskSpec;
}

function stimulusProvenance(task = null) {
  const stimulusSet = getActiveStimulusSet();
  const provenance = {
    protocol_stimulus_binding_id: sessionDefinition.bindingId,
    stimulus_catalog: STIMULUS_CATALOG.file,
    stimulus_catalog_schema_version: STIMULUS_CATALOG.schemaVersion,
    stimulus_catalog_sha256: STIMULUS_CATALOG.sha256,
    stimulus_set_id: stimulusSet.id,
    stimulus_set_version: stimulusSet.version,
    stimulus_set_kind: stimulusSet.kind,
    stimulus_claim: stimulusSet.claim,
    stimulus_parameter_profile_id: stimulusSet.parameterProfileId,
    stimulus_manifest: stimulusSet.manifest,
    stimulus_manifest_sha256: stimulusSet.manifestSha256,
    stimulus_set_sha256: stimulusSet.aggregateSha256,
    stimulus_source_citation: stimulusSet.targetCitation,
    stimulus_source_locator: stimulusSet.targetSourceLocator,
    stimulus_parent_set_id: stimulusSet.parentStimulusSetId,
    stimulus_parent_manifest: stimulusSet.parentManifest,
    stimulus_parent_set_sha256: stimulusSet.parentAggregateSha256,
    stimulus_parent_source_locator: stimulusSet.parentSourceLocator,
    stimulus_source_archive_sha256: '',
    stimulus_parent_source_archive_sha256: stimulusSet.parentSourceArchiveSha256,
    stimulus_provenance_verification: 'catalog_binding_and_manifest_validation_passed',
    stimulus_validation_status: stimulusSet.validationStatus,
    stimulus_audit_date: stimulusSet.auditDate,
    stimulus_generator: stimulusSet.generatorApplication,
    stimulus_generator_version: stimulusSet.generatorVersion,
    stimulus_generator_script: stimulusSet.generatorScript,
    stimulus_generator_script_sha256: stimulusSet.generatorScriptSha256,
    stimulus_parameters_file: `${stimulusSet.root}/${stimulusSet.parametersFile}`,
    stimulus_parameters_sha256: stimulusSet.parametersSha256,
    stimulus_license: stimulusSet.license,
    stimulus_license_note: stimulusSet.licenseNote,
    stimulus_standard_file_index: practiceConfig.baseStep
  };
  if (!task) return provenance;
  const taskSpec = getStimulusTaskSpec(task, stimulusSet);
  return {
    ...provenance,
    stimulus_task_sha256: taskSpec.taskSha256,
    stimulus_task_transformation: taskSpec.transformation
  };
}

function getScoredReversalLevels() {
  return state.reversalLevels.slice(config.firstScoredReversal - 1);
}

function getThreshold() {
  const scoredLevels = getScoredReversalLevels();
  if (!scoredLevels.length) return null;
  return scoredLevels.reduce((sum, level) => sum + level, 0) / scoredLevels.length;
}

function getThresholdLabel() {
  return t('thresholdLabel', { start: config.firstScoredReversal });
}

function formatThreshold(level, task = currentTask) {
  const physicalValue = levelToPhysical(level, task);
  return t('thresholdValue', {
    level: level.toFixed(2),
    measure: t(task.thresholdMeasureKey),
    physical: physicalValue.toFixed(2),
    unit: task.thresholdUnit
  });
}

function getAudioForStep(step) {
  const audio = Number.isInteger(step) && step >= 1 && step <= config.numSteps
    ? audioPool[step]
    : null;
  return { audio, step, substituted: false, requestedStep: step };
}

function initAudioPool(task) {
  const pool = [null];
  for (let i = 1; i <= config.numSteps; i++) {
    pool.push(createAudio(stimulusUrl(task, i)));
  }
  return pool;
}

function stimulusUrl(task, fileIndex) {
  const stimulusSet = getActiveStimulusSet();
  const taskSpec = getStimulusTaskSpec(task, stimulusSet);
  if (!Number.isInteger(fileIndex) || fileIndex < 1 || fileIndex > taskSpec.fileCount) {
    throw new Error(`Invalid stimulus file index ${fileIndex} for ${task.id}.`);
  }
  const root = stimulusSet.root === '.' ? '' : `${stimulusSet.root}/`;
  return `./${root}${taskSpec.folder}/Stimuli/${fileIndex}.flac`;
}

function createAudio(src) {
  const audio = new Audio();
  audio.preload = 'none';
  audio.src = src;
  return audio;
}

function resetAudio(audio) {
  audio.pause();
  audio.currentTime = 0;
}

function cancelPlayback() {
  if (playbackAbortController) playbackAbortController.abort();
  playbackAbortController = null;
  [baseAudioA, baseAudioB, ...audioPool].filter(Boolean).forEach(audio => {
    try { resetAudio(audio); } catch (error) { /* no-op */ }
  });
}

function cancelPreflightPlayback() {
  preflightGeneration += 1;
  if (preflightAbortController) preflightAbortController.abort();
  preflightAbortController = null;
  if (preflightAudio) {
    try { resetAudio(preflightAudio); } catch (error) { /* no-op */ }
  }
  preflightAudio = null;
}

function waitForAudioReady(audio, signal = null) {
  // Ready when we have future data (3) and a usable duration
  const hasData = () => audio.readyState >= 3 && Number.isFinite(audio.duration) && audio.duration > 0;
  if (hasData() || signal?.aborted) return Promise.resolve();

  return new Promise(resolve => {
    let timer = null;
    const cleanup = () => {
      if (timer !== null) clearTimeout(timer);
      audio.removeEventListener('canplaythrough', cleanup);
      audio.removeEventListener('loadeddata', cleanup);
      audio.removeEventListener('error', cleanup);
      if (signal) signal.removeEventListener('abort', cleanup);
      resolve();
    };
    timer = setTimeout(cleanup, 5000);
    audio.addEventListener('canplaythrough', cleanup, { once: true });
    audio.addEventListener('loadeddata', cleanup, { once: true });
    audio.addEventListener('error', cleanup, { once: true });
    if (signal) signal.addEventListener('abort', cleanup, { once: true });
    try {
      audio.load();
    } catch (e) {
      cleanup();
    }
  });
}

function warmUpTaskAudio() {
  const stepsToWarm = new Set([1, config.startingStep, practiceConfig.baseStep, practiceConfig.differentStep]);
  const targets = new Set([baseAudioA, baseAudioB]);
  stepsToWarm.forEach(step => {
    const { audio } = getAudioForStep(step);
    if (audio) targets.add(audio);
  });
  return Promise.all(Array.from(targets).map(a => waitForAudioReady(a).catch(() => {})));
}

function showSection(section) {
  [
    elements.deploymentBlocked,
    elements.invalidLink,
    elements.researcherSetup,
    elements.participantLanding,
    elements.preflight,
    elements.resumeSession,
    elements.setup,
    elements.overview,
    elements.instructions,
    elements.trial,
    elements.technicalError,
    elements.withdrawn,
    elements.taskComplete,
    elements.complete,
    elements.returned,
    elements.researcherResults
  ].filter(Boolean).forEach(el => el.classList.remove('active'));
  const target = elements[section];
  if (!target) throw new Error(`Unknown section: ${section}`);
  target.classList.add('active');
  const terminalSections = new Set([
    'deploymentBlocked', 'invalidLink', 'researcherSetup', 'withdrawn', 'returned', 'researcherResults'
  ]);
  elements.sessionControls.hidden = terminalSections.has(section) || !settingsLocked;
  target.scrollIntoView({ block: 'start' });
  if (typeof target.focus === 'function') target.focus({ preventScroll: true });
}

function seededRandom(seedStr) {
  let seed = 0;
  const normalized = seedStr.trim().toLowerCase();
  for (let i = 0; i < normalized.length; i++) {
    seed = (seed * 31 + normalized.charCodeAt(i) + i) >>> 0;
  }
  if (seed === 0) seed = 1234567;
  return () => {
    // xorshift32
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return ((seed >>> 0) % 0x100000000) / 0x100000000;
  };
}

function seededShuffle(array, seedStr) {
  const rand = seededRandom(seedStr || 'default');
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderOrderList() {
  elements.orderList.innerHTML = '';
  taskOrder.forEach((task, index) => {
    const li = document.createElement('li');
    li.textContent = taskDisplayLabel(task);
    elements.orderList.appendChild(li);
  });
}

function resetPracticeProgress() {
  practiceState = createPracticeState();
  elements.startTest.disabled = true;
  elements.startTest.textContent = t('startMainAfterPractice');
  elements.practiceStatus.textContent = t('finishPracticeStatus', { count: practiceConfig.trials });
  elements.startPractice.disabled = false;
  elements.startPractice.textContent = t('startPractice');
  awaitingTestStart = false;
}

function resetTaskState() {
  state = createState();
  currentResults.length = 0;
  stimOrder = [];
  trialState = {};
  responseWindowStart = null;
}

function prepareTask(task, { preserveState = false, writeCheckpoint = true } = {}) {
  runGeneration += 1;
  const generation = runGeneration;
  [baseAudioA, baseAudioB, ...audioPool].filter(Boolean).forEach(audio => {
    try { resetAudio(audio); } catch (error) { /* no-op */ }
  });
  currentTask = task;
  if (!preserveState) {
    resetTaskState();
    resetPracticeProgress();
    taskStartedAt = new Date().toISOString();
    taskCompletedAt = '';
  }
  audioPool = initAudioPool(task);
  baseAudioA = createAudio(stimulusUrl(task, practiceConfig.baseStep));
  baseAudioB = createAudio(stimulusUrl(task, practiceConfig.baseStep));
  elements.startPractice.disabled = true;
  elements.practiceStatus.textContent = t('loadingAudio');
  warmupPromise = warmUpTaskAudio();
  warmupPromise.finally(() => {
    if (generation !== runGeneration || sessionPhase !== 'instructions') return;
    elements.startPractice.disabled = false;
    if (!practiceState.completed) {
      elements.practiceStatus.textContent = t('finishPracticeStatus', { count: practiceConfig.trials });
    }
  });
  elements.taskTag.textContent = t('taskStage', { current: currentTaskIndex + 1, total: taskOrder.length, stage: t('instructionsStage') });
  elements.taskTitle.textContent = taskDisplayLabel(task);
  elements.taskDetail.textContent = taskDisplayDetail(task);
  elements.feedback.textContent = '';
  elements.feedback.classList.remove('correct', 'incorrect');
  if (writeCheckpoint && !commitCheckpoint('instructions', null)) return false;
  showSection('instructions');
  return true;
}

function setSessionUi(mode) {
  const prefix = t('taskCount', { current: currentTaskIndex + 1, total: taskOrder.length });
  if (mode === 'practice') {
    elements.sessionTag.textContent = `${prefix} | ${t('practiceStage')}`;
    elements.trialHeading.textContent = t('taskModeHeading', { task: taskDisplayLabel(currentTask), mode: t('practiceStage') });
    elements.trialPrompt.textContent = t('practicePrompt');
    elements.taskProgress.style.display = 'inline-flex';
    elements.taskProgress.textContent = t('practiceProgress', {
      prefix,
      current: practiceState.currentTrial + 1,
      total: practiceConfig.trials
    });
  } else {
    elements.sessionTag.textContent = `${prefix} | ${t('testStage')}`;
    elements.trialHeading.textContent = t('taskModeHeading', { task: taskDisplayLabel(currentTask), mode: t('testStage') });
    elements.trialPrompt.textContent = t('testPrompt');
    elements.taskProgress.style.display = 'none';
    elements.taskProgress.textContent = '';
  }
  elements.playbackStatus.textContent = t('playingAudio');
}

function clearFeedback() {
  elements.feedback.textContent = '';
  elements.feedback.classList.remove('correct', 'incorrect');
}

function setFeedback(message, wasCorrect) {
  elements.feedback.textContent = message;
  elements.feedback.classList.remove('correct', 'incorrect');
  elements.feedback.classList.add(wasCorrect ? 'correct' : 'incorrect');
}

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildStimOrder() {
  const arr = [];
  for (let i = 0; i < Math.floor(config.maxTrials / 2); i++) arr.push(0);
  for (let i = Math.floor(config.maxTrials / 2); i < config.maxTrials; i++) arr.push(1);
  return shuffle(arr);
}

function buildPracticeOrder(numTrials) {
  const arr = [];
  for (let i = 0; i < numTrials; i++) {
    arr.push(Math.random() < 0.5 ? 0 : 1);
  }
  return arr;
}

function toggleResponseButtons(enabled) {
  elements.choose1.disabled = !enabled;
  elements.choose3.disabled = !enabled;
}

function wait(ms, signal = null) {
  return new Promise(resolve => {
    if (signal?.aborted) {
      resolve(false);
      return;
    }
    let timer = null;
    const finish = completed => {
      if (timer !== null) clearTimeout(timer);
      if (signal) signal.removeEventListener('abort', onAbort);
      resolve(completed);
    };
    const onAbort = () => finish(false);
    timer = setTimeout(() => finish(true), ms);
    if (signal) signal.addEventListener('abort', onAbort, { once: true });
  });
}

async function playAndWait(audio, signal = null) {
  if (!audio) return true; // treat missing audio as error
  await waitForAudioReady(audio, signal);
  if (signal?.aborted) return true;
  if (
    audio.error ||
    audio.readyState < 2 ||
    !Number.isFinite(audio.duration) ||
    audio.duration <= 0
  ) return true;
  resetAudio(audio);
  return new Promise(resolve => {
    let done = false;
    let hadError = false;
    let fallbackTimer = null;
    const finish = () => {
      if (done) return;
      done = true;
      if (fallbackTimer !== null) clearTimeout(fallbackTimer);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      if (signal) signal.removeEventListener('abort', onAbort);
      resolve(hadError);
    };
    const onEnded = () => finish();
    const onError = () => {
      hadError = true;
      finish();
    };
    const onAbort = () => {
      hadError = true;
      try { resetAudio(audio); } catch (error) { /* no-op */ }
      finish();
    };
    audio.addEventListener('ended', onEnded, { once: true });
    audio.addEventListener('error', onError, { once: true });
    if (signal) signal.addEventListener('abort', onAbort, { once: true });
    const fallbackMs = Number.isFinite(audio.duration) && audio.duration > 0
      ? Math.round(audio.duration * 1000) + Math.max(1500, Math.round(audio.duration * 500))
      : 4000;
    fallbackTimer = setTimeout(() => {
      hadError = true;
      finish();
    }, fallbackMs);
    audio.play().catch(() => {
      hadError = true;
      finish();
    });
  });
}

async function playSequence(first, second, third, signal, generation) {
  const cancelled = () => signal?.aborted || generation !== runGeneration || document.visibilityState !== 'visible';
  if (cancelled()) return true;
  const e1 = await playAndWait(first, signal);
  if (e1 || cancelled() || !await wait(config.interStimulusDelay, signal)) return true;
  const e2 = await playAndWait(second, signal);
  if (e2 || cancelled() || !await wait(config.interStimulusDelay, signal)) return true;
  const e3 = await playAndWait(third, signal);
  if (e3 || cancelled() || !await wait(config.postSequenceDelay, signal)) return true;
  return false;
}

function commitCheckpoint(phase, presentation = activePresentation) {
  try {
    return saveCheckpoint(phase, presentation);
  } catch (error) {
    console.error('Checkpoint write failed:', error);
    if (error.message === 'Checkpoint deleted.') {
      handleObservedCheckpointDeletion();
      return false;
    }
    const code = error.message === 'Checkpoint conflict.' ? 'CHECKPOINT_CONFLICT' : 'CHECKPOINT_WRITE_FAILED';
    enterTechnicalError(code, trialState.mode || lastFailedTrialMode || 'test', {
      persist: false
    });
    return false;
  }
}

function enterTechnicalError(code, mode, { persist = true } = {}) {
  runGeneration += 1;
  cancelPlayback();
  responseWindowStart = null;
  toggleResponseButtons(false);
  technicalErrorCode = code;
  statusReason = code;
  lastFailedTrialMode = mode === 'practice' ? 'practice' : 'test';
  sessionPhase = 'technical_error';
  elements.technicalErrorCode.textContent = code;
  const storageError = code === 'CHECKPOINT_WRITE_FAILED' || code === 'CHECKPOINT_CONFLICT';
  const interrupted = ['VISIBILITY_INTERRUPTION', 'PARTICIPANT_STOP_CANCELLED'].includes(code);
  const deleteError = code === 'CHECKPOINT_DELETE_FAILED';
  elements.technicalErrorTitle.textContent = t(
    deleteError ? 'technicalError.deleteTitle' : storageError ? 'technicalError.storageTitle' : interrupted ? 'technicalError.interruptionTitle' : 'technicalError.title'
  );
  elements.technicalErrorIntro.textContent = t(
    deleteError ? 'technicalError.deleteIntro' : storageError ? 'technicalError.storageIntro' : interrupted ? 'technicalError.interruptionIntro' : 'technicalError.intro'
  );
  elements.technicalErrorStatus.textContent = '';
  elements.retryAudio.textContent = t(deleteError ? 'technicalError.retryDelete' : 'technicalError.retry');
  elements.retryAudio.disabled = !deleteError && (code === 'CHECKPOINT_WRITE_FAILED' || code === 'CHECKPOINT_CONFLICT');
  elements.endTechnicalSession.hidden = deleteError || code === 'CHECKPOINT_CONFLICT';
  if (persist) {
    try { saveCheckpoint('technical_error', activePresentation); } catch (error) { /* surfaced in UI */ }
  }
  showSection('technicalError');
}

function retryFailedAudio() {
  if (technicalErrorCode === 'CHECKPOINT_DELETE_FAILED') {
    if (elements.retryAudio.disabled) return;
    elements.retryAudio.disabled = true;
    if (deleteCheckpoint()) {
      const action = pendingDeletionAction;
      pendingDeletionAction = null;
      if (action) action();
      return;
    }
    elements.technicalErrorStatus.textContent = t('technicalError.deleteFailedStatus');
    elements.retryAudio.disabled = false;
    return;
  }
  if (!currentTask || elements.retryAudio.disabled) return;
  elements.retryAudio.disabled = true;
  elements.technicalErrorStatus.textContent = t('technicalError.retrying');
  interruptedPresentationCount += 1;
  replayedInterruptedPresentation = true;
  activePresentation = null;
  prepareTask(currentTask, { preserveState: true, writeCheckpoint: false });
  showSection('trial');
  if (lastFailedTrialMode === 'practice') {
    if (!commitCheckpoint('practice', null)) return;
    runPracticeTrial();
  } else {
    if (!commitCheckpoint('main', null)) return;
    runTrial();
  }
}

function requestCheckpointDeletion(onDeleted) {
  pendingDeletionAction = onDeleted;
  cancelPlayback();
  cancelPreflightPlayback();
  if (deleteCheckpoint()) {
    const action = pendingDeletionAction;
    pendingDeletionAction = null;
    action();
    return true;
  }
  enterTechnicalError('CHECKPOINT_DELETE_FAILED', trialState.mode || 'test', { persist: false });
  return false;
}

function handleObservedCheckpointDeletion() {
  cancelPlayback();
  cancelPreflightPlayback();
  resetSessionData();
  settingsLocked = true;
  renderParticipantLanding();
  showSection('withdrawn');
}

function endTechnicalFailure() {
  runGeneration += 1;
  responseWindowStart = null;
  toggleResponseButtons(false);
  sessionStatus = 'technical_failure';
  sessionEndedAt = new Date().toISOString();
  sessionPhase = 'technical_failure';
  activePresentation = null;
  try {
    saveCheckpoint('technical_failure', null);
  } catch (error) {
    if (error.message === 'Checkpoint deleted.') {
      handleObservedCheckpointDeletion();
      return;
    }
    if (error.message === 'Checkpoint conflict.') {
      enterTechnicalError('CHECKPOINT_CONFLICT', lastFailedTrialMode || 'test', { persist: false });
      return;
    }
    // A local write failure still permits exporting the last committed in-memory state.
  }
  renderParticipantCompletion();
  showSection('complete');
}

function startPractice() {
  if (sessionPhase !== 'instructions' || elements.startPractice.disabled) return;
  elements.startPractice.disabled = true;
  if (warmupPromise) {
    elements.practiceStatus.textContent = t('loadingAudio');
  }
  practiceState.currentTrial = 0;
  practiceState.correctCount = 0;
  practiceState.order = buildPracticeOrder(practiceConfig.trials);
  practiceState.completed = false;
  elements.startTest.disabled = true;
  elements.practiceStatus.textContent = t('practiceInProgress', { count: practiceConfig.trials });
  setSessionUi('practice');
  clearFeedback();
  activePresentation = null;
  if (!commitCheckpoint('practice', null)) return;
  showSection('trial');
  runPracticeTrial();
}

async function runPracticeTrial() {
  const generation = runGeneration;
  if (document.visibilityState !== 'visible') {
    enterTechnicalError('VISIBILITY_INTERRUPTION', 'practice');
    return;
  }
  clearFeedback();
  if (warmupPromise) {
    await warmupPromise;
  }
  if (generation !== runGeneration) return;
  if (document.visibilityState !== 'visible') {
    enterTechnicalError('VISIBILITY_INTERRUPTION', 'practice');
    return;
  }
  const trialIndex = practiceState.currentTrial;
  const oddIsThird = practiceState.order[trialIndex] === 0;
  const correctAnswer = oddIsThird ? '3' : '1';

  toggleResponseButtons(false);
  setSessionUi('practice');
  elements.playbackStatus.textContent = t('practicePlaying', { current: trialIndex + 1, total: practiceConfig.trials });

  const { audio: differentAudio, step: playedPracticeStep, substituted: practiceSub } = getAudioForStep(practiceConfig.differentStep);
  const first = oddIsThird ? baseAudioA : differentAudio;
  const second = oddIsThird ? baseAudioB : baseAudioA;
  const third = oddIsThird ? differentAudio : baseAudioB;
  trialState = {
    correctAnswer,
    requestedStep: practiceConfig.differentStep,
    trialStep: playedPracticeStep,
    substituted: practiceSub,
    oddPosition: oddIsThird ? 3 : 1,
    mode: 'practice'
  };

  activePresentation = {
    mode: 'practice',
    task_id: currentTask.id,
    trial_index: trialIndex,
    started_at_utc: new Date().toISOString()
  };
  if (!commitCheckpoint('practice', activePresentation)) return;

  cancelPlayback();
  const controller = new AbortController();
  playbackAbortController = controller;
  const hadError = await playSequence(first, second, third, controller.signal, generation);
  if (playbackAbortController === controller) playbackAbortController = null;
  if (generation !== runGeneration) return;
  if (hadError) {
    enterTechnicalError('AUDIO_PLAYBACK_FAILED', 'practice');
    return;
  }
  responseWindowStart = performance.now();
  elements.playbackStatus.textContent = t('practiceChoose', { current: trialIndex + 1, total: practiceConfig.trials });
  toggleResponseButtons(true);
}

async function startExperiment() {
  const generation = runGeneration;
  if (!practiceState.completed) {
    elements.practiceStatus.textContent = t('completePracticeFirst', { count: practiceConfig.trials });
    return;
  }
  if (!awaitingTestStart || elements.startTest.disabled) return;
  awaitingTestStart = false;
  elements.startTest.disabled = true;
  elements.startTest.textContent = t('preparingMain');
  elements.practiceStatus.textContent = t('preparingMain');
  if (warmupPromise) {
    await warmupPromise;
  }
  if (generation !== runGeneration) return;
  resetTaskState();
  stimOrder = buildStimOrder();
  activePresentation = null;
  if (!commitCheckpoint('main', null)) return;
  setSessionUi('test');
  clearFeedback();
  showSection('trial');
  runTrial();
}

function nextTrial() {
  if (state.currentTrial >= config.maxTrials || state.numReversals >= config.targetReversals) {
    return concludeTask();
  }
  runTrial();
}

async function runTrial() {
  const generation = runGeneration;
  if (document.visibilityState !== 'visible') {
    enterTechnicalError('VISIBILITY_INTERRUPTION', 'test');
    return;
  }
  const trialIndex = state.currentTrial;
  const oddIsThird = stimOrder[trialIndex] === 0;
  const correctAnswer = oddIsThird ? '3' : '1';
  const trialStep = state.currentStep;

  clearFeedback();
  toggleResponseButtons(false);
  setSessionUi('test');
  elements.playbackStatus.textContent = t('playingAudio');

  const { audio: stepAudio, step: playedStep, substituted: testSub } = getAudioForStep(trialStep);
  const first = oddIsThird ? baseAudioA : stepAudio;
  const second = oddIsThird ? baseAudioB : baseAudioA;
  const third = oddIsThird ? stepAudio : baseAudioB;
  trialState = {
    correctAnswer,
    requestedStep: trialStep,
    trialStep: playedStep,
    substituted: testSub,
    oddPosition: oddIsThird ? 3 : 1,
    mode: 'test'
  };

  activePresentation = {
    mode: 'test',
    task_id: currentTask.id,
    trial_index: trialIndex,
    started_at_utc: new Date().toISOString()
  };
  if (!commitCheckpoint('main', activePresentation)) return;

  cancelPlayback();
  const controller = new AbortController();
  playbackAbortController = controller;
  const hadError = await playSequence(first, second, third, controller.signal, generation);
  if (playbackAbortController === controller) playbackAbortController = null;
  if (generation !== runGeneration) return;
  if (hadError) {
    enterTechnicalError('AUDIO_PLAYBACK_FAILED', 'test');
    return;
  }
  responseWindowStart = performance.now();
  elements.playbackStatus.textContent = t('selectOneOrThree');
  toggleResponseButtons(true);
}

function captureMutableSessionState() {
  return JSON.parse(JSON.stringify({
    state,
    practiceState,
    stimOrder,
    trialState,
    currentResults,
    allResults,
    taskSummaries: serializeTaskSummaries(),
    currentTaskIndex,
    taskStartedAt,
    taskCompletedAt,
    sessionCompletedAt,
    sessionEndedAt,
    sessionLanguageAtCompletion,
    sessionStatus,
    awaitingTestStart,
    activePresentation,
    replayedInterruptedPresentation
  }));
}

function restoreMutableSessionState(snapshot) {
  state = { ...snapshot.state, reversalLevels: snapshot.state.reversalLevels.slice() };
  practiceState = { ...snapshot.practiceState, order: snapshot.practiceState.order.slice() };
  stimOrder = snapshot.stimOrder.slice();
  trialState = { ...snapshot.trialState };
  currentResults.splice(0, currentResults.length, ...snapshot.currentResults);
  allResults.splice(0, allResults.length, ...snapshot.allResults);
  taskSummaries.splice(0, taskSummaries.length, ...snapshot.taskSummaries.map(summary => ({
    ...summary,
    task: TASKS.find(task => task.id === summary.task_id)
  })));
  currentTaskIndex = snapshot.currentTaskIndex;
  currentTask = taskOrder[currentTaskIndex] || currentTask;
  taskStartedAt = snapshot.taskStartedAt;
  taskCompletedAt = snapshot.taskCompletedAt;
  sessionCompletedAt = snapshot.sessionCompletedAt;
  sessionEndedAt = snapshot.sessionEndedAt;
  sessionLanguageAtCompletion = snapshot.sessionLanguageAtCompletion;
  sessionStatus = snapshot.sessionStatus;
  awaitingTestStart = snapshot.awaitingTestStart;
  activePresentation = snapshot.activePresentation;
  replayedInterruptedPresentation = snapshot.replayedInterruptedPresentation;
  responseWindowStart = null;
}

function handleResponse(choice) {
  if (!responseWindowStart) return;
  const rollbackPoint = captureMutableSessionState();
  const rtMs = Math.round(performance.now() - responseWindowStart);
  toggleResponseButtons(false);

  const wasCorrect = choice === trialState.correctAnswer;
  if (trialState.mode === 'practice') {
    responseWindowStart = null;
    if (wasCorrect) practiceState.correctCount += 1;
    const practiceMessage = wasCorrect
      ? t('practiceCorrect')
      : t('practiceIncorrect', { answer: trialState.correctAnswer });
    elements.playbackStatus.textContent = practiceMessage;
    setFeedback(practiceMessage, wasCorrect);
    practiceState.currentTrial += 1;
    activePresentation = null;
    replayedInterruptedPresentation = false;
    if (practiceState.currentTrial >= practiceConfig.trials) {
      practiceState.completed = true;
      awaitingTestStart = true;
      elements.practiceStatus.textContent = t('practiceCompleteStatus');
      elements.startTest.disabled = false;
      elements.startTest.textContent = t('startMainEnabled');
      elements.startPractice.disabled = true;
      elements.startPractice.textContent = t('practiceCompletedButton');
      if (!commitCheckpoint('awaiting_main', null)) {
        if (sessionPhase === 'technical_error') restoreMutableSessionState(rollbackPoint);
        return;
      }
      const generation = runGeneration;
      setTimeout(() => {
        if (generation !== runGeneration) return;
        elements.playbackStatus.textContent = t('pressSpaceToStart');
        clearFeedback();
        showSection('instructions');
      }, config.postResponseDelay);
    } else {
      if (!commitCheckpoint('practice', null)) {
        if (sessionPhase === 'technical_error') restoreMutableSessionState(rollbackPoint);
        return;
      }
      const generation = runGeneration;
      setTimeout(() => {
        if (generation === runGeneration) runPracticeTrial();
      }, config.postResponseDelay);
    }
    return;
  }

  elements.playbackStatus.textContent = t('preparingNextTrial');
  clearFeedback();
  const requestedStep = trialState.requestedStep != null ? trialState.requestedStep : state.currentStep;
  const playedStep = trialState.trialStep;

  const staircaseUpdate = applyStaircase(wasCorrect);
  const meanReversal = getThreshold();
  const playedLevel = fileStepToLevel(playedStep);
  const requestedLevel = fileStepToLevel(requestedStep);
  const nextLevel = fileStepToLevel(state.currentStep);

  currentResults.push({
    subject_id: subjectId,
    battery_version: IMPLEMENTATION.batteryVersion,
    session_run_id: sessionRunId,
    configuration_source: configurationSource,
    administration_mode: administrationMode,
    session_type: sessionType,
    deployment_id: deploymentConfig.deploymentId,
    deployment_environment: deploymentConfig.environment,
    deployment_config_schema_version: deploymentConfig.schemaVersion,
    deployment_config_sha256: sessionDeploymentConfigSha256,
    app_origin: window.location.origin,
    study_id: studyMetadata.studyId,
    condition_id: studyMetadata.conditionId,
    site_id: studyMetadata.siteId,
    distribution_id: studyMetadata.distributionId,
    study_title: studyMetadata.studyTitle,
    institution_name: studyMetadata.institutionName,
    consent_version: studyMetadata.consentVersion,
    consent_confirmed_at_utc: consentConfirmedAt,
    preflight_completed_at_utc: preflightCompletedAt,
    preflight_audio_passed: preflightAudioPassed ? 1 : 0,
    expected_minutes: studyMetadata.expectedMinutes,
    consent_url: studyMetadata.consentUrl,
    contact_url: studyMetadata.contactUrl,
    return_url: studyMetadata.returnUrl,
    session_status: sessionStatus,
    status_reason: statusReason,
    session_started_at_utc: sessionStartedAt,
    session_ended_at_utc: sessionEndedAt,
    task_started_at_utc: taskStartedAt,
    resume_count: resumeCount,
    interrupted_presentation_count: interruptedPresentationCount,
    visibility_interruption_count: visibilityInterruptionCount,
    app_build_id: IMPLEMENTATION.appBuildId,
    app_build_sha256: sessionBuildSha256,
    app_script_sha256: sessionScriptSha256,
    app_url: window.location.href.split('#')[0],
    participant_link_schema_version: participantLinkSchemaVersion,
    participant_link_validation_status: participantLinkValidationStatus,
    configured_initial_language: configuredInitialLanguage,
    participant_link_config: participantLinkConfig,
    task_id: currentTask.id,
    task_label: currentTask.label,
    task_order: currentTaskIndex + 1,
    trial: state.currentTrial + 1,
    stimulus_step: playedLevel,
    stimulus_file_index: playedStep,
    stimulus_requested_step: requestedLevel,
    stimulus_requested_file_index: requestedStep,
    stimulus_substituted: trialState.substituted ? 1 : 0,
    odd_position: trialState.oddPosition,
    correct_answer: trialState.correctAnswer,
    response: choice,
    correct: wasCorrect ? 1 : 0,
    rt_ms: rtMs,
    num_reversals_after: state.numReversals,
    step_before: requestedLevel,
    file_index_before: requestedStep,
    step_after: nextLevel,
    file_index_after: state.currentStep,
    step_size_used: staircaseUpdate.stepSizeUsed,
    step_direction: staircaseUpdate.stepDirection,
    is_reversal: staircaseUpdate.isReversal ? 1 : 0,
    reversal_number: staircaseUpdate.reversalNumber,
    reversal_level: staircaseUpdate.reversalLevel,
    mean_reversal_so_far: meanReversal !== null ? meanReversal.toFixed(2) : '',
    threshold_estimate: '',
    threshold_physical_value: '',
    threshold_unit: currentTask.thresholdUnit,
    protocol_id: config.id,
    protocol_version: config.version,
    protocol_citation: config.citation,
    protocol_source_locator: config.sourceLocator,
    protocol_source_audit_status: config.sourceAuditStatus,
    procedure_scope: IMPLEMENTATION.procedureScope,
    protocol_main_study_task_ids: config.mainStudyTaskIds.join('|'),
    task_in_source_main_study: taskIsInSourceMainStudy(currentTask.id) ? 1 : 0,
    stimulus_compatibility: config.stimulusCompatibility,
    task_stimulus_compatibility: taskStimulusCompatibility(currentTask.id),
    max_trials: config.maxTrials,
    target_reversals: config.targetReversals,
    first_scored_reversal: config.firstScoredReversal,
    threshold_aggregation: config.thresholdAggregation,
    correct_responses_for_harder: config.correctResponsesForHarder,
    single_correct_before_first_incorrect: config.singleCorrectBeforeFirstIncorrect ? 1 : 0,
    step_sizes: config.stepSizes.join('|'),
    reversal_definition: IMPLEMENTATION.reversalDefinition,
    reversal_level_timing: config.reversalLevelTiming,
    interstimulus_interval_ms: config.interStimulusDelay,
    post_sequence_delay_ms: config.postSequenceDelay,
    post_response_delay_ms: config.postResponseDelay,
    practice_trials: practiceConfig.trials,
    practice_feedback: 'correctness_and_correct_position',
    practice_standard_file_index: practiceConfig.baseStep,
    practice_comparison_file_index: practiceConfig.differentStep,
    task_order_method: IMPLEMENTATION.taskOrderMethod,
    ...stimulusProvenance(currentTask),
    stimulus_error_policy: IMPLEMENTATION.stimulusErrorPolicy,
    feedback_mode: researcherSettings.feedbackMode,
    ui_language: currentLanguage,
    selected_task_ids: researcherSettings.selectedTaskIds.join('|'),
    replayed_interrupted_presentation: replayedInterruptedPresentation ? 1 : 0,
    termination_reason: '',
    scored_reversal_count: '',
    reversal_levels_used: '',
    threshold_available: '',
    target_reversals_reached: '',
    schema_version: IMPLEMENTATION.trialSchemaVersion
  });

  state.currentTrial += 1;
  responseWindowStart = null;
  activePresentation = null;
  replayedInterruptedPresentation = false;
  if (!commitCheckpoint('main', null)) {
    if (sessionPhase === 'technical_error') restoreMutableSessionState(rollbackPoint);
    return;
  }
  const nextAudio = getAudioForStep(state.currentStep).audio;
  if (nextAudio) waitForAudioReady(nextAudio).catch(() => {});
  const generation = runGeneration;
  setTimeout(() => {
    if (generation === runGeneration) nextTrial();
  }, config.postResponseDelay);
}

function applyStaircaseTransition(staircaseState, protocol, wasCorrect, clampStep) {
  let direction = 0;
  let isReversal = false;
  let reversalLevel = '';

  if (wasCorrect) {
    staircaseState.correctStreak += 1;
    const requiredCorrect = protocol.singleCorrectBeforeFirstIncorrect && !staircaseState.hasIncorrectResponse
      ? 1
      : protocol.correctResponsesForHarder;
    if (staircaseState.correctStreak >= requiredCorrect) {
      direction = -1;
      staircaseState.correctStreak = 0;
    }
  } else {
    staircaseState.hasIncorrectResponse = true;
    staircaseState.correctStreak = 0;
    direction = 1;
  }

  const levelBeforeUpdate = fileStepToLevel(staircaseState.currentStep);
  if (direction !== 0 && staircaseState.lastDirection !== 0 && direction !== staircaseState.lastDirection) {
    isReversal = true;
    staircaseState.numReversals += 1;
  }

  const configuredStepSize = protocol.stepSizes[
    Math.min(staircaseState.numReversals, protocol.stepSizes.length - 1)
  ];
  const stepSizeUsed = direction === 0 ? 0 : configuredStepSize;
  if (direction !== 0) {
    staircaseState.currentStep += direction * configuredStepSize;
    staircaseState.lastDirection = direction;
  }

  staircaseState.currentStep = clampStep(staircaseState.currentStep);
  if (isReversal) {
    reversalLevel = protocol.reversalLevelTiming === 'after_step_update'
      ? fileStepToLevel(staircaseState.currentStep)
      : levelBeforeUpdate;
    staircaseState.reversalLevels.push(reversalLevel);
  }

  return {
    stepSizeUsed,
    stepDirection: direction < 0 ? 'harder' : direction > 0 ? 'easier' : 'hold',
    isReversal,
    reversalNumber: isReversal ? staircaseState.numReversals : '',
    reversalLevel
  };
}

function applyStaircase(wasCorrect) {
  return applyStaircaseTransition(
    state,
    config,
    wasCorrect,
    step => Math.min(config.numSteps, Math.max(2, step))
  );
}

function verifySunStaircaseExample() {
  const protocol = { ...BASE_CONFIG, ...PROTOCOL_PRESETS.sun2021 };
  const fixtureState = createState(protocol.startingStep);
  const observedLevels = [];
  [true, true, false, true, true, true, false].forEach(wasCorrect => {
    applyStaircaseTransition(
      fixtureState,
      protocol,
      wasCorrect,
      step => Math.min(protocol.numSteps, Math.max(2, step))
    );
    observedLevels.push(fileStepToLevel(fixtureState.currentStep));
  });

  const expectedLevels = '40|30|35|35|33|33|34';
  const expectedReversals = '35|33|34';
  if (
    observedLevels.join('|') !== expectedLevels ||
    fixtureState.reversalLevels.join('|') !== expectedReversals
  ) {
    throw new Error('Sun et al. (2021) staircase regression check failed.');
  }
}

function concludeTask() {
  if (taskSummaries.some(summary => summary.order === currentTaskIndex + 1)) {
    renderTaskCompletePanel();
    showSection('taskComplete');
    return;
  }
  const rollbackPoint = captureMutableSessionState();
  const threshold = getThreshold();
  const scoredReversalLevels = getScoredReversalLevels();
  const thresholdPhysical = threshold !== null ? levelToPhysical(threshold) : null;
  const terminationReason = state.numReversals >= config.targetReversals ? 'target_reversals' : 'max_trials';
  const thresholdAvailable = threshold !== null;
  taskCompletedAt = new Date().toISOString();
  const isLastTask = currentTaskIndex === taskOrder.length - 1;
  if (isLastTask) {
    sessionCompletedAt = taskCompletedAt;
    sessionEndedAt = taskCompletedAt;
    sessionLanguageAtCompletion = currentLanguage;
    sessionStatus = 'completed';
  }
  currentResults.forEach(row => {
    row.threshold_estimate = threshold !== null ? threshold.toFixed(2) : '';
    row.threshold_physical_value = thresholdPhysical !== null ? thresholdPhysical.toFixed(2) : '';
    row.termination_reason = terminationReason;
    row.scored_reversal_count = scoredReversalLevels.length;
    row.reversal_levels_used = scoredReversalLevels.join('|');
    row.threshold_available = thresholdAvailable ? 1 : 0;
    row.target_reversals_reached = state.numReversals >= config.targetReversals ? 1 : 0;
    row.task_completed_at_utc = taskCompletedAt;
  });
  allResults.push(...currentResults);
  taskSummaries.push({
    task: currentTask,
    order: currentTaskIndex + 1,
    threshold,
    thresholdPhysical,
    thresholdFileIndex: threshold !== null ? threshold + 1 : null,
    trialsCompleted: state.currentTrial,
    reversalsCompleted: state.numReversals,
    scoredReversalLevels: scoredReversalLevels.slice(),
    terminationReason,
    thresholdAvailable,
    practiceCorrect: practiceState.correctCount,
    stimulusSubstitutionCount: currentResults.filter(row => row.stimulus_substituted === 1).length,
    medianRtMs: median(currentResults.map(row => row.rt_ms)),
    startedAtUtc: taskStartedAt,
    completedAtUtc: taskCompletedAt
  });
  currentResults.length = 0;
  activePresentation = null;
  if (!commitCheckpoint('task_complete', null)) {
    if (sessionPhase === 'technical_error') restoreMutableSessionState(rollbackPoint);
    return;
  }
  renderTaskCompletePanel();
  showSection('taskComplete');
}

function renderTaskCompletePanel() {
  elements.completeTitle.textContent = t('taskCompletedTitle', { task: taskDisplayLabel(currentTask) });
  renderTaskCompleteThreshold();

  const isLastTask = currentTaskIndex === taskOrder.length - 1;
  const nextTask = taskOrder[currentTaskIndex + 1];
  elements.taskCompleteHint.textContent = isLastTask
    ? t('allTasksFinishedParticipant')
    : t('nextTaskHint', { task: taskDisplayLabel(nextTask) });
  elements.nextTaskButton.textContent = isLastTask ? t('finishParticipantSession') : t('nextTask');
  elements.nextTaskButton.disabled = false;
  elements.nextTaskButton.onclick = () => {
    if (sessionPhase !== 'task_complete' || elements.nextTaskButton.disabled) return;
    elements.nextTaskButton.disabled = true;
    if (isLastTask) {
      if (!commitCheckpoint('complete', null)) return;
      renderParticipantCompletion();
      showSection('complete');
    } else {
      const previousIndex = currentTaskIndex;
      currentTaskIndex += 1;
      if (!prepareTask(nextTask)) {
        currentTaskIndex = previousIndex;
        currentTask = taskOrder[previousIndex];
      }
    }
  };
}

function renderTaskCompleteThreshold() {
  elements.thresholdText.hidden = false;
  elements.thresholdText.textContent = t('responsesRecorded');
}

function csvEscape(value) {
  return SessionSafety.csvEscapeCell(value);
}

function median(values) {
  if (!values.length) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function rowsToCsv(rows, header) {
  const lines = [header.join(',')];
  rows.forEach(row => {
    lines.push(header.map(key => csvEscape(row[key])).join(','));
  });
  return `\ufeff${lines.join('\n')}`;
}

function downloadCsvText(csvText, filename) {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 0);
}

function getExportRows() {
  return [...allResults, ...currentResults].map(row => ({
    ...row,
    app_build_sha256: sessionBuildSha256,
    app_script_sha256: sessionScriptSha256,
    session_final_status: sessionStatus,
    session_ended_at_utc: sessionEndedAt,
    status_reason: statusReason,
    resume_count: resumeCount,
    interrupted_presentation_count: interruptedPresentationCount,
    visibility_interruption_count: visibilityInterruptionCount
  }));
}

function buildTrialCsv() {
  const header = [
    'subject_id',
    'battery_version',
    'session_run_id',
    'configuration_source',
    'administration_mode',
    'session_type',
    'deployment_id',
    'deployment_environment',
    'deployment_config_schema_version',
    'deployment_config_sha256',
    'app_origin',
    'study_id',
    'condition_id',
    'site_id',
    'distribution_id',
    'study_title',
    'institution_name',
    'consent_version',
    'expected_minutes',
    'consent_url',
    'contact_url',
    'return_url',
    'consent_confirmed_at_utc',
    'preflight_completed_at_utc',
    'preflight_audio_passed',
    'session_status',
    'session_final_status',
    'session_started_at_utc',
    'session_ended_at_utc',
    'status_reason',
    'task_started_at_utc',
    'task_completed_at_utc',
    'app_build_id',
    'app_build_sha256',
    'app_script_sha256',
    'app_url',
    'participant_link_schema_version',
    'participant_link_validation_status',
    'configured_initial_language',
    'participant_link_config',
    'task_id',
    'task_label',
    'task_order',
    'trial',
    'stimulus_step',
    'stimulus_file_index',
    'stimulus_requested_step',
    'stimulus_requested_file_index',
    'stimulus_substituted',
    'odd_position',
    'correct_answer',
    'response',
    'correct',
    'rt_ms',
    'num_reversals_after',
    'step_before',
    'file_index_before',
    'step_after',
    'file_index_after',
    'step_size_used',
    'step_direction',
    'is_reversal',
    'reversal_number',
    'reversal_level',
    'mean_reversal_so_far',
    'threshold_estimate',
    'threshold_physical_value',
    'threshold_unit',
    'protocol_id',
    'protocol_version',
    'protocol_citation',
    'protocol_source_locator',
    'protocol_source_audit_status',
    'procedure_scope',
    'protocol_main_study_task_ids',
    'task_in_source_main_study',
    'stimulus_compatibility',
    'task_stimulus_compatibility',
    'max_trials',
    'target_reversals',
    'first_scored_reversal',
    'threshold_aggregation',
    'correct_responses_for_harder',
    'single_correct_before_first_incorrect',
    'step_sizes',
    'reversal_definition',
    'reversal_level_timing',
    'interstimulus_interval_ms',
    'post_sequence_delay_ms',
    'post_response_delay_ms',
    'practice_trials',
    'practice_feedback',
    'practice_standard_file_index',
    'practice_comparison_file_index',
    'task_order_method',
    'protocol_stimulus_binding_id',
    'stimulus_catalog',
    'stimulus_catalog_schema_version',
    'stimulus_catalog_sha256',
    'stimulus_set_id',
    'stimulus_set_version',
    'stimulus_set_kind',
    'stimulus_claim',
    'stimulus_parameter_profile_id',
    'stimulus_manifest',
    'stimulus_manifest_sha256',
    'stimulus_set_sha256',
    'stimulus_task_sha256',
    'stimulus_task_transformation',
    'stimulus_source_citation',
    'stimulus_source_locator',
    'stimulus_parent_set_id',
    'stimulus_parent_manifest',
    'stimulus_parent_set_sha256',
    'stimulus_parent_source_locator',
    'stimulus_source_archive_sha256',
    'stimulus_parent_source_archive_sha256',
    'stimulus_provenance_verification',
    'stimulus_validation_status',
    'stimulus_audit_date',
    'stimulus_generator',
    'stimulus_generator_version',
    'stimulus_generator_script',
    'stimulus_generator_script_sha256',
    'stimulus_parameters_file',
    'stimulus_parameters_sha256',
    'stimulus_license',
    'stimulus_license_note',
    'stimulus_standard_file_index',
    'stimulus_error_policy',
    'feedback_mode',
    'ui_language',
    'selected_task_ids',
    'replayed_interrupted_presentation',
    'interrupted_presentation_count',
    'visibility_interruption_count',
    'resume_count',
    'termination_reason',
    'scored_reversal_count',
    'reversal_levels_used',
    'threshold_available',
    'target_reversals_reached',
    'schema_version'
  ];
  return rowsToCsv(getExportRows(), header);
}

function resultFilenameStem() {
  const filenameId = subjectId || 'subject';
  const runId = sessionRunId || 'no-run-id';
  const prefix = sessionType === 'test' ? 'TEST_ONLY_' : '';
  return `${prefix}${filenameId}_${runId}_audio_discrimination`;
}

function downloadCsv() {
  downloadCsvText(buildTrialCsv(), `${resultFilenameStem()}_trials.csv`);
}

function buildWideResult() {
  const row = {
    subject_id: subjectId,
    battery_version: IMPLEMENTATION.batteryVersion,
    wide_schema_version: IMPLEMENTATION.wideSchemaVersion,
    session_run_id: sessionRunId,
    configuration_source: configurationSource,
    administration_mode: administrationMode,
    session_type: sessionType,
    deployment_id: deploymentConfig.deploymentId,
    deployment_environment: deploymentConfig.environment,
    deployment_config_schema_version: deploymentConfig.schemaVersion,
    deployment_config_sha256: sessionDeploymentConfigSha256,
    app_origin: window.location.origin,
    study_id: studyMetadata.studyId,
    condition_id: studyMetadata.conditionId,
    site_id: studyMetadata.siteId,
    distribution_id: studyMetadata.distributionId,
    study_title: studyMetadata.studyTitle,
    institution_name: studyMetadata.institutionName,
    consent_version: studyMetadata.consentVersion,
    expected_minutes: studyMetadata.expectedMinutes,
    consent_url: studyMetadata.consentUrl,
    contact_url: studyMetadata.contactUrl,
    return_url: studyMetadata.returnUrl,
    consent_confirmed_at_utc: consentConfirmedAt,
    preflight_completed_at_utc: preflightCompletedAt,
    preflight_audio_passed: preflightAudioPassed ? 1 : 0,
    session_status: sessionStatus,
    status_reason: statusReason,
    session_started_at_utc: sessionStartedAt,
    session_ended_at_utc: sessionEndedAt,
    resume_count: resumeCount,
    interrupted_presentation_count: interruptedPresentationCount,
    visibility_interruption_count: visibilityInterruptionCount,
    app_build_id: IMPLEMENTATION.appBuildId,
    app_build_sha256: sessionBuildSha256,
    app_script_sha256: sessionScriptSha256,
    app_url: window.location.href.split('#')[0],
    participant_link_schema_version: participantLinkSchemaVersion,
    participant_link_validation_status: participantLinkValidationStatus,
    configured_initial_language: configuredInitialLanguage,
    participant_link_config: participantLinkConfig,
    completed: sessionStatus === 'completed' ? 1 : 0,
    completed_at_utc: sessionCompletedAt,
    protocol_id: config.id,
    protocol_version: config.version,
    protocol_citation: config.citation,
    protocol_source_locator: config.sourceLocator,
    protocol_source_audit_status: config.sourceAuditStatus,
    procedure_scope: IMPLEMENTATION.procedureScope,
    protocol_main_study_task_ids: config.mainStudyTaskIds.join('|'),
    stimulus_compatibility: config.stimulusCompatibility,
    feedback_mode: researcherSettings.feedbackMode,
    ui_language_at_start: sessionLanguageAtStart,
    ui_language_at_completion: sessionLanguageAtCompletion,
    ui_languages_used: Array.from(new Set(getExportRows().map(result => result.ui_language))).join('|'),
    selected_task_ids: researcherSettings.selectedTaskIds.join('|'),
    task_order: taskOrder.map(task => task.id).join('|'),
    max_trials: config.maxTrials,
    target_reversals: config.targetReversals,
    first_scored_reversal: config.firstScoredReversal,
    threshold_aggregation: config.thresholdAggregation,
    correct_responses_for_harder: config.correctResponsesForHarder,
    single_correct_before_first_incorrect: config.singleCorrectBeforeFirstIncorrect ? 1 : 0,
    step_sizes: config.stepSizes.join('|'),
    reversal_definition: IMPLEMENTATION.reversalDefinition,
    reversal_level_timing: config.reversalLevelTiming,
    task_order_method: IMPLEMENTATION.taskOrderMethod,
    interstimulus_interval_ms: config.interStimulusDelay,
    post_sequence_delay_ms: config.postSequenceDelay,
    post_response_delay_ms: config.postResponseDelay,
    practice_trials_per_task: practiceConfig.trials,
    practice_feedback: 'correctness_and_correct_position',
    practice_standard_file_index: practiceConfig.baseStep,
    practice_comparison_file_index: practiceConfig.differentStep,
    stimulus_scale: 'published_level_0_100',
    ...stimulusProvenance(),
    stimulus_error_policy: IMPLEMENTATION.stimulusErrorPolicy
  };

  const stimulusSet = getActiveStimulusSet();
  TASKS.forEach(task => {
    const summary = taskSummaries.find(item => item.task.id === task.id);
    const taskSpec = stimulusSet.tasks[task.id];
    row[`${task.id}_selected`] = researcherSettings.selectedTaskIds.includes(task.id) ? 1 : 0;
    row[`${task.id}_in_source_main_study`] = taskIsInSourceMainStudy(task.id) ? 1 : 0;
    row[`${task.id}_stimulus_compatibility`] = taskStimulusCompatibility(task.id);
    row[`${task.id}_stimulus_task_sha256`] = taskSpec ? taskSpec.taskSha256 : '';
    row[`${task.id}_stimulus_task_transformation`] = taskSpec ? taskSpec.transformation : '';
    row[`${task.id}_task_order`] = summary ? summary.order : '';
    row[`${task.id}_threshold_file_index`] = summary && summary.thresholdFileIndex !== null
      ? summary.thresholdFileIndex.toFixed(2)
      : '';
    row[`${task.id}_threshold_level`] = summary && summary.threshold !== null ? summary.threshold.toFixed(2) : '';
    row[`${task.id}_threshold_physical_value`] = summary && summary.thresholdPhysical !== null
      ? summary.thresholdPhysical.toFixed(2)
      : '';
    row[`${task.id}_threshold_unit`] = summary ? task.thresholdUnit : '';
    row[`${task.id}_trials_completed`] = summary ? summary.trialsCompleted : '';
    row[`${task.id}_reversals_completed`] = summary ? summary.reversalsCompleted : '';
    row[`${task.id}_scored_reversal_count`] = summary ? summary.scoredReversalLevels.length : '';
    row[`${task.id}_reversal_levels_used`] = summary ? summary.scoredReversalLevels.join('|') : '';
    row[`${task.id}_termination_reason`] = summary ? summary.terminationReason : '';
    row[`${task.id}_threshold_available`] = summary ? (summary.thresholdAvailable ? 1 : 0) : '';
    row[`${task.id}_target_reversals_reached`] = summary
      ? (summary.reversalsCompleted >= config.targetReversals ? 1 : 0)
      : '';
    row[`${task.id}_median_rt_ms`] = summary && summary.medianRtMs !== null ? summary.medianRtMs.toFixed(1) : '';
    row[`${task.id}_practice_correct_count`] = summary ? summary.practiceCorrect : '';
    row[`${task.id}_stimulus_substitution_count`] = summary ? summary.stimulusSubstitutionCount : '';
    row[`${task.id}_started_at_utc`] = summary ? summary.startedAtUtc : '';
    row[`${task.id}_completed_at_utc`] = summary ? summary.completedAtUtc : '';
  });
  return row;
}

function buildWideCsv() {
  const row = buildWideResult();
  const header = Object.keys(row);
  return rowsToCsv([row], header);
}

function downloadWideCsv() {
  downloadCsvText(buildWideCsv(), `${resultFilenameStem()}_wide.csv`);
}

async function buildResultBundle() {
  if (!globalThis.ResultBundle) throw new Error('Result bundle utility is unavailable.');
  if (!sessionBuildSha256 || !sessionScriptSha256) throw new Error('Frozen build identity is unavailable.');
  const trialFilename = `${resultFilenameStem()}_trials.csv`;
  const wideFilename = `${resultFilenameStem()}_wide.csv`;
  const trialCsv = buildTrialCsv();
  const wideCsv = buildWideCsv();
  const [trialSha256, wideSha256] = await Promise.all([
    ResultBundle.sha256Hex(trialCsv),
    ResultBundle.sha256Hex(wideCsv)
  ]);
  const manifest = {
    result_bundle_schema_version: IMPLEMENTATION.resultBundleSchemaVersion,
    generated_at_utc: new Date().toISOString(),
    data_classification: sessionType === 'test'
      ? 'test_data_do_not_analyze'
      : 'pseudonymous_research_data',
    automatic_upload_performed: false,
    administration_mode: administrationMode,
    result_return_requires_external_portal_receipt: administrationMode === 'remote_manual_upload',
    deployment: {
      session_type: sessionType,
      deployment_id: deploymentConfig.deploymentId,
      environment: deploymentConfig.environment,
      config_schema_version: deploymentConfig.schemaVersion,
      config_file: DEPLOYMENT_CONFIG_FILE,
      config_sha256: sessionDeploymentConfigSha256,
      app_origin: window.location.origin,
      researcher_origin: deploymentConfig.researcherOrigin,
      participant_origin: deploymentConfig.participantOrigin,
      public_participant_base_url: deploymentConfig.publicParticipantBaseUrl
    },
    session: {
      subject_id: subjectId,
      session_run_id: sessionRunId,
      status: sessionStatus,
      status_reason: statusReason,
      started_at_utc: sessionStartedAt,
      ended_at_utc: sessionEndedAt,
      completed_at_utc: sessionCompletedAt,
      resume_count: resumeCount,
      interrupted_presentation_count: interruptedPresentationCount,
      visibility_interruption_count: visibilityInterruptionCount,
      consent_confirmed_at_utc: consentConfirmedAt,
      preflight_completed_at_utc: preflightCompletedAt,
      preflight_audio_passed: preflightAudioPassed
    },
    study: { ...studyMetadata },
    implementation: {
      ...IMPLEMENTATION,
      app_build_sha256: sessionBuildSha256,
      app_script_sha256: sessionScriptSha256,
      served_asset_sha256: { ...appAssetSha256 },
      app_url: window.location.href.split('#')[0]
    },
    procedure: {
      protocol_id: config.id,
      protocol_version: config.version,
      protocol_citation: config.citation,
      selected_task_ids: researcherSettings.selectedTaskIds.slice(),
      task_order_ids: taskOrder.map(task => task.id),
      feedback_mode: researcherSettings.feedbackMode
    },
    provenance: stimulusProvenance(),
    files: [
      { name: trialFilename, media_type: 'text/csv', sha256: trialSha256 },
      { name: wideFilename, media_type: 'text/csv', sha256: wideSha256 }
    ]
  };
  const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
  return ResultBundle.createZipBlob([
    { name: trialFilename, content: trialCsv },
    { name: wideFilename, content: wideCsv },
    { name: 'session_manifest.json', content: manifestText }
  ]);
}

async function downloadResultBundle({ participant = false } = {}) {
  const button = participant ? elements.participantDownloadBundle : elements.downloadBundle;
  button.disabled = true;
  try {
    const blob = await buildResultBundle();
    ResultBundle.downloadBlob(blob, `${resultFilenameStem()}_results.zip`);
    resultsBundleDownloaded = true;
    elements.nextParticipant.disabled = false;
    if (participant) {
      elements.participantReturnStatus.textContent = t('complete.bundleReady');
      renderParticipantCompletion();
    } else {
      elements.exportStatus.textContent = t('researcherResults.bundleReady');
    }
    try { saveCheckpoint(sessionPhase, null); } catch (error) { /* download remains available */ }
  } catch (error) {
    console.error('Result bundle creation failed:', error);
    const message = `RESULT_BUNDLE_FAILED: ${error.message}`;
    if (participant) elements.participantReturnStatus.textContent = message;
    else elements.exportStatus.textContent = message;
  } finally {
    button.disabled = false;
  }
}

function createTextElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function renderParticipantFeedback() {
  elements.feedbackSummary.innerHTML = '';
  if (researcherSettings.feedbackMode === 'practice_only') {
    elements.feedbackSummary.appendChild(createTextElement('p', 'notice', t('participantCompletionOnly')));
    return;
  }

  taskSummaries.slice().sort((a, b) => a.order - b.order).forEach(summary => {
    const div = document.createElement('div');
    div.className = 'summary-item';
    const thresholdText = summary.threshold !== null
      ? `${getThresholdLabel()}: ${formatThreshold(summary.threshold, summary.task)}`
      : t('thresholdUnavailable');
    div.appendChild(createTextElement('div', 'pill', t('taskNumber', { number: summary.order })));
    div.appendChild(createTextElement('strong', '', taskDisplayLabel(summary.task)));
    div.appendChild(createTextElement('div', 'status', thresholdText));
    elements.feedbackSummary.appendChild(div);
  });
  elements.feedbackSummary.appendChild(createTextElement('p', 'notice', t('participantDetailedCaution')));
}

function renderParticipantCompletion() {
  const technical = sessionStatus === 'technical_failure';
  elements.participantCompleteTag.textContent = t(technical ? 'complete.technicalTag' : 'complete.tag');
  elements.participantCompleteTitle.textContent = t(technical ? 'complete.technicalTitle' : 'complete.title');
  elements.participantCompleteIntro.textContent = t(technical ? 'complete.technicalIntro' : 'complete.intro');
  if (technical) {
    elements.feedbackSummary.innerHTML = '';
    elements.feedbackSummary.appendChild(createTextElement('p', 'notice', t('complete.technicalIntro')));
  } else {
    renderParticipantFeedback();
  }
  const remote = administrationMode === 'remote_manual_upload';
  elements.remoteReturnActions.hidden = !remote;
  elements.supervisedResultActions.hidden = remote;
  elements.remoteSessionReference.textContent = t('complete.sessionReference', {
    id: subjectId,
    run: sessionRunId
  });
  elements.confirmReturnAndDelete.disabled = !resultsBundleDownloaded;
  if (resultsBundleDownloaded && studyMetadata.returnUrl) {
    elements.participantReturnPortal.href = studyMetadata.returnUrl;
    elements.participantReturnPortal.removeAttribute('aria-disabled');
    elements.participantReturnPortal.removeAttribute('tabindex');
  } else {
    elements.participantReturnPortal.removeAttribute('href');
    elements.participantReturnPortal.setAttribute('aria-disabled', 'true');
    elements.participantReturnPortal.setAttribute('tabindex', '-1');
  }
  elements.participantReturnStatus.textContent = resultsBundleDownloaded ? t('complete.bundleReady') : '';
}

function appendTableCell(row, tag, text, scope = '') {
  const cell = document.createElement(tag);
  cell.textContent = text;
  if (tag === 'th') cell.scope = scope || 'row';
  row.appendChild(cell);
}

function buildWidePreviewRow(wideRow) {
  const visibleKeys = [
    'subject_id',
    'session_run_id',
    'study_id',
    'condition_id',
    'site_id',
    'distribution_id',
    'session_status',
    'completed',
    'completed_at_utc',
    'protocol_citation',
    'selected_task_ids',
    'task_order'
  ];
  TASKS.forEach(task => {
    visibleKeys.push(
      `${task.id}_selected`,
      `${task.id}_task_order`,
      `${task.id}_threshold_level`,
      `${task.id}_threshold_physical_value`,
      `${task.id}_threshold_unit`,
      `${task.id}_trials_completed`,
      `${task.id}_reversals_completed`,
      `${task.id}_threshold_available`,
      `${task.id}_median_rt_ms`
    );
  });
  return Object.fromEntries(visibleKeys.map(key => [key, wideRow[key]]));
}

function renderResearcherResults() {
  elements.metricsTable.innerHTML = '';
  taskSummaries.slice().sort((a, b) => a.order - b.order).forEach(summary => {
    const row = document.createElement('tr');
    appendTableCell(row, 'td', String(summary.order));
    appendTableCell(row, 'th', `${summary.task.label} (${taskDisplayLabel(summary.task)})`);
    appendTableCell(row, 'td', summary.threshold !== null ? summary.threshold.toFixed(2) : t('notAvailable'));
    appendTableCell(row, 'td', summary.thresholdPhysical !== null
      ? `${summary.thresholdPhysical.toFixed(2)} ${summary.task.thresholdUnit}`
      : t('notAvailable'));
    appendTableCell(row, 'td', String(summary.trialsCompleted));
    appendTableCell(row, 'td', String(summary.reversalsCompleted));
    appendTableCell(row, 'td', summary.scoredReversalLevels.join(', ') || t('notAvailable'));
    appendTableCell(row, 'td', t(`stopReason_${summary.terminationReason}`));
    appendTableCell(row, 'td', summary.thresholdAvailable ? t('valid') : t('notValid'));
    elements.metricsTable.appendChild(row);
  });

  const wideRow = buildWidePreviewRow(buildWideResult());
  const table = document.createElement('table');
  table.className = 'wide-table';
  const head = document.createElement('thead');
  const headRow = document.createElement('tr');
  Object.keys(wideRow).forEach(key => appendTableCell(headRow, 'th', key, 'col'));
  head.appendChild(headRow);
  const body = document.createElement('tbody');
  const valueRow = document.createElement('tr');
  Object.values(wideRow).forEach(value => appendTableCell(valueRow, 'td', String(value)));
  body.appendChild(valueRow);
  table.append(head, body);
  elements.widePreview.innerHTML = '';
  elements.widePreview.appendChild(table);
  if (elements.researcherMeta) {
    elements.researcherMeta.textContent = t('researcherMeta', {
      id: subjectId,
      run: sessionRunId,
      protocol: config.citation,
      count: taskSummaries.length,
      status: sessionStatus
    });
  }
}

function updateParticipantSetupCopy() {
  if (elements.participantSetupDescription) {
    const count = researcherSettings.selectedTaskIds.length;
    elements.participantSetupDescription.textContent = t(
      count === 1 ? 'participantSetupDescriptionOne' : 'participantSetupDescription', {
      count: researcherSettings.selectedTaskIds.length
      }
    );
  }
}

function updateResearcherTaskAvailability() {
  const preset = PROTOCOL_PRESETS[elements.protocolPreset.value];
  if (!preset) return;
  const stimulusSet = getStimulusSetForProtocol(preset);
  Array.from(elements.taskSelections).forEach(input => {
    const supported = Boolean(stimulusSet.tasks[input.value]);
    const option = input.closest('.check-option');
    if (!supported && !input.disabled) {
      input.dataset.checkedBeforeProfileDisable = String(input.checked);
      input.checked = false;
    } else if (supported && input.disabled) {
      input.checked = input.dataset.checkedBeforeProfileDisable === 'true';
      delete input.dataset.checkedBeforeProfileDisable;
    }
    input.disabled = !supported;
    input.setAttribute('aria-disabled', String(!supported));
    input.title = supported ? '' : t('taskUnavailableInProfile');
    if (option) {
      option.classList.toggle('is-disabled', !supported);
      option.title = supported ? '' : t('taskUnavailableInProfile');
    }
  });
}

function setResearcherError(key = '') {
  researcherErrorKey = key;
  elements.researcherError.textContent = key ? t(key) : '';
}

function updateResearcherDescriptions() {
  if (!elements.protocolDescription || !elements.feedbackDescription) return;
  const protocolId = elements.protocolPreset.value;
  const feedbackMode = elements.feedbackMode.value;
  updateResearcherTaskAvailability();
  elements.protocolDescription.textContent = t(`protocol.${protocolId}.description`);
  elements.feedbackDescription.textContent = t(
    feedbackMode === 'detailed' ? 'feedback.detailed.description' : 'feedback.practiceOnly.description'
  );
}

function canonicalizeTaskIds(taskIds) {
  const requested = new Set(taskIds);
  return TASKS.filter(task => requested.has(task.id)).map(task => task.id);
}

function getResearcherFormSettings() {
  return {
    protocolId: elements.protocolPreset.value,
    feedbackMode: elements.feedbackMode.value,
    selectedTaskIds: Array.from(elements.taskSelections)
      .filter(input => input.checked && !input.disabled)
      .map(input => input.value)
  };
}

function validateSessionSettings(settings) {
  const preset = PROTOCOL_PRESETS[settings.protocolId];
  if (!preset || !PARTICIPANT_LINK.feedbackModes.includes(settings.feedbackMode)) {
    throw new Error('Unsupported session settings.');
  }

  const requestedTaskIds = Array.isArray(settings.selectedTaskIds) ? settings.selectedTaskIds : [];
  const uniqueTaskIds = new Set(requestedTaskIds);
  const knownTaskIds = new Set(TASKS.map(task => task.id));
  if (
    requestedTaskIds.length === 0 ||
    uniqueTaskIds.size !== requestedTaskIds.length ||
    requestedTaskIds.some(taskId => !knownTaskIds.has(taskId))
  ) {
    throw new Error('Invalid task selection.');
  }

  const selectedTaskIds = canonicalizeTaskIds(requestedTaskIds);
  const stimulusSet = getStimulusSetForProtocol(preset);
  if (selectedTaskIds.some(taskId => (
    !stimulusSet.tasks[taskId] || stimulusSet.tasks[taskId].fileCount !== BASE_CONFIG.numSteps
  ))) {
    throw new Error('A selected task is unavailable for this study profile.');
  }

  return Object.freeze({
    protocolId: preset.id,
    preset,
    stimulusSet,
    selectedTaskIds: Object.freeze(selectedTaskIds),
    feedbackMode: settings.feedbackMode
  });
}

function participantLinkParameters(
  validatedSettings,
  language,
  metadata = studyMetadata,
  linkSessionType = sessionType
) {
  const params = new URLSearchParams();
  params.set('mode', PARTICIPANT_LINK.mode);
  params.set('link_version', PARTICIPANT_LINK.schemaVersion);
  params.set('battery_version', IMPLEMENTATION.batteryVersion);
  params.set('deployment_id', deploymentConfig.deploymentId);
  params.set('deployment_config_sha256', deploymentConfigSha256);
  params.set('session_type', linkSessionType);
  params.set('protocol', validatedSettings.protocolId);
  params.set('protocol_version', validatedSettings.preset.version);
  params.set('catalog_sha256', STIMULUS_CATALOG.sha256);
  params.set('stimulus_set', validatedSettings.stimulusSet.id);
  params.set('manifest_sha256', validatedSettings.stimulusSet.manifestSha256);
  params.set('tasks', validatedSettings.selectedTaskIds.join(','));
  params.set('feedback', validatedSettings.feedbackMode);
  params.set('lang', language);
  params.set('study_id', metadata.studyId);
  params.set('condition_id', metadata.conditionId);
  params.set('site_id', metadata.siteId);
  params.set('distribution_id', metadata.distributionId);
  params.set('study_title', metadata.studyTitle);
  params.set('institution', metadata.institutionName);
  params.set('consent_version', metadata.consentVersion);
  params.set('expected_minutes', String(metadata.expectedMinutes));
  params.set('consent_url', metadata.consentUrl);
  params.set('contact_url', metadata.contactUrl);
  params.set('return_url', metadata.returnUrl);
  return params;
}

function isLocalPreviewUrl(url) {
  return Boolean(globalThis.DeploymentPolicy && DeploymentPolicy.isLoopbackLocation(url));
}

function buildParticipantLink(validatedSettings, language = currentLanguage, metadata = studyMetadata) {
  if (!isSupportedLanguage(language)) throw new Error('Unsupported language.');
  if (!deploymentConfig || !deploymentContext || !deploymentConfigSha256 || !globalThis.DeploymentPolicy) {
    throw new Error('Build identity unavailable.');
  }
  const linkSessionType = deploymentContext.localTest ? 'test' : 'research';
  const authorizedResearcher = deploymentContext.participantLinkIssuanceAllowed;
  if (!authorizedResearcher) throw new Error('Unshareable participant link origin.');
  const url = new URL(DeploymentPolicy.participantBaseUrl(deploymentConfig, window.location.href));
  url.search = participantLinkParameters(
    validatedSettings,
    language,
    metadata,
    linkSessionType
  ).toString();
  url.hash = '';
  if (url.toString().length > MAX_PARTICIPANT_LINK_LENGTH) {
    throw new Error('Participant link is too long.');
  }
  return url.toString();
}

function invalidLinkLanguage(params) {
  const languages = params.getAll('lang');
  return languages.length === 1 && isSupportedLanguage(languages[0]) ? languages[0] : 'en';
}

function parseParticipantLink() {
  const params = new URL(window.location.href).searchParams;
  const modes = params.getAll('mode');
  if (modes.length === 0) {
    const languages = params.getAll('lang');
    const parameterNames = Array.from(params.keys());
    if (parameterNames.length === 0) return { kind: 'researcher', language: 'en' };
    if (
      parameterNames.length === 1 &&
      parameterNames[0] === 'lang' &&
      languages.length === 1 &&
      isSupportedLanguage(languages[0])
    ) {
      return { kind: 'researcher', language: languages[0] };
    }
    return { kind: 'invalid', language: invalidLinkLanguage(params) };
  }

  const language = invalidLinkLanguage(params);
  try {
    if (modes.length !== 1 || modes[0] !== PARTICIPANT_LINK.mode) {
      throw new Error('Invalid participant mode.');
    }

    const allowedNames = new Set(PARTICIPANT_LINK.parameterNames);
    for (const name of params.keys()) {
      if (!allowedNames.has(name)) throw new Error('Unknown participant-link parameter.');
    }
    PARTICIPANT_LINK.parameterNames.forEach(name => {
      if (params.getAll(name).length !== 1) throw new Error('Missing or duplicate participant-link parameter.');
    });

    if (
      params.get('link_version') !== PARTICIPANT_LINK.schemaVersion ||
      params.get('battery_version') !== IMPLEMENTATION.batteryVersion ||
      params.get('deployment_id') !== deploymentConfig?.deploymentId ||
      params.get('deployment_config_sha256') !== deploymentConfigSha256 ||
      params.get('session_type') !== sessionType ||
      !isSupportedLanguage(params.get('lang'))
    ) {
      throw new Error('Unsupported participant-link version or language.');
    }

    const rawTaskIds = params.get('tasks').split(',');
    const validatedSettings = validateSessionSettings({
      protocolId: params.get('protocol'),
      feedbackMode: params.get('feedback'),
      selectedTaskIds: rawTaskIds
    });
    if (validatedSettings.selectedTaskIds.join(',') !== params.get('tasks')) {
      throw new Error('Tasks are not in canonical order.');
    }
    if (
      params.get('protocol_version') !== validatedSettings.preset.version ||
      params.get('catalog_sha256') !== STIMULUS_CATALOG.sha256 ||
      params.get('stimulus_set') !== validatedSettings.stimulusSet.id ||
      params.get('manifest_sha256') !== validatedSettings.stimulusSet.manifestSha256
    ) {
      throw new Error('Participant-link provenance does not match this battery.');
    }
    if (!deploymentContext?.participantSessionAllowed) {
      throw new Error('This deployment origin cannot run participant sessions.');
    }
    if (
      (params.get('session_type') === 'test') !== Boolean(deploymentContext.localTest) ||
      (params.get('session_type') === 'research' && deploymentContext.localTest)
    ) {
      throw new Error('Participant-link session type does not match this deployment.');
    }

    const parsedStudyMetadata = validateStudyMetadata({
      studyId: params.get('study_id'),
      conditionId: params.get('condition_id'),
      siteId: params.get('site_id'),
      distributionId: params.get('distribution_id'),
      studyTitle: params.get('study_title'),
      institutionName: params.get('institution'),
      consentVersion: params.get('consent_version'),
      expectedMinutes: Number(params.get('expected_minutes')),
      consentUrl: params.get('consent_url'),
      contactUrl: params.get('contact_url'),
      returnUrl: params.get('return_url')
    }, { requireReturnUrl: true });

    const canonicalConfig = participantLinkParameters(
      validatedSettings,
      params.get('lang'),
      parsedStudyMetadata,
      params.get('session_type')
    ).toString();
    if (window.location.href.split('#')[0].length > MAX_PARTICIPANT_LINK_LENGTH) {
      throw new Error('Participant link is too long.');
    }
    if (canonicalConfig !== params.toString()) {
      throw new Error('Participant-link parameters are not canonical.');
    }
    return {
      kind: 'participant',
      language: params.get('lang'),
      validatedSettings,
      studyMetadata: parsedStudyMetadata,
      canonicalConfig
    };
  } catch (error) {
    console.error('Participant link validation failed:', error);
    return { kind: 'invalid', language };
  }
}

function updateEntryModeUi() {
  const fromParticipantLink = configurationSource === 'participant_link';
  if (elements.editSettings) elements.editSettings.hidden = fromParticipantLink;
  if (elements.participantLinkNotice) elements.participantLinkNotice.hidden = !fromParticipantLink;
}

function checkpointIsCompatible(snapshot, validatedSettings, metadata) {
  if (!snapshot || snapshot.battery_version !== IMPLEMENTATION.batteryVersion) return false;
  const settings = snapshot.settings || {};
  const expectedTasks = validatedSettings.selectedTaskIds;
  const storedTasks = Array.isArray(settings.selected_task_ids) ? settings.selected_task_ids : [];
  if (
    settings.protocol_id !== validatedSettings.protocolId ||
    settings.protocol_version !== validatedSettings.preset.version ||
    settings.feedback_mode !== validatedSettings.feedbackMode ||
    settings.session_type !== sessionType ||
    settings.deployment_id !== deploymentConfig?.deploymentId ||
    settings.deployment_config_sha256 !== deploymentConfigSha256 ||
    settings.catalog_sha256 !== STIMULUS_CATALOG.sha256 ||
    settings.stimulus_set_id !== validatedSettings.stimulusSet.id ||
    settings.manifest_sha256 !== validatedSettings.stimulusSet.manifestSha256 ||
    snapshot.app_build_sha256 !== appBuildSha256 ||
    snapshot.app_script_sha256 !== appScriptSha256 ||
    snapshot.session_type !== sessionType ||
    snapshot.deployment_id !== deploymentConfig?.deploymentId ||
    snapshot.deployment_environment !== deploymentConfig?.environment ||
    snapshot.deployment_config_sha256 !== deploymentConfigSha256 ||
    snapshot.app_origin !== window.location.origin ||
    storedTasks.join('|') !== expectedTasks.join('|') ||
    JSON.stringify(snapshot.study_metadata || {}) !== JSON.stringify(metadata)
  ) return false;
  if (configurationSource === 'participant_link') {
    return snapshot.configuration_source === 'participant_link' &&
      snapshot.participant_link_config === participantLinkConfig;
  }
  return snapshot.configuration_source === 'researcher_ui';
}

function checkpointStructureIsValid(snapshot) {
  const allowedPhases = new Set([
    'overview', 'instructions', 'practice', 'awaiting_main', 'main',
    'task_complete', 'complete', 'technical_error', 'technical_failure'
  ]);
  const taskIds = Array.isArray(snapshot.task_order_ids) ? snapshot.task_order_ids : [];
  const selectedIds = researcherSettings.selectedTaskIds;
  const uniqueTaskIds = new Set(taskIds);
  const taskMap = new Map(TASKS.map(task => [task.id, task]));
  const staircase = snapshot.staircase_state || {};
  const practice = snapshot.practice_state || {};
  const summaries = Array.isArray(snapshot.task_summaries) ? snapshot.task_summaries : [];
  const currentRows = Array.isArray(snapshot.current_results) ? snapshot.current_results : [];
  const completedRows = Array.isArray(snapshot.all_results) ? snapshot.all_results : [];
  if (
    !allowedPhases.has(snapshot.phase) ||
    !new Set(['in_progress', 'completed', 'technical_failure']).has(snapshot.session_status) ||
    (snapshot.session_status === 'completed' && !['task_complete', 'complete'].includes(snapshot.phase)) ||
    (snapshot.session_status === 'technical_failure' && snapshot.phase !== 'technical_failure') ||
    !PARTICIPANT_CODE_PATTERN.test(String(snapshot.subject_id || '')) ||
    !String(snapshot.session_run_id || '') ||
    !String(snapshot.owner || '') ||
    !Number.isInteger(snapshot.revision) || snapshot.revision < 1 ||
    !/^[a-f0-9]{64}$/.test(String(snapshot.app_build_sha256 || '')) ||
    !/^[a-f0-9]{64}$/.test(String(snapshot.app_script_sha256 || '')) ||
    snapshot.session_type !== sessionType ||
    snapshot.deployment_id !== deploymentConfig?.deploymentId ||
    snapshot.deployment_environment !== deploymentConfig?.environment ||
    snapshot.deployment_config_sha256 !== deploymentConfigSha256 ||
    snapshot.app_origin !== window.location.origin ||
    typeof snapshot.preflight_audio_passed !== 'boolean' ||
    taskIds.length !== selectedIds.length || uniqueTaskIds.size !== taskIds.length ||
    taskIds.some(id => !taskMap.has(id)) ||
    [...taskIds].sort().join('|') !== [...selectedIds].sort().join('|') ||
    !Number.isInteger(snapshot.current_task_index) ||
    snapshot.current_task_index < 0 || snapshot.current_task_index >= taskIds.length ||
    (snapshot.phase === 'overview'
      ? snapshot.current_task_id !== ''
      : snapshot.current_task_id !== taskIds[snapshot.current_task_index]) ||
    !Number.isInteger(staircase.currentTrial) || staircase.currentTrial < 0 ||
    staircase.currentTrial > config.maxTrials ||
    !Number.isInteger(staircase.currentStep) || staircase.currentStep < 2 || staircase.currentStep > config.numSteps ||
    !Number.isInteger(staircase.numReversals) ||
    !Array.isArray(staircase.reversalLevels) || staircase.reversalLevels.length !== staircase.numReversals ||
    staircase.reversalLevels.some(level => !Number.isFinite(level) || level < 1 || level > 100) ||
    !Number.isInteger(practice.currentTrial) || practice.currentTrial < 0 || practice.currentTrial > practiceConfig.trials ||
    !Array.isArray(practice.order) || ![0, practiceConfig.trials].includes(practice.order.length) ||
    practice.order.some(value => value !== 0 && value !== 1) ||
    !Array.isArray(snapshot.stimulus_order) ||
    (snapshot.stimulus_order.length !== 0 && snapshot.stimulus_order.length !== config.maxTrials) ||
    (snapshot.phase === 'main' && snapshot.stimulus_order.length !== config.maxTrials) ||
    snapshot.stimulus_order.some(value => value !== 0 && value !== 1) ||
    (snapshot.phase !== 'task_complete' && snapshot.phase !== 'complete' &&
      staircase.currentTrial !== currentRows.length) ||
    summaries.some((summary, index) => summary.task_id !== taskIds[index] || summary.order !== index + 1) ||
    summaries.length > taskIds.length
  ) return false;
  const currentTaskId = taskIds[snapshot.current_task_index];
  if (currentRows.some(row => row.task_id !== currentTaskId)) return false;
  return [...currentRows, ...completedRows].every(row => (
    row && row.subject_id === snapshot.subject_id &&
    row.session_run_id === snapshot.session_run_id &&
    row.battery_version === IMPLEMENTATION.batteryVersion &&
    row.session_type === sessionType &&
    row.deployment_id === deploymentConfig?.deploymentId &&
    row.deployment_environment === deploymentConfig?.environment &&
    row.deployment_config_sha256 === deploymentConfigSha256 &&
    row.app_origin === window.location.origin
  ));
}

function claimCheckpoint(snapshot) {
  const currentRaw = localStorage.getItem(checkpointKey());
  if (!currentRaw) throw new Error('Checkpoint conflict.');
  const current = JSON.parse(currentRaw);
  if (
    current.session_run_id !== snapshot.session_run_id ||
    current.owner !== snapshot.owner ||
    Number(current.revision || 0) !== Number(snapshot.revision || 0)
  ) throw new Error('Checkpoint conflict.');
  checkpointTakeover = {
    sessionRunId: current.session_run_id,
    owner: current.owner,
    revision: Number(current.revision || 0)
  };
}

function restoreCheckpoint(snapshot) {
  if (!checkpointStructureIsValid(snapshot)) throw new Error('Invalid checkpoint structure.');
  claimCheckpoint(snapshot);
  runGeneration += 1;
  subjectId = snapshot.subject_id;
  sessionRunId = snapshot.session_run_id;
  sessionStatus = snapshot.session_status;
  sessionStartedAt = snapshot.session_started_at_utc || '';
  sessionEndedAt = snapshot.session_ended_at_utc || '';
  sessionCompletedAt = snapshot.session_completed_at || '';
  sessionLanguageAtStart = snapshot.session_language_at_start || configuredInitialLanguage;
  sessionLanguageAtCompletion = snapshot.session_language_at_completion || '';
  statusReason = snapshot.status_reason || '';
  taskOrder = snapshot.task_order_ids.map(id => TASKS.find(task => task.id === id));
  currentTaskIndex = snapshot.current_task_index;
  currentTask = snapshot.current_task_id ? taskOrder[currentTaskIndex] : null;
  taskStartedAt = snapshot.task_started_at_utc || '';
  taskCompletedAt = snapshot.task_completed_at_utc || '';
  state = { ...snapshot.staircase_state, reversalLevels: snapshot.staircase_state.reversalLevels.slice() };
  practiceState = { ...snapshot.practice_state, order: snapshot.practice_state.order.slice() };
  stimOrder = snapshot.stimulus_order.slice();
  currentResults.splice(0, currentResults.length, ...snapshot.current_results.map(expandCheckpointRow));
  allResults.splice(0, allResults.length, ...snapshot.all_results.map(expandCheckpointRow));
  taskSummaries.splice(0, taskSummaries.length, ...snapshot.task_summaries.map(summary => ({
    ...summary,
    task: TASKS.find(task => task.id === summary.task_id)
  })));
  checkpointRevision = snapshot.revision || 0;
  checkpointOwner = createSessionRunId();
  sessionScriptSha256 = snapshot.app_script_sha256;
  sessionBuildSha256 = snapshot.app_build_sha256;
  sessionDeploymentConfigSha256 = snapshot.deployment_config_sha256;
  configuredInitialLanguage = snapshot.configured_initial_language || configuredInitialLanguage;
  resumeCount = Number(snapshot.resume_count || 0) + 1;
  interruptedPresentationCount = Number(snapshot.interrupted_presentation_count || 0);
  visibilityInterruptionCount = Number(snapshot.visibility_interruption_count || 0);
  consentConfirmedAt = snapshot.consent_confirmed_at_utc || '';
  preflightCompletedAt = snapshot.preflight_completed_at_utc || '';
  preflightAudioPassed = snapshot.preflight_audio_passed;
  replayedInterruptedPresentation = Boolean(snapshot.active_presentation);
  activePresentation = null;
  responseWindowStart = null;
  trialState = {};
  resultsBundleDownloaded = false;
  elements.overviewParticipantCode.textContent = subjectId;
  if (isSupportedLanguage(snapshot.current_language)) {
    setLanguage(snapshot.current_language, { preserveParticipantLink: true });
  }
  renderOrderList();

  const phase = snapshot.phase;
  if (phase === 'overview') {
    saveCheckpoint('overview', null);
    showSection('overview');
    return;
  }
  if (phase === 'task_complete') {
    renderTaskCompletePanel();
    saveCheckpoint('task_complete', null);
    showSection('taskComplete');
    return;
  }
  if (phase === 'complete' || phase === 'technical_failure') {
    renderParticipantCompletion();
    saveCheckpoint(phase, null);
    showSection('complete');
    return;
  }
  prepareTask(currentTask, { preserveState: true, writeCheckpoint: false });
  if (phase === 'instructions') {
    saveCheckpoint('instructions', null);
    return;
  }
  if (phase === 'awaiting_main') {
    awaitingTestStart = true;
    elements.startPractice.disabled = true;
    elements.startPractice.textContent = t('practiceCompletedButton');
    elements.startTest.disabled = false;
    elements.startTest.textContent = t('startMainEnabled');
    elements.practiceStatus.textContent = t('practiceCompleteStatus');
    saveCheckpoint('awaiting_main', null);
    return;
  }
  if (phase === 'technical_error') {
    activePresentation = snapshot.active_presentation || null;
    enterTechnicalError(snapshot.status_reason || 'AUDIO_PLAYBACK_FAILED', snapshot.active_presentation?.mode || 'test');
    return;
  }
  if (phase === 'practice') {
    if (replayedInterruptedPresentation) interruptedPresentationCount += 1;
    saveCheckpoint('practice', null);
    showSection('trial');
    runPracticeTrial();
    return;
  }
  if (phase === 'main') {
    if (replayedInterruptedPresentation) interruptedPresentationCount += 1;
    saveCheckpoint('main', null);
    showSection('trial');
    nextTrial();
  }
}

function offerCheckpoint(snapshot, compatible) {
  pendingCheckpoint = snapshot;
  elements.resumeSavedSession.disabled = !compatible;
  elements.resumeParticipantCode.disabled = !compatible;
  elements.resumeParticipantCode.value = '';
  elements.resumeParticipantCode.removeAttribute('aria-invalid');
  elements.resumeCodeError.textContent = '';
  const description = compatible
    ? t('resume.description', {
      saved: snapshot.saved_at_utc || t('notAvailable'),
      status: snapshot.session_status || t('notAvailable')
    })
    : t('resume.incompatible');
  elements.resumeDescription.textContent = compatible && snapshot.active_presentation
    ? `${description} ${t('resume.interrupted')}`
    : description;
  showSection('resumeSession');
}

function applySessionSettings(validatedSettings, metadata = {}) {
  assertSessionAuthorization(metadata.configurationSource || 'researcher_ui');
  resetSessionData();
  researcherSettings.selectedTaskIds = validatedSettings.selectedTaskIds.slice();
  researcherSettings.protocolId = validatedSettings.protocolId;
  researcherSettings.feedbackMode = validatedSettings.feedbackMode;
  config = Object.freeze({ ...BASE_CONFIG, ...validatedSettings.preset });
  state = createState();
  sessionDefinition = Object.freeze({
    bindingId: validatedSettings.preset.stimulusBindingId,
    protocolId: validatedSettings.preset.id,
    protocolVersion: validatedSettings.preset.version,
    stimulusSetId: validatedSettings.stimulusSet.id,
    stimulusSet: validatedSettings.stimulusSet
  });
  configurationSource = metadata.configurationSource || 'researcher_ui';
  participantLinkSchemaVersion = metadata.participantLinkSchemaVersion || '';
  participantLinkValidationStatus = metadata.participantLinkValidationStatus || 'not_applicable';
  participantLinkConfig = metadata.participantLinkConfig || '';
  configuredInitialLanguage = metadata.configuredInitialLanguage || currentLanguage;
  administrationMode = metadata.administrationMode || 'supervised';
  studyMetadata = validateStudyMetadata(metadata.studyMetadata || {}, {
    requireReturnUrl: administrationMode === 'remote_manual_upload'
  });
  settingsLocked = true;

  elements.protocolPreset.value = validatedSettings.protocolId;
  elements.feedbackMode.value = validatedSettings.feedbackMode;
  Array.from(elements.taskSelections).forEach(input => {
    input.checked = validatedSettings.selectedTaskIds.includes(input.value);
    delete input.dataset.checkedBeforeProfileDisable;
  });
  setResearcherError();
  updateResearcherDescriptions();
  updateParticipantSetupCopy();
  updateEntryModeUi();
  renderParticipantLanding();
  const saved = readCheckpoint();
  if (saved) {
    offerCheckpoint(saved, checkpointIsCompatible(saved, validatedSettings, studyMetadata));
    return;
  }
  elements.consentConfirmed.checked = false;
  elements.landingError.textContent = '';
  showSection('participantLanding');
}

function clearParticipantLink() {
  if (!elements.participantLinkOutput) return;
  elements.participantLinkOutput.hidden = true;
  elements.participantLink.value = '';
  elements.participantLinkStatus.textContent = '';
}

async function createParticipantLink() {
  if (elements.createParticipantLink.disabled) return;
  elements.createParticipantLink.disabled = true;
  try {
    await buildIdentityPromise;
    if (!appBuildSha256 || !appScriptSha256) throw new Error('Build identity unavailable.');
    const validatedSettings = validateSessionSettings(getResearcherFormSettings());
    const metadata = getStudyMetadataFromForm({ requireReturnUrl: true });
    const linkLanguage = elements.participantLinkLanguage.value;
    elements.participantLink.value = buildParticipantLink(validatedSettings, linkLanguage, metadata);
    elements.participantLinkOutput.hidden = false;
    const statusKey = isLocalPreviewUrl(new URL(elements.participantLink.value))
      ? 'deployment.testLinkCreated'
      : 'participantLink.created';
    elements.participantLinkStatus.textContent = t(statusKey, {
      language: t(`participantLink.language.${linkLanguage}`)
    });
    setResearcherError();
  } catch (error) {
    const errorKey = error.message === 'Invalid task selection.'
      ? 'selectAtLeastOneTask'
      : error.message === 'Build identity unavailable.'
        ? 'researcherSetup.buildUnavailable'
        : error.message === 'Unshareable participant link origin.'
        ? 'participantLink.unshareable'
        : error.message === 'Return URL origin is not allowed.'
          ? 'deployment.returnOriginBlocked'
        : error.message === 'Participant link is too long.'
          ? 'studyDetails.invalid'
        : !elements.returnUrl.value.trim()
          ? 'studyDetails.returnRequired'
          : error.message === 'Invalid study metadata.' || error.message === 'Invalid HTTPS URL.'
            ? 'studyDetails.invalid'
            : 'unavailableTaskSelection';
    setResearcherError(errorKey);
    clearParticipantLink();
  } finally {
    renderDeploymentState();
  }
}

async function copyParticipantLink() {
  const link = elements.participantLink.value;
  if (!link) return;
  const previouslyFocused = document.activeElement;
  try {
    let copied = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(link);
        copied = true;
      } catch (error) {
        copied = false;
      }
    }
    if (!copied) {
      elements.participantLink.select();
      copied = typeof document.execCommand === 'function' && document.execCommand('copy');
      elements.participantLink.setSelectionRange(0, 0);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    }
    if (!copied) throw new Error('Copy command failed.');
    elements.participantLinkStatus.textContent = t('participantLink.copied');
  } catch (error) {
    elements.participantLinkStatus.textContent = t('participantLink.copyFailed');
    elements.participantLink.focus();
    elements.participantLink.select();
  }
}

function openParticipantLink() {
  const link = elements.participantLink.value;
  if (!link) return;
  const opened = window.open(link, '_blank');
  if (opened) {
    opened.opener = null;
  } else {
    elements.participantLinkStatus.textContent = t('participantLink.openFailed');
  }
}

function createSessionRunId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
    const values = new Uint32Array(4);
    window.crypto.getRandomValues(values);
    return Array.from(values, value => value.toString(16).padStart(8, '0')).join('-');
  }
  return `run-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function calculateAppBuildIdentity() {
  if (
    !globalThis.ResultBundle || !ResultBundle.isSha256Available() ||
    !globalThis.DeploymentPolicy || typeof globalThis.TextDecoder !== 'function'
  ) return false;
  try {
    const entries = await Promise.all(APP_BUILD_ASSETS.map(async name => {
      const response = await fetch(new URL(name, window.location.href), { cache: 'no-store' });
      if (!response.ok) throw new Error(`Could not load ${name} for build verification.`);
      const bytes = await response.arrayBuffer();
      const sha256 = await ResultBundle.sha256Hex(bytes);
      if (!sha256) throw new Error(`Could not hash ${name}.`);
      return [name, sha256, bytes];
    }));
    appAssetSha256 = Object.freeze(Object.fromEntries(entries.map(([name, sha256]) => [name, sha256])));
    const configEntry = entries.find(([name]) => name === DEPLOYMENT_CONFIG_FILE);
    if (!configEntry) throw new Error('Deployment configuration was not included in the build.');
    const configText = new TextDecoder('utf-8', { fatal: true }).decode(configEntry[2]);
    deploymentConfig = DeploymentPolicy.validateConfig(JSON.parse(configText));
    deploymentConfigSha256 = appAssetSha256[DEPLOYMENT_CONFIG_FILE] || '';
    deploymentContext = DeploymentPolicy.contextFor(deploymentConfig, window.location.href);
    sessionType = deploymentContext.sessionType;
    appScriptSha256 = appAssetSha256['script.js'] || '';
    const descriptor = APP_BUILD_ASSETS.map(name => `${name}:${appAssetSha256[name]}`).join('\n');
    appBuildSha256 = await ResultBundle.sha256Hex(descriptor) || '';
    renderBuildInfo();
    deploymentConfigError = '';
    return Boolean(appBuildSha256 && appScriptSha256 && deploymentConfigSha256);
  } catch (error) {
    console.error('Build identity calculation failed:', error);
    deploymentConfigError = String(error?.message || error || 'Deployment configuration unavailable.');
    deploymentConfig = null;
    deploymentContext = null;
    deploymentConfigSha256 = '';
    sessionType = '';
    appScriptSha256 = '';
    appBuildSha256 = '';
    appAssetSha256 = Object.freeze({});
    renderBuildInfo();
    return false;
  }
}

function offerSupervisedCheckpointAtEntry() {
  const saved = readCheckpoint();
  if (
    !saved || saved.corrupt ||
    saved.configuration_source !== 'researcher_ui' ||
    saved.administration_mode !== 'supervised'
  ) return false;
  try {
    const settings = saved.settings || {};
    const validatedSettings = validateSessionSettings({
      protocolId: settings.protocol_id,
      feedbackMode: settings.feedback_mode,
      selectedTaskIds: settings.selected_task_ids
    });
    if (isSupportedLanguage(saved.current_language)) {
      setLanguage(saved.current_language, { preserveParticipantLink: true });
    }
    applySessionSettings(validatedSettings, {
      configurationSource: 'researcher_ui',
      administrationMode: 'supervised',
      participantLinkValidationStatus: 'not_applicable',
      configuredInitialLanguage: saved.configured_initial_language || 'en',
      studyMetadata: saved.study_metadata
    });
    return true;
  } catch (error) {
    console.error('Saved supervised session could not be opened:', error);
    return false;
  }
}

async function initializeApp() {
  buildIdentityPromise = calculateAppBuildIdentity();
  const buildReady = await buildIdentityPromise;
  if (!buildReady || !deploymentConfig || !deploymentContext) {
    const params = new URL(window.location.href).searchParams;
    setLanguage(isSupportedLanguage(params.get('lang')) ? params.get('lang') : 'en', {
      preserveParticipantLink: true
    });
    elements.deploymentBlockedMessage.textContent = t('deployment.blocked.message');
    showSection('deploymentBlocked');
    return;
  }
  const entry = parseParticipantLink();
  setLanguage(entry.language, { preserveParticipantLink: true });
  if (entry.kind === 'invalid') {
    showSection('invalidLink');
    return;
  }
  if (entry.kind === 'participant') {
    applySessionSettings(entry.validatedSettings, {
      configurationSource: 'participant_link',
      administrationMode: 'remote_manual_upload',
      participantLinkSchemaVersion: PARTICIPANT_LINK.schemaVersion,
      participantLinkValidationStatus: 'passed',
      participantLinkConfig: entry.canonicalConfig,
      configuredInitialLanguage: entry.language,
      studyMetadata: entry.studyMetadata
    });
    return;
  }
  if (!deploymentContext.researcherUiAllowed) {
    elements.deploymentBlockedMessage.textContent = t('deployment.originBlocked');
    showSection('deploymentBlocked');
    return;
  }
  configurationSource = 'researcher_ui';
  participantLinkSchemaVersion = '';
  participantLinkValidationStatus = 'not_applicable';
  participantLinkConfig = '';
  configuredInitialLanguage = entry.language;
  if (offerSupervisedCheckpointAtEntry()) return;
  updateEntryModeUi();
  showSection('researcherSetup');
}

function resetSessionData() {
  runGeneration += 1;
  cancelPlayback();
  cancelPreflightPlayback();
  subjectId = '';
  taskOrder = [];
  currentTaskIndex = 0;
  currentTask = null;
  stimOrder = [];
  responseWindowStart = null;
  trialState = {};
  audioPool = [];
  baseAudioA = null;
  baseAudioB = null;
  warmupPromise = null;
  state = createState();
  practiceState = createPracticeState();
  awaitingTestStart = false;
  sessionCompletedAt = '';
  sessionLanguageAtStart = '';
  sessionLanguageAtCompletion = '';
  sessionRunId = '';
  sessionStatus = 'not_started';
  sessionStartedAt = '';
  sessionEndedAt = '';
  sessionPhase = 'not_started';
  statusReason = '';
  technicalErrorCode = '';
  lastFailedTrialMode = '';
  preflightAudioPassed = false;
  preflightTestState = 'not_tested';
  resultsBundleDownloaded = false;
  pendingCheckpoint = null;
  checkpointRevision = 0;
  checkpointOwner = '';
  checkpointTakeover = null;
  pendingDeletionAction = null;
  activePresentation = null;
  resumeCount = 0;
  interruptedPresentationCount = 0;
  replayedInterruptedPresentation = false;
  taskStartedAt = '';
  taskCompletedAt = '';
  consentConfirmedAt = '';
  preflightCompletedAt = '';
  visibilityInterruptionCount = 0;
  sessionScriptSha256 = '';
  sessionBuildSha256 = '';
  sessionDeploymentConfigSha256 = '';
  currentResults.length = 0;
  allResults.length = 0;
  taskSummaries.length = 0;
  elements.subjectId.value = '';
  elements.subjectId.removeAttribute('aria-invalid');
  elements.subjectIdError.textContent = '';
  elements.resumeParticipantCode.value = '';
  elements.resumeParticipantCode.removeAttribute('aria-invalid');
  elements.resumeCodeError.textContent = '';
  elements.overviewParticipantCode.textContent = '';
  elements.decideOrder.disabled = false;
  elements.beginBattery.disabled = false;
  elements.startPractice.disabled = true;
  elements.startTest.disabled = true;
  elements.nextTaskButton.disabled = false;
  elements.playTestSound.disabled = false;
  elements.continueToCode.disabled = false;
  elements.retryAudio.textContent = t('technicalError.retry');
  elements.endTechnicalSession.hidden = false;
  elements.nextParticipant.disabled = true;
  elements.exportStatus.textContent = t('researcherResults.exportPending');
  elements.participantReturnStatus.textContent = '';
}

async function lockResearchSettings() {
  if (elements.lockSettings.disabled) return;
  elements.lockSettings.disabled = true;
  try {
    await buildIdentityPromise;
    if (!appBuildSha256 || !appScriptSha256) throw new Error('Build identity unavailable.');
    assertSessionAuthorization('researcher_ui');
    const validatedSettings = validateSessionSettings(getResearcherFormSettings());
    const metadata = getStudyMetadataFromForm();
    applySessionSettings(validatedSettings, {
      configurationSource: 'researcher_ui',
      administrationMode: 'supervised',
      participantLinkValidationStatus: 'not_applicable',
      configuredInitialLanguage: currentLanguage,
      studyMetadata: metadata
    });
  } catch (error) {
    setResearcherError(
      error.message === 'Build identity unavailable.'
        ? 'researcherSetup.buildUnavailable'
        : error.message === 'Deployment origin is not authorized.'
          ? 'deployment.originBlocked'
        : error.message === 'Return URL origin is not allowed.'
          ? 'deployment.returnOriginBlocked'
        : error.message === 'Invalid task selection.'
        ? 'selectAtLeastOneTask'
        : error.message === 'Invalid study metadata.' || error.message === 'Invalid HTTPS URL.'
          ? 'studyDetails.invalid'
          : 'unavailableTaskSelection'
    );
  } finally {
    renderDeploymentState();
  }
}

function continueFromLanding() {
  if (!elements.consentConfirmed.checked) {
    elements.landingError.textContent = t('landing.consentRequired');
    elements.consentConfirmed.focus();
    return;
  }
  elements.landingError.textContent = '';
  consentConfirmedAt = new Date().toISOString();
  cancelPreflightPlayback();
  preflightAudioPassed = false;
  preflightTestState = 'not_tested';
  renderPreflightStatus();
  elements.preflightError.textContent = '';
  Array.from(elements.preflightChecks).forEach(input => { input.checked = false; });
  elements.continueToCode.disabled = false;
  showSection('preflight');
}

function renderPreflightStatus() {
  const key = {
    not_tested: 'preflight.notTested',
    playing: 'preflight.playing',
    passed: 'preflight.passed',
    failed: 'preflight.failed',
    interrupted: 'preflight.interrupted'
  }[preflightTestState] || 'preflight.notTested';
  elements.preflightStatus.textContent = t(key);
}

async function playPreflightTestSound() {
  if (elements.playTestSound.disabled) return;
  if (!navigator.onLine) {
    elements.preflightError.textContent = t('preflight.offline');
    return;
  }
  cancelPreflightPlayback();
  const generation = ++preflightGeneration;
  const controller = new AbortController();
  preflightAbortController = controller;
  preflightAudioPassed = false;
  preflightTestState = 'playing';
  elements.playTestSound.disabled = true;
  elements.continueToCode.disabled = true;
  elements.preflightError.textContent = '';
  renderPreflightStatus();
  const testTask = TASKS.find(task => researcherSettings.selectedTaskIds.includes(task.id));
  try {
    preflightAudio = createAudio(stimulusUrl(testTask, practiceConfig.baseStep));
    const hadError = await playAndWait(preflightAudio, controller.signal);
    if (generation !== preflightGeneration || controller.signal.aborted) return;
    preflightAudioPassed = !hadError;
    preflightTestState = hadError ? 'failed' : 'passed';
    renderPreflightStatus();
    if (hadError) elements.preflightError.textContent = t('preflight.failed');
  } catch (error) {
    if (generation !== preflightGeneration || controller.signal.aborted) return;
    preflightAudioPassed = false;
    preflightTestState = 'failed';
    renderPreflightStatus();
    elements.preflightError.textContent = t('preflight.failed');
  } finally {
    if (generation === preflightGeneration) {
      preflightAbortController = null;
      elements.playTestSound.disabled = false;
      elements.continueToCode.disabled = false;
    }
  }
}

function continueFromPreflight() {
  const checksComplete = Array.from(elements.preflightChecks)
    .filter(input => !input.disabled)
    .every(input => input.checked);
  if (!checksComplete || !preflightAudioPassed) {
    elements.preflightError.textContent = t('preflight.incomplete');
    return;
  }
  if (!sessionAuthorizationAllowed()) {
    elements.preflightError.textContent = t('deployment.originBlocked');
    return;
  }
  if (!probeCheckpointStorage()) {
    elements.preflightError.textContent = t('checkpoint.unavailable');
    return;
  }
  elements.preflightError.textContent = '';
  preflightCompletedAt = new Date().toISOString();
  updateParticipantSetupCopy();
  showSection('setup');
}

function stopAndDeleteSession() {
  const interruptedPreflight = Boolean(preflightAbortController);
  const interruptedTask = Boolean(
    sessionStatus === 'in_progress' &&
    ['practice', 'main'].includes(sessionPhase) &&
    (playbackAbortController || activePresentation || responseWindowStart)
  );
  const interruptedTaskMode = trialState.mode === 'practice' ? 'practice' : 'test';
  const interruptedPresentation = activePresentation ? { ...activePresentation } : null;
  cancelPlayback();
  cancelPreflightPlayback();
  if (!window.confirm(t('session.stopConfirm'))) {
    if (interruptedPreflight) {
      preflightAudioPassed = false;
      preflightTestState = 'interrupted';
      renderPreflightStatus();
      elements.preflightError.textContent = t('preflight.interrupted');
      elements.playTestSound.disabled = false;
      elements.continueToCode.disabled = false;
    }
    if (interruptedTask) {
      activePresentation = interruptedPresentation || {
        mode: interruptedTaskMode,
        task_id: currentTask?.id || '',
        trial_index: interruptedTaskMode === 'practice' ? practiceState.currentTrial : state.currentTrial,
        started_at_utc: new Date().toISOString()
      };
      enterTechnicalError('PARTICIPANT_STOP_CANCELLED', interruptedTaskMode, { persist: true });
    }
    return;
  }
  if (!sessionRunId && !pendingCheckpoint?.session_run_id && !pendingCheckpoint?.corrupt) {
    resetSessionData();
    settingsLocked = true;
    renderParticipantLanding();
    showSection('withdrawn');
    return;
  }
  requestCheckpointDeletion(() => {
    resetSessionData();
    settingsLocked = true;
    renderParticipantLanding();
    showSection('withdrawn');
  });
}

async function decideParticipantOrder() {
  if (sessionStatus !== 'not_started' || sessionRunId || elements.decideOrder.disabled) return;
  const value = elements.subjectId.value.trim().toUpperCase();
  if (!PARTICIPANT_CODE_PATTERN.test(value)) {
    elements.subjectId.setAttribute('aria-invalid', 'true');
    elements.subjectIdError.textContent = t('setup.subjectId.error');
    elements.subjectId.focus();
    return;
  }
  elements.decideOrder.disabled = true;
  await buildIdentityPromise;
  if (!appBuildSha256 || !appScriptSha256) {
    elements.subjectIdError.textContent = t('setup.buildUnavailable');
    elements.decideOrder.disabled = false;
    return;
  }
  if (!sessionAuthorizationAllowed()) {
    elements.subjectIdError.textContent = t('deployment.originBlocked');
    elements.decideOrder.disabled = false;
    return;
  }
  elements.subjectId.removeAttribute('aria-invalid');
  elements.subjectIdError.textContent = '';
  elements.subjectId.value = value;
  subjectId = value;
  sessionRunId = createSessionRunId();
  checkpointOwner = createSessionRunId();
  sessionScriptSha256 = appScriptSha256;
  sessionBuildSha256 = appBuildSha256;
  sessionDeploymentConfigSha256 = deploymentConfigSha256;
  sessionStatus = 'in_progress';
  sessionStartedAt = new Date(Math.max(Date.now(), readCheckpointDeletionBarrier() + 1)).toISOString();
  sessionEndedAt = '';
  sessionLanguageAtStart = currentLanguage;
  taskOrder = seededShuffle(TASKS, subjectId)
    .filter(task => researcherSettings.selectedTaskIds.includes(task.id));
  currentTaskIndex = 0;
  elements.overviewParticipantCode.textContent = subjectId;
  renderOrderList();
  if (!commitCheckpoint('overview', null)) return;
  showSection('overview');
}

elements.decideOrder.addEventListener('click', decideParticipantOrder);
elements.subjectId.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.isComposing) {
    event.preventDefault();
    decideParticipantOrder();
  }
});

elements.beginBattery.addEventListener('click', () => {
  if (!subjectId) {
    elements.subjectId.focus();
    return;
  }
  if (sessionPhase !== 'overview' || elements.beginBattery.disabled) return;
  elements.beginBattery.disabled = true;
  prepareTask(taskOrder[0]);
});

elements.startPractice.addEventListener('click', () => {
  responseWindowStart = null;
  startPractice();
});

elements.startTest.addEventListener('click', () => {
  startExperiment();
});

elements.choose1.addEventListener('click', () => handleResponse('1'));
elements.choose3.addEventListener('click', () => handleResponse('3'));
elements.downloadCsv.addEventListener('click', downloadCsv);
elements.downloadWideCsv.addEventListener('click', downloadWideCsv);
elements.downloadBundle.addEventListener('click', () => downloadResultBundle());
elements.participantDownloadBundle.addEventListener('click', () => downloadResultBundle({ participant: true }));
elements.participantReturnPortal.addEventListener('click', event => {
  if (elements.participantReturnPortal.getAttribute('aria-disabled') !== 'true') return;
  event.preventDefault();
  elements.participantReturnStatus.textContent = t('complete.downloadFirst');
});
elements.lockSettings.addEventListener('click', lockResearchSettings);
elements.createParticipantLink.addEventListener('click', createParticipantLink);
elements.copyParticipantLink.addEventListener('click', copyParticipantLink);
elements.openParticipantLink.addEventListener('click', openParticipantLink);
elements.continueToPreflight.addEventListener('click', continueFromLanding);
elements.playTestSound.addEventListener('click', playPreflightTestSound);
elements.continueToCode.addEventListener('click', continueFromPreflight);
elements.stopSession.addEventListener('click', stopAndDeleteSession);
elements.retryAudio.addEventListener('click', retryFailedAudio);
elements.endTechnicalSession.addEventListener('click', endTechnicalFailure);
elements.resumeSavedSession.addEventListener('click', () => {
  if (!pendingCheckpoint || elements.resumeSavedSession.disabled) return;
  const enteredCode = elements.resumeParticipantCode.value.trim().toUpperCase();
  if (!PARTICIPANT_CODE_PATTERN.test(enteredCode) || enteredCode !== pendingCheckpoint.subject_id) {
    elements.resumeParticipantCode.setAttribute('aria-invalid', 'true');
    elements.resumeCodeError.textContent = t('resume.code.error');
    elements.resumeParticipantCode.focus();
    return;
  }
  elements.resumeSavedSession.disabled = true;
  try {
    restoreCheckpoint(pendingCheckpoint);
    pendingCheckpoint = null;
  } catch (error) {
    checkpointTakeover = null;
    console.error('Checkpoint restore failed:', error);
    elements.resumeDescription.textContent = t('resume.incompatible');
    elements.resumeSavedSession.disabled = true;
  }
});
elements.resumeParticipantCode.addEventListener('input', () => {
  elements.resumeParticipantCode.removeAttribute('aria-invalid');
  elements.resumeCodeError.textContent = '';
});
elements.discardSavedSession.addEventListener('click', () => {
  if (!window.confirm(t('session.stopConfirm'))) return;
  requestCheckpointDeletion(() => {
    resetSessionData();
    settingsLocked = true;
    renderParticipantLanding();
    elements.consentConfirmed.checked = false;
    showSection('participantLanding');
  });
});
elements.editParticipantCode.addEventListener('click', () => {
  const onboardingEvidence = {
    consentConfirmedAt,
    preflightCompletedAt,
    preflightAudioPassed
  };
  requestCheckpointDeletion(() => {
    resetSessionData();
    consentConfirmedAt = onboardingEvidence.consentConfirmedAt;
    preflightCompletedAt = onboardingEvidence.preflightCompletedAt;
    preflightAudioPassed = onboardingEvidence.preflightAudioPassed;
    preflightTestState = preflightAudioPassed ? 'passed' : 'not_tested';
    settingsLocked = true;
    updateParticipantSetupCopy();
    showSection('setup');
  });
});
elements.editSettings.addEventListener('click', () => {
  if (configurationSource === 'participant_link') return;
  resetSessionData();
  sessionDefinition = null;
  settingsLocked = false;
  configurationSource = 'researcher_ui';
  participantLinkSchemaVersion = '';
  participantLinkValidationStatus = 'not_applicable';
  participantLinkConfig = '';
  configuredInitialLanguage = currentLanguage;
  updateEntryModeUi();
  showSection('researcherSetup');
});
elements.protocolPreset.addEventListener('change', () => {
  clearParticipantLink();
  setResearcherError();
  updateResearcherDescriptions();
});
elements.feedbackMode.addEventListener('change', () => {
  clearParticipantLink();
  setResearcherError();
  updateResearcherDescriptions();
});
elements.participantLinkLanguage.addEventListener('change', clearParticipantLink);
[elements.studyId, elements.conditionId, elements.siteId, elements.distributionId,
  elements.studyTitle, elements.institutionName,
  elements.consentVersion, elements.expectedMinutes, elements.consentUrl,
  elements.contactUrl, elements.returnUrl].forEach(input => {
  input.addEventListener('input', () => {
    clearParticipantLink();
    setResearcherError();
  });
});
Array.from(elements.taskSelections).forEach(input => {
  input.addEventListener('change', () => {
    clearParticipantLink();
    setResearcherError();
  });
});
elements.subjectId.addEventListener('input', () => {
  elements.subjectId.removeAttribute('aria-invalid');
  elements.subjectIdError.textContent = '';
});
elements.showResearcherResults.addEventListener('click', () => {
  if (administrationMode !== 'supervised') return;
  if (!window.confirm(t('complete.researcherConfirm'))) return;
  renderResearcherResults();
  showSection('researcherResults');
});
elements.nextParticipant.addEventListener('click', () => {
  if (!resultsBundleDownloaded || !window.confirm(t('researcherResults.nextConfirm'))) return;
  requestCheckpointDeletion(() => {
    resetSessionData();
    settingsLocked = true;
    renderParticipantLanding();
    elements.consentConfirmed.checked = false;
    showSection('participantLanding');
  });
});
elements.confirmReturnAndDelete.addEventListener('click', () => {
  if (!resultsBundleDownloaded) {
    elements.participantReturnStatus.textContent = t('complete.downloadFirst');
    return;
  }
  if (!window.confirm(t('complete.returnConfirm'))) return;
  requestCheckpointDeletion(() => {
    resetSessionData();
    settingsLocked = true;
    renderParticipantLanding();
    showSection('returned');
  });
});
elements.langEn.addEventListener('click', () => setLanguage('en'));
elements.langJa.addEventListener('click', () => setLanguage('ja'));

document.addEventListener('keydown', event => {
  const tagName = event.target && event.target.tagName ? event.target.tagName : '';
  const isInteractive = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(tagName);
  if (event.code === 'Space' && awaitingTestStart && !isInteractive) {
    event.preventDefault();
    startExperiment();
  }
  if (!isInteractive && responseWindowStart && (event.key === '1' || event.key === '3')) {
    event.preventDefault();
    handleResponse(event.key);
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'hidden') return;
  if (preflightAbortController) {
    cancelPreflightPlayback();
    preflightAudioPassed = false;
    preflightTestState = 'interrupted';
    renderPreflightStatus();
    elements.preflightError.textContent = t('preflight.interrupted');
    elements.playTestSound.disabled = false;
    elements.continueToCode.disabled = false;
  }
  if (sessionStatus !== 'in_progress' || !sessionRunId) return;
  visibilityInterruptionCount += 1;
  if (activePresentation && ['practice', 'main'].includes(sessionPhase)) {
    enterTechnicalError('VISIBILITY_INTERRUPTION', activePresentation.mode, { persist: true });
    return;
  }
  try { saveCheckpoint(sessionPhase, activePresentation); } catch (error) { /* handled on return or next commit */ }
});

window.addEventListener('storage', event => {
  if (!sessionRunId) return;
  try {
    if (event.key === checkpointDeletionBarrierKey()) {
      const barrier = Number(event.newValue || 0);
      const startedAtMs = Date.parse(sessionStartedAt);
      if (barrier && Number.isFinite(startedAtMs) && startedAtMs <= barrier) {
        handleObservedCheckpointDeletion();
      }
      return;
    }
    if (event.key !== checkpointKey()) return;
    if (!event.newValue) {
      const removed = event.oldValue ? JSON.parse(event.oldValue) : null;
      if (removed?.session_run_id === sessionRunId) handleObservedCheckpointDeletion();
      return;
    }
    const incoming = JSON.parse(event.newValue);
    if (
      incoming.session_run_id === sessionRunId &&
      incoming.owner !== checkpointOwner &&
      Number(incoming.revision || 0) >= checkpointRevision
    ) {
      enterTechnicalError('CHECKPOINT_CONFLICT', trialState.mode || 'test', { persist: false });
      elements.technicalErrorStatus.textContent = t('checkpoint.conflict');
    }
  } catch (error) { /* ignore unrelated storage data */ }
});

window.addEventListener('beforeunload', event => {
  const terminalWithLocalCopy = ['completed', 'technical_failure'].includes(sessionStatus);
  if (sessionStatus !== 'in_progress' && !terminalWithLocalCopy) return;
  event.preventDefault();
  event.returnValue = '';
});

verifySunStaircaseExample();
initializeApp();
