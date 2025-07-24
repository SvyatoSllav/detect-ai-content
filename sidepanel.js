let textarea = null;
let scanBtn = null;
let resultDiv = null;
let loaderDiv = null;
let symbolCountSpan = null;
let infoIcon = null;
let infoTooltip = null;
const BASE_URL = 'https://ai-text-detect.ru/webhook';

function showLoadingBar() {
  if (loaderDiv) {
    loaderDiv.style.display = '';
    loaderDiv.style.width = '100%';
  }
  if (scanBtn) scanBtn.style.display = 'none';
  if (resultDiv) resultDiv.innerHTML = '';
}

function hideLoadingBar() {
  if (loaderDiv) loaderDiv.style.display = 'none';
  if (scanBtn) scanBtn.style.display = '';
}

document.addEventListener('DOMContentLoaded', async () => {
  textarea = document.getElementById('ai-detect-textarea');
  scanBtn = document.getElementById('ai-detect-scan');
  resultDiv = document.getElementById('ai-detect-result');
  loaderDiv = document.getElementById('ai-detect-loader');
  symbolCountSpan = document.getElementById('ai-symbol-count');
  infoIcon = document.getElementById('ai-info-icon');
  infoTooltip = document.getElementById('ai-info-tooltip');

  function updateSymbolCount() {
    if (!symbolCountSpan || !textarea) return
    const len = textarea.value.length;
    symbolCountSpan.textContent = len;
    const labelSpan = document.querySelector('.ai-optimal-length > span:first-child');
    if (!labelSpan) return

    // Reset styles and icon visibility first
    labelSpan.style.fontWeight = '';
    labelSpan.style.fontSize = '';
    if (infoIcon) infoIcon.style.display = '';

    if (len < 300) {
      labelSpan.textContent = 'Insufficient text length';
    } else if (len >= 300 && len < 15000) {
      labelSpan.textContent = 'Optimal text length';
    } else if (len === 15000) {
      labelSpan.textContent = 'Exceeded maximum text length';
      // Hide tooltip icon
      infoIcon.style.display = 'none';
    }
  }

  if (textarea) {
    const nativeDescriptor = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    );
    Object.defineProperty(textarea, 'value', {
      get: function() {
        return nativeDescriptor.get.call(this);
      },
      set: function(val) {
        nativeDescriptor.set.call(this, val);
        updateSymbolCount();
      }
    });
  }

  updateSymbolCount();
  if (!textarea) return
  textarea.addEventListener('input', updateSymbolCount);

  // Tooltip show/hide logic
  if (infoIcon && infoTooltip) {
    infoIcon.addEventListener('mouseenter', () => {
      infoTooltip.style.display = 'block';
    });
    infoIcon.addEventListener('mouseleave', () => {
      infoTooltip.style.display = 'none';
    });
    infoIcon.addEventListener('focus', () => {
      infoTooltip.style.display = 'block';
    });
    infoIcon.addEventListener('blur', () => {
      infoTooltip.style.display = 'none';
    });
  }

  // Notify background that side panel is ready
  chrome.runtime.sendMessage({ type: 'SIDEPANEL_READY' });

  // Try to read clipboard text and set it if textarea is empty
  try {
    const clipboardText = await navigator.clipboard.readText();
    if (textarea && (!textarea.value || !textarea.value.trim()) && clipboardText && clipboardText.trim()) {
      textarea.value = clipboardText;
    }
  } catch (err) {
    console.warn('[AI DETECT] Could not read clipboard:', err);
  }

  scanBtn.onclick = async () => {
    showLoadingBar();
    textarea.disabled = true;
    updateSymbolCount();
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textarea.value })
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      let percent = 0;
      if (typeof data.score === 'number') {
        percent = Math.round(data.score * 100);
      }
      hideLoadingBar();
      showScanResult(percent);
      textarea.disabled = false;
    } catch (err) {
      hideLoadingBar();
      resultDiv.innerHTML = '<div style="color:#ff4f4f;font-weight:bold;margin-top:16px;">Error checking AI content.</div>';
      scanBtn.style.display = '';
      textarea.disabled = false;
      console.error('AI check error:', err);
    }
  };
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'SHOW_TEXT_IN_SIDEPANEL') {
    if (textarea) textarea.value = request.text;
    if (resultDiv) resultDiv.innerHTML = '';
    hideLoadingBar();
    if (textarea) textarea.disabled = false;
  }
});

function showScanResult(percent) {
  resultDiv.innerHTML = '';
  const block = document.createElement('div');
  block.className = 'ai-result-block';

  // Row: label
  const row = document.createElement('div');
  row.className = 'ai-result-row';
  const label = document.createElement('span');
  label.className = 'ai-result-label';
  label.textContent = '\u{1F916} AI Detection Result';
  row.appendChild(label);
  block.appendChild(row);

  // Progress bar
  const barContainer = document.createElement('div');
  barContainer.className = 'ai-progress-bar-container';
  const bar = document.createElement('div');
  bar.className = 'ai-progress-bar';
  if (percent > 70) bar.classList.add('red');
  else if (percent > 40) bar.classList.add('yellow');
  barContainer.appendChild(bar);
  block.appendChild(barContainer);

  // Percent and text below bar
  const percentText = document.createElement('span');
  percentText.className = 'ai-result-subtext';
  if (percent > 70) percentText.classList.add('red');
  else if (percent > 40) percentText.classList.add('yellow');
  percentText.textContent = `${percent}% likely AI-generated`;
  block.appendChild(percentText);

  resultDiv.appendChild(block);
  setTimeout(() => {
    bar.style.width = percent + '%';
  }, 100);
} 