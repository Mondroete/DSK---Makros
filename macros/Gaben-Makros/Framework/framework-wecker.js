// ==========================================
// 🌙 LUNAS WECKER (System-Start & Wächter)
// ==========================================
(async () => {
    // --- 1. Framework wecken ---
    const fwMacro = await fromUuid("Compendium.dsk-havena-und-umland.makros.Macro.fHQ2OuDo3Fe3spBn");
    if (fwMacro) {
        await fwMacro.execute();
    } else {
        return ui.notifications.error("Luna sagt 🌙: Framework nicht gefunden!");
    }

    const DSK_FW = globalThis.DSK || DSK;
    if (!DSK_FW || !DSK_FW.EffektEnde) return ui.notifications.error("Luna sagt 🌙: DSK.EffektEnde fehlt im Framework!");

    // --- 2. Alle Abbruch-Wächter (EffektEnde) sofort scharfschalten ---
    
    // Wächter: Verborgener Wurf
    if (!globalThis._dskVerborgenerWurfRegistered) {
        globalThis._dskVerborgenerWurfRegistered = true;
        DSK_FW.EffektEnde.Register("verborgenerWurf", "Verborgener Wurf (Rondra)", "Die verschleiernden Schatten verziehen sich. Der Verborgene Wurf ist nicht mehr aktiv und das Ziel wird wieder sichtbar.");
    }

    // Wächter: Weckruf
    if (!globalThis._dskWeckrufRegistered) {
        globalThis._dskWeckrufRegistered = true;
        DSK_FW.EffektEnde.Register("weckruf", "Weckruf (Zerzal)", "Die wachsamen Schatten von Zerzal verblassen. Der Weckruf ist nicht mehr aktiv.");
    }

    // Wächter: Zielscheibe (erfasst auch Namenszusätze wie "Zielscheibe (Zerzal) - Beute")
    if (!globalThis._dskZielscheibeRegistered) {
        globalThis._dskZielscheibeRegistered = true;
        DSK_FW.EffektEnde.Register("zerzalZielscheibe", "Zielscheibe (Zerzal)", "Du verlierst deine Beute aus dem Fokus. Dein Angriff sinkt wieder auf den Normalwert.");
    }

    // Wächter: Anleiten (Selbstvertrauen)
    if (!globalThis._dskAnleitenRegistered) {
        globalThis._dskAnleitenRegistered = true;
        DSK_FW.EffektEnde.Register("anleitenNurti", "Anleiten (Nurti) - Selbstvertrauen", "Das gestärkte Selbstvertrauen schwindet.");
    }

    // --- 3. Bestätigungs-Nachricht an den Spielleiter senden ---
    const contentHTML = `
        <div style="font-family: 'Signika', sans-serif;">
            <div class="dskbox1">
                <p style="display:flex; gap:8px; align-items:center; margin:0;">
                    <span style="font-size: 24px;">🌙</span>
                    <b>System Online</b>
                </p>
                <p style="font-weight:bold; margin-top:6px; margin-bottom:0;">Lunas Wecker</p>
            </div>
            <div class="dskbox2" style="margin-top:10px; text-align: center;">
                <p style="margin-bottom: 8px;">Guten Morgen! Die Welt ist erwacht.</p>
                <hr style="margin: 8px 0; border: 0; border-top: 1px solid #c9bca6;">
                <p style="color: #18940F; font-weight: bold; margin-bottom: 8px;">Alle Wächter & Zonen sind aktiv!</p>
                <p style="font-size: 0.9em; color: #555;">(Verborgener Wurf, Weckruf, Zielscheibe, Zonen-Scanner und Anleiten überwachen nun das Spiel.)</p>
            </div>
        </div>
    `;

    await ChatMessage.create({
        speaker: { alias: "System" },
        whisper: game.users.filter(u => u.isGM).map(u => u.id),
        content: contentHTML
    });
})();
