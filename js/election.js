// election.js: October 19-20, 1999 MPR roll call, hemicycle, TAP MPR No. III/MPR/1999 text and the post-election verdict.

// Stop the running vote-tally animation timer
function clearTallyInterval() {
    if (window.activeTallyInterval) {
        clearInterval(window.activeTallyInterval);
        window.activeTallyInterval = null;
    }
}

// Set the tally animation speed and redraw the speed buttons
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

// Run the MPR roll call: build the chamber, animate the tally and show the verdict
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

    // Give each faction a contiguous seat block, then shuffle its seat indices so votes light up randomly
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
                <center><img src="${winImg}" class="content-image" style="width: 400px; height: 200px; object-fit: cover; border: 3px inset #FFFFFF; background-color: #A9A9A9; margin-top: 10px; margin-bottom: 15px;" alt="Victory"></center>`;
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
                <center><img src="${loseImg}" class="content-image" style="width: 400px; height: 200px; object-fit: cover; border: 3px inset #FFFFFF; background-color: #A9A9A9; margin-top: 10px; margin-bottom: 15px;" alt="Defeat"></center>`;
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

// POST-ELECTION VERDICT & STATE OF THE REPUBLIC DOSSIER
function getPostElectionNavHTML(activeView) {
    const isVerdict = activeView === 'verdict';
    const isDossier = activeView === 'dossier';

    return `<div style="margin-top: 14px; padding-top: 12px; border-top: 2px solid #808080; text-align: center;">
        <button class="${isVerdict ? 'is-selected' : ''}" style="width: 220px; display: inline-block; text-align: center; margin: 4px;" onclick="showPostElectionSection('verdict')">Verdict &amp; Decree</button>
        <button class="${isDossier ? 'is-selected' : ''}" style="width: 230px; display: inline-block; text-align: center; margin: 4px;" onclick="showPostElectionSection('dossier')">State of the Republic</button>
        <br>
        <button style="width: 250px; display: inline-block; text-align: center; margin-top: 10px; background-color: #d0e8d0;" onclick="showEpilogue()">Continue</button>
    </div>`;
}

// Show the chosen section of the post-election screen
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

// Seat colors for the State of the Republic image (match the .seat-* classes in styles.css)
const STATE_SEAT_PALETTE = {
    'for':     { fill: '#00CC00', light: '#88FF88' },
    'against': { fill: '#FF2222', light: '#FF9999' },
    'blank':   { fill: '#AAAAAA', light: '#DDDDDD' }
};

// Image used as the President's portrait on the State of the Republic card
function getPresidentPortraitSrc() {
    return (gameConfig && gameConfig.stateOfRepublicPortrait) || 'photo/habibi.png';
}

// Short display label for a faction (distinguishes the two Golkar wings)
function getStateFactionLabel(f) {
    const col = (typeof FACTION_HISTORICAL_COLORS !== 'undefined') ? FACTION_HISTORICAL_COLORS[f.key] : null;
    return (col && col.label) || f.short || f.name;
}

// Seat outcomes from left to right: all FOR seats on the left, blanks in the middle, all AGAINST seats on the right
function getStateSeatOutcomes(sum) {
    const total = Math.max(1, sum.totalSeats);
    const nFor = Math.min(sum.forVotes, total);
    const nAgainst = Math.min(sum.againstVotes, total - nFor);
    const nBlank = total - nFor - nAgainst;
    return [].concat(Array(nFor).fill('for'), Array(nBlank).fill('blank'), Array(nAgainst).fill('against'));
}

// Every faction with at least one FOR vote, and every faction with at least one AGAINST vote (so splits and defectors show on both sides)
function getStateFactionVoteLists(sum) {
    const rows = sum.factionBreakdown.filter(f => f.seats > 0);
    const build = (kind) => rows
        .filter(f => (kind === 'for' ? f.forVotes : f.againstVotes) > 0)
        .map(f => {
            const mine = kind === 'for' ? f.forVotes : f.againstVotes;
            const other = kind === 'for' ? f.againstVotes : f.forVotes;
            return { f, n: mine, minority: mine < other };
        })
        .sort((a, b) => b.n - a.n);
    return { forList: build('for'), againstList: build('against') };
}

// One faction row of the card, built from the stat-row classes in styles.css
function buildStateFactionRowHTML(entry, kind) {
    const { f, n, minority } = entry;
    const col = (typeof FACTION_HISTORICAL_COLORS !== 'undefined') ? FACTION_HISTORICAL_COLORS[f.key] : null;
    const tone = kind === 'for' ? 'var(--tone-good)' : 'var(--tone-bad)';
    return `<div class="stat-row">
        <span class="stat-label"><span style="display: inline-block; width: 10px; height: 10px; margin-right: 5px; vertical-align: middle; background-color: ${col ? col.fill : '#808080'}; box-shadow: var(--bevel-status-well);"></span>${getStateFactionLabel(f)}${minority ? ' <span style="font-weight: normal; font-style: italic; color: var(--win95-text-dim);">(defectors)</span>' : ''}</span>
        <span class="stat-value" style="color: ${tone};">${n} ${kind} <span style="font-weight: normal; color: var(--win95-text-dim);">of ${f.seats}</span></span>
    </div>`;
}

