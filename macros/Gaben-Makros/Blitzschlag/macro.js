// ==========================================
// ⚙️ LUNAS WIRKUNG: BLITZSCHLAG (V13 Ready)
// ==========================================

(async () => {
    // ============================================================
    // 0. Framework laden & Wirkungsende-Hook registrieren
    // ============================================================
    const fwMacro = await fromUuid("Compendium.dsk-havena-und-umland.makros.Macro.fHQ2OuDo3Fe3spBn");
    if (fwMacro) { 
        await fwMacro.execute(); 
    }

    if (typeof DSK === "undefined") {
        ui.notifications.error("Das DSK-Framework konnte nicht geladen werden!");
        return;
    }

    const gabenName = "Blitzschlag";
    const ahne = "Rondra";
    const finalEffektName = `${gabenName} (${ahne})`; 

    if (DSK.EffektEnde) {
        DSK.EffektEnde.Register(
            "blitzschlagrondra", 
            finalEffektName, 
            "Die knisternden, geisterhaften Blitze auf der Klinge erlöschen. Rondras Zorn schwindet."
        );
    }

    // Hilfsfunktion: Finde alle Spieler-IDs, denen ein Akteur gehört
    const getOwners = (act) => {
        if (!act) return [];
        const ownership = act.ownership || act.permission || {};
        return Object.entries(ownership)
            .filter(([id, lvl]) => lvl === 3 && id !== "default")
            .map(([id]) => id);
    };

    // ============================================================
    // 1. Initialisierung & Caster-Ermittlung
    // ============================================================
    const casterActor = (typeof testData !== "undefined" && testData?.actor) || 
                        (typeof testData !== "undefined" && testData?.speaker?.actor ? game.actors.get(testData.speaker.actor) : null) || 
                        (typeof testData !== "undefined" && testData?.speaker?.token ? canvas.tokens.get(testData.speaker.token)?.actor : null) || 
                        actor || 
                        canvas.tokens.controlled[0]?.actor || 
                        game.user.character;

    if (!casterActor) {
        ui.notifications.warn("Kein Akteur gefunden! Bitte wähle einen Token aus.");
        return;
    }

    // QS aus dem Flag auslesen, das vom Start-Makro gesetzt wurde (mit Fallback)
    let qs = casterActor.getFlag("world", "letzteGabenQS") || 1;
    if (casterActor.getFlag("world", "letzteGabenQS")) {
        await casterActor.unsetFlag("world", "letzteGabenQS");
    }

    try {
        if (typeof testData !== "undefined" && testData) {
            const parsedQs = Number(testData?.result?.QL || testData?.qualityStep);
            if (!isNaN(parsedQs) && parsedQs > 0) {
                qs = parsedQs;
            }
        }
    } catch (e) {}

    if (qs <= 0) {
        return ui.notifications.warn("Die Probe ist fehlgeschlagen.");
    }

    const casterName = DSK.ResolveTokenName(casterActor);
    const speakerData = ChatMessage.getSpeaker({ actor: casterActor });

    // ============================================================
    // 2. Prüfung: Meisterklinge vorhanden? (Nur zum Auslösen)
    // ============================================================
    const casterEffects = casterActor.effects?.contents || Array.from(casterActor.effects || []);
    const meisterklinge = casterEffects.find(e => (e.name || e.label || "").toLowerCase().includes("meisterklinge"));

    if (!meisterklinge) {
        let errorOwnerIds = new Set();
        game.users.filter(u => u.isGM).forEach(u => errorOwnerIds.add(u.id));
        getOwners(casterActor).forEach(id => errorOwnerIds.add(id));

        ChatMessage.create({
            speaker: speakerData,
            whisper: Array.from(errorOwnerIds).filter(id => game.users.get(id)),
            content: `
                ${DSK.UI.Header(gabenName, DSK.Symbol(ahne))}
                <div class="dskbox2" style="margin-top:10px;">
                    <p style="text-align:center; color:#B30000;"><b>Der Blitzschlag verfehlt seine Wirkung: Es wird keine aktive Meisterklinge geführt.</b></p>
                    <p style="text-align:center; font-size: 0.9em; margin-top:5px;">Die Kosten (AeP) wurden im Start-Makro bereits verbraucht.</p>
                </div>
            `
        });
        return; 
    }

    let klingenName = "Meisterklinge";
    const meisterName = meisterklinge.name || meisterklinge.label;
    if (meisterName.includes("-")) {
        klingenName = meisterName.split("-")[1].trim();
    }

    // ============================================================
    // 3. Effekt anlegen
    // ============================================================
    const dauerRunden = qs * 4;
    const dauerText = `${dauerRunden} Kampfrunden`;
    const zusatzSchaden = qs;

    const basisBeschreibung = `Das Rondrakind lädt seine ${klingenName} mit der Kraft Rondras auf, wodurch kleine Blitze über sie wandern. Beim nächsten erfolgreichen Angriff verursacht das Rondrakind zusätzliche <b>${zusatzSchaden} TP</b> (${qs} QS).`;

    try {
        for (let ef of casterActor.effects) {
            if ((ef.name || ef.label || "").toLowerCase() === finalEffektName.toLowerCase()) {
                await ef.delete();
            }
        }

        const [newEffect] = await casterActor.createEmbeddedDocuments("ActiveEffect", [{
            name: finalEffektName,
            icon: DSK.Symbol(ahne),
            description: basisBeschreibung,
            disabled: false,
            origin: casterActor.uuid,
            duration: { rounds: dauerRunden }
        }]);

        if (DSK.EffektKarteAktivierung) {
            DSK.EffektKarteAktivierung.Protokollieren(
                finalEffektName, 
                casterName, 
                true, 
                basisBeschreibung, 
                dauerText, 
                ahne, 
                gabenName
            );
        }

        // ============================================================
        // 4. AUTOMATISCHER TREFFER-WÄCHTER (Strikte Waffen-Prüfung)
        // ============================================================
        const hookId = Hooks.on("createChatMessage", async (msg) => {
            const activeEffekt = casterActor.effects.get(newEffect?.id);
            if (!activeEffekt) {
                Hooks.off("createChatMessage", hookId);
                return;
            }

            const rawContent = msg.content || "";
            const tmpDiv = document.createElement("div");
            tmpDiv.innerHTML = rawContent;
            const cleanText = (tmpDiv.textContent || tmpDiv.innerText || "").replace(/\s+/g, ' ').trim();

            if (cleanText.includes(casterName) && cleanText.includes("gewinnt gegen")) {
                const casterIdx = cleanText.indexOf(casterName);
                const winIdx = cleanText.indexOf("gewinnt gegen");

                if (casterIdx < winIdx) {
                    
                    // LIVE-PRÜFUNG: Welche Waffe hat die Meisterklinge GENAU JETZT?
                    const liveMeisterklinge = casterActor.effects.find(e => (e.name || e.label || "").toLowerCase().includes("meisterklinge"));
                    if (!liveMeisterklinge) return; 
                    
                    let liveKlingenName = "Meisterklinge";
                    const liveMeisterName = liveMeisterklinge.name || liveMeisterklinge.label;
                    if (liveMeisterName.includes("-")) {
                        liveKlingenName = liveMeisterName.split("-")[1].trim().toLowerCase();
                    }

                    let usedCorrectWeapon = false;
                    const messages = game.messages.contents;
                    
                    for (let i = messages.length - 1; i >= 0; i--) {
                        const m = messages[i];
                        const mContent = (m.content || "").toLowerCase();
                        
                        if ((m.speaker?.actor === casterActor.id || mContent.includes(casterName.toLowerCase())) && mContent.includes("angriffsprobe")) {
                            if (mContent.includes(liveKlingenName)) {
                                usedCorrectWeapon = true;
                            }
                            break; 
                        }
                    }

                    if (usedCorrectWeapon) {
                        let zielName = "das Ziel";
                        let targetActorFound = null;

                        const subMatch = rawContent.match(/gewinnt gegen\s*<[^>]+>([^<]+)/i) || rawContent.match(/gewinnt gegen\s+([^<\d]+)/i);
                        if (subMatch && subMatch[1]) {
                            zielName = subMatch[1].trim();
                        } else {
                            const subText = cleanText.substring(winIdx + "gewinnt gegen".length).trim();
                            const nameMatch = subText.match(/^(.*?)(?=\s+\d+\s*-\s*\d+|\s+Trefferpunkte|\s+Wurf|\s+Modifikatoren|$)/i);
                            if (nameMatch && nameMatch[1]) zielName = nameMatch[1].trim();
                        }

                        const targetToken = canvas.tokens.placeables.find(t => t.name.toLowerCase() === zielName.toLowerCase() || t.actor?.name.toLowerCase() === zielName.toLowerCase());
                        if (targetToken) {
                            targetActorFound = targetToken.actor;
                        }

                        let whisperOwnerIds = new Set();
                        game.users.filter(u => u.isGM).forEach(u => whisperOwnerIds.add(u.id));
                        getOwners(casterActor).forEach(id => whisperOwnerIds.add(id));
                        if (targetActorFound) {
                            getOwners(targetActorFound).forEach(id => whisperOwnerIds.add(id));
                        }

                        const formatKlingenName = liveMeisterName.includes("-") ? liveMeisterName.split("-")[1].trim() : "Meisterklinge";

                        const whisperHtml = `
                            <div style="font-family: 'Signika', sans-serif;">
                                <div class="dskbox1">
                                    <p style="display:flex; align-items:center; gap:8px;">
                                        <img src="${DSK.Symbol(ahne)}" style="width:28px;">
                                        <b>Blitzschlag-Entladung</b>
                                    </p>
                                    <p style="text-align:center; font-weight:bold; margin-top:6px; color:#d9534f;">Zusatzschaden gegen: ${zielName}</p>
                                </div>
                                <div class="dskbox2" style="margin-top:10px;">
                                    <p style="font-size:0.95em; line-height:1.35;">
                                        <b>${casterName}</b> hat mit der <b>${formatKlingenName}</b> erfolgreich <b>${zielName}</b> getroffen! Der Blitz entlädt sich und verursacht zusätzliche <b>${zusatzSchaden} TP</b> (${qs} QS)!<br><br>
                                        <span style="font-size:0.85em; color:#555;">(Bitte markiere das Token von <b>${zielName}</b> und klicke auf den Button)</span>
                                    </p>
                                    <hr>
                                    <button class="apply-blitzschlag-btn"
                                        style="width:100%; cursor:pointer; background:linear-gradient(#76301b,#582617); color:#f8f6f5;
                                               border:1px solid #000; padding:5px 8px; border-radius:3px; font-weight:bold; margin-top: 5px; text-align:center;">
                                        ${zusatzSchaden} TP Zusatzschaden anwenden
                                    </button>
                                </div>
                            </div>
                        `;

                        const whisperedMsg = await ChatMessage.create({
                            whisper: Array.from(whisperOwnerIds).filter(id => game.users.get(id)),
                            content: whisperHtml,
                            speaker: speakerData
                        });

                        Hooks.once("renderChatMessage", async (message, html) => {
                            if (message.id !== whisperedMsg.id) return;
                            html.find(".apply-blitzschlag-btn").click(async () => {
                                const target = game.user.targets.first();
                                if (!target) return ui.notifications.warn("Bitte markiere zuerst das Token des Ziels!");

                                const hpPath = target.actor.system.stats?.LeP ? "system.stats.LeP.value" : "system.hp.value";
                                const curHp = target.actor.system.stats?.LeP?.value ?? target.actor.system?.hp?.value ?? 0;
                                await target.actor.update({ [hpPath]: curHp - zusatzSchaden });
                                
                                ui.notifications.info(`${target.name} hat ${zusatzSchaden} TP Zusatzschaden durch Blitzschlag erhalten!`);
                                await activeEffekt.delete();
                            });
                        });
                        Hooks.off("createChatMessage", hookId);
                    }
                }
            }
        });
    } catch (e) {
        console.warn("Blitzschlag konnte nicht angewendet werden:", e);
    }
})();
