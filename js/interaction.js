import { dom } from './config.js';
import { showToast } from './utils.js';

// 初始化元素交互 (选中、拖拽、缩放)
export function initElement(el) {
    // 1. 清理并添加 Resizer
    el.querySelector('.resizer')?.remove();
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    el.appendChild(resizer);

    // 图片特殊处理
    if (el.tagName === 'IMG') {
        el.setAttribute('draggable', 'false');
        el.removeAttribute('contenteditable');
    }

    // 2. 鼠标点击选中 & 拖拽
    el.onmousedown = (e) => {
        if (e.target === resizer) return;
        
        // 选中状态
        document.querySelectorAll('.selected').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');

        let startX = e.clientX, startY = e.clientY;
        let startLeft = el.offsetLeft, startTop = el.offsetTop;
        let parentW = el.parentElement.offsetWidth, parentH = el.parentElement.offsetHeight;

        const onMove = (ev) => {
            el.style.left = ((startLeft + ev.clientX - startX) / parentW * 100) + '%';
            el.style.top = ((startTop + ev.clientY - startY) / parentH * 100) + '%';
        };
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    };

    // 3. 缩放逻辑
    resizer.onmousedown = (e) => {
        e.stopPropagation();
        let startX = e.clientX, startY = e.clientY;
        let startW = el.offsetWidth, startH = el.offsetHeight;
        let parentW = el.parentElement.offsetWidth, parentH = el.parentElement.offsetHeight;

        const onResize = (ev) => {
            const newW = startW + (ev.clientX - startX);
            const newH = startH + (ev.clientY - startY);
            el.style.width = (newW / parentW * 100) + '%';
            el.style.height = (newH / parentH * 100) + '%';
        };
        const onUp = () => {
            window.removeEventListener('mousemove', onResize);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onResize);
        window.addEventListener('mouseup', onUp);
    };
}

// 创建图片容器元素
export function createImageElement(src) {
    const wrapper = document.createElement('div');
    wrapper.className = 'element';
    wrapper.style.left = '35%'; wrapper.style.top = '30%'; 
    wrapper.style.width = '30%'; wrapper.style.height = '30%';
    
    const img = document.createElement('img');
    img.src = src;
    img.className = 'element-img'; // 铺满容器
    
    wrapper.appendChild(img);
    dom.contentLayer.appendChild(wrapper);
    initElement(wrapper);
    showToast('图片已粘贴');
}

// 设置全局监听器 (粘贴、删除)
export function setupGlobalInteractions() {
    // 粘贴
    dom.canvasWrapper.addEventListener('paste', (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let item of items) {
            if (item.kind === 'file' && item.type.includes('image/')) {
                const reader = new FileReader();
                reader.onload = (evt) => createImageElement(evt.target.result);
                reader.readAsDataURL(item.getAsFile());
            }
        }
    });

    // 删除
    dom.canvasWrapper.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const selected = dom.contentLayer.querySelector('.element.selected');
            if (selected) {
                selected.remove();
                showToast('已删除');
            }
        }
    });
}