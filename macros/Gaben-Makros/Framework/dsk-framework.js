/* DSK Framework — Gaben-Makros (Framework)
   Legt das globale DSK-Objekt an und stellt Utility-Funktionen bereit
   Dateipfad: macros/Gaben-Makros/Framework/dsk-framework.js
   Autor: Mondroete
*/
// ============================================================
// === BLOCK 0 — GLOBAL INITIALISIERUNG ========================
// ============================================================

if (!globalThis.DSK) globalThis.DSK = {};
const DSK = globalThis.DSK;

DSK.version = "13.03; // Mit Block 15: Sicht & Entdeckungsmodi 🌙

// ============================================================
// === TOKEN-NAMEN SAUBER ERMITTELN (SZENENNAME) ===============
// ============================================================

DSK.ResolveTokenName = function(actor) {
    const token = canvas.tokens.placeables.find(t => t.actor === actor);
    return token?.document?.name || token?.name || actor?.name || "Unbekannt";
};

// ============================================================
// === BLOCK 1 — SYMBOLSYSTEM =================================
// ============================================================

DSK.Symbol = function(gott) {
    const clean = (gott || "Nurti").toLowerCase().replace(/[^a-z]/g, "");
    
    if (clean === "ahne" || clean === "vorfahre") {
        return "https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/systems/dsk/icons/categories/ahnengabe.webp";
    }

    const basis = "https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/DSK/Allgemein_Glaubenssymbole/";

    const symbole = {
        aphasma: "Aphasma.webp",
        brona: "Brona.webp",
        charytho: "Charytho.webp",
        dasgoettlichepaarfasar: "Das_Goettliche_Paar_Fasar.webp",
        dliebruederausmitternachtxorlosch: "die_Brueder_aus_Mitternacht_Xorlosch.webp",
        dliebruederausmitternachthavena: "Die_Brueder_aus_Mitternacht_Havena.webp",
        felliam: "Felliam.webp",
        fenk: "Fenk.webp",
        grimmangrausch: "Grimm_und_Angrausch.webp",
        grisgror: "Gris_und_Gror.webp",
        gulasch: "Gulasch.webp",
        mamosh: "Mamosh.webp",
        meen: "Meen.webp",
        nurti: "Nurti.webp",
        osommosima: "Osommo_und_Sima.webp",
        piri: "Piri.webp",
        praios: "Praios.webp",
        rondra: "Rondra.webp",
        tavadieherrinderfelder: "Tava_die_Herrin_der_Felder.webp",
        tavaschoepferinderweltxorlosch: "Tava_Schoepferin_der_Welt_Xorlosch.webp",
        trachfasar: "Trach_Fasar.webp",
        verschlinger: "Verschlinger.webp",
        wanderer: "Wanderer.webp",
        za: "Za.webp",
        zerzal: "Zerzal.webp"
    };

    let gefunden = symbole[clean];
    if (!gefunden) {
        const key = Object.keys(symbole).find(k => clean.includes(k) || k.includes(clean));
        gefunden = key ? symbole[key] : "Nurti.webp";
    }

    return basis + gefunden;
};

DSK._resolveSymbol = function(input) {
    return DSK.Symbol(input);
};

// ============================================================
// === BLOCK 2 — UI SYSTEM ====================================
// ============================================================

DSK.UI = {
    Button(type, label, extra = "") {
        const BTN_BIG = `background:linear-gradient(#76301b,#582617); color:#f8f6f5; border:1px solid #000; border-radius:4px; font-weight:bold; padding:3px 6px; font-size:11px; cursor:pointer; width:80px; text-align:center;`;
        const BTN_SMALL = `background:#5a3b2a; color:#fff; border:1px solid #000; border-radius:3px; font-weight:bold; cursor:pointer; width:20px; height:20px; font-size:12px; line-height:20px; text-align:center; padding:0;`;
        const style = type === "big" ? BTN_BIG : BTN_SMALL;
        return `<button style="${style}" ${extra}>${label}</button>`;
    },
    DescriptionToggle(text) {
        return `<div style="margin-top:6px;"><span class="desc-toggle" style="cursor:pointer; font-size:0.9em; color:#333; font-weight:bold;"><span class="arrow">▶</span> Beschreibung</span><div class="desc-content" style="display:none; font-size:0.9em; color:#222; margin-top:4px; padding:8px 10px;">${text}</div></div>`;
    },
    SubHeader(text) {
        return `<p style="text-align:center; font-size:0.95em; color:#555; margin-top:-6px; margin-bottom:10px;">${text}</p>`;
    },
    Box(type, content) {
        if (type === "dskbox1") return `<div class="dskbox1">${content}</div>`;
        return `<div class="dskbox2" style="margin-top:10px;">${content}</div>`;
    },
    List(items) {
        return `<ul class="dsklist">${items.map(i => `<li>${i}</li>`).join("")}</ul>`;
    },
    Header(title, resolvedSymbol) {
        const imgHtml = resolvedSymbol ? `<img src="${resolvedSymbol}" style="width:28px; border:none; background:transparent;">` : "";
        return `<div class="dskbox1"><p style="display:flex; gap:8px; align-items:center;">${imgHtml}<b>Ahnengabe</b></p><p style="font-weight:bold; margin-top:6px;">${title}</p></div>`;
    },
    Section(title, content) {
        return `<div class="dskbox1"><p style="font-weight:bold;">${title}</p></div><div class="dskbox2" style="margin-top:10px;">${content}</div>`;
    },
    Icon(path, size = 32) {
        return `<img src="${path}" width="${size}" height="${size}" style="border:none; border-radius:4px; background:transparent;">`;
    }
};

// ============================================================
// === BLOCK 3 — WESEN SYSTEM =================================
// ============================================================

DSK.Wesen = {
    isAlwaysErwacht(actor) {
        if (!actor) return false;
        return (actor.type === "character" || actor.type === "npc");
    },
    _species(actor) {
        return (actor.system?.species?.value || actor.system?.details?.species || "").toLowerCase();
    },
    match(actor, varianten = []) {
        if (!actor) return false;
        if (this.isAlwaysErwacht(actor)) return varianten.some(v => ["erwacht", "erwachter", "erwachte"].includes(v.toLowerCase()));
        const species = this._species(actor);
        return varianten.some(v => species.includes(v.toLowerCase()));
    }
};

// ============================================================
// === BLOCK 4 — ITEM SUCHE ===================================
// ============================================================

