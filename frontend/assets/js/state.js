// 単純な状態管理（timer, transcripts, slides, todos）
export const state = {
  msElapsed: 0,
  transcripts: [], // {id, timeText, tsMs, text}
  slides: [
    // 初期スライドを1枚用意（親なし＝ルート）
    { id: "s1", type: "topic", title: "議題1", content: "", editedAt: "-", parentId: null },
  ],
  selectedSlideId: "s1",
  todos: [], // {id, title, done}
};

export function pad(n) {
  return String(n).padStart(2, "0");
}

export function saveLocal() {
  try {
    localStorage.setItem("km-state", JSON.stringify(state));
  } catch (e) {}
}
export function loadLocal() {
  try {
    const raw = localStorage.getItem("km-state");
    if (!raw) return;
    const data = JSON.parse(raw);
    Object.assign(state, data);
  } catch (e) {}
}
