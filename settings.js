// Obsidian Google Map Clipper — Settings Page Logic

(function () {
    'use strict';

    // DOM Elements
    const vaultInput = document.getElementById('vault-input');
    const vaultList = document.getElementById('vault-list');
    const defaultVaultSelect = document.getElementById('default-vault-select');
    const defaultFolderInput = document.getElementById('default-folder-input');
    const defaultTagsInput = document.getElementById('default-tags-input');
    const tagsPreview = document.getElementById('tags-preview');
    const noteTemplateTextarea = document.getElementById('note-template-textarea');
    const resetTemplateBtn = document.getElementById('reset-template-btn');
    const exportSettingsBtn = document.getElementById('export-settings-btn');
    const importSettingsBtn = document.getElementById('import-settings-btn');
    const importFileInput = document.getElementById('import-file-input');
    const saveStatus = document.getElementById('save-status');

    let settings = {};

    // Load settings
    async function loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get({
                vaults: [],
                defaultVault: '',
                defaultFolder: 'Places',
                defaultTags: ['places'],
                noteTemplate: ''
            }, (result) => {
                settings = result;
                resolve(result);
            });
        });
    }

    // Save settings
    function saveSettings(update) {
        Object.assign(settings, update);
        chrome.storage.sync.set(settings, () => {
            showSaveStatus();
        });
    }

    function showSaveStatus() {
        saveStatus.classList.add('visible');
        setTimeout(() => {
            saveStatus.classList.remove('visible');
        }, 2000);
    }

    // Render vault list
    function renderVaults() {
        vaultList.innerHTML = '';
        settings.vaults.forEach((vault, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
        <span class="vault-name">${escapeHtml(vault)}</span>
        <button class="remove-vault" data-index="${index}" title="Remove vault">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      `;
            vaultList.appendChild(li);
        });

        // Update vault select
        const currentDefault = settings.defaultVault;
        defaultVaultSelect.innerHTML = '<option value="">未设置</option>';
        settings.vaults.forEach(vault => {
            const option = document.createElement('option');
            option.value = vault;
            option.textContent = vault;
            if (vault === currentDefault) option.selected = true;
            defaultVaultSelect.appendChild(option);
        });
    }

    // Render tags preview
    function renderTagsPreview() {
        const tags = settings.defaultTags || [];
        tagsPreview.innerHTML = '';
        tags.forEach((tag, index) => {
            const chip = document.createElement('span');
            chip.className = 'tag-chip';
            chip.innerHTML = `#${escapeHtml(tag)} <span class="remove-tag" data-index="${index}">×</span>`;
            tagsPreview.appendChild(chip);
        });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Initialize
    async function init() {
        await loadSettings();

        // Populate form
        defaultFolderInput.value = settings.defaultFolder || 'Places';
        defaultTagsInput.value = (settings.defaultTags || []).join(', ');
        noteTemplateTextarea.value = settings.noteTemplate || '';

        renderVaults();
        renderTagsPreview();
    }

    // Event listeners

    // Add vault
    vaultInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const vault = vaultInput.value.trim();
            if (vault && !settings.vaults.includes(vault)) {
                settings.vaults.push(vault);
                saveSettings({ vaults: settings.vaults });
                renderVaults();
                vaultInput.value = '';
            }
        }
    });

    // Remove vault
    vaultList.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-vault');
        if (removeBtn) {
            const index = parseInt(removeBtn.dataset.index, 10);
            settings.vaults.splice(index, 1);
            if (settings.defaultVault && !settings.vaults.includes(settings.defaultVault)) {
                settings.defaultVault = '';
            }
            saveSettings({ vaults: settings.vaults, defaultVault: settings.defaultVault });
            renderVaults();
        }
    });

    // Default vault change
    defaultVaultSelect.addEventListener('change', () => {
        saveSettings({ defaultVault: defaultVaultSelect.value });
    });

    // Default folder change
    defaultFolderInput.addEventListener('input', debounce(() => {
        saveSettings({ defaultFolder: defaultFolderInput.value.trim() });
    }, 500));

    // Default tags change
    defaultTagsInput.addEventListener('input', debounce(() => {
        const tags = defaultTagsInput.value.split(',').map(t => t.trim()).filter(Boolean);
        settings.defaultTags = tags;
        saveSettings({ defaultTags: tags });
        renderTagsPreview();
    }, 500));

    // Remove tag from preview
    tagsPreview.addEventListener('click', (e) => {
        const removeTag = e.target.closest('.remove-tag');
        if (removeTag) {
            const index = parseInt(removeTag.dataset.index, 10);
            settings.defaultTags.splice(index, 1);
            defaultTagsInput.value = settings.defaultTags.join(', ');
            saveSettings({ defaultTags: settings.defaultTags });
            renderTagsPreview();
        }
    });

    // Note template change
    noteTemplateTextarea.addEventListener('input', debounce(() => {
        saveSettings({ noteTemplate: noteTemplateTextarea.value });
    }, 500));

    // Reset template
    resetTemplateBtn.addEventListener('click', () => {
        if (confirm('确定要重置为默认模板吗？')) {
            noteTemplateTextarea.value = '';
            saveSettings({ noteTemplate: '' });
        }
    });

    // Export settings
    exportSettingsBtn.addEventListener('click', () => {
        chrome.storage.sync.get(null, (allSettings) => {
            const blob = new Blob([JSON.stringify(allSettings, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'obsidian-map-clipper-settings.json';
            a.click();
            URL.revokeObjectURL(url);
        });
    });

    // Import settings
    importSettingsBtn.addEventListener('click', () => {
        importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                chrome.storage.sync.set(imported, () => {
                    loadSettings().then(() => {
                        defaultFolderInput.value = settings.defaultFolder || 'Places';
                        defaultTagsInput.value = (settings.defaultTags || []).join(', ');
                        noteTemplateTextarea.value = settings.noteTemplate || '';
                        renderVaults();
                        renderTagsPreview();
                        showSaveStatus();
                    });
                });
            } catch (err) {
                alert('导入失败: 无效的 JSON 文件');
            }
        };
        reader.readAsText(file);
        importFileInput.value = '';
    });

    function debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    // Init
    init();
})();
