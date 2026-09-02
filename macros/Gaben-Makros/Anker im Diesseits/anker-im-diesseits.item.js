// ==========================================
// ⚠️ WICHTIG: Dieses Macro lädt das DSK‑Gabenmakro aus einem Compendium‑Macro und zieht die AeP vom Akteur ab.
// Stelle sicher, dass die beiden UUIDs korrekt sind:
//  - Gaben‑Macro UUID (macroLink) — das Macro, das die Gabe steuert
//
// Tausche die UUIDs in diesem File mti deiner eigenen aus.
// Gaben‑Macro UUID (Macro, das die Gabe steuert):
//   Compendium.dsk-havena-und-umland.makros.Macro.9o8JAe6CkggaxRiv
// ==========================================



        // ==========================================
        // ⚙️ KONFIGURATION: GABEN-DETAILS HIER EINTRAGEN
        // ==========================================
        const gabenName = "Anker im Diesseits (Zerzal)";
        const aepKosten = 16;
        const macroLink = "@UUID[Compendium.dsk-havena-und-umland.makros.Macro.9o8JAe6CkggaxRiv]{Anker wirken}";
        const iconBild = "https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/systems/dsk/icons/categories/ahnengabe.webp";
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
        
            // --- 2. AKTEUR ERMITTELN (Aus Chatkarte oder Token) ---
            let wirkenderActor = null;
            if (typeof actor !== "undefined" && actor) {
                wirkenderActor = actor; 
            } else if (typeof testData !== "undefined" && testData && testData.speaker) {
                wirkenderActor = game.actors.get(testData.speaker.actor);
            }
            if (!wirkenderActor) wirkenderActor = canvas.tokens.controlled[0]?.actor;
            if (!wirkenderActor) wirkenderActor = game.user.character;
        
            if (!wirkenderActor) {
                return ui.notifications.warn("Luna sagt 🌙: Ich konnte den Wirkenden nicht finden!");
            }
            
            // --- 3. AKTUELLE AeP AUSLESEN & PRÜFEN ---
            const currentAeP = foundry.utils.getProperty(wirkenderActor, "system.stats.AeP.value") || 0;
            
            let htmlInhalt = "";
            let topHeader = "";
        
            if (currentAeP < aepKosten) {
                // FEHLSCHLAG: Nicht genug Kraft
                topHeader = "Fehlschlag";
                
                await wirkenderActor.update({ "system.stats.AeP.value": 0 });
                
                htmlInhalt = `
                    <p style="margin-bottom: 8px;"><b>${wirkenderActor.name}</b> hat versucht, die Gabe zu wirken.</p>
                    <hr style="margin: 8px 0; border: 0; border-top: 1px solid #c9bca6;">
                    <p style="margin-bottom: 8px; color: #8b0000;"><b>Fehlschlag!</b> Die Kraft reicht nicht aus.</p>
                    <p style="margin-bottom: 8px;">Die restlichen <b>${currentAeP} AeP</b> wurden verbraucht, aber die Gabe schlägt fehl.</p>
                `;
            } else {
                // ERFOLG: Genug Kraft
                topHeader = "Wirkungsbeginn"; 
                
                let ermittelteQS = 1;
                if (typeof testData !== "undefined") {
                    ermittelteQS = Number(testData?.result?.QL || testData?.qualityStep || 1);
                }
                await wirkenderActor.setFlag("world", "letzteGabenQS", ermittelteQS);
                
                await wirkenderActor.update({ "system.stats.AeP.value": currentAeP - aepKosten });
                
                htmlInhalt = `
                    <p style="margin-bottom: 8px;"><b>${wirkenderActor.name}</b> hat die Gabe gewirkt.</p>
                    <hr style="margin: 8px 0; border: 0; border-top: 1px solid #c9bca6;">
                    <p style="margin-bottom: 8px; color: #76301b;"><b>Kosten:</b> Die AeP in Höhe von <b>${aepKosten}</b> sind abgezogen worden.</p>
                    <hr style="margin: 8px 0; border: 0; border-top: 1px solid #c9bca6;">
                    <p style="margin-bottom: 8px;">Bitte klicke hier, um Geist und Anker zu bestimmen:</p>
                    <span style="font-size: 15px;">${macroLink}</span>
                `;
            }
            
            // --- 4. CHAT-NACHRICHT BAUEN & SENDEN ---
            const contentHtml = `
                <div style="font-family: 'Signika', sans-serif;">
                    <div class="dskbox1">
                        <p style="display:flex; gap:8px; align-items:center; margin:0; white-space:nowrap;">
                            <img src="${iconBild}" style="width:28px; height:28px; border:none; background:transparent; flex-shrink:0;">
                            <b style="font-size: 1.05em;">${topHeader}</b>
                        </p>
                        <p style="font-weight:bold; margin-top:6px; margin-bottom:0;">${gabenName}</p>
                    </div>
                    <div class="dskbox2" style="margin-top:10px; text-align: center;">
                        ${htmlInhalt}
                    </div>
                </div>
            `;
            
            await ChatMessage.create({
                speaker: { alias: "System" },
                content: contentHtml
            });
        })();