// The shareable State of the Republic card: portrait, verdict, split hemicycle and the factions' votes
function buildStateCardHTML(sum) {
    const { forList, againstList } = getStateFactionVoteLists(sum);
    const total = Math.max(1, sum.totalSeats);
    const pct = n => (n / total * 100).toFixed(2);
    const verdictColor = sum.won ? 'var(--tone-good)' : 'var(--tone-bad)';
    const coords = generateHemicycleLayout(sum.totalSeats);
    const outcomes = getStateSeatOutcomes(sum);

    let dots = '';
    coords.forEach((pt, i) => {
        dots += `<div class="mpr-seat-dot seat-${outcomes[i]}" style="left: ${pt.x.toFixed(2)}%; top: ${pt.y.toFixed(2)}%;"></div>`;
    });

    const column = (title, kind, list) => `<div>
        <div class="music-header">${title} (${kind === 'for' ? sum.forVotes : sum.againstVotes})</div>
        <div class="state-gazette-box">
            ${list.length > 0 ? list.map(e => buildStateFactionRowHTML(e, kind)).join('') : '<span style="font-size: 11px; font-style: italic; color: var(--win95-text-dim);">No delegates voted this way.</span>'}
        </div>
    </div>`;

    return `<div id="state-card" class="tally-box">
        <div class="music-header">STATE OF THE REPUBLIC</div>
        <div style="display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-start;">
            <div style="flex: 0 0 auto; margin: 0 auto; text-align: center;">
                <div class="player-portrait-container" style="cursor: default;">
                    <span style="color: #555;">[ PHOTO:<br>HABIBIE ]</span>
                    <img src="${escapeAttr(getPresidentPortraitSrc())}" class="portrait-img" alt="[HABIBIE]" onerror="this.style.display='none'">
                </div>
                <div style="font-size: 13px; font-weight: bold;">His Excellency</div>
                <div style="font-size: 13px; font-weight: bold;">Bacharuddin Jusuf Habibie<br><span style="font-size: 11px; font-weight: normal; color: var(--win95-text-dim);">3rd President of the Republic of Indonesia</span></div>
            </div>
            <div style="flex: 1 1 320px; min-width: 0;">
                <div class="faction-summary" style="text-align: center; margin-bottom: 8px; padding: 8px;">
                    <div style="font-size: 16px; font-weight: bold; color: ${verdictColor};">ACCOUNTABILITY SPEECH ${sum.won ? 'ACCEPTED' : 'REJECTED'}</div>
                    <div style="font-size: 13px; font-weight: bold; margin-top: 2px;"><span style="color: var(--tone-good);">${sum.forVotes} FOR</span> &middot; <span style="color: var(--tone-bad);">${sum.againstVotes} AGAINST</span> &middot; <span style="color: var(--win95-text-dim);">${sum.blankVotes} BLANK</span></div>
                </div>
                <div class="mpr-tug-container">
                    <div class="mpr-tug-for" style="width: ${pct(sum.forVotes)}%;"></div>
                    <div class="mpr-tug-blank" style="width: ${pct(sum.blankVotes)}%;"></div>
                    <div class="mpr-tug-against" style="width: ${pct(sum.againstVotes)}%;"></div>
                    <div class="mpr-majority-marker" title="Majority Threshold"></div>
                </div>
                <div class="mpr-hemicycle-wrap">
                    ${dots}
                    <div style="position: absolute; left: 50%; bottom: 30px; transform: translateX(-50%); text-align: center; font-weight: bold; font-size: 20px; line-height: 1.1; white-space: nowrap;">${sum.forVotes} &ndash; ${sum.againstVotes}</div>
                    <div class="mpr-rostrum">MPR ROSTRUM</div>
                </div>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px; margin-top: 14px;">
            ${column('VOTED FOR', 'for', forList)}
            ${column('VOTED AGAINST', 'against', againstList)}
        </div>
    </div>
    <div style="text-align: center; margin-bottom: 14px;">
        <button style="width: 240px; display: inline-block; text-align: center;" onclick="downloadStateOfRepublicImage()">Download Results</button>
    </div>`;
}

// Load an image, resolving to null if it cannot be loaded
function loadStateImage(src) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

