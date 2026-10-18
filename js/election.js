// ============================================================================
// OCTOBER 19–20, 1999 MPR ROLL CALL, HEMICYCLE & TAP MPR No. III/MPR/1999
// (election.js)
// ============================================================================

function clearTallyInterval() {
    if (window.activeTallyInterval) {
        clearInterval(window.activeTallyInterval);
        window.activeTallyInterval = null;
    }
}

window.setTallySpeed = function(speed) {
    window.tallySpeed = speed;
    const speedBtnsContainer = document.getElementById('speed-controls-container');
    if (speedBtnsContainer) {
        let html = '<b style="font-family: MS Sans Serif; font-size: 12px;">Speed: </b>';
        [1, 2, 5, 10].forEach(s => {
            html += `<button class="${window.tallySpeed === s ? 'is-selected' : ''}" style="width: 45px; --py: 3px; --px: 3px; margin: 0 3px; display: inline-block; text-align: center;" onclick="setTallySpeed(${s})">${s}x</button>`;
        });
        speedBtnsContainer.innerHTML = html;
    }
};

// Strips leader names or notes inside parentheses — e.g. "Golkar (Akbar Tandjung)" -> "Golkar"
function stripLeaderParentheses(nameStr) {
    if (!nameStr) return '';
    return String(nameStr)
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/\s*\([^)]*\)/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Renders a color-coded party label without leader names in parentheses
function renderElectionPartyBadge(factionKey, fallbackName) {
    const f = (typeof factions !== 'undefined' && factions[factionKey]) ? factions[factionKey] : null;
    const rawName = (f && f.name) ? f.name : (fallbackName || factionKey);
    const cleanName = stripLeaderParentheses(rawName);
    const col = (typeof FACTION_HISTORICAL_COLORS !== 'undefined' && FACTION_HISTORICAL_COLORS[factionKey])
        ? FACTION_HISTORICAL_COLORS[factionKey]
        : { fill: '#808080' };
    const textCol = (typeof FACTION_TEXT_COLORS !== 'undefined' && FACTION_TEXT_COLORS[factionKey])
        ? FACTION_TEXT_COLORS[factionKey]
        : '#111111';

    return `<span style="display: inline-flex; align-items: center; gap: 6px;">
        <span class="faction-color-swatch" style="background-color: ${col.fill};"></span>
        <b style="color: ${textCol};">${cleanName}</b>
    </span>`;
}

// Generates the 700-seat semi-circular MPR hemicycle coordinates
function generateHemicycleLayout(totalSeats) {
    const numRows = 13;
    const radiiX = [];
    let weightSum = 0;

    for (let r = 0; r < numRows; r++) {
        const rx = 21 + (r / (numRows - 1)) * 26.5;
        radiiX.push(rx);
        weightSum += rx;
    }

    const rowCounts = [];
    const remainders = [];
    let allocated = 0;

    for (let r = 0; r < numRows; r++) {
        const exact = (radiiX[r] / weightSum) * totalSeats;
        const flo = Math.floor(exact);
        rowCounts.push(flo);
        remainders.push({ r: r, rem: exact - flo });
        allocated += flo;
    }

    remainders.sort((a, b) => b.rem - a.rem);
    for (let i = 0; i < totalSeats - allocated; i++) {
        rowCounts[remainders[i].r]++;
    }

    const seats = [];
    const numSectors = 5;
    const aisleGap = 0.032;
    const totalAisleAngle = (numSectors - 1) * aisleGap;
    const startMargin = 0.05;
    const usableSpan = Math.PI - (2 * startMargin) - totalAisleAngle;

    for (let r = 0; r < numRows; r++) {
        const count = rowCounts[r];
        const rx = radiiX[r];
        const ry = rx * 1.90;

        for (let j = 0; j < count; j++) {
            const u = count > 1 ? j / (count - 1) : 0.5;
            const sector = Math.min(numSectors - 1, Math.floor((j / count) * numSectors));
            const theta = (Math.PI - startMargin) - (u * usableSpan + sector * aisleGap);

            const xPct = 50 + rx * Math.cos(theta);
            const yPct = 92 - ry * Math.sin(theta);
            seats.push({ x: xPct, y: yPct, theta: theta, row: r });
        }
    }

    seats.sort((a, b) => (b.theta - a.theta) || (a.row - b.row));
    return seats;
}

