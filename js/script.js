// script.js — 慧编程课例展示 (Apple-style redesign)
// Logic unchanged from original; only cosmetic adjustments

function getStars(num) {
  return '★'.repeat(num) + '☆'.repeat(5 - num);
}

// ── Home ──────────────────────────────────────────────────────
function initHome() {
  const grid = document.getElementById('course-grid');
  if (!grid) return;

  const filterBar = document.getElementById('home-filter-bar');
  if (filterBar) {
    const allTags = [...new Set(courseData.flatMap(item => item.tags))];
    allTags.forEach(tag => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.filter = tag;
      btn.textContent = tag;
      btn.onclick = function () {
        document.querySelectorAll('#home-filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        renderCourses(tag);
      };
      filterBar.appendChild(btn);
    });
    filterBar.querySelector('[data-filter="all"]').onclick = function () {
      document.querySelectorAll('#home-filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderCourses('all');
    };
  }

  renderCourses('all');
}

function renderCourses(filter) {
  const grid = document.getElementById('course-grid');
  if (!grid) return;

  const filtered = filter === 'all' ? courseData : courseData.filter(item => item.tags.includes(filter));
  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔭</div>
        <p>暂无匹配课程</p>
      </div>`;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => window.location.href = `detail.html?id=${item.id}`;
    card.innerHTML = `
      <div class="card-img" style="background-image: url('${item.cover}')"></div>
      <div class="card-body">
        <h3>${item.title}</h3>
        <div class="tags">${item.tags.map(t => `<span>${t}</span>`).join('')}</div>
        <p class="card-desc">${item.desc}</p>
        <div class="stars">${getStars(item.difficulty)}</div>
      </div>`;
    grid.appendChild(card);
  });
}

// ── Detail ─────────────────────────────────────────────────────
function initDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const item = courseData.find(c => c.id === id);

  if (!item) {
    document.body.innerHTML = `<h1 style="color:var(--ink);text-align:center;margin-top:120px;">未找到课程数据</h1>`;
    return;
  }

  document.getElementById('d-title').innerText = item.title;
  document.getElementById('d-intro').innerText = item.intro || '暂无简介';
  document.getElementById('d-note').innerText = item.teacherNote || '保持好奇，继续探索代码的奥秘！';
  document.getElementById('d-video').src = item.video || '';

  const mainImg = document.getElementById('d-code-main');
  const thumbContainer = document.getElementById('d-code-thumbnails');
  const images = item.codeImages || (item.codeImage ? [item.codeImage] : []);

  if (images.length > 0) {
    mainImg.src = images[0];
    thumbContainer.innerHTML = '';
    images.forEach((url, index) => {
      const img = document.createElement('img');
      img.src = url;
      img.className = `thumb-item ${index === 0 ? 'active' : ''}`;
      img.onclick = function () {
        mainImg.src = url;
        document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
      };
      thumbContainer.appendChild(img);
    });
  }

  const setupDownload = (id, url, msg) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    if (url && url !== '#' && url !== '') {
      btn.href = url;
      btn.classList.remove('disabled');
      btn.setAttribute('download', '');
      const p = btn.querySelector('p');
      if (id === 'btn-code')   p.innerText = '.mblock / .py';
      if (id === 'btn-ppt')    p.innerText = '课堂演示 PPT';
      if (id === 'btn-assets') p.innerText = '图片 / 音频资源';
    } else {
      btn.href = 'javascript:void(0)';
      btn.classList.add('disabled');
      btn.removeAttribute('download');
      const p = btn.querySelector('p');
      if (p) p.innerText = '⚠️ ' + msg;
    }
  };

  setupDownload('btn-code',   item.code,      '暂无源码');
  setupDownload('btn-ppt',    item.ppt,       '暂无课件');
  setupDownload('btn-assets', item.materials, '暂无素材');
}

// ── Typewriter ─────────────────────────────────────────────────
function typeEffect(element, text, speed = 80) {
  let i = 0;
  const timer = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i); i++;
    } else {
      clearInterval(timer);
      setTimeout(() => {
        const del = setInterval(() => {
          if (element.textContent.length > 0) element.textContent = element.textContent.slice(0, -1);
          else { clearInterval(del); typeEffect(element, text, speed); }
        }, speed / 2);
      }, 1200);
    }
  }, speed);
}

// ── Init ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('course-grid')) {
    initHome();
    const subtitle = document.getElementById('typing-text');
    if (subtitle) typeEffect(subtitle, '记录学习足迹，见证代码力量...');
  } else {
    initDetail();
  }
});
