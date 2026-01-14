import { state, dom } from './config.js';
import { updateCache, renderLayers } from './renderer.js';
import { fetchPageHtml, fetchMotherHtml } from './api.js';
import { showOverlay, hideOverlay, updateProgress } from './utils.js';

function configurePPTX(pptx) {
    pptx.defineLayout({ name:'WIDE', width:13.3333, height:7.5 });
    pptx.layout = 'WIDE';
    pptx.author = 'IoTSP AI Editor';
    pptx.title = 'Presentation';
}

export async function exportEditPPT() {
    updateCache();
    const pptx = new PptxGenJS();
    configurePPTX(pptx);

    for (let i = 1; i <= state.TOTAL_PAGES; i++) {
        const slide = pptx.addSlide();
        const tempContainer = document.createElement('div');

        // ... (获取页面源码、合并母版、提取内容逻辑保持不变) ...
        let htmlContent = state.pageCache[i] || await fetchPageHtml(i);
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        // 合并母版
        const motherRef = doc.querySelector('.mother-ref');
        if (motherRef) {
            const mHtml = await fetchMotherHtml(motherRef.getAttribute('data-src'));
            const mDiv = document.createElement('div');
            mDiv.innerHTML = mHtml;
            const pNum = mDiv.querySelector('#dynamic-page-num');
            if(pNum) pNum.innerText = i;
            Array.from(mDiv.children).forEach(c => tempContainer.appendChild(c));
            motherRef.remove();
        }

        // 提取备注
        const notesDiv = doc.querySelector('.speaker-notes');
        const notesText = notesDiv?.innerText;
        notesDiv?.remove();

        // 升级图片格式 (Img -> Wrapper)
        doc.querySelectorAll('img.element').forEach(img => {
            const w = document.createElement('div');
            w.className = img.className; w.style.cssText = img.style.cssText;
            img.className = 'element-img'; img.style.cssText = '';
            img.parentNode.insertBefore(w, img);
            w.appendChild(img);
        });
        Array.from(doc.body.children).forEach(c => tempContainer.appendChild(c));

        // 转换元素为 PPTX 对象
        tempContainer.querySelectorAll('.element').forEach(el => {
            const style = el.style;
            const opts = {
                x: style.left || "0", y: style.top || "0", w: style.width, h: style.height,
                fontFace: "楷体", color: "000000"
            };

            // 样式映射
            if (el.classList.contains('fs-title')) { opts.fontSize = 44; opts.bold = true; }
            else if (el.classList.contains('fs-sub')) { opts.fontSize = 32; }
            else if (el.classList.contains('fs-body')) { opts.fontSize = 24; }
            else if (el.classList.contains('fs-small')) { opts.fontSize = 20; }
            if (el.classList.contains('color-accent')) opts.color = "023163";
            if (el.classList.contains('bg-accent')) { opts.fill = { color: "023163" }; opts.color = "FFFFFF"; }
            if (el.classList.contains('shape-rect')) { opts.line = { color: "023163", width: 2 }; }
            if (el.classList.contains('shape-line')) { opts.fill = { color: "023163" }; }
            if (el.style.fontWeight === 'bold') opts.bold = true;

            // === 核心修复: 图片导出逻辑 ===
            let imgSrc = null;
            // 情况1: 是Wrapper容器，找里面的img
            const innerImg = el.querySelector('img');
            if (innerImg) imgSrc = innerImg.getAttribute('src');
            // 情况2: 本身就是img (母版里的情况)
            else if (el.tagName === 'IMG') imgSrc = el.getAttribute('src');

            if (imgSrc) {
                // 判断是否是 Base64
                if (imgSrc.startsWith('data:')) {
                    slide.addImage({ data: imgSrc, x: opts.x, y: opts.y, w: opts.w, h: opts.h });
                } else {
                    // 普通路径 (Assets)
                    slide.addImage({ path: imgSrc, x: opts.x, y: opts.y, w: opts.w, h: opts.h });
                }
            } 
            else if (el.classList.contains('shape-line')) {
                slide.addShape(pptx.ShapeType.rect, opts);
            } else if (el.classList.contains('shape-rect')) {
                slide.addText(el.innerText.trim(), { ...opts, shape: pptx.ShapeType.rect });
            } else {
                slide.addText(el.innerText.trim(), opts);
            }
        });

        if (notesText) slide.addNotes(notesText.trim());
    }
    pptx.writeFile({ fileName: "IoTSP_Edit.pptx" });
}

// 导出全图 PPT
export async function exportImagePPT() {
    // 记住当前页，导出完跳回来
    const originalPage = state.currentPage;
    updateCache();
    
    showOverlay('初始化...');
    const pptx = new PptxGenJS();
    configurePPTX(pptx);

    for (let i = 1; i <= state.TOTAL_PAGES; i++) {
        showOverlay(`处理中... ${i}/${state.TOTAL_PAGES}`);
        updateProgress((i / state.TOTAL_PAGES) * 100);
        
        // 渲染该页到画布
        let htmlContent = state.pageCache[i] || await fetchPageHtml(i);
        await renderLayers(htmlContent, i);

        // 清理辅助元素
        document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.resizer').forEach(el => el.style.display = 'none');
        
        // 等待图片加载渲染
        await new Promise(r => setTimeout(r, 150));

        try {
            const canvasEl = await html2canvas(dom.canvas, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
            const slide = pptx.addSlide();
            slide.addImage({ data: canvasEl.toDataURL('image/png'), x: 0, y: 0, w: "100%", h: "100%" });
            if (dom.notesInput.value.trim()) slide.addNotes(dom.notesInput.value.trim());
        } catch (err) { console.error(err); }
    }

    hideOverlay();
    // 恢复原来的页面
    let originalHtml = state.pageCache[originalPage] || await fetchPageHtml(originalPage);
    await renderLayers(originalHtml, originalPage);
    
    pptx.writeFile({ fileName: "IoTSP_Image.pptx" });
}