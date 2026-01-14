import { state, dom } from './config.js';
import { updateCache, renderLayers } from './renderer.js';
import { fetchPageHtml, fetchMotherHtml } from './api.js';
import { showOverlay, hideOverlay, updateProgress } from './utils.js';

// 配置 PPTX
function configurePPTX(pptx) {
    pptx.defineLayout({ name:'WIDE', width:13.3333, height:7.5 });
    pptx.layout = 'WIDE';
    pptx.author = 'IoTSP AI Editor';
    pptx.title = 'Presentation';
}

// 辅助：将 URL 图片转换为 Base64
async function urlToBase64(url) {
    if (url.startsWith('data:')) return url; // 已经是 Base64
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn('Image convert failed:', url, e);
        return null;
    }
}

// 导出可编辑 PPT (修复图片版)
export async function exportEditPPT() {
    updateCache();
    showOverlay('正在生成 PPT...'); // 增加一点用户反馈
    const pptx = new PptxGenJS();
    configurePPTX(pptx);

    try {
        for (let i = 1; i <= state.TOTAL_PAGES; i++) {
            updateProgress((i / state.TOTAL_PAGES) * 100);
            const slide = pptx.addSlide();
            const tempContainer = document.createElement('div');

            // 1. 获取内容
            let htmlContent = state.pageCache[i] || await fetchPageHtml(i);
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            
            // 2. 合并母版
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

            // 3. 提取备注
            const notesDiv = doc.querySelector('.speaker-notes');
            const notesText = notesDiv?.innerText;
            notesDiv?.remove();

            // 4. 标准化图片结构 (Img -> Wrapper)
            doc.querySelectorAll('img.element').forEach(img => {
                const w = document.createElement('div');
                w.className = img.className; w.style.cssText = img.style.cssText;
                img.className = 'element-img'; img.style.cssText = '';
                img.parentNode.insertBefore(w, img);
                w.appendChild(img);
            });
            Array.from(doc.body.children).forEach(c => tempContainer.appendChild(c));

            // 5. 遍历转换元素 (改用 for...of 支持 await)
            const elements = Array.from(tempContainer.querySelectorAll('.element'));
            
            for (const el of elements) {
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

                // === 图片处理核心 ===
                let imgSrc = null;
                const innerImg = el.querySelector('img');
                
                // Case A: Wrapper 容器里的图片
                if (innerImg) imgSrc = innerImg.getAttribute('src');
                // Case B: 直接是 img 标签 (母版或旧数据)
                else if (el.tagName === 'IMG') imgSrc = el.getAttribute('src');

                if (imgSrc) {
                    // 关键修复：先转 Base64 保证嵌入成功
                    const base64Data = await urlToBase64(imgSrc);
                    if (base64Data) {
                        slide.addImage({ data: base64Data, x: opts.x, y: opts.y, w: opts.w, h: opts.h });
                    }
                } 
                // === 形状/文本处理 ===
                else if (el.classList.contains('shape-line')) {
                    slide.addShape(pptx.ShapeType.rect, opts);
                } else if (el.classList.contains('shape-rect')) {
                    slide.addText(el.innerText.trim(), { ...opts, shape: pptx.ShapeType.rect });
                } else {
                    slide.addText(el.innerText.trim(), opts);
                }
            }

            if (notesText) slide.addNotes(notesText.trim());
        }
        
        await pptx.writeFile({ fileName: "IoTSP_Edit.pptx" });
        
    } catch (e) {
        console.error("Export Error:", e);
        alert("导出出错，请检查控制台");
    } finally {
        hideOverlay();
    }
}

// 导出全图 PPT
export async function exportImagePPT() {
    const originalPage = state.currentPage;
    updateCache();
    showOverlay('初始化...');
    const pptx = new PptxGenJS();
    configurePPTX(pptx);

    for (let i = 1; i <= state.TOTAL_PAGES; i++) {
        showOverlay(`处理中... ${i}/${state.TOTAL_PAGES}`);
        updateProgress((i / state.TOTAL_PAGES) * 100);
        let htmlContent = state.pageCache[i] || await fetchPageHtml(i);
        await renderLayers(htmlContent, i);
        document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.resizer').forEach(el => el.style.display = 'none');
        await new Promise(r => setTimeout(r, 150));
        try {
            const canvasEl = await html2canvas(dom.canvas, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
            const slide = pptx.addSlide();
            slide.addImage({ data: canvasEl.toDataURL('image/png'), x: 0, y: 0, w: "100%", h: "100%" });
            if (dom.notesInput.value.trim()) slide.addNotes(dom.notesInput.value.trim());
        } catch (err) { console.error(err); }
    }
    hideOverlay();
    let originalHtml = state.pageCache[originalPage] || await fetchPageHtml(originalPage);
    await renderLayers(originalHtml, originalPage);
    pptx.writeFile({ fileName: "IoTSP_Image.pptx" });
}