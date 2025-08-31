// スライドCRUD・編集完了でeditedAt付与・リンクプレビュー
import { saveLocal, state } from "./state.js";
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

let editingNodeId = null;
let editingField = null; // 'title' or 'content'

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
  s.editedAt = msToClock(state.msElapsed);
  updateStamp();
  renderSlideList();
  saveLocal();
}

function renderSlideList() {
  if (!els.slideList) return;
  els.slideList.innerHTML = "";
  els.slideList.className = "slide-tree-view";

  const nodeElements = [];
  const nodeSize = { w: 320, h: 180, gapX: 80, gapY: 40 };
  let yOffset = 40;

  function placeNode(slide, depth, parentX, parentY) {
    const x = parentX + (depth === 0 ? 0 : nodeSize.w + nodeSize.gapX);
    const y = parentY;
    const node = document.createElement("div");
    node.className =
      "slide-tree-node" +
      (slide.id === state.selectedSlideId ? " selected" : "");
    node.style.left = x + "px";
    node.style.top = y + "px";
    node.setAttribute("data-slide-id", slide.id);

    // --- タイトル ---
    if (editingNodeId === slide.id && editingField === "title") {
      const input = document.createElement("input");
      input.type = "text";
      input.value = slide.title || "";
      input.className = "inline-edit-input";
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") finishInlineEdit(slide, input.value, "title");
      });
      input.addEventListener("blur", () =>
        finishInlineEdit(slide, input.value, "title")
      );
      setTimeout(() => input.focus(), 0);
      node.appendChild(input);
    } else {
      const title = document.createElement("span");
      title.className = "title";
      title.textContent = slide.title || "(無題の議題)";
      title.tabIndex = 0;
      title.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        startInlineEdit(slide.id, "title");
      });
      node.appendChild(title);
    }

    // --- 削除ボタン ---
    const btnDelete = document.createElement("button");
    btnDelete.textContent = "×";
    btnDelete.className = "btn small delete-btn";
    btnDelete.style.position = "absolute";
    btnDelete.style.top = "4px";
    btnDelete.style.right = "4px";
    btnDelete.style.padding = "2px 6px";
    btnDelete.style.fontSize = "12px";
    btnDelete.style.background = "#b33";
    btnDelete.style.color = "#fff";
    btnDelete.style.borderRadius = "50%";
    btnDelete.title = "このスライドを削除";
    btnDelete.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = state.slides.findIndex((s) => s.id === slide.id);
      if (idx >= 0) {
        state.slides.splice(idx, 1);
        if (state.selectedSlideId === slide.id) {
          state.selectedSlideId =
            state.slides.length > 0 ? state.slides[0].id : null;
        }
        renderSlideList();
        renderEditor();
        saveLocal();
      }
    });
    node.appendChild(btnDelete);

    // --- 内容 ---
    if (editingNodeId === slide.id && editingField === "content") {
      const textarea = document.createElement("textarea");
      textarea.value = slide.content || "";
      textarea.className = "inline-edit-textarea";
      textarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey)
          finishInlineEdit(slide, textarea.value, "content");
      });
      textarea.addEventListener("blur", () =>
        finishInlineEdit(slide, textarea.value, "content")
      );
      setTimeout(() => textarea.focus(), 0);
      node.appendChild(textarea);
    } else {
      const content = document.createElement("div");
      content.className = "content";
      content.textContent = slide.content || "";
      content.tabIndex = 0;
      content.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        startInlineEdit(slide.id, "content");
      });
      node.appendChild(content);
    }

    const meta = document.createElement("span");
    meta.className = "meta";
    meta.textContent = `編集: ${slide.editedAt || "-"}`;
    node.appendChild(meta);

    node.addEventListener("click", (e) => {
      e.stopPropagation();
      selectSlide(slide.id);
    });

    // --- 子ボタン ---
    const btnAddChild = document.createElement("button");
    btnAddChild.className = "btn small";
    btnAddChild.textContent = "＋子";
    btnAddChild.addEventListener("click", (e) => {
      e.stopPropagation();
      addTopicSlide(slide.id, true, "child");
    });
    node.appendChild(btnAddChild);

    // --- 兄弟ボタン ---
    if (slide.parentId !== null) {
      const btnAddSibling = document.createElement("button");
      btnAddSibling.className = "btn small";
      btnAddSibling.textContent = "＋兄弟";
      btnAddSibling.addEventListener("click", (e) => {
        e.stopPropagation();
        addTopicSlide(slide.id, true, "sibling");
      });
      node.appendChild(btnAddSibling);
    }

    els.slideList.appendChild(node);
    nodeElements.push({ id: slide.id, parentId: slide.parentId, x, y });

    // 再帰：子を描画
    const children = state.slides.filter((s) => s.parentId === slide.id);
    let childY = y;
    children.forEach((child, i) => {
      if (i > 0) childY += nodeSize.h + nodeSize.gapY;
      placeNode(child, depth + 1, x, childY);
    });
  }

  // --- ルートノード配置 ---
  state.slides
    .filter((s) => s.parentId === null)
    .forEach((s, i) => {
      if (i > 0) yOffset += nodeSize.h + nodeSize.gapY;
      placeNode(s, 0, 40, yOffset);
    });
}

