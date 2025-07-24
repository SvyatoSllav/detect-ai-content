let lastTextForSidePanel = null;
let sidePanelReady = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
    if (chrome.sidePanel && chrome.sidePanel.open) {
      if (sender.tab && sender.tab.windowId !== undefined) {
        chrome.sidePanel.open({ windowId: sender.tab.windowId });
      } else {
        console.warn('[AI DETECT] sender.tab or sender.tab.windowId is undefined', sender.tab);
      }
    } else {
      console.warn('[AI DETECT] chrome.sidePanel or chrome.sidePanel.open is not available');
    }
  }
}); 