// Builds the condensed English translation of TAP MPR No. III/MPR/1999
function buildTapMprDocumentHTML(accepted, forVotes, againstVotes, blankVotes) {
    const verdictWord = accepted ? 'ACCEPTED' : 'REJECTED';
    const verdictColor = accepted ? '#006400' : '#8B0000';

    return `<div class="tap-mpr-document">
        <div class="tap-mpr-header">
            <img src="photo/pancasila.png" alt="[Garuda]" style="width: 96px; height: auto; display: block; margin: 0 auto 8px auto;" onerror="this.style.display='none'">
            <div style="font-size: 13px; font-weight: bold; letter-spacing: 0.5px;">PEOPLE'S CONSULTATIVE ASSEMBLY OF THE REPUBLIC OF INDONESIA</div>
            <div style="font-size: 12px; font-weight: bold; margin-top: 26px;">DECREE OF THE PEOPLE'S CONSULTATIVE ASSEMBLY<br>OF THE REPUBLIC OF INDONESIA<br>NUMBER III/MPR/1999</div>
            <div style="font-size: 11px; font-weight: bold; margin-top: 13px;">CONCERNING<br><br>THE ACCOUNTABILITY OF THE PRESIDENT OF THE REPUBLIC OF INDONESIA<br>Prof. Dr. Ing. BACHARUDDIN JUSUF HABIBIE</div>
        </div>

        <hr style="border-top: 1px solid #444; margin: 10px 0;">

        <div class="tap-mpr-body">
            <div style="text-align: center; font-weight: bold; margin-bottom: 8px;">BY THE GRACE OF GOD ALMIGHTY<br>THE PEOPLE'S CONSULTATIVE ASSEMBLY OF THE REPUBLIC OF INDONESIA,</div>

            <p style="margin: 6px 0;"><b>Considering:</b></p>
            <ol type="a" style="margin: 4px 0 8px 18px; padding-left: 6px;">
                <li style="margin-bottom: 4px;">that the President elected and appointed by the People's Consultative Assembly of the Republic of Indonesia is subordinate and accountable to the Assembly and, at the conclusion of his term, delivers an accounting for the implementation of the Outlines of State Policy established by the 1945 Constitution and/or by the Assembly;</li>
                <li style="margin-bottom: 4px;">that Prof. Dr. Ing. Bacharuddin Jusuf Habibie has held office as President of the Republic of Indonesia since taking the oath of office on May 21, 1998;</li>
                <li style="margin-bottom: 4px;">that the President of the Republic of Indonesia Prof. Dr. Ing. Bacharuddin Jusuf Habibie delivered his Accountability Speech before the 8th Plenary Meeting on October 14, 1999, and his formal reply to the General Views of the Factions before the 11th Plenary Meeting on October 17, 1999;</li>
                <li style="margin-bottom: 4px;">that the People's Consultative Assembly must evaluate and render a binding decision upon the accountability of President Prof. Dr. Ing. Bacharuddin Jusuf Habibie during his tenure in office.</li>
            </ol>

            <p style="margin: 6px 0;"><b>Having Observed:</b> The deliberations of Commission D (October 17–18, 1999) and the secret-ballot decision of the 12th Plenary Meeting on October 19–20, 1999 (${forVotes} Accept, ${againstVotes} Reject, ${blankVotes} Blank votes).</p>

            <div style="text-align: center; font-weight: bold; margin: 10px 0 6px 0; letter-spacing: 0.5px;">DECIDES</div>
            <p style="margin: 4px 0;"><b>To Enact:</b> DECREE OF THE PEOPLE'S CONSULTATIVE ASSEMBLY OF THE REPUBLIC OF INDONESIA CONCERNING THE ACCOUNTABILITY OF THE PRESIDENT OF THE REPUBLIC OF INDONESIA Prof. Dr. Ing. BACHARUDDIN JUSUF HABIBIE.</p>

            <div class="tap-mpr-article-bo">
                <div style="text-align: center; font-weight: bold; margin-bottom: 4px;">Article 1</div>
                <div>The Accountability of the President of the Republic of Indonesia, <b>Prof. Dr. Ing. Bacharuddin Jusuf Habibie</b>, delivered before the 8th Plenary Meeting on October 14, 1999, together with the President's reply to the General Views of the Factions before the 11th Plenary Meeting on October 17, 1999 at the General Session of the People's Consultative Assembly, is hereby declared <span style="color: ${verdictColor}; font-weight: bold; text-decoration: underline;">${verdictWord}</span>.</div>
                <div style="text-align: center; font-weight: bold; margin-top: 8px; margin-bottom: 2px;">Article 2</div>
                <div style="text-align: center;">This Decree shall enter into force on the date of its enactment.</div>
            </div>

            <div class="tap-mpr-signatures">
                <div style="text-align: right; margin-bottom: 8px;">
                    Enacted in Jakarta<br>
                    on October 19, 1999
                </div>
                <div style="text-align: center; font-weight: bold; margin-bottom: 8px;">
                    PEOPLE'S CONSULTATIVE ASSEMBLY OF THE REPUBLIC OF INDONESIA<br>
                    CHAIRMAN,<br>
                    <span style="font-weight: normal; font-style: italic;">[Signed]</span><br>
                    <b>Prof. Dr. H. M. Amien Rais, M.A.</b>
                </div>
                <div style="font-size: 10.5px; color: #333; text-align: center; line-height: 1.45;">
                    <b>VICE CHAIRMEN:</b> Prof. Dr. Ir. Ginandjar Kartasasmita &bull; Drs. Kwik Kian Gie &bull; H. Matori Abdul Djalil &bull; Drs. H. M. Husnie Thamrin &bull; Hari Sabarno, S.IP., M.B.A., M.M. &bull; Prof. Dr. Jusuf Amir Feisal, S.Pd. &bull; Drs. H. A. Nazri Adlani
                </div>
            </div>
        </div>
    </div>`; 
}

