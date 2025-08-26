document.addEventListener("DOMContentLoaded", () => {
  const ul = document.getElementById("memoListUl");
  ul.innerHTML = "";
  let slides = [];
  try {
    const raw = localStorage.getItem("km-state");
    if (raw) {
      const state = JSON.parse(raw);
      slides = state.slides || [];
    }
  } catch (e) {}
  if (slides.length === 0) {
    ul.innerHTML = '<li>メモがありません。</li>';
    return;
  }
  slides.forEach(s => {
    const li = document.createElement("li");
    li.style.background = "#181e3a";
    li.style.borderRadius = "10px";
    li.style.marginBottom = "18px";
    li.style.padding = "18px 20px";
    li.style.boxShadow = "0 2px 8px 0 rgba(0,0,0,0.10)";
    const title = document.createElement("span");
    title.style.fontWeight = "bold";
    title.style.fontSize = "1.1em";
    title.style.marginBottom = "6px";
    title.style.display = "block";
    title.textContent = s.title || "(無題の議題)";
    const content = document.createElement("div");
    content.style.fontSize = "1em";
    content.style.color = "#f2f5ff";
    content.style.marginBottom = "4px";
    content.style.whiteSpace = "pre-wrap";
    content.textContent = s.content || "";
    const meta = document.createElement("span");
    meta.style.fontSize = "0.95em";
    meta.style.color = "#a7b0c0";
    meta.textContent = `編集: ${s.editedAt || "-"}`;
    li.appendChild(title);
    li.appendChild(content);
    li.appendChild(meta);
    ul.appendChild(li);
  });
});
