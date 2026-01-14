import { state, dom } from './config.js';
import { detectPages, fetchPageHtml, savePage } from './api.js';
import { renderLayers, updateCache, serializeCurrentPage } from './renderer.js';
import { setupGlobalInteractions, initElement } from './interaction.js';
import { exportEditPPT, exportImagePPT } from './exporter.js';

// 初始化
async function init() {
    const count = await detectPages();
    if (count === 0) {
        dom.sidebarList.innerHTML = `<div style="padding:20px; color:red;">未找到页面<br>请检查 server.py</div>`;
        return;
    }
    renderSidebar();
    loadSlide(1);
    setupGlobalInteractions();
    bindToolbarEvents();
}

function renderSidebar() {
    dom.sidebarList.innerHTML = '';
    for (let i = 1; i <= state.TOTAL_PAGES; i++) {
        let div = document.createElement('div');
        div.className = 'thumb';
        div.innerHTML = `<div class="thumb-content"><span>P${i}</span></div>`;
        div.onclick = () => loadSlide(i);
        div.id = `thumb-${i}`;
        dom.sidebarList.appendChild(div);
    }
}

async function loadSlide(index) {
    // 切换前更新当前页缓存
    if (state.currentPage > 0 && dom.contentLayer.innerHTML) updateCache();

    // 更新侧边栏高亮
    document.querySelector('.thumb.active')?.classList.remove('active');
    document.getElementById(`thumb-${index}`)?.classList.add('active');
    dom.pageIndicator.innerText = `第 ${index} / ${state.TOTAL_PAGES} 页`;
    state.currentPage = index;

    // 获取并渲染
    let htmlContent = state.pageCache[index];
    if (!htmlContent) {
        htmlContent = await fetchPageHtml(index);
    }
    await renderLayers(htmlContent, index);
}

function bindToolbarEvents() {
    document.querySelector('.save-btn').onclick = async () => {
        const html = serializeCurrentPage();
        const success = await savePage(state.currentPage, html);
        if(success) {
            // 重新初始化交互，防止resizer丢失
            dom.contentLayer.querySelectorAll('.element').forEach(initElement);
        }
    };
    
    // 绑定导出按钮 (注意这里需要把 module 函数挂载到 window 或者通过 addEventListener)
    // 简单的做法是直接 addEventListener
    const btns = document.querySelectorAll('#toolbar button');
    // btns[0] is save (bound above)
    btns[1].onclick = exportImagePPT; // exportImagePPT
    btns[2].onclick = exportEditPPT;  // exportEditPPT
}

// 启动
init();