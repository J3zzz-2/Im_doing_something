// ==========================================
// DEBUG MODULE: RANDOMIZED MPR ELECTION TESTER
// ==========================================

window.debugAllowAchievements = false;
let originalUnlockAchievement = null;

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.exitDebugElectionToMenu = function() {
    const mprDash = document.getElementById('mpr-dashboard');
    const leftPanel = document.getElementById('left-panel');
    const mainPanel = document.getElementById('main-panel');

    if (mprDash) mprDash.style.display = '';
    if (leftPanel) leftPanel.style.display = '';
    if (mainPanel) mainPanel.style.width = '70%';

    if (typeof initialFactionsSnapshot !== 'undefined' && Object.keys(initialFactionsSnapshot).length > 0) {
        factions = JSON.parse(JSON.stringify(initialFactionsSnapshot));
    }
    if (typeof INITIAL_PORTRAIT_FACTIONS !== 'undefined') {
        portraitFactions = [...INITIAL_PORTRAIT_FACTIONS];
    }

    gameStarted = false;
    updateUI();
    showStartMenu();
};

window.runDebugElection = function(preset = 'pure_random') {
    if (typeof window.skipTally === 'function') {
        try { window.skipTally(); } catch (e) {}
    }

    if (typeof initialFactionsSnapshot !== 'undefined' && Object.keys(initialFactionsSnapshot).length > 0) {
        factions = JSON.parse(JSON.stringify(initialFactionsSnapshot));
    }
    if (typeof INITIAL_PORTRAIT_FACTIONS !== 'undefined') {
        portraitFactions = [...INITIAL_PORTRAIT_FACTIONS];
    } else {
        portraitFactions = ['pdip', 'golkar_akbar', 'poros_tengah', 'abri', 'ppp', 'pkb', 'golkar_habibie', 'utusan_daerah', 'utusan_golongan', 'other_parties'];
    }

    // Apply the Oct 7 Poros Tengah merger so the 700 seats match Election Day
    if (factions['poros_tengah'] && factions['poros_tengah'].transformed) {
        const t = factions['poros_tengah'].transformed;
        factions['poros_tengah'].name = t.name;
        factions['poros_tengah'].seats = t.seats;
        factions['poros_tengah'].summary = t.summary;
        factions['poros_tengah'].biography = t.biography;
        factions['poros_tengah'].moods = t.moods;
        factions['poros_tengah'].interactions = t.interactions;

        if (factions['ppp']) factions['ppp'].seats = 0;
        const pppIdx = portraitFactions.indexOf('ppp');
        if (pppIdx > -1) portraitFactions.splice(pppIdx, 1);

        if (factions['pkb']) factions['pkb'].seats = 0;
        const pkbIdx = portraitFactions.indexOf('pkb');
        if (pkbIdx > -1) portraitFactions.splice(pkbIdx, 1);

        if (factions['other_parties']) {
            factions['other_parties'].seats = 26;
        }
    }

    let minAff = 5, maxAff = 95;
    if (preset === 'nailbiter') {
        minAff = 42;
        maxAff = 68;
    } else if (preset === 'landslide_win') {
        minAff = 65;
        maxAff = 98;
    } else if (preset === 'landslide_loss') {
        minAff = 5;
        maxAff = 38;
    } else if (preset === 'pure_random') {
        const rollArchetype = Math.random();
        if (rollArchetype < 0.25) { minAff = 10; maxAff = 55; }
        else if (rollArchetype < 0.75) { minAff = 35; maxAff = 75; }
        else { minAff = 55; maxAff = 95; }
    }

    stats.PC = randInt(0, 80);
    stats.pop = randInt(minAff, maxAff);
    stats.ref = randInt(minAff, maxAff);
    stats.econ = randInt(minAff, maxAff);
    stats.intl = randInt(minAff, maxAff);
    stats.stab = randInt(minAff, maxAff);
    stats.cendana = randInt(100 - maxAff, 100 - minAff);

    portraitFactions.forEach(key => {
        if (!factions[key]) return;
        if (key === 'golkar_habibie') {
            factions[key].affinity = randInt(Math.max(50, minAff), Math.min(100, maxAff + 20));
        } else {
            factions[key].affinity = randInt(minAff, maxAff);
        }
        factions[key].favor = Math.random() < 0.35 ? randInt(1, 2) : 0;
    });

    if (factions['abri']) {
        stats.mil = Math.round(factions['abri'].affinity);
    }

    gameStarted = true;
    currentTurn = events.length + 1;
    updateUI();

    if (!originalUnlockAchievement && typeof window.unlockAchievement === 'function') {
        originalUnlockAchievement = window.unlockAchievement;
    }
    if (originalUnlockAchievement) {
        window.unlockAchievement = function(id) {
            if (window.debugAllowAchievements) {
                originalUnlockAchievement(id);
            }
        };
    }

    runElection();
    injectDebugTallyControls(preset);
};

