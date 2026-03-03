// 生成星星辅助函数
function getStars(num) {
    return '★'.repeat(num) + '☆'.repeat(5 - num);
}

// 首页逻辑
function initHome() {
    const grid = document.getElementById('course-grid');
    if (!grid) return;

    // --- 筛选栏：从 courseData 动态提取所有不重复的 tag ---
    const filterBar = document.getElementById('home-filter-bar');
    if (filterBar) {
        const allTags = [...new Set(courseData.flatMap(item => item.tags))];

        allTags.forEach(tag => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.dataset.filter = tag;
            btn.textContent = tag;
            btn.onclick = function () {
                document.querySelectorAll('#home-filter-bar .filter-btn')
                    .forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                renderCourses(tag);
            };
            filterBar.appendChild(btn);
        });

        // "全部"按钮事件
        filterBar.querySelector('[data-filter="all"]').onclick = function () {
            document.querySelectorAll('#home-filter-bar .filter-btn')
                .forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderCourses('all');
        };
    }

    // 首次渲染全部课程
    renderCourses('all');
}

// 渲染课程卡片（抽离为独立函数，方便筛选复用）
function renderCourses(filter) {
    const grid = document.getElementById('course-grid');
    if (!grid) return;

    const filtered = filter === 'all'
        ? courseData
        : courseData.filter(item => item.tags.includes(filter));

    grid.innerHTML = '';

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#475569;">
                <div style="font-size:3rem; margin-bottom:12px; opacity:0.4;">🔭</div>
                <p style="font-family:'Courier New',monospace;">// 暂无匹配课程</p>
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
                <div class="tags">
                    ${item.tags.map(t => `<span>${t}</span>`).join('')}
                </div>
                <p class="card-desc">${item.desc}</p>
                <div class="stars">${getStars(item.difficulty)}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 详情页逻辑
function initDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const item = courseData.find(c => c.id === id);

    if (!item) {
        document.body.innerHTML = "<h1 style='color:white;text-align:center;margin-top:100px;'>未找到课程数据</h1>";
        return;
    }

    // 1. 填充文本
    document.getElementById('d-title').innerText = item.title;
    document.getElementById('d-intro').innerText = item.intro || "暂无简介";
    document.getElementById('d-note').innerText = item.teacherNote || "保持好奇，继续探索代码的奥秘！";

    // 2. 视频
    document.getElementById('d-video').src = item.video || "";

    // 3. 多图逻辑
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
            img.onclick = function() {
                mainImg.src = url;
                document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            };
            thumbContainer.appendChild(img);
        });
    }

    // 4. 下载链接处理
    const setupDownload = (id, url, msg) => {
        const btn = document.getElementById(id);
        if (!btn) return;

        if (url && url !== "#" && url !== "") {
            btn.href = url;
            btn.classList.remove('disabled');
            btn.setAttribute('download', '');
            const p = btn.querySelector('p');
            if (id === 'btn-code') p.innerText = ".mblock / .py";
            if (id === 'btn-ppt') p.innerText = "课堂演示 PPT";
            if (id === 'btn-assets') p.innerText = "图片/音频资源";
        } else {
            btn.href = "javascript:void(0)";
            btn.classList.add('disabled');
            btn.removeAttribute('download');
            const p = btn.querySelector('p');
            if (p) p.innerText = "⚠️ " + msg;
        }
    };

    setupDownload('btn-code', item.code, "暂无源码");
    setupDownload('btn-ppt', item.ppt, "暂无课件");
    setupDownload('btn-assets', item.materials, "暂无素材");
}

// 简单的打字机特效
function typeEffect(element, text, speed = 100) {
    let i = 0;
    const timer = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(timer);
            setTimeout(() => {
                const deleteTimer = setInterval(() => {
                    if (element.textContent.length > 0) {
                        element.textContent = element.textContent.slice(0, -1);
                    } else {
                        clearInterval(deleteTimer);
                        typeEffect(element, text, speed);
                    }
                }, speed / 2);
            }, 1000);
        }
    }, speed);
}

// 页面加载完成后自动判断执行哪个逻辑
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('course-grid')) {
        initHome();
        const subtitle = document.getElementById('typing-text');
        if (subtitle) typeEffect(subtitle, "记录学习足迹，见证代码力量...");
    } else {
        initDetail();
    }
});
