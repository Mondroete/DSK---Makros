// ==========================================
// ⚙️ LUNAS WIRKUNG: BLICK IN DIE ZWISCHENWELT (V13 Ready - System & Whisper Standard)
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

    const gabenName = "Blick in die Zwischenwelt (Zerzal)";
    const ahne = "zerzal";

    if (DSK_FW.EffektEnde) {
        DSK_FW.EffektEnde.Register(
            "blickZwischenwelt", 
            gabenName, 
            "Der Blick in die Zwischenwelt trübt sich. Das Verborgene entzieht sich wieder dem normalen Auge."
        );
    }

    // --- 2. CASTER & QS ERMITTELN ---
    const casterActor = (typeof testData !== "undefined" && testData?.actor) || 
                        (typeof testData !== "undefined" && testData?.speaker?.actor ? game.actors.get(testData.speaker.actor) : null) || 
                        actor || 
                        canvas.tokens.controlled[0]?.actor || 
                        game.user.character;

    if (!casterActor) {
        return ui.notifications.warn("Luna sagt 🌙: Kein Wirkender gefunden! Bitte wähle deinen Token aus.");
    }

    let ermittelteQS = casterActor.getFlag("world", "letzteGabenQS") || 1;
    if (casterActor.getFlag("world", "letzteGabenQS")) {
        await casterActor.unsetFlag("world", "letzteGabenQS");
    }

    try {
        if (typeof testData !== "undefined" && testData) {
            const parsedQs = Number(testData?.result?.QL || testData?.qualityStep);
            if (!isNaN(parsedQs) && parsedQs > 0) {
                ermittelteQS = parsedQs;
            }
        }
    } catch (e) {}

    const dauerMinuten = ermittelteQS;
    const dauerText = `${dauerMinuten} Minute${dauerMinuten > 1 ? "n" : ""} (QS ${ermittelteQS})`;

    const beschreibung = `Der Blick durchdringt die Barriere zum Jenseits. Das Ziel erkennt, was sich ihm verbirgt, beispielsweise Unsichtbare, Feen, Kobolde oder andere Wesenheiten (normale physische Sichtblockaden wie Wände wirken weiterhin).`;
    const besonderheiten = `<b>Zielkategorie:</b> Sich selbst`; 
    const basisText = `${beschreibung}<br><br>${besonderheiten}`;

    // --- 3. EFFEKT DIREKT AUF DEN WIRKENDEN ANLEGEN ---
    try {
        await DSK_FW.Effekt.Anwenden({
            name: gabenName,
            ahne: ahne,
            beschreibung: basisText,
            gabeZiel: "", 
            qs: ermittelteQS,
            ziel: casterActor,
            flags: {
                dsk: { casterUuid: casterActor.uuid },
                core: { statusId: "blickZwischenwelt" }
            }
        });

        const angelegterEffekt = casterActor.effects.find(e => e.name === gabenName);
        if (angelegterEffekt) {
            await angelegterEffekt.update({ duration: { seconds: ermittelteQS * 60 } });
        }
    } catch (e) {
        console.warn(`Effekt konnte nicht angewendet werden:`, e);
        return ui.notifications.error("Fehler beim Anlegen des Effekts!");
    }

    // --- 4. WHISPER-EMPFÄNGER & GEFÜSTERTE CHATKARTE ---
    let ownerIds = new Set(game.users.filter(u => u.isGM).map(u => u.id));
    Object.entries(casterActor.ownership || {}).filter(([id, lvl]) => lvl === 3).forEach(([id]) => ownerIds.add(id));
    const whisperEmpfaenger = Array.from(ownerIds).filter(id => game.users.get(id));

    const erfolgHtml = `
        <div style="margin-top: 10px; margin-bottom: 10px;">
            <p style="margin-bottom: 5px;"><span style="color:#18940F; font-weight:bold;">Erfolg</span></p>
            <ul class="dsklist" style="margin-top:0; font-weight:normal;">
                <li>${casterActor.name}</li>
            </ul>
        </div>
    `;

    await ChatMessage.create({
        speaker: { alias: "System" },
        whisper: whisperEmpfaenger,
        content: `
            <div style="font-family: 'Signika', sans-serif;">
                ${DSK_FW.UI.Header(gabenName, DSK_FW.Symbol(ahne))}
                <div class="dskbox2" style="margin-top:10px;">
                    <p><b>Gabenwirkung:</b></p>
                    <p>${basisText}</p>
                    <hr>
                    ${erfolgHtml}
                    <hr>
                    <p style="text-align:center; font-weight:bold;">
                        Wirkungsdauer:<br>${dauerText}
                    </p>
                </div>
            </div>
        `
    });

    // --- 5. EFFEKT-BESCHREIBUNG AUF DEM TOKEN AKTUALISIEREN ---
    const plainErfolg = casterActor.name;
    const kompletterEffektText = `
        <b>Gabenwirkung:</b><br>${basisText}<br><hr>
        <b>Erfolg:</b><br>• ${plainErfolg}<br><hr>
        <b>Wirkungsdauer: ${dauerText}</b>
    `.trim();

    for (const effect of casterActor.effects) {
        if (effect.name === gabenName) {
            try {
                await effect.update({ description: kompletterEffektText });
            } catch (err) {}
        }
    }
})();
