/* GM‑Übersichts‑Makro – Zeitfenster-Gruppierung (v6.1)
 ************************************************************/

/* ============================================================
   Konfiguration & Button‑Styles
   ============================================================ */

const BTN_BIG = `
    background:linear-gradient(#76301b,#582617);
    color:#f8f6f5;
    border:1px solid #000;
    border-radius:4px;
    font-weight:bold;
    padding:3px 8px;
    font-size:11px;
    cursor:pointer;
    white-space:nowrap;
    height:25px;
    line-height:17px;
    box-sizing:border-box;
`;

const BTN_HEAD = `
    background:linear-gradient(#76301b,#582617);
    color:#f8f6f5;
    border:1px solid #000;
    border-radius:4px;
    font-weight:bold;
    padding:3px 8px;
    font-size:11px;
    cursor:pointer;
    white-space:nowrap;
    height:25px;
    line-height:17px;
    box-sizing:border-box;
    width:75px;
    text-align:center;
`;

const BTN_LVL = `
    background:#5a3b2a;
    color:#fff;
    border:1px solid #000;
    border-radius:3px;
    font-weight:bold;
    cursor:pointer;
    width:22px;
    height:22px;
    font-size:12px;
    line-height:20px;
    text-align:center;
    padding:0;
`;

/* ============================================================
   Modul 1: Gruppen- & Effekt-Analyse (Intelligentes Matching)
   ============================================================ */

function collectEffectsAndGroups() {
    const rawEffects = [];

    for (const token of canvas.tokens.placeables) {
        const actor = token.actor;
        if (!actor) continue;

        const actorImg = token.document?.texture?.src || actor.img || "icons/svg/mystery-man.svg";
        const displayName = token.document?.name || actor.name;

        for (const effect of actor.effects) {
            if (effect.disabled) continue;

            const name = effect.name || "Unbenannter Effekt";
            // Nutzung von createdTime aus den _stats, alternativ startTime
            const createdTime = effect._stats?.createdTime || effect.duration?.startTime || 0;

            rawEffects.push({
                tokenId: token.id,
                actorId: actor.id,
                actorName: displayName,
                actorImg,
                effectId: effect.id,
                name,
                icon: effect.img || "icons/svg/aura.svg",
                createdTime,
                flags: effect.flags,
                effect,
                groupId: null
            });
        }
    }

    // Zeitfenster-basierte Gruppierung (3.000 ms = 3 Sekunden Toleranz)
    const TIME_WINDOW_MS = 3000;
    const groupsList = [];

    for (const item of rawEffects) {
        // HIER IST DIE MAGIE: Wir spalten den Namen beim " - " ab. 
        // Aus "Ehrenschulden (Aphasma) - Wette mit Laura" wird "Ehrenschulden (Aphasma)"
        const kernName = item.name.split(" - ")[0].trim();

        let group = groupsList.find(g => 
            g.kernName === kernName && 
            Math.abs(g.baseTime - item.createdTime) <= TIME_WINDOW_MS
        );

        if (!group) {
            group = {
                id: `group_${groupsList.length + 1}_${Date.now()}`,
                kernName: kernName, // Wichtig für den flexiblen Vergleich
                name: item.name,
                baseTime: item.createdTime,
                items: []
            };
            groupsList.push(group);
        }

        group.items.push(item);
    }

    const groupsMap = {};

    for (const group of groupsList) {
        if (group.items.length > 1) {
            groupsMap[group.id] = group.items;
            for (const item of group.items) {
                item.groupId = group.id;
            }
        }
    }

    const tokensResult = {};
    for (const item of rawEffects) {
        if (!tokensResult[item.tokenId]) {
            tokensResult[item.tokenId] = {
                tokenId: item.tokenId,
                actorName: item.actorName,
                actorImg: item.actorImg,
                effects: []
            };
        }
        
        const groupList = item.groupId ? groupsMap[item.groupId] : null;
        item.groupSize = groupList ? groupList.length : 1;

        tokensResult[item.tokenId].effects.push(item);
    }

    return { tokensData: tokensResult, groupsMap };
}

/* ============================================================
   Modul 2: Stufen‑Regler
   ============================================================ */

