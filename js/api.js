import { state, dom } from './config.js';
import { showToast } from './utils.js';

// 探测总页数
export async function detectPages() {
    let count = 0, maxTry = 50;
    while (count < maxTry) {
        try {
            const res = await fetch(`pages/${count + 1}.html`, { method: 'HEAD' });
            if (res.ok) count++; else break;
        } catch (e) { break; }
    }
    state.TOTAL_PAGES = count;
    return count;
}

// 加载页面 HTML
export async function fetchPageHtml(index) {
    try {
        const res = await fetch(`pages/${index}.html?t=${Date.now()}`);
        if (!res.ok) throw new Error("404");
        return await res.text();
    } catch (e) {
        return "";
    }
}

// 加载母版 HTML
export async function fetchMotherHtml(path) {
    try {
        const res = await fetch(`${path}?t=${Date.now()}`);
        return await res.text();
    } catch (e) {
        return "";
    }
}

// 保存当前页
export async function savePage(index, htmlContent) {
    try {
        showToast('Saving...');
        const res = await fetch(`pages/${index}.html`, {
            method: 'POST',
            headers: { 'Content-Type': 'text/html' },
            body: htmlContent
        });
        if (res.ok) {
            showToast('✅ Saved');
            state.pageCache[index] = htmlContent;
            return true;
        } else {
            showToast('❌ Error');
            return false;
        }
    } catch (e) {
        showToast('❌ Network Error');
        return false;
    }
}