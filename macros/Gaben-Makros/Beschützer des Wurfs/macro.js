// ==========================================
// ⚙️ LUNAS WIRKUNG: BESCHÜTZER DES WURFS (V13 Ready - Update & Dünne Rechnungen)
// ==========================================

(async () => {
    // Framework laden
    const fwMacro = await fromUuid("Compendium.dsk-havena-und-umland.makros.Macro.fHQ2OuDo3Fe3spBn");
    if (fwMacro) await fwMacro.execute();
    const DSK_FW = globalThis.DSK || DSK; 

    const gabenName = "Beschützer des Wurfs (Rondra)";
    const effektName = "Beschützer des Wurfs (Rondra) - Herausgeforderter"; 
    const ahne = "rondra";
    const maxReichweite = 16;

    if (DSK_FW.EffektEnde) {
        DSK_FW.EffektEnde.Register("beschuetzerDesWurfs", effektName, "Der göttliche Zwang endet. Das Ziel ist nicht mehr an die Herausforderung gebunden.");
    }

    // --- 1. AKTEUR & QS (Flags behalten!) ---
    const casterActor = canvas.tokens.controlled[0]?.actor || game.user.character;
    if (!casterActor) return ui.notifications.warn("Luna sagt 🌙: Kein Wirkender gefunden!");
    
    const qs = casterActor.getFlag("world", "letzteGabenQS") || 1;
    const alteMessageId = casterActor.getFlag("world", "letzteGabenMessageId");

    const casterToken = casterActor.getActiveTokens()[0] || canvas.tokens.controlled[0];

    // --- 2. BERECHNUNGEN (Dünn) ---
    const dauerMinuten = qs; 
    const thinStyle = 'style="font-weight: 300; font-size: 0.9em; opacity: 0.8;"';
    const dauerCalc = `<span ${thinStyle}>(${qs} QS x 1 Min.)</span>`;

    const basisBeschreibung = `Das Rondrakind kann einen Kämpfer herausfordern, der eine schutzlose Person angreift. Der Herausgeforderte muss von seinem Opfer ablassen und das Rondrakind angreifen.`;
    const besonderheiten = `<b>Zielkategorie:</b> Erwachte und Tiere<br><b>Reichweite:</b> ${maxReichweite} Schritt`;

    // --- 3. TARGETS ---
    const targetedTokens = Array.from(game.user.targets);
    if (targetedTokens.length === 0) return ui.notifications.warn("Bitte wähle Ziele per Target aus!");

    const erfolge = [];
    const fehler = [];

    // --- 4. SCHLEIFE ---
    for (let t of targetedTokens) {
        if (!t.actor) continue;

        // A) Distanz-Check
        if (casterToken && t.id !== casterToken.id) {
            const distanz = DSK_FW.Distanz(casterToken, t);
            if (distanz > maxReichweite) {
                fehler.push({ name: t.name, grund: `${Math.ceil(distanz - maxReichweite)} Schritt zu weit` });
                continue;
            }
        }

        // B) Wesen-Check
        const istErwachterOderNpc = DSK_FW.Effekt.CheckTarget(t.actor, "erwachte");
        const istTier = DSK_FW.Wesen.match(t.actor, ["tier", "tiere", "animal"]);

        if (!istErwachterOderNpc && !istTier) {
            fehler.push({ name: t.name, grund: "Kein Erwachter/Tier" });
            continue; 
        }

        // C) Effekt anwenden
        await DSK_FW.Effekt.Anwenden({
            name: effektName,
            ahne: ahne,
            beschreibung: basisBeschreibung,
            gabeZiel: "", 
            qs: qs,
            ziel: t.actor,
            flags: {
                dsk: { casterUuid: casterActor.uuid },
                core: { statusId: "beschuetzerDesWurfs" }
            }
        });

        const eff = t.actor.effects.find(e => e.name === effektName);
        if (eff) {
            await eff.update({ duration: { seconds: qs * 60 } });
            erfolge.push(t.name);
        }
    }

    // --- 5. FLAG-CLEANUP (Nur wenn wir erfolgreich waren) ---
    if (erfolge.length > 0) {
        await casterActor.unsetFlag("world", "letzteGabenQS");
        await casterActor.unsetFlag("world", "letzteGabenMessageId");
    }

    // --- 6. CHATKARTE AKTUALISIEREN ---
    let ownerIds = new Set(game.users.filter(u => u.isGM).map(u => u.id));
    [...targetedTokens, casterToken].forEach(t => {
        if(t?.actor) Object.entries(t.actor.ownership || {}).filter(([id, lvl]) => lvl === 3).forEach(([id]) => ownerIds.add(id));
    });

    const erfolgHtml = erfolge.length > 0 
        ? `<div style="margin-top: 10px; margin-bottom: 10px;">
               <p style="margin-bottom: 5px;"><span style="color:#18940F; font-weight:bold;">Erfolg</span></p>
               <ul class="dsklist" style="margin-top:0; font-weight:normal; color: #000;">${erfolge.map(n => `<li>${n}</li>`).join("")}</ul>
           </div>` : ``;

    const fehlschlagHtml = fehler.length > 0
        ? `<div style="margin-top: 10px; margin-bottom: 10px;">
               <p style="margin-bottom: 5px;"><span style="color:#B30000; font-weight:bold;">Fehlschlag</span></p>
               <ul class="dsklist" style="margin-top:0; font-weight:normal; color: #000;">${fehler.map(f => `<li>${f.name} (${f.grund})</li>`).join("")}</ul>
           </div>` : ``;

    const cardContent = `
        <div style="font-family: 'Signika', sans-serif;">
            ${DSK_FW.UI.Header(gabenName, DSK_FW.Symbol(ahne))}
            <div class="dskbox2" style="margin-top:10px;">
                <p><b>Gabenwirkung:</b></p>
                <p style="margin-top:0;">${basisBeschreibung}</p>
                <p style="margin-top:5px; font-size:0.9em;">${besonderheiten}</p>
                ${erfolgHtml}
                ${fehlschlagHtml}
                <hr>
                <p style="text-align:center; font-weight:bold;">
                    Wirkungsdauer: ${dauerMinuten} Min. ${dauerCalc}
                </p>
            </div>
        </div>
    `;

    let msg = alteMessageId ? game.messages.get(alteMessageId) : null;
    if (msg) {
        await msg.update({ content: cardContent });
    } else {
        const neueMsg = await ChatMessage.create({
            speaker: { alias: "System" },
            whisper: Array.from(ownerIds).filter(id => game.users.get(id)),
            content: cardContent
        });
        if (neueMsg && fehler.length > 0 && erfolge.length === 0) {
            await casterActor.setFlag("world", "letzteGabenMessageId", neueMsg.id);
        }
    }
})();
