# Reconstruct publication-parameter stimulus sets from the frozen OSF-offline FLAC set.
#
# This script is intentionally non-destructive: it never writes inside the four source
# task directories. Transformed files preserve the source carrier and plateau scale.
# Kachlicka (2019) and Sun (2021): replace the observed 50-ms linear onset/offset
# envelope with a 15-ms linear envelope for pitch, formant, and duration. Rise-time
# files are losslessly decoded and re-encoded without a formula change.
# Saito & Tierney (2024): crop pitch to 250 ms without time stretching, retain its
# source 50-ms onset envelope, and place a 50-ms linear offset at the new endpoint;
# replace the formant envelope with 15-ms linear onset/offset; leave duration PCM
# unchanged apart from lossless FLAC decoding/re-encoding. Rise-time is not generated
# because it was not part of the source study.

form: "Reconstruct publication-parameter stimuli"
    folder: "Repository root", "."
    sentence: "Output root", "stimulus_sets"
    boolean: "Overwrite existing output", 0
endform

source_root$ = repository_root$
destination_root$ = output_root$
createFolder: destination_root$

procedure createTaskFolder: set_name$, task_name$
    set_root$ = destination_root$ + "/" + set_name$
    task_root$ = set_root$ + "/" + task_name$
    stimuli_root$ = task_root$ + "/Stimuli"
    createFolder: set_root$
    createFolder: task_root$
    createFolder: stimuli_root$
endproc

procedure guardPaths: source_path$, target_path$
    if not fileReadable (source_path$)
        exitScript: "Missing source stimulus: " + source_path$
    endif
    if fileReadable (target_path$) and not overwrite_existing_output
        exitScript: "Output already exists (rerun with overwrite enabled): " + target_path$
    endif
endproc

procedure replace50msWith15msTask: set_name$, task_name$
    @createTaskFolder: set_name$, task_name$
    for file_index from 1 to 101
        source_path$ = source_root$ + "/" + task_name$ + "/Stimuli/" + string$ (file_index) + ".flac"
        target_path$ = destination_root$ + "/" + set_name$ + "/" + task_name$ + "/Stimuli/" + string$ (file_index) + ".flac"
        @guardPaths: source_path$, target_path$
        sound = Read from file: source_path$
        Formula: ~ if col = 1 or col = nx then 0 else self * min (1, (col - 1) * dx / 0.015, (nx - col) * dx / 0.015) / min (1, (col - 1) * dx / 0.05, (nx - col) * dx / 0.05) fi
        Save as FLAC file: target_path$
        removeObject: sound
    endfor
endproc

procedure reconstructFormant15msTask: set_name$
    task_name$ = "formant_discrimination"
    @createTaskFolder: set_name$, task_name$
    for file_index from 1 to 101
        source_path$ = source_root$ + "/" + task_name$ + "/Stimuli/" + string$ (file_index) + ".flac"
        target_path$ = destination_root$ + "/" + set_name$ + "/" + task_name$ + "/Stimuli/" + string$ (file_index) + ".flac"
        @guardPaths: source_path$, target_path$
        source_sound = Read from file: source_path$
        reconstructed_sound = Create Sound from formula: "formant_reconstructed", 1, 0.0, 0.5, 44100, ~ object [source_sound, 1, 8821 + ((col - 1) mod 441)] * min (1, (col - 1) * dx / 0.015, (nx - col) * dx / 0.015)
        removeObject: source_sound
        selectObject: reconstructed_sound
        Save as FLAC file: target_path$
        removeObject: reconstructed_sound
    endfor
endproc

procedure copyTaskThroughPraat: set_name$, task_name$
    @createTaskFolder: set_name$, task_name$
    for file_index from 1 to 101
        source_path$ = source_root$ + "/" + task_name$ + "/Stimuli/" + string$ (file_index) + ".flac"
        target_path$ = destination_root$ + "/" + set_name$ + "/" + task_name$ + "/Stimuli/" + string$ (file_index) + ".flac"
        @guardPaths: source_path$, target_path$
        sound = Read from file: source_path$
        Save as FLAC file: target_path$
        removeObject: sound
    endfor
endproc

procedure cropSaitoPitchTask: set_name$
    task_name$ = "pitch_discrimination"
    @createTaskFolder: set_name$, task_name$
    for file_index from 1 to 101
        source_path$ = source_root$ + "/" + task_name$ + "/Stimuli/" + string$ (file_index) + ".flac"
        target_path$ = destination_root$ + "/" + set_name$ + "/" + task_name$ + "/Stimuli/" + string$ (file_index) + ".flac"
        @guardPaths: source_path$, target_path$
        source_sound = Read from file: source_path$
        cropped_sound = Extract part: 0.0, 0.25, "rectangular", 1.0, "no"
        removeObject: source_sound
        selectObject: cropped_sound
        Formula: ~ self * min (1, (nx - col) * dx / 0.05)
        Save as FLAC file: target_path$
        removeObject: cropped_sound
    endfor
endproc

kachlicka_set$ = "kachlicka2019-reconstruction-v1"
sun_set$ = "sun2021-reconstruction-v1"
saito_set$ = "saito-tierney2024-reconstruction-v1"

@replace50msWith15msTask: kachlicka_set$, "pitch_discrimination"
@reconstructFormant15msTask: kachlicka_set$
@replace50msWith15msTask: kachlicka_set$, "duration_discrimination"
@copyTaskThroughPraat: kachlicka_set$, "risetime_discrimination"

@replace50msWith15msTask: sun_set$, "pitch_discrimination"
@reconstructFormant15msTask: sun_set$
@replace50msWith15msTask: sun_set$, "duration_discrimination"
@copyTaskThroughPraat: sun_set$, "risetime_discrimination"

@cropSaitoPitchTask: saito_set$
@reconstructFormant15msTask: saito_set$
@copyTaskThroughPraat: saito_set$, "duration_discrimination"

writeInfoLine: "Reconstruction complete."
appendInfoLine: "Output root: ", destination_root$