DSK.Item = {
    HatGegenstand(actor, suchbegriff = "", itemTypen = []) {
        if (!actor || !actor.items) return false;
        const begriff = (suchbegriff || "").toLowerCase();
        let zuDurchsuchendeItems = [];
        if (itemTypen && itemTypen.length > 0) {
            const typenArray = Array.isArray(itemTypen) ? itemTypen : [itemTypen];
            for (let t of typenArray) {
                const systemTyp = t.toLowerCase();
                if (actor.itemTypes && actor.itemTypes[systemTyp]) zuDurchsuchendeItems.push(...actor.itemTypes[systemTyp]);
            }
        } else {
            zuDurchsuchendeItems = actor.items;
        }
        return zuDurchsuchendeItems.some(i => (!begriff || (i.name || "").toLowerCase().includes(begriff)));
    }
};

// ============================================================
// === BLOCK 5 — UNIVERSAL EFFEKT‑SYSTEM ======================
// ============================================================

DSK.Effekt = {
    ParseWert(formel, qs) {
        if (!formel || typeof formel !== "string") return 0;
        let expr = formel.replace(/qs/gi, qs);
        try { return Number(eval(expr)) || 0; } catch { return 0; }
    },
    BuildChanges(targets = [], key = "system.skillModifiers.FP", formel = "qs", qs = 1) {
        if (!Array.isArray(targets)) targets = [targets];
        const wert = this.ParseWert(formel, qs);
        if (key.startsWith("system.skillModifiers.")) {
            const prefix = wert >= 0 ? "+" : "-";
            const abs = Math.abs(wert);
            return targets.map(name => ({ key, mode: 0, value: `${name} ${prefix}${abs}` }));
        }
        return targets.map(targetKey => ({ key: targetKey.includes("system.") ? targetKey : key, mode: 2, value: wert }));
    },
    CheckTarget(actor, gabeZiel = "erwachte") {
        if (!actor) return false;
        const type = actor.type;
        const targetLower = gabeZiel.toLowerCase();
        if (targetLower === "erwachte" || targetLower === "erwacht") if (DSK.Wesen.isAlwaysErwacht(actor)) return true;
        if (targetLower === "geist" && type === "spirit") return true;
        const species = (actor.system?.species?.value || actor.system?.details?.species || "").toLowerCase();
        return species.includes(targetLower);
    },
    async Anwenden(config) {
        const { name = "Unbenannte Gabe", ahne = "", beschreibung = "", gabeZiel = "erwachte", qs = 1, formel = "qs", skills = [], key = "system.skillModifiers.FP", ziel = null, flags = null } = config;
        const targetActor = ziel || game.user.character;
        if (!targetActor) return;
        const erlaubt = this.CheckTarget(targetActor, gabeZiel);
        if (!erlaubt) return;
        const changes = this.BuildChanges(skills, key, formel, qs);
        let effectData = { name, icon: DSK.Symbol(ahne || name), description: beschreibung, changes };
        if (flags) effectData.flags = flags;
        await targetActor.createEmbeddedDocuments("ActiveEffect", [effectData]);
    }
};

// ============================================================
// === BLOCK 6 — EFFEKT ENDE ==================================
// ============================================================

DSK.EffektEnde = {
    Register(sfName, basisEffektName, beschreibungFuerEnde) {
        const hookKey = `_hook_end_${sfName}`;
        if (globalThis[hookKey]) Hooks.off("preDeleteActiveEffect", globalThis[hookKey]);
        
        let buffer = [];
        let timer = null;

        const getOwners = (act) => {
            if (!act) return [];
            return Object.entries(act.ownership || act.permission || {}).filter(([id, lvl]) => lvl === 3 && id !== "default").map(([id]) => id);
        };

        globalThis[hookKey] = Hooks.on("preDeleteActiveEffect", (effect) => {
            if (!effect) return;
            const effName = (effect.name || effect.label || "").trim().toLowerCase();
            const targetNameClean = (basisEffektName || "").trim().toLowerCase();
            if (!effName.includes(targetNameClean) && targetNameClean !== effName) return;

            const actor = effect.parent;
            const sfItem = actor?.items?.find(i => (i.name || "").trim().toLowerCase() === targetNameClean && i.type === "specialability");
            const casterUuid = effect.flags?.dsk?.casterUuid || sfItem?.flags?.dsk?.casterUuid;
            buffer.push({ name: DSK.ResolveTokenName(actor), actor, icon: effect.icon, casterUuid });

            clearTimeout(timer);
            timer = setTimeout(async () => {
                const items = [...buffer];
                buffer = [];
                const namenListe = [...new Set(items.map(i => i.name))];
                const icon = items[items.length - 1]?.icon || DSK.Symbol(basisEffektName);
                let ownerIds = new Set(game.users.filter(u => u.isGM).map(u => u.id));

                for (const item of items) {
                    getOwners(item.actor).forEach(id => ownerIds.add(id));
                    if (item.casterUuid) {
                        try {
                            const originDoc = await fromUuid(item.casterUuid);
                            const originActor = originDoc?.documentName === "Token" ? originDoc.actor : originDoc;
                            getOwners(originActor).forEach(id => ownerIds.add(id));
                        } catch (e) {}
                    }
                }

                const html = `<div class="dskbox1"><p style="display:flex; gap:8px; align-items:center;"><img src="${icon}" style="width:28px;"><b>Wirkungsende</b></p><p style="font-weight:bold; margin-top:6px;">${basisEffektName}</p></div><div class="dskbox2" style="margin-top:10px;"><p>${beschreibungFuerEnde}</p> Einheiten/Erschwernisse verflogen.<hr><p><b>Effekt beendet auf:</b></p><ul class="dsklist">${namenListe.map(n => `<li>${n}</li>`).join("")}</ul></div>`;
                
                ChatMessage.create({ 
                    whisper: Array.from(ownerIds).filter(id => game.users.get(id)), 
                    content: html, 
                    speaker: { alias: "System" } 
                }).catch(err => console.error("DSK Chat-Fehler:", err));
                
            }, 500);
        });
    }
};

// ============================================================
// === BLOCK 7 — CHATKARTEN & GEGENSTANDSAUSWAHL (WORKFLOW) ===
// ============================================================

