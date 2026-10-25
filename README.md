# 人生OS アプリ

非公開リポジトリの Issue をタスク一覧として見るための、スマホ向けの小さな Web アプリ。HTML 1枚。

- データはこのリポジトリには入っていない。開いたときに、スマホに保存したトークンで GitHub API を直接読み書きする。
- トークンはブラウザの localStorage にだけ保存される。
- 必要なトークン：fine-grained personal access token（対象リポジトリだけ / Issues: Read and write / Contents: Read and write）。
