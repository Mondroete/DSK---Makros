# Gaben‑Makros — Anleitung

Damit die Makros später die Arbeit im Spiel erleichtern, müssen 3 Schritte eingehalten werden. (Die Einrichtung der Items erfordert 2 weitere Schritte).

**Schritt 1: Framework Makro anlegen**  
Als erstes brauchen wir ein Framework Makro, das wir in unser Kompendium ablegen (siehe Framework Ordner). Dieses initialisiert das globale Objekt und die Hilfsfunktionen.

**Schritt 2: Gaben-Makro erstellen**  
Wir kopieren das Makro für die Gaben in ein eigenes Makro Skript, damit sie jeder später nutzen kann. So gehen die gewollten Fenster auch bei der gewünschten Person auf.

**Schritt 3: UUID für das Framework austauschen**  
Nun tauschen wir die UUID aus, da ich hier nur meine Makros abgespeichert habe und nicht die ganzen Dateien.

*Bild 1: Öffne das Framework‑Macro im Macro‑Compendium. Oben rechts findest du "Copy UUID". Ersetze die UUID im Makro durch deine eigene, sonst kommt der Fehler "DSK is undefined".*

![Framework – UUID kopieren](https://raw.githubusercontent.com/Mondroete/DSK---Makros/main/macros/Bilder/01-framework-uuid.png)

**Schritt 4: Ahnengabe vorbereiten**  
Wir nehmen uns nun die Ahnengabe (das Item) vor und fügen da das Makro ein.

*Bild 3: Öffne das Item → Reiter "Statuseffekte / Zustände" → Effekt wählen → Reiter "Erweitert". Trage hier das Macro als Link oder Skript ein.*

![Item – Effekt → Macro‑Feld](https://raw.githubusercontent.com/Mondroete/DSK---Makros/main/macros/Bilder/03-item-macro-field.png)

**Schritt 5: UUID für das Gaben-Makro austauschen**  
Auch hier müssen wir die UUID austauschen, damit das Item exakt dein neu erstelltes Makro findet.

*Bild 2: Das Gaben-Macro als Script. Kopiere hier die UUID per Rechtsklick und füge sie als `macroLink` in das Item ein.*

![Gaben‑Macro – Macro‑UUID](https://raw.githubusercontent.com/Mondroete/DSK---Makros/main/macros/Bilder/02-gaben-macro-uuid.png)

---

**Vorgehen im Spiel:**
* Unser Spieler würfelt seine Ahnengabe.
* Er klickt auf den Effekt **SELBST**.
* Dann taucht etwas im Chat auf.
* Dort aktiviert er das eigentliche Makro.
* Je nach Gabe befolgt er nun die Anweisungen im Fenster.


-----------------------------------------------------------------------------------------------------------------------


# Framework
es ist die Übersichtensammlung der Effekte, ein Baukasten aus dem sich ein Effekt zusammen setzt.


-----------------------------------------------------------------------------------------------------------------------


# Framework Wecker
er dient dazu nach die effekte wieder zu überwachen, falls eine Runde mit laufenden Effekten beendet wurde.


-----------------------------------------------------------------------------------------------------------------------


# Erweiterung: Daten per JSON-Datei importieren
Um Zeit bei der Einrichtung zu sparen, können fertige Makros und Gaben auch direkt als `.json`-Datei in Foundry VTT importiert werden. 

Die folgende Bildfolge zeigt den Import beispielhaft an einem Makro. Wenn man stattdessen Gaben (Items) importieren möchte, funktioniert das auf exakt demselben Weg – man führt die Schritte dann einfach im Reiter für Gegenstände/Items aus.

**Schritt 1: Makro- oder Item-Verzeichnis öffnen**
*Bild 4: Rechtsklick auf den Ordner oder das Element, in das importiert werden soll.*

![JSON Import Teil 1](https://raw.githubusercontent.com/Mondroete/DSK---Makros/main/macros/Bilder/josn-import_teil1.png)

**Schritt 2: Import-Option wählen**
*Bild 5: Wähle im Kontextmenü die Option zum Importieren von Daten (Import Data).*

![JSON Import Teil 2](https://raw.githubusercontent.com/Mondroete/DSK---Makros/main/macros/Bilder/json-import-teil2.png)

**Schritt 3: JSON-Datei aussuchen**
*Bild 6: Klicke auf den Button zur Dateiauswahl und suche die heruntergeladene JSON-Datei auf deinem PC.*

![JSON Import Teil 3](https://raw.githubusercontent.com/Mondroete/DSK---Makros/main/macros/Bilder/joson-import-teil3.png)

**Schritt 4: Import bestätigen**
*Bild 7: Bestätige den Dialog, um die Datei in Foundry hochzuladen.*

![JSON Import Teil 4](https://raw.githubusercontent.com/Mondroete/DSK---Makros/main/macros/Bilder/json-import-teil4.png)

**Schritt 5: Erfolgreicher Import**
*Bild 8: Das Makro bzw. das Item ist nun importiert. (Hinweis: Denke daran, anschließend trotzdem die UUIDs wie in Schritt 3 und 5 der Grundanleitung beschrieben an deine eigene Welt anzupassen).*

![JSON Import Teil 5](https://raw.githubusercontent.com/Mondroete/DSK---Makros/main/macros/Bilder/joson-import-teil5.png)
