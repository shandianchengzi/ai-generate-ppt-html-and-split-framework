# AI PPT 生成与分割框架 (ai-generate-ppt-html-and-split-framework)

> [!IMPORTANT]
> **项目已停止维护**
> 
> 本项目已找到更好的替代方案：[ppt-master](https://github.com/hugohe3/ppt-master)。
> 建议使用替代方案以获得更好的体验和更丰富的功能。本项目后续将不再更新。

## 项目简介

这是一个基于 Web 技术（HTML/JS）和 Python 后端的 AI 驱动 PPT 生成与编辑框架。它旨在解决 AI 生成多页 PPT 时的上下文丢失问题，通过将 PPT 分割成独立的 HTML 页面，允许用户针对每一页进行精确的 AI 提示词生成和微调。

## 核心特性

- **模块化设计**：采用母版层（Mother Layer）与内容层（Content Layer）分离的设计，便于快速切换设计风格。
- **AI 提示词生成**：内置 Prompt 生成器，能够根据当前页面 HTML、可用母版和素材自动生成用于 AI 进一步完善的提示词。
- **逐页编辑与保存**：支持对每一页 PPT 进行独立编辑、保存，并持久化存储在服务器端。
- **多格式导出**：
  - **图片导出**：基于 `html2canvas` 导出页面截图。
  - **PPTX 导出**：集成 `pptxgenjs`，支持将 HTML 结构导出为可编辑的 PPTX 文件。
- **备注系统**：支持为每一页 PPT 添加演说备注。

## 项目结构

- `main.html`: 主编辑器界面。
- `server.py`: Python 轻量级后端，负责页面保存和资源管理。
- `js/`: 包含渲染器、导出器、提示词生成器等核心逻辑。
- `css/`: 编辑器样式。
- `pages/`: 存储生成的单页 HTML 文件。
- `mothers/`: 存储预览或可用的母版文件。
- `assets/`: 存储图片等静态资源。

## 快速开始

1. **启动后端服务**：
   确保你的环境中安装了 Python，在项目根目录下运行：
   ```bash
   python server.py
   ```
   服务器将运行在 `http://localhost:8080`。

2. **访问编辑器**：
   在浏览器中打开：
   `http://localhost:8080/main.html`

3. **操作流程**：
   - 在左侧侧边栏选择页面。
   - 使用 **AI Prompt** 按钮生成微调指令。
   - 点击 **保存本页** 同步到服务器。
   - 使用 **编辑导出** 生成 `.pptx` 文件。

## 技术栈

- **前端**: Vanilla JS, CSS, `pptxgenjs`, `html2canvas`
- **后端**: Python (http.server)
