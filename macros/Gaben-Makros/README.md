# Gaben‑Makros — Anleitung

Damit die Makros später die Arbeit im Spiel erleichtern, müssen 3 Schritte eingehalten werden. (Die Einrichtung der Items erfordert 2 weitere Schritte).

**Schritt 1: Framework Makro anlegen**  
Als erstes brauchen wir ein Framework Makro, das wir in unser Kompendium ablegen (siehe Framework Ordner). Dieses initialisiert das globale Objekt und die Hilfsfunktionen.

**Schritt 2: Gaben-Makro erstellen**  
Wir kopieren das Makro für die Gaben in ein eigenes Makro Skript, damit sie jeder später nutzen kann. So gehen die gewollten Fenster auch bei der gewünschten Person auf.

**Schritt 3: UUID für das Framework austauschen**  
Nun tauschen wir die UUID aus, da ich hier nur meine Makros abgespeichert habe und nicht die ganzen Dateien.

![Framework – UUID kopieren](https://raw.githubusercontent.com/Mondroete/DSK---Makros/main/macros/Bilder/01-framework-uuid.png)

*Bild 1: Öffne das Framework‑Macro im Macro‑Compendium. Oben rechts findest du "Copy UUID". Ersetze die UUID im Makro durch deine eigene, sonst kommt der Fehler "DSK is undefined".*

**Schritt 4: Ahnengabe vorbereiten**  
Wir nehmen uns nun die Ahnengabe (das Item) vor und fügen da das Makro ein.

![Item – Effekt → Macro‑Feld](https://raw.githubusercontent.com/Mondroete/DSK---Makros/main/macros/Bilder/03-item-macro-field.png)

*Bild 3: Öffne das Item → Reiter "Statuseffekte / Zustände" → Effekt wählen → Reiter "Erweitert". Trage hier das Macro als Link oder Skript ein.*

**Schritt 5: UUID für das Gaben-Makro austauschen**  
Auch hier müssen wir die UUID austauschen, damit das Item exakt dein neu erstelltes Makro findet.

![Gaben‑Macro – Macro‑UUID](https://raw.githubusercontent.com/Mondroete/DSK---Makros/main/macros/Bilder/02-gaben-macro-uuid.png)

*Bild 2: Das Gaben-Macro als Script. Kopiere hier die UUID per Rechtsklick und füge sie als `macroLink` in das Item ein.*

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