async function updateSystemEffectLevel(effect, newValue) {
    const flags = effect.flags.dsk;
    const max = flags.max ?? 8;
    const value = Math.clamped(Number(newValue), 0, max);

    await effect.update({
        "flags.dsk.value": value,
        "flags.dsk.manual": value
    });
}

function renderLevelControl(effectData) {
    const hasLevel = effectData.flags?.dsk && typeof effectData.flags.dsk.value === "number";
    if (!hasLevel) return "";

    const value = effectData.flags.dsk.value;
    const max = effectData.flags.dsk.max ?? 8;

    return `
        <div class="level-control" data-eid="${effectData.effectId}" data-token-id="${effectData.tokenId}"
             style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
            <button type="button" class="lvl-minus" data-eid="${effectData.effectId}" style="${BTN_LVL}">-</button>
            <input class="lvl-input" data-eid="${effectData.effectId}"
                   type="number" min="0" max="${max}" value="${value}"
                   style="width:34px; height:22px; text-align:center; font-size:12px;">
            <button type="button" class="lvl-plus" data-eid="${effectData.effectId}" style="${BTN_LVL}">+</button>
        </div>
    `;
}

/* ============================================================
   Modul 3: Effekt‑Beschreibung
   ============================================================ */

function renderEffectDescription(effectData) {
    const raw = effectData.effect.description || "";
    if (!raw) return `<div style="color:#777; font-size:0.85em; margin-top:4px;">Keine Beschreibung vorhanden</div>`;
    const localized = game.i18n.localize(raw);

    return `
        <div style="margin-top:6px;">
            <span class="desc-toggle" style="cursor:pointer; font-size:0.9em; color:#333; font-weight:bold;">
                <span class="arrow">▶</span> Beschreibung
            </span>
            <div class="desc-content" style="display:none; font-size:0.9em; color:#222; margin-top:4px; padding:8px 10px;">
                ${localized}
            </div>
        </div>
    `;
}

/* ============================================================
   Modul 4: Effekt‑Zeile
   ============================================================ */

function renderSingleEffectRow(effectData) {
    let deleteActionHTML = "";
    let groupBadgeHTML = "";

    if (effectData.groupId && effectData.groupSize > 1) {
        groupBadgeHTML = `<span style="background:#76301b; color:#fff; font-size:9px; padding:2px 5px; border-radius:3px; flex-shrink:0; white-space:nowrap;">Gruppe (${effectData.groupSize})</span>`;

        deleteActionHTML = `
            <button class="delete-group-btn" data-group-id="${effectData.groupId}" style="${BTN_BIG}">Gruppe löschen</button>
            <button class="delete-single" data-eid="${effectData.effectId}" style="${BTN_BIG}">Einzeln</button>
        `;
    } else {
        deleteActionHTML = `<button class="delete-single" data-eid="${effectData.effectId}" style="${BTN_BIG}">Löschen</button>`;
    }

    const editButtonHTML = `<button class="open-effect-sheet" style="${BTN_BIG}">Bearbeiten</button>`;

    return `
        <div class="effect-row" data-token-id="${effectData.tokenId}" data-effect-id="${effectData.effectId}"
             style="padding:8px 4px; border-bottom:1px solid rgba(0,0,0,0.12);">

            <div style="display:flex; align-items:center; gap:8px; flex-wrap:nowrap;">
                <img src="${effectData.icon}" width="36" height="36"
                     style="border:1px solid rgba(0,0,0,0.2); border-radius:4px; flex-shrink:0;" />

                <div style="font-weight:bold; font-size:0.95em; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${effectData.name}">
                    ${effectData.name}
                </div>

                ${groupBadgeHTML}

                ${renderLevelControl(effectData)}

                <div style="margin-left:auto; display:flex; flex-direction:row; flex-wrap:nowrap; align-items:center; gap:6px; flex-shrink:0;">
                    ${editButtonHTML}
                    ${deleteActionHTML}
                </div>
            </div>

            ${renderEffectDescription(effectData)}
        </div>
    `;
}

/* ============================================================
   Modul 5: Token‑Block
   ============================================================ */