DSK.Chatkarte = {
    Gegenstandsauswahl(targetActor, gabenName = "Ahnengabe", ahnenName = "Ahne", suchbegriff = "", itemTypen = [], wirkungText = "", dauerText = "", qs = 1, getChanges = null) {
        if (!targetActor) {
            targetActor = canvas.tokens.controlled[0]?.actor || game.user.character;
        }
        if (!targetActor) {
            ui.notifications.warn("Kein Akteur für die Gegenstandsauswahl gefunden!");
            return;
        }

        const actorName = DSK.ResolveTokenName(targetActor);
        const suchbegriffLower = (suchbegriff || "").toLowerCase();
        let zuDurchsuchendeItems = [];

        if (itemTypen && itemTypen.length > 0) {
            const typenArray = Array.isArray(itemTypen) ? itemTypen : [itemTypen];
            for (let t of typenArray) {
                const systemTyp = t.toLowerCase();
                if (targetActor.itemTypes && targetActor.itemTypes[systemTyp]) {
                    zuDurchsuchendeItems.push(...targetActor.itemTypes[systemTyp]);
                }
            }
        } else {
            zuDurchsuchendeItems = targetActor.items;
        }

        const items = zuDurchsuchendeItems
            .filter(i => {
                const namePasst = !suchbegriffLower || (i.name || "").toLowerCase().includes(suchbegriffLower);
                return namePasst && i.type !== "ahnengabe";
            })
            .map(i => i.name);

        if (items.length === 0) {
            ChatMessage.create({
                speaker: { alias: "System" },
                content: `
                    ${DSK.UI.Header(gabenName, DSK.Symbol(ahnenName))}
                    ${DSK.UI.Box("dskbox2", `
                        <div style="text-align:center; padding-top: 5px;">
                            <b style="color: #8b0000;">Tut mir leid, du besitzt keinen passenden Gegenstand (${suchbegriff}), daher verfehlt die Ahnengabe ihre Wirkung.</b>
                        </div>
                    `)}
                `
            });
            return;
        }

        const ownerIds = Object.entries(targetActor.ownership || targetActor.permission || {})
            .filter(([id, level]) => level === 3 && id !== "default")
            .map(([id]) => id);

        const itemListHtml = items.map(name => `<li style="margin-bottom: 4px;"><b>${name}</b></li>`).join("");

        ChatMessage.create({
            speaker: { alias: "System" },
            content: `
                ${DSK.UI.Header(gabenName, DSK.Symbol(ahnenName))}
                ${DSK.UI.Box("dskbox2", `
                    <p style="margin-top: 0;">Du kannst folgende Gegenstände segnen, bitte wähle einen und teile das deinem GM mit.</p>
                    <ul style="margin-bottom: 10px; padding-left: 20px;">
                        ${itemListHtml}
                    </ul>
                    <p style="font-size: 0.85em; color: #555; margin-bottom: 0;"><i>Hinweis: Bitte drücke nicht zu oft auf den Effekt selbst.</i></p>
                `)}
            `,
            whisper: ownerIds.length > 0 ? ownerIds : null 
        });

        if (game.user.isGM) {
            const optionsHtml = items.map(name => `<option value="${name}">${name}</option>`).join("");
            const dialogContent = `
                ${DSK.UI.Header(gabenName, DSK.Symbol(ahnenName))}
                <div class="dskbox2" style="margin-top: 5px; color: #000;">
                    <p style="margin-bottom: 10px;"><b>Gebe bitte den Gegenstand an, den sich dein Spieler (${actorName}) wünscht:</b></p>
                    <select id="gm-assist-select" style="width: 100%; padding: 4px; border: 1px solid #76301b; border-radius: 3px; background: #f8f6f5; color: #000;">
                        <option value="" disabled selected>Bitte wählen...</option>
                        ${optionsHtml}
                    </select>
                </div>
            `;

            new Dialog({
                title: `GM: ${gabenName} (${actorName})`,
                content: dialogContent,
                buttons: {
                    confirm: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Bestätigen",
                        callback: async (html) => {
                            const container = html instanceof jQuery ? html[0] : html;
                            const selectEl = container.querySelector("#gm-assist-select");
                            const chosenItem = selectEl ? selectEl.value : null;
                            
                            if (!chosenItem) {
                                ui.notifications.warn("Nichts ausgewählt!");
                                return;
                            }

                            const finalEffektName = `${gabenName} (${ahnenName}) - ${chosenItem}`;
                            const changes = getChanges ? getChanges(qs, chosenItem) : [];

                            const effData = {
                                name: finalEffektName, 
                                icon: DSK.Symbol(ahnenName), 
                                changes: changes,
                                origin: targetActor.uuid
                            };
                            
                            await targetActor.createEmbeddedDocuments("ActiveEffect", [effData]);
                            
                            if (DSK.EffektKarteAktivierung) {
                                const formatiertesZiel = `${actorName} <br><span style="font-size: 0.9em; color: #555; font-weight: normal;">(Gegenstand: ${chosenItem})</span>`;
                                DSK.EffektKarteAktivierung.Protokollieren(
                                    finalEffektName, 
                                    formatiertesZiel, 
                                    true, 
                                    wirkungText, 
                                    dauerText, 
                                    ahnenName,
                                    gabenName
                                );
                            }
                        }
                    },
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Abbrechen"
                    }
                },
                default: "confirm",
                render: (html) => {
                    const container = html instanceof jQuery ? html[0] : html;
                    if (container) {
                        const buttons = container.querySelectorAll('.dialog-button');
                        buttons.forEach(btn => {
                            btn.style.background = 'linear-gradient(#76301b,#582617)';
                            btn.style.color = '#f8f6f5';
                            btn.style.border = '1px solid #000';
                            btn.style.fontWeight = 'bold';
                        });
                    }
                }
            }).render(true);
        }
    }
};

// ============================================================
// === BLOCK 8 — DIALOG SYSTEM ================================
// ============================================================

