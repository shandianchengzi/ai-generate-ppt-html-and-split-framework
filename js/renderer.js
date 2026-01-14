import { state, dom } from './config.js';
import { fetchMotherHtml, fetchPageHtml } from './api.js';
import { initElement } from './interaction.js';

// 将页面 HTML 渲染到 MotherLayer 和 ContentLayer
export async function renderLayers(pageHtml, pageIndex) {
    dom.motherLayer.innerHTML = '';
    dom.contentLayer.innerHTML = '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(pageHtml, 'text/html');

    // 1. 提取备注
    const notesDiv = doc.querySelector('.speaker-notes');
    dom.notesInput.value = notesDiv ? notesDiv.innerText.trim() : "";
    notesDiv?.remove();

    // 2. 母版处理
    const motherRef = doc.querySelector('.mother-ref');
    if (motherRef) {
        const motherSrc = motherRef.getAttribute('data-src');
        const motherHtml = await fetchMotherHtml(motherSrc);
        if (motherHtml) {
            dom.motherLayer.innerHTML = motherHtml;
            // 动态页码
            const pageNumEl = dom.motherLayer.querySelector('#dynamic-page-num');
            if (pageNumEl) pageNumEl.innerText = pageIndex;
        }
        motherRef.remove();
    }

    // 3. 内容层处理 (自动升级旧格式 Img -> Wrapper)
    while (doc.body.firstChild) {
        const node = doc.body.firstChild;
        if (node.tagName === 'IMG' && node.classList.contains('element')) {
            const wrapper = document.createElement('div');
            wrapper.className = node.className;
            wrapper.style.cssText = node.style.cssText;
            
            node.className = 'element-img';
            node.style.cssText = ''; 
            
            wrapper.appendChild(node);
            dom.contentLayer.appendChild(wrapper);
        } else {
            dom.contentLayer.appendChild(node);
        }
    }

    // 初始化交互
    dom.contentLayer.querySelectorAll('.element').forEach(initElement);
}

// 将当前界面状态序列化为 HTML 字符串
export function serializeCurrentPage() {
    let outputHtml = "";
    
    // 检查母版引用 (这里简化处理：如果有内容就认为引用了 base.html)
    // 严谨做法是保存时记录当前的 motherSrc
    if (dom.motherLayer.innerHTML.trim() !== "") {
        outputHtml += `<div class="mother-ref" data-src="mothers/base.html"></div>\n`;
    }

    // 克隆内容层 (去除交互状态)
    const cloneContent = dom.contentLayer.cloneNode(true);
    cloneContent.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    cloneContent.querySelectorAll('.resizer').forEach(el => el.remove());
    outputHtml += cloneContent.innerHTML;

    // 备注
    if (dom.notesInput.value.trim()) {
        outputHtml += `\n<div class="speaker-notes" style="display:none;">${dom.notesInput.value}</div>`;
    }
    return outputHtml;
}

// 仅更新缓存 (不保存)
export function updateCache() {
    state.pageCache[state.currentPage] = serializeCurrentPage();
}