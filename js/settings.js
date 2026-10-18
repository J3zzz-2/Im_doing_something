// ============================================================================
// SETTINGS & CUSTOMIZATION MODULE (settings.js)
// ============================================================================

const SUPPORT_LINKS = {
    kofi: "https://ko-fi.com/meniir/",
    trakteer: "https://trakteer.id/meniir_suss",
    twitter: "https://x.com/MeniirIII",    
    protonmail: "meniirs@proton.me"       
};

window.extraSettings = {
    autoAdvanceTurn: true,
    defaultTallySpeed: 1,
    sfxEnabled: true,
    desktopBg: 'teal' // 'teal' | 'slate' | 'navy' | 'crimson' | 'custom'
};

// --- SOUND EFFECTS (SFX) ---
// news.js asks isSfxEnabled() before playing the chime, so no wrapping is needed.
window.isSfxEnabled = function() {
    return !window.extraSettings || window.extraSettings.sfxEnabled !== false;
};

// --- SAVE & LOAD EXTENDED SETTINGS ---
function saveExtendedSettings() {
    saveUserSettings(); // game.js stores everything under one key
}

function loadExtendedSettings() {
    // One-time migration from the old separate key
    try {
        const legacy = localStorage.getItem('habibie_extra_settings');
        if (legacy) {
            const current = JSON.parse(localStorage.getItem('habibie_settings') || '{}');
            if (!current.extra) {
                window.extraSettings = Object.assign({}, window.extraSettings, JSON.parse(legacy));
            }
            localStorage.removeItem('habibie_extra_settings');
            saveUserSettings();
        }
    } catch (e) { console.warn('Settings migration failed:', e); }

    paintDesktopBackground(window.extraSettings.desktopBg);
    window.tallySpeed = window.extraSettings.defaultTallySpeed || 1;
}

// --- DESKTOP BACKGROUND & CUSTOM UPLOAD APPLIERS ---
function paintDesktopBackground(bgKey) {
    const b = document.body;
    if (!b) return;

    b.style.backgroundImage = 'none';
    if (bgKey === 'teal') {
        b.style.backgroundColor = '#008080';
    } else if (bgKey === 'slate') {
        b.style.backgroundColor = '#2F4F4F';
    } else if (bgKey === 'navy') {
        b.style.backgroundColor = '#001B3A';
    } else if (bgKey === 'crimson') {
        b.style.backgroundColor = '#4A1212';
    } else if (bgKey === 'custom') {
        b.style.backgroundColor = '#008080';
        try {
            const savedBg = localStorage.getItem('habibie_custom_bg');
            if (savedBg) {
                b.style.backgroundImage = `url('${savedBg}')`;
            } else {
                window.extraSettings.desktopBg = 'teal'; // image is gone; do not claim "custom"
            }
        } catch (e) { console.warn(e); }
    }
}

window.applyDesktopBackground = function(bgKey) {
    window.extraSettings.desktopBg = bgKey;
    paintDesktopBackground(bgKey);
    saveExtendedSettings();
};

function storeAndApplyWallpaper(dataUrl) {
    try {
        localStorage.setItem('habibie_custom_bg', dataUrl);
    } catch (err) {
        console.warn('Wallpaper not persisted:', err);
        showCustomAlert("Image file is too large to save permanently in browser storage, but it has been applied for this session.", null);
    }
    window.extraSettings.desktopBg = 'custom';
    if (document.body) {
        document.body.style.backgroundImage = `url('${dataUrl}')`;
    }
    saveExtendedSettings(); // writes 'teal' instead of 'custom' if the image could not be stored
    showSettingsMenu(true);
}

window.uploadCustomWallpaper = function(inputElem) {
    if (!inputElem || !inputElem.files || !inputElem.files[0]) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const rawUrl = e.target.result;
        const img = new Image();
        img.onload = function() {
            let dataUrl = rawUrl;
            try {
                const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
                const canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(img.width * scale));
                canvas.height = Math.max(1, Math.round(img.height * scale));
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#008080';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const small = canvas.toDataURL('image/jpeg', 0.8);
                if (small.length < rawUrl.length) dataUrl = small;
            } catch (err) {}
            storeAndApplyWallpaper(dataUrl);
        };
        img.onerror = function() { storeAndApplyWallpaper(rawUrl); };
        img.src = rawUrl;
    };
    reader.readAsDataURL(inputElem.files[0]);
};

