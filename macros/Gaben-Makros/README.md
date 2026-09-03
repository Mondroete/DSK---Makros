# Gaben‑Makros — Schnellstart & Hinweis zum externen Macro (Ein Bild)

Diese Anleitung erklärt kurz und präzise, welches externe Macro gemeint ist und wo die UUIDs in Foundry einzutragen sind. Statt drei separater Screenshots verwenden wir ein einziges Bild, das beide relevanten Macro‑Fenster (Framework und Gaben‑Macro) nebeneinander zeigt.

Bild (optional einfügen):
- `macros/Gaben-Makros/docs/framework-and-gaben.png`

Wenn du das Bild hier noch nicht hochgeladen hast, kannst du es jetzt als Datei anhängen und ich lade es in `macros/Gaben-Makros/docs/` hoch und binde es ins README ein.

---

Kurz: Welche zwei externen Macros sind gemeint?

1) Framework‑Macro (globales Hilfs‑Macro)
- Zweck: Initialisiert das globale `DSK`‑Objekt (Hilfsfunktionen, UI‑Helper, Effekt‑API). Muss als Script‑Macro im Macro‑Compendium abgelegt werden.
- Wo die UUID hin gehört: in Zeilen wie
  `const fwMacro = await fromUuid("Compendium.<packName>.makros.Macro.<id>");`
  (das ist die `fromUuid(...)`‑Zeile in den Macro‑Templates / embedded Scripts).
- Im Screenshot ist das linke Fenster das Framework‑Macro; oben rechts im Fenster findest du das Icon zum Kopieren der UUID.

2) Gaben‑Macro (Macro, das die Gabe steuert)
- Zweck: Enthält die konkrete Logik der Gabe (z. B. "Anker im Diesseits"). Wird ebenfalls als Script‑Macro in einem Macro‑Compendium gespeichert.
- Wo die UUID hin gehört: typischerweise in der Item‑Script‑Variable `macroLink` oder als `fromUuid(...)` (z. B.):
  `const macroLink = "@UUID[Compendium.<packName>.makros.Macro.<id>]{Anker wirken}";`
  oder
  `const fwMacro = await fromUuid("Compendium.<packName>.makros.Macro.<id>");` (wenn das Script das Macro per UUID lädt).
- Im Screenshot ist das rechte Fenster das Gaben‑Macro; dieses ist der Eintrag, den du als `macroLink` in den Item‑Effekt einträgst.

---

Schritt‑für‑Schritt (Kurzfassung)
1. Framework‑Macro ins Compendium legen → Rechtsklick → Copy UUID → in `fromUuid(...)` einfügen.
2. Gaben‑Macro ins Compendium legen → Rechtsklick → Copy UUID → in `macroLink` (oder `fromUuid`) einfügen (im embedded script `effects[0].flags.dsk.args3` oder im Macro‑Template).
3. Item → Effekt → Reiter „Erweitert“ → Script einfügen / Macro‑Link setzen → Speichern.
4. Test: Token auswählen → Ziele targeten → Macro ausführen → Chatkarte & ActiveEffects prüfen.

---

Häufige Fehler & Debugging
- "DSK is undefined": Framework‑UUID falsch oder Framework‑Macro nicht als Script gespeichert.
- Gaben‑Macro wird nicht gefunden: `macroLink` verweist auf eine falsche oder nicht existierende UUID (prüfe Compendium + ID).
- Tipp: Browser‑Konsole (F12) öffenen und Fehlermeldungen lesen.

---

Möchtest du, dass ich automatisch:
- die Framework‑UUID (`Compendium.dsk-havena-und-umland.makros.Macro.fHQ2OuDo3Fe3spBn`) in alle Macro‑Templates setze? (Antwort: "Framework‑UUID einsetzen")
- die `macroLink`‑UUIDs in den Item‑JSONs eintrage, wenn du die Compendium‑UUIDs der Gaben‑Makros hier postest? (Antwort: "Gaben‑UUIDs einsetzen")
- das Screenshot‑Bild hochlade und in diese README einbinde? (Antwort: "Bild hochladen" + Dateianhang)

Wenn du möchtest, lade das Bild hier hoch (als `framework-and-gaben.png`) — ich füge es dann in `macros/Gaben-Makros/docs/` ein und aktualisiere README, sodass das Bild angezeigt wird.
