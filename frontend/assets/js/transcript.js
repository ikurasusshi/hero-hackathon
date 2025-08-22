// 文字起こしリストの描画・追記（フェーズ1はダミー生成）
import { state } from "./state.js";
import { msToClock } from "./timer.js";

let demoTimer = null;

export function commitTranscript(text) {
  const item = {
    id: "t_" + Math.random().toString(36).slice(2, 9),
    tsMs: state.msElapsed,
    timeText: msToClock(state.msElapsed),
    text,
  };
  state.transcripts.push(item);

  const li = document.createElement("li");
  li.className = "transcript-item";
  li.dataset.id = item.id;
  li.dataset.tsms = String(item.tsMs);

  const divText = document.createElement("div");
  divText.className = "text";
  divText.textContent = item.text;

  const divTime = document.createElement("div");
  divTime.className = "time";
  divTime.textContent = `[${item.timeText}]`;

  li.appendChild(divText);
  li.appendChild(divTime);
  const list = document.getElementById("transcriptList");
  if (list) {
    list.appendChild(li);
    li.scrollIntoView({ behavior: "smooth", block: "end" });
  }
}

export function startDummyTranscript() {
  const lines = [
    "（ダミー）会議を開始します。",
    "（ダミー）議題1：要件定義の確認です。",
    "（ダミー）次にUIのワイヤーフレームを検討します。",
    "（ダミー）ToDoに「資料作成」を追加してください。",
  ];
  let i = 0;
  demoTimer = setInterval(() => {
    const text = lines[i % lines.length];
    commitTranscript(text);
    i++;
  }, 3000);
}

export function stopDummyTranscript() {
  if (demoTimer) {
    clearInterval(demoTimer);
    demoTimer = null;
  }
}
