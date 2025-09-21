(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        }
    });

    const newVideoLoaded = () => {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        console.log(bookmarkBtnExists);

        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img");

            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";

            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName("video-stream")[0];

            youtubeLeftControls.append(bookmarkBtn);
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    }

    const addNewBookmarkEventHandler = () => {
        const currentTime = youtubePlayer.currentTime;
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),
        };
        console.log("Adding new bookmark:", newBookmark);

        // ✅ Update the local bookmarks array
        currentVideoBookmarks.push(newBookmark);
        currentVideoBookmarks.sort((a, b) => a.time - b.time);

        // ✅ Save to chrome.storage.sync
        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify(currentVideoBookmarks)
        }, () => {
            console.log("Bookmark saved!");
        });
    



    };

    newVideoLoaded();
})();

const getTime = t => {
    const date = new Date(0);
    date.setSeconds(t);
    return date.toISOString().slice(11, 19); // ✅ "HH:MM:SS"
};

