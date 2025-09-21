chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only when tab loading completes
    if (changeInfo.status === "complete" && tab.url && tab.url.includes("youtube.com/watch")) {
        const urlObj = new URL(tab.url);
        const videoId = urlObj.searchParams.get("v");
        if (!videoId) return;
        chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            videoId: videoId,
        }, () => {
            if (chrome.runtime.lastError) {
                console.warn("Content script not ready:", chrome.runtime.lastError.message);
            }
        });
    }
});