DSK.Dialog = {
    Auswahl(titel, inhalt, callback) {
        const dlg = new Dialog({
            title: titel,
            content: inhalt,
            buttons: {},
            render: (html) => {
                const container = html instanceof jQuery ? html[0] : html;
                const btn = container.querySelector("#dlgApply");
                if (btn) {
                    btn.addEventListener("click", () => {
                        callback(html);
                        dlg.close();
                    });
                }
            }
        }, { width: 520, height: 650 });
        dlg.render(true);
    },

    Whisper(actor, titelDerGabe, symbolPfad, actorName, liste) {
        const gmIds = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
        const ownerIds = game.users
            .filter(u => actor?.testUserPermission?.(u, "OWNER"))
            .map(u => u.id);

        const whisperTargets = [...new Set([...gmIds, ...ownerIds])];
        const resolved = DSK._resolveSymbol(symbolPfad || titelDerGabe);

        ChatMessage.create({
            whisper: whisperTargets,
            content: `
                ${DSK.UI.Header(`${titelDerGabe}<br>Information`, resolved)}
                <div class="dskbox2" style="margin-top:10px;">
                    <p><b>${actorName}</b> hat folgende Auswahl getroffen:</p>
                    ${DSK.UI.List(liste.map(e => `<b>${e}</b>`))}
                    <hr>
                    <p style="text-align:center; font-style:italic; font-size:0.9em; color:#555;">
                        Die Auswahl wurde auf Grund deiner Beschreibung getroffen.
                    </p>
                </div>
            `,
            speaker: { alias: "System" }
        });
    },

    WhisperText(actor, titelDerGabe, symbolPfad, text) {
        const gmIds = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
        const ownerIds = game.users
            .filter(u => actor?.testUserPermission?.(u, "OWNER"))
            .map(u => u.id);

        const whisperTargets = [...new Set([...gmIds, ...ownerIds])];
        const resolved = DSK._resolveSymbol(symbolPfad || titelDerGabe);

        ChatMessage.create({
            whisper: whisperTargets,
            content: `
                ${DSK.UI.Header(titelDerGabe, resolved)}
                <div class="dskbox2" style="margin-top:10px;">${text}</div>
            `,
            speaker: { alias: "System" }
        });
    },

    WhisperKompaktAuswahl(actor, titelDerGabe, symbolPfad, kategorienObjekt) {
        const gmIds = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
        const ownerIds = game.users
            .filter(u => actor?.testUserPermission?.(u, "OWNER"))
            .map(u => u.id);

        const whisperTargets = [...new Set([...gmIds, ...ownerIds])];
        const resolved = DSK._resolveSymbol(symbolPfad || titelDerGabe);

        let inhaltHtml = `<p><b>Folgende Optionen standen im Umkreis zur Auswahl:</b></p><br>`;

        for (const [kategorieTitel, elemente] of Object.entries(kategorienObjekt)) {
            inhaltHtml += `<p><b>${kategorieTitel}:</b></p>`;
            if (elemente && elemente.length > 0) {
                inhaltHtml += `<ul class="dsklist" style="margin-bottom:6px;">`;
                for (const el of elemente) {
                    inhaltHtml += `<li>${el}</li>`;
                }
                inhaltHtml += `</ul>`;
            } else {
                inhaltHtml += `<p style="font-style:italic; color:#777; margin-bottom:6px;">Keine Optionen</p>`;
            }
        }

        ChatMessage.create({
            whisper: whisperTargets,
            content: `
                ${DSK.UI.Header(`${titelDerGabe}<br>Auswahl Information`, resolved)}
                <div class="dskbox2" style="margin-top:10px;">
                    ${inhaltHtml}
                    <hr>
                    <p style="text-align:center; font-style:italic; font-size:0.9em; color:#555;">
                        Teile deinem GM die Auswahl mit, damit er weiter machen kann.
                    </p>
                </div>
            `,
            speaker: { alias: "System" }
        });
    }
};

// ============================================================
// === BLOCK 9 — AKTIVIERUNGS-KARTE ===========================
// ============================================================

DSK.EffektKarteAktivierung = {
    _puffer: {},

    Register(effektName, dauerText = "") {},

    Protokollieren(effektName, zielName, istErfolgreich, beschreibung, dauerText = "", ahne = "", gabenName = "") {
        if (!this._puffer[effektName]) {
            this._puffer[effektName] = {
                erfolge: [],
                fehlschläge: [],
                beschreibung: beschreibung,
                dauer: dauerText,
                ahne: ahne,
                gabenName: gabenName || effektName.split(" (")[0], 
                timer: null,
                speaker: { alias: "System" }
            };
        }

        const eintrag = this._puffer[effektName];
        if (beschreibung) eintrag.beschreibung = beschreibung;
        if (dauerText) eintrag.dauer = dauerText;
        if (ahne) eintrag.ahne = ahne;
        if (gabenName) eintrag.gabenName = gabenName;

        if (istErfolgreich) {
            if (!eintrag.erfolge.includes(zielName)) eintrag.erfolge.push(zielName);
        } else {
            const fehlerEintrag = `<b>${zielName}</b> <br><span style="font-size: 0.9em; color: #000; font-weight: normal;">(Kein Erwachter)</span>`;
            if (!eintrag.fehlschläge.includes(fehlerEintrag)) eintrag.fehlschläge.push(fehlerEintrag);
        }

        clearTimeout(eintrag.timer);
        eintrag.timer = setTimeout(() => {
            const daten = this._puffer[effektName];
            delete this._puffer[effektName];

            if (!daten) return;

            const icon = DSK.Symbol(daten.ahne || daten.gabenName);

            const erfolgHtml = daten.erfolge.length > 0 
                ? `<div style="margin-top: 15px; margin-bottom: 15px;">
                     <p style="margin-bottom: 5px;"><span style="color:#18940F; font-weight:bold;">Erfolg</span></p>
                     <ul class="dsklist" style="margin-top:0; font-weight:normal;">
                         ${daten.erfolge.map(n => `<li>${n}</li>`).join("")}
                     </ul>
                   </div>` 
                : ``;

            const fehlschlagHtml = daten.fehlschläge.length > 0
                ? `<div style="margin-top: 15px; margin-bottom: 15px;">
                     <p style="margin-bottom: 5px;"><span style="color:#B30000; font-weight:bold;">Fehlschlag</span></p>
                     <ul class="dsklist" style="margin-top:0; font-weight:normal;">
                         ${daten.fehlschläge.map(n => `<li>${n}</li>`).join("")}
                     </ul>
                   </div>`
                : ``;

            const html = `
                ${DSK.UI.Header(daten.gabenName, icon)}
                <div class="dskbox2" style="margin-top:10px;">
                    <p style="margin-bottom: 5px;"><b>Gabenwirkung:</b></p>
                    <p style="margin-top: 0;">${daten.beschreibung}</p>
                    
                    ${erfolgHtml}
                    ${fehlschlagHtml}
                    
                    <p style="text-align:center; font-weight:bold; margin-top: 15px;">
                        Wirkungsdauer: ${daten.dauer || "solange getanzt wird"}
                    </p>
                </div>
            `;

            ChatMessage.create({ 
                speaker: daten.speaker, 
                content: html 
            });

            if (daten.erfolge.length > 0) {
                const plainErfolge = daten.erfolge.map(e => e.replace(/<[^>]*>?/gm, '')).join("<br>• ");
                const kompletterEffektText = `
                    <b>Gabenwirkung:</b><br>${daten.beschreibung}<br><hr>
                    <b>Erfolg:</b><br>• ${plainErfolge}<br><hr>
                    <b>Wirkungsdauer: ${daten.dauer || "solange getanzt wird"}</b>
                `.trim();

                for (const tokenDoc of canvas.tokens.placeables) {
                    const actorObj = tokenDoc.actor;
                    if (!actorObj) continue;
                    const tokenName = DSK.ResolveTokenName(actorObj);

                    if (daten.erfolge.some(e => e.includes(tokenName))) {
                        for (const effect of actorObj.effects) {
                            if (effect.name === `${effektName} (Aphasma)` || effect.name === effektName) {
                                effect.update({ description: kompletterEffektText });
                            }
                        }
                    }
                }
            }
        }, 500);
    }
};

