// ==========================================
// ⚙️ LUNAS WIRKUNG: EHRENSCHULDEN (V13 Ready - Whisper & System Standard)
// ==========================================

(async () => {
    // ============================================================
    // 0. Framework laden & Wirkungsende-Hook registrieren
    // ============================================================
    const fwMacro = await fromUuid("Compendium.dsk-havena-und-umland.makros.Macro.fHQ2OuDo3Fe3spBn");
    if (fwMacro) {
        await fwMacro.execute();
    }

    if (typeof DSK === "undefined") {
        ui.notifications.error("Das DSK-Framework konnte nicht geladen werden!");
        return;
    }
    const DSK_FW = globalThis.DSK || DSK;

    const gabenName = "Ehrenschulden (Aphasma)";
    const ahne = "aphasma";

    // Hilfsfunktion: Finde alle Spieler-IDs, denen ein Akteur gehört
    const getOwners = (act) => {
        if (!act) return [];
        const ownership = act.ownership || act.permission || {};
        return Object.entries(ownership)
            .filter(([id, lvl]) => lvl === 3 && id !== "default")
            .map(([id]) => id);
    };

    if (DSK_FW.EffektEnde) {
        DSK_FW.EffektEnde.Register(
            "aphasmaEhrenschulden", 
            gabenName, 
            "Die Schulden wurden beglichen oder erlassen. Die Schmerzen verfliegen und das Fell wächst langsam nach."
        );
    }

    // ============================================================
    // 1. Initialisierung & Caster-Ermittlung
    // ============================================================
    const casterActor = (typeof testData !== "undefined" && testData?.actor) || 
                        (typeof testData !== "undefined" && testData?.speaker?.actor ? game.actors.get(testData.speaker.actor) : null) || 
                        (typeof testData !== "undefined" && testData?.speaker?.token ? canvas.tokens.get(testData.speaker.token)?.actor : null) || 
                        actor || 
                        canvas.tokens.controlled[0]?.actor || 
                        game.user.character;

    if (!casterActor) {
        ui.notifications.warn("Kein Akteur gefunden! Bitte wähle deinen Token aus.");
        return;
    }

    // QS aus dem Flag auslesen, das vom Start-Makro gesetzt wurde
    let qs = casterActor.getFlag("world", "letzteGabenQS") || 1;
    if (casterActor.getFlag("world", "letzteGabenQS")) {
        await casterActor.unsetFlag("world", "letzteGabenQS");
    }

    try {
        if (typeof testData !== "undefined" && testData) {
            const parsedQs = Number(testData?.result?.QL || testData?.qualityStep);
            if (!isNaN(parsedQs) && parsedQs > 0) {
                qs = parsedQs;
            }
        }
    } catch (e) {}

    // ============================================================
    // 2. Ziele über Foundry Targets oder Fallback sammeln
    // ============================================================
    const targets = Array.from(game.user.targets);
    let zielAkteure = [];

    if (targets.length > 0) {
        for (let t of targets) {
            if (t.actor && t.actor.id !== casterActor.id) {
                zielAkteure.push({ actor: t.actor, name: t.name });
            }
        }
    }

    if (zielAkteure.length === 0) {
        return ui.notifications.warn("Luna sagt 🌙: Bitte wähle mindestens ein Ziel (deinen Wettpartner) per Target aus!");
    }

    const basisBeschreibung = `Kann oder will der Verlierer dieser Wette seinen Einsatz nicht begleichen, erleidet er ${qs} Stufen Schmerz (QS) und sein Fell fällt ihm langsam aus. (Voraussetzung: Freiwillige Zustimmung zur Wette).`;
    const dauerText = `Bis die Schulden beglichen sind (vorerst)`;
    const casterName = DSK_FW.ResolveTokenName(casterActor);

    let erfolgreicheNamen = [];
    let erfolgsZiele = [];
    let fehlschlagZiele = []; 

    // --- CASTER PRÜFEN ---
    let casterGueltig = DSK_FW.Effekt.CheckTarget(casterActor, "lebewesen") || 
                        DSK_FW.Effekt.CheckTarget(casterActor, "erwachte") || 
                        casterActor.type === "character" || 
                        casterActor.type === "npc";
    if (DSK_FW.Effekt.CheckTarget(casterActor, "geist") || DSK_FW.Effekt.CheckTarget(casterActor, "untot")) {
        casterGueltig = false;
    }

    if (!casterGueltig) {
        for (let z of zielAkteure) {
            fehlschlagZiele.push({ name: z.name, grund: "Weder Erwachter noch Mensch" });
        }
    } else {
        // --- ZIELE PRÜFEN & EFFEKTE ANLEGEN ---
        for (let z of zielAkteure) {
            let istGueltig = DSK_FW.Effekt.CheckTarget(z.actor, "lebewesen") || 
                             DSK_FW.Effekt.CheckTarget(z.actor, "erwachte") || 
                             z.actor.type === "character" || 
                             z.actor.type === "npc";

            if (DSK_FW.Effekt.CheckTarget(z.actor, "geist") || DSK_FW.Effekt.CheckTarget(z.actor, "untot")) {
                istGueltig = false;
            }

            if (istGueltig) {
                const effektNameZiel = `${gabenName} - Wette mit ${casterName}`;
                const beschreibungZiel = `${basisBeschreibung}<br><hr><b>Wette geschlossen mit:</b> ${casterName}`;

                try {
                    let alterZielEffekt = z.actor.effects.find(e => e.name === effektNameZiel);
                    if (alterZielEffekt) await alterZielEffekt.delete();

                    await DSK_FW.Effekt.Anwenden({
                        name: effektNameZiel,
                        ahne: ahne,
                        beschreibung: beschreibungZiel,
                        gabeZiel: "erwachte",
                        qs: qs,
                        formel: `+${qs}`,
                        skills: ["system.status.inpain"],
                        key: "system.status.inpain",
                        ziel: z.actor
                    });

                    erfolgreicheNamen.push(z.name);
                } catch (e) {
                    console.warn("Effekt für Ziel konnte nicht angewendet werden:", e);
                }
            } else {
                fehlschlagZiele.push({ name: z.name, grund: "Weder Erwachter noch Mensch" });
            }
        }

        // --- SAMMEL-EFFEKT FÜR DEN CASTER ---
        if (erfolgreicheNamen.length > 0) {
            const alleNamenStr = erfolgreicheNamen.join(", ");
            const effektNameCaster = `${gabenName} - Wette mit: ${alleNamenStr}`;
            const beschreibungCaster = `${basisBeschreibung}<br><hr><b>Wette geschlossen zwischen:</b><br>• ${casterName}<br>${erfolgreicheNamen.map(n => `• ${n}`).join("<br>")}`;

            try {
                let alterCasterEffekt = casterActor.effects.find(e => e.name === effektNameCaster);
                if (alterCasterEffekt) await alterCasterEffekt.delete();

                await DSK_FW.Effekt.Anwenden({
                    name: effektNameCaster,
                    ahne: ahne,
                    beschreibung: beschreibungCaster,
                    gabeZiel: "erwachte",
                    qs: qs,
                    formel: `+${qs}`,
                    skills: ["system.status.inpain"],
                    key: "system.status.inpain",
                    ziel: casterActor
                });

                erfolgsZiele.push(casterName);
                erfolgsZiele.push(...erfolgreicheNamen);
            } catch (e) {
                console.warn("Effekt für Caster konnte nicht angewendet werden:", e);
            }
        }
    }

    // ============================================================
    // 3. WHISPER-EMPFÄNGER & GEFÜSTERTE CHATKARTE ERSTELLEN
    // ============================================================
    let ownerIds = new Set(game.users.filter(u => u.isGM).map(u => u.id));
    getOwners(casterActor).forEach(id => ownerIds.add(id));
    zielAkteure.forEach(z => {
        getOwners(z.actor).forEach(id => ownerIds.add(id));
    });
    const whisperEmpfaenger = Array.from(ownerIds).filter(id => game.users.get(id));

    let erfolgHtml = "";
    if (erfolgsZiele.length > 0) {
        erfolgHtml = `
            <p><span style="color:#18940F; font-weight:bold;">Erfolg</span></p>
            <p style="font-weight:bold; color:#000; margin: 4px 0 2px 0;">Wette geschlossen zwischen:</p>
            <ul class="dsklist" style="font-weight:normal; margin-top:4px;">
                ${erfolgsZiele.map(n => `<li>${n}</li>`).join("")}
            </ul>
        `;
    }

    let fehlschlagHtml = "";
    if (fehlschlagZiele.length > 0) {
        const grouped = {};
        for (const f of fehlschlagZiele) {
            if (!grouped[f.grund]) grouped[f.grund] = [];
            grouped[f.grund].push(f.name);
        }

        let fehlschlagInhalt = "";
        for (const [grund, namen] of Object.entries(grouped)) {
            fehlschlagInhalt += `
                <p style="font-weight:normal; color:#000; margin: 4px 0 2px 0;">(${grund})</p>
                <ul class="dsklist" style="font-weight:normal; margin-top:0;">
                    ${namen.map(n => `<li>${n}</li>`).join("")}
                </ul>
            `;
        }

        fehlschlagHtml = `
            <hr>
            <p><span style="color:#B30000; font-weight:bold;">Fehlschlag</span></p>
            ${fehlschlagInhalt}
        `;
    }

    await ChatMessage.create({
        speaker: { alias: "System" },
        whisper: whisperEmpfaenger,
        content: `
            <div style="font-family: 'Signika', sans-serif;">
                ${DSK_FW.UI.Header("Ehrenschulden", DSK_FW.Symbol(ahne))}
                <div class="dskbox2" style="margin-top:10px;">
                    <p><b>Gabenwirkung:</b></p>
                    <p>${basisBeschreibung}</p>
                    <hr>
                    ${erfolgHtml}
                    ${fehlschlagHtml}
                    <hr>
                    <p style="text-align:center; font-weight:bold;">
                        Wirkungsdauer: ${dauerText}
                    </p>
                </div>
            </div>
        `
    });
})();
