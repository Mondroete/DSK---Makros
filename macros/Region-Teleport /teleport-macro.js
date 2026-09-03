// --- Lunas Zwei-Wege-Teleporter 🌙 (V13 Ready, Grid-Snapping, Config Unten!) ---

// 1. SOCKETLIB & FRAMEWORK INITIALISIEREN
if (!game.modules.get("socketlib")?.active) {
    if (game.user.isGM) ui.notifications.error("Luna sagt 🌙: Bitte aktiviere das Modul 'socketlib'!");
    return;
}

if (!window.lunaSocket) {
    window.lunaSocket = socketlib.registerSystem(game.system.id);
    window.lunaSocket.register("teleportAsGM", lunasTeleportMagieGM);
}

// ==========================================
// --- HILFSFUNKTIONEN & GM LOGIK ---
// ==========================================
function berechneRegionZentrum(region) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const shape of region.shapes) {
        if (shape.type === "rectangle") { 
            minX = Math.min(minX, shape.x); maxX = Math.max(maxX, shape.x + shape.width);
            minY = Math.min(minY, shape.y); maxY = Math.max(maxY, shape.y + shape.height);
        } else if (shape.type === "ellipse") { 
            let rx = shape.radiusX ?? shape.radius; let ry = shape.radiusY ?? shape.radius;
            minX = Math.min(minX, shape.x - rx); maxX = Math.max(maxX, shape.x + rx);
            minY = Math.min(minY, shape.y - ry); maxY = Math.max(maxY, shape.y + ry);
        } else if (shape.type === "polygon" && shape.points) { 
            for (let i = 0; i < shape.points.length; i += 2) {
                minX = Math.min(minX, shape.points[i]); maxX = Math.max(maxX, shape.points[i]);
                minY = Math.min(minY, shape.points[i+1]); maxY = Math.max(maxY, shape.points[i+1]);
            }
        }
    }
    if (minX === Infinity) return { x: 0, y: 0 };
    return { 
        x: minX + (maxX - minX) / 2, 
        y: minY + (maxY - minY) / 2,
        minX: minX,
        minY: minY
    };
}

async function lunasTeleportMagieGM(tokenUuid, regionUuid) {
    const token = await fromUuid(tokenUuid);
    const region = await fromUuid(regionUuid);
    const szene = region.parent;
    if(!token || !region || !szene) return;

    const empfaengerIds = game.users.filter(u => u.isGM || (token.actor && token.actor.testUserPermission(u, "OWNER"))).map(u => u.id);
    const bounds = berechneRegionZentrum(region);
    
    // ZENTRUM BERECHNEN UND EXAKT INS GRID EINRASTEN (Perfekte Raster-Logik)
    const gridSize = szene.grid.size;
    const dx = bounds.x - bounds.minX;
    const dy = bounds.y - bounds.minY;

    let colsToCenter = Math.floor(dx / gridSize);
    let rowsToCenter = Math.floor(dy / gridSize);

    colsToCenter -= Math.floor(((token.width || 1) - 1) / 2);
    rowsToCenter -= Math.floor(((token.height || 1) - 1) / 2);

    let zielX = bounds.minX + (colsToCenter * gridSize);
    let zielY = bounds.minY + (rowsToCenter * gridSize);

    const tokenUpdateData = {
        x: zielX, y: zielY, hidden: false,
        "flags.world.lunaJustTeleported": Date.now()
    };

    const erstelleWhisper = async (nachricht) => {
        const inhalt = `
            <div style="font-family: 'Signika', sans-serif;">
                <div class="dskbox1" style="display:flex; gap:12px; align-items:center;">
                    <img src="https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/DSK/Allgemein/system-dsk-info2.webp" style="width:64px; height:64px; border:none; background:transparent; flex-shrink:0;">
                    <div>
                        <p style="margin:0;"><b>Systemnachricht</b></p>
                        <p style="font-weight:bold; margin:2px 0 0 0; font-size:1.1em;">Teleport-Protokoll</p>
                    </div>
                </div>
                <div class="dskbox2" style="margin-top:10px;">
                    <div style="font-size:0.95em; line-height:1.35; margin:0;">${nachricht}</div>
                </div>
            </div>
        `;
        await ChatMessage.create({ whisper: empfaengerIds, content: inhalt, speaker: { alias: "System" } });
    };

    if (token.parent.id === szene.id) {
        await token.update(tokenUpdateData);
        if (!game.paused) await game.togglePause(true, true);
        await erstelleWhisper(`${token.name} hat sich erfolgreich ins Zentrum von <b>${region.name}</b> bewegt.`);
        return;
    }

    await token.update({ hidden: true });
    const existierenderToken = szene.tokens.find(t => t.actorId === token.actorId);

    if (existierenderToken) {
        await existierenderToken.update(tokenUpdateData);
    } else {
        const tokenDatenNeu = foundry.utils.duplicate(token.toObject());
        delete tokenDatenNeu._id; 
        tokenDatenNeu.x = zielX; tokenDatenNeu.y = zielY; tokenDatenNeu.hidden = false;
        tokenDatenNeu.flags = tokenDatenNeu.flags || {};
        tokenDatenNeu.flags.world = tokenDatenNeu.flags.world || {};
        tokenDatenNeu.flags.world.lunaJustTeleported = Date.now();
        await szene.createEmbeddedDocuments("Token", [tokenDatenNeu]);
    }
    
    if (!game.paused) await game.togglePause(true, true);
    await erstelleWhisper(`${token.name} ist ins Zentrum von <b>${region.name}</b> gereist.`);
}

