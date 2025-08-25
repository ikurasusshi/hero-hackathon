import { state } from "./state.js";
import { sendAudioChunk } from "./api.js";
import { commitTranscriptAt } from "./transcript.js";

let recorder,
  stream,
  serverBase = "";

export async function startMediaRecorder(server) {
  serverBase = server;
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });

  recorder.ondataavailable = async (e) => {
    if (!e.data || e.data.size === 0) return;
    const fd = new FormData();
    fd.append("audio", e.data, "chunk.webm");
    fd.append("t_ms", String(state.msElapsed));
    const json = await sendAudioChunk(serverBase, fd);
    (json.results || []).forEach((r) => {
      const ts = typeof r.start_ms === "number" ? r.start_ms : state.msElapsed;
      commitTranscriptAt(r.text, ts);
    });
  };

  // 3秒ごとにブロブ送信
  recorder.start(3000);
}

export function stopMediaRecorder() {
  try {
    recorder && recorder.state !== "inactive" && recorder.stop();
  } catch {}
  try {
    stream && stream.getTracks().forEach((t) => t.stop());
  } catch {}
  recorder = null;
  stream = null;
}