// Parse a CSS color (#rgb, #rrggbb or rgb()) into [r, g, b]
function parseStateColor(c) {
    const s = String(c || '').trim();
    if (s[0] === '#') {
        const h = s.length === 4 ? s.slice(1).split('').map(x => x + x).join('') : s.slice(1, 7);
        return [parseInt(h.slice(0, 2), 16) || 0, parseInt(h.slice(2, 4), 16) || 0, parseInt(h.slice(4, 6), 16) || 0];
    }
    const m = s.match(/\d+(\.\d+)?/g);
    return m && m.length >= 3 ? [Math.round(m[0]), Math.round(m[1]), Math.round(m[2])] : [0, 0, 0];
}

// Mix two colors; t is the share of the first color
function mixStateColor(a, b, t) {
    const x = parseStateColor(a), y = parseStateColor(b);
    return 'rgb(' + [0, 1, 2].map(i => Math.round(x[i] * t + y[i] * (1 - t))).join(',') + ')';
}

// Read the active window style and color scheme from the page so the image matches the chosen theme
function getStateTheme() {
    const hasCs = (typeof getComputedStyle === 'function');
    const cs = hasCs ? getComputedStyle(document.documentElement) : null;
    const v = (name, fallback) => ((cs && cs.getPropertyValue(name).trim()) || fallback);
    const wstyle = (document.documentElement && document.documentElement.getAttribute && document.documentElement.getAttribute('data-wstyle')) || 'default';
    let desktop = '#008080';
    if (hasCs && document.body) {
        const bg = getComputedStyle(document.body).backgroundColor;
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') desktop = bg;
    }
    const T = {
        wstyle, desktop,
        bg: v('--win95-bg', '#C0C0C0'), surface: v('--win95-surface', '#DFDFDF'), white: v('--win95-white', '#FFFFFF'),
        shadow: v('--win95-shadow', '#808080'), dark: v('--win95-dark', '#000000'), navy: v('--win95-navy', '#000080'),
        blue: v('--win95-blue-grad', '#1084D0'), well: v('--win95-well', '#F5F5F5'), wellAlt: v('--win95-well-alt', '#E0DFE3'),
        text: v('--win95-text', '#000000'), dim: v('--win95-text-dim', '#555555'), accent: v('--win95-accent', '#000080'),
        good: v('--tone-good', '#006400'), bad: v('--tone-bad', '#8B0000')
    };
    const hexes = v('--win98-title-inactive', '').match(/#[0-9a-fA-F]{3,8}/g);
    T.inactive = (hexes && hexes.length >= 2) ? [hexes[0], hexes[1]] : [mixStateColor(T.shadow, '#000000', 0.62), T.bg];
    return T;
}

// Draw the State of the Republic card as a 1920x1400 image in the active window style (Windows 95, Windows 98 or Mac OS 8)
function drawStateOfRepublicCanvas(sum, portraitImg, iconImg) {
    const S = 2, LW = 960, LH = 700;
    const canvas = document.createElement('canvas');
    canvas.width = LW * S;
    canvas.height = LH * S;
    const g = canvas.getContext('2d');
    g.scale(S, S);
    const T = getStateTheme();
    const MAC = T.wstyle === 'macos8';
    const W98 = T.wstyle === 'win98';
    const FONT = MAC
        ? '"Charcoal", "Chicago", "Geneva", "Lucida Grande", "Helvetica Neue", Helvetica, Arial, sans-serif'
        : '"MS Sans Serif", Tahoma, Geneva, sans-serif';
    const font = (size, bold, italic) => `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${size}px ${FONT}`;
    const rect = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
    const bevel = (x, y, w, h, layers) => {
        layers.forEach((l, i) => {
            rect(x + i, y + i, w - 2 * i, 1, l[0]);
            rect(x + i, y + i, 1, h - 2 * i, l[0]);
            rect(x + i, y + h - 1 - i, w - 2 * i, 1, l[1]);
            rect(x + w - 1 - i, y + i, 1, h - 2 * i, l[1]);
        });
    };
    // Bevel recipes copied from --bevel-* in styles.css (Win95), the Windows 98 layer and the Mac OS 8 layer
    const STYLE = MAC ? {
        raised: { outline: '#000000', layers: [['#FFFFFF', '#888888'], ['#F0F0F0', '#BBBBBB']] },
        sunken: { outline: '#555555', layers: [['#777777', '#FFFFFF']] },
        status: { outline: null, layers: [['#888888', '#FFFFFF']] },
        window: { outline: '#000000', layers: [['#FFFFFF', '#888888']] }
    } : {
        raised: { outline: null, layers: [[T.white, T.dark], [T.surface, T.shadow]] },
        sunken: { outline: null, layers: [[T.shadow, T.white], [T.dark, T.surface]] },
        status: { outline: null, layers: [[T.shadow, T.white]] },
        window: { outline: null, layers: W98 ? [[T.surface, '#0A0A0A'], [T.white, T.shadow]] : [[T.surface, T.dark], [T.white, T.shadow]] }
    };
    const panel = (x, y, w, h, fill, kind) => {
        const st = STYLE[kind];
        if (st.outline) rect(x - 1, y - 1, w + 2, h + 2, st.outline);
        rect(x, y, w, h, fill);
        bevel(x, y, w, h, st.layers);
    };
    const text = (str, x, y, size, bold, color, align, italic) => {
        g.font = font(size, bold, italic);
        g.textAlign = align || 'left';
        g.fillStyle = color;
        g.fillText(str, x, y);
    };
    const gradient = (x, w, c1, c2) => {
        const grad = g.createLinearGradient(x, 0, x + w, 0);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
        return grad;
    };

    // Secondary caption bar (the card and list headers): active in Win95, grey "inactive" in Win98 and Mac OS 8
    const header = (x, y, w, label) => {
        if (MAC) {
            rect(x, y, w, 18, '#DDDDDD');
            rect(x, y + 17, w, 1, '#888888');
            text(label, x + w / 2, y + 12, 11, true, '#6E6E6E', 'center');
        } else if (W98) {
            rect(x, y, w, 18, gradient(x, w, T.inactive[0], T.inactive[1]));
            text(label, x + 6, y + 12, 11, true, '#F4F1EA');
        } else {
            rect(x, y, w, 18, gradient(x, w, T.navy, T.blue));
            text(label, x + 7, y + 13, 11, true, '#000000');
            text(label, x + 6, y + 12, 11, true, '#FFFFFF');
        }
    };

    // Desktop and main window
    rect(0, 0, LW, LH, T.desktop);
    if (MAC) {
        rect(12, 12, 942, 682, 'rgba(0,0,0,0.55)');
    } else if (!W98) {
        rect(14, 14, 940, 680, 'rgba(0,0,0,0.45)');
    }
    panel(10, 10, 940, 680, T.bg, 'window');

    // Main window title bar, with its own close controls (the only close marks in the image)
    if (MAC) {
        for (let y = 16; y < 36; y++) rect(16, y, 928, 1, (y - 16) % 2 === 0 ? '#FFFFFF' : '#B9B9B9');
        rect(16, 36, 928, 1, '#000000');
        g.font = font(12, true);
        const capW = g.measureText('Twilight of the Banyan Tree').width + 16;
        rect(480 - capW / 2, 19, capW, 14, '#DDDDDD');
        text('Twilight of the Banyan Tree', 480, 30, 12, true, '#000000', 'center');
        const box = (bx) => {
            rect(bx, 19, 13, 13, '#000000');
            rect(bx + 1, 20, 11, 11, '#DDDDDD');
            rect(bx + 1, 20, 11, 1, '#FFFFFF');
            rect(bx + 1, 20, 1, 11, '#FFFFFF');
            rect(bx + 11, 20, 1, 11, '#888888');
            rect(bx + 1, 30, 11, 1, '#888888');
        };
        box(24);
        box(907);
        rect(911, 23, 5, 5, '#000000');
        rect(912, 24, 3, 3, '#DDDDDD');
        box(923);
        rect(926, 25, 8, 1, '#000000');
    } else if (W98) {
        rect(16, 17, 928, 18, gradient(16, 928, T.navy, T.blue));
        if (iconImg) g.drawImage(iconImg, 19, 18, 16, 16);
        text('Twilight of the Banyan Tree', 40, 30, 12, true, '#FFFFFF');
        const btn = (bx) => panel(bx, 19, 16, 14, T.bg, 'raised');
        btn(886); btn(902); btn(920);
        rect(890, 28, 6, 2, '#000000');
        rect(906.5, 22.5, 8, 8, 'rgba(0,0,0,0)');
        g.strokeStyle = '#000000';
        g.lineWidth = 1;
        g.strokeRect(906.5, 22.5, 7, 7);
        rect(906, 22, 8, 2, '#000000');
        g.lineWidth = 1.7;
        g.beginPath();
        g.moveTo(924, 23); g.lineTo(931, 30);
        g.moveTo(931, 23); g.lineTo(924, 30);
        g.stroke();
    } else {
        rect(16, 16, 928, 22, gradient(16, 928, T.navy, T.blue));
        text('Twilight of the Banyan Tree', 25, 32, 12, true, '#000000');
        text('Twilight of the Banyan Tree', 24, 31, 12, true, '#FFFFFF');
        panel(924, 19, 16, 14, T.bg, 'raised');
        text('\u2715', 932, 30, 10, true, T.text, 'center');
    }

    // Card
    panel(22, 46, 916, 632, T.bg, 'raised');
    header(34, 58, 892, 'STATE OF THE REPUBLIC');

    // Portrait
    rect(39, 88, 160, 200, '#A9A9A9');
    g.save();
    g.beginPath();
    g.rect(43, 92, 152, 192);
    g.clip();
    if (portraitImg) {
        const s = Math.max(152 / portraitImg.width, 192 / portraitImg.height);
        const dw = portraitImg.width * s, dh = portraitImg.height * s;
        g.drawImage(portraitImg, 43 + (152 - dw) / 2, 92 + (192 - dh) / 2, dw, dh);
    } else {
        text('[ PHOTO:', 119, 186, 10, false, '#555555', 'center');
        text('HABIBIE ]', 119, 200, 10, false, '#555555', 'center');
    }
    g.restore();
    rect(39, 88, 160, 4, '#808080');
    rect(39, 88, 4, 200, '#808080');
    rect(39, 284, 160, 4, '#FFFFFF');
    rect(195, 88, 4, 200, '#FFFFFF');
    text('His Excellency', 119, 306, 12, true, T.text, 'center');
    text('Bacharuddin Jusuf Habibie', 119, 321, 12, true, T.text, 'center');
    text('3rd President of the', 119, 335, 9.5, false, T.dim, 'center');
    text('Republic of Indonesia', 119, 347, 9.5, false, T.dim, 'center');

    // Verdict
    const RX = 218, RW = 708;
    panel(RX, 88, RW, 66, T.well, 'sunken');
    text('ACCOUNTABILITY SPEECH ' + (sum.won ? 'ACCEPTED' : 'REJECTED'), RX + RW / 2, 111, 17, true, sum.won ? T.good : T.bad, 'center');
    const segs = [[`${sum.forVotes} FOR`, T.good], [`${sum.againstVotes} AGAINST`, T.bad], [`${sum.blankVotes} BLANK`, T.dim]];
    g.font = font(12, true);
    const sep = '  \u00B7  ';
    const widths = segs.map(s => g.measureText(s[0]).width);
    const sepW = g.measureText(sep).width;
    let cx = RX + RW / 2 - (widths.reduce((a, b) => a + b, 0) + sepW * (segs.length - 1)) / 2;
    segs.forEach((s, i) => {
        text(s[0], cx, 129, 12, true, s[1]);
        cx += widths[i];
        if (i < segs.length - 1) { text(sep, cx, 129, 12, true, T.text); cx += sepW; }
    });
    const diff = (gameConfig && gameConfig.difficultySettings && gameConfig.difficultySettings[selectedDifficulty] && gameConfig.difficultySettings[selectedDifficulty].name)
        ? gameConfig.difficultySettings[selectedDifficulty].name : String(selectedDifficulty).toUpperCase();
    text(`Difficulty: ${diff}  \u00B7  Final PC reserve: ${stats.PC}`, RX + RW / 2, 145, 9.5, false, T.dim, 'center');

    // Tug bar
    const total = Math.max(1, sum.totalSeats);
    panel(RX, 162, RW, 26, T.shadow, 'sunken');
    const bx = RX + 2, bw = RW - 4, by = 164, bh = 22;
    const stripes = (x, w, c1, c2) => {
        for (let p = 0; p < w; p += 10) {
            rect(x + p, by, Math.min(8, w - p), bh, c1);
            if (w - p > 8) rect(x + p + 8, by, Math.min(2, w - p - 8), bh, c2);
        }
    };
    const wFor = bw * sum.forVotes / total, wBlank = bw * sum.blankVotes / total, wAgainst = bw * sum.againstVotes / total;
    stripes(bx, wFor, '#008000', '#006400');
    rect(bx + wFor, by, wBlank, bh, '#A9A9A9');
    stripes(bx + bw - wAgainst, wAgainst, '#CC0000', '#8B0000');
    rect(bx + bw * 0.5014 - 1, by, 2, bh, '#FFFF00');

    // Hemicycle: FOR seats on the left, AGAINST seats on the right
    const HX = RX, HY = 196, HW = 450, HH = 212;
    panel(HX, HY, HW, HH, T.wellAlt, 'sunken');
    const coords = generateHemicycleLayout(sum.totalSeats);
    const outcomes = getStateSeatOutcomes(sum);
    coords.forEach((pt, i) => {
        const pal = STATE_SEAT_PALETTE[outcomes[i]];
        const sx = Math.round(HX + pt.x / 100 * HW - 3), sy = Math.round(HY + pt.y / 100 * HH - 3);
        rect(sx, sy, 6, 6, pal.fill);
        rect(sx, sy, 6, 1, pal.light);
        rect(sx, sy, 1, 6, pal.light);
        rect(sx, sy + 5, 6, 1, '#222222');
        rect(sx + 5, sy, 1, 6, '#222222');
    });
    text(`${sum.forVotes} \u2013 ${sum.againstVotes}`, HX + HW / 2, HY + HH - 36, 22, true, T.text, 'center');
    panel(HX + HW / 2 - 42, HY + HH - 24, 84, 16, T.bg, 'raised');
    text('MPR ROSTRUM', HX + HW / 2, HY + HH - 12, 8.5, true, MAC ? T.navy : T.accent, 'center');

    // Totals
    [['FOR', sum.forVotes, 'for', T.good], ['AGAINST', sum.againstVotes, 'against', T.bad], ['BLANK', sum.blankVotes, 'blank', T.dim]].forEach((t, i) => {
        const y = HY + i * 72;
        panel(HX + HW + 14, y, RW - HW - 14, 64, T.well, 'sunken');
        rect(HX + HW + 18, y + 4, 6, 56, STATE_SEAT_PALETTE[t[2]].fill);
        text(String(t[1]), HX + HW + 36, y + 36, 28, true, t[3]);
        text(t[0], HX + HW + 36, y + 54, 12, true, T.text);
    });

    // Faction lists: every faction with at least one vote on that side, defectors included
    const { forList, againstList } = getStateFactionVoteLists(sum);
    const drawList = (x, title, kind, list, count) => {
        const w = 436, y = 420, boxY = y + 22, boxH = 228;
        header(x, y, w, `${title} (${count})`);
        panel(x, boxY, w, boxH, T.surface, 'sunken');
        if (list.length === 0) {
            text('No delegates voted this way.', x + 12, boxY + 24, 11, false, T.dim, 'left', true);
            return;
        }
        const rowH = Math.min(21, (boxH - 16) / list.length);
        const tone = kind === 'for' ? T.good : T.bad;
        list.forEach((e, i) => {
            const ry = boxY + 8 + i * rowH;
            const h = rowH - 3;
            const f = e.f;
            const col = (typeof FACTION_HISTORICAL_COLORS !== 'undefined') ? FACTION_HISTORICAL_COLORS[f.key] : null;
            panel(x + 8, ry, w - 16, h, T.surface, 'status');
            const my = ry + h / 2;
            rect(x + 14, my - 5, 10, 10, col ? col.fill : '#808080');
            bevel(x + 14, my - 5, 10, 10, STYLE.status.layers);
            const label = getStateFactionLabel(f);
            text(label, x + 30, my + 4, 11, true, T.text);
            if (e.minority) {
                g.font = font(11, true);
                text('(defectors)', x + 30 + g.measureText(label + ' ').width, my + 4, 10, false, T.dim, 'left', true);
            }
            const ofTxt = ` of ${f.seats}`;
            text(ofTxt, x + w - 14, my + 4, 11, false, T.dim, 'right');
            g.font = font(11, false);
            const ofW = g.measureText(ofTxt).width;
            text(`${e.n} ${kind}`, x + w - 14 - ofW, my + 4, 11, true, tone, 'right');
        });
    };
    drawList(34, 'VOTED FOR', 'for', forList, sum.forVotes);
    drawList(490, 'VOTED AGAINST', 'against', againstList, sum.againstVotes);

    return canvas;
}

// Convert a canvas to a PNG blob
function stateCanvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
        try {
            canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Empty image'))), 'image/png');
        } catch (e) { reject(e); }
    });
}

