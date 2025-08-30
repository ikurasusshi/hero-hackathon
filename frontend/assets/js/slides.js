// スライドCRUD・編集完了でeditedAt付与・リンクプレビュー
import { state, saveLocal } from "./state.js";
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
  s.editedAt = msToClock(state.msElapsed); // ★ 現在のタイマーを記録
  updateStamp();
  renderSlideList(); // リスト側の表示（editedAt）も更新
  saveLocal(); // 編集完了時に保存
}

function renderSlideList() {
  if (!els.slideList) return;
  els.slideList.innerHTML = "";
  els.slideList.className = "slide-tree-view";
  // ノード配置用座標計算
  const nodeElements = [];
  const nodeSize = { w: 320, h: 180, gapX: 80, gapY: 40 };
  let yOffset = 40;
  // 再帰的にノードを配置
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

    // タイトル編集
    if (editingNodeId === slide.id && editingField === "title") {
      const input = document.createElement("input");
      input.type = "text";
      input.value = slide.title || "";
      input.className = "inline-edit-input";
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          finishInlineEdit(slide, input.value, "title");
        }
      });
      input.addEventListener("blur", () => {
        finishInlineEdit(slide, input.value, "title");
      });
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
      title.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          startInlineEdit(slide.id, "title");
          e.preventDefault();
        }
      });
      node.appendChild(title);
    }

    // 内容編集
    if (editingNodeId === slide.id && editingField === "content") {
      const textarea = document.createElement("textarea");
      textarea.value = slide.content || "";
      textarea.className = "inline-edit-textarea";
      textarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          finishInlineEdit(slide, textarea.value, "content");
        }
      });
      textarea.addEventListener("blur", () => {
        finishInlineEdit(slide, textarea.value, "content");
      });
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
      content.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          startInlineEdit(slide.id, "content");
          e.preventDefault();
        }
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
    // 子追加ボタン
    const btnAddChild = document.createElement("button");
    btnAddChild.className = "btn small";
    btnAddChild.textContent = "＋子";
    btnAddChild.addEventListener("click", (e) => {
      e.stopPropagation();
      addTopicSlide(slide.id, true, "child");
    });
    node.appendChild(btnAddChild);

    // 兄弟追加ボタン（親がいる場合のみ）
    if (slide.parentId !== null) {
      const btnAddSibling = document.createElement("button");
      btnAddSibling.className = "btn small";
      btnAddSibling.textContent = "＋兄弟";
      btnAddSibling.addEventListener("click", (e) => {
        e.stopPropagation();
        addTopicSlide(slide.parentId, true, "sibling");
      });
      node.appendChild(btnAddSibling);
    }
    els.slideList.appendChild(node);
    nodeElements.push({
      id: slide.id,
      parentId: slide.parentId,
      el: node,
      x,
      y,
    });

    // 削除ボタン
    const btnDelete = document.createElement("button");
    btnDelete.className = "delete-btn";
    btnDelete.textContent = "×";
    btnDelete.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteSlide(slide.id);
    });
    node.appendChild(btnDelete);

    // 子ノードを下に並べる
    const children = state.slides.filter((s) => s.parentId === slide.id);
    let childY = y;
    children.forEach((child, i) => {
      if (i > 0) childY += nodeSize.h + nodeSize.gapY;
      placeNode(child, depth + 1, x, childY);
    });
  }
  // ルートノードから配置
  state.slides
    .filter((s) => s.parentId === null)
    .forEach((s, i) => {
      if (i > 0) yOffset += nodeSize.h + nodeSize.gapY;
      placeNode(s, 0, 40, yOffset);
    });
  // 線描画
  setTimeout(
    () =>
      drawTreeLines(
        els.slideList.querySelector("#slideTreeLines"),
        nodeElements
      ),
    0
  );
  // SVG線がなければ追加
  let svg = document.getElementById("slideTreeLines");
  if (!svg) {
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("id", "slideTreeLines");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    els.slideList.appendChild(svg);
  } else {
    svg.innerHTML = "";
  }
}

