import { dom } from './config.js';

export function showToast(msg) {
    dom.toast.innerText = msg;
    dom.toast.style.opacity = 1;
    dom.toast.style.top = '80px';
    setTimeout(() => { 
        dom.toast.style.opacity = 0; 
        dom.toast.style.top = '70px'; 
    }, 2000);
}

export function showOverlay(msg) {
    dom.overlayMsg.innerText = msg;
    dom.overlay.style.display = 'flex';
}

export function hideOverlay() {
    dom.overlay.style.display = 'none';
}

export function updateProgress(percent) {
    dom.progressBar.style.width = `${percent}%`;
}