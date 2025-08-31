# Flask/FastAPI（後で追加）
from flask import Flask, request, jsonify
from flask_cors import CORS
import os, uuid, time, subprocess, tempfile
import whisper

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Whisperモデルをロード（smallが軽くておすすめ）
model = whisper.load_model("base")  # "tiny" "base" "small" "medium" "large" から選択可

@app.get("/health")
def health():
    return {"ok": True, "ts": int(time.time())}

@app.post("/api/chunk")
def api_chunk():
    if "audio" not in request.files:
        return jsonify({"ok": False, "error": "no audio"}), 400

    t_ms = int(request.form.get("t_ms", "0"))
    audio = request.files["audio"]

    # 一時ファイルに保存
    with tempfile.TemporaryDirectory() as tmpdir:
        webm_path = os.path.join(tmpdir, "chunk.webm")
        wav_path = os.path.join(tmpdir, "chunk.wav")
        audio.save(webm_path)

        # ffmpegで16kHz mono WAVに変換
        cmd = ["ffmpeg", "-y", "-i", webm_path, "-ar", "16000", "-ac", "1", wav_path]
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)

        # Whisperで文字起こし
        result = model.transcribe(wav_path, language="ja", no_speech_threshold=0.0)

    # 結果を返す
    return jsonify({
        "ok": True,
        "results": [
            {
                "text": result["text"],
                "start_ms": t_ms,
                "end_ms": t_ms + 3000,
                "lang": result.get("language", "ja")
            }
        ],
        "model": "whisper-small"
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)