// Render the card to a PNG, falling back to a placeholder portrait if the browser blocks the image
async function makeStateOfRepublicBlob() {
    const sum = window.lastElectionSummary;
    if (!sum) return null;
    if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (e) { console.warn(e); } }
    const portraitImg = await loadStateImage(getPresidentPortraitSrc());
    const iconImg = (document.documentElement.getAttribute('data-wstyle') === 'win98') ? await loadStateImage('photo/icon.png') : null;
    try {
        return await stateCanvasToBlob(drawStateOfRepublicCanvas(sum, portraitImg, iconImg));
    } catch (e) {
        console.warn('Images could not be embedded:', e);
        return await stateCanvasToBlob(drawStateOfRepublicCanvas(sum, null, null));
    }
}

// Save the State of the Republic card as an HD PNG download
window.downloadStateOfRepublicImage = async function() {
    try {
        const blob = await makeStateOfRepublicBlob();
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'state-of-the-republic-1999.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (e) {
        console.warn(e);
        showCustomAlert('The image could not be created in this browser.', null);
    }
};

// Epilogue: image id, caption, heading and text (images are optional: photo/epilogue_<id>.png)
const EPILOGUE_SECTIONS = [
    {
        id: 'end',
        caption: 'Epilogue',
        title: '',
        text: 'In the history that actually happened, the People’s Consultative Assembly voted 355 to 322 shortly after midnight on October 20, 1999, with nine abstentions and four spoiled ballots, to reject B.J. Habibie’s accountability speech. He withdrew from the presidential race the same day. Hours later, Abdurrahman Wahid, the nearly blind Nahdlatul Ulama cleric everyone called Gus Dur, defeated Megawati Sukarnoputri 373 to 313 in the first contested presidential vote in the republic’s history. Megawati, whose party had won the most seats in June, was elected vice president the following day, after her supporters had spent a night angry in the streets. Whatever happened in your version of that hall, the larger fact is the same. A seventeen month caretaker presidency ended in a vote, counted on green slips of paper, and not by a decree, a coup, or a crowd storming the gates.<br><br>To see how far that was from where the country had been, it helps to remember the numbers. The rupiah had traded at roughly 2,400 to the dollar in mid-1997. By June 1998 it was near 17,000. Real GDP fell by about 13 percent in 1998, a collapse the IMF itself later described as possibly the largest single-year fall of any country in modern economic history. Inflation approached 80 percent. Suharto had signed his second letter of intent with the Fund on January 15, 1998, while Michel Camdessus stood watching with folded arms. The closure of sixteen banks in November 1997 had been meant to restore confidence and instead set off a run. Then came the Trisakti shootings on May 12, 1998, the riots of May 13 to 15 in which well over a thousand people died, many in burning shopping malls, and the sexual violence against ethnic Chinese women documented by the Joint Fact-Finding Team. On May 21, Suharto resigned after thirty-two years, nine days after students had occupied the parliament building.<br><br>The government recapitalized the banking system at a cost of about Rp 658 trillion, equal to more than half of a year’s GDP, and public debt rose from roughly 24 percent of GDP before the crisis to about 93 percent. The Indonesian Bank Restructuring Agency, created in January 1998, spent six years selling off seized assets and chasing the owners of banks that had looted their own depositors, with mixed success, before it was dissolved in 2004. Four state banks were merged into Bank Mandiri in 1999. The IMF programs themselves ran from 1997 to the end of 2003, and Indonesia drew about SDR 7.4 billion, around $11.1 billion. The government of Susilo Bambang Yudhoyono, who had won the presidency in 2004, decided not to extend the arrangement. It paid $3.75 billion in June 2006, then announced on October 5 that it would settle the remaining SDR 2.2 billion, about $3.2 billion, and the payment cleared that month. The original schedule had run to December 2010. A commodity boom, a current account surplus, and tighter budgets made it possible. In January 2007 Jakarta also asked for the Consultative Group on Indonesia, the donor forum that had met under World Bank leadership since 1967, to be disbanded. Its own Independent Evaluation Office reviewed the episode in 2003, and critics such as Joseph Stiglitz argued that the early bank closures and tight money deepened the panic. What no one disputes is that Indonesia came out of the decade owing the IMF nothing and growing at around 5 to 6 percent a year.<br><br>Between 1999 and 2002 the MPR amended the 1945 Constitution four times. It limited presidents to two terms, moved to direct presidential elections, created the Constitutional Court, and ended the military’s appointed seats in the legislatures by 2004. Regional autonomy took effect on January 1, 2001, and from 2005 governors, mayors, and regents were elected directly. The Press Law of September 1999 abolished the licensing regime that had let information ministers shut newspapers, and Tempo, Detik, and Editor, banned in 1994, were back on the stands. The Corruption Eradication Commission, the KPK, was founded in 2002 and spent its first decade jailing ministers, governors, and a police general, which no one in the Suharto era would have thought possible.<br><br>Habibie had offered East Timor a choice in January 1999, and on August 30, 78.5 percent voted against autonomy within Indonesia. Militias backed by elements of the army burned Dili and drove hundreds of thousands from their homes before the Australian-led INTERFET force under Major General Peter Cosgrove landed on September 20. The Assembly formally accepted the result in October, and Timor-Leste became independent on May 20, 2002.<br><br>Aceh took longer. After the tsunami of December 26, 2004 killed roughly 170,000 people in the province, the Finnish mediator Martti Ahtisaari helped broker the Helsinki memorandum between Jakarta and the Free Aceh Movement, signed on August 15, 2005. The Malino agreements had already calmed the communal killing in Poso and Ambon, though the Bali bombings of October 12, 2002, which killed 202 people, showed that new dangers had arrived alongside the old ones. No senior officer was convicted for May 1998, the disappearance of activists such as Wiji Thukul remained unresolved, and Suharto died on January 27, 2008 without ever standing trial.<br><br>Habibie lived to see much of it. He founded The Habibie Center in 1999 to promote democracy and technology, and he died on September 11, 2019, at 83. In the years between, Yudhoyono won a second term in 2009, and in 2014 Joko Widodo, a furniture seller from Solo with no ties to the old elite, won the presidency.<br><br>But the reform era was never a straight line. In September 2019, weeks before Habibie’s death, parliament revised the KPK law in a way that most observers believed weakened it, and students returned to the streets. Prabowo Subianto, a former special forces commander and Suharto’s former son-in-law, whose dismissal from the army in 1998 was part of the story you have just played, won the presidency in February 2024 and was inaugurated on October 20, 2024, twenty-five years to the day after Wahid. In March 2025 parliament unanimously passed a revision of the armed forces law that widened the list of civilian posts open to active-duty officers, and in August 2025 protests spread to more than a hundred cities after the killing of Affan Kurniawan, a 21-year-old ride-hailing driver, under a police armored vehicle. Human Rights Watch’s 2026 report counted the growing role of military officers in civilian affairs among the year’s chief concerns. Against that, hundreds of thousands of mostly young people took to the streets and the press kept reporting, which is a different picture from 1997.'
    }
];

