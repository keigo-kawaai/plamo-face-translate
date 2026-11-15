// 音声認識（Whisper）を別スレッドで動かす。画面の操作を止めないため。
import { pipeline, env } from './vendor/transformers/transformers.min.js';

// 実行に必要なファイルは同梱分を使う（オフラインでも動くように）
env.allowLocalModels = false;
env.backends.onnx.wasm.wasmPaths = {
  mjs: new URL('./vendor/transformers/ort-wasm-simd-threaded.mjs', import.meta.url).href,
  wasm: new URL('./vendor/transformers/ort-wasm-simd-threaded.wasm', import.meta.url).href,
};

let asr = null;
let isWhisper = true;

self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'load') {
      asr = null;
      isWhisper = data.model.includes('whisper');
      const files = new Map();
      asr = await pipeline('automatic-speech-recognition', data.model, {
        dtype: 'q8',
        device: 'wasm',
        progress_callback: (p) => {
          if (p.status !== 'progress' || !p.total) return;
          files.set(p.file, [p.loaded, p.total]);
          let loaded = 0;
          let total = 0;
          for (const [l, t] of files.values()) { loaded += l; total += t; }
          self.postMessage({ type: 'progress', loaded, total });
        },
      });
      self.postMessage({ type: 'ready' });
    } else if (data.type === 'run') {
      if (!asr) throw new Error('音声認識モデルが未読み込みです');
      // Moonshine は英語専用で、言語などの指定を受け付けない
      const out = isWhisper
        ? await asr(data.audio, {
          language: data.language ?? undefined, // 未指定なら言語を自動判定
          task: 'transcribe',
          chunk_length_s: 30,
        })
        : await asr(data.audio);
      self.postMessage({ type: 'result', id: data.id, text: (out.text || '').trim() });
    }
  } catch (e) {
    self.postMessage({ type: 'error', id: data.id, message: e?.message || String(e) });
  }
};
