// ==========================================
// ⚙️ LUNAS GEGENSTANDS-AUSWAHL: APHASMAS SCHLEIER (V13 Ready - FW Modus)
// ==========================================

(async () => {
    // --- 1. SICHERHEITS-CHECK: FRAMEWORK LADEN ---
    if (typeof DSK === "undefined" || !globalThis.DSK) {
        const fwMacro = await fromUuid("Compendium.dsk-havena-und-umland.makros.Macro.fHQ2OuDo3Fe3spBn");
        if (fwMacro) await fwMacro.execute();
        await new Promise(resolve => setTimeout(resolve, 150)); 
    }

    if (typeof DSK === "undefined" && !globalThis.DSK) {
        return ui.notifications.error("Luna sagt 🌙: Das DSK-Framework konnte nicht geladen werden!");
    }
    const DSK_FW = globalThis.DSK || DSK; 

    // --- 2. AKTEUR PRÜFEN ---
    const wirkenderActor = canvas.tokens.controlled[0]?.actor || game.user.character;
    if (!wirkenderActor) {
        return ui.notifications.warn("Luna sagt 🌙: Bitte wähle zuerst deinen Token aus, liebes Aphasmakind!");
    }

    // --- 3. QS & MATHE ERMITTELN ---
    let ermittelteQS = wirkenderActor.getFlag("world", "letzteGabenQS") || 1;
    if (wirkenderActor.getFlag("world", "letzteGabenQS")) {
        await wirkenderActor.unsetFlag("world", "letzteGabenQS"); 
    }

    if (typeof testData !== "undefined") {
        ermittelteQS = Number(testData?.result?.QL || testData?.qualityStep || ermittelteQS);
    }
    
    const bonus = Math.max(1, Math.round(ermittelteQS / 2));

    // --- 4. DATEN DER AHNENGABE ---
    const gabenName = "Aphasmas Schleier";
    const ahnenName = "Aphasma";
    const suchbegriff = "Schleier";
    const basisEffektName = `${gabenName} (${ahnenName})`; 
    
    const wirkungText = `Der Schleier gilt nun als geweiht. Solange er sichtbar getragen wird, erhält das Aphasmakind eine Erleichterung von <b>${bonus} FW</b> <span style="font-size: 0.85em; font-weight: normal;">(${ermittelteQS}QS/2)</span> auf <i>Umschmeicheln</i> und <i>Körperbeherrschung (Tanzen)</i>. Wirkt die Gabe auf einen zweiten Schleier, verliert der erste seine magische Wirkung.`;
    const dauerText = `Bis zum nächsten Vollmond`;
    const abschlussText = `Der sanfte, silberne Schimmer der Mondgöttin verblasst langsam. Der Stoff verliert sein übernatürliches Wesen. Aphasmas Segen ruht.`;

    // --- 5. WIRKUNGSENDE REGISTRIEREN ---
    if (DSK_FW.EffektEnde) {
        DSK_FW.EffektEnde.Register("aphasmasschleier", basisEffektName, abschlussText);
    }

    // --- 6. GEGENSTÄNDE AUS DEM INVENTAR FILTERN ---
    const gefundeneItems = wirkenderActor.items.filter(i => 
        i.name.toLowerCase().includes(suchbegriff.toLowerCase()) && 
        i.type?.toLowerCase() !== "ahnengabe"
    );

    let dropdownHtml = "";
    if (gefundeneItems.length > 0) {
        let optionen = gefundeneItems.map(i => `<option value="${i.id}">${i.name}</option>`).join("");
        dropdownHtml = `
            <div style="margin-top: 10px;">
                <label style="font-weight: bold; font-size: 0.9em;">Wähle deinen Schleier:</label>
                <select name="gegenstandId" style="width: 100%; padding: 4px; margin-top: 4px; font-family: 'Signika', sans-serif;">
                    ${optionen}
                </select>
            </div>
        `;
    } else {
        dropdownHtml = `<p style="color: darkred; font-size: 0.9em; margin-top: 8px;">Kein passender Gegenstand im Inventar gefunden!</p>`;
    }

    // --- 7. DIALOG IM NEUEN V13 DESIGN (DialogV2) ---
    const dialogResult = await foundry.applications.api.DialogV2.wait({
        window: { title: gabenName },
        position: { width: 420 },
        content: `
            <form>
                <div style="font-family: 'Signika', sans-serif;">
                    ${DSK_FW.UI.Header(basisEffektName, DSK_FW.Symbol(ahnenName))}
                    <div class="dskbox2" style="margin-top:10px;">
                        <p style="font-size:0.95em; line-height:1.35;">${wirkungText}</p>
                        ${dropdownHtml}
                        <hr style="margin: 10px 0;">
                        <p style="text-align:center; font-weight:bold;">Wirkungsdauer: ${dauerText}</p>
                    </div>
                </div>
            </form>
        `,
        rejectClose: false,
        buttons: gefundeneItems.length > 0 ? [
            {
                action: "anwenden",
                label: "Gabe wirken",
                icon: "fas fa-magic",
                default: true,
                callback: (event) => {
                    const form = event.target.closest("form");
                    return form ? new FormData(form).get("gegenstandId") : null;
                }
            },
            {
                action: "abbrechen",
                label: "Abbrechen",
                icon: "fas fa-times",
                callback: () => false
            }
        ] : [
            {
                action: "abbrechen",
                label: "Schließen",
                icon: "fas fa-times",
                callback: () => false
            }
        ]
    });

    // --- 8. EFFEKT ANWENDEN WENN BESTÄTIGT ---
    if (dialogResult !== false && dialogResult !== undefined) {
        let gewaehltesItemName = "Schleier";
        const itemId = dialogResult;
        
        if (itemId) {
            const itemObj = wirkenderActor.items.get(itemId);
            if (itemObj) gewaehltesItemName = itemObj.name;
        }

        const finalerEffektName = `${basisEffektName} - ${gewaehltesItemName}`;
        const finalerWirkungText = `Der Schleier <b>${gewaehltesItemName}</b> gilt nun als geweiht. Erleichterung von <b>${bonus} FW</b> auf <i>Umschmeicheln</i> und <i>Körperbeherrschung (Tanzen)</i>.`;

        // MANUELLE EFFEKTERSTELLUNG (Um das "+" zu vermeiden und FW zu erzwingen)
        const changes = [
            { key: "system.skillModifiers.FW", mode: 0, value: `Umschmeicheln ${bonus}`, priority: 20 },
            { key: "system.skillModifiers.FW", mode: 0, value: `Körperbeherrschung ${bonus}`, priority: 20 }
        ];

        await wirkenderActor.createEmbeddedDocuments("ActiveEffect", [{
            name: finalerEffektName,
            icon: DSK_FW.Symbol(ahnenName),
            origin: wirkenderActor.uuid,
            description: finalerWirkungText, 
            flags: { dsk: { ahnenId: "aphasmasschleier", casterUuid: wirkenderActor.uuid } },
            changes: changes
        }]);

        const chatHtml = `
            <div style="font-family: 'Signika', sans-serif;">
                ${DSK_FW.UI.Header(finalerEffektName, DSK_FW.Symbol(ahnenName))}
                <div class="dskbox2" style="margin-top:10px;">
                    <p style="font-size:0.95em; line-height:1.35;">${finalerWirkungText}</p>
                    <hr style="margin: 10px 0;">
                    <p style="text-align:center; font-weight:bold;">Wirkungsdauer: ${dauerText}</p>
                </div>
            </div>
        `;

        let ownerIds = new Set(game.users.filter(u => u.isGM).map(u => u.id));
        Object.entries(wirkenderActor.ownership || wirkenderActor.permission || {})
            .filter(([id, lvl]) => lvl === 3 && id !== "default")
            .forEach(([id]) => ownerIds.add(id));
        const whisperEmpfaenger = Array.from(ownerIds).filter(id => game.users.get(id));

        await ChatMessage.create({
            speaker: { alias: "System" },
            content: chatHtml,
            whisper: whisperEmpfaenger
        });
    }
})();
