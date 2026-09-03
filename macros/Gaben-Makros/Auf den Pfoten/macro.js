// ==========================================
// ⚙️ LUNAS WIRKUNG: AUF DEN PFOTEN (V13 Ready)
// ==========================================

(async () => {
    const fwMacro = await fromUuid("Compendium.dsk-havena-und-umland.makros.Macro.fHQ2OuDo3Fe3spBn");
    if (fwMacro) await fwMacro.execute();
    const DSK_FW = globalThis.DSK || DSK; 

    const gabenName = "Auf den Pfoten (Zerzal)";
    const ahne = "zerzal";

    // Wirkungsende registrieren
    if (DSK_FW.EffektEnde) {
        DSK_FW.EffektEnde.Register("aufDenPfoten", gabenName, "Die samtpfotige Leichtigkeit schwindet. Stürze werden nicht mehr magisch abgefedert.");
    }

    // --- AKTEUR & QS ---
    const casterActor = canvas.tokens.controlled[0]?.actor || game.user.character;
    const qs = casterActor.getFlag("world", "letzteGabenQS") || 1;
    await casterActor.unsetFlag("world", "letzteGabenQS");

    // --- ZIELE HOLEN ---
    const targets = Array.from(game.user.targets);
    if (targets.length === 0) return ui.notifications.warn("Bitte wähle Ziele per Target aus!");

    const schrittReduktion = qs * 2;
    const dauerMinuten = qs;
    
    const erfolge = [];
    const fehler = [];

    // --- EFFEKTE ANWENDEN ---
    for (let t of targets) {
        if (!t.actor) continue;

        // Wesen Check: Muss ein Lebewesen sein (keine Geister, Untote, etc.)
        const ausgeschlosseneWesen = ["geist", "geister", "vampir", "untot", "dämon"];
        const istLebewesen = !DSK_FW.Wesen.match(t.actor, ausgeschlosseneWesen);
        
        if (!istLebewesen) {
            fehler.push({ name: t.name, grund: "Kein Lebewesen" });
            continue;
        }

        const desc = `Bei einem Sturz wird die gefallene Strecke um ${schrittReduktion} Schritt verringert.`;
        
        await DSK_FW.Effekt.Anwenden({
            name: gabenName,
            ahne: ahne,
            beschreibung: desc,
            gabeZiel: "", // Manuelle Prüfung erfolgt
            qs: qs,
            ziel: t.actor
        });

        const eff = t.actor.effects.find(e => e.name === gabenName);
        if (eff) {
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
             <p style="margin-bottom: 0px;"><span style="color:#B30000; font-weight:bold;">Fehlschlag</span></p>
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
                    <p><b>Gabenwirkung:</b></p>
                    <p style="margin-top:0;">Sturz-Strecke um <b>${schrittReduktion} Schritt</b> reduziert.</p>
                    ${erfolgHtml}
                    ${fehlschlagHtml}
                    <hr>
                    <p style="text-align:center; font-weight:bold;">
                        Dauer: ${dauerMinuten} Min.
                    </p>
                </div>
            </div>
        `
    });
})();
