export async function getActiveTabUrl() {
    let queryOptions = { active: true, CurrentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}