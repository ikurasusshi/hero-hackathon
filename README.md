会議メモ支援アプリ (仮称)

このプロジェクトは、リモート会議や打ち合わせの内容を整理・記録しやすくするための Web アプリ です。
スライド形式で議題を管理し、メモ一覧ページで編集済みの内容を振り返ることができます。

📌 機能概要
📝 スライド管理

「議題スライド」をツリー構造で追加・編集可能

子スライド / 兄弟スライド の追加に対応

例: 議題 1-子, 議題 1-兄弟

スライド削除機能（削除後はローカルストレージからも完全に消去）

🗒 メモ一覧ページ

メインページに存在するスライドだけを一覧表示

削除済みスライドは表示されない

各メモは以下の情報を表示

タイトル

内容

編集時刻（タイマー基準）

⏱ タイマー

会議進行に合わせてスタート/ストップ可能

mm:ss 形式で表示

💾 データ永続化

localStorage を利用してブラウザに保存

ページをリロードしても編集内容は保持される

📂 ディレクトリ構成（主要ファイル）
project-root/
├── index.html # メイン UI
├── memo.html # メモ一覧ページ
├── state.js # 状態管理（slides, todos, transcripts, timer）
├── slide.js # スライド CRUD・描画処理
├── timer.js # タイマー処理
├── recorder.media.js # 音声録音（将来的に Whisper 連携用）
├── transcript.js # 文字起こし（モック実装あり）
├── style.css # スタイルシート
└── README.md # 本ドキュメント

🚀 セットアップ & 起動方法

1. リポジトリをクローン
   git clone <your-repo-url>
   cd <project-folder>

2. ローカルで開発用サーバーを起動

（例: VSCode Live Server / Python simple server）

# Python 3.x

python -m http.server 5500

3. ブラウザでアクセス
   http://127.0.0.1:5500/index.html

🔧 技術スタック

HTML / CSS / JavaScript (Vanilla JS)

LocalStorage

（拡張予定）Flask + Whisper API による文字起こし

📌 今後の拡張予定

音声録音とリアルタイム文字起こし（Whisper 連携）

Slack / Teams へのメモ自動送信

メモに対するリマインダー機能

UI 改善（ドラッグでスライド並び替え 等）

🧑‍💻 開発メモ

スライド削除は deleteSlideAndChildren 関数で再帰的に処理

メモ一覧は localStorage["km-state"] を基に描画し、削除済みは反映されないように修正済み

兄弟/子のスライド追加は addTopicSlide の mode パラメータで制御
