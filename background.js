let lastTextForSidePanel = null;
let sidePanelReady = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'DETECT_AI_CONTENT') {
    // Mock AI detection logic
    const isAI = Math.random() > 0.5 ? 'AI-generated' : 'Human-written';
    chrome.tabs.sendMessage(sender.tab.id, {
      type: 'AI_DETECTION_RESULT',
      result: `This text is likely: ${isAI}`
    });
  }
  if (request.type === 'SHOW_TEXT_IN_SIDEPANEL') {
    lastTextForSidePanel = request.text;
    if (sidePanelReady) {
      chrome.runtime.sendMessage({ type: 'SHOW_TEXT_IN_SIDEPANEL', text: lastTextForSidePanel });
    }
  }
  if (request.type === 'SIDEPANEL_READY') {
    sidePanelReady = true;
    if (lastTextForSidePanel) {
      chrome.runtime.sendMessage({ type: 'SHOW_TEXT_IN_SIDEPANEL', text: lastTextForSidePanel });
    }
  }
  if (request.type === 'OPEN_SIDEPANEL') {
    console.log('[AI DETECT] Received OPEN_SIDEPANEL message', sender);
    if (chrome.sidePanel && chrome.sidePanel.open) {
      if (sender.tab && sender.tab.windowId !== undefined) {
        console.log('[AI DETECT] Calling chrome.sidePanel.open for windowId:', sender.tab.windowId);
        chrome.sidePanel.open({ windowId: sender.tab.windowId });
      } else {
        console.warn('[AI DETECT] sender.tab or sender.tab.windowId is undefined', sender.tab);
      }
    } else {
      console.warn('[AI DETECT] chrome.sidePanel or chrome.sidePanel.open is not available');
    }
  }
}); 