// ============================================================
// === BLOCK 10 — LIVE-ÜBERWACHUNG & WÄCHTER-HOOKS ============
// ============================================================

DSK.LiveUeberwachung = {
    _initialized: false,
    Init() {
        if (this._initialized) return;
        this._initialized = true;

        // 1. Alter Schleier-Hook
        Hooks.on("createActiveEffect", (effect) => {
            const effName = (effect.name || effect.label || "").toLowerCase();
            if (effName.includes("schleier")) {
                const actor = effect.parent;
                const tokenName = DSK.ResolveTokenName(actor);
                console.log(`[DSK Live-Überwachung] Effekt aktiv auf: ${tokenName}`);
            }
        });

        // 2. 🌙 LUNAS WÄCHTER: VERBORGENER WURF (Chat-Scanner)
        Hooks.on("createChatMessage", async (msgObj) => {
            if (msgObj.speaker?.alias === "System" || msgObj.flags?.dsk?.isWatcherMsg) return;
            
            const authorId = msgObj.author?.id || msgObj.user?.id;
            if (authorId !== game.user.id) return; // Nur der Würfelnde rechnet

            const rawContent = String(msgObj.flavor || "") + " " + String(msgObj.content || "");
            if (!rawContent.toLowerCase().includes("sinnessch")) return;

            let hoechsteQS = 0;
            let alleVerborgenenNamen = [];
            
            for (let t of canvas.tokens.placeables) {
                if (t.actor) {
                    const buff = t.actor.effects.find(e => e.getFlag("dsk", "isVerborgenerWurf"));
                    if (buff) {
                        const qs = buff.getFlag("dsk", "qs") || 1;
                        if (qs > hoechsteQS) hoechsteQS = qs;
                        alleVerborgenenNamen.push(t.name);
                    }
                }
            }

            if (alleVerborgenenNamen.length === 0) return; // Niemand verborgen -> abbruch

            const erschwernis = hoechsteQS * 2;
            const angreiferName = msgObj.speaker?.alias || "Ein Suchender";
            const iconBild = DSK.Symbol("Rondra");
            const finalEffektName = "Verborgener Wurf (Rondra)";

            const mathHtml = `
                <p style="margin-bottom: 8px;">Wenn du versuchst, jemanden wahrzunehmen, greift der Effekt <b>Verborgener Wurf</b>.</p>
                <p style="margin-bottom: 4px; font-weight: bold; color: #76301b;">Vorgehen:</p>
                <ul class="dsklist" style="margin-top: 0; margin-bottom: 0;">
                    <li>Ziehe <b>${erschwernis}</b> von deinem Probenwert ab.</li>
                    <li>Vergleiche den Wurf mit dem neuen Wert.</li>
                    <li><b style="color: #18940F;">Erfolg:</b> Habe bitte einen Moment Geduld, der SL beschreibt dir gleich, was du entdeckst.</li>
                    <li><b style="color: #B30000;">Misserfolg:</b> Du nimmst nichts wahr.</li>
                </ul>
            `;

            const whisperHtml = `
                <div style="font-family: 'Signika', sans-serif;">
                    <div class="dskbox1">
                        <p style="display:flex; gap:8px; align-items:center; margin:0;">
                            <img src="${iconBild}" style="width:28px; border:none; background:transparent;">
                            <b>Information</b>
                        </p>
                        <p style="font-weight:bold; margin-top:6px; margin-bottom:0;">${finalEffektName}</p>
                    </div>
                    <div class="dskbox2" style="margin-top:10px; color:#000; font-size:0.95em;">
                        <p style="margin-bottom: 8px;"><b>${angreiferName}</b> hat eine Sinnesschärfe-Probe abgelegt.</p>
                        <hr style="margin: 8px 0; border: 0; border-top: 1px solid #c9bca6;">
                        ${mathHtml}
                    </div>
                </div>
            `;

            let whisperIds = new Set(game.users.filter(u => u.isGM).map(u => u.id));
            if (authorId) whisperIds.add(authorId);

            await ChatMessage.create({
                whisper: Array.from(whisperIds),
                content: whisperHtml,
                speaker: { alias: "System" },
                flags: { dsk: { isWatcherMsg: true } }
            });
        });

        console.log("DSK Live-Überwachung & Wächter-Hooks erfolgreich gestartet.");
    }
};
DSK.LiveUeberwachung.Init();

// ============================================================
// === BLOCK 11 — ZONEN & SCHABLONEN SYSTEM ===================
// ============================================================

