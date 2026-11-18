# Speech recognition engine

Files served as they are to the speech worker
(`src/features/speech/speech.worker.ts`).

| File                                   | Origin                                                                                       | Licence    |
| -------------------------------------- | -------------------------------------------------------------------------------------------- | ---------- |
| `sherpa-onnx-asr.js`                   | sherpa-onnx 1.12.36, `sherpa-onnx-wasm-simd-1.12.36-vad-asr-ja-zipformer_reazonspeech`         | Apache-2.0 |
| `sherpa-onnx-vad.js`                   | same archive                                                                                 | Apache-2.0 |
| `sherpa-onnx-wasm-main-vad-asr.js`     | same archive, **modified**: the block that preloads `sherpa-onnx-wasm-main-vad-asr.data` is removed | Apache-2.0 |
| `sherpa-onnx-wasm-main-vad-asr.wasm`   | same archive                                                                                 | Apache-2.0 |
| `silero_vad.onnx`                      | sherpa-onnx release `asr-models`, Silero VAD v4                                              | MIT        |

The archive comes from
<https://github.com/k2-fsa/sherpa-onnx/releases/tag/v1.12.36>. Version 1.12.36
is kept on purpose: later builds use threads, which need cross-origin isolation
(COOP and COEP headers) that GitHub Pages cannot send.

The data package of the archive bundles the model; it is removed because the
model is downloaded once from Hugging Face instead
(`reazon-research/reazonspeech-k2-v2`, Apache-2.0) and kept in the cache.

SHA-256:

```
d51ae8e8b756ee5e53423ffada0c9702973f154f561aca7984fe0b12f4060178  sherpa-onnx-asr.js
893f01168d529add8318c0a6055cf725e788585fda9b81722564a8c3c3f60e34  sherpa-onnx-vad.js
5d8e37851d1f4c0751821dd972a48b16f37d29e2ffe46b44242d863d6735b4bf  sherpa-onnx-wasm-main-vad-asr.js
fdd6e54522cf5468c60346bcff27ac2a84785ff24ef0b8efe1b082d248cec2b2  sherpa-onnx-wasm-main-vad-asr.wasm
9e2449e1087496d8d4caba907f23e0bd3f78d91fa552479bb9c23ac09cbb1fd6  silero_vad.onnx
```
