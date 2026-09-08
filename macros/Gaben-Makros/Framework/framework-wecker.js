// ==========================================
// 🌙 LUNAS WECKER (Der Kompendium-Bibliothekar & Item-Staubsauger)
// ==========================================
(async () => {
    // --- 1. FRAMEWORK WECKEN ---
    const fwMacro = await fromUuid("Compendium.dsk-havena-und-umland.makros.Macro.fHQ2OuDo3Fe3spBn");
    if (fwMacro) await fwMacro.execute();
    await new Promise(resolve => setTimeout(resolve, 150));

    const DSK_FW = globalThis.DSK || DSK;
    if (!DSK_FW || !DSK_FW.EffektEnde) return ui.notifications.error("Luna sagt 🌙: Framework fehlerhaft!");

    // --- 2. KOMPENDIUM LADEN ---
    const pack = game.packs.get("dsk-havena-und-umland.makros");
    if (!pack) return ui.notifications.error("Luna sagt 🌙: Kompendium nicht gefunden!");
    const alleMakros = await pack.getDocuments();

    const gefundeneEffekte = new Set();
    const reaktivierteGaben = new Set();

    // --- 3. ALLE AKTEURE SCANNEN ---
    const alleAkteure = new Set();
    if (canvas.scene) canvas.scene.tokens.forEach(t => { if(t.actor) alleAkteure.add(t.actor); });
    game.actors.forEach(a => alleAkteure.add(a));

    for (let actor of alleAkteure) {
        for (let effect of actor.effects) {
            const eName = effect.name || effect.label || "";
            
            if (!eName.includes("(")) continue;

            const basisName = eName.split("(")[0].trim();

            // --- 4. MAKRO IM KOMPENDIUM SUCHEN ---
            const macro = alleMakros.find(m => m.name === basisName);
            
            if (macro) {
                gefundeneEffekte.add(effect.id);
                reaktivierteGaben.add(eName);
                
                const codeText = macro.command; 

                const match = codeText.match(/EffektEnde\.Register\s*\(\s*[^,]+,\s*[^,]+,\s*(["'`])(.*?)\1\s*\)/);
                const beschreibung = match ? match[2] : `Die Kraft von ${eName} verblasst.`;

                DSK_FW.EffektEnde.Register(effect.id, eName, beschreibung);

                // --- 5. SICHERHEITSNETZE & WÄCHTER (Live-Sync & Item-Cleanup) ---
                if (!globalThis._lunasSicherheitsNetz) {
                    globalThis._lunasSicherheitsNetz = true;

                    // 🧹 UNIVERSALLER ITEM-STAUBSAUGER (z.B. für Geisterfreund)
                    Hooks.on("preDeleteActiveEffect", async (eff) => {
                        if (!game.user.isGM || !eff.parent) return;
                        const effName = eff.name || eff.label || "";
                        
                        const ahnenListe = ["Aphasma", "Nurti", "Zerzal", "Brona", "Rondra", "Faris", "Zirraku", "Bishdariel", "Numinoru", "Zsahh"];
                        const isGabe = ahnenListe.some(ahne => effName.includes(`(${ahne})`));

                        if (isGabe) {
                            // Sucht ein Item/Sonderfertigkeit mit EXAKT demselben Namen wie der Effekt
                            const linkedItem = eff.parent.items.find(i => i.name === effName);
                            if (linkedItem) {
                                await linkedItem.delete();
                            }
                        }
                    });

                    // 🦇 FLEDERMAUS-SYNC
                    Hooks.on("updateActor", async (updatedActor, changes, options) => {
                        if (!game.user.isGM || options.dskFledermausSync) return; 
                        const lepChange = foundry.utils.getProperty(changes, "system.stats.LeP.value");
                        const aepChange = foundry.utils.getProperty(changes, "system.stats.AeP.value");
                        if (lepChange === undefined && aepChange === undefined) return;

                        if (updatedActor.isToken) { 
                            const casterUuid = updatedActor.token.getFlag("dsk", "isFledermausVon");
                            if (casterUuid) {
                                const casterAct = await fromUuid(casterUuid);
                                if (casterAct) {
                                    let finalUpdate = {};
                                    if (lepChange !== undefined) {
                                        const batMax = updatedActor.system.stats.LeP.max || 1;
                                        const pct = Math.max(0, Math.min(1, lepChange / batMax));
                                        finalUpdate["system.stats.LeP.value"] = Math.round((casterAct.system.stats.LeP.max || 1) * pct);
                                    }
                                    if (aepChange !== undefined) {
                                        const batMax = updatedActor.system.stats.AeP.max || 1;
                                        const pct = Math.max(0, Math.min(1, aepChange / batMax));
                                        finalUpdate["system.stats.AeP.value"] = Math.round((casterAct.system.stats.AeP.max || 1) * pct);
                                    }
                                    if (Object.keys(finalUpdate).length > 0) await casterAct.update(finalUpdate, { dskFledermausSync: true });
                                }
                            }
                        } else { 
                            const bats = canvas.scene ? canvas.scene.tokens.filter(t => t.getFlag("dsk", "isFledermausVon") === updatedActor.uuid) : [];
                            for (let bat of bats) {
                                if (bat.actor) {
                                    let finalUpdate = {};
                                    if (lepChange !== undefined) {
                                        const casterMax = updatedActor.system.stats.LeP.max || 1;
                                        const pct = Math.max(0, Math.min(1, lepChange / casterMax));
                                        finalUpdate["system.stats.LeP.value"] = Math.max(1, Math.round((bat.actor.system.stats.LeP.max || 1) * pct));
                                    }
                                    if (aepChange !== undefined) {
                                        const casterMax = updatedActor.system.stats.AeP.max || 1;
                                        const pct = Math.max(0, Math.min(1, aepChange / casterMax));
                                        finalUpdate["system.stats.AeP.value"] = Math.round((bat.actor.system.stats.AeP.max || 1) * pct);
                                    }
                                    if (Object.keys(finalUpdate).length > 0) await bat.actor.update(finalUpdate, { dskFledermausSync: true });
                                }
                            }
                        }
                    });

                    // 🐁 MAUS-SYNC
                    Hooks.on("updateActor", async (updatedActor, changes, options) => {
                        if (!game.user.isGM || options.dskMausSync) return; 
                        const lepChange = foundry.utils.getProperty(changes, "system.stats.LeP.value");
                        const aepChange = foundry.utils.getProperty(changes, "system.stats.AeP.value");
                        if (lepChange === undefined && aepChange === undefined) return;

                        if (updatedActor.isToken) { 
                            const targetUuid = updatedActor.token.getFlag("dsk", "isMausVon");
                            if (targetUuid) {
                                const targetAct = await fromUuid(targetUuid);
                                if (targetAct) {
                                    let finalUpdate = {};
                                    if (lepChange !== undefined) {
                                        const mouseMax = updatedActor.system.stats.LeP.max || 1;
                                        const pct = Math.max(0, Math.min(1, lepChange / mouseMax));
                                        finalUpdate["system.stats.LeP.value"] = Math.round((targetAct.system.stats.LeP.max || 1) * pct);
                                    }
                                    if (aepChange !== undefined) {
                                        const mouseMax = updatedActor.system.stats.AeP.max || 1;
                                        const pct = Math.max(0, Math.min(1, aepChange / mouseMax));
                                        finalUpdate["system.stats.AeP.value"] = Math.round((targetAct.system.stats.AeP.max || 1) * pct);
                                    }
                                    if (Object.keys(finalUpdate).length > 0) await targetAct.update(finalUpdate, { dskMausSync: true });
                                }
                            }
                        } else { 
                            const mice = canvas.scene ? canvas.scene.tokens.filter(t => t.getFlag("dsk", "isMausVon") === updatedActor.uuid) : [];
                            for (let mouse of mice) {
                                if (mouse.actor) {
                                    let finalUpdate = {};
                                    if (lepChange !== undefined) {
                                        const targetMax = updatedActor.system.stats.LeP.max || 1;
                                        const pct = Math.max(0, Math.min(1, lepChange / targetMax));
                                        finalUpdate["system.stats.LeP.value"] = Math.max(1, Math.round((mouse.actor.system.stats.LeP.max || 1) * pct));
                                    }
                                    if (aepChange !== undefined) {
                                        const targetMax = updatedActor.system.stats.AeP.max || 1;
                                        const pct = Math.max(0, Math.min(1, aepChange / targetMax));
                                        finalUpdate["system.stats.AeP.value"] = Math.round((mouse.actor.system.stats.AeP.max || 1) * pct);
                                    }
                                    if (Object.keys(finalUpdate).length > 0) await mouse.actor.update(finalUpdate, { dskMausSync: true });
                                }
                            }
                        }
                    });

                    // 🐾 TIER-CLEANUP (Löscht Token & stellt Sichtbarkeit her)
                    Hooks.on("deleteActiveEffect", async (eff) => {
                        if (!game.user.isGM) return; 
                        const effName = eff.name || eff.label || "";

                        if (effName.includes("Fledermausleib")) {
                            const actorUuid = eff.parent?.uuid;
                            if (!actorUuid) return;
                            const bats = canvas.scene.tokens.filter(t => t.getFlag("dsk", "isFledermausVon") === actorUuid);
                            if (bats.length > 0) {
                                const batActor = bats[0].actor;
                                if (batActor && eff.parent) {
                                    let finalUpdate = {};
                                    const batLeVal = batActor.system.stats.LeP.value;
                                    if (batLeVal !== undefined) {
                                        const batMax = batActor.system.stats.LeP.max || 1;
                                        const pct = Math.max(0, Math.min(1, batLeVal / batMax));
                                        finalUpdate["system.stats.LeP.value"] = Math.round((eff.parent.system.stats.LeP.max || 1) * pct);
                                    }
                                    const batAeVal = batActor.system.stats.AeP.value;
                                    if (batAeVal !== undefined) {
                                        const batMax = batActor.system.stats.AeP.max || 1;
                                        const pct = Math.max(0, Math.min(1, batAeVal / batMax));
                                        finalUpdate["system.stats.AeP.value"] = Math.round((eff.parent.system.stats.AeP.max || 1) * pct);
                                    }
                                    if (Object.keys(finalUpdate).length > 0) await eff.parent.update(finalUpdate, { dskFledermausSync: true });
                                }
                            }
                            const hiddenId = eff.getFlag("dsk", "hiddenTokenId");
                            if (hiddenId) {
                                const origToken = canvas.scene.tokens.get(hiddenId);
                                if (origToken) await origToken.update({ hidden: false });
                            }
                            if (bats.length > 0) await canvas.scene.deleteEmbeddedDocuments("Token", bats.map(t => t.id));
                        }

                        if (effName.includes("Mäusemeister")) {
                            const actorUuid = eff.parent?.uuid;
                            if (!actorUuid) return;
                            const mice = canvas.scene.tokens.filter(t => t.getFlag("dsk", "isMausVon") === actorUuid);
                            if (mice.length > 0) {
                                const mouseActor = mice[0].actor;
                                if (mouseActor && eff.parent) {
                                    let finalUpdate = {};
                                    const mouseLeVal = mouseActor.system.stats.LeP.value;
                                    if (mouseLeVal !== undefined) {
                                        const mouseMax = mouseActor.system.stats.LeP.max || 1;
                                        const pct = Math.max(0, Math.min(1, mouseLeVal / mouseMax));
                                        finalUpdate["system.stats.LeP.value"] = Math.round((eff.parent.system.stats.LeP.max || 1) * pct);
                                    }
                                    const mouseAeVal = mouseActor.system.stats.AeP.value;
                                    if (mouseAeVal !== undefined) {
                                        const mouseMax = mouseActor.system.stats.AeP.max || 1;
                                        const pct = Math.max(0, Math.min(1, mouseAeVal / mouseMax));
                                        finalUpdate["system.stats.AeP.value"] = Math.round((eff.parent.system.stats.AeP.max || 1) * pct);
                                    }
                                    if (Object.keys(finalUpdate).length > 0) await eff.parent.update(finalUpdate, { dskMausSync: true });
                                }
                            }
                            const hiddenId = eff.getFlag("dsk", "hiddenTokenId");
                            if (hiddenId) {
                                const origToken = canvas.scene.tokens.get(hiddenId);
                                if (origToken) await origToken.update({ hidden: false });
                            }
                            if (mice.length > 0) await canvas.scene.deleteEmbeddedDocuments("Token", mice.map(t => t.id));
                        }
                    });
                }
            }
        }
    }

    // --- 6. CHAT-AUSGABE BAUEN ---
    let statusText = "";
    if (reaktivierteGaben.size > 0) {
        const effekteListe = Array.from(reaktivierteGaben).map(e => `<li style="margin-bottom:4px;"><b>${e}</b></li>`).join("");
        statusText = `
            <p style="color: #18940F; font-weight: bold; margin-bottom: 8px; text-align: left;">Scanner erfolgreich!</p>
            <p style="margin-bottom: 6px; text-align: left;">Der Wecker hat das Kompendium gelesen und folgende aktive Gaben reaktiviert:</p>
            <ul class="dsklist" style="margin-top: 0; margin-bottom: 0; text-align: left;">
                ${effekteListe}
            </ul>
        `;
    } else {
        statusText = `
            <p style="color: #76301b; font-weight: bold; margin-bottom: 8px; text-align: left;">Scanner abgeschlossen.</p>
            <p style="margin-bottom: 0; text-align: left;">Es wurden aktuell keine aktiven Gaben auf den Akteuren gefunden.</p>
        `;
    }

    const contentHTML = `
        <div style="font-family: 'Signika', sans-serif;">
            <div class="dskbox1">
                <p style="display:flex; gap:8px; align-items:center; margin:0;">
                    <span style="font-size: 24px;">🌙</span>
                    <b>System Online</b>
                </p>
                <p style="font-weight:bold; margin-top:6px; margin-bottom:0;">Lunas Wecker</p>
            </div>
            <div class="dskbox2" style="margin-top:10px;">
                <p style="margin-bottom: 8px; text-align: left;">Guten Morgen! Die Welt ist erwacht.</p>
                <hr style="margin: 8px 0; border: 0; border-top: 1px solid #c9bca6;">
                ${statusText}
            </div>
        </div>
    `;

    await ChatMessage.create({
        speaker: { alias: "System" },
        whisper: game.users.filter(u => u.isGM).map(u => u.id),
        content: contentHTML
    });
})();
