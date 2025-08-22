// スライドCRUD・編集完了でeditedAt付与・リンクプレビュー
import { state } from "./state.js";
import { msToClock } from "./timer.js";

const els = {
  btnAddTopic: null,
  slideList: null,
  emptyEditor: null,
  editorTopic: null,
  topicTitle: null,
  topicContent: null,
  stamp: null,
};

function uid() {
  return "s_" + Math.random().toString(36).slice(2, 9);
}
function currentSlide() {
  return state.slides.find((s) => s.id === state.selectedSlideId) || null;
}

function updateStamp() {
  if (!els.stamp) return;
  const s = currentSlide();
  els.stamp.textContent = "編集完了時刻: " + (s?.editedAt || "-");
}

function stampEditedNow() {
  const s = currentSlide();
  if (!s) return;
  s.editedAt = msToClock(state.msElapsed); // ★ 現在のタイマーを記録
  updateStamp();
  renderSlideList(); // リスト側の表示（editedAt）も更新
}

function renderSlideList() {
  if (!els.slideList) return;
  els.slideList.innerHTML = "";
  state.slides.forEach((s) => {
    const li = document.createElement("li");
    li.className =
      "slide-item" + (s.id === state.selectedSlideId ? " active" : "");
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = s.title || "(無題の議題)";
    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = `編集: ${s.editedAt || "-"}`;
    li.appendChild(title);
    li.appendChild(meta);
    li.addEventListener("click", () => {
      selectSlide(s.id);
    });
    els.slideList.appendChild(li);
  });
}

function renderEditor() {
  const s = currentSlide();
  if (!s) {
    els.emptyEditor.classList.remove("hidden");
    els.editorTopic.classList.add("hidden");
    return;
  }
  els.emptyEditor.classList.add("hidden");

  // 今回は topic スライドだけを扱う（ToDoスライドは後続フェーズ）
  els.editorTopic.classList.remove("hidden");
  els.topicTitle.value = s.title || "";
  els.topicContent.value = s.content || "";
  updateStamp();
}

function selectSlide(id) {
  state.selectedSlideId = id;
  renderSlideList();
  renderEditor();

  // 議題クリック → 左の最新発言をハイライト（分かりやすい効果）
  const list = document.getElementById("transcriptList");
  if (list && list.lastElementChild) {
    [...list.children].forEach((li) => li.classList.remove("highlight"));
    list.lastElementChild.classList.add("highlight");
    list.lastElementChild.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}

function addTopicSlide() {
  const s = {
    id: uid(),
    type: "topic",
    title: `議題${state.slides.length + 1}`,
    content: "",
    editedAt: "-",
  };
  state.slides.push(s);
  state.selectedSlideId = s.id;
  renderSlideList();
  renderEditor();
}

export function initSlides() {
  // 要素参照
  els.btnAddTopic = document.getElementById("btnAddTopic");
  els.slideList = document.getElementById("slideList");
  els.emptyEditor = document.getElementById("emptyEditor");
  els.editorTopic = document.getElementById("editorTopic");
  els.topicTitle = document.getElementById("topicTitle");
  els.topicContent = document.getElementById("topicContent");
  els.stamp = document.getElementById("stamp");

  // 初期描画
  renderSlideList();
  renderEditor();

  // イベント結線
  if (els.btnAddTopic) els.btnAddTopic.addEventListener("click", addTopicSlide);

  if (els.topicTitle) {
    els.topicTitle.addEventListener("input", (e) => {
      const s = currentSlide();
      if (!s) return;
      s.title = e.target.value;
      renderSlideList();
    });
    els.topicTitle.addEventListener("blur", stampEditedNow);
    els.topicTitle.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") stampEditedNow();
    });
  }

  if (els.topicContent) {
    els.topicContent.addEventListener("input", (e) => {
      const s = currentSlide();
      if (!s) return;
      s.content = e.target.value;
    });
    els.topicContent.addEventListener("blur", stampEditedNow);
    els.topicContent.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") stampEditedNow();
    });
  }
}
