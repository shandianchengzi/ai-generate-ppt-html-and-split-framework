import { state, dom } from './config.js';
import { showToast } from './utils.js';

// ... (原有的 detectPages, fetchPageHtml, fetchMotherHtml, savePage 保持不变) ...

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

export async function fetchPageHtml(index) {
    try {
        const res = await fetch(`pages/${index}.html?t=${Date.now()}`);
        if (!res.ok) throw new Error("404");
        return await res.text();
    } catch (e) { return ""; }
}

export async function fetchMotherHtml(path) {
    try {
        const res = await fetch(`${path}?t=${Date.now()}`);
        return await res.text();
    } catch (e) { return ""; }
}

export async function savePage(index, htmlContent) {
    try {
        // ... (保持原有的 savePage 逻辑) ...
        const res = await fetch(`pages/${index}.html`, {
            method: 'POST',
            headers: { 'Content-Type': 'text/html' },
            body: htmlContent
        });
        if (res.ok) {
            state.pageCache[index] = htmlContent;
            return true;
        }
        return false;
    } catch (e) { return false; }
}

// === 新增：获取资源列表 ===
export async function fetchResourcesList() {
    try {
        const res = await fetch('/api/resources');
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch resources", e);
        return { mothers: [], assets: [] };
    }
}

// === 新增：获取 Prompt 模板文件 ===
export async function fetchPromptTemplate() {
    try {
        const res = await fetch('page_prompt.md');
        return await res.text();
    } catch (e) {
        return "Error loading page_prompt.md";
    }
}