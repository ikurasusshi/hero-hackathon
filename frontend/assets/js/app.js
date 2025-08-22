// 起動エントリ（type="module"）
import { startTimer, stopTimer } from "./timer.js";
import { initSlides } from "./slides.js";
import { initTodos } from "./todos.js";
import { startMockRecognition, stopMockRecognition } from "./recorder.mock.js";

function qs(id) {
  return document.getElementById(id);
}

function wire() {
  qs("startBtn").addEventListener("click", () => {
    qs("startBtn").disabled = true;
    qs("stopBtn").disabled = false;
    startTimer();
    startMockRecognition(); // フェーズ1：ダミー文字起こし開始
  });
  qs("stopBtn").addEventListener("click", () => {
    qs("startBtn").disabled = false;
    qs("stopBtn").disabled = true;
    stopTimer();
    stopMockRecognition();
  });

  initSlides();
  initTodos();
}

document.addEventListener("DOMContentLoaded", wire);
