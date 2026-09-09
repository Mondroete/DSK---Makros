// ==========================================
// 🌙 LUNAS WECKER (Der einmalige Reaktivator)
// ==========================================
(async () => {
    // 🚩 LUNAS SCHLAFMODUS: Der Wecker klingelt pro Sitzung nur ein einziges Mal!
    if (globalThis._lunasWeckerGeklingelt) {
        return ui.notifications.info("Luna sagt 🌙: Pssst! Der Wecker schläft bereits. Er hat alle Gaben für diese Sitzung schon reaktiviert!");
    }

    const fwMacro = await fromUuid("Compendium.dsk-havena-und-umland.makros.Macro.fHQ2OuDo3Fe3spBn");
    if (fwMacro) await fwMacro.execute();
    await new Promise(resolve => setTimeout(resolve, 150));

    const DSK_FW = globalThis.DSK || DSK;
    if (!DSK_FW || !DSK_FW.EffektEnde) return ui.notifications.error("Luna sagt 🌙: Framework fehlerhaft!");

    const pack = game.packs.get("dsk-havena-und-umland.makros");
    if (!pack) return ui.notifications.error("Luna sagt 🌙: Kompendium nicht gefunden!");
    const alleMakros = await pack.getDocuments();

    const gefundeneEffekte = new Set();
    const reaktivierteGaben = new Set();

    const alleAkteure = new Set();
    if (canvas.scene) canvas.scene.tokens.forEach(t => { if(t.actor) alleAkteure.add(t.actor); });
    game.actors.forEach(a => alleAkteure.add(a));

    for (let actor of alleAkteure) {
        for (let effect of actor.effects) {
            const eName = effect.name || effect.label || "";
            if (!eName.includes("(")) continue;

            // 🚩 LUNAS FIX: Gleiche ID und gleicher kurzer Titel wie beim Casten, um Duplikate zu überschreiben!
            if (eName.includes("Tote erwecken")) {
                if (eName.includes("Katzendiener")) {
                    reaktivierteGaben.add(eName + " <span style='font-size: 0.85em; opacity: 0.7;'>(Ignoriert für Chat)</span>");
                    continue; 
                }
                if (eName.includes("Kontrolle")) {
                    reaktivierteGaben.add(eName);
                    const ahne = effect.getFlag("dsk", "ahne") || "Brona";
                    DSK_FW.EffektEnde.Register("toteErweckenBrona", `Tote erwecken (${ahne})`, "Die dunkle Magie verblasst. Die Bindung zum untoten Diener ist gerissen, der Körper fällt leblos zu Boden und die maximalen AeP des Beschwörers sind wiederhergestellt.");
                    continue; 
                }
            }

            const basisName = eName.split("(")[0].trim();
            const macro = alleMakros.find(m => m.name === basisName);
            
            if (macro) {
                gefundeneEffekte.add(effect.id);
                reaktivierteGaben.add(eName);
                
                const codeText = macro.command; 
                const match = codeText.match(/EffektEnde\.Register\s*\(\s*[^,]+,\s*[^,]+,\s*(["'`])(.*?)\1\s*\)/);
                const beschreibung = match ? match[2] : `Die Kraft von ${eName} verblasst.`;

                // Anmeldung aller anderen Gaben beim Framework
                DSK_FW.EffektEnde.Register(basisName, eName, beschreibung);
            }
        }
    }

    if (!globalThis._lunasSicherheitsNetz) {
        globalThis._lunasSicherheitsNetz = true;

        Hooks.on("preDeleteActiveEffect", async (eff) => {
            if (!game.user.isGM || !eff.parent) return;
            const effName = eff.name || eff.label || "";
            const ahnenListe = ["Aphasma", "Nurti", "Zerzal", "Brona", "Rondra", "Faris", "Zirraku", "Bishdariel", "Numinoru", "Zsahh"];
            const isGabe = ahnenListe.some(ahne => effName.includes(`(${ahne})`));

            if (isGabe) {
                const linkedItem = eff.parent.items.find(i => i.name === effName);
                if (linkedItem) await linkedItem.delete();
            }
        });

        Hooks.on("createChatMessage", async (msg) => {
            if (msg.author && msg.author.id !== game.user.id) return;
            if (msg.user && msg.user.id !== game.user.id) return;
            const content = (msg.content || "").toLowerCase();
            const flavor = (msg.flavor || "").toLowerCase();
            
            if (content.includes("willenskraft") || flavor.includes("willenskraft")) {
                const speaker = msg.speaker;
                let rollActor = game.actors.get(speaker.actor);
                if (!rollActor && speaker.token) rollActor = canvas.scene.tokens.get(speaker.token)?.actor;
                if (!rollActor) return;
                
                const hatJagdfieberEffekt = rollActor.effects.some(e => {
                    const n = (e.name || e.label || "").toLowerCase();
                    return n.includes("roter schimmer") && n.includes("jagdfieber");
                });
                
                if (hatJagdfieberEffekt) {
                    const hatJagdfieberEigenschaft = rollActor.items.some(i => (i.name || "").toLowerCase().includes("jagdfieber"));
                    if (hatJagdfieberEigenschaft) {
                        const getOwners = (act) => Object.entries(act?.ownership || {}).filter(([id, lvl]) => lvl === 3 && id !== "default").map(([id]) => id);
                        let whisperTargets = [...new Set([...game.users.filter(u => u.isGM).map(u => u.id), ...getOwners(rollActor)])].filter(id => game.users.get(id));
                        await ChatMessage.create({
                            whisper: whisperTargets, speaker: { alias: "System" },
                            content: `
                                <div style="font-family: 'Signika', sans-serif;">
                                    <div class="dskbox1">
                                        <p style="font-weight:bold; margin-top:6px; margin-bottom:0;">Jagdfieber blockiert Probe!</p>
                                    </div>
                                    <div class="dskbox2" style="margin-top:10px; text-align: center;">
                                        <p style="color:#000; font-weight:bold; font-size:1.1em;">${rollActor.name}</p>
                                        <hr style="margin: 8px 0; border: 0; border-top: 1px solid #c9bca6;">
                                        <p style="margin-bottom: 8px;">Da das Ziel unter dem Einfluss des <b>Roten Schimmers</b> steht und die Eigenschaft <b>Jagdfieber</b> besitzt, wird der Instinkt übermächtig!</p>
                                        <p style="color:#8b0000; font-weight:bold;">Die Probe darf nicht abgelegt werden und gilt als automatisch gescheitert.</p>
                                    </div>
                                </div>
                            `
                        });
                    }
                }
            }
        });

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

        Hooks.on("deleteActiveEffect", async (eff) => {
            if (!game.user.isGM) return; 
            const effName = eff.name || eff.label || "";

            const tId = eff.getFlag("dsk", "templateId");
            if (tId && canvas.scene) {
                const doc = canvas.scene.templates.get(tId);
                if (doc) await doc.delete();
            }

            const summonedActorId = eff.getFlag("dsk", "summonedActorId");
            if (summonedActorId) {
                const sActor = game.actors.get(summonedActorId);
                if (sActor) await sActor.delete();
            }

            if (effName.includes("Roter Schimmer") && !effName.includes("Jagdfieber") && eff.parent) {
                const casterUuid = eff.parent.uuid;
                for (let t of canvas.tokens.placeables) {
                    if (!t.actor) continue;
                    const toDelete = t.actor.effects.filter(e => {
                        const n = e.name || e.label || "";
                        return n.includes("Roter Schimmer") && n.includes("Jagdfieber") && e.getFlag("dsk", "sourceCasterUuid") === casterUuid;
                    }).map(e => e.id);
                    
                    if (toDelete.length > 0) {
                        setTimeout(async () => {
                            await t.actor.deleteEmbeddedDocuments("ActiveEffect", toDelete);
                        }, 100);
                    }
                }
            }

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

            // 💀 LUNAS ZIEL-SYNC: Löscht stumm den Partner, überlässt den Chat komplett dem Framework!
            if (effName.includes("Tote erwecken")) {
                const casterUuid = eff.getFlag("dsk", "sourceCasterUuid");
                const targetUuid = eff.getFlag("dsk", "targetUuid");

                if (effName.includes("Kontrolle") && targetUuid) {
                    const tActor = await fromUuid(targetUuid);
                    if (tActor) {
                        const paired = tActor.effects.filter(e => (e.name||e.label).includes("Katzendiener") && e.getFlag("dsk", "sourceCasterUuid") === eff.parent.uuid);
                        if (paired.length > 0) setTimeout(async () => { await tActor.deleteEmbeddedDocuments("ActiveEffect", paired.map(e=>e.id)); }, 100);
                    }
                } else if (effName.includes("Katzendiener") && casterUuid) {
                    const cActor = await fromUuid(casterUuid);
                    if (cActor) {
                        const paired = cActor.effects.filter(e => (e.name||e.label).includes("Kontrolle") && e.getFlag("dsk", "targetUuid") === eff.parent.uuid);
                        if (paired.length > 0) setTimeout(async () => { await cActor.deleteEmbeddedDocuments("ActiveEffect", paired.map(e=>e.id)); }, 100);
                    }
                }
            }
        });
    }

    // 🚩 Den Wecker nach getaner Arbeit tief schlafen legen
    globalThis._lunasWeckerGeklingelt = true;

    // --- 6. CHAT-AUSGABE BAUEN ---
    let statusText = "";
    if (reaktivierteGaben.size > 0) {
        const effekteListe = Array.from(reaktivierteGaben).map(e => `<li style="margin-bottom:4px;"><b>${e}</b></li>`).join("");
        statusText = `
            <p style="color: #18940F; font-weight: bold; margin-bottom: 8px; text-align: left;">Scanner erfolgreich!</p>
            <p style="margin-bottom: 6px; text-align: left;">Der Wecker hat das System durchleuchtet und folgende aktive Gaben an das Framework übergeben:</p>
            <ul class="dsklist" style="margin-top: 0; margin-bottom: 0; text-align: left;">
                ${effekteListe}
            </ul>
        `;
    } else {
        statusText = `
            <p style="color: #76301b; font-weight: bold; margin-bottom: 8px; text-align: left;">Scanner abgeschlossen.</p>
            <p style="margin-bottom: 0; text-align: left;">Es wurden aktuell keine anmeldbaren Gaben auf den Akteuren gefunden.</p>
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