DSK.Zone = {
    GetLastTemplate() {
        const templates = canvas.templates.placeables;
        if (templates.length === 0) return null;
        return templates[templates.length - 1]; 
    },

    IsTemplateActive(templateId) {
        for (const t of canvas.tokens.placeables) {
            if (!t.actor) continue;
            for (const effect of t.actor.effects) {
                if (effect.getFlag("dsk", "templateId") === templateId) return true;
            }
        }
        return false;
    },

    IsTokenInside(templatePlaceable, tokenPlaceable) {
        if (!templatePlaceable || !tokenPlaceable) return false;
        const tokenCenter = { x: tokenPlaceable.x + (canvas.grid.size * tokenPlaceable.document.width) / 2, y: tokenPlaceable.y + (canvas.grid.size * tokenPlaceable.document.height) / 2 };
        return templatePlaceable.shape.contains(tokenCenter.x - templatePlaceable.document.x, tokenCenter.y - templatePlaceable.document.y);
    },

    GetTargetsInTemplate(templatePlaceable, targetType = "erwachte") {
        if (!templatePlaceable) return [];
        return canvas.tokens.placeables.filter(t => {
            if (!t.actor) return false;
            if (!this.IsTokenInside(templatePlaceable, t)) return false;
            return DSK.Effekt.CheckTarget(t.actor, targetType);
        });
    },

    StartLiveTracker(config) {
        const {
            casterActorId, templateId, templateUuid, msgId, 
            casterEffektName, zielEffektName, targetType = "erwachte", 
            effektData = {}, radarTitel = "Radar", radarInfoText = "", 
            dauerText = "", ahne = ""
        } = config;

        const casterActor = game.actors.get(casterActorId) || canvas.tokens.placeables.find(t => t.actor?.id === casterActorId)?.actor;
        if (!casterActor) return;

        globalThis.dskZoneTrackers = globalThis.dskZoneTrackers || {};
        if (globalThis.dskZoneTrackers[templateId]?.hookUpdate) {
            Hooks.off("updateToken", globalThis.dskZoneTrackers[templateId].hookUpdate);
        }
        globalThis.dskZoneTrackers[templateId] = { timer: null };

        async function updateZone() {
            if (!casterActor.effects.find(e => (e.name || e.label) === casterEffektName)) {
                Hooks.off("updateToken", globalThis.dskZoneTrackers[templateId].hookUpdate);
                return;
            }

            const activeGM = game.users.find(u => u.isGM && u.active);
            const isUpdater = activeGM ? (game.user.id === activeGM.id) : true;

            const currentTemplateDoc = canvas.scene.templates.get(templateId);
            if (!currentTemplateDoc) return; 

            const targetsInZone = DSK.Zone.GetTargetsInTemplate(currentTemplateDoc.object, targetType);
            const targetIds = targetsInZone.map(t => t.actor.id);
            const targetNames = targetsInZone.map(t => t.name);

            if (isUpdater) {
                for (let t of canvas.tokens.placeables) {
                    const tActor = t.actor;
                    if (!tActor) continue;
                    if (!DSK.Effekt.CheckTarget(tActor, targetType)) continue;

                    const shouldHaveDebuff = targetIds.includes(tActor.id);
                    const existingEffect = tActor.effects.find(e => {
                        const n = e.name || e.label || "";
                        return n === zielEffektName && e.getFlag("dsk", "templateId") === templateId;
                    });

                    if (shouldHaveDebuff && !existingEffect) {
                        await tActor.createEmbeddedDocuments("ActiveEffect", [{
                            name: zielEffektName,
                            icon: DSK.Symbol(ahne),
                            duration: effektData.duration || {},
                            changes: effektData.changes || [],
                            description: effektData.description || "",
                            flags: { dsk: { templateId: templateId } }
                        }]);
                    } else if (!shouldHaveDebuff && existingEffect) {
                        await tActor.deleteEmbeddedDocuments("ActiveEffect", [existingEffect.id]);
                    }
                }

                const msg = game.messages.get(msgId);
                if (msg) {
                    const contentHTML = `
                        <div style="font-family: 'Signika', sans-serif;">
                            ${DSK.UI.Header(radarTitel, DSK.Symbol(ahne))}
                            <div class="dskbox2" style="margin-top:10px;">
                                <p style="font-size:0.95em; line-height:1.35;">${radarInfoText}</p>
                                <hr>
                                <p style="text-align:center; font-weight:bold; margin-top: 10px;">Wirkungsdauer: ${dauerText}</p>
                                <p style="font-size:0.75em; color:#888; text-align:center; margin-top:5px; word-break: break-all;">UUID: ${templateUuid}</p>
                                <hr>
                                <div style="background:rgba(0,85,0,0.1); border:1px solid #005500; padding:6px; border-radius:3px;">
                                    <p style="font-weight:bold; color:#005500; text-align:center; margin-bottom:5px;">🟢 Scanner Aktiv</p>
                                    <p style="font-size:0.9em; margin:0;"><b>Ziele in der Zone:</b><br>
                                    ${targetNames.length > 0 ? "• " + targetNames.join("<br>• ") : "<i style='color:#555;'>Niemand im Inneren.</i>"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    `;
                    await msg.update({ content: contentHTML });
                }
            }
        }

        globalThis.dskZoneTrackers[templateId].hookUpdate = Hooks.on("updateToken", (doc, change) => {
            if (change.x !== undefined || change.y !== undefined) {
                clearTimeout(globalThis.dskZoneTrackers[templateId].timer);
                globalThis.dskZoneTrackers[templateId].timer = setTimeout(() => { updateZone(); }, 500);
            }
        });
        updateZone();
    },

    InitCleanupHook() {
        if (globalThis._dskZoneCleanupHookId) {
            Hooks.off("deleteActiveEffect", globalThis._dskZoneCleanupHookId);
        }

        globalThis._dskZoneCleanupHookId = Hooks.on("deleteActiveEffect", async (effect) => {
            const templateId = effect.getFlag("dsk", "templateId");
            const isZoneSource = effect.getFlag("dsk", "isZoneSource");
            const zielEffName = effect.getFlag("dsk", "zielEffektName");
            
            if (!templateId || !isZoneSource) return;

            const effName = effect.name || effect.label || "";
            if (zielEffName && effName === zielEffName) return;

            const activeGM = game.users.find(u => u.isGM && u.active);
            const isUpdater = activeGM ? (game.user.id === activeGM.id) : true;
            if (!isUpdater) return;

            const msgId = effect.getFlag("dsk", "messageId");

            if (zielEffName) {
                for (const t of canvas.tokens.placeables) {
                    if (!t.actor) continue;
                    const toDelete = t.actor.effects.filter(e => {
                        const n = e.name || e.label || "";
                        return n === zielEffName && e.getFlag("dsk", "templateId") === templateId;
                    }).map(e => e.id);
                    if (toDelete.length > 0) await t.actor.deleteEmbeddedDocuments("ActiveEffect", toDelete);
                }
            }

            const templateDoc = canvas.scene.templates.get(templateId);
            if (templateDoc) await templateDoc.delete();

            if (msgId) {
                const msg = game.messages.get(msgId);
                if (msg) {
                    const title = effect.getFlag("dsk", "radarTitel") || "Zonen-Information";
                    const ahne = effect.getFlag("dsk", "ahne") || "Nurti";
                    await msg.update({ content: `${DSK.UI.Header(title, DSK.Symbol(ahne))}<div class="dskbox2" style="margin-top:10px;"><p style="text-align:center; font-weight:bold; color:#B30000; font-size:1.05em;">Die Zone wurde aufgelöst.</p></div>`});
                }
            }
        });
    },

    RestoreTrackers() {
        if (!canvas || !canvas.ready) {
            Hooks.once("canvasReady", () => DSK.Zone.RestoreTrackers());
            return;
        }
        canvas.tokens.placeables.forEach(t => {
            if (!t.actor) return;
            t.actor.effects.forEach(effect => {
                const flags = effect.flags?.dsk;
                if (flags && flags.isZoneSource && flags.trackerConfig) {
                    DSK.Zone.StartLiveTracker(flags.trackerConfig);
                }
            });
        });
    }
};

