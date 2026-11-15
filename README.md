# 対面翻訳（試作）

スマートフォンのブラウザ内で翻訳モデルを動かす、対面翻訳ページの試作です。
画面の上半分は相手向きに反転して翻訳結果を表示します。

- 翻訳は端末内で実行され、入力した文章は外部に送信されません。
- 初回のみ、翻訳モデル（約 0.5GB）を Hugging Face から取得します。以降は端末内の保存分を使います。
- 動作検証用の試作であり、品質や動作を保証するものではありません。

## 使っているもの

- 翻訳モデル: [pfnet/plamo-3-translate-0.8b-GGUF](https://huggingface.co/pfnet/plamo-3-translate-0.8b-GGUF)
  - このリポジトリにモデルは含まれません。利用時に各端末が直接取得します。
  - モデルの利用には PLaMo Community License が適用されます。条件はモデルカードを確認してください。
- 実行ライブラリ: [wllama](https://github.com/ngxson/wllama) 3.13.0（MIT License、`vendor/wllama/` に同梱）

## ローカルで動かす

```bash
node server.mjs
```

`http://localhost:8787` を開きます。