// Epilogue image block: shows a placeholder until the real image exists
function buildEpilogueImageHTML(sec) {
    const src = (gameConfig && gameConfig.epilogueImages && gameConfig.epilogueImages[sec.id]) || `photo/epilogue/epilogue_${sec.id}.png`;
    const cap = escapeAttr(sec.caption);
    return `<center><div style="position: relative; width: 100%; max-width: 880px; aspect-ratio: 2 / 1; max-height: 440px; box-sizing: border-box; border: 3px inset #FFFFFF; background-color: #A9A9A9; margin-bottom: 15px; overflow: hidden;">
        <span style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 11px; color: #555; padding: 6px;">[ PHOTO:<br>${cap} ]</span>
        <img src="${escapeAttr(src)}" alt="${cap}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
    </div></center>`;
}

// Show the epilogue: replaces the whole game window with a Situation-style panel
window.showEpilogue = function() {
    const sum = window.lastElectionSummary;
    const mainPanel = document.getElementById('main-panel');
    const leftPanel = document.getElementById('left-panel');
    const mprDashboard = document.getElementById('mpr-dashboard');
    if (!mainPanel) return;

    if (mainPanel.querySelector('#election-result-container')) window.electionPanelSnapshot = mainPanel.innerHTML;
    window.epilogueActive = true;
    if (leftPanel) leftPanel.style.display = 'none';
    if (mprDashboard) mprDashboard.style.display = 'none';
    mainPanel.style.width = '100%';
    if (typeof updateMobileStatusBar === 'function') updateMobileStatusBar();

    const won = Boolean(sum && sum.won);
    const intro = won
        ? 'The Assembly accepted your <i>Pidato Pertanggungjawaban</i>. A president had stood before the MPR and been held to account, and the answer came in a vote, not by decree or by force.'
        : 'The Assembly did not accept your <i>Pidato Pertanggungjawaban</i>. It stung, but the verdict was delivered by vote in a hall of seven hundred delegates, and power passed the way it should in a republic: peacefully, under the rules.';

    let html = '<center><h2>EPILOGUE</h2></center>';
    const bodyStyle = 'padding: 15px; margin-bottom: 10px; font-family: MS Sans Serif, sans-serif; font-size: 13px; line-height: 1.6; color: #333; text-align: justify;';

    html += `<div style="${bodyStyle}"><b>Dear Mr. President,</b><br><br>${intro} You inherited a nation on the edge. You leave it with a free press, free parties and a ballot box that works. What follows is not your doing alone, but it could not have begun without the doors you opened.</div>`;

    EPILOGUE_SECTIONS.forEach(sec => {
        html += buildEpilogueImageHTML(sec);
        html += `<center><h3 style="margin: 0 0 4px 0;">${sec.title}</h3></center>`;
        html += `<div style="${bodyStyle}">${sec.text}</div>`;
    });

    html += `<div style="${bodyStyle} text-align: center; font-style: italic;">Indonesia is still unfinished, and still hopeful. Thank you for playing.</div>`;
    html += '<center>';
    html += '<button style="width: 300px; text-align: center; margin-bottom: 8px; --py: 10px; --px: 10px;" onclick="returnToTitleScreen()">Return to Title Screen</button><br>';
    html += '<button style="width: 300px; text-align: center; background-color: #ff9999; --py: 10px; --px: 10px;" onclick="closeEpilogue()">Back to Results</button>';
    html += '</center>';
    mainPanel.innerHTML = html;
    scrollMainPanelToTop();
};

// Leave the epilogue and restore the election results with the side panels
window.closeEpilogue = function() {
    window.epilogueActive = false;
    syncSidebarVisibility();
    if (typeof updateMobileStatusBar === 'function') updateMobileStatusBar();
    const mainPanel = document.getElementById('main-panel');
    if (window.electionPanelSnapshot && mainPanel) {
        mainPanel.innerHTML = window.electionPanelSnapshot;
        scrollMainPanelToTop();
    } else {
        returnToTitleScreen();
    }
};

// Build the State of the Republic dossier from the election summary
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
        ${buildStateCardHTML(sum)}

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

        <h3 style="font-size: 13px; margin-bottom: 6px;">Seven Pillars of the State</h3>
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