function startInlineEdit(id, field) {
  editingNodeId = id;
  editingField = field;
  renderSlideList();
}
function finishInlineEdit(slide, value, field) {
  if (field === "title") {
    slide.title = value || "(無題の議題)";
  } else if (field === "content") {
    slide.content = value;
  }
  editingNodeId = null;
  editingField = null;
  renderSlideList();
  saveLocal();
}

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
  if (els.stamp && typeof updateStamp === "function") updateStamp();
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

function addTopicSlide(parentId = null, focusEdit = false, relation = "child") {
  let baseTitle = "";
  if (parentId) {
    const parent = state.slides.find((s) => s.id === parentId);
    if (parent) {
      if (relation === "child") {
        baseTitle = parent.title + "-子";
      } else if (relation === "sibling") {
        baseTitle = parent.title + "-兄弟";
      }
    }
  } else {
    baseTitle = `議題${state.slides.length + 1}`;
  }

  const s = {
    id: uid(),
    type: "topic",
    title: baseTitle || `議題${state.slides.length + 1}`,
    content: "",
    editedAt: "-",
    parentId: parentId,
  };
  state.slides.push(s);
  state.selectedSlideId = s.id;
  if (focusEdit) {
    editingNodeId = s.id;
  }
  renderSlideList();
  renderEditor();
}

function moveSelectionByArrow(key) {
  const current = currentSlide();
  if (!current) return;
  // 兄弟リスト
  const siblings = state.slides.filter((s) => s.parentId === current.parentId);
  const idx = siblings.findIndex((s) => s.id === current.id);
  if (key === "ArrowUp" && idx > 0) {
    selectSlide(siblings[idx - 1].id);
  } else if (key === "ArrowDown" && idx < siblings.length - 1) {
    selectSlide(siblings[idx + 1].id);
  } else if (key === "ArrowLeft" && current.parentId) {
    // 親ノードへ
    selectSlide(current.parentId);
  } else if (key === "ArrowRight") {
    // 最初の子ノードへ
    const children = state.slides.filter((s) => s.parentId === current.id);
    if (children.length > 0) {
      selectSlide(children[0].id);
    }
  }
}

// drawTreeLinesはノードのx,yを使って線を描画
function drawTreeLines(svg, nodeElements) {
  if (!svg) return;
  svg.innerHTML = "";
  // 親IDごとに子ノードをまとめる
  const parentToChildren = {};
  nodeElements.forEach((n) => {
    if (!n.parentId) return;
    if (!parentToChildren[n.parentId]) parentToChildren[n.parentId] = [];
    parentToChildren[n.parentId].push(n);
  });
  Object.entries(parentToChildren).forEach(([parentId, children]) => {
    const parent = nodeElements.find((p) => p.id === parentId);
    if (!parent) return;
    const px = parent.x + 320; // 親ノードの右中央x
    const py = parent.y + 90; // 親ノードの中央y
    children.forEach((child) => {
      const cx = child.x; // 子ノードの左中央x
      const cy = child.y + 90; // 子ノードの中央y
      // 親の右中央→水平→子の左中央
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
    els.topicTitle.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") stampEditedNow();
    });
  }

  if (els.topicContent) {
    els.topicContent.addEventListener("input", (e) => {
      const s = currentSlide();
      if (!s) return;
      s.content = e.target.value;
      saveLocal();
    });
    els.topicContent.addEventListener("blur", stampEditedNow);
    els.topicContent.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") stampEditedNow();
    });
  }

  // キーボード矢印ナビ
  document.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      moveSelectionByArrow(e.key);
      e.preventDefault();
    }
  });
}

function deleteSlide(id) {
  // 1. 削除対象を探す
  const idx = state.slides.findIndex((s) => s.id === id);
  if (idx === -1) return;

  // 2. 子ノードは親なし(null)に付け替える（残す）
  const slide = state.slides[idx];
  state.slides.forEach((s) => {
    if (s.parentId === slide.id) {
      s.parentId = slide.parentId; // 祖父母に付け替え or null
    }
  });

  // 3. 対象スライドを削除
  state.slides.splice(idx, 1);

  // 4. 選択スライドが消えた場合の処理
  if (state.selectedSlideId === id) {
    state.selectedSlideId = state.slides[0]?.id || null;
  }

  renderSlideList();
  renderEditor();
}
