# Flask/FastAPI（後で追加）
from flask import Flask, request, jsonify
from flask_cors import CORS
import os, uuid, time

app = Flask(__name__)
CORS(app)  # 開発用：どこからでも叩けるようにする

# 受け取った音声を保存したい場合は True
SAVE_CHUNKS = False
CHUNK_DIR = os.path.join(os.path.dirname(__file__), "runtime", "audio_chunks")
os.makedirs(CHUNK_DIR, exist_ok=True)

@app.get("/health")
def health():
    return {"ok": True, "ts": int(time.time())}

@app.post("/api/chunk")
def api_chunk():
    """
    3秒ごとなどで送られてくる音声ブロブを受け取り、
    いまはダミー文字列を返す（Whisperはまだ接続しない）。
    """
    if "audio" not in request.files:
        return jsonify({"ok": False, "error": "no audio"}), 400

    t_ms = int(request.form.get("t_ms", "0"))
    audio = request.files["audio"]

    # デバッグ用に保存（任意）
    if SAVE_CHUNKS:
        fname = f"{int(time.time()*1000)}_{uuid.uuid4().hex}.webm"
        audio.save(os.path.join(CHUNK_DIR, fname))

    # ここで本来は ffmpeg → whisper する。いまはダミー結果を返す。
    dummy_texts = [
        "（サーバ）要件定義の確認を続けます。",
        "（サーバ）UI設計について議論しましょう。",
        "（サーバ）ToDoにタスクを追加してください。"
    ]
    # 適当に時刻に応じて種類を変える
    text = dummy_texts[(t_ms // 3000) % len(dummy_texts)]

    return jsonify({
        "ok": True,
        "results": [
            { "text": text, "start_ms": t_ms, "end_ms": t_ms + 3000, "lang": "ja" }
        ],
        "model": "stub"
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)