DSK.Zone.InitCleanupHook();
DSK.Zone.RestoreTrackers();

// ============================================================
// === BLOCK 12 — GEOMETRIE ===================================
// ============================================================

DSK.Geometrie = {
    Distanz(token1, token2) {
        if (!token1 || !token2) return 999;
        const dx = token1.center.x - token2.center.x;
        const dy = token1.center.y - token2.center.y;
        const pxDist = Math.hypot(dx, dy);
        return (pxDist / canvas.scene.grid.size) * canvas.scene.grid.distance;
    }
};
DSK.Distanz = DSK.Geometrie.Distanz;

// ============================================================
// === BLOCK 13 — SPAWN & CLEANUP SYSTEM ======================
// ============================================================

DSK.SpawnSystem = {
    _initialized: false,
    Init() {
        if (this._initialized) return;
        this._initialized = true;

        Hooks.on("createToken", async (tokenDoc) => {
            if (!game.user.isGM) return;
            const registry = globalThis._dskSpawnRegistry || {};
            for (const [effectName, config] of Object.entries(registry)) {
                if (config.names.includes(tokenDoc.name)) {
                    for (let a of canvas.scene.tokens) {
                        if (a.actor && a.actor.effects.find(e => (e.name || e.label) === effectName)) {
                            await tokenDoc.setFlag("dsk", "spawnedByUuid", a.actor.uuid);
                            if (tokenDoc.actor && !tokenDoc.actor.effects.find(e => (e.name || e.label) === config.targetEffectName)) {
                                await tokenDoc.actor.createEmbeddedDocuments("ActiveEffect", [{ name: config.targetEffectName, icon: DSK.Symbol(config.ahne), description: config.targetDesc, flags: { dsk: { spawnedByUuid: a.actor.uuid } } }]);
                            }
                            break;
                        }
                    }
                }
            }
        });

        Hooks.on("deleteActiveEffect", async (effect) => {
            if (!game.user.isGM) return;
            const registry = globalThis._dskSpawnRegistry || {};
            if (registry[effect.name || effect.label || ""]) {
                const actorDoc = effect.parent;
                if (!actorDoc) return;
                const tokensToDelete = canvas.scene.tokens.filter(t => t.getFlag("dsk", "spawnedByUuid") === actorDoc.uuid).map(t => t.id);
                if (tokensToDelete.length > 0) await canvas.scene.deleteEmbeddedDocuments("Token", tokensToDelete);
            }
        });
    },
    RegisterSpawn(effectName, targetEffectName, namesArray, ahne, targetDesc) {
        globalThis._dskSpawnRegistry = globalThis._dskSpawnRegistry || {};
        globalThis._dskSpawnRegistry[effectName] = { names: namesArray, targetEffectName, ahne, targetDesc };
        this.Init();
    }
};
DSK.SpawnSystem.Init();

// ============================================================
// === BLOCK 14 — LUNAS WÄCHTER (Mit Anti-Duplikat Schutz) ====
// ============================================================

DSK.Zustaende = {
    _initialized: false,
    InitHooks() {
        if (this._initialized) return;
        this._initialized = true;

        Hooks.once("ready", () => {
            if (CONFIG.statusEffects) {
                const kummulativ = ["feared", "pain", "encumbrance", "stupor", "confusion"];
                kummulativ.forEach(id => {
                    let config = CONFIG.statusEffects.find(e => e.id === id);
                    if (config) config.max = 8; 
                });
            }
        });

        const check = (effect) => {
            if (!game.user.isGM) return;
            if (effect.statuses?.size > 0 || effect.changes?.length > 0 || (effect.name||effect.label||"").toLowerCase().includes("selbstvertrauen")) {
                setTimeout(() => this.PruefeEndZustaende(effect.parent), 200);
            }
        };

        Hooks.on("createActiveEffect", check);
        Hooks.on("updateActiveEffect", check);
        Hooks.on("deleteActiveEffect", check);
    },

    async PruefeEndZustaende(actor) {
        if (!actor || actor.documentName !== "Actor") return;

        let werte = { feared: 0, pain: 0, encumbrance: 0, stupor: 0 };

        for (let eff of actor.effects) {
            if (eff.disabled) continue;

            if (eff.statuses.has("feared") && (!eff.changes || eff.changes.length === 0)) werte.feared += (Number(eff.getFlag("dsk", "value")) || 1);
            if (eff.statuses.has("pain") && (!eff.changes || eff.changes.length === 0)) werte.pain += (Number(eff.getFlag("dsk", "value")) || 1);
            if (eff.statuses.has("encumbrance") && (!eff.changes || eff.changes.length === 0)) werte.encumbrance += (Number(eff.getFlag("dsk", "value")) || 1);
            if (eff.statuses.has("stupor") && (!eff.changes || eff.changes.length === 0)) werte.stupor += (Number(eff.getFlag("dsk", "value")) || 1);

            for (let c of eff.changes) {
                if (c.key === "system.status.feared") werte.feared += (Number(c.value) || 0);
                if (c.key === "system.status.pain") werte.pain += (Number(c.value) || 0);
                if (c.key === "system.status.encumbrance") werte.encumbrance += (Number(c.value) || 0);
                if (c.key === "system.status.stupor") werte.stupor += (Number(c.value) || 0);
            }
        }

        const selbstvertrauen = actor.effects.find(e => (e.name || e.label).toLowerCase().includes("selbstvertrauen") && !e.disabled);
        if (selbstvertrauen) werte.feared -= (Number(selbstvertrauen.getFlag("dsk", "qs")) || 1);

        await this.ToggleEndzustand(actor, werte.feared >= 8, "panic", "Status Panisch", "icons/svg/terror.svg");
        await this.ToggleEndzustand(actor, werte.pain >= 8, "incapacitated", "Status Handlungsunfähig", "icons/svg/blood.svg");
        await this.ToggleEndzustand(actor, werte.encumbrance >= 8, "immobilized", "Status Fixiert", "icons/svg/net.svg");
        await this.ToggleEndzustand(actor, werte.stupor >= 8, "unconscious", "Status Bewusstlos", "icons/svg/sleep.svg");
    },

    async ToggleEndzustand(actor, conditionMet, statusId, statusName, iconPath) {
        let existing = actor.effects.filter(e => e.statuses?.has(statusId) || (e.name||e.label) === statusName);
        
        if (conditionMet) {
            if (existing.length === 0) {
                await actor.createEmbeddedDocuments("ActiveEffect", [{
                    name: statusName, type: "base", img: iconPath,
                    changes: [{ key: `system.status.${statusId}`, mode: 2, value: "1" }],
                    statuses: [statusId], flags: { core: { statusId: statusId }, dsk: { autoVerknuepfung: true } }
                }]);
            } 
            else if (existing.length > 1) {
                for (let i = 1; i < existing.length; i++) {
                    await existing[i].delete();
                }
            }
        } else {
            for (let e of existing) {
                if (e.getFlag("dsk", "autoVerknuepfung")) {
                    await e.delete();
                }
            }
        }
    }
};

