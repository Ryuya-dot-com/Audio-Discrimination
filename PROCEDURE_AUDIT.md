# 手続き・刺激・測定上の監査記録

- 監査日: 2026-07-17
- 対象: 統合版 `index.html` / `script.js`、凍結親FLAC 404ファイル、論文別再構成セット3種
- 優先順位: 原著に書かれた事実、ローカルで実測した事実、実装上の解釈を混同しない

## 結論

この統合版は、Kachlicka, Saito, and Tierney (2019)、Sun, Saito, and Tierney (2021)、または Saito and Tierney (2024; online 2022) の**適応手続き・採点規則と、対応する再構成刺激セットを一体として選ぶ派生実装**です。`STIMULUS_CATALOG.json` が手続きと刺激を固定対応させ、未検証の組合せは実行しません。練習、課題順、ブラウザ再生、回答前後の待機時間、機器、参加者標本まで含む原研究の完全再現ではありません。

研究利用上の要点は次のとおりです。

1. Kachlicka et al. p.17の採点対象は第3反転以降ではなく**第2反転以降**です。統合版も `first_scored_reversal = 2` とし、第3反転開始へ読み替えません。
2. Saito and Tierneyのステップ列は `10 → 5 → 1` です。出典ごとに独立したステップ列を使用します。
3. Sun et al. のCambridge公式本文pp.558–559は、70試行／8反転、初誤答前1正答・以後2連続正答、`10 → 5 → 2 → 1`、第3反転以降の算術平均を規定します。Supplementary Materialは別標本のtest–retest信頼性表であり、手続きの根拠には用いません。
4. トップレベルの404 FLACは、Saito and Tierneyが案内する公式OSF `OFFLINE AP TESTS.zip` 内の404 FLACと**全件byte-identical**です。この配布物は親刺激セットとして凍結し、Praat等で上書きしません。
5. 論文本文、公式offline FLAC、同じOSFの課題別MP3は刺激仕様が相互に一致しないため、Praat 6.4.19で論文報告値に対応する3つの別セットを生成しました。各セットは独立したID、manifest、パラメータ、checksumを持ちます。
6. Formantは旧50 ms包絡を単純除算するとfilter start-up transientが露出するため、親配布物の0.200 s以降にある定常100 Hz周期をsample単位で反復し、15 ms包絡を与えました。これは不足するfilter条件をPraat既定値で補う処理ではありません。
7. Saito–Tierney主研究用セットはpitch・formant・durationの3課題のみです。主研究に含まれないrise-timeは生成せず、同条件では実施できません。
8. 再構成は、親配布物から宣言した物理仕様へ至る決定論的な来歴を保証しますが、原研究参加者が聴取した波形との同一性は保証しません。CSVは手続き、binding、刺激セット、課題別hash、生成器、パラメータ、親セットまでを保存します。

## 照合した一次資料

出版社PDFはリポジトリに含めず、DOIまたは出版社の公式ページから参照します。

