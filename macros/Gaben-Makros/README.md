# Gaben‑Makros — Anleitung

Dieses Verzeichnis enthält das DSK‑Framework, Beispiel‑Macros und Item‑Dumps für Gaben (z. B. "Anker im Diesseits").

WICHTIG — UUID ersetzen / Compendium‑Workflow
- Manche Macros laden das DSK‑Framework oder das eigentliche Gaben‑Macro per `fromUuid(...)` aus einem Macro im Compendium. In solchen Fällen musst du die placeholder‑UUID in der Form
  `fromUuid("Compendium.<packName>.makros.Macro.<id>")`
  durch die tatsächliche UUID deines Framework‑Macros oder des Gaben‑Macros ersetzen.
- Hinweis speziell für dieses Repository: Das Item‑Script der Gabe "Anker im Diesseits" führt zur Laufzeit das zugehörige Gaben‑Macro aus — damit das funktioniert, muss dieses Gaben‑Macro in einem Macro‑Compendium gespeichert sein.

Empfohlene Vorgehensweise (speichere das Gaben‑Macro ins Compendium)
1. Öffne Foundry → Compendium → erstelle (falls nötig) ein Macro‑Compendium (Type: Macro). Beispiel‑Name: `dsk-gaben-macros`.
2. Lege im Compendium ein neues Macro an:
   - Öffne das Compendium → Create Macro → Type = Script → Name = `Anker im Diesseits` (oder ein eindeutiger Name deiner Wahl).
   - Füge den Script‑Inhalt (z. B. aus `macros/Gaben-Makros/Anker im Diesseits/anker-im-diesseits-macro.js`) in das Macro ein und speichere.
3. Rechtsklicke auf den gespeicherten Macro‑Eintrag → `Copy UUID`. Du erhältst eine Zeichenkette im Format
   `Compendium.<packName>.makros.Macro.<id>`.
4. Öffne die Item‑JSON (oder das Macro‑JS) in diesem Repo und ersetze die placeholder‑UUID in der `fromUuid(...)`‑Zeile durch die kopierte UUID. Beispiel:
   ```js
   const fwMacro = await fromUuid("Compendium.dsk‑gaben‑macros.makros.Macro.ABc12DeF3gh4IjK");
   ```
5. Importiere das Item‑JSON (falls nötig) in Foundry (Items → Import from File) oder aktualisiere das Item, damit das eingebettete Script die korrekte UUID enthält.

Warum das Compendium nötig ist
- Das Item‑Script ruft `fromUuid(...)` auf, um das Macro aus einem Compendium‑Eintrag zu laden und auszuführen. Befindet sich das Macro nur als lokales Script‑Macro (nicht im Compendium), kann `fromUuid` es nicht laden.

Alternative: Fallback‑Logik (optional)
- Wenn du nicht jedes Mal eine UUID kopieren möchtest, kann das Macro eine Fallback‑Logik verwenden: es versucht zuerst die angegebene UUID, und falls diese nicht gefunden wird, durchsucht es alle Macro‑Compendien nach einem Macro mit dem Namen „Anker im Diesseits“ und führt dieses aus. Das erspart manuellen UUID‑Abgleich, kann aber problematisch sein, wenn mehrere Makros denselben Namen tragen.

Raw‑URL‑Variante (kein Compendium nötig)
- Wenn du kein Compendium anlegen willst, kannst du das Macro so ändern, dass es das Framework per Raw‑URL aus diesem Repo lädt. Beispiel:

```javascript
const fwUrl = "https://raw.githubusercontent.com/Mondroete/DSK---Makros/main/macros/Gaben-Makros/Framework/dsk-framework.js";
try {
  await $.getScript(fwUrl);
  await new Promise(r => setTimeout(r, 150));
} catch (err) {
  console.error("Framework laden fehlgeschlagen:", err);
  return ui.notifications.error("Framework konnte nicht geladen werden.");
}
```

Hinweis zum Item‑JSON
- Falls das Item ein eingebettetes Script in `effects[0].flags.dsk.args3` enthält, ersetze dort ebenfalls die UUIDs — das Embedded‑Script wird beim Import des Items gelesen und muss ebenfalls auf die Compendium‑UUID verweisen.

Hinweis zum Debugging
- Wenn das Macro nicht läuft, öffne die Browser‑Konsole (F12) und prüfe nach Fehlermeldungen. Prüfe außerdem mit Rechtsklick → `Copy UUID`, dass die verwendeten UUIDs exakt mit den Compendium‑Einträgen übereinstimmen.

Wenn du willst, kann ich automatisch:
- die `fromUuid(...)`‑Zeile in den Files hier im Repo gegen eine von dir kopierte UUID austauschen (poste die UUID hier), oder
- eine Fallback‑Suche per Name einbauen, oder
- die Raw‑URL‑Lade‑Variante als Standard einsetzen.

Sag mir kurz, welche Variante du bevorzugst oder poste die Compendium‑UUID, dann mache ich den Commit für dich.