// --- Inline編集 ---
function startInlineEdit(id, field) {
  editingNodeId = id;
  editingField = field;
  renderSlideList();
}
function finishInlineEdit(slide, value, field) {
  if (field === "title") slide.title = value || "(無題の議題)";
  else if (field === "content") slide.content = value;
  editingNodeId = null;
  editingField = null;
  renderSlideList();
  saveLocal();
}

// --- エディタ ---
function renderEditor() {
  const s = currentSlide();
  if (!s) {
    if (els.emptyEditor) els.emptyEditor.classList.remove("hidden");
    if (els.editorTopic) els.editorTopic.classList.add("hidden");
    return;
  }
  if (els.emptyEditor) els.emptyEditor.classList.add("hidden");
  if (els.editorTopic) els.editorTopic.classList.remove("hidden");
  if (els.topicTitle) els.topicTitle.value = s.title || "";
  if (els.topicContent) els.topicContent.value = s.content || "";
  if (els.stamp) updateStamp();
}

// --- 選択 ---
function selectSlide(id) {
  state.selectedSlideId = id;
  renderSlideList();
  renderEditor();
}

// --- スライド追加 ---
function addTopicSlide(targetId = null, focusEdit = false, mode = "root") {
  let title,
    parentId = null;

  if (mode === "child" && targetId) {
    const parent = state.slides.find((s) => s.id === targetId);
    title = `${parent?.title || "議題"}-子`;
    parentId = parent.id;
  } else if (mode === "sibling" && targetId) {
    const target = state.slides.find((s) => s.id === targetId);
    const parent = state.slides.find((s) => s.id === target.parentId);
    title = `${parent?.title || "議題"}-兄弟`;
    parentId = parent ? parent.id : null;
  } else {
    if (!state.topicCounter) state.topicCounter = 1;
    title = `議題${state.topicCounter++}`;
  }

  const s = {
    id: uid(),
    type: "topic",
    title,
    content: "",
    editedAt: "-",
    parentId,
  };

  state.slides.push(s);
  state.selectedSlideId = s.id;
  if (focusEdit) editingNodeId = s.id;
  renderSlideList();
  renderEditor();
  saveLocal();
}

// --- 矢印キー移動 ---
function moveSelectionByArrow(key) {
  const current = currentSlide();
  if (!current) return;
  const siblings = state.slides.filter((s) => s.parentId === current.parentId);
  const idx = siblings.findIndex((s) => s.id === current.id);
  if (key === "ArrowUp" && idx > 0) selectSlide(siblings[idx - 1].id);
  else if (key === "ArrowDown" && idx < siblings.length - 1)
    selectSlide(siblings[idx + 1].id);
  else if (key === "ArrowLeft" && current.parentId)
    selectSlide(current.parentId);
  else if (key === "ArrowRight") {
    const children = state.slides.filter((s) => s.parentId === current.id);
    if (children.length > 0) selectSlide(children[0].id);
  }
}

// --- 線描画 ---
function drawTreeLines(svg, nodeElements) {
  if (!svg) return;
  svg.innerHTML = "";
  const parentToChildren = {};
  nodeElements.forEach((n) => {
    if (!n.parentId) return;
    if (!parentToChildren[n.parentId]) parentToChildren[n.parentId] = [];
    parentToChildren[n.parentId].push(n);
  });
  Object.entries(parentToChildren).forEach(([parentId, children]) => {
    const parent = nodeElements.find((p) => p.id === parentId);
    if (!parent) return;
    const px = parent.x + 320;
    const py = parent.y + 90;
    children.forEach((child) => {
      const cx = child.x;
      const cy = child.y + 90;
      const hLine = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      hLine.setAttribute("x1", px);
      hLine.setAttribute("y1", py);
      hLine.setAttribute("x2", cx);
      hLine.setAttribute("y2", cy);
      hLine.setAttribute("stroke", "#8fc7ff");
      hLine.setAttribute("stroke-width", "2.5");
      svg.appendChild(hLine);
    });
  });
}

// --- 初期化 ---
export function initSlides() {
  els.btnAddTopic = document.getElementById("btnAddTopic");
  els.slideList = document.getElementById("slideList");
  els.emptyEditor = document.getElementById("emptyEditor");
  els.editorTopic = document.getElementById("editorTopic");
  els.topicTitle = document.getElementById("topicTitle");
  els.topicContent = document.getElementById("topicContent");
  els.stamp = document.getElementById("stamp");

  renderSlideList();
  renderEditor();

  if (els.btnAddTopic)
    els.btnAddTopic.addEventListener("click", () => addTopicSlide());

  if (els.topicTitle) {
    els.topicTitle.addEventListener("input", (e) => {
      const s = currentSlide();
      if (!s) return;
      s.title = e.target.value;
      renderSlideList();
      saveLocal();
    });
    els.topicTitle.addEventListener("blur", stampEditedNow);
  }

  if (els.topicContent) {
    els.topicContent.addEventListener("input", (e) => {
      const s = currentSlide();
      if (!s) return;
      s.content = e.target.value;
      saveLocal();
    });
    els.topicContent.addEventListener("blur", stampEditedNow);
  }

  document.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      moveSelectionByArrow(e.key);
      e.preventDefault();
    }
  });
}
