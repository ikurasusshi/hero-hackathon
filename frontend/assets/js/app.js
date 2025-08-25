import { startTimer, stopTimer } from "./timer.js";
import { initSlides } from "./slides.js";
import { initTodos } from "./todos.js";
import { startMockRecognition, stopMockRecognition } from "./recorder.mock.js";
import { startMediaRecorder, stopMediaRecorder } from "./recorder.media.js";
import { ping } from "./api.js";

const SERVER_BASE = "http://127.0.0.1:5000"; // Flaskをここで起動する前提
let useServer = false; // 自動検出の結果で切替

function qs(id) {
  return document.getElementById(id);
}

async function detectServer() {
  useServer = await ping(SERVER_BASE);
  console.log("Server available?", useServer);
  if (!useServer) {
    // 自動フォールバック：ダミー生成に切替
    console.info("Fallback to mock transcript (no server or CORS issue).");
  }
}

function wire() {
  qs("startBtn").addEventListener("click", async () => {
    qs("startBtn").disabled = true;
    qs("stopBtn").disabled = false;
    startTimer();

    if (useServer && "MediaRecorder" in window) {
      await startMediaRecorder(SERVER_BASE);
    } else {
      startMockRecognition(); // フォールバック
    }
  });

  qs("stopBtn").addEventListener("click", () => {
    qs("startBtn").disabled = false;
    qs("stopBtn").disabled = true;
    stopTimer();

    if (useServer && "MediaRecorder" in window) {
      stopMediaRecorder();
    } else {
      stopMockRecognition();
    }
  });

  initSlides();
  initTodos();
}

document.addEventListener("DOMContentLoaded", async () => {
  await detectServer();
  wire();
});
