// タイマー（start/stop, ms→mm:ss 変換）
import { state, pad } from "./state.js";

let timerId = null;

export function msToClock(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${pad(m)}:${pad(ss)}`;
}

export function startTimer() {
  if (timerId) return;
  const base = Date.now() - state.msElapsed;
  timerId = setInterval(() => {
    state.msElapsed = Date.now() - base;
    const el = document.getElementById("timer");
    if (el) el.textContent = msToClock(state.msElapsed);
  }, 200);
}

export function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}
