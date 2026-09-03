// ==========================================
        // ⚙️ KONFIGURATION: GABEN-DETAILS HIER EINTRAGEN
        // ==========================================
        const gabenName = "Blick in die Seele (Zerzal)";
        const aepKosten = 4;
        const macroLink = "@UUID[Compendium.dsk-havena-und-umland.makros.Macro.gxZYosqFL3ogGhdQ]{Blick wirken}";
        const iconBild = "https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/systems/dsk/icons/categories/ahnengabe.webp";
        // ==========================================
        
        (async () => {
            // Framework laden
            if (typeof DSK === "undefined" || !globalThis.DSK) {
                const fwMacro = await fromUuid("Compendium.dsk-havena-und-umland.makros.Macro.fHQ2OuDo3Fe3spBn");
                if (fwMacro) await fwMacro.execute();
                await new Promise(resolve => setTimeout(resolve, 150)); 
            }
            const DSK_FW = globalThis.DSK || DSK; 
        
            // Akteur ermitteln
            let wirkenderActor = canvas.tokens.controlled[0]?.actor || game.user.character;
            if (!wirkenderActor) return ui.notifications.warn("Luna sagt 🌙: Kein Wirkender gefunden!");
            
            const currentAeP = foundry.utils.getProperty(wirkenderActor, "system.stats.AeP.value") || 0;
            
            if (currentAeP < aepKosten) {
                await wirkenderActor.update({ "system.stats.AeP.value": 0 });
                return ChatMessage.create({
                    speaker: { alias: "System" },
                    content: `<div class="dskbox1"><b>Fehlschlag</b></div><div class="dskbox2">Nicht genug AeP! (Verfügbar: ${currentAeP}/${aepKosten})</div>`
                });
            }
        
            // QS speichern (Flag löschen wir erst bei Erfolg!)
            let ermittelteQS = 1;
            if (typeof testData !== "undefined") ermittelteQS = Number(testData?.result?.QL || testData?.qualityStep || 1);
            await wirkenderActor.setFlag("world", "letzteGabenQS", ermittelteQS);
            
            await wirkenderActor.update({ "system.stats.AeP.value": currentAeP - aepKosten });
            
            await ChatMessage.create({
                speaker: { alias: "System" },
                content: `
                    <div style="font-family: 'Signika', sans-serif;">
                        <div class="dskbox1"><p><img src="${iconBild}" style="width:28px; border:none;"> <b>Wirkungsbeginn</b></p><b>${gabenName}</b></div>
                        <div class="dskbox2" style="margin-top:10px; text-align: center;">
                            <p><b>${wirkenderActor.name}</b> konzentriert sich auf die Seele des Ziels.</p>
                            <hr>
                            <p style="color: #76301b;">Kosten: ${aepKosten} AeP abgezogen.</p>
                            <hr>
                            <span style="font-size: 15px;">${macroLink}</span>
                        </div>
                    </div>
                `
            });
        })();
