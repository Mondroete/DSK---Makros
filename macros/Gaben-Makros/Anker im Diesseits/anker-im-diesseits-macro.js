// ==========================================
// ⚠️ WICHTIG: Dieses Macro lädt das DSK‑Framework aus einem Compendium‑Macro.
// Stelle sicher, dass die beiden UUIDs korrekt sind:
//  - Framework‑Macro UUID (fromUuid(...))
//  - Gaben‑Macro UUID (macroLink) — das Macro, das die Gabe steuert
//
// Beide UUIDs in diesem File sind bereits auf die von dir angegebenen Werte gesetzt.
// Framework UUID:
//   Compendium.dsk-havena-und-umland.makros.Macro.fHQ2OuDo3Fe3spBn
// Gaben‑Macro UUID (Macro, das die Gabe steuert):
//   Compendium.dsk-havena-und-umland.makros.Macro.9o8JAe6CkggaxRiv
// ==========================================

// ==========================================
// ⚙️ LUNAS WIRKUNG: ANKER IM DIESSEITS (V13 Ready mit Target-Kontrolle)
// ==========================================

(async () => {
    // --- 1. SICHERHEITS-CHECK: FRAMEWORK LADEN ---
    if (typeof DSK === "undefined" || !globalThis.DSK) {
        // Framework‑Macro (aus dem Compendium) – DA STEHT DEINE FRAMEWORK‑UUID:
        const fwMacro = await fromUuid("Compendium.dsk-havena-und-umland.makros.Macro.fHQ2OuDo3Fe3spBn");
        if (fwMacro) await fwMacro.execute();
        await new Promise(resolve => setTimeout(resolve, 150)); 
    }

    if (typeof DSK === "undefined" && !globalThis.DSK) {
        return ui.notifications.error("Luna sagt 🌙: Das DSK-Framework konnte nicht geladen werden!");
    }
    const DSK_FW = globalThis.DSK || DSK; 

    const gabenName = "Anker im Diesseits (Zerzal)";
    const ahne = "zerzal";
    const maxReichweite = 16;

    // Wirkungsende im Framework registrieren
    if (DSK_FW.EffektEnde) {
        DSK_FW.EffektEnde.Register(
            "ankerImDiesseits", 
            gabenName, 
            "Die unnatürliche Bindung bricht zusammen. Der Geist kommt frei und verliert seinen weltlichen Körper."
        );
    }

    // --- 2. WIRKENDEN (CASTER) & QS AUS FLAG ERMITTELN ---
    const casterActor = canvas.tokens.controlled[0]?.actor || game.user.character;
    if (!casterActor) {
        return ui.notifications.warn("Luna sagt 🌙: Bitte wähle zuerst deinen Token aus!");
    }

    let casterToken = casterActor.getActiveTokens()[0] || canvas.tokens.controlled[0];
    if (!casterToken) {
        return ui.notifications.warn("Luna sagt 🌙: Konnte das Token des Wirkenden nicht finden!");
    }

    let ermittelteQS = casterActor.getFlag("world", "letzteGabenQS") || 1;
    if (casterActor.getFlag("world", "letzteGabenQS")) {
        await casterActor.unsetFlag("world", "letzteGabenQS"); 
    }

    if (typeof testData !== "undefined") {
        ermittelteQS = Number(testData?.result?.QL || testData?.qualityStep || ermittelteQS);
    }

    // --- 3. TARGET-KONTROLLE (DIREKT ÜBER FOUNDRY TARGETS) ---
    const targetedTokens = Array.from(game.user.targets);

    if (targetedTokens.length === 0) {
        ui.notifications.warn("Luna sagt 🌙: Bitte nimm mindestens ein Ziel ins Target und führe das Makro erneut aus!");
        return;
    }

    let geistZiel = null;
    let ankerZiel = null;

    // Wir prüfen die anvisierten Token
    let geisterImTarget = targetedTokens.filter(t => t.actor && DSK_FW.Effekt.CheckTarget(t.actor, "geist"));
    let erwachteImTarget = targetedTokens.filter(t => t.actor && DSK_FW.Effekt.CheckTarget(t.actor, "erwachte"));

    if (targetedTokens.length === 1 && geisterImTarget.length === 1) {
        // Fall 2: Nur ein Geist im Target -> Spieler ist selbst der Anker!
        geistZiel = geisterImTarget[0];
        ankerZiel = casterToken;
    } else if (geisterImTarget.length === 1 && erwachteImTarget.length === 1) {
        // Fall 1: Exakt 1 Geist und 1 Erwachter im Target
        geistZiel = geisterImTarget[0];
        ankerZiel = erwachteImTarget.find(t => t.id !== geistZiel.id) || erwachteImTarget[0];
    } else {
        ui.notifications.warn("Luna sagt 🌙: Ungültige Ziele! Du musst entweder 1 Geist (dann bist du der Anker) oder 1 Geist und 1 Erwachsenen anvisieren.");
        return;
    }

    // --- 4. DISTANZ-KONTROLLE (MAX 16 SCHRITT VOM CASTER) ---
    let fehlschlagZiele = [];

    const distanzGeist = DSK_FW.Distanz(casterToken, geistZiel);
    const distanzAnker = DSK_FW.Distanz(casterToken, ankerZiel);

    if (distanzGeist > maxReichweite) {
        fehlschlagZiele.push({ name: geistZiel.name, grund: `${Math.ceil(distanzGeist - maxReichweite)} Schritt zu weit entfernt` });
    }
    if (ankerZiel.id !== casterToken.id && distanzAnker > maxReichweite) {
        fehlschlagZiele.push({ name: ankerZiel.name, grund: `${Math.ceil(distanzAnker - maxReichweite)} Schritt zu weit entfernt` });
    }

    const dauerText = `${ermittelteQS} Minuten (QS ${ermittelteQS})`;
    const beschreibung = `Durch das Wirken dieser Gabe wird ein Geist an einen Erwachten gebunden, der vom Zerzalkind als Anker bestimmt wurde, und so ins Diesseits gezwungen. Der Geist materialisiert, auch wenn er die Fähigkeit Materialisierung nicht besitzt, und bleibt so lange materialisiert, wie sein Anker im Umkreis von 8 Schritt bleibt, lebendig und bei Bewusstsein ist. Ansonsten kommt der Geist wieder frei und verliert seinen verletzlichen, weltlichen Körper.`;
    const besonderheiten = `<b>Zielkategorie:</b> 1 Geist und 1 Erwachter<br><b>Reichweite:</b> ${maxReichweite} Schritt`;
    const basisBeschreibung = `${beschreibung}<br><br>${besonderheiten}`;

    let erfolgsZiele = [];

    if (fehlschlagZiele.length === 0) {
        const vollerEffektName = `${gabenName} - Geist: ${geistZiel.name} & Erwachter: ${ankerZiel.name}`;

        try {
            // Effekt auf den Geist
            await DSK_FW.Effekt.Anwenden({
                name: vollerEffektName,
                ahne: ahne,
                beschreibung: basisBeschreibung + `<br><hr><b>Rolle in dieser Verbindung:</b> Materialisierter Geist`,
                gabeZiel: "geist",
                qs: ermittelteQS,
                ziel: geistZiel.actor,
                flags: { dsk: { casterUuid: casterActor.uuid } }
            });

            // Effekt auf den Anker (Erwachsenen)
            await DSK_FW.Effekt.Anwenden({
                name: vollerEffektName,
                ahne: ahne,
                beschreibung: basisBeschreibung + `<br><hr><b>Rolle in dieser Verbindung:</b> Anker im Diesseits`,
                gabeZiel: "erwachte",
                qs: ermittelteQS,
                ziel: ankerZiel.actor,
                flags: { dsk: { casterUuid: casterActor.uuid } }
            });

            erfolgsZiele.push(`<b>Geist:</b> ${geistZiel.name}`);
            erfolgsZiele.push(`<b>Anker:</b> ${ankerZiel.name} ${ankerZiel.id === casterToken.id ? '(Wirkender selbst)' : ''}`);
        } catch (e) {
            console.warn("Effekt konnte nicht angewendet werden:", e);
        }
    }

    // --- 5. CHATKARTE ERSTELLEN (GEFLÜSTERT) ---
    let erfolgHtml = `
        <p><span style="color:#18940F; font-weight:bold;">Erfolg</span></p>
        <ul class="dsklist" style="font-weight:normal; margin-top:4px;">
            ${erfolgsZiele.length > 0 ? erfolgsZiele.map(n => `<li>${n}</li>`).join("") : "<li><i>Keiner (Reichweite überschritten)</i></li>"}
        </ul>
    `;
        
    let fehlschlagHtml = "";
    if (fehlschlagZiele.length > 0) {
        let fehlschlagInhalt = fehlschlagZiele.map(f => `<p style="font-weight:normal; color:#000; margin: 4px 0 2px 0;"><b>${f.name}</b> (${f.grund})</p>`).join("");
        fehlschlagHtml = `
            <hr>
            <p><span style="color:#B30000; font-weight:bold;">Fehlschlag</span></p>
            ${fehlschlagInhalt}
        `;
    }

    // Flüster-Empfänger (GM + Owner des Caster-Aktors)
    let ownerIds = new Set(game.users.filter(u => u.isGM).map(u => u.id));
    Object.entries(casterActor.ownership || casterActor.permission || {})
        .filter(([id, lvl]) => lvl === 3 && id !== "default")
        .forEach(([id]) => ownerIds.add(id));
    const whisperEmpfaenger = Array.from(ownerIds).filter(id => game.users.get(id));

    await ChatMessage.create({
        speaker: { alias: "System" },
        content: `
            <div style="font-family:'Signika',sans-serif;">
                ${DSK_FW.UI.Header(gabenName, DSK_FW.Symbol(ahne))}
                <div class="dskbox2" style="margin-top:10px;">
                    <p><b>Gabenwirkung:</b></p>
                    <p>${basisBeschreibung}</p>
                    <hr>
                    ${erfolgHtml}
                    ${fehlschlagHtml}
                    <hr>
                    <p style="text-align:center; font-weight:bold;">
                        Wirkungsdauer:<br>${dauerText}
                    </p>
                </div>
            </div>
        `,
        whisper: whisperEmpfaenger
    });
})();
