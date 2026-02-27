// Obsidian Google Map Clipper — Settings Page Logic
// Multi-template system with icon/color support

(function () {
    'use strict';

    // Use DEFAULT_TEMPLATES from global templates.js

    // DOM Elements
    const templateList = document.getElementById('template-list');
    const newTemplateBtn = document.getElementById('new-template-btn');
    const generalSection = document.getElementById('general-section');
    const templateSection = document.getElementById('template-section');
    const templateSectionTitle = document.getElementById('template-section-title');
    const sidebarItems = document.querySelectorAll('#sidebar li[data-section]');

    // General settings elements
    const vaultInput = document.getElementById('vault-input');
    const vaultList = document.getElementById('vault-list');
    const defaultVaultSelect = document.getElementById('default-vault-select');
    const defaultFolderInput = document.getElementById('default-folder-input');
    const defaultTagsInput = document.getElementById('default-tags-input');
    const exportSettingsBtn = document.getElementById('export-settings-btn');
    const importSettingsBtn = document.getElementById('import-settings-btn');
    const importFileInput = document.getElementById('import-file-input');

    // Template editor elements
    const templateNameInput = document.getElementById('template-name');
    const templateIconInput = document.getElementById('template-icon');
    const templateColorInput = document.getElementById('template-color');
    const templateColorPicker = document.getElementById('template-color-picker');
    const templateFolderInput = document.getElementById('template-folder');
    const templateTagsInput = document.getElementById('template-tags');
    const templateContentTextarea = document.getElementById('template-content');
    const propertiesChecklist = document.getElementById('properties-checklist');
    const customPropertiesList = document.getElementById('custom-properties-list');
    const addCustomPropBtn = document.getElementById('add-custom-prop-btn');
    const duplicateTemplateBtn = document.getElementById('duplicate-template-btn');
    const deleteTemplateBtn = document.getElementById('delete-template-btn');

    let settings = {};
    let currentTemplateId = null;

    // ==================== Settings Load/Save ====================

    function loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get({
                vaults: [],
                defaultVault: '',
                defaultFolder: 'Places',
                defaultTags: ['places'],
                templates: DEFAULT_TEMPLATES,
                activeTemplateId: 'default'
            }, (result) => {
                settings = result;
                // Ensure templates have all required fields
                settings.templates = settings.templates.map(t => ({
                    ...DEFAULT_TEMPLATES.find(d => d.id === t.id) || DEFAULT_TEMPLATES[0],
                    ...t
                }));
                resolve(result);
            });
        });
    }

    function saveSettings(update) {
        Object.assign(settings, update);
        chrome.storage.sync.set(settings, () => {
            showSaveStatus();
        });
    }

    function showSaveStatus() {
        // Brief visual feedback
        const sidebar = document.getElementById('sidebar');
        sidebar.style.borderRightColor = 'var(--accent)';
        setTimeout(() => {
            sidebar.style.borderRightColor = '';
        }, 300);
    }

    // ==================== Sidebar Navigation ====================

    function showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));

        // Deactivate all sidebar items
        document.querySelectorAll('#sidebar li[data-section], #template-list li').forEach(li => li.classList.remove('active'));

        if (sectionId === 'general') {
            generalSection.classList.add('active');
            document.querySelector('#sidebar li[data-section="general"]').classList.add('active');
            currentTemplateId = null;
        } else {
            // Template section
            templateSection.classList.add('active');
            const templateItem = document.querySelector(`#template-list li[data-id="${sectionId}"]`);
            if (templateItem) templateItem.classList.add('active');
            currentTemplateId = sectionId;
            loadTemplateEditor(sectionId);
        }
    }

    // ==================== Template List ====================

    function renderTemplateList() {
        templateList.innerHTML = '';
        (settings.templates || []).forEach((tpl) => {
            const li = document.createElement('li');
            li.setAttribute('data-id', tpl.id);
            li.innerHTML = `
        <span class="template-color-dot" style="background:${escapeHtml(tpl.color || '#8b5cf6')}"></span>
        <span class="template-name">${escapeHtml(tpl.name)}</span>
      `;
            li.addEventListener('click', () => showSection(tpl.id));
            if (tpl.id === currentTemplateId) li.classList.add('active');
            templateList.appendChild(li);
        });
    }

    // ==================== Template Editor ====================

    function loadTemplateEditor(templateId) {
        const tpl = settings.templates.find(t => t.id === templateId);
        if (!tpl) return;

        templateSectionTitle.textContent = '编辑模板 — ' + tpl.name;
        templateNameInput.value = tpl.name || '';
        templateIconInput.value = tpl.icon || '';
        templateColorInput.value = tpl.color || '#8b5cf6';
        templateColorPicker.value = tpl.color || '#8b5cf6';
        templateFolderInput.value = tpl.folder || '';
        templateTagsInput.value = tpl.tags || '';
        templateContentTextarea.value = tpl.noteTemplate || '';

        // Load properties checkboxes
        const checkboxes = propertiesChecklist.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            const prop = cb.getAttribute('data-prop');
            if (prop === 'name') {
                cb.checked = true; // Always required
            } else {
                cb.checked = (tpl.properties || []).includes(prop);
            }
        });

        // Load custom properties
        renderCustomProperties(tpl.customProperties || []);
    }

    function saveCurrentTemplate() {
        if (!currentTemplateId) return;
        const tpl = settings.templates.find(t => t.id === currentTemplateId);
        if (!tpl) return;

        tpl.name = templateNameInput.value.trim() || 'Untitled';
        tpl.icon = templateIconInput.value.trim();
        tpl.color = templateColorInput.value.trim() || '#8b5cf6';
        tpl.folder = templateFolderInput.value.trim();
        tpl.tags = templateTagsInput.value.trim();
        tpl.noteTemplate = templateContentTextarea.value;

        // Save checked properties
        const props = [];
        propertiesChecklist.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            props.push(cb.getAttribute('data-prop'));
        });
        tpl.properties = props;

        // Save custom properties
        const customProps = [];
        customPropertiesList.querySelectorAll('.custom-prop-row').forEach(row => {
            const key = row.querySelector('.custom-prop-key').value.trim();
            const value = row.querySelector('.custom-prop-value').value.trim();
            if (key) customProps.push({ key, defaultValue: value });
        });
        tpl.customProperties = customProps;

        saveSettings({ templates: settings.templates });
        renderTemplateList();
        templateSectionTitle.textContent = '编辑模板 — ' + tpl.name;
    }

    // ==================== Custom Properties ====================

    function renderCustomProperties(customProps) {
        customPropertiesList.innerHTML = '';
        (customProps || []).forEach((prop, index) => {
            addCustomPropRow(prop.key, prop.defaultValue, index);
        });
    }

    function addCustomPropRow(key, defaultValue, index) {
        const row = document.createElement('div');
        row.className = 'custom-prop-row';
        row.innerHTML = `
      <input type="text" class="custom-prop-key" placeholder="属性名" value="${escapeHtml(key || '')}">
      <input type="text" class="custom-prop-value" placeholder="默认值" value="${escapeHtml(defaultValue || '')}">
      <button type="button" class="btn-icon btn-danger remove-custom-prop" title="删除">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
        customPropertiesList.appendChild(row);

        row.querySelector('.remove-custom-prop').addEventListener('click', () => {
            row.remove();
            saveCurrentTemplate();
        });

        row.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', debounce(saveCurrentTemplate, 500));
        });
    }

    // ==================== Template CRUD ====================

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    }

    function createNewTemplate() {
        const newTpl = {
            id: generateId(),
            name: '新模板',
            icon: 'map-pin',
            color: '#8b5cf6',
            folder: settings.defaultFolder || 'Places',
            tags: (settings.defaultTags || []).join(', '),
            properties: ['name', 'address', 'rating', 'phone', 'website', 'coordinates', 'priceRange', 'googleMapsUrl', 'tags', 'created'],
            customProperties: [],
            noteTemplate: ''
        };
        settings.templates.push(newTpl);
        saveSettings({ templates: settings.templates });
        renderTemplateList();
        showSection(newTpl.id);
    }

    function duplicateCurrentTemplate() {
        if (!currentTemplateId) return;
        const src = settings.templates.find(t => t.id === currentTemplateId);
        if (!src) return;

        const newTpl = { ...JSON.parse(JSON.stringify(src)), id: generateId(), name: src.name + ' (副本)' };
        settings.templates.push(newTpl);
        saveSettings({ templates: settings.templates });
        renderTemplateList();
        showSection(newTpl.id);
    }

    function deleteCurrentTemplate() {
        if (!currentTemplateId) return;
        if (settings.templates.length <= 1) {
            alert('至少需要保留一个模板。');
            return;
        }
        if (!confirm(`确定要删除模板 "${settings.templates.find(t => t.id === currentTemplateId)?.name}" 吗？`)) return;

        settings.templates = settings.templates.filter(t => t.id !== currentTemplateId);
        saveSettings({ templates: settings.templates });
        renderTemplateList();
        showSection('general');
    }

    // ==================== Vault Management ====================

    function renderVaults() {
        vaultList.innerHTML = '';
        (settings.vaults || []).forEach((vault, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
        <span class="vault-name">${escapeHtml(vault)}</span>
        <button class="remove-vault" data-index="${index}" title="删除">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      `;
            vaultList.appendChild(li);
        });

        // Update vault select
        const current = settings.defaultVault;
        defaultVaultSelect.innerHTML = '<option value="">未设置</option>';
        (settings.vaults || []).forEach(vault => {
            const opt = document.createElement('option');
            opt.value = vault;
            opt.textContent = vault;
            if (vault === current) opt.selected = true;
            defaultVaultSelect.appendChild(opt);
        });
    }

    // ==================== Event Listeners ====================

    // Sidebar navigation
    sidebarItems.forEach(li => {
        li.addEventListener('click', () => showSection(li.getAttribute('data-section')));
    });

    // New template
    newTemplateBtn.addEventListener('click', createNewTemplate);

    // Template editor auto-save
    [templateNameInput, templateIconInput, templateColorInput, templateFolderInput, templateTagsInput].forEach(el => {
        el.addEventListener('input', debounce(saveCurrentTemplate, 400));
    });
    templateContentTextarea.addEventListener('input', debounce(saveCurrentTemplate, 600));

    // Color picker sync
    templateColorPicker.addEventListener('input', () => {
        templateColorInput.value = templateColorPicker.value;
        saveCurrentTemplate();
    });
    templateColorInput.addEventListener('input', debounce(() => {
        if (/^#[0-9a-f]{6}$/i.test(templateColorInput.value)) {
            templateColorPicker.value = templateColorInput.value;
        }
        saveCurrentTemplate();
    }, 400));

    // Properties checkboxes
    propertiesChecklist.addEventListener('change', () => saveCurrentTemplate());

    // Custom properties
    addCustomPropBtn.addEventListener('click', () => {
        addCustomPropRow('', '', -1);
    });

    // Duplicate / Delete template
    duplicateTemplateBtn.addEventListener('click', duplicateCurrentTemplate);
    deleteTemplateBtn.addEventListener('click', deleteCurrentTemplate);

    // Vault management
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

    vaultList.addEventListener('click', (e) => {
        const btn = e.target.closest('.remove-vault');
        if (btn) {
            const idx = parseInt(btn.dataset.index, 10);
            settings.vaults.splice(idx, 1);
            if (settings.defaultVault && !settings.vaults.includes(settings.defaultVault)) {
                settings.defaultVault = '';
            }
            saveSettings({ vaults: settings.vaults, defaultVault: settings.defaultVault });
            renderVaults();
        }
    });

    defaultVaultSelect.addEventListener('change', () => saveSettings({ defaultVault: defaultVaultSelect.value }));
    defaultFolderInput.addEventListener('input', debounce(() => saveSettings({ defaultFolder: defaultFolderInput.value.trim() }), 500));
    defaultTagsInput.addEventListener('input', debounce(() => {
        const tags = defaultTagsInput.value.split(',').map(t => t.trim()).filter(Boolean);
        saveSettings({ defaultTags: tags });
    }, 500));

    // Export / Import
    exportSettingsBtn.addEventListener('click', () => {
        chrome.storage.sync.get(null, (all) => {
            const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'obsidian-map-clipper-settings.json';
            a.click();
            URL.revokeObjectURL(url);
        });
    });

    importSettingsBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const imported = JSON.parse(ev.target.result);
                chrome.storage.sync.set(imported, () => {
                    location.reload();
                });
            } catch (err) {
                alert('导入失败: 无效的 JSON 文件');
            }
        };
        reader.readAsText(file);
        importFileInput.value = '';
    });

    // ==================== Utils ====================

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }

    function debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    // ==================== Init ====================

    async function init() {
        await loadSettings();
        defaultFolderInput.value = settings.defaultFolder || 'Places';
        defaultTagsInput.value = (settings.defaultTags || []).join(', ');

        // If no templates exist, create defaults
        if (!settings.templates || settings.templates.length === 0) {
            settings.templates = DEFAULT_TEMPLATES;
            saveSettings({ templates: settings.templates });
        } else {
            // Merge any missing default templates that user hasn't seen yet
            let changed = false;
            const existingIds = new Set(settings.templates.map(t => t.id));
            DEFAULT_TEMPLATES.forEach(dt => {
                if (!existingIds.has(dt.id)) {
                    settings.templates.push(dt);
                    changed = true;
                }
            });
            if (changed) {
                saveSettings({ templates: settings.templates });
            }
        }

        renderVaults();
        renderTemplateList();
        showSection('general');
    }

    init();
})();