window.clearCustomWallpaper = function() {
    try {
        localStorage.removeItem('habibie_custom_bg');
    } catch (e) { console.warn(e); }
    applyDesktopBackground('teal');
    showSettingsMenu(true);
};

// --- SETTINGS CONTROLS HANDLERS ---
window.toggleAutoAdvanceSetting = function(cb) {
    window.extraSettings.autoAdvanceTurn = cb.checked;
    saveExtendedSettings();
};

window.toggleSfxSetting = function(cb) {
    window.extraSettings.sfxEnabled = cb.checked;
    saveExtendedSettings();
};

window.setDefaultTallySpeedSetting = function(spd) {
    window.extraSettings.defaultTallySpeed = spd;
    window.tallySpeed = spd;
    saveExtendedSettings();
    showSettingsMenu(true);
};

// --- DATA BACKUP & RESET ---
window.exportAchievementsBackup = function() {
    try {
        const data = JSON.stringify(unlockedAchievements || []);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'twilight_banyan_achievements.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) { console.warn(e); }
};

window.importAchievementsBackup = function(inputElem) {
    if (!inputElem || !inputElem.files || !inputElem.files[0]) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        let ids = null;
        try {
            const arr = JSON.parse(e.target.result);
            if (Array.isArray(arr)) ids = Array.from(new Set(arr.filter(x => typeof x === 'string')));
        } catch (err) {}

        if (!ids) {
            showCustomAlert("Invalid backup file format.", () => showSettingsMenu(true));
            return;
        }
        // Merge with current progress and keep only IDs the game knows about
        const known = new Set((typeof ACHIEVEMENTS !== 'undefined' ? ACHIEVEMENTS : []).map(a => a.id));
        if (known.size > 0) ids = ids.filter(id => known.has(id));
        const before = unlockedAchievements.length;
        unlockedAchievements = Array.from(new Set([...unlockedAchievements, ...ids]));
        try {
            localStorage.setItem('habibie_achievements', JSON.stringify(unlockedAchievements));
        } catch (err) { console.warn(err); }
        const added = unlockedAchievements.length - before;
        showCustomAlert(`Achievements backup merged. ${added} new achievement(s) restored.`, () => showSettingsMenu(true));
    };
    reader.readAsText(inputElem.files[0]);
};

window.resetAllAchievementsPrompt = function() {
    if (confirm("Are you sure you want to permanently reset all unlocked Achievements?")) {
        unlockedAchievements = [];
        localStorage.removeItem('habibie_achievements');
        showSettingsMenu(true);
    }
};

// --- PROTON MAIL FEEDBACK DISPATCHER ---
function buildFeedbackPayload() {
    const typeEl = document.getElementById('feedback-type-select');
    const msgEl = document.getElementById('feedback-message-input');
    const diagEl = document.getElementById('feedback-include-diag');

    const category = typeEl ? typeEl.value : 'General Feedback';
    const rawMsg = msgEl ? msgEl.value.trim() : '';

    let bodyText = rawMsg || '(Write your feedback or bug report here)';
    if (diagEl && diagEl.checked) {
        const turnInfo = (typeof gameStarted !== 'undefined' && gameStarted) ? `Turn ${currentTurn}` : 'Title Screen';
        const diffInfo = (typeof selectedDifficulty !== 'undefined') ? selectedDifficulty : 'N/A';
        const langInfo = (typeof currentLang !== 'undefined') ? currentLang : 'en';
        bodyText += `\n\n---\n[Diagnostic Info: ${turnInfo} | Difficulty: ${diffInfo} | Lang: ${langInfo} | Scale: ${textScale}%]`;
    }

    const subject = `[Twilight of the Banyan Tree] ${category}`;
    return { subject, bodyText, isEmpty: !rawMsg };
}