function injectDebugTallyControls(lastPreset) {
    const mainPanel = document.getElementById('main-panel');
    if (!mainPanel) return;

    const debugBar = document.createElement('div');
    debugBar.id = 'debug-election-toolbar';
    debugBar.style.cssText = 'max-width: 800px; margin: 10px auto 0 auto; padding: 10px; background-color: #E0DFE3; border: 2px ridge #808080; text-align: center; font-family: "MS Sans Serif", sans-serif; font-size: 12px;';

    debugBar.innerHTML = `
        <div style="color: #000080; font-weight: bold; margin-bottom: 6px;">[ DEBUG ELECTION CONTROLS ]</div>
        <button style="width: 190px; display: inline-block; text-align: center; font-weight: bold; margin: 3px; background-color: #d0e8d0;" onclick="runDebugElection('pure_random')">&#127922; Re-Roll Pure Random</button>
        <button style="width: 190px; display: inline-block; text-align: center; margin: 3px;" onclick="runDebugElection('nailbiter')">&#9878; Roll Nail-Biter (~351)</button>
        <button style="width: 160px; display: inline-block; text-align: center; margin: 3px;" onclick="runDebugElection('landslide_win')">&#128200; Roll Landslide Win</button>
        <button style="width: 160px; display: inline-block; text-align: center; margin: 3px;" onclick="runDebugElection('landslide_loss')">&#128201; Roll Landslide Loss</button>
        <br>
        <button style="width: 220px; display: inline-block; text-align: center; margin-top: 6px; background-color: #ff9999; font-weight: bold;" onclick="exitDebugElectionToMenu()">&laquo; Exit Debug to Start Menu</button>
    `;

    mainPanel.appendChild(debugBar);
}

window.showDebugMenu = function() {
    let html = '<center><h2>MPR ELECTION DEBUGGER</h2></center>';
    html += '<div style="padding: 15px; margin-bottom: 15px; background-color: #F5F5F5; border: 2px solid #808080; font-family: MS Sans Serif; font-size: 13px; line-height: 1.6;">';
    html += '<p style="margin-top: 0;">Jump straight to the <b>October 19, 1999 MPR General Session</b> tally with randomized national metrics, faction stances, and favors. Each click generates a brand-new 700-delegate roll call inside the semi-circular chamber.</p>';

    const achvChecked = window.debugAllowAchievements ? 'checked' : '';
    html += `<label style="cursor: pointer; font-weight: bold;"><input type="checkbox" ${achvChecked} onchange="window.debugAllowAchievements = this.checked"> Allow Achievements to unlock during Debug Elections</label>`;
    html += '</div>';

    html += '<center>';
    html += '<button style="width: 320px; text-align: center; font-weight: bold; padding: 10px; background-color: #d0e8d0; margin-bottom: 8px;" onclick="runDebugElection(\'pure_random\')">&#127922; Launch Instant Random MPR Election</button><br>';
    html += '<button style="width: 320px; text-align: center; padding: 8px; margin-bottom: 8px;" onclick="runDebugElection(\'nailbiter\')">&#9878; Launch Razor-Thin Tossup</button><br>';
    html += '<button style="width: 320px; text-align: center; padding: 8px; margin-bottom: 8px;" onclick="runDebugElection(\'landslide_win\')">&#128200; Launch Overwhelming Victory</button><br>';
    html += '<button style="width: 320px; text-align: center; padding: 8px; margin-bottom: 15px;" onclick="runDebugElection(\'landslide_loss\')">&#128201; Launch Total Repudiation</button><br>';
    html += '<button style="width: 250px; text-align: center; background-color: #ff9999;" onclick="showStartMenu()">Back to Start Menu</button>';
    html += '</center>';

    document.getElementById('main-panel').innerHTML = html;
};

window.addEventListener('load', function() {
    const baseShowStartMenu = window.showStartMenu;
    if (typeof baseShowStartMenu === 'function') {
        window.showStartMenu = function() {
            if (originalUnlockAchievement) {
                window.unlockAchievement = originalUnlockAchievement;
            }
            baseShowStartMenu();
            const mainPanel = document.getElementById('main-panel');
            if (mainPanel) {
                const btnContainer = mainPanel.querySelector('.start-menu-right');
                if (btnContainer) {
                    const dbgBtn = document.createElement('button');
                    dbgBtn.style.cssText = 'width: 250px; font-weight: bold; text-align: center; margin-top: 8px; padding: 10px; background-color: #e6d8ad; color: #000080;';
                    dbgBtn.innerHTML = '&#9881; Debug: Random MPR Election';
                    dbgBtn.onclick = function() { runDebugElection('pure_random'); };
                    btnContainer.appendChild(document.createElement('br'));
                    btnContainer.appendChild(dbgBtn);
                }
            }
        };
        if (!gameStarted) {
            window.showStartMenu();
        }
    }

    const miscBox = document.querySelector('.achievements-container');
    if (miscBox) {
        const sideBtn = document.createElement('button');
        sideBtn.style.cssText = 'width: 100%; text-align: center; font-weight: bold; margin-top: 8px; margin-bottom: 0; background-color: #e6d8ad; color: #000080;';
        sideBtn.innerHTML = '&#9881; Debug MPR Election';
        sideBtn.onclick = function() { showDebugMenu(); };
        miscBox.appendChild(sideBtn);
    }
});