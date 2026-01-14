import { state, dom } from './config.js';
import { detectPages, fetchPageHtml, savePage } from './api.js';
import { renderLayers, updateCache, serializeCurrentPage } from './renderer.js';
import { setupGlobalInteractions, initElement } from './interaction.js';
import { exportEditPPT, exportImagePPT } from './exporter.js';
import { initPromptFeature, openPromptModal } from './prompt_generator.js';

async function init() {
    const count = await detectPages();
    if (count === 0) {
        dom.sidebarList.innerHTML = `<div style="padding:20px; color:red;">未找到页面<br>请检查 server.py</div>`;
        return;
    }
    renderSidebar();
    loadSlide(1);
    setupGlobalInteractions();
    initPromptFeature(); // 初始化弹窗内部逻辑 (关闭按钮/复制按钮)
    bindToolbarEvents(); // 绑定工具栏按钮
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
    if (state.currentPage > 0 && dom.contentLayer.innerHTML) updateCache();

    document.querySelector('.thumb.active')?.classList.remove('active');
    document.getElementById(`thumb-${index}`)?.classList.add('active');
    dom.pageIndicator.innerText = `第 ${index} / ${state.TOTAL_PAGES} 页`;
    state.currentPage = index;

    let htmlContent = state.pageCache[index];
    if (!htmlContent) {
        htmlContent = await fetchPageHtml(index);
    }
    await renderLayers(htmlContent, index);
}

function bindToolbarEvents() {
    // 绑定 Prompt 按钮
    document.getElementById('btn-prompt').onclick = () => {
        openPromptModal();
    };

    // 绑定 保存 按钮
    document.getElementById('btn-save').onclick = async () => {
        const html = serializeCurrentPage();
        const success = await savePage(state.currentPage, html);
        if(success) dom.contentLayer.querySelectorAll('.element').forEach(initElement);
    };

    // 绑定 导出全图
    document.getElementById('btn-export-img').onclick = exportImagePPT;

    // 绑定 导出编辑版
    document.getElementById('btn-export-ppt').onclick = exportEditPPT;
}

// 启动应用
init();