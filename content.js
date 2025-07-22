// Listen for mouseup to detect selection
let aiIcon = null;
let lastSelectedText = '';
let selectionTimeout = null;

const inlineSVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.95 4.13C20.66 3.71 20.29 3.34 19.87 3.05C18.92 2.36 17.68 2 16.19 2H7.81C7.61 2 7.41 2.01 7.22 2.03C3.94 2.24 2 4.37 2 7.81V16.19C2 17.68 2.36 18.92 3.05 19.87C3.34 20.29 3.71 20.66 4.13 20.95C4.95 21.55 5.99 21.9 7.22 21.98C7.41 21.99 7.61 22 7.81 22H16.19C19.83 22 22 19.83 22 16.19V7.81C22 6.32 21.64 5.08 20.95 4.13ZM15.87 7.51H13.92L11.68 16.48H13.52C13.93 16.48 14.27 16.82 14.27 17.23C14.27 17.64 13.93 17.98 13.52 17.98H8.13C7.72 17.98 7.38 17.64 7.38 17.23C7.38 16.82 7.72 16.48 8.13 16.48H10.13L12.37 7.51H10.48C10.07 7.51 9.73 7.17 9.73 6.76C9.73 6.35 10.07 6.01 10.48 6.01H15.86C16.27 6.01 16.61 6.35 16.61 6.76C16.61 7.17 16.28 7.51 15.87 7.51Z" fill="#292D32"/></svg>`;

document.addEventListener('mouseup', (e) => {
  // Clear any existing timeout
  if (selectionTimeout) {
    clearTimeout(selectionTimeout);
  }
  
  // Add a small delay to ensure selection is complete
  selectionTimeout = setTimeout(() => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    // Only show icon if there's actual text selected and it's different from last time
    if (text && text !== lastSelectedText && text.length > 0) {
      lastSelectedText = text;
      showAIIcon({ x: e.clientX, y: e.clientY }, text);
    } else if (!text || text.length === 0) {
      // If no text is selected, remove the icon
      removeAIIcon();
      lastSelectedText = '';
    }
  }, 100); // 100ms delay
});

document.addEventListener('mousedown', (e) => {
  // Only remove icon if clicking outside of it and not on selected text
  if (aiIcon && !aiIcon.contains(e.target)) {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    // Don't remove if we're clicking on selected text
    if (!text || text.length === 0) {
      removeAIIcon();
      lastSelectedText = '';
    }
  }
});

// Also listen for selection changes to handle cases where selection is cleared
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (!text || text.length === 0) {
    removeAIIcon();
    lastSelectedText = '';
  }
});

function showAIIcon(coords, text) {
  if (aiIcon) return;
  aiIcon = document.createElement('div');
  aiIcon.id = 'ai-detect-icon';
  aiIcon.style.position = 'fixed';
  aiIcon.style.left = `${coords.x + 5}px`;
  aiIcon.style.top = `${coords.y}px`;
  aiIcon.style.width = '28px';
  aiIcon.style.height = '28px';
  aiIcon.style.background = '#fff';
  aiIcon.style.border = '2px solid #6100ee';
  aiIcon.style.borderRadius = '8px';
  aiIcon.style.zIndex = 9999;
  aiIcon.style.cursor = 'pointer';
  aiIcon.style.display = 'flex';
  aiIcon.style.alignItems = 'center';
  aiIcon.style.justifyContent = 'center';
  aiIcon.innerHTML = inlineSVG;

  aiIcon.onpointerdown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    chrome.runtime.sendMessage({ type: 'OPEN_SIDEPANEL' });
    chrome.runtime.sendMessage({ type: 'SHOW_TEXT_IN_SIDEPANEL', text });
  };
  document.body.appendChild(aiIcon);
}

function removeAIIcon() {
  if (aiIcon && aiIcon.parentNode) {
    aiIcon.parentNode.removeChild(aiIcon);
    aiIcon = null;
  }
} 