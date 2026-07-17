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
  batteryVersion: '5.0.0',
  trialSchemaVersion: 7,
  wideSchemaVersion: 5,
  procedureScope: 'study_profile_binds_adaptive_procedure_scoring_and_stimulus_set',
  taskOrderMethod: 'subject_id_seeded_shuffle',
  reversalDefinition: 'intended_nonzero_staircase_direction_change',
  stimulusErrorPolicy: 'fatal_no_substitution'
});

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
    'language.japanese': 'Japanese',
    'researcherSetup.tag': 'Researcher setup',
    'researcherSetup.title': 'Configure the listening battery',
    'researcherSetup.intro': 'Select the tasks, study profile, and feedback shown to participants. Each profile fixes both the adaptive procedure and its matching stimulus set.',
    'researcherSetup.tasks.legend': 'Tasks',
    'researcherSetup.tasks.help': 'Task availability follows the selected study profile. Participants see only neutral Listening Task labels.',
    'researcherSetup.protocol.label': 'Study profile (procedure and stimuli)',
    'researcherSetup.feedback.label': 'Participant feedback',
    'researcherSetup.lock': 'Lock settings and continue',
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
    'feedback.practiceOnly.description': 'Correctness is shown during the five practice trials. Main trials show no correctness or progress, and the participant sees only a completion message at the end.',
    'feedback.detailed.description': 'Correctness is shown during practice only. After all main tasks, estimated thresholds are shown without pass/fail or normative judgments.',
    'setup.tag': 'Participant setup',
    'setup.title': 'Enter the participant ID',
    'setup.intro': 'The participant ID determines a reproducible task order for this session.',
    'setup.subjectId.label': 'Participant ID',
    'setup.subjectId.placeholder': 'e.g., S01 or student number',
    'setup.subjectId.help': 'The same ID gives the same order; a new ID creates a new order automatically.',
    'setup.continue': 'Set order and continue',
    'setup.editSettings': 'Edit researcher settings',
    'overview.tag': 'Order confirmation',
    'overview.title': 'Order for this session',
    'overview.orderList.label': 'Task order',
    'overview.help': 'The order is locked to the ID. Stay in the same browser until everything is finished.',
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
    'taskComplete.tag': 'Task complete',
    'taskComplete.title': 'One task is finished',
    'taskComplete.hint': 'Continue when you are ready.',
    'taskComplete.next': 'Next task',
    'complete.tag': 'All tasks complete',
    'complete.title': 'Thank you',
    'complete.intro': 'You have completed all listening tasks. Please return the device to the researcher.',
    'complete.feedbackPending': 'Your session is complete.',
    'complete.showResearcherResults': 'Researcher: show results',
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
    'researcherResults.saveWarning': 'Results are stored only in this browser session. Download the files before closing the page or starting the next participant.',
    'researcherResults.downloadTrial': 'Download trial CSV',
    'researcherResults.downloadWide': 'Download wide CSV',
    'researcherResults.nextParticipant': 'Set up next participant',
    task1Label: 'Listening Task 1',
    task2Label: 'Listening Task 2',
    task3Label: 'Listening Task 3',
    task4Label: 'Listening Task 4',
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
    researcherMeta: 'Participant {id} | {protocol} | {count} task(s) completed',
    participantSetupDescription: '{count} listening task(s) are configured. Enter the participant ID to create a reproducible order.',
    selectAtLeastOneTask: 'Select at least one task.',
    unavailableTaskSelection: 'The selected study profile does not provide every selected task. Review the task selection.',
    taskUnavailableInProfile: 'Unavailable in the selected study profile.'
  },
  ja: {
    'app.title': '聴覚弁別課題バッテリー',
    'language.label': '言語',
    'language.english': 'English',
    'language.japanese': '日本語',
    'researcherSetup.tag': '研究者設定',
    'researcherSetup.title': '聴覚課題を設定する',
    'researcherSetup.intro': '実施する課題、研究プロファイル、参加者へのフィードバックを選択してください。各プロファイルは、適応手続きと対応する刺激セットを一体として固定します。',
    'researcherSetup.tasks.legend': '実施する課題',
    'researcherSetup.tasks.help': '実施できる課題は、選択した研究プロファイルに従います。参加者には中立的な「リスニング課題」の名称だけが表示されます。',
    'researcherSetup.protocol.label': '研究プロファイル（手続き・刺激）',
    'researcherSetup.feedback.label': '参加者へのフィードバック',
    'researcherSetup.lock': '設定を確定して次へ',
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
    'feedback.practiceOnly.description': '5回の練習では正誤を表示します。本試行では正誤も進捗も表示せず、終了後は完了メッセージだけを参加者に示します。',
    'feedback.detailed.description': '正誤を表示するのは練習だけです。全課題終了後に推定閾値を表示しますが、合否や規準集団との比較は示しません。',
    'setup.tag': '参加者設定',
    'setup.title': '参加者IDを入力してください',
    'setup.intro': '参加者IDに基づいて、このセッションの課題順を再現可能な形で決定します。',
    'setup.subjectId.label': '参加者ID',
    'setup.subjectId.placeholder': '例：S01、学籍番号',
    'setup.subjectId.help': '同じIDでは同じ順序になり、別のIDでは新しい順序が自動的に作られます。',
    'setup.continue': '順序を決定して次へ',
    'setup.editSettings': '研究者設定を変更',
    'overview.tag': '順序の確認',
    'overview.title': 'このセッションの実施順',
    'overview.orderList.label': '課題の実施順',
    'overview.help': '順序はIDに基づいて固定されています。すべて終了するまで同じブラウザを使用してください。',
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
    'taskComplete.tag': '課題完了',
    'taskComplete.title': '1つの課題が終了しました',
    'taskComplete.hint': '準備ができたら次へ進んでください。',
    'taskComplete.next': '次の課題へ',
    'complete.tag': '全課題完了',
    'complete.title': 'ご協力ありがとうございました',
    'complete.intro': 'すべてのリスニング課題が終了しました。端末を研究者にお返しください。',
    'complete.feedbackPending': 'セッションが完了しました。',
    'complete.showResearcherResults': '研究者：結果を表示',
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
    'researcherResults.saveWarning': '結果はこのブラウザセッション内だけに保存されています。ページを閉じる前、または次の参加者を開始する前にファイルを保存してください。',
    'researcherResults.downloadTrial': '試行単位CSVを保存',
    'researcherResults.downloadWide': 'ワイド型CSVを保存',
    'researcherResults.nextParticipant': '次の参加者を設定',
    task1Label: 'リスニング課題1',
    task2Label: 'リスニング課題2',
    task3Label: 'リスニング課題3',
    task4Label: 'リスニング課題4',
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
    researcherMeta: '参加者 {id}｜{protocol}｜完了課題数 {count}',
    participantSetupDescription: '{count}件のリスニング課題が設定されています。参加者IDを入力すると、再現可能な実施順を作成します。',
    selectAtLeastOneTask: '少なくとも1つの課題を選択してください。',
    unavailableTaskSelection: '選択した研究プロファイルでは実施できない課題が含まれています。課題選択を確認してください。',
    taskUnavailableInProfile: '選択した研究プロファイルでは実施できません。'
  }
};

