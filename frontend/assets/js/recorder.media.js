import { state } from "./state.js";
import { sendAudioChunk } from "./api.js";
import { commitTranscriptAt } from "./transcript.js";

let recorder,
  stream,
  serverBase = "",
  intervalId = null;

export async function startMediaRecorder(server) {
  serverBase = server;
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });

  recorder.ondataavailable = async (e) => {
    if (!e.data || e.data.size === 0) return;
    const fd = new FormData();
    fd.append("audio", e.data, "chunk.webm");
    fd.append("t_ms", String(state.msElapsed));

    try {
      const json = await sendAudioChunk(serverBase, fd);
      (json.results || []).forEach((r) => {
        const ts =
          typeof r.start_ms === "number" ? r.start_ms : state.msElapsed;
        commitTranscriptAt(r.text, ts);
      });
    } catch (err) {
      console.error("sendAudioChunk failed:", err);
    }
  };

  // --- 重要ポイント ---
  recorder.start(); // timeslice を指定しない
  intervalId = setInterval(() => {
    if (recorder && recorder.state === "recording") {
      recorder.requestData(); // 自分で3秒ごとにチャンクを要求
    }
  }, 3000);

  recorder.onerror = (e) => console.error("MediaRecorder error:", e);
  recorder.onstop = () => console.log("MediaRecorder stopped");
}

export function stopMediaRecorder() {
  if (recorder && recorder.state !== "inactive") recorder.stop();
  if (stream) stream.getTracks().forEach((t) => t.stop());
  if (intervalId) clearInterval(intervalId);

  recorder = null;
  stream = null;
  intervalId = null;
}
