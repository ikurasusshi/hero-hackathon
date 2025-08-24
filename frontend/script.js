const slidesContainer = document.getElementById('slides');

// スライド生成
function createSlide(x, y) {
  const newSlide = document.createElement('div');
  newSlide.className = 'slide';
  newSlide.style.left = `${x * 250}px`;
  newSlide.style.top = `${y * 200}px`;
  newSlide.setAttribute('data-x', x);
  newSlide.setAttribute('data-y', y);
  newSlide.innerHTML = `
    <textarea placeholder="1行目"></textarea>
    <textarea placeholder="2行目"></textarea>
    <textarea placeholder="3行目"></textarea>
    <div class="absolute bottom-2 right-2 flex gap-1">
      <button class="add-slide bg-green-500 text-white text-xs px-2 py-1 rounded" data-dir="right">→</button>
      <button class="add-slide bg-blue-500 text-white text-xs px-2 py-1 rounded" data-dir="down">↓</button>
    </div>`;
  return newSlide;
}

// 線を描画
 function drawConnections() {
      svg.innerHTML = "";
      Object.values(slides).forEach(s => {
        if (s.parentId) {
          const parent = slides[s.parentId];
          if (!parent) return;
          const x1 = parent.x + 150; // 親の中心
          const y1 = parent.y + 90;
          const x2 = s.x + 150; // 子の中心
          const y2 = s.y + 90;
          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          line.setAttribute("x1", x1);
          line.setAttribute("y1", y1);
          line.setAttribute("x2", x2);
          line.setAttribute("y2", y2);
          line.setAttribute("stroke", "#4b5563");
          line.setAttribute("stroke-width", "2");
          svg.appendChild(line);
        }
      });
    }

// ボタン処理
slidesContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('add-slide')) {
    const parent = e.target.closest('.slide');
    const x = parseInt(parent.getAttribute('data-x'));
    const y = parseInt(parent.getAttribute('data-y'));
    let newX = x, newY = y;

    if (e.target.dataset.dir === 'right') newX++;
    if (e.target.dataset.dir === 'down') newY++;

    // すでにスライドがあるか確認
    if (document.querySelector(`.slide[data-x='${newX}'][data-y='${newY}']`)) return;

    const newSlide = createSlide(newX, newY);
    slidesContainer.appendChild(newSlide);
    drawLine(parent, newSlide);
  }
});
