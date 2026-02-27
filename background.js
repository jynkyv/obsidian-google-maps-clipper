// Obsidian Google Map Clipper — Background Service Worker

// Update extension icon based on whether the current tab is a Google Maps page
function updateIcon(tabId, url) {
    const isGoogleMaps = url && (
        url.includes('google.com/maps') ||
        url.includes('google.co.jp/maps') ||
        url.includes('google.co.uk/maps') ||
        url.includes('google.com.tw/maps') ||
        url.includes('google.com.hk/maps') ||
        url.includes('google.com.au/maps') ||
        url.includes('google.ca/maps') ||
        url.includes('google.de/maps') ||
        url.includes('google.fr/maps') ||
        url.includes('maps.google.com')
    );

    if (isGoogleMaps) {
        chrome.action.setIcon({
            tabId: tabId,
            path: {
                16: 'icons/icon16.png',
                48: 'icons/icon48.png',
                128: 'icons/icon128.png'
            }
        });
        chrome.action.setTitle({ tabId: tabId, title: 'Clip this place to Obsidian' });
    } else {
        // Keep the normal icon but update title
        chrome.action.setTitle({ tabId: tabId, title: 'Obsidian Google Map Clipper (not on Google Maps)' });
    }
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url || changeInfo.status === 'complete') {
        updateIcon(tabId, tab.url);
    }
});

// Listen for tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        updateIcon(tab.id, tab.url);
    } catch (e) {
        // Tab might not exist anymore
    }
});

// Initialize default settings on install
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Load default templates
        importScripts('templates.js');
        chrome.storage.sync.set({
            vaults: [],
            defaultVault: '',
            defaultFolder: 'Places',
            defaultTags: ['places'],
            templates: DEFAULT_TEMPLATES,
            activeTemplateId: 'default',
            noteTemplate: '',
            createdAt: new Date().toISOString()
        });
    } else if (details.reason === 'update') {
        // On update, ensure templates exist in storage
        chrome.storage.sync.get({ templates: [] }, (result) => {
            if (!result.templates || result.templates.length === 0) {
                importScripts('templates.js');
                chrome.storage.sync.set({ templates: DEFAULT_TEMPLATES, activeTemplateId: 'default' });
            }
        });
    }
});