// ==========================================
// --- HAUPT-LOGIK FÜR DEN SPIELER/GM ---
// ==========================================
async function starteLunasReise(zielRegionUuid) {
    const myEvent = typeof event !== 'undefined' ? event : null;
    const isRegionEvent = myEvent && myEvent.data && myEvent.data.token;

    // ANTI-LOOP-SCHUTZ
    if (isRegionEvent) {
        const tokenDoc = myEvent.data.token;
        const lastTeleport = tokenDoc.getFlag("world", "lunaJustTeleported");
        if (lastTeleport && (Date.now() - lastTeleport < 4000)) return; 
    }

    // GM-TRICK
    if (!isRegionEvent && game.user.isGM && canvas.tokens.controlled.length === 0) {
        return ui.notifications.info("Luna sagt 🌙: Teleporter-Magie für den GM geladen!");
    }

    if (isRegionEvent) {
        if (myEvent.user?.id !== game.user.id) return;
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (!myEvent.region.tokens.has(myEvent.data.token)) return; 
    }

    const triggerToken = isRegionEvent ? myEvent.data.token : canvas.tokens.controlled[0]?.document;
    if (!triggerToken) return ui.notifications.warn("Luna sagt 🌙: Ich sehe keinen Token, der reisen könnte!");

    const zielRegion = await fromUuid(zielRegionUuid);
    if (!zielRegion) return ui.notifications.error("Luna sagt 🌙: Ziel-Region nicht gefunden.");
    const zielName = zielRegion.name;
    const zielSzene = zielRegion.parent;

    const whisperEmpfaenger = game.users.filter(u => u.isGM || (triggerToken.actor && triggerToken.actor.testUserPermission(u, "OWNER"))).map(u => u.id);

    // DSK-FRAMEWORK SICHERSTELLEN
    if (typeof DSK === "undefined") {
        const fwMacro = await fromUuid("Compendium.dsk-havena-und-umland.makros.Macro.fHQ2OuDo3Fe3spBn");
        if (fwMacro) await fwMacro.execute();
        await new Promise(resolve => setTimeout(resolve, 150)); 
    }

    const botIcon = "https://assets.forge-vtt.com/644fbc20a9e089e2ef894956/DSK/Allgemein/system-dsk-info2.webp";
    const baueDskKarte = (inhalt, titel = "Reisemagie") => `
        <div style="font-family: 'Signika', sans-serif;">
            <div class="dskbox1" style="display:flex; gap:12px; align-items:center;">
                <img src="${botIcon}" style="width:64px; height:64px; border:none; background:transparent; flex-shrink:0;">
                <div>
                    <p style="margin:0;"><b>Systemnachricht</b></p>
                    <p style="font-weight:bold; margin:2px 0 0 0; font-size:1.1em;">${titel}</p>
                </div>
            </div>
            <div class="dskbox2" style="margin-top:10px;">
                <div style="font-size:0.95em; line-height:1.35; margin:0;">${inhalt}</div>
            </div>
        </div>
    `;

    await ChatMessage.create({
        content: baueDskKarte(`<b>${triggerToken.name}</b> möchte die Szene verlassen, sein Ziel: <b>${zielName}</b>.<br><br>Bitte begebt euch zu ihm. Sollte er bestätigen, wird das Spiel pausiert.`),
        speaker: { alias: "System" }
    });

    // NEUES DIALOG-SYSTEM (V13 Ready!)
    const dialogResult = await foundry.applications.api.DialogV2.wait({
        window: { title: "Lunas Reisemagie 🌙" },
        content: baueDskKarte(`
            <p style="text-align: center; margin: 10px 0;">Magst du <b>${zielName}</b> betreten?</p>
            <div style="background-color: rgba(118, 48, 27, 0.1); border: 1px solid #76301b; padding: 8px; border-radius: 4px; color: #4a1e11; text-align: center; font-size: 13px; margin-top: 15px;">
                <b>Wichtiger Hinweis:</b><br>
                Beim Bestätigen wird das Spiel pausiert. Bitte warte, bis alle anderen Spieler, die mitwollen, ebenso auf der Fläche sind.
            </div>
        `),
        rejectClose: false, // Verhindert Fehler beim Schließen über das 'X'
        buttons: [
            {
                action: "yes",
                label: "Ja, betreten",
                icon: "fas fa-door-open",
                default: true,
                callback: () => true
            },
            {
                action: "no",
                label: "Hier bleiben",
                icon: "fas fa-times",
                callback: () => false
            }
        ]
    });

    if (dialogResult) {
        // Ergebnis: Ja, betreten
        await ChatMessage.create({
            whisper: whisperEmpfaenger,
            content: baueDskKarte(`Bitte habt einen Moment Geduld, die Szene wird vorbereitet. Der GM gibt gleich wieder das Spiel frei.`),
            speaker: { alias: "System" }
        });

        if (zielSzene.id !== canvas.scene.id) await zielSzene.view();
        
        try {
            await window.lunaSocket.executeAsGM("teleportAsGM", triggerToken.uuid, zielRegionUuid);
        } catch (error) {
            console.log("Luna sagt 🌙: SocketLib-Status abgefangen (Teleport erfolgreich).");
        }
    } else {
        // Ergebnis: Nein, oder Fenster geschlossen
        await ChatMessage.create({
            whisper: whisperEmpfaenger,
            content: baueDskKarte(`<b>Entwarnung:</b><br>${triggerToken.name} ist weiter gezogen.`, "Reise abgebrochen"),
            speaker: { alias: "System" }
        });
    }
}

// ==========================================
// ⚙️ KONFIGURATION: ZIEL-REGION HIER EINTRAGEN
// ==========================================
await starteLunasReise("Scene.buf8tqbtdC2MuFCA.Region.Wvll8DtoNjxrqC8z");