DSK.Zustaende.InitHooks();

// ============================================================
// === BLOCK 15 — SICHT & ENTDECKUNGSMODI =====================
// ============================================================

DSK.Sicht = {
    _initialized: false,
    InitHooks() {
        if (this._initialized) return;
        this._initialized = true;

        Hooks.on("deleteActiveEffect", async (effect) => {
            if (!game.user.isGM) return;
            const originalModes = effect.getFlag("dsk", "origDetectionModes");
            if (originalModes !== undefined) {
                const actor = effect.parent;
                if (!actor) return;
                
                await actor.update({"prototypeToken.detectionModes": originalModes});
                for (let t of actor.getActiveTokens()) {
                    await t.document.update({ detectionModes: originalModes });
                }
            }
        });
    },

    GetSafeModes(modes) {
        if (!modes) return [];
        return Array.from(modes).map(m => {
            let plain = typeof m.toObject === "function" ? m.toObject() : foundry.utils.deepClone(m);
            if (!Number.isFinite(plain.range)) plain.range = null;
            return plain;
        });
    },

    GetDunkelsichtId() {
        let id = "basicSight";
        if (CONFIG?.Canvas?.detectionModes) {
            const found = Object.values(CONFIG.Canvas.detectionModes).find(m => game.i18n.localize(m.label).toLowerCase().includes("dunkelsicht"));
            if (found) id = found.id;
        }
        return id;
    },

    async Modifiziere(actor, effectDoc, neueModi) {
        if (!actor || !effectDoc) return;

        // 1. Originale Sicht sichern
        const origModes = this.GetSafeModes(actor.prototypeToken.detectionModes);
        await effectDoc.setFlag("dsk", "origDetectionModes", origModes);

        // 2. Modi aktualisieren
        let currentModes = this.GetSafeModes(actor.prototypeToken.detectionModes);
        
        for (let nm of neueModi) {
            let m = currentModes.find(x => x.id === nm.id);
            if (m) {
                if (m.range !== null) m.range = Math.max(Number(m.range) || 0, nm.range);
                m.enabled = true;
            } else {
                currentModes.push({ id: nm.id, range: nm.range, enabled: true });
            }
        }

        // 3. Auf Actor und Tokens anwenden
        await actor.update({"prototypeToken.detectionModes": currentModes});
        for (let t of actor.getActiveTokens()) {
            await t.document.update({ detectionModes: currentModes });
        }
    }
};

DSK.Sicht.InitHooks();


// ============================================================
// === BLOCK 16 — CHAT INTERAKTIONEN (BUTTONS) ================
// ============================================================
if (!DSK.ChatInteraktion) {
    DSK.ChatInteraktion = {
        _initialized: false,
        Init() {
            if (this._initialized) return;
            this._initialized = true;

            Hooks.on("renderChatLog", (app, html, data) => {
                html.on("click", ".dsk-btn-portion", async (ev) => {
                    const btn = ev.currentTarget;
                    const msgId = btn.dataset.msgId;
                    const ahne = btn.dataset.ahne;
                    
                    const msg = game.messages.get(msgId);
                    if (!msg) return;

                    let portionen = msg.getFlag("dsk", "portionen");
                    if (portionen === undefined || portionen <= 0) return;

                    const takerToken = canvas.tokens.controlled[0];
                    if (!takerToken) return ui.notifications.warn("Luna sagt 🌙: Bitte wähle deinen Token aus, um eine Portion zu nehmen!");
                    const takerActor = takerToken.actor;

                    if (!DSK.Wesen.match(takerActor, ["erwacht", "erwachter", "erwachte", "tier", "tiere", "katze", "katzen"])) {
                        return ui.notifications.warn(`Luna sagt 🌙: Diese Speise ist nur für Katzen!`);
                    }

                    let esserListe = msg.getFlag("dsk", "esser") || [];
                    if (esserListe.includes(takerActor.name)) {
                        return ui.notifications.warn(`Luna sagt 🌙: ${takerActor.name} hat sich bereits eine Portion aus dieser Schale gesichert!`);
                    }

                    // Item ins Inventar legen
                    const itemName = "Nurti Nahrung";
                    let existingItem = takerActor.items.find(i => i.name === itemName);
                    
                    if (existingItem) {
                        let newQty = (existingItem.system.quantity?.value || 1) + 1;
                        await existingItem.update({"system.quantity.value": newQty});
                    } else {
                        await takerActor.createEmbeddedDocuments("Item", [{
                            name: itemName,
                            type: "equipment",
                            img: DSK.Symbol(ahne),
                            system: {
                                description: { value: "<p><b>Lebensmittel</b><br>Hält einen Erwachten einen ganzen Tag lang satt.</p>" },
                                quantity: { value: 1 },
                                weight: { value: 0.1 }
                            }
                        }]);
                    }

                    ui.notifications.info(`Luna sagt 🌙: ${takerActor.name} hat eine Portion genommen!`);

                    portionen -= 1;
                    await msg.setFlag("dsk", "portionen", portionen);
                    esserListe.push(takerActor.name);
                    await msg.setFlag("dsk", "esser", esserListe);

                    // HTML der Nachricht aktualisieren
                    const altesHtml = msg.content;
                    const neuesHtml = altesHtml
                        .replace(/<span id="dsk-portionen-count">\d+<\/span>/, `<span id="dsk-portionen-count">${portionen}</span>`)
                        .replace(/<ul id="dsk-esser-liste".*?<\/ul>/s, `<ul id="dsk-esser-liste" class="dsklist" style="margin-bottom: 8px;">${esserListe.map(n => `<li><b>${n}</b></li>`).join("")}</ul>`);

                    let finalHtml = neuesHtml;
                    if (portionen <= 0) {
                        finalHtml = finalHtml.replace(/<button class="dsk-btn-portion".*?<\/button>/, `<div style="text-align:center; color:#8b0000; font-weight:bold; padding: 5px;">Die Schale ist restlos leergeputzt!</div>`);
                    }

                    await msg.update({ content: finalHtml });
                });
            });
        }
    };
    DSK.ChatInteraktion.Init();
}

console.log(`DSK Framework v${DSK.version} erfolgreich geladen.`);
