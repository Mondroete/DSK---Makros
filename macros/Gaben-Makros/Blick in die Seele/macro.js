// ==========================================
// ⚙️ LUNAS WIRKUNG: BLICK IN DIE SEELE (V13 Ready - Reines Namens-Design)
// ==========================================

(async () => {
    // Framework laden
    const fwMacro = await fromUuid("Compendium.dsk-havena-und-umland.makros.Macro.fHQ2OuDo3Fe3spBn");
    if (fwMacro) await fwMacro.execute();
    const DSK_FW = globalThis.DSK || DSK; 

    const gabenName = "Blick in die Seele (Zerzal)";
    const ahne = "zerzal";
    const maxReichweite = 8;

    if (DSK_FW.EffektEnde) {
        DSK_FW.EffektEnde.Register("blickInDieSeele", gabenName, "Der Blick in die Seele endet. Die tiefen Antriebe und Wünsche sind wieder verborgen.");
    }

    // --- 1. AKTEUR & QS ---
    const casterActor = canvas.tokens.controlled[0]?.actor || game.user.character;
    if (!casterActor) return ui.notifications.warn("Kein Wirkender gefunden!");
    
    const qs = casterActor.getFlag("world", "letzteGabenQS") || 1;
    const alteMessageId = casterActor.getFlag("world", "letzteGabenMessageId");

    // --- 2. BERECHNUNGEN (Dünn) ---
    const dauerMinuten = qs;
    const thinStyle = 'style="font-weight: 300; font-size: 0.9em; opacity: 0.8;"';
    const dauerCalc = `<span ${thinStyle}>(${qs} QS x 1 Min.)</span>`;
    
    const beschreibung = `Behält das Zerzalkind sein Ziel eine Minute im Blick, kann es spüren, was sein Ziel besonders antreibt.`;
    const besonderheiten = `<b>Zielkategorie:</b> Menschen, Tiere, Erwachte<br><b>Reichweite:</b> ${maxReichweite} Schritt`;

    // --- 3. TARGETS ---
    const targetedTokens = Array.from(game.user.targets);
    if (targetedTokens.length === 0) return ui.notifications.warn("Bitte wähle ein Ziel per Target aus!");

    const erfolge = [];
    const fehler = [];

    // --- 4. SCHLEIFE ---
    for (let t of targetedTokens) {
        if (!t.actor) continue;

        // Distanz-Check
        const distanz = DSK_FW.Distanz(canvas.tokens.controlled[0], t);
        if (distanz > maxReichweite) {
            fehler.push(t.name);
            continue;
        }

        // Wesen-Check
        const istErwachterOderNpc = DSK_FW.Effekt.CheckTarget(t.actor, "erwachte");
        const istTier = DSK_FW.Wesen.match(t.actor, ["tier", "tiere", "animal", "mensch", "menschen"]);
        if (!istErwachterOderNpc && !istTier) {
            fehler.push(t.name);
            continue;
        }

        // Effekt
        await DSK_FW.Effekt.Anwenden({
            name: gabenName,
            ahne: ahne,
            beschreibung: beschreibung,
            qs: qs,
            ziel: t.actor
        });

        const eff = t.actor.effects.find(e => e.name === gabenName);
        if (eff) {
            await eff.update({ duration: { seconds: dauerMinuten * 60 } });
            erfolge.push(t.name);
        }
    }

    // --- 5. FLAG-CLEANUP (Nur bei Erfolg) ---
    if (erfolge.length > 0) {
        await casterActor.unsetFlag("world", "letzteGabenQS");
        await casterActor.unsetFlag("world", "letzteGabenMessageId");
    }

    // --- 6. CHATKARTE ---
    let ownerIds = new Set(game.users.filter(u => u.isGM).map(u => u.id));
    [...targetedTokens, canvas.tokens.controlled[0]].forEach(t => {
        if(t?.actor) Object.entries(t.actor.ownership || {}).filter(([id, lvl]) => lvl === 3).forEach(([id]) => ownerIds.add(id));
    });

    const erfolgHtml = erfolge.length > 0 ? `<div style="margin-top: 10px; margin-bottom: 10px;"><p style="margin-bottom: 5px;"><span style="color:#18940F; font-weight:bold;">Erfolg</span></p><ul class="dsklist" style="margin-top:0; font-weight:normal; color: #000;">${erfolge.map(n => `<li>${n}</li>`).join("")}</ul></div>` : "";
    const fehlschlagHtml = fehler.length > 0 ? `<div style="margin-top: 10px; margin-bottom: 10px;"><p style="margin-bottom: 5px;"><span style="color:#B30000; font-weight:bold;">Fehlschlag</span></p><ul class="dsklist" style="margin-top:0; font-weight:normal; color: #000;">${fehler.map(n => `<li>${n}</li>`).join("")}</ul></div>` : "";

    const cardContent = `
        <div style="font-family:'Signika',sans-serif;">
            ${DSK_FW.UI.Header(gabenName, DSK_FW.Symbol(ahne))}
            <div class="dskbox2" style="margin-top:10px;">
                <p><b>Gabenwirkung:</b> ${beschreibung}</p>
                <p style="font-size: 0.9em;">${besonderheiten}</p>
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