window.sendFeedbackToProton = function() {
    const { subject, bodyText, isEmpty } = buildFeedbackPayload();
    if (isEmpty) {
        showCustomAlert("Please write a brief message in the feedback box before sending.", null);
        return;
    }
    const mailtoUrl = `mailto:${SUPPORT_LINKS.protonmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailtoUrl;
};

window.copyFeedbackForProton = function() {
    const { subject, bodyText } = buildFeedbackPayload();
    const fullClip = `To: ${SUPPORT_LINKS.protonmail}\nSubject: ${subject}\n\n${bodyText}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullClip).then(() => {
            showCustomAlert(`Copied to clipboard! You can paste and send it directly to ${SUPPORT_LINKS.protonmail}.`, null);
        }).catch(() => {
            prompt("Copy the address and message below:", fullClip);
        });
    } else {
        prompt("Copy the address and message below:", fullClip);
    }
};

// --- INLINE LOGOS (KO-FI, TRAKTEER, X/TWITTER, PROTON MAIL) ---
const SETTINGS_ICONS = {
    kofi: `<svg width="15" height="15" viewBox="0 0 24 24" style="vertical-align: -2px; margin-right: 6px;"><path fill="#FFFFFF" d="M20 3H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 5h-2V5h2v3z"/><path fill="#FF5E5B" d="M11 13.5l-3.3-3.1c-.9-.9-.9-2.3 0-3.2.8-.8 2.2-.8 3 0l.3.3.3-.3c.8-.8 2.2-.8 3 0 .9.9.9 2.3 0 3.2L11 13.5z"/></svg>`,
    trakteer: `<svg width="15" height="15" viewBox="0 0 24 24" style="vertical-align: -2px; margin-right: 6px;"><path fill="#FFFFFF" d="M12 2L14.8 8.5L22 9.3L16.5 14L18.2 21L12 17.3L5.8 21L7.5 14L2 9.3L9.2 8.5L12 2Z"/></svg>`,
    twitter: `<svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align: -2px; margin-right: 6px;"><path fill="#FFFFFF" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    proton: `<svg width="15" height="15" viewBox="0 0 24 24" style="vertical-align: -2px; margin-right: 6px;"><path fill="#FFFFFF" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`
};

// --- RENDER SETTINGS MENU ---
window.showSettingsMenu = function(keepScroll) {
    if (!enterMenuView()) return;
    if (keepScroll !== true && typeof scrollMainPanelToTop === 'function') scrollMainPanelToTop();

    let html = '<h2>SETTINGS</h2>';
    html += '<div class="settings-panel-wrap">';

    // 1. GAMEPLAY & SIMULATION
    const toggleChecked = showOptionEffects ? 'checked' : '';
    const diffDisabled = selectedDifficulty === 'historical' ? 'disabled' : '';
    const autoAdvChecked = window.extraSettings.autoAdvanceTurn ? 'checked' : '';

    html += `<div class="settings-card">
        <div class="settings-card-header">Gameplay</div>
        <div class="settings-card-body">
            <div class="settings-row">
                <label style="cursor: pointer;">
                    <input type="checkbox" id="settings-effects-toggle" ${toggleChecked} ${diffDisabled} onchange="toggleSettingsEffects()">
                    Enable Outcome Forecast Tooltips
                </label>
                ${selectedDifficulty === 'historical' ? '<div class="settings-hint">(Locked: Forecast tooltips are disabled on Historical difficulty)</div>' : '<div class="settings-hint">Displays stat impact previews beneath crisis and faction choices.</div>'}
            </div>
            <div class="settings-row">
                <label style="cursor: pointer;">
                    <input type="checkbox" ${autoAdvChecked} onchange="toggleAutoAdvanceSetting(this)">
                    Auto-Advance Turn when both Action Phase slots are spent
                </label>
                <div class="settings-hint">Automatically proceeds to the next crisis once an Executive Action and Faction Engagement are completed.</div>
            </div>
            <div class="settings-row" style="border-bottom: none; padding-bottom: 0; margin-bottom: 0;">
                <span style="margin-right: 8px;">Default MPR Roll-Call Speed:</span>`;

    [1, 2, 5, 10].forEach(spd => {
        const isSel = (window.extraSettings.defaultTallySpeed === spd);
        html += `<button class="settings-pill-btn ${isSel ? 'is-selected' : ''}" onclick="setDefaultTallySpeedSetting(${spd})">${spd}x</button>`;
    });

    html += `</div></div></div>`;

    // 2. DISPLAY, THEME & AUDIO (2-Column Grid on Desktop)
    html += `<div class="settings-two-col">`;

    // Left Column: Display & Desktop Wallpaper
    html += `<div class="settings-card" style="margin-bottom: 0;">
        <div class="settings-card-header">Display</div>
        <div class="settings-card-body">
            <div class="settings-row">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                    <span>Text &amp; UI Scale:</span>
                    <span>
                        <input type="range" id="text-scale-slider" min="80" max="150" value="${textScale}" oninput="updateTextScale()">
                        <span id="text-scale-display" style="display: inline-block; width: 38px; text-align: right;">${textScale}%</span>
                    </span>
                </div>
            </div>
            <div class="settings-row">
                <div style="margin-bottom: 6px;">Desktop Wallpaper Color:</div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">`;

    const bgs = [
        { id: 'teal',    label: 'Win95 Teal',    hex: '#008080' },
        { id: 'slate',   label: 'Slate Gray',    hex: '#2F4F4F' },
        { id: 'navy',    label: 'Midnight Navy', hex: '#001B3A' },
        { id: 'crimson', label: 'Crimson',       hex: '#4A1212' }
    ];
    bgs.forEach(bg => {
        const isCur = (window.extraSettings.desktopBg === bg.id);
        html += `<button class="settings-swatch-btn ${isCur ? 'is-selected' : ''}" onclick="applyDesktopBackground('${bg.id}'); showSettingsMenu(true);">
            <span class="settings-color-dot" style="background-color: ${bg.hex};"></span>${bg.label}
        </button>`;
    });

    html += `   </div>
                <div style="margin-top: 8px;">
                    <button class="settings-inline-btn" onclick="document.getElementById('custom-bg-upload').click()">Custom</button>
                    <input type="file" id="custom-bg-upload" accept="image/*" style="display: none;" onchange="uploadCustomWallpaper(this)">
                    ${window.extraSettings.desktopBg === 'custom' ? `<button class="settings-inline-btn" style="background-color: #ffcccc;" onclick="clearCustomWallpaper()">Clear Custom</button>` : ''}
                </div>
            </div>
            <div class="settings-row" style="border-bottom: none; padding-bottom: 0; margin-bottom: 0;">
                <div style="margin-bottom: 5px;">Themes</div>
                <button class="settings-inline-btn ${currentTheme === 'default' ? 'is-selected' : ''}" onclick="setTheme('default')">Default Win95</button>
                <button class="settings-inline-btn ${currentTheme === 'crt' ? 'is-selected' : ''}" onclick="setTheme('crt')">CRT Scanlines</button>
                ${currentTheme === 'crt' ? `
                <div class="settings-sunken-well" style="margin-top: 8px;">
                    <span>Scanline Intensity:</span>
                    <input type="range" id="crt-slider" min="5" max="100" value="${crtIntensity}" oninput="updateCRTIntensity()">
                    <span id="crt-display">${crtIntensity}%</span>
                </div>` : ''}
            </div>
        </div>
    </div>`;

    // Right Column: Audio & Data Management
    const musicChecked = musicEnabled ? 'checked' : '';
    const sfxChecked = window.extraSettings.sfxEnabled !== false ? 'checked' : '';
    const audioElem = document.getElementById('bg-music');
    const currentVolume = audioElem ? Math.round(audioElem.volume * 100) : 30;
    const volumeDisabled = musicEnabled ? '' : 'disabled';

    html += `<div class="settings-card" style="margin-bottom: 0;">
        <div class="settings-card-header">Audio &amp; Save Data</div>
        <div class="settings-card-body">
            <div class="settings-row">
                <label style="cursor: pointer; display: block; margin-bottom: 6px;">
                    <input type="checkbox" id="settings-music-toggle" ${musicChecked} onchange="toggleMusicEnabled()">
                    Enable Background Music Player
                </label>
                <label style="cursor: pointer; display: block; margin-bottom: 8px;">
                    <input type="checkbox" id="settings-sfx-toggle" ${sfxChecked} onchange="toggleSfxSetting(this)">
                    Enable Sound Effects (Alerts &amp; Chimes)
                </label>
                <div style="${musicEnabled ? '' : 'color: #888;'}">
                    <span>Music Volume:</span>
                    <input type="range" id="volume-slider" min="0" max="100" value="${currentVolume}" oninput="updateVolume()" ${volumeDisabled}>
                    <span id="volume-display">${currentVolume}%</span>
                </div>
            </div>
            <div class="settings-row" style="border-bottom: none; padding-bottom: 0; margin-bottom: 0;">
                <div style="margin-bottom: 6px;">Data:</div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">
                    <button class="settings-inline-btn" onclick="exportAchievementsBackup()">Export Achievements</button>
                    <button class="settings-inline-btn" onclick="document.getElementById('import-achv-input').click()">Import Achievements</button>
                    <input type="file" id="import-achv-input" accept=".json" style="display: none;" onchange="importAchievementsBackup(this)">
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    <button class="settings-inline-btn" style="background-color: #ffd6d6;" onclick="if(confirm('Delete your saved campaign? This cannot be undone.')){ clearCampaignSave(); showCustomAlert('Saved campaign cleared.', () => showSettingsMenu(true)); }">Clear Saved Campaign</button>
                    <button class="settings-inline-btn" style="background-color: #ff9999;" onclick="resetAllAchievementsPrompt()">Reset All Achievements</button>
                </div>
            </div>
        </div>
    </div>`;

    html += `</div>`; // end .settings-two-col

    // 3. COMMUNITY, SUPPORT & PROTON MAIL FEEDBACK
    html += `<div class="settings-card">
        <div class="settings-card-header">Support &amp; Feedback</div>
        <div class="settings-card-body">
            <div style="margin-bottom: 12px;">
                <div class="settings-brand-btn-row">
                    <button class="brand-btn brand-btn-kofi" onclick="window.open('${SUPPORT_LINKS.kofi}', '_blank')">
                        ${SETTINGS_ICONS.kofi}Buy me a coffee (Ko-fi)
                    </button>
                    <button class="brand-btn brand-btn-trakteer" onclick="window.open('${SUPPORT_LINKS.trakteer}', '_blank')">
                        ${SETTINGS_ICONS.trakteer}Support on Trakteer
                    </button>
                    <button class="brand-btn brand-btn-twitter" onclick="window.open('${SUPPORT_LINKS.twitter}', '_blank')">
                        ${SETTINGS_ICONS.twitter}Follow on X / Twitter
                    </button>
                </div>
            </div>

            <div class="settings-feedback-box">
                <div style="color: #000080; margin-bottom: 6px;">
                    Feedback
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 6px;">
                    <label style="font-size: 12px;">
                        Topic:
                        <select id="feedback-type-select" class="settings-select">
                            <option value="General Feedback">General Feedback</option>
                            <option value="Bug Report">Bug Report</option>
                            <option value="Historical Note / Typo">Historical Note / Typo</option>
                            <option value="Balance Suggestion">Gameplay Balance Suggestion</option>
                        </select>
                    </label>
                    <label style="font-size: 11px; cursor: pointer;">
                        <input type="checkbox" id="feedback-include-diag" checked>
                        Attach current turn &amp; difficulty info
                    </label>
                </div>
                <textarea id="feedback-message-input" class="settings-textarea" rows="3" placeholder="Write message here...."></textarea>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                    <button class="brand-btn brand-btn-proton" onclick="sendFeedbackToProton()">
                        ${SETTINGS_ICONS.proton}Send
                    </button>
                    <button class="settings-inline-btn" onclick="copyFeedbackForProton()" title="Copies the formatted email and address if you use webmail">
                        Copy Message
                    </button>
                </div>
            </div>
        </div>
    </div>`;

    html += '</div>'; // end .settings-panel-wrap

    html += `<center><button style="width: 250px; margin-top: 6px; background-color: #ff9999; text-align: center;" onclick="returnToPreviousView()">Back</button></center>`;

    document.getElementById('main-panel').innerHTML = html;
};

// --- LOAD SETTINGS EARLY ---
// Scripts sit at the end of <body>, so the DOM already exists: apply saved theme, wallpaper,
// text scale and volume immediately instead of waiting for the 'load' event.
loadUserSettings();
loadExtendedSettings();
if (textScale !== 100) applyTextScale(textScale);