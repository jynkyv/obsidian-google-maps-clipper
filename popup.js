// Obsidian Google Map Clipper — Popup Logic

(function () {
    'use strict';

    // DOM Elements
    const clipper = document.getElementById('clipper');
    const loading = document.getElementById('loading');
    const notMapsMessage = document.getElementById('not-maps-message');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const noteNameField = document.getElementById('note-name-field');
    const noteContentField = document.getElementById('note-content-field');
    const pathNameField = document.getElementById('path-name-field');
    const clipBtn = document.getElementById('clip-btn');
    const moreBtn = document.getElementById('more-btn');
    const moreDropdown = document.getElementById('more-dropdown');
    const copyClipboardBtn = document.getElementById('copy-clipboard-btn');
    const saveFileBtn = document.getElementById('save-file-btn');
    const openSettings = document.getElementById('open-settings');
    const propertiesToggle = document.getElementById('properties-toggle');
    const metadataProperties = document.getElementById('metadata-properties');
    const vaultContainer = document.getElementById('vault-container');
    const vaultSelect = document.getElementById('vault-select');
    const placePreview = document.getElementById('place-preview');
    const previewPhoto = document.getElementById('preview-photo');
    const previewCategory = document.getElementById('preview-category');

    let placeData = null;

    // Initialize
    async function init() {
        loading.style.display = 'flex';

        // Load settings
        const settings = await loadSettings();
        pathNameField.value = settings.defaultFolder || 'Places';

        // Setup vaults
        if (settings.vaults && settings.vaults.length > 0) {
            vaultContainer.style.display = 'block';
            settings.vaults.forEach(vault => {
                const option = document.createElement('option');
                option.value = vault;
                option.textContent = vault;
                if (vault === settings.defaultVault) option.selected = true;
                vaultSelect.appendChild(option);
            });
        }

        // Load default tags
        const defaultTags = settings.defaultTags || ['places'];

        // Get current tab and extract data
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab || !isGoogleMapsUrl(tab.url)) {
                loading.style.display = 'none';
                notMapsMessage.style.display = 'flex';
                return;
            }

            // Ensure content script is injected
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });
            } catch (e) {
                // Content script may already be loaded
            }

            // Request data from content script
            chrome.tabs.sendMessage(tab.id, { action: 'extractPlaceData' }, (response) => {
                loading.style.display = 'none';

                if (chrome.runtime.lastError) {
                    showError('无法连接到页面。请刷新 Google Maps 页面后重试。');
                    return;
                }

                if (!response || !response.name) {
                    notMapsMessage.style.display = 'flex';
                    return;
                }

                placeData = response;
                populateForm(placeData, defaultTags, settings);
                clipper.style.display = 'flex';
            });
        } catch (err) {
            loading.style.display = 'none';
            showError('发生错误: ' + err.message);
        }
    }

    function isGoogleMapsUrl(url) {
        if (!url) return false;
        return url.includes('google.com/maps') ||
            url.includes('google.co.jp/maps') ||
            url.includes('google.co.uk/maps') ||
            url.includes('google.com.tw/maps') ||
            url.includes('google.com.hk/maps') ||
            url.includes('maps.google.com');
    }

    function loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get({
                vaults: [],
                defaultVault: '',
                defaultFolder: 'Places',
                defaultTags: ['places'],
                noteTemplate: ''
            }, resolve);
        });
    }

    function populateForm(data, defaultTags, settings) {
        // Note name
        noteNameField.value = data.name || '';
        autoResizeTextarea(noteNameField);

        // Properties
        setFieldValue('name', data.name);
        setFieldValue('address', data.address);
        setFieldValue('rating', data.rating !== null ? String(data.rating) : '');
        setFieldValue('phone', data.phone);
        setFieldValue('website', data.website);
        setFieldValue('coordinates', data.coordinates);
        setFieldValue('priceRange', data.priceRange);
        setFieldValue('googleMapsUrl', data.googleMapsUrl);
        setFieldValue('tags', defaultTags.join(', '));
        setFieldValue('created', formatDate(new Date()));

        // Preview photo
        if (data.photoUrl) {
            previewPhoto.src = data.photoUrl;
            placePreview.style.display = 'block';
        }

        // Category badge
        if (data.category) {
            previewCategory.textContent = data.category;
            previewCategory.style.display = 'inline-block';
        }

        // Generate note content
        noteContentField.value = generateNoteContent(data, settings.noteTemplate);
        autoResizeTextarea(noteContentField);
    }

    function setFieldValue(field, value) {
        const input = document.querySelector(`[data-field="${field}"]`);
        if (input) input.value = value || '';
    }

    function getFieldValue(field) {
        const input = document.querySelector(`[data-field="${field}"]`);
        return input ? input.value : '';
    }

    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    function generateNoteContent(data, template) {
        if (template) {
            return template
                .replace(/\{\{name\}\}/g, data.name || '')
                .replace(/\{\{address\}\}/g, data.address || '')
                .replace(/\{\{phone\}\}/g, data.phone || '')
                .replace(/\{\{website\}\}/g, data.website || '')
                .replace(/\{\{rating\}\}/g, data.rating !== null ? String(data.rating) : '')
                .replace(/\{\{reviewCount\}\}/g, data.reviewCount || '')
                .replace(/\{\{category\}\}/g, data.category || '')
                .replace(/\{\{coordinates\}\}/g, data.coordinates || '')
                .replace(/\{\{googleMapsUrl\}\}/g, data.googleMapsUrl || '')
                .replace(/\{\{hours\}\}/g, data.hours || '')
                .replace(/\{\{priceRange\}\}/g, data.priceRange || '')
                .replace(/\{\{#if (\w+)\}\}(.*?)\{\{\/if\}\}/gs, (match, field, content) => {
                    return data[field] ? content : '';
                });
        }

        // Default template
        let content = `## ${data.name || 'Untitled Place'}\n\n`;

        if (data.category) content += `**类型**: ${data.category}\n`;
        if (data.address) content += `**地址**: ${data.address}\n`;
        if (data.phone) content += `**电话**: ${data.phone}\n`;
        if (data.website) content += `**网站**: [${data.website}](${data.website})\n`;
        if (data.rating !== null) {
            content += `**评分**: ${data.rating}⭐`;
            if (data.reviewCount) content += ` (${data.reviewCount} 条评价)`;
            content += '\n';
        }
        if (data.priceRange) content += `**人均消费**: ${data.priceRange}\n`;
        if (data.hours) content += `**营业时间**: ${data.hours}\n`;
        if (data.coordinates) content += `**坐标**: ${data.coordinates}\n`;

        content += `\n[📍 Google Maps](${data.googleMapsUrl || ''})\n`;

        return content;
    }

    /**
     * Escape a YAML value — wrap in quotes if it contains special chars
     */
    function yamlValue(value) {
        if (!value) return '""';
        // If value contains any YAML-special characters, quote it
        if (/[:\#\[\]\{\}\,\&\*\?\|\-\>\<\=\!\%\@\`\"\'\\]/.test(value) ||
            value.includes('\n') ||
            value.trim() !== value) {
            // Use double quotes and escape internal quotes and backslashes
            return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
        }
        return value;
    }

    /**
     * Build the full markdown content including YAML frontmatter
     */
    function buildFullNote() {
        const props = {
            name: getFieldValue('name'),
            address: getFieldValue('address'),
            rating: getFieldValue('rating'),
            phone: getFieldValue('phone'),
            website: getFieldValue('website'),
            coordinates: getFieldValue('coordinates'),
            price_range: getFieldValue('priceRange'),
            google_maps_url: getFieldValue('googleMapsUrl'),
            tags: getFieldValue('tags'),
            created: getFieldValue('created')
        };

        // Build YAML frontmatter
        let frontmatter = '---\n';
        for (const [key, value] of Object.entries(props)) {
            if (!value) continue;
            if (key === 'tags') {
                const tags = value.split(',').map(t => t.trim()).filter(Boolean);
                if (tags.length > 0) {
                    frontmatter += 'tags:\n';
                    tags.forEach(tag => {
                        frontmatter += '  - ' + tag + '\n';
                    });
                }
            } else if (key === 'rating') {
                // Rating is numeric, no quoting needed
                const num = parseFloat(value);
                frontmatter += key + ': ' + (isNaN(num) ? yamlValue(value) : num) + '\n';
            } else {
                frontmatter += key + ': ' + yamlValue(value) + '\n';
            }
        }
        frontmatter += '---\n\n';

        return frontmatter + noteContentField.value;
    }

    /**
     * Manually encode a parameter for Obsidian URI
     * We can't use URLSearchParams because it encodes spaces as '+' instead of '%20',
     * which Obsidian doesn't understand.
     */
    function obsidianEncodeParam(str) {
        return encodeURIComponent(str).replace(/'/g, '%27');
    }

    /**
     * Send note to Obsidian via URI protocol
     */
    function sendToObsidian() {
        const noteName = noteNameField.value || 'Untitled Place';
        const fullNote = buildFullNote();
        const vault = vaultSelect?.value || '';
        const folder = pathNameField.value || '';

        // Build file path
        let filePath = noteName;
        if (folder) {
            filePath = folder + '/' + noteName;
        }

        // Build Obsidian URI manually to avoid URLSearchParams encoding issues
        let uri = 'obsidian://new?';
        const parts = [];
        if (vault) {
            parts.push('vault=' + obsidianEncodeParam(vault));
        }
        parts.push('file=' + obsidianEncodeParam(filePath));
        parts.push('content=' + obsidianEncodeParam(fullNote));
        uri += parts.join('&');

        // Use window.location.href to open custom protocol URI
        // chrome.tabs.create doesn't work reliably with custom protocols
        window.location.href = uri;

        // Show success after a short delay
        setTimeout(() => {
            clipper.style.display = 'none';
            successMessage.style.display = 'flex';

            setTimeout(() => {
                window.close();
            }, 1500);
        }, 500);
    }

    /**
     * Copy note content to clipboard
     */
    async function copyToClipboard() {
        const fullNote = buildFullNote();
        try {
            await navigator.clipboard.writeText(fullNote);
            clipBtn.textContent = '已复制 ✓';
            clipBtn.classList.add('success');
            setTimeout(() => {
                clipBtn.textContent = 'Add to Obsidian';
                clipBtn.classList.remove('success');
            }, 2000);
        } catch (err) {
            showError('复制失败: ' + err.message);
        }
    }

    /**
     * Save as .md file
     */
    function saveAsFile() {
        const noteName = noteNameField.value || 'Untitled Place';
        const fullNote = buildFullNote();
        const blob = new Blob([fullNote], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${noteName}.md`;
        a.click();

        URL.revokeObjectURL(url);
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.style.display = 'block';
        loading.style.display = 'none';
    }

    function autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    // Event listeners
    clipBtn.addEventListener('click', sendToObsidian);

    moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        moreDropdown.style.display = moreDropdown.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('click', () => {
        moreDropdown.style.display = 'none';
    });

    copyClipboardBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        moreDropdown.style.display = 'none';
        copyToClipboard();
    });

    saveFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        moreDropdown.style.display = 'none';
        saveAsFile();
    });

    openSettings.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.runtime.openOptionsPage();
    });

    propertiesToggle.addEventListener('click', () => {
        const isCollapsed = metadataProperties.classList.toggle('collapsed');
        propertiesToggle.querySelector('.chevron').classList.toggle('rotated', isCollapsed);
    });

    noteNameField.addEventListener('input', () => autoResizeTextarea(noteNameField));
    noteContentField.addEventListener('input', () => autoResizeTextarea(noteContentField));

    // Init
    init();
})();
