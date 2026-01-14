# AI PPT Generation & Splitting Framework (ai-generate-ppt-html-and-split-framework)

> [!IMPORTANT]
> **Project Discontinued**
> 
> A better alternative has been found for this project: [ppt-master](https://github.com/hugohe3/ppt-master).
> It is recommended to use the alternative for a better experience and more features. This project will no longer be updated.

## Project Introduction

This is an AI-driven PPT generation and editing framework build with Web technologies (HTML/JS) and a Python backend. It aims to solve the context loss problem when AI generates multi-page PPTs by splitting the PPT into independent HTML pages, allowing users to generate and fine-tune precise AI prompts for each page.

## Key Features

- **Modular Design**: Separates the Mother Layer from the Content Layer, making it easy to switch design styles quickly.
- **AI Prompt Generation**: Built-in Prompt generator that automatically creates prompts for further AI refinement based on the current page HTML, available templates (mothers), and assets.
- **Page-by-Page Editing & Saving**: Supports independent editing and saving of each PPT page, with persistent storage on the server.
- **Multi-format Export**:
  - **Image Export**: Export page screenshots using `html2canvas`.
  - **PPTX Export**: Integrated with `pptxgenjs` to export HTML structures as editable PPTX files.
- **Notes System**: Supports adding speaker notes for each slide.

## Project Structure

- `main.html`: Main editor interface.
- `server.py`: Lightweight Python backend for page saving and resource management.
- `js/`: Core logic including renderer, exporter, prompt generator, etc.
- `css/`: Editor styling.
- `pages/`: Stores generated single-page HTML files.
- `mothers/`: Stores preview or available template files.
- `assets/`: Stores static resources like images.

## Quick Start

1. **Start the Backend Service**:
   Ensure Python is installed, then run in the project root:
   ```bash
   python server.py
   ```
   The server will run at `http://localhost:8080`.

2. **Access the Editor**:
   Open in your browser:
   `http://localhost:8080/main.html`

3. **Workflow**:
   - Select a page from the left sidebar.
   - Use the **AI Prompt** button to generate refinement instructions.
   - Click **Save This Page** to sync with the server.
   - Use **Edit Export** to generate a `.pptx` file.

## Tech Stack

- **Frontend**: Vanilla JS, CSS, `pptxgenjs`, `html2canvas`
- **Backend**: Python (http.server)