function runElection() {
    clearTallyInterval();
    window.electionPanelSnapshot = null;
    clearCampaignSave();
    scrollMainPanelToTop();
    document.getElementById('mpr-dashboard').style.display = 'none';
    document.getElementById('left-panel').style.display = 'none';
    document.getElementById('main-panel').style.width = '100%';
    updateMobileStatusBar();

    const finalData = [];
    let grandTotalFor = 0;
    let grandTotalAgainst = 0;
    let grandTotalBlank = 0;
    const govStability = getGovStability();

    const cendanaSabotage = Math.round((stats.cendana - 50) / 10);
    const stabilityFloorMod = Math.round((govStability - 50) / 10);

    for (let i = 0; i < portraitFactions.length; i++) {
        const key = portraitFactions[i];
        const f = factions[key];
        if (!f || f.seats <= 0 || bannedFactions[key]) continue;

        let blankVotes = Math.floor(Math.random() * (f.seats * 0.015 + 1));
        if (blankVotes > 2) blankVotes = Math.floor(Math.random() * 3);
        const activeSeats = f.seats - blankVotes;

        const unspentFavor = f.favor || 0;
        const favorBonus = unspentFavor * 8;
        const rawVariance = (Math.floor(Math.random() * 17) - 9) + stabilityFloorMod - cendanaSabotage;
        const cushionedVariance = (rawVariance < 0 && unspentFavor > 0)
            ? Math.round(rawVariance / (1 + unspentFavor * 0.5))
            : rawVariance;

        const finalAffinity = clampFaction(key, f.affinity + favorBonus + cushionedVariance);

        let votesFor = 0;
        if (key === 'pdip' || key === 'poros_tengah' || key === 'abri') {
            if (finalAffinity >= 80) votesFor = Math.round(activeSeats * 0.96);
            else if (finalAffinity >= 65) votesFor = Math.round(activeSeats * 0.72);
            else if (finalAffinity >= 50) votesFor = Math.round(activeSeats * 0.42);
            else if (finalAffinity >= 35) votesFor = Math.round(activeSeats * 0.15);
            else votesFor = 0;
        } else {
            votesFor = Math.round(activeSeats * (finalAffinity / 100));
        }

        votesFor = Math.max(0, Math.min(activeSeats, votesFor));
        const votesAgainst = activeSeats - votesFor;

        grandTotalFor += votesFor;
        grandTotalAgainst += votesAgainst;
        grandTotalBlank += blankVotes;

        finalData.push({
            key: key,
            name: stripLeaderParentheses(f.name),
            short: stripLeaderParentheses(f.short || f.name),
            totalSeats: f.seats,
            targetFor: votesFor,
            targetAgainst: votesAgainst,
            targetBlank: blankVotes,
            curFor: 0,
            curAgainst: 0,
            curBlank: 0,
            seatPool: []
        });
    }

    const totalChamberSeats = Math.max(1, grandTotalFor + grandTotalAgainst + grandTotalBlank);
    const hemicycleCoords = generateHemicycleLayout(totalChamberSeats);

    // Assign each faction its contiguous block of seats, then shuffle its seat indices
    // so that Accept, Reject, and Abstain light up randomly across the bloc each campaign!
    let runningSeatOffset = 0;
    for (let i = 0; i < finalData.length; i++) {
        const pool = [];
        for (let s = 0; s < finalData[i].totalSeats; s++) {
            pool.push(runningSeatOffset + s);
        }
        for (let j = pool.length - 1; j > 0; j--) {
            const r = Math.floor(Math.random() * (j + 1));
            const tmp = pool[j];
            pool[j] = pool[r];
            pool[r] = tmp;
        }
        finalData[i].seatPool = pool;
        runningSeatOffset += finalData[i].totalSeats;
    }

    let clockTime = new Date("1999-10-19T20:30:00");
    let electionFinished = false;

    let html = '<div class="tally-box">';
    html += '<center><h2>12th Plenary Meeting of the 1999 MPR General Session</h2></center>';

    html += `<center><div id="tally-clock" class="tally-clock-fixed">OCT 19, 08:30 PM</div></center>`;

    html += '<div id="speed-controls-container" style="text-align: center; margin-bottom: 12px;">';
    html += '<b style="font-family: MS Sans Serif; font-size: 12px;">Speed: </b>';
    [1, 2, 5, 10].forEach(s => {
        html += `<button class="${window.tallySpeed === s ? 'is-selected' : ''}" style="width: 45px; --py: 3px; --px: 3px; margin: 0 3px; display: inline-block; text-align: center;" onclick="setTallySpeed(${s})">${s}x</button>`;
    });
    html += '</div>';

    // Chamber Visual Box: Tug-of-War Bar + 700-Seat Semi-Circular Hemicycle
    html += '<div class="mpr-chamber-box">';
    html += '<div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; margin-bottom: 3px;">';
    html += '<span style="color: #006400;">ACCEPT: <span id="bar-label-for">0</span></span>';
    html += '<span style="color: #333333;"></span>';
    html += '<span style="color: #8B0000;">REJECT: <span id="bar-label-against">0</span></span>';
    html += '</div>';

    html += '<div class="mpr-tug-container">';
    html += '<div id="tug-for" class="mpr-tug-for" style="width: 0%;"></div>';
    html += '<div id="tug-blank" class="mpr-tug-blank" style="width: 0%;"></div>';
    html += '<div id="tug-against" class="mpr-tug-against" style="width: 0%;"></div>';
    html += '<div class="mpr-majority-marker" title="Majority Threshold"></div>';
    html += '</div>';

    html += '<div id="mpr-hemicycle" class="mpr-hemicycle-wrap">';
    for (let s = 0; s < hemicycleCoords.length; s++) {
        const pt = hemicycleCoords[s];
        html += `<div id="seat-dot-${s}" class="mpr-seat-dot" style="left: ${pt.x.toFixed(2)}%; top: ${pt.y.toFixed(2)}%;"></div>`;
    }
    html += '<div class="mpr-rostrum">MPR ROSTRUM</div>';
    html += '</div>';
    html += '</div>';

    // Faction Whiteboard Tally Table (Color-Coded Party Rows, No Parenthetical Leader Names)
    html += '<table width="100%" border="1" cellpadding="7" cellspacing="0" bordercolor="#808080">';
    html += '<tr bgcolor="#000080"><td width="36%"><font color="#FFFFFF"><b>Caucus</b></font></td><td width="16%" align="center"><font color="#FFFFFF"><b>ACCEPT</b></font></td><td width="16%" align="center"><font color="#FFFFFF"><b>REJECT</b></font></td><td width="16%" align="center"><font color="#FFFFFF"><b>BLANK</b></font></td><td width="16%" align="center"><font color="#FFFFFF"><b>SEATS</b></font></td></tr>';

    for (let i = 0; i < finalData.length; i++) {
        const d = finalData[i];
        const partyBadge = renderElectionPartyBadge(d.key, d.name);
        html += `<tr>
            <td>
                ${partyBadge}
                <div class="faction-mini-bar-wrap">
                    <div id="fbar-for-${i}" class="faction-mini-for" style="width: 0%;"></div>
                    <div id="fbar-against-${i}" class="faction-mini-against" style="width: 0%;"></div>
                </div>
            </td>
            <td align="center"><font color="#008000"><b id="f-for-${i}">0</b></font></td>
            <td align="center"><font color="#FF0000"><b id="f-against-${i}">0</b></font></td>
            <td align="center"><font color="#808080"><b id="f-blank-${i}">0</b></font></td>
            <td align="center"><b>${d.totalSeats}</b></td>
        </tr>`;
    }

    html += `<tr bgcolor="#FFFF00">
        <td><b>TALLY:</b></td>
        <td align="center"><font color="#008000" size="4"><b id="tot-for">0</b></font></td>
        <td align="center"><font color="#FF0000" size="4"><b id="tot-against">0</b></font></td>
        <td align="center"><font color="#808080" size="4"><b id="tot-blank">0</b></font></td>
        <td align="center"><b id="tot-counted">0 / ${totalChamberSeats}</b></td>
    </tr></table><br>`;

    html += '<div id="skip-btn-wrap" style="text-align: center;"><button id="skip-tally-btn" style="width: 250px; background-color: #ff9999; text-align: center;" onclick="skipTally()">SKIP ANIMATION</button></div>';
    html += '<div id="election-result-container"></div>';
    html += '</div>';

    document.getElementById('main-panel').innerHTML = html;

    const seatDots = [];
    for (let s = 0; s < hemicycleCoords.length; s++) {
        seatDots.push(document.getElementById(`seat-dot-${s}`));
    }
    const tallyEls = {
        totFor: document.getElementById('tot-for'),
        totAgainst: document.getElementById('tot-against'),
        totBlank: document.getElementById('tot-blank'),
        totCounted: document.getElementById('tot-counted'),
        labelFor: document.getElementById('bar-label-for'),
        labelAgainst: document.getElementById('bar-label-against'),
        tugFor: document.getElementById('tug-for'),
        tugBlank: document.getElementById('tug-blank'),
        tugAgainst: document.getElementById('tug-against'),
        clock: document.getElementById('tally-clock'),
        rows: finalData.map((d, i) => ({
            for: document.getElementById(`f-for-${i}`),
            against: document.getElementById(`f-against-${i}`),
            blank: document.getElementById(`f-blank-${i}`),
            barFor: document.getElementById(`fbar-for-${i}`),
            barAgainst: document.getElementById(`fbar-against-${i}`)
        }))
    };

    function formatFixedClock(dt) {
        const dayLabel = dt.getDate() === 20 ? "OCT 20, " : "OCT 19, ";
        let hrs = dt.getHours();
        const mins = String(dt.getMinutes()).padStart(2, '0');
        const ampm = hrs >= 12 ? 'PM' : 'AM';
        hrs = hrs % 12;
        if (hrs === 0) hrs = 12;
        const hrsStr = String(hrs).padStart(2, '0');
        return `${dayLabel}${hrsStr}:${mins} ${ampm}`;
    }

    function updateTallyDOM() {
        if (!tallyEls.totFor || !tallyEls.totFor.isConnected) {
            clearTallyInterval();
            return;
        }

        let curTotalFor = 0, curTotalAgainst = 0, curTotalBlank = 0;

        for (let i = 0; i < finalData.length; i++) {
            const d = finalData[i];
            const row = tallyEls.rows[i];
            curTotalFor += d.curFor;
            curTotalAgainst += d.curAgainst;
            curTotalBlank += d.curBlank;

            if (row.for) row.for.innerText = d.curFor;
            if (row.against) row.against.innerText = d.curAgainst;
            if (row.blank) row.blank.innerText = d.curBlank;
            if (row.barFor && d.totalSeats > 0) row.barFor.style.width = `${(d.curFor / d.totalSeats) * 100}%`;
            if (row.barAgainst && d.totalSeats > 0) row.barAgainst.style.width = `${(d.curAgainst / d.totalSeats) * 100}%`;
        }

        const curCounted = curTotalFor + curTotalAgainst + curTotalBlank;
        tallyEls.totFor.innerText = curTotalFor;
        tallyEls.totAgainst.innerText = curTotalAgainst;
        tallyEls.totBlank.innerText = curTotalBlank;
        tallyEls.totCounted.innerText = `${curCounted} / ${totalChamberSeats}`;

        tallyEls.labelFor.innerText = curTotalFor;
        tallyEls.labelAgainst.innerText = curTotalAgainst;

        tallyEls.tugFor.style.width = `${(curTotalFor / totalChamberSeats) * 100}%`;
        tallyEls.tugBlank.style.width = `${(curTotalBlank / totalChamberSeats) * 100}%`;
        tallyEls.tugAgainst.style.width = `${(curTotalAgainst / totalChamberSeats) * 100}%`;

        if (tallyEls.clock) {
            tallyEls.clock.innerText = formatFixedClock(clockTime);
        }

        if (curTotalFor === grandTotalFor && curTotalAgainst === grandTotalAgainst && curTotalBlank === grandTotalBlank) {
            finalizeElectionResult();
        }
    }

    function finalizeElectionResult() {
        if (electionFinished) return;
        electionFinished = true;
        clearTallyInterval();

        const speedCtrl = document.getElementById('speed-controls-container');
        if (speedCtrl) speedCtrl.style.display = 'none';
        const skipWrap = document.getElementById('skip-btn-wrap');
        if (skipWrap) skipWrap.style.display = 'none';

        unlockAchievement('complete_run');

        if (
            factions['pdip'] && factions['pdip'].affinity >= 60 &&
            factions['poros_tengah'] && factions['poros_tengah'].affinity >= 60 &&
            factions['golkar_akbar'] && factions['golkar_akbar'].affinity >= 60 &&
            factions['abri'] && factions['abri'].affinity >= 60
        ) {
            unlockAchievement('bhinneka_coalition');
        }

        if (
            bankBaliCleanSteps.defiedIMF &&
            activeDecrees['currency_board'] &&
            stats.econ >= 60
        ) {
            unlockAchievement('camdessus_arms');
        }

        const accepted = grandTotalFor > grandTotalAgainst;
        let resHTML = '';

        if (accepted) {
            unlockAchievement('win_any');
            if (selectedDifficulty === 'historical') unlockAchievement('win_historical');

            const hasIMFDurability = activeDecrees['imf_fuel_subsidy'] && activeDecrees['imf_bulog_deregulation'] && activeDecrees['imf_ibra_liquidation'];
            if (stats.intl >= 100 && stats.econ <= 15 && stats.pop <= 30 && hasIMFDurability) {
                unlockAchievement('bruning_impressed');
            }

            if (lowestGovStability < 35) unlockAchievement('mr_crack');
            if (completedInteractions['loyalist_bppt'] && completedInteractions['loyalist_n250']) unlockAchievement('cleared_for_takeoff');
            if (!window.wirantoLocked && activeDecrees['police_military_separation'] && activeDecrees['human_rights_commission_powers']) {
                unlockAchievement('dwifungsi_kaput');
            }
            if (timorPromiseSteps.countdown && timorPromiseSteps.votes && timorPromiseSteps.peacekeepers) {
                unlockAchievement('thankless_burden');
            }
            if (stats.cendana >= 85 && stats.ref <= 25) unlockAchievement('enak_jamanku');
            if (stats.PC === 0) unlockAchievement('fumes_in_the_tank');
            if (
                factions['poros_tengah'] && factions['poros_tengah'].affinity >= 85 &&
                factions['utusan_golongan'] && factions['utusan_golongan'].affinity >= 80 &&
                factions['other_parties'] && factions['other_parties'].affinity >= 80
            ) {
                unlockAchievement('habibi_ya_habibi');
            }

            if (stats.ref >= 85 && stats.cendana <= 25) {
                unlockAchievement('singa_reformasi');
            }
            if (activeDecrees['invoke_supersemar_ii'] && activeDecrees['cendana_restoration_pact']) {
                unlockAchievement('orba_jilid_dua');
            }

            let title = "HABIBIE HOLDS ON";
            let desc = "";

            if (grandTotalFor >= 450) {
                title = "OVERWHELMING VICTORY";
                desc = "An absolute landslide. Against all expectations, the MPR has embraced your Accountability Speech with a commanding majority, cementing your mandate through 2004.";
                unlockAchievement('win_overwhelming');
            } else if (grandTotalFor >= 380) {
                title = "COMFORTABLE MAJORITY";
                desc = "A comfortable victory. The MPR has accepted your Accountability Speech, securing your mandate with room to spare as your coalition holds firm.";
                unlockAchievement('win_comfortable');
            } else {
                title = "NARROW UPSET";
                desc = "A nail-biting upset in the dead of night. By the thinnest of margins, you have reversed the historical verdict of October 1999 and survived the General Session.";
                unlockAchievement('win_narrow');
            }

            const winImg = (gameConfig && gameConfig.victoryImage) ? gameConfig.victoryImage : 'photo/victory.png';
            resHTML += `<center><h1 style="color:#008000; margin-bottom: 5px;">${title} (${grandTotalFor} – ${grandTotalAgainst})</h1></center>
                <p align="center" style="font-family: MS Sans Serif; font-size: 13px; line-height: 1.5;">${desc}</p>
                <center><img src="${winImg}" style="width: 400px; height: 200px; object-fit: cover; border: 3px inset #FFFFFF; background-color: #A9A9A9; margin-top: 10px; margin-bottom: 15px;" alt="Victory"></center>`;
        } else {
            if (grandTotalFor >= 318 && grandTotalFor <= 326) {
                unlockAchievement('deja_vu_322');
            }
            if (
                factions['golkar_habibie'] && factions['golkar_habibie'].affinity >= 85 &&
                factions['golkar_akbar'] && factions['golkar_akbar'].affinity < 35
            ) {
                unlockAchievement('et_tu_akbar');
            }
            if (helpedRaisSpeaker && factions['poros_tengah'] && factions['poros_tengah'].affinity >= 65) {
                unlockAchievement('gus_dur_twist');
            }

            let title = "MPR REJECTS ACCOUNTABILITY SPEECH";
            let desc = "";

            if (grandTotalFor >= 320) {
                title = "NARROWLY DEFEATED";
                desc = "A razor-thin loss echoing the real history of October 20, 1999. Betrayed behind the secret-ballot curtain by last-minute defections, your Accountability Speech falls just short, prompting you to withdraw your presidential candidacy before dawn.";
                unlockAchievement('lose_narrow');
            } else if (grandTotalFor >= 200) {
                title = "DECISIVE DEFEAT";
                desc = "A decisive rejection. The MPR has formally voted down your Accountability Speech, ending your seventeen-month caretaker presidency.";
                unlockAchievement('lose_decisive');
            } else {
                title = "A RESOUNDING 'NO'";
                desc = "A historic repudiation. United across ideological lines, the MPR has resoundingly rejected your Accountability Speech in an overwhelming landslide.";
                unlockAchievement('lose_overwhelming');
            }

            const loseImg = (gameConfig && gameConfig.defeatImage) ? gameConfig.defeatImage : 'photo/defeat.png';
            resHTML += `<center><h1 style="color:#FF0000; margin-bottom: 5px;">${title} (${grandTotalFor} – ${grandTotalAgainst})</h1></center>
                <p align="center" style="font-family: MS Sans Serif; font-size: 13px; line-height: 1.5;">${desc}</p>
                <center><img src="${loseImg}" style="width: 400px; height: 200px; object-fit: cover; border: 3px inset #FFFFFF; background-color: #A9A9A9; margin-top: 10px; margin-bottom: 15px;" alt="Defeat"></center>`;
        }

        // Append the official English translation of TAP MPR No. III/MPR/1999
        resHTML += buildTapMprDocumentHTML(accepted, grandTotalFor, grandTotalAgainst, grandTotalBlank);

        window.lastElectionSummary = {
            won: accepted,
            forVotes: grandTotalFor,
            againstVotes: grandTotalAgainst,
            blankVotes: grandTotalBlank,
            totalSeats: totalChamberSeats,
            factionBreakdown: finalData.map(d => ({
                key: d.key,
                name: d.name,
                short: d.short,
                seats: d.totalSeats,
                forVotes: d.targetFor,
                againstVotes: d.targetAgainst,
                blankVotes: d.targetBlank
            })),
            verdictHTML: resHTML
        };

        resHTML += getPostElectionNavHTML('verdict');
        const resContainer = document.getElementById('election-result-container');
        if (resContainer) resContainer.innerHTML = resHTML;
    }

    window.skipTally = function() {
        clearTallyInterval();
        for (let i = 0; i < finalData.length; i++) {
            const d = finalData[i];
            const remFor = d.targetFor - d.curFor;
            const remAgainst = d.targetAgainst - d.curAgainst;
            const remBlank = d.targetBlank - d.curBlank;

            const outcomes = [];
            for (let f = 0; f < remFor; f++) outcomes.push('for');
            for (let a = 0; a < remAgainst; a++) outcomes.push('against');
            for (let b = 0; b < remBlank; b++) outcomes.push('blank');

            // Shuffle remaining outcomes so skipped seats also light up randomly across the bloc
            for (let j = outcomes.length - 1; j > 0; j--) {
                const r = Math.floor(Math.random() * (j + 1));
                const tmp = outcomes[j];
                outcomes[j] = outcomes[r];
                outcomes[r] = tmp;
            }

            for (let k = 0; k < outcomes.length; k++) {
                const seatIdx = d.seatPool.pop();
                const dot = seatDots[seatIdx];
                if (!dot) continue;
                if (outcomes[k] === 'for') dot.className = 'mpr-seat-dot seat-for';
                else if (outcomes[k] === 'against') dot.className = 'mpr-seat-dot seat-against';
                else dot.className = 'mpr-seat-dot seat-blank';
            }

            d.curFor = d.targetFor;
            d.curAgainst = d.targetAgainst;
            d.curBlank = d.targetBlank;
        }
        clockTime = new Date("1999-10-20T00:53:00");
        updateTallyDOM();
    };

    window.activeTallyInterval = setInterval(() => {
        for (let step = 0; step < window.tallySpeed; step++) {
            const available = [];
            for (let i = 0; i < finalData.length; i++) {
                if (finalData[i].curFor < finalData[i].targetFor) available.push({ idx: i, type: 'for' });
                if (finalData[i].curAgainst < finalData[i].targetAgainst) available.push({ idx: i, type: 'against' });
                if (finalData[i].curBlank < finalData[i].targetBlank) available.push({ idx: i, type: 'blank' });
            }
            if (available.length === 0) {
                clearTallyInterval();
                updateTallyDOM();
                return;
            }

            const pick = available[Math.floor(Math.random() * available.length)];
            const facData = finalData[pick.idx];
            // Pop a random seat index from this faction's shuffled pool so seats light up unpredictably
            const randomSeatIdx = facData.seatPool.pop();
            const dot = seatDots[randomSeatIdx];

            if (pick.type === 'for') {
                facData.curFor++;
                if (dot) dot.className = 'mpr-seat-dot seat-for';
            } else if (pick.type === 'against') {
                facData.curAgainst++;
                if (dot) dot.className = 'mpr-seat-dot seat-against';
            } else {
                facData.curBlank++;
                if (dot) dot.className = 'mpr-seat-dot seat-blank';
            }

            clockTime.setSeconds(clockTime.getSeconds() + 22);
        }

        if (!electionFinished) {
            updateTallyDOM();
        }
    }, 120);
}

