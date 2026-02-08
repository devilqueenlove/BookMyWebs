// BookMyWebs Chrome Extension - Background Service Worker
// Handles external messages from the web app

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.type === 'AUTH_STATE') {
        if (message.user && message.idToken) {
            // Store auth in chrome.storage.local
            chrome.storage.local.set({
                user: message.user,
                idToken: message.idToken
            }, () => {
                console.log('Auth synced from website');
                sendResponse({ success: true });
            });
        } else {
            // User logged out
            chrome.storage.local.remove(['user', 'idToken'], () => {
                sendResponse({ success: true });
            });
        }
        return true; // Will respond asynchronously
    }
});

// Also handle internal messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_AUTH') {
        chrome.storage.local.get(['user', 'idToken'], (data) => {
            sendResponse(data);
        });
        return true;
    }
});
