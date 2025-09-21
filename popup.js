import { getActiveTabUrl } from "./utils.js";
const addNewBookmark = (bookmarksElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");
    const controlsElement = document.createElement("div");
    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";
    controlsElement.className = "bookmark-controls";
    controlsElement.className = "bookmark-controls";
    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);
    setBookmarkAttributes("play", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);
    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarksElement.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks = []) => {
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = ""; 
    if (currentBookmarks.length > 0) {
        for (let i = 0; i < currentBookmarks.length; i++){
            const bookmark = currentBookmarks[i]; 
            addNewBookmark(bookmarksElement, bookmark);
        }
    }
    else {
        bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
    }
};
const onPlay = async e => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getActiveTabUrl();
    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value:bookmarkTime
    })
};
const onDelete = async e => {
    const activeTab = await getActiveTabUrl();
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmarksElementToDelete = document.getElementById("bookmark-" + bookmarkTime);
    bookmarksElementToDelete.parentNode.removeChild(bookmarksElementToDelete);
    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.warn("Error sending PLAY message:", chrome.runtime.lastError.message);
        }
    });

};
const setBookmarkAttributes = (src, eventListener, controleParentElement) => {
    const controlElement = document.createElement("img");
    controlElement.src = "assets/" + src + ".png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controleParentElement.appendChild(controlElement);
};





document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getActiveTabUrl();

    // Check if activeTab.url exists and is a YouTube video page
    if (!activeTab.url || !activeTab.url.includes("youtube.com/watch")) {
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class="title">This is not a YouTube video page.</div>';
        return; // Stop execution here if not on a YouTube video page
    }

    // Safe to parse URL parameters now
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    const currentVideo = urlParameters.get("v");

    if (currentVideo) {
        chrome.storage.sync.get([currentVideo], (data) => {
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
            console.log("Bookmarks found for", currentVideo, currentVideoBookmarks);
            viewBookmarks(currentVideoBookmarks);
        });
    }
 else {
        // Handle case where URL has no "v" parameter
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class="title">No video ID found in URL.</div>';
    }
});
