(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];
    let bookmarkBtn;

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === "NEW") {
            currentVideo = videoId;
            loadBookmarks();
            newVideoLoaded();
        } else if (type === "PLAY") {
            youtubePlayer.currentTime = value;
        }
    });

    const loadBookmarks = () => {
        chrome.storage.sync.get([currentVideo], (data) => {
            currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
        });
    };

    const newVideoLoaded = () => {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        if (bookmarkBtnExists) return; // ✅ Prevent multiple buttons

        bookmarkBtn = document.createElement("img");
        bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
        bookmarkBtn.className = "ytp-button " + "bookmark-btn";
        bookmarkBtn.title = "Click to bookmark current timestamp";

        youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
        youtubePlayer = document.getElementsByClassName("video-stream")[0];

        youtubeLeftControls.append(bookmarkBtn);

        // ✅ Prevent multiple click listeners
        bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    };

    const addNewBookmarkEventHandler = () => {
        const currentTime = youtubePlayer.currentTime;

        // ✅ Avoid duplicates by checking if a bookmark at same time already exists
        const alreadyExists = currentVideoBookmarks.some(b => Math.floor(b.time) === Math.floor(currentTime));
        if (alreadyExists) {
            console.log("Bookmark at this time already exists.");
            return;
        }

        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),
        };
        console.log("Adding new bookmark:", newBookmark);

        currentVideoBookmarks.push(newBookmark);
        currentVideoBookmarks.sort((a, b) => a.time - b.time);

        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify(currentVideoBookmarks)
        }, () => {
            console.log("Bookmark saved!");
        });
    };

    const getTime = t => {
        const date = new Date(0);
        date.setSeconds(t);
        return date.toISOString().substr(11, 8); // HH:MM:SS
    };
})();