function renderActorSection(tokenData, isOpen) {
    const effects = tokenData.effects;
    if (effects.length === 0) return "";

    const actorImg = tokenData.actorImg;
    const effectRows = effects.map(renderSingleEffectRow).join("");
    const displayStyle = isOpen ? "block" : "none";
    const arrowChar = isOpen ? "▼" : "▶";

    return `
        <div class="actor-block" data-token-id="${tokenData.tokenId}" style="padding:10px 0;">

            <div class="actor-dropdown-header"
                 style="cursor:pointer; display:flex; align-items:center; gap:10px;">
                
                <span class="actor-arrow" style="font-size:14px; width:12px;">${arrowChar}</span>

                <img src="${actorImg}" width="48" height="48"
                     style="border-radius:50%; object-fit:cover; border:2px solid rgba(0,0,0,0.2); flex-shrink:0;">

                <span style="font-weight:bold; color:#222; font-size:1.05em;">
                    ${tokenData.actorName}
                </span>

                <button class="edit-actor-btn" data-token-id="${tokenData.tokenId}" style="${BTN_HEAD}">
                    Bearbeiten
                </button>

                <span style="margin-left:auto; font-size:0.85em; color:#555;">
                    (${effects.length} Effekte)
                </span>
            </div>

            <div class="actor-dropdown-content" style="display:${displayStyle}; margin-top:10px;">
                ${effectRows}
            </div>
        </div>
    `;
}

/* ============================================================
   GM‑Dialog
   ============================================================ */

class DSKEffectManagerDialog extends Dialog {
    constructor() {
        super({
            title: "Effekte Übersicht – GM (v6.1)",
            content: "",
            buttons: {}
        }, {
            width: 880,
            height: 700,
            resizable: true
        });

        this.openTokens = {};
        this.groupsMap = {};
        this._hooks = [];
    }

    render(force=false, options={}) {
        if (this.element) {
            this.element.find(".actor-block").each((i, el) => {
                const tokenId = el.dataset.tokenId;
                const content = el.querySelector(".actor-dropdown-content");
                if (content && content.style.display === "block") {
                    this.openTokens[tokenId] = true;
                } else {
                    delete this.openTokens[tokenId];
                }
            });
        }

        this.data.content = this._renderHTML();

        if (this._hooks.length === 0) {
            const events = [
                "updateActiveEffect", "createActiveEffect", "deleteActiveEffect",
                "updateToken", "createToken", "deleteToken"
            ];
            for (const name of events) {
                const id = Hooks.on(name, () => this.render(true));
                this._hooks.push({ name, id });
            }
        }

        return super.render(force, options);
    }

    close(options={}) {
        for (const h of this._hooks) {
            Hooks.off(h.name, h.id);
        }
        this._hooks = [];
        return super.close(options);
    }

    _renderHTML() {
        const { tokensData, groupsMap } = collectEffectsAndGroups();
        this.groupsMap = groupsMap;

        let html = `
            <div style="padding:10px; max-height:620px; overflow-y:auto; font-size:13px;">
                <div class="dskbox1" style="margin-bottom:14px;">
                    <p style="font-weight:bold; text-align:center;">Effekte Übersicht (v6.1)</p>
                    <hr>
                    <p style="text-align:center;">Zeitfenster-Gruppierung vereint verknüpfte Bögen und Unlinked-NPCs bei gleichzeitigem Zauberwirken.</p>
                </div>

                <div class="dskbox2" style="padding:12px;">
        `;

        const tokenIds = Object.keys(tokensData);

        if (tokenIds.length === 0) {
            html += `<p style="text-align:center; color:#777;">Keine aktiven Effekte.</p>`;
        } else {
            let first = true;

            for (const tokenId of tokenIds) {
                const data = tokensData[tokenId];
                const isOpen = !!this.openTokens[tokenId];

                if (!first) {
                    html += `<hr style="margin:12px 0; border:0; border-top:1px solid rgba(0,0,0,0.2);">`;
                }
                first = false;

                html += renderActorSection(data, isOpen);
            }
        }

        html += `
                </div>
            </div>
        `;

        return html;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".actor-dropdown-header").on("click", ev => {
            if (ev.target.classList.contains("edit-actor-btn")) return;

            const header = ev.currentTarget;
            const block = header.closest(".actor-block");
            const tokenId = block.dataset.tokenId;
            const content = block.querySelector(".actor-dropdown-content");
            const arrow = header.querySelector(".actor-arrow");

            const open = content.style.display === "none";
            content.style.display = open ? "block" : "none";
            arrow.textContent = open ? "▼" : "▶";

            if (open) this.openTokens[tokenId] = true;
            else delete this.openTokens[tokenId];
        });