| 資料 | 書誌情報 | 主な照合ページ |
|---|---|---|
| [Kachlicka et al. (2019)](https://doi.org/10.1016/j.bandl.2019.02.004) | *Brain and Language, 192*, 15–24. DOI: 10.1016/j.bandl.2019.02.004 | PDF pp.2–3／誌面pp.16–17 |
| [Sun et al. (2021)](https://doi.org/10.1017/S0272263120000649) | *Studies in Second Language Acquisition, 43*, 551–573. DOI: 10.1017/S0272263120000649 | PDF pp.8–9／誌面pp.558–559 |
| [Saito & Tierney](https://doi.org/10.1017/S027226312200047X) | *Studies in Second Language Acquisition* (2024), 46, 1206–1230; online publication and copyright 2022. DOI: 10.1017/S027226312200047X | PDF pp.6–10, 15–18／誌面pp.1211–1215, 1220–1223 |
| [Woods et al. (2017)](https://doi.org/10.3758/s13414-017-1361-2) | *Attention, Perception, & Psychophysics, 79*, 2064–2072. DOI: 10.3758/s13414-017-1361-2 | PDF pp.2–4, 7–8／誌面pp.2065–2067, 2070–2071 |

追加の公式資料として、信頼性値についてSun et al. の[Cambridge Supplementary Material](https://static.cambridge.org/content/id/urn:cambridge.org:id:article:S0272263120000649/resource/name/S0272263120000649sup001.docx)、刺激配布物についてSaito and TierneyのData Availabilityが示す[OSF Open Materials](https://osf.io/bkj6v/)と、[IRIS Sound stimuliレコード](https://www.iris-database.org/details/Kl8ck-cx328)を照合しました。IRISの404 MP3はOSFの課題別ZIP 4種と全件byte-identicalです。IRIS APIに表示されるDOIは2026-07-17時点でdraft状態かつ未解決のため、正規詳細URLを記録します。

Saito and Tierney論文は2022年にオンライン公開され、最終巻号は2024年です。本プロジェクトでは `Saito & Tierney (2024; online 2022)` と表示します。

2026-07-17の監査では、Sun et al. (2021) の照合に[Cambridge公式論文ページ](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/longitudinal-investigation-of-explicit-and-implicit-auditory-processing-in-l2-segmental-and-suprasegmental-acquisition/3B840313E5BF385870E24EDF3456336B)で配布された公式PDFを使用し、そのSHA-256は `8c476bf0ea0fb0b944b9761dc276e042bb35f9bea18251aab89dde4a44037b0b` でした。

## 階段法・採点の照合表

| 項目 | Kachlicka et al. (2019), p.17 | Sun et al. (2021), p.558 | Saito & Tierney (2024), pp.1214–1215 | 統合版 |
|---|---|---|---|---|
| 課題 | pitch, rise time, duration, formant | pitch, formant, duration, rise time | formant, pitch, duration（主たるtest–retest研究） | Kachlicka/Sunは4課題内のsubset、Saito–Tierneyは3課題内のsubset |
| 1試行 | 3音、第1または第3が異音、`1`/`3`回答 | 3音、第1または第3が異音、`1`/`3`回答 | 3音、第2音は標準、第1または第3が比較、`1`/`3`回答 | 同じ基本構造 |
| ISI | 0.5 s | 0.5 s | 数値記載なし | 500 ms |
| 開始点 | Level 50 | Level 50 | Level 50 | ファイル51＝Level 50 |
| 容易化 | 1誤答ごと | 1誤答ごと | 1誤答ごと | 同じ |
| 難化 | “every third correct response” | 初誤答前は1正答、以後2連続正答 | 3連続正答 | 選択した出典どおり切替 |
| ステップ | `10 → 5 → 2 → 1` | `10 → 5 → 2 → 1` | `10 → 5 → 1` | 選択した出典ごとに固定 |
| 終了 | 70試行または8反転 | 70試行または8反転 | 70試行または8反転 | 同じ |
| 採点対象 | 第2反転以降 | 第3反転以降 | 第3反転以降 | 出典どおり切替 |
| 集約 | “levels of each reversal from the second onward”; 演算名は明記なし | 第3反転以降の算術平均 | 第3反転以降の算術平均 | 算術平均。Kachlicka条件では実装上の解釈 |
| 反転の計算定義 | 詳細なし | 完全な例示列あり、境界処理等はなし | 成績の方向反転を例示するが境界処理等はなし | 非ゼロの意図方向が変わった時点。Sunは更新後Level、他2条件は実装判断として更新前Level |

### 原著内の不整合・解釈点

- Kachlicka et al. のduration上限は誌面上 `0.5 ms` ですが、標準0.25 s・下限0.2525 sとの整合から0.5 sの誤植と判断します。
- Kachlicka et al. は “every third correct” と書き、`consecutive` を明記していません。統合版はLevitt型の3-down/1-upとして3連続正答と解釈します。
- Kachlicka et al. は第2反転以降のlevelsをscoreとすると記載しますが、算術平均という演算名を明記していません。統合版の算術平均は再現可能な実装上の判断です。
- Sun et al. の例示列は `50 → 40 → 30 → 35 → 35 → 33 → 33 → 34` で、第1～3反転を35、33、34とします。したがって反転時に縮小後のstepを適用した**更新後Level**を保存する必要があります。統合版はこの列を起動時回帰条件として固定しました。ただし境界clamp時の反転定義は原著に規定がありません。
- Sun et al. の弁別課題について練習試行・正誤フィードバック・4下位課題内の順序は本文に記載がありません。Supplementary Materialは信頼性表のみです。現行の5練習試行、フィードバック、IDによる順序は統合版仕様です。
- Saito and Tierneyの本文はpitch標準を330 Hzとしますが、Table 2だけ300 Hzと記載します。比較系列330.3–360 Hzとの整合から本文の330 Hzを採用します。
- Saito and Tierneyの難化例にはLevel 50から60へ移る旨の方向誤記があります。規則の文章と尺度説明に従い、正答時はLevelを下げます。

## 刺激の来歴と再構成

### 凍結した公式offline配布物

トップレベル4課題の404 FLACは、[STIMULUS_MANIFEST.json](STIMULUS_MANIFEST.json)で `saito-tierney-offline-osf-6p8hv-e8ebb0a5` として固定しています。

- 全体SHA-256: `e8ebb0a5c1a52f5fd2a8be9c8755c33865611c601bdb20c3e7af90a5e589c118`
- 4課題 × 101ファイル、44.1 kHz、mono、16-bit PCM FLAC
- 公式配布元: [OSF `OFFLINE AP TESTS.zip`](https://osf.io/download/6p8hv/)
- 公式ZIP SHA-256: `70dc8bea86020110f81c2932d5eb05f06f2aaa6f2de3469663e501fbacd96bdb`
- 公式ZIP内FLACとの照合: **404/404 byte-identical**

公式offline FLACはpitch 500 msで、pitch・formant・durationの標準刺激に約50 msのlinear onset/offsetがあります。Kachlicka/Sun本文の15 ms、Saito–Tierney本文のpitch 250 ms・formant 15 msとは一致しません。OSF課題別ZIP／IRISの同一MP3も別仕様であり、formant・durationは約15 ms、pitchは実測約330–355 Hz・約0.25 Hz刻み・500 ms・約50 ms非線形rampです。したがって、公式配布物であることと特定論文の刺激記述へ一致することは区別します。

親404ファイルは再構成の入力としてのみ使用し、上書きしません。OSFプロジェクトのAPIメタデータにはoffline FLACのライセンス指定がありません。論文のCC BYやIRIS MP3のCC BY-NC-SA 3.0を自動的に適用せず、再配布条件は別途確認します。

### 論文別の再構成セット

[STIMULUS_CATALOG.json](STIMULUS_CATALOG.json)は次の3セットと手続きを一対一で結びます。全セットはPraat 6.4.19、`tools/reconstruct_stimuli.praat`で生成し、peak/RMS normalizationは行っていません。Praat binary SHA-256は `2227bad7b09e8aec121ba475409a2beb66bfa8c345189bc0026431a4fb32e1c7`、生成script SHA-256は `cdd146dc820435fb7769a102d9042701d99115c0744d157f72cd788dee5d9cb4` です。

| セット | 課題・ファイル数 | 全体SHA-256 | 対応資料 |
|---|---:|---|---|
| [`kachlicka2019-reconstruction-v1`](stimulus_sets/kachlicka2019-reconstruction-v1/STIMULUS_MANIFEST.json) | 4課題・404 | `ec00a36f74a48ac6e6edcfc77db9817e6cbe34d300c0f62617129d3d43d919c8` | Kachlicka et al. (2019), p.17 |
| [`sun2021-reconstruction-v1`](stimulus_sets/sun2021-reconstruction-v1/STIMULUS_MANIFEST.json) | 4課題・404 | `ec00a36f74a48ac6e6edcfc77db9817e6cbe34d300c0f62617129d3d43d919c8` | Sun et al. (2021), pp.558–559 |
| [`saito-tierney2024-reconstruction-v1`](stimulus_sets/saito-tierney2024-reconstruction-v1/STIMULUS_MANIFEST.json) | 3課題・303 | `a09c4360ebb6e68488c431a9366c3bca0ce6b1e23483927aeb55d6e0522031b1` | Saito & Tierney (2024), pp.1213–1215 |

KachlickaとSunが報告する物理profileは同じため、両セットのPCMとaggregate hashは同一です。ただし、手続きとのbindingと引用来歴を曖昧にしないため、別ID・別manifestを維持します。

| 課題 | Kachlicka (2019)／Sun (2021) profile | Saito–Tierney (2024) main-study profile |
|---|---|---|
| Pitch | 等振幅4調波、`F0 = 330 + 0.3 × Level` Hz、500 ms、nominal 15 ms linear onset/offset | 同じF0系列、250 ms。本文にramp値がないため親の50 ms onsetを保持し、先頭250 msをcropして新末尾へ50 ms offsetを配置 |
| Formant | 100 Hz F0、3000 Hzまでの調波、F1 500 Hz、`F2 = 1500 + 2 × Level` Hz、F3 2500 Hz、500 ms、nominal 15 ms linear onset/offset | 同じ周波数系列・500 ms・nominal 15 ms linear onset/offset |
| Duration | 330 Hzの等振幅4調波、`250 + 2.5 × Level` ms、nominal 15 ms linear onset/offset | 同じduration系列。本文にramp値がないため親の50 ms onset/offsetを保持 |
| Rise time | 330 Hzの等振幅4調波、500 ms、onset `15 + 2.85 × Level` ms、offset約15 ms | 主研究に含まれないためファイルなし・実施不可 |

44.1 kHzでnominal 15 msは、zero-valued endpointから数えてsample index 662（15.011 ms）で最初のplateau sampleへ到達します。Kachlicka/Sunのpitch・durationは親の定常部PCMを保持して包絡だけを置換し、rise-timeはdecoded PCMが親と完全一致するlossless再encodeです。Saito–Tierney pitchは先頭200 msのPCMが親と一致し、durationは全PCMが親と一致します。

Kachlicka et al. は最初の非標準rise timeを17.8 msへ丸めますが、Level式では17.85 msであり、Sun et al. は2.85 ms刻みを明記します。再構成parameterはこの関係を記録したうえで `15 + 2.85 × Level` msを用います。

Durationのframe数は親セットの生成規約を保持します。浮動小数点のtruncateによりnominal continuumとの差は最大1 sample（`0.022676` ms）ですが、再標本化で隠さず `PARAMETERS.json` に明記します。Saito–Tierneyのpitch標準は、本文と330.3–360 Hzの比較系列に整合する330 Hzを採用します。Table 2の300 Hzは孤立した不一致としてmanifestに記録し、根拠なく平均化・補間しません。

### Formantの定常周期再構成

親formantの旧50 ms包絡を単純除算すると、初期区間にfilter start-up transientが露出します。論文はparallel formant filter bankの帯域幅、利得、位相、初期状態を十分に報告せず、[IRISの関連コード記録](https://www.iris-database.org/details/zNePd-TBhWJ)と[KachlickaのOSF](https://osf.io/gwxkb/)にも生成コードはありません。このため、未報告値をPraat既定値で補う再合成は行いません。

各Levelについて、親波形のsource sample 8821（0.200 s、100 Hzの20周期点）から441 samplesの定常周期を取得し、500 msへsample-exactに反復して15 ms包絡を与えます。参照周期は後続周期と全101 Levelでsample-wise一致します。この方法は親配布物の定常carrier、調波振幅、Level系列を保持しますが、原研究のfilter stateや波形と同一であることを意味しません。

### 生成、同一性検証、音響監査

親セットを先に検証します。

```sh
python3 tools/verify_stimulus_manifest.py
python3 tools/audit_stimulus_acoustics.py --profile original --root .
```

独立に取得した公式ZIPも照合する場合は、次を追加します。

```sh
python3 tools/verify_stimulus_manifest.py \
  --source-archive "/path/to/OFFLINE AP TESTS.zip"
```

空の出力directoryを持つfresh buildでは、absolute pathとoverwrite無効の `0` を指定して生成し、metadataを確定します。

```sh
"/Applications/Praat.app/Contents/MacOS/Praat" --run --no-pref-files \
  tools/reconstruct_stimuli.praat \
  "/absolute/path/to/Audio_Discrimination" \
  "/absolute/path/to/Audio_Discrimination/stimulus_sets" \
  0
python3 tools/manage_reconstructed_stimuli.py write
```

研究開始前と配布後のintegrity checkでは、記録済みmetadataと3 profileの音響条件をすべて検証します。

```sh
python3 tools/manage_reconstructed_stimuli.py verify
python3 tools/verify_runtime_stimulus_registry.py
python3 tools/audit_stimulus_acoustics.py \
  --profile kachlicka2019 \
  --root stimulus_sets/kachlicka2019-reconstruction-v1
python3 tools/audit_stimulus_acoustics.py \
  --profile sun2021 \
  --root stimulus_sets/sun2021-reconstruction-v1
python3 tools/audit_stimulus_acoustics.py \
  --profile saito_tierney2024 \
  --root stimulus_sets/saito-tierney2024-reconstruction-v1
```

独立生成runの再現性はcanonical setおよびrun間で全FLACを比較します。

```sh
python3 tools/verify_reconstruction_reproducibility.py \
  "/path/to/independent-run-1" \
  "/path/to/independent-run-2" \
  --report RECONSTRUCTION_VALIDATION.json
```

[RECONSTRUCTION_VALIDATION.json](RECONSTRUCTION_VALIDATION.json)は、独立したPraat生成2回について各1,111 FLACがcanonical setとbyte-identicalであった検証証跡です。この比較は音声bytesを対象とし、manifest、parameter、checksum、catalogの決定性は `manage_reconstructed_stimuli.py verify` が別に検査します。

音響監査は全Levelの形式・sample数・pitch F0・duration・formant領域の調波peak／spectral centroid・rise-time・標準刺激rampを検査します。Formantの2 Hz刻みF2は100 Hz刻みの調波だけから直接復元できないため、F2近傍peakとcentroidの単調性を確認する限定的検査です。

各再構成manifestのclaimは `reported_parameter_reconstruction_not_original_study_files` です。検査合格が保証するのは、凍結親セットから記録済み変換を経た来歴、local bytesの同一性、宣言した物理profileへの許容差内の適合です。原PCM／MATLAB生成コードと照合できないため、原研究参加者が聴いた波形との同一性は保証しません。

## CSVに保存する刺激来歴

統合版5.0.0はtrial schema 7、wide schema 5を用います。解析時に「同じファイル番号」「同じ課題名」だけで刺激を同一視しないよう、各trialとparticipant-wide recordに次の階層を保存します。

1. 手続き: `protocol_id`、`protocol_version`、`protocol_citation`、`protocol_source_locator`
2. 手続きと刺激の固定対応: `protocol_stimulus_binding_id`
3. Catalog: `stimulus_catalog`、`stimulus_catalog_schema_version`、`stimulus_catalog_sha256`
4. 再生セット: `stimulus_set_id`、`stimulus_set_version`、`stimulus_set_kind`、`stimulus_claim`、`stimulus_parameter_profile_id`、`stimulus_manifest`、`stimulus_manifest_sha256`、`stimulus_set_sha256`、`stimulus_source_archive_sha256`、`stimulus_provenance_verification`、`stimulus_validation_status`、`stimulus_audit_date`
5. 課題・ファイル: trialでは `stimulus_task_sha256`、`stimulus_task_transformation`、`stimulus_file_index`、`stimulus_requested_file_index`、`stimulus_standard_file_index`、公開Level列。wideでは `<task>_stimulus_task_sha256` と `<task>_stimulus_task_transformation`
6. 生成記録: `stimulus_generator`、`stimulus_generator_version`、`stimulus_generator_script`、`stimulus_generator_script_sha256`、`stimulus_parameters_file`、`stimulus_parameters_sha256`
7. 引用・権利: `stimulus_source_citation`、`stimulus_source_locator`、`stimulus_license`、`stimulus_license_note`
8. 親来歴: `stimulus_parent_set_id`、`stimulus_parent_manifest`、`stimulus_parent_set_sha256`、`stimulus_parent_source_locator`、`stimulus_parent_source_archive_sha256`

`stimulus_set_id`と`stimulus_set_sha256`は選択した手続きに応じて動的に変わります。同じ `51.flac` でもsetが異なれば同一刺激とは扱いません。反対に、Kachlicka/Sun再構成は現版でaggregate hashが一致しますが、引用とbindingが異なるため解析上の出典を統合しません。派生set自身の `stimulus_source_archive_sha256` は空欄で、公式ZIPのdigestは `stimulus_parent_source_archive_sha256` に保存します。`stimulus_license` が空欄であることはpublic domainを意味せず、親OSF配布物のlicenseが宣言されていないことを表します。

再解析・データ結合では、最低でも `battery_version`、schema版、`protocol_stimulus_binding_id`、`stimulus_catalog_sha256`、`stimulus_set_id`、`stimulus_set_version`、`stimulus_manifest_sha256`、`stimulus_set_sha256`、課題別hashを照合します。生成scriptまたはparameter hashが異なるrecordは、物理的な要約値が同じでも別刺激版として扱います。

## Level、ファイル番号、物理閾値

ローカルファイルは1–101、公開尺度はLevel 0–100です。

`published Level = local file index - 1`

統合版schema 7ではCSVの `threshold_estimate` を公開Levelで保存するため、分析時の追加減算は不要です。物理差は次のとおりです。

- Pitch: `0.3 × threshold_estimate` Hz
- Formant: `2 × threshold_estimate` Hz
- Duration: `2.5 × threshold_estimate` ms
- Rise time: `2.85 × threshold_estimate` ms

古いCSVでLevel列とファイル番号列が分離されていない場合だけ、文献尺度との比較前に1を引きます。

## 原著にない、または原著だけでは確定できない統合版仕様

以下は再現性のためCSVに記録しますが、いずれかの原研究手続きそのものとは呼びません。

- 各課題前の5練習試行
- 練習比較刺激がファイル100＝Level 99
- 練習中の正誤と正答位置フィードバック
- 参加者IDによる決定論的な課題順シャッフル
- 70試行時に異音位置を第1音35回・第3音35回へ均等化
- 第3音終了後500 msで回答を許可
- 回答後1000 msで次試行
- 意図した非ゼロ階段方向の変化を反転とする定義
- Sun条件は原著例どおり反転後の新Levelを記録。Kachlicka／Saito–Tierney条件は計算定義が十分に報告されていないため、実装判断として更新前Levelを記録
- 境界を公開Level 1–100にclamp
- 欠損・読込不能刺激では代替再生せず、回答受付前にfatalな音声エラーとして停止

練習＋正誤フィードバックはSaito and Tierneyの主研究で実施された手続きではありません。同論文p.1222の脚注で、オンライン信頼性を改善する可能性のある**将来提案**として述べられています。効果が同論文で実証されたわけではありません。

schema 7では欠損刺激の置換を無効化しています。正常に記録されたtrialの `stimulus_substituted` とwide CSVの各課題 `*_stimulus_substitution_count` は常に0です。音声エラーが出た試行は回答を受け付けずCSV行も作らないため、ファイルを修復し、manifest検証と音響検証を通した後、その参加者の再実施規則を事前登録に従って適用します。

## 参加者条件・聴力・機器・校正・除外

「未定義」とは、アプリが自動的に決めるべきでない研究計画上の条件がまだ固定されていない、という意味です。

- Kachlicka et al.: 聴覚障害または聴覚に影響する神経疾患の既往診断がないとの自己申告。4弁別課題について客観的聴力検査、ヘッドホン機種、SPL、校正、部屋条件は報告なし。
- Sun et al.: Birkbeckの心理科学系labで実施し、指示は英語・中国語併記。弁別課題について客観的聴力基準、ヘッドホン機種、SPL、校正、4下位課題内の順序、弁別得点の除外基準は本文・Supplementary Materialに記載なし。ER-3・80 dBは別のFFR測定だけの条件です。
- Saito and Tierney: 聴覚上の既往問題なしとの自己申告。labはquiet/soundproof room、onlineはlaptop・headphones・Chrome・quiet room・安定回線を指示。ヘッドホン機種、SPL、校正、客観的聴力検査は報告なし。
- Kachlicka et al. のEtymotic-3A・80 dB SPLは別のauditory-motor課題に対する条件であり、4弁別課題へ流用しません。

研究開始前に少なくとも次をプロトコル、倫理資料、事前登録、解析計画で固定します。

1. 年齢、言語背景、自己申告聴力、必要なら純音聴力基準
2. ヘッドホンの指定／支給、左右・stereo確認、ブラウザと端末
3. 音量設定手順、校正の有無、周囲騒音と実施場所
4. 未完了、8反転未達、極端なRT、刺激欠損・読込失敗、その他の技術エラーの扱い
5. 課題subset、課題順、練習、参加者フィードバックを全参加者で固定するか
6. 単課題値、標準化総合値、欠測処理、反復測定、推測統計

## Woods et al. (2017) の位置づけ

Woodsらの手続きは聴力検査やSPL校正ではなく、headphonesとloudspeakersを識別するQC screenです。

- 6試行、3-AFC “Which tone is quietest?”
- 各試行は200 Hz、1000 ms、100 ms half-Hann onset/offset、500 ms ISIの3音
- 1音は他より-6 dB、別の等強度1音は左右channel間で180°反転、残りは同相
- 3音の順序は試行ごとにrandom
- 5/6以上でpass、feedbackなし、6試行完了時だけ採点
- 偶然passする確率は0.0178

これは現在のmono FLACだけでは実装できません。新しいstereo刺激を版管理し、screen scoreとpass/failをQC変数として保存する必要があります。導入時も、headphone使用の完全保証、聴力正常の保証、SPL校正として扱ってはいけません。online pass率は64.7%で、同相controlでも一定の失敗があり、誤除外があり得ます。自動除外に使うかどうかは事前登録します。

## 信頼性と分析上の制約

Sun et al. の公式Supplementary Materialにある別標本30名・連続2日間のtest–retest相関は、4課題総合 `.701`、formant `.619`、pitch `.562`、duration `.284`（p = .128）、rise-time `.798` でした。これはSun本研究のTime 1–2縦断標本に対する信頼性係数ではありません。

Saito and Tierneyのabsolute-agreement ICC(2,2)は、formant `.520`、pitch `.525`、duration `.409`、3弁別課題の標準化総合値 `.625` でした（p.1220）。online群のconsistency ICCは総合 `.500`、duration `.372` でした（p.1221）。

ただし、再構成刺激、選択した課題構成、練習、日本語UI、ランダム順でこれらのICCが再現されるとは限りません。rise-timeは主たるtest–retest研究に含まれず、別pilotの相関 `r=.798` が紹介されるだけです。個人診断、合否、規準値、4課題を単一能力とみなす解釈には使いません。

著者は信頼性向上策として、同じ聴覚処理検査を2回行い平均することを推奨しています。現行ビルドを研究利用する場合は、同じ版の刺激・コード・手続きを固定したtest–retest検証、ICC・SEM・必要ならMDCの推定を優先します。

## 実装上の版管理

- 統合版: `battery_version = 5.0.0`
- trial CSV: `schema_version = 7`
- wide CSV: `wide_schema_version = 5`
- 既定の階段法・採点出典: `kachlicka2019`
- Kachlicka設定: 原著p.17どおり `first_scored_reversal = 2`。第3反転開始ではない
- Saito–Tierney設定: `step_sizes = 10|5|1|1|1|1|1|1`
- Sun設定: Cambridge公式本文pp.558–559で再監査済み。`first_scored_reversal = 3`、`reversal_level_timing = after_step_update`
- 手続き–刺激binding: Kachlicka → `kachlicka2019-reconstruction-v1`、Sun → `sun2021-reconstruction-v1`、Saito–Tierney → `saito-tierney2024-reconstruction-v1`
- 親刺激セット: `saito-tierney-offline-osf-6p8hv-e8ebb0a5`。OSF公式ZIPとの404/404同一性をmanifestに記録
- 再構成claim: `reported_parameter_reconstruction_not_original_study_files`
- 刺激欠損・未検証set・手続きとsetの不一致: fail closed、代替刺激なし

コード、刺激、生成parameter、研究計画のいずれかが変わった場合は、版番号、catalog、manifest、CSV schema、この監査記録を同時に更新します。
