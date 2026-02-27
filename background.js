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
        chrome.storage.sync.set({
            vaults: [],
            defaultVault: '',
            defaultFolder: 'Places',
            defaultTags: ['places'],
            noteTemplate: `## {{name}}

{{#if category}}**类型**: {{category}}{{/if}}
{{#if address}}**地址**: {{address}}{{/if}}
{{#if phone}}**电话**: {{phone}}{{/if}}
{{#if website}}**网站**: [{{website}}]({{website}}){{/if}}
{{#if rating}}**评分**: {{rating}}⭐ ({{reviewCount}} 条评价){{/if}}
{{#if hours}}**营业时间**: {{hours}}{{/if}}
{{#if coordinates}}**坐标**: {{coordinates}}{{/if}}

[📍 Google Maps]({{googleMapsUrl}})
`,
            createdAt: new Date().toISOString()
        });
    }
});
