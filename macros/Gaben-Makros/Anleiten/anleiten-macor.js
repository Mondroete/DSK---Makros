// ==========================================
// ⚙️ LUNAS WIRKUNG: ANLEITEN (V13 Ready - Dünne Berechnungen & Karten-Update)
// ==========================================

(async () => {
    // Framework laden
    const fwMacro = await fromUuid("Compendium.dsk-havena-und-umland.makros.Macro.fHQ2OuDo3Fe3spBn");
    if (fwMacro) await fwMacro.execute();
    const DSK_FW = globalThis.DSK || DSK; 

    const gabenName = "Anleiten (Nurti) - Selbstvertrauen";
    const ahne = "nurti";
    const maxReichweite = 1; // Berührung

    if (DSK_FW.EffektEnde) {
        DSK_FW.EffektEnde.Register("anleitenNurti", gabenName, "Das gestärkte Selbstvertrauen schwindet.");
    }

    // --- 1. AKTEUR & QS ---
    const casterActor = canvas.tokens.controlled[0]?.actor || game.user.character;
    if (!casterActor) return ui.notifications.warn("Luna sagt 🌙: Kein Wirkender gefunden!");
    
    // QS holen, aber Flag NICHT löschen (das passiert erst bei Erfolg!)
    const qs = casterActor.getFlag("world", "letzteGabenQS") || 1;
    const alteMessageId = casterActor.getFlag("world", "letzteGabenMessageId");

    // --- 2. BERECHNUNGEN (Dünn für die Karte) ---
    const stufen = Math.max(1, Math.round(qs / 2));
    const dauerMinuten = qs * 5;
    const thinStyle = 'style="font-weight: 300; font-size: 0.9em; opacity: 0.8;"';
    
    const stufenCalc = `<span ${thinStyle}>(${qs} QS / 2)</span>`;
    const dauerCalc = `<span ${thinStyle}>(${qs} QS x 5)</span>`;

    // --- 3. ZIELE HOLEN (Foundry Targets) ---
    const targets = Array.from(game.user.targets);
    if (targets.length === 0) return ui.notifications.warn("Luna sagt 🌙: Bitte wähle Ziele per Target aus!");

    // --- 4. EFFEKTE ANWENDEN ---
    const erfolge = [];
    const fehler = [];

    for (let t of targets) {
        if (!t.actor) continue;

        // Reichweiten-Check
        const distanz = DSK_FW.Distanz(canvas.tokens.controlled[0], t);
        if (distanz > maxReichweite) {
            fehler.push({ name: t.name, grund: "Zu weit weg" });
            continue;
        }

        // Erfolg/Wesen Check
        if (!DSK_FW.Effekt.CheckTarget(t.actor, "erwachte")) {
            fehler.push({ name: t.name, grund: "Kein Erwachter" });
            continue;
        }

        // Effekt anwenden (legt den Basis-Effekt über das Framework an)
        await DSK_FW.Effekt.Anwenden({
            name: gabenName,
            ahne: ahne,
            beschreibung: `Erhöht Selbstvertrauen um ${stufen} Stufe(n).`,
            gabeZiel: "erwachte",
            qs: qs,
            ziel: t.actor
        });

        // 🚩 LUNAS FIX: Nur noch Status und Flags, keine doppelten Changes mehr!
        const eff = t.actor.effects.find(e => (e.name || e.label) === gabenName);
        if (eff) {
            await eff.update({
                statuses: ["selfconfidence"], // Sagt dem System "Das ist der offizielle Status!"
                "flags.dsk.value": stufen,    // Zeigt die Stufe (1-4) im Icon an und gibt dem System den Wert
                "flags.dsk.manual": stufen,
                "flags.dsk.auto": 0
            });
            erfolge.push(t.name);
        }
    }

    // --- 5. FLAG-CLEANUP (Nur bei Erfolg) ---
    if (erfolge.length > 0) {
        await casterActor.unsetFlag("world", "letzteGabenQS");
        await casterActor.unsetFlag("world", "letzteGabenMessageId");
    }

    // --- 6. CHAT-KARTE (Update oder Neu) ---
    let ownerIds = new Set(game.users.filter(u => u.isGM).map(u => u.id));
    [...targets, canvas.tokens.controlled[0]].forEach(t => {
        if(t?.actor) Object.entries(t.actor.ownership || {}).filter(([id, lvl]) => lvl === 3).forEach(([id]) => ownerIds.add(id));
    });

    const erfolgHtml = erfolge.length > 0 
        ? `<div style="margin-top: 10px; margin-bottom: 10px;">
               <p style="margin-bottom: 5px;"><span style="color:#18940F; font-weight:bold;">Erfolg</span></p>
               <ul class="dsklist" style="margin-top:0; font-weight:normal; color: #000;">
                   ${erfolge.map(n => `<li>${n}</li>`).join("")}
               </ul>
           </div>` : ``;

    const fehlschlagHtml = fehler.length > 0
        ? `<div style="margin-top: 10px; margin-bottom: 10px;">
               <p style="margin-bottom: 5px;"><span style="color:#B30000; font-weight:bold;">Fehlschlag</span></p>
               <ul class="dsklist" style="margin-top:0; font-weight:normal; color: #000;">
                   ${fehler.map(f => `<li>${f.name} (${f.grund})</li>`).join("")}
               </ul>
           </div>` : ``;

    const cardContent = `
        <div style="font-family: 'Signika', sans-serif;">
            ${DSK_FW.UI.Header(gabenName, DSK_FW.Symbol(ahne))}
            <div class="dskbox2" style="margin-top:10px;">
                <p style="margin-bottom: 5px;"><b>Gabenwirkung:</b></p>
                <p style="margin-top:0;">Erhöht für ${dauerMinuten} Min. Status Selbstvertrauen um <b>${stufen} Stufe(n)</b> ${stufenCalc}.</p>
                ${erfolgHtml}
                ${fehlschlagHtml}
                <hr>
                <p style="text-align:center; font-weight:bold;">
                    Dauer: ${dauerMinuten} Min. ${dauerCalc}
                </p>
            </div>
        </div>
    `;

    // Aktualisieren oder neu senden
    let msg = alteMessageId ? game.messages.get(alteMessageId) : null;
    if (msg) {
        await msg.update({ content: cardContent });
    } else {
        const neueMsg = await ChatMessage.create({
            speaker: { alias: "System" },
            whisper: Array.from(ownerIds).filter(id => game.users.get(id)),
            content: cardContent
        });
        if (neueMsg && erfolge.length === 0) {
            await casterActor.setFlag("world", "letzteGabenMessageId", neueMsg.id);
        }
    }
})();