        html.find(".edit-actor-btn").on("click", ev => {
            ev.stopPropagation();
            const tokenId = ev.currentTarget.dataset.tokenId;
            const token = canvas.tokens.get(tokenId);
            token?.actor?.sheet.render(true, { token: token.document });
        });

        html.find(".open-effect-sheet").on("click", ev => {
            const row = ev.currentTarget.closest(".effect-row");
            const tokenId = row.dataset.tokenId;
            const eid = row.dataset.effectId;

            const token = canvas.tokens.get(tokenId);
            const effect = token?.actor?.effects.get(eid);

            effect?.sheet.render(true);
        });

        html.find(".desc-toggle").on("click", ev => {
            const header = ev.currentTarget;
            const content = header.nextElementSibling;
            const arrow = header.querySelector(".arrow");

            const open = content.style.display === "none";
            content.style.display = open ? "block" : "none";
            arrow.textContent = open ? "▼" : "▶";
        });

        html.find(".lvl-minus").on("click", async ev => {
            const eid = ev.currentTarget.dataset.eid;
            const row = ev.currentTarget.closest(".effect-row");
            const tokenId = row.dataset.tokenId;

            const token = canvas.tokens.get(tokenId);
            const effect = token?.actor?.effects.get(eid);

            if (effect) {
                const curVal = effect.flags.dsk?.value ?? 0;
                await updateSystemEffectLevel(effect, curVal - 1);
                this.render(true);
            }
        });

        html.find(".lvl-plus").on("click", async ev => {
            const eid = ev.currentTarget.dataset.eid;
            const row = ev.currentTarget.closest(".effect-row");
            const tokenId = row.dataset.tokenId;

            const token = canvas.tokens.get(tokenId);
            const effect = token?.actor?.effects.get(eid);

            if (effect) {
                const curVal = effect.flags.dsk?.value ?? 0;
                await updateSystemEffectLevel(effect, curVal + 1);
                this.render(true);
            }
        });

        html.find(".lvl-input").on("change", async ev => {
            const eid = ev.currentTarget.dataset.eid;
            const row = ev.currentTarget.closest(".effect-row");
            const tokenId = row.dataset.tokenId;

            const token = canvas.tokens.get(tokenId);
            const effect = token?.actor?.effects.get(eid);

            if (effect) {
                await updateSystemEffectLevel(effect, ev.currentTarget.value);
                this.render(true);
            }
        });

        html.find(".delete-group-btn").on("click", async ev => {
            const groupId = ev.currentTarget.dataset.groupId;
            const groupItems = this.groupsMap[groupId] || [];

            for (const item of groupItems) {
                const token = canvas.tokens.get(item.tokenId);
                const effect = token?.actor?.effects.get(item.effectId);
                if (effect) {
                    await effect.delete();
                }
            }

            this.render(true);
        });

        html.find(".delete-single").on("click", async ev => {
            const row = ev.currentTarget.closest(".effect-row");
            const tokenId = row.dataset.tokenId;
            const eid = ev.currentTarget.dataset.eid;

            const token = canvas.tokens.get(tokenId);
            const effect = token?.actor?.effects.get(eid);

            if (effect) {
                await effect.delete();
                this.render(true);
            }
        });
    }
}

/* ============================================================
   Starten (Singleton)
   ============================================================ */

if (window.dskEffectManagerInstance && window.dskEffectManagerInstance.rendered) {
    window.dskEffectManagerInstance.bringToTop();
} else {
    window.dskEffectManagerInstance = new DSKEffectManagerDialog();
    window.dskEffectManagerInstance.render(true);
}