function t(key, variables = {}) {
  const dictionary = I18N[currentLanguage] || I18N.en;
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

function setLanguage(language) {
  if (!I18N[language]) return;
  currentLanguage = language;
  applyStaticTranslations();
  elements.langEn.setAttribute('aria-pressed', String(language === 'en'));
  elements.langJa.setAttribute('aria-pressed', String(language === 'ja'));
  updateResearcherDescriptions();
  updateParticipantSetupCopy();

  const activeSection = document.querySelector('.card.active');
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
    }
  }
  if (activeSection && activeSection.id === 'complete' && taskSummaries.length) renderParticipantFeedback();
  if (activeSection && activeSection.id === 'researcherResults' && taskSummaries.length) renderResearcherResults();
}

const elements = {
  researcherSetup: document.getElementById('researcherSetup'),
  setup: document.getElementById('setup'),
  overview: document.getElementById('overview'),
  instructions: document.getElementById('instructions'),
  trial: document.getElementById('trial'),
  taskComplete: document.getElementById('taskComplete'),
  complete: document.getElementById('complete'),
  researcherResults: document.getElementById('researcherResults'),
  langEn: document.getElementById('langEn'),
  langJa: document.getElementById('langJa'),
  taskSelections: document.querySelectorAll('input[name="taskSelection"]'),
  protocolPreset: document.getElementById('protocolPreset'),
  protocolDescription: document.getElementById('protocolDescription'),
  feedbackMode: document.getElementById('feedbackMode'),
  feedbackDescription: document.getElementById('feedbackDescription'),
  researcherError: document.getElementById('researcherError'),
  lockSettings: document.getElementById('lockSettings'),
  subjectId: document.getElementById('subjectId'),
  participantSetupDescription: document.getElementById('participantSetupDescription'),
  editSettings: document.getElementById('editSettings'),
  decideOrder: document.getElementById('decideOrder'),
  orderList: document.getElementById('orderList'),
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
  completeTitle: document.getElementById('completeTitle'),
  thresholdText: document.getElementById('thresholdText'),
  taskCompleteHint: document.getElementById('taskCompleteHint'),
  nextTaskButton: document.getElementById('nextTaskButton'),
  feedbackSummary: document.getElementById('feedbackSummary'),
  showResearcherResults: document.getElementById('showResearcherResults'),
  summaryList: document.getElementById('summaryList'),
  researcherMeta: document.getElementById('researcherMeta'),
  metricsTable: document.getElementById('metricsTable'),
  widePreview: document.getElementById('widePreview'),
  downloadCsv: document.getElementById('downloadCsv'),
  downloadWideCsv: document.getElementById('downloadWideCsv'),
  nextParticipant: document.getElementById('nextParticipant')
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
let currentLanguage = typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en';
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

function fileStepToLevel(fileStep) {
  return fileStep - 1;
}

function levelToPhysical(level, task = currentTask) {
  return level * task.levelSize;
}

function taskDisplayLabel(task) {
  return t(task.displayLabelKey);
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
  const audio = new Audio(src);
  audio.preload = 'auto';
  audio.load();
  return audio;
}

function resetAudio(audio) {
  audio.pause();
  audio.currentTime = 0;
}

function waitForAudioReady(audio) {
  // Ready when we have future data (3) and a usable duration
  const hasData = () => audio.readyState >= 3 && Number.isFinite(audio.duration) && audio.duration > 0;
  if (hasData()) return Promise.resolve();

  return new Promise(resolve => {
    let timer = null;
    const cleanup = () => {
      if (timer !== null) clearTimeout(timer);
      audio.removeEventListener('canplaythrough', cleanup);
      audio.removeEventListener('loadeddata', cleanup);
      audio.removeEventListener('error', cleanup);
      resolve();
    };
    timer = setTimeout(cleanup, 5000);
    audio.addEventListener('canplaythrough', cleanup, { once: true });
    audio.addEventListener('loadeddata', cleanup, { once: true });
    audio.addEventListener('error', cleanup, { once: true });
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
    elements.researcherSetup,
    elements.setup,
    elements.overview,
    elements.instructions,
    elements.trial,
    elements.taskComplete,
    elements.complete,
    elements.researcherResults
  ].filter(Boolean).forEach(el => el.classList.remove('active'));
  const target = elements[section];
  target.classList.add('active');
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

function prepareTask(task) {
  currentTask = task;
  resetTaskState();
  resetPracticeProgress();
  audioPool = initAudioPool(task);
  baseAudioA = createAudio(stimulusUrl(task, practiceConfig.baseStep));
  baseAudioB = createAudio(stimulusUrl(task, practiceConfig.baseStep));
  elements.startPractice.disabled = true;
  elements.practiceStatus.textContent = t('loadingAudio');
  warmupPromise = warmUpTaskAudio();
  warmupPromise.finally(() => {
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
  showSection('instructions');
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

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function playAndWait(audio) {
  if (!audio) return true; // treat missing audio as error
  await waitForAudioReady(audio);
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
    const finish = () => {
      if (done) return;
      done = true;
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      resolve(hadError);
    };
    const onEnded = () => finish();
    const onError = () => {
      hadError = true;
      finish();
    };
    audio.addEventListener('ended', onEnded, { once: true });
    audio.addEventListener('error', onError, { once: true });
    const fallbackMs = Number.isFinite(audio.duration) && audio.duration > 0
      ? Math.round(audio.duration * 1000) + 200
      : 4000;
    setTimeout(finish, fallbackMs);
    audio.play().catch(() => {
      hadError = true;
      finish();
    });
  });
}

async function playSequence(first, second, third) {
  const e1 = await playAndWait(first);
  await wait(config.interStimulusDelay);
  const e2 = await playAndWait(second);
  await wait(config.interStimulusDelay);
  const e3 = await playAndWait(third);
  const hadError = e1 || e2 || e3;
  await wait(config.postSequenceDelay);
  return hadError;
}

function startPractice() {
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
  showSection('trial');
  runPracticeTrial();
}

async function runPracticeTrial() {
  clearFeedback();
  if (warmupPromise) {
    await warmupPromise;
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

  const hadError = await playSequence(first, second, third);
  if (hadError) {
    elements.playbackStatus.textContent = t('audioError');
    return;
  }
  responseWindowStart = performance.now();
  elements.playbackStatus.textContent = t('practiceChoose', { current: trialIndex + 1, total: practiceConfig.trials });
  toggleResponseButtons(true);
}

async function startExperiment() {
  if (!practiceState.completed) {
    elements.practiceStatus.textContent = t('completePracticeFirst', { count: practiceConfig.trials });
    return;
  }
  if (!awaitingTestStart) return;
  if (warmupPromise) {
    await warmupPromise;
  }
  awaitingTestStart = false;
  elements.startTest.disabled = true;
  elements.startTest.textContent = t('preparingMain');
  elements.practiceStatus.textContent = t('preparingMain');
  resetTaskState();
  stimOrder = buildStimOrder();
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

  const hadError = await playSequence(first, second, third);
  if (hadError) {
    elements.playbackStatus.textContent = t('audioError');
    return;
  }
  responseWindowStart = performance.now();
  elements.playbackStatus.textContent = t('selectOneOrThree');
  toggleResponseButtons(true);
}

function handleResponse(choice) {
  if (!responseWindowStart) return;
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
    if (practiceState.currentTrial >= practiceConfig.trials) {
      practiceState.completed = true;
      awaitingTestStart = true;
      elements.practiceStatus.textContent = t('practiceCompleteStatus');
      elements.startTest.disabled = false;
      elements.startTest.textContent = t('startMainEnabled');
      elements.startPractice.disabled = true;
      elements.startPractice.textContent = t('practiceCompletedButton');
      setTimeout(() => {
        elements.playbackStatus.textContent = t('pressSpaceToStart');
        clearFeedback();
        showSection('instructions');
      }, config.postResponseDelay);
    } else {
      setTimeout(runPracticeTrial, config.postResponseDelay);
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
    termination_reason: '',
    scored_reversal_count: '',
    reversal_levels_used: '',
    threshold_available: '',
    target_reversals_reached: '',
    schema_version: IMPLEMENTATION.trialSchemaVersion
  });

  state.currentTrial += 1;
  responseWindowStart = null;
  setTimeout(nextTrial, config.postResponseDelay);
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
  const threshold = getThreshold();
  const scoredReversalLevels = getScoredReversalLevels();
  const thresholdPhysical = threshold !== null ? levelToPhysical(threshold) : null;
  const terminationReason = state.numReversals >= config.targetReversals ? 'target_reversals' : 'max_trials';
  const thresholdAvailable = threshold !== null;
  currentResults.forEach(row => {
    row.threshold_estimate = threshold !== null ? threshold.toFixed(2) : '';
    row.threshold_physical_value = thresholdPhysical !== null ? thresholdPhysical.toFixed(2) : '';
    row.termination_reason = terminationReason;
    row.scored_reversal_count = scoredReversalLevels.length;
    row.reversal_levels_used = scoredReversalLevels.join('|');
    row.threshold_available = thresholdAvailable ? 1 : 0;
    row.target_reversals_reached = state.numReversals >= config.targetReversals ? 1 : 0;
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
    medianRtMs: median(currentResults.map(row => row.rt_ms))
  });

  elements.completeTitle.textContent = t('taskCompletedTitle', { task: taskDisplayLabel(currentTask) });
  elements.thresholdText.textContent = researcherSettings.feedbackMode === 'detailed'
    ? threshold !== null
      ? `${getThresholdLabel()}: ${formatThreshold(threshold)}`
      : t('thresholdUnavailable')
    : t('responsesRecorded');

  const isLastTask = currentTaskIndex === taskOrder.length - 1;
  const nextTask = taskOrder[currentTaskIndex + 1];
  elements.taskCompleteHint.textContent = isLastTask
    ? t('allTasksFinishedParticipant')
    : t('nextTaskHint', { task: taskDisplayLabel(nextTask) });
  elements.nextTaskButton.textContent = isLastTask ? t('finishParticipantSession') : t('nextTask');
  elements.nextTaskButton.onclick = () => {
    if (isLastTask) {
      sessionCompletedAt = new Date().toISOString();
      sessionLanguageAtCompletion = currentLanguage;
      renderParticipantFeedback();
      showSection('complete');
    } else {
      currentTaskIndex += 1;
      prepareTask(nextTask);
    }
  };

  showSection('taskComplete');
}

function csvEscape(value) {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
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

function downloadCsv() {
  const header = [
    'subject_id',
    'battery_version',
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
    'termination_reason',
    'scored_reversal_count',
    'reversal_levels_used',
    'threshold_available',
    'target_reversals_reached',
    'schema_version'
  ];
  const filenameId = subjectId ? subjectId : 'subject';
  downloadCsvText(rowsToCsv(allResults, header), `${filenameId}_audio_discrimination.csv`);
}

function buildWideResult() {
  const row = {
    subject_id: subjectId,
    battery_version: IMPLEMENTATION.batteryVersion,
    wide_schema_version: IMPLEMENTATION.wideSchemaVersion,
    completed: taskSummaries.length === taskOrder.length ? 1 : 0,
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
    ui_languages_used: Array.from(new Set(allResults.map(result => result.ui_language))).join('|'),
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
  });
  return row;
}

function downloadWideCsv() {
  const row = buildWideResult();
  const header = Object.keys(row);
  const filenameId = subjectId ? subjectId : 'subject';
  downloadCsvText(rowsToCsv([row], header), `${filenameId}_audio_discrimination_wide.csv`);
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

function appendTableCell(row, tag, text, scope = '') {
  const cell = document.createElement(tag);
  cell.textContent = text;
  if (tag === 'th') cell.scope = scope || 'row';
  row.appendChild(cell);
}

function buildWidePreviewRow(wideRow) {
  const visibleKeys = [
    'subject_id',
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
      protocol: config.citation,
      count: taskSummaries.length
    });
  }
}

function updateParticipantSetupCopy() {
  if (elements.participantSetupDescription) {
    elements.participantSetupDescription.textContent = t('participantSetupDescription', {
      count: researcherSettings.selectedTaskIds.length
    });
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

function resetSessionData() {
  [baseAudioA, baseAudioB, ...audioPool].filter(Boolean).forEach(audio => {
    try { resetAudio(audio); } catch (error) { /* no-op */ }
  });
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
  currentResults.length = 0;
  allResults.length = 0;
  taskSummaries.length = 0;
  elements.subjectId.value = '';
}

function lockResearchSettings() {
  const protocolId = elements.protocolPreset.value;
  const preset = PROTOCOL_PRESETS[protocolId];
  if (!preset) return;
  const stimulusSet = getStimulusSetForProtocol(preset);
  const selectedTaskIds = Array.from(elements.taskSelections)
    .filter(input => input.checked && !input.disabled)
    .map(input => input.value);
  if (!selectedTaskIds.length) {
    elements.researcherError.textContent = t('selectAtLeastOneTask');
    return;
  }
  if (
    selectedTaskIds.some(taskId => !stimulusSet.tasks[taskId]) ||
    selectedTaskIds.some(taskId => stimulusSet.tasks[taskId].fileCount !== BASE_CONFIG.numSteps)
  ) {
    elements.researcherError.textContent = t('unavailableTaskSelection');
    return;
  }

  resetSessionData();
  researcherSettings.selectedTaskIds = selectedTaskIds;
  researcherSettings.protocolId = protocolId;
  researcherSettings.feedbackMode = elements.feedbackMode.value;
  config = Object.freeze({ ...BASE_CONFIG, ...preset });
  sessionDefinition = Object.freeze({
    bindingId: preset.stimulusBindingId,
    protocolId: preset.id,
    protocolVersion: preset.version,
    stimulusSetId: stimulusSet.id,
    stimulusSet
  });
  settingsLocked = true;
  elements.researcherError.textContent = '';
  updateParticipantSetupCopy();
  showSection('setup');
}

elements.decideOrder.addEventListener('click', () => {
  const value = elements.subjectId.value.trim();
  if (!value) {
    elements.subjectId.focus();
    return;
  }
  subjectId = value;
  sessionLanguageAtStart = currentLanguage;
  taskOrder = seededShuffle(TASKS, subjectId)
    .filter(task => researcherSettings.selectedTaskIds.includes(task.id));
  currentTaskIndex = 0;
  renderOrderList();
  showSection('overview');
});

elements.beginBattery.addEventListener('click', () => {
  if (!subjectId) {
    elements.subjectId.focus();
    return;
  }
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
elements.lockSettings.addEventListener('click', lockResearchSettings);
elements.editSettings.addEventListener('click', () => {
  resetSessionData();
  sessionDefinition = null;
  settingsLocked = false;
  showSection('researcherSetup');
});
elements.protocolPreset.addEventListener('change', updateResearcherDescriptions);
elements.feedbackMode.addEventListener('change', updateResearcherDescriptions);
elements.showResearcherResults.addEventListener('click', () => {
  renderResearcherResults();
  showSection('researcherResults');
});
elements.nextParticipant.addEventListener('click', () => {
  resetSessionData();
  updateParticipantSetupCopy();
  showSection('setup');
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

verifySunStaircaseExample();
setLanguage(currentLanguage);
