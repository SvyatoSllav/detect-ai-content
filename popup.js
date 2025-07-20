chrome.runtime.onMessage.addListener((request) => {
  if (request.type === 'AI_DETECTION_RESULT') {
    document.getElementById('result').textContent = request.result;
  }
});

window.onload = () => {
  document.getElementById('result').textContent = 'Select text and click the icon to detect AI content.';
}; 