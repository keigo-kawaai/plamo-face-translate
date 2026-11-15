// マイクの生の波形を、そのまま画面側へ渡すだけの処理
class Pcm extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0]?.[0];
    if (ch && ch.length) this.port.postMessage(ch.slice());
    return true;
  }
}
registerProcessor('pcm', Pcm);
