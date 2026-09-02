# Gaben‑Makros — Anleitung

Dieses Verzeichnis enthält das DSK‑Framework, Beispiel‑Macros und Item‑Dumps für Gaben (z. B. "Anker im Diesseits").

Zweck
- Das Framework (macros/Gaben‑Makros/Framework/dsk-framework.js) stellt globale Hilfsfunktionen bereit (DSK.*) für UI, Effekt‑Handhabung und Zonen.
- Beispiel‑Macros in macros/Gaben‑Makros/Examples/ zeigen, wie man das Framework lädt und Gaben ausführt.
- Item‑JSONs in macros/Gaben‑Makros/Items/ sind Exporte von Foundry‑Items und können in dein Spiel importiert werden.

Empfohlener Workflow (Compendium‑basierte Variante)
1. Importiere das Item (z. B. macros/Gaben‑Makros/Items/anker-im-diesseits.item.json) in Foundry: 
   - Öffne dein Spiel → Actors/Items → Create Item → wähle "Import from File" (oder erstelle neues Item und kopiere Felder aus der JSON).
2. Lege ein Compendium an (für Makros oder Items):
   - Compendium öffnen → Create Compendium → Type: Macro (oder Item) → Internal Name (z. B. `dsk-gaben-macros`).
3. Erstelle im Compendium einen Macro‑Eintrag für das Framework:
   - Neues Macro → Type: Script → Name: "DSK Framework" → füge den Inhalt von macros/Gaben‑Makros/Framework/dsk-framework.js ein → Save.
4. Kopiere die UUID des Framework‑Macros:
   - Rechtsklick auf den Macro‑Eintrag → "Copy UUID" → Format: `Compendium.<packName>.macros.Macro.<id>`.
5. Öffne das Beispiel‑Macro (z. B. macros/Gaben‑Makros/Examples/anker-im-diesseits-macro.js) im Repo und ersetze die placeholder‑UUID in der fromUuid(...) Zeile mit deiner kopierten UUID.
6. Lege das Beispiel‑Macro in ein Compendium (Macro‑Compendium) oder als Macro‑Entry im Spiel ab. Verwende es dann im Spiel (z. B. als Chatcard‑Trigger oder Macro Bar Eintrag).

Alternative: Raw‑URL Loader (kein Compendium nötig)
- Wenn du das Framework-Datei direkt aus dem Repo laden möchtest, ändere im Macro den Lade‑Block zu:

```javascript
const fwUrl = "https://raw.githubusercontent.com/Mondroete/DSK---Makros/main/macros/Gaben-Makros/Framework/dsk-framework.js";
try {
  await $.getScript(fwUrl);
  await new Promise(r => setTimeout(r, 150));
} catch (err) {
  console.error("Framework laden fehlgeschlagen:", err);
}
```

Dadurch wird das Framework per HTTP geladen und kein Compendium‑Eintrag bzw. UUID ist nötig.

Hinweis zum UUID‑Format
- Macro‑UUID: Compendium.<packName>.makros.Macro.<id>
- Item‑UUID: Compendium.<packName>.items.Item.<id>

Wenn du willst, kann ich:
- die example‑Macro‑Datei automatisch anpassen, sobald du mir die UUID des Framework‑Macros gibst (ich ersetze die fromUuid(...) Zeile), oder
- die example‑Macro‑Datei so ändern, dass sie standardmäßig erst die Raw‑URL lädt (wenn du das bevorzugst).

Sag mir kurz, ob ich die Beispiel‑Macro‑Datei jetzt mit deiner Compendium‑UUID ersetzen soll (poste die UUID hier) oder ob ich stattdessen die Raw‑URL Variante automatisch einbaue.