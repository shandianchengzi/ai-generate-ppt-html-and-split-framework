import { state } from './config.js';
import { fetchResourcesList, fetchPromptTemplate } from './api.js';
import { serializeCurrentPage } from './renderer.js';
import { showToast } from './utils.js';

// 初始化 Prompt 弹窗功能
export function initPromptFeature() {
    // 绑定关闭按钮
    document.getElementById('close-prompt-modal').onclick = () => {
        document.getElementById('prompt-modal').style.display = 'none';
    };

    // 绑定生成/复制按钮
    document.getElementById('copy-prompt-btn').onclick = async () => {
        await generateAndCopyPrompt();
    };
}

// 打开弹窗
export function openPromptModal() {
    document.getElementById('prompt-modal').style.display = 'flex';
}

// 核心逻辑：组装 Prompt
async function generateAndCopyPrompt() {
    const includeHtml = document.getElementById('chk-html').checked;
    const includeMothers = document.getElementById('chk-mothers').checked;
    const includeAssets = document.getElementById('chk-assets').checked;
    const extraReq = document.getElementById('prompt-extra-req').value;

    let finalPrompt = "";

    // 1. 读取基础模板 (page_prompt.md)
    const baseTemplate = await fetchPromptTemplate();
    finalPrompt += baseTemplate + "\n\n";

    // 2. 附加当前页 HTML (Context)
    if (includeHtml) {
        finalPrompt += "### 当前页面 HTML 代码 (Context):\n";
        finalPrompt += "```html\n" + serializeCurrentPage() + "\n```\n\n";
    }

    // 3. 附加资源列表
    if (includeMothers || includeAssets) {
        const resources = await fetchResourcesList();
        
        if (includeMothers && resources.mothers.length > 0) {
            finalPrompt += "### 可用母版列表 (Mothers):\n";
            resources.mothers.forEach(m => finalPrompt += `- mothers/${m}\n`);
            finalPrompt += "\n";
        }

        if (includeAssets && resources.assets.length > 0) {
            finalPrompt += "### 可用素材列表 (Assets):\n";
            resources.assets.forEach(a => finalPrompt += `- assets/${a}\n`);
            finalPrompt += "\n";
        }
    }

    // 4. 附加用户需求
    finalPrompt += "### 我的具体需求:\n";
    if (extraReq.trim()) {
        finalPrompt += extraReq;
    } else {
        finalPrompt += "请根据上述上下文，生成/修改代码。";
    }

    // 5. 复制到剪贴板
    try {
        await navigator.clipboard.writeText(finalPrompt);
        showToast('✅ 提示词已复制');
        document.getElementById('prompt-modal').style.display = 'none';
    } catch (err) {
        console.error(err);
        showToast('❌ 复制失败，请手动复制');
    }
}