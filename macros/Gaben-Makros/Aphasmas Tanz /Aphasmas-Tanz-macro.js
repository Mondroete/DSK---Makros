
// ==========================================
// ⚙️ LUNAS WIRKUNG: APHASMAS TANZ (V13 Ready - FW Modus)
// ==========================================

(async () => {
    const fwMacro = await fromUuid("Compendium.dsk-havena-und-umland.makros.Macro.fHQ2OuDo3Fe3spBn");
    if (fwMacro) await fwMacro.execute();
    const DSK_FW = globalThis.DSK || DSK; 

    const gabenName = "Aphasmas Tanz (Aphasma)";
    const ahne = "aphasma";

    // Wirkungsende registrieren
    if (DSK_FW.EffektEnde) {
        DSK_FW.EffektEnde.Register("aphasmastanz", gabenName, "Die Wirkung ist abgelaufen und die Erschwernisse sind verflogen.");
    }

    // --- AKTEUR & QS ---
    const casterActor = canvas.tokens.controlled[0]?.actor || game.user.character;
    const qs = casterActor.getFlag("world", "letzteGabenQS") || 1;
    await casterActor.unsetFlag("world", "letzteGabenQS");

    // --- SCHLEIER-CHECK ---
    const hatSchleier = casterActor.effects.some(e => (e.name || e.label || "").toLowerCase().includes("aphasmas schleier"));
    if (!hatSchleier) {
        return ChatMessage.create({
            speaker: { alias: "System" },
            content: `
                ${DSK_FW.UI.Header(gabenName, DSK_FW.Symbol("aphasma"))}
                <div class="dskbox2" style="margin-top:10px; text-align:center; color:#B30000; font-weight:bold;">
                    Kein geweihter Schleier getragen! Der Tanz verfehlt seine Wirkung.
                </div>
            `
        });
    }

    // --- ZIELE HOLEN (Foundry Targets) ---
    const targets = Array.from(game.user.targets);
    if (targets.length === 0) return ui.notifications.warn("Bitte wähle Ziele per Target aus!");

    const erschwernis = qs * 2;
    const erfolge = [];
    const fehler = [];

    // --- EFFEKTE ANWENDEN ---
    for (let t of targets) {
        if (!t.actor) continue;

        if (!DSK_FW.Effekt.CheckTarget(t.actor, "erwachte")) {
            fehler.push({ name: t.name, grund: "Kein Erwachter" });
            continue;
        }

        const desc = `Erschwernis von ${erschwernis} FW auf Willenskraft und Sinnesschärfe.`;
        
        await DSK_FW.Effekt.Anwenden({
            name: gabenName,
            ahne: ahne,
            beschreibung: desc,
            gabeZiel: "erwachte",
            qs: qs,
            ziel: t.actor
        });

        const eff = t.actor.effects.find(e => e.name === gabenName);
        if (eff) {
            // HIER FW MODUS: -erschwernis (ohne +)
            await eff.update({
                changes: [
                    { key: "system.skillModifiers.FW", mode: 2, value: `Willenskraft -${erschwernis}`, priority: 20 },
                    { key: "system.skillModifiers.FW", mode: 2, value: `Sinnesschärfe -${erschwernis}`, priority: 20 }
                ]
            });
            erfolge.push(t.name);
        }
    }

    // --- WHISPER & CHAT-AUSGABE ---
    let ownerIds = new Set(game.users.filter(u => u.isGM).map(u => u.id));
    [...targets, canvas.tokens.controlled[0]].forEach(t => {
        if(t?.actor) Object.entries(t.actor.ownership || {}).filter(([id, lvl]) => lvl === 3).forEach(([id]) => ownerIds.add(id));
    });

    const erfolgHtml = erfolge.length > 0 
        ? `<div style="margin-top: 10px; margin-bottom: 10px;">
             <p style="margin-bottom: 5px;"><span style="color:#18940F; font-weight:bold;">Erfolg</span></p>
             <ul class="dsklist" style="margin-top:0; font-weight:normal;">
                 ${erfolge.map(n => `<li>${n}</li>`).join("")}
             </ul>
           </div>` : ``;

    const fehlschlagHtml = fehler.length > 0
        ? `<div style="margin-top: 10px; margin-bottom: 10px;">
             <p style="margin-bottom: 5px;"><span style="color:#B30000; font-weight:bold;">Fehlschlag</span></p>
             <ul class="dsklist" style="margin-top:0; font-weight:normal;">
                 ${fehler.map(f => `<li>${f.name} (${f.grund})</li>`).join("")}
             </ul>
           </div>` : ``;

    await ChatMessage.create({
        speaker: { alias: "System" },
        whisper: Array.from(ownerIds).filter(id => game.users.get(id)),
        content: `
            <div style="font-family: 'Signika', sans-serif;">
                ${DSK_FW.UI.Header(gabenName, DSK_FW.Symbol(ahne))}
                <div class="dskbox2" style="margin-top:10px;">
                    <p style="margin-bottom: 5px;"><b>Gabenwirkung:</b></p>
                    <p style="margin-top:0;">Erschwernis von ${erschwernis} FW auf Willenskraft und Sinnesschärfe.</p>
                    ${erfolgHtml}
                    ${fehlschlagHtml}
                </div>
            </div>
        `
    });
})();
