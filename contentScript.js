(() => { 
    let youtubeLeftControls, youtubePlayer;
    let currentVideoId="";
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;
        if (type == "NEW") {
            currentVideoId = videoId;
            newVideoLoaded();
        }
        });
    })();