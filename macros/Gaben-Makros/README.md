# Gaben‑Makros — Anleitung mit Bildern

Diese Anleitung erklärt Schritt für Schritt, wo du in Foundry die beiden relevanten Macro‑UUIDs findest und wo du sie einträgst. Die drei beigefügten Screenshots veranschaulichen jeden Schritt.

---

## Übersicht (Kurz)
- Bild 1 zeigt, wo du die Framework‑Macro‑UUID kopierst.
- Bild 2 zeigt, wo du die Gaben‑Macro‑UUID (das Macro, das die Gabe steuert) findest bzw. wie es im Macro‑Editor aussieht.
- Bild 3 zeigt, wo im Item → Effekt → Reiter „Erweitert“ die Macro‑Verknüpfung bzw. das eingebettete Script (effects[0].flags.dsk.args3) eingefügt werden muss.

---

## Bilder

### Bild 1 — Framework‑Macro (UUID kopieren)
![Framework – UUID kopieren](../../doc/01-framework-uuid.png)
*Bild 1: Öffne das Framework‑Macro im Macro‑Compendium. Oben rechts im Macro‑Fenster (kleines Icon, gelb markiert) findest du die Option "Copy UUID" — damit kopierst du die vollständige Compendium‑UUID des Framework‑Macros.*

Wann das Framework gebraucht wird
- Das Framework‑Macro initialisiert das globale `DSK`‑Objekt (Hilfsfunktionen, Effekte‑API, UI‑Helper). Viele Gaben‑Macros rufen das Framework per `fromUuid(...)` auf, z. B.:

```js
const fwMacro = await fromUuid("Compendium.<packName>.makros.Macro.<id>");
if (fwMacro) await fwMacro.execute();
```

Wenn diese UUID falsch ist, kommt die Fehlermeldung "DSK is undefined".

---

### Bild 2 — Gaben‑Macro (Macro‑UUID / Skript)
![Gaben‑Macro – Macro‑UUID](../../doc/02-gaben-macro-uuid.png)
*Bild 2: Das Gaben‑Macro (z. B. "Anker im Diesseits") als Script‑Macro. Hier siehst du die Zeile mit `fromUuid("Compendium....")` oder das Ziel‑Script, das später per `macroLink` im Item referenziert wird.*

Hinweis
- Die UUID dieses Macros ist diejenige, die du als `macroLink` in das Item‑Script eintragen musst (weiter unten erklärt). Kopiere die UUID per Rechtsklick → "Copy UUID" auf den Compendium‑Eintrag.

---

### Bild 3 — Item → Effekt → Reiter "Erweitert"
![Item – Effekt → Macro‑Feld](../../doc/03-item-macro-field.png)
*Bild 3: Öffne das Item (z. B. "Anker im Diesseits") → Reiter "Statuseffekte / Zustände" → wähle den Effekt → Reiter "Erweitert". Unter dem Feld "Macro" oder im eingebetteten Script (effects[0].flags.dsk.args3) fügst du den `@UUID[...]`‑Link oder den Script‑String mit der `macroLink`‑Variable ein.*

Was hier einzutragen ist
- Falls dein Item das Macro per Link aufruft, setze im Script:

```js
const macroLink = "@UUID[Compendium.<packName>.makros.Macro.<id>]{Anker wirken}";
```

- Falls das Item ein eingebettetes Script (args3) verwendet, ersetze in diesem String die placeholder‑UUID durch die kopierte Compendium‑UUID.

---

## Schritt‑für‑Schritt (kompakt)
1. Framework‑Macro kopieren (siehe Bild 1): Öffne das Framework‑Macro → Rechtsklick/Info‑Icon → "Copy UUID". Notiere die vollständige Zeichenkette (z. B. `Compendium.meinpack.makros.Macro.abcdef...`).
2. Gaben‑Macro erstellen/kopieren (siehe Bild 2): Lege das Gaben‑Macro als Script im Macro‑Compendium ab (Name z. B. "Anker im Diesseits"). Rechtsklick → "Copy UUID".
3. Item → Effekt bearbeiten (siehe Bild 3): Öffne das Item → Effekte → Effekt wählen → Reiter "Erweitert" → trage entweder
   - das `@UUID[...]`‑MacroLink in das Macro‑Feld ein, oder
   - ersetze im embedded `effects[0].flags.dsk.args3`‑String die placeholder‑UUIDs (Framework & Gaben‑Macro) durch die kopierten Compendium‑UUIDs.
4. Speichern und testen: Token auswählen → Ziel(e) targeten → Macro ausführen → Chatkarte & ActiveEffects prüfen.

---

## Häufige Fehler & Lösungen
- Fehler: "DSK is undefined"
  - Ursache: Framework‑Macro nicht gefunden oder falsche Framework‑UUID in `fromUuid(...)`. Lösung: UUID erneut kopieren und in das Macro eintragen.
- Fehler: Gaben‑Macro wird nicht ausgeführt / "Macro not found"
  - Ursache: `macroLink` verweist auf falsches Compendium/ID. Lösung: Rechtsklick auf den Macro‑Eintrag → "Copy UUID" → replace.
- Tipp: Öffne die Browser‑Konsole (F12) — Fehlermeldungen dort geben oft die genaue Ursache.

---

Wenn du möchtest, trage ich beim Commit zusätzlich automatisch deine Framework‑UUID in alle Macro‑Templates ein oder ersetze `macroLink`‑Platzhalter, wenn du mir die Compendium‑UUIDs der Gaben‑Macros hier postest.