// ==========================================================================
// POST-ELECTION VERDICT & STATE OF THE REPUBLIC DOSSIER
// ==========================================================================
function getPostElectionNavHTML(activeView) {
    const isVerdict = activeView === 'verdict';
    const isDossier = activeView === 'dossier';

    return `<div style="margin-top: 14px; padding-top: 12px; border-top: 2px solid #808080; text-align: center;">
        <button class="${isVerdict ? 'is-selected' : ''}" style="width: 220px; display: inline-block; text-align: center; margin: 4px;" onclick="showPostElectionSection('verdict')">Verdict &amp; Decree</button>
        <button class="${isDossier ? 'is-selected' : ''}" style="width: 230px; display: inline-block; text-align: center; margin: 4px;" onclick="showPostElectionSection('dossier')">State of the Republic</button>
        <br>
        <button style="width: 250px; display: inline-block; text-align: center; margin-top: 10px; background-color: #d0e8d0;" onclick="returnToTitleScreen()">Return to Title Screen</button>
    </div>`;
}

window.showPostElectionSection = function(section) {
    const container = document.getElementById('election-result-container');
    if (!container || !window.lastElectionSummary) return;

    if (section === 'verdict') {
        container.innerHTML = window.lastElectionSummary.verdictHTML + getPostElectionNavHTML('verdict');
    } else if (section === 'dossier') {
        container.innerHTML = buildStateOfTheRepublicHTML() + getPostElectionNavHTML('dossier');
    }

    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function buildStateOfTheRepublicHTML() {
    const sum = window.lastElectionSummary;
    const diffName = (gameConfig.difficultySettings[selectedDifficulty] && gameConfig.difficultySettings[selectedDifficulty].name)
        ? gameConfig.difficultySettings[selectedDifficulty].name
        : selectedDifficulty.toUpperCase();

    const metricKeys = [
        { k: 'pop', label: 'Popularity' },
        { k: 'mil', label: 'Military Support' },
        { k: 'ref', label: 'Reformasi Credibility' },
        { k: 'econ', label: 'Economic Health' },
        { k: 'intl', label: 'International Standing' },
        { k: 'stab', label: 'National Stability' },
        { k: 'cendana', label: 'Cendana Influence' }
    ];

    let metricsGridHTML = `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 6px; margin-bottom: 14px;">`;
    metricKeys.forEach(m => {
        metricsGridHTML += `<div class="stat-row" style="margin-bottom: 0; padding: 5px 8px;">
            <span class="stat-label">${m.label}:</span>
            <span class="stat-value">${getVagueStatText(m.k, stats[m.k])}</span>
        </div>`;
    });
    metricsGridHTML += `<div class="stat-row" style="margin-bottom: 0; padding: 5px 8px;">
        <span class="stat-label">Gov. Stability:</span>
        <span class="stat-value"><b>${getGovStabilityWord()}</b></span>
    </div></div>`;

    const enactedBadges = [];
    if (actionsData && Array.isArray(actionsData.decrees)) {
        actionsData.decrees.forEach(dec => {
            if (activeDecrees[dec.id]) {
                enactedBadges.push(`<span style="display: inline-block; background-color: #FFFFFF; padding: 3px 8px; margin: 2px 4px 2px 0; font-size: 11px; font-weight: bold; color: #000080; box-shadow: var(--bevel-status-well);">&#10003; ${dec.text}</span>`);
            }
        });
    }

    const dissolvedNames = [];
    INITIAL_PORTRAIT_FACTIONS.forEach(fk => {
        if (bannedFactions[fk] && initialFactionsSnapshot[fk]) {
            dissolvedNames.push(`<b>${stripLeaderParentheses(initialFactionsSnapshot[fk].name)}</b>`);
        }
    });

    const unlockedObjs = ACHIEVEMENTS.filter(a => unlockedAchievements.includes(a.id));
    let achvSummaryHTML = '';
    if (unlockedObjs.length > 0) {
        achvSummaryHTML = unlockedObjs.map(a =>
            `<span style="display: inline-flex; align-items: center; background-color: #C0C0C0; box-shadow: var(--bevel-raised); padding: 3px 7px; margin: 2px; font-size: 11px;">
                <img src="${a.icon}" style="width: 16px; height: 16px; margin-right: 5px; object-fit: cover;">
                <b>${a.title}</b>
            </span>`
        ).join('');
    } else {
        achvSummaryHTML = `<i>No achievements unlocked yet.</i>`;
    }

    return `<div style="text-align: left; margin-top: 10px;">
        <h2>STATE OF THE REPUBLIC</h2>

        <div style="background-color: #DFDFDF; box-shadow: var(--bevel-sunken); padding: 10px 12px; margin-bottom: 12px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px; border-bottom: 1px solid #808080; padding-bottom: 6px; margin-bottom: 8px;">
                <span><b>ADMINISTRATION:</b> Pres. B.J. Habibie (1998&ndash;1999)</span>
                <span><b>DIFFICULTY:</b> ${diffName}</span>
                <span><b>FINAL PC RESERVE:</b> ${stats.PC} PC</span>
            </div>
            <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                <span><b>MPR VERDICT:</b> <font color="${sum.won ? '#006400' : '#8B0000'}"><b>${sum.won ? 'ACCOUNTABILITY SPEECH ACCEPTED' : 'ACCOUNTABILITY SPEECH REJECTED'}</b></font></span>
                <span><b>FINAL TALLY:</b> <font color="#006400"><b>${sum.forVotes} Accept</b></font> &ndash; <font color="#8B0000"><b>${sum.againstVotes} Reject</b></font> (${sum.blankVotes} Blank)</span>
            </div>
        </div>

        <h3 style="font-size: 13px; margin-bottom: 6px;">Seven Pillars of State (Final Assessment)</h3>
        ${metricsGridHTML}

        <h3 style="font-size: 13px; margin-bottom: 6px;">Lembaran Negara</h3>
        <div class="state-gazette-box" style="margin-bottom: 12px;">
            ${enactedBadges.length > 0 ? enactedBadges.join('') : '<span style="font-size: 11px; color: #555; font-style: italic;">No extraordinary decrees were enacted during this administration.</span>'}
            ${dissolvedNames.length > 0 ? `<div style="margin-top: 6px; padding-top: 5px; border-top: 1px dotted #808080; font-size: 11px; color: #8B0000;"><b>Dissolved Parliamentary Blocs:</b> ${dissolvedNames.join(', ')}</div>` : ''}
        </div>

        <h3 style="font-size: 13px; margin-bottom: 6px;">Commendations &amp; Historical Milestones (${unlockedObjs.length} / ${ACHIEVEMENTS.length})</h3>
        <div style="background-color: #DFDFDF; box-shadow: var(--bevel-sunken); padding: 8px; margin-bottom: 6px;">
            ${achvSummaryHTML}
        </div>
    </div>`;
}