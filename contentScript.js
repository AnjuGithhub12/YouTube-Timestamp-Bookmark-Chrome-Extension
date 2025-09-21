(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];
    let bookmarkBtn = null;  // store reference
    let btnClickHandlerAdded = false;

    // Listen for background messages
    chrome.runtime.onMessage.addListener((msg, sender, response) => {
        const { type, videoId, value } = msg;

        if (type === "NEW") {
            if (videoId && videoId !== currentVideo) {
                currentVideo = videoId;
                loadBookmarksForCurrentVideo();
                injectBookmarkButton();
            }
        } else if (type === "PLAY") {
            if (youtubePlayer) {
                youtubePlayer.currentTime = value;
            }
        } else if (type === "DELETE") {
            deleteBookmark(value);
        }
    });

    function loadBookmarksForCurrentVideo() {
        chrome.storage.sync.get([currentVideo], (data) => {
            const raw = data[currentVideo];
            if (raw) {
                try {
                    currentVideoBookmarks = JSON.parse(raw);
                } catch (e) {
                    console.error("Error parsing bookmarks JSON:", e);
                    currentVideoBookmarks = [];
                }
            } else {
                currentVideoBookmarks = [];
            }
        });
    }

    function injectBookmarkButton() {
        // Check if button exists
        bookmarkBtn = document.getElementsByClassName("bookmark-btn")[0];
        youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
        youtubePlayer = document.getElementsByClassName("video-stream")[0];

        if (!youtubeLeftControls || !youtubePlayer) {
            // YouTube player might not be ready yet
            // Could set a small timeout to retry
            setTimeout(injectBookmarkButton, 500);
            return;
        }

        if (bookmarkBtn) {
            // Button already in DOM, ensure only one click listener
            if (!btnClickHandlerAdded) {
                bookmarkBtn.addEventListener("click", addNewBookmark);
                btnClickHandlerAdded = true;
            }
            return;
        }

        // Create the button
        const btn = document.createElement("img");
        btn.src = chrome.runtime.getURL("assets/bookmark.png");
        btn.className = "ytp-button bookmark-btn";
        btn.title = "Click to bookmark current timestamp";

        youtubeLeftControls.appendChild(btn);

        // Add click listener
        btn.addEventListener("click", addNewBookmark);
        btnClickHandlerAdded = true;
        bookmarkBtn = btn;
    }

    function addNewBookmark() {
        const currentTime = youtubePlayer.currentTime || 0;

        // Prevent duplicates at same sec
        const timeFloor = Math.floor(currentTime);
        const already = currentVideoBookmarks.some(b => Math.floor(b.time) === timeFloor);
        if (already) {
            console.log("Bookmark at this time already exists:", timeFloor);
            return;
        }

        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),
        };

        currentVideoBookmarks.push(newBookmark);
        currentVideoBookmarks.sort((a, b) => a.time - b.time);

        chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) }, () => {
            console.log("Bookmark saved!", newBookmark);
        });
    }

    function deleteBookmark(timeValue) {
        const timeFloor = Math.floor(timeValue);
        const filtered = currentVideoBookmarks.filter(b => Math.floor(b.time) !== timeFloor);
        currentVideoBookmarks = filtered;
        chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) }, () => {
            console.log("Bookmark deleted at", timeValue);
        });
    }

    function getTime(t) {
        const date = new Date(0);
        date.setSeconds(t);
        return date.toISOString().slice(11, 19);
    }

    // Immediately try injecting if already watching a video
    const init = () => {
        const url = window.location.href;
        if (url.includes("youtube.com/watch")) {
            const urlObj = new URL(url);
            const vid = urlObj.searchParams.get("v");
            if (vid) {
                currentVideo = vid;
                loadBookmarksForCurrentVideo();
                injectBookmarkButton();
            }
        }
    };

    // run init after a short delay to allow player to load
    setTimeout(init, 1000);
})();
