// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  Vagabond PDF Exporter                                                     ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
console.log("[VPI Export] vagabond-pdf-export.js loading...");

// ── Foundry Skill Key → PDF Field Names ──────────────────────────────────────

const SKILL_PDF_MAP = {
  arcana:      { dc: "Arcana Skill Difficulty",        trained: "Arcana Trained" },
  brawl:       { dc: "Brawn Skill Difficulty",         trained: "Brawn Trained" },
  craft:       { dc: "Craft Skill Difficulty",         trained: "Craft Trained" },
  detect:      { dc: "Detect Skill Difficulty",        trained: "Detect Trained" },
  finesse:     { dc: "Finesse Skill Difficulty",       trained: "Finesse Trained" },
  influence:   { dc: "Influence Skill Difficulty",     trained: "Influence Trained" },
  leadership:  { dc: "Leadership Skill Difficulty",    trained: "Leadership Trained" },
  medicine:    { dc: "Medicine Skill Difficulty",      trained: "Medicine Trained" },
  melee:       { dc: "Melee Attack Check Difficulty",  trained: "Melee Weapons Trained" },
  mysticism:   { dc: "Mysticism Skill Difficulty",     trained: "Mysticism Trained" },
  performance: { dc: "Performance Skill Difficulty",   trained: "Performance Trained" },
  ranged:      { dc: "Ranged Attack Difficulty",       trained: "Ranged Weapons Trained" },
  sneak:       { dc: "Sneak Skill Difficulty",         trained: "Sneak Trained" },
  survival:    { dc: "Survival Skill Difficulty",      trained: "Survival Trained" },
};

const STAT_PDF_MAP = {
  awareness: "AWR",
  dexterity: "DEX",
  reason:    "LOG",
  luck:      "LUK",
  might:     "MIT",
  presence:  "PRS",
};

// ── PDF Field Helpers ────────────────────────────────────────────────────────

function _setText(form, fieldName, value) {
  try { form.getTextField(fieldName).setText(String(value ?? "")); }
  catch { /* field not found */ }
}

function _setCheck(form, fieldName, checked) {
  try { const f = form.getCheckBox(fieldName); if (checked) f.check(); else f.uncheck(); }
  catch { /* field not found */ }
}

function _setDropdown(form, fieldName, value) {
  try { form.getDropdown(fieldName).select(value); }
  catch { /* field not found */ }
}

/** Strip HTML tags to plain text */
function _stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ── Lazy-load pdf-lib from module bundle ─────────────────────────────────────

let _pdfLibCache = null;
async function _getPdfLib() {
  if (_pdfLibCache) return _pdfLibCache;
  // Already loaded by a prior call or by the scripts array
  if (typeof PDFLib !== "undefined") { _pdfLibCache = PDFLib; return _pdfLibCache; }
  // Dynamically inject the script so it doesn't block module init
  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "modules/vagabond-pdf-importer/scripts/lib/pdf-lib.min.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load pdf-lib"));
    document.head.appendChild(script);
  });
  _pdfLibCache = PDFLib;
  return _pdfLibCache;
}

// ── Main Export Function ─────────────────────────────────────────────────────

async function exportActorToPdf(actor) {
  if (!actor || actor.type !== "character") {
    ui.notifications.warn("Please select a character actor to export.");
    return;
  }

  ui.notifications.info(`Exporting ${actor.name} to PDF...`);

  try {
    // ── Load pdf-lib on demand ──
    const PDFLib = await _getPdfLib();
    if (!PDFLib) throw new Error("pdf-lib could not be loaded");

    // ── Load the blank PDF template ──
    const templateUrl = "modules/vagabond-pdf-importer/templates/hero-record-template.pdf";
    const response = await fetch(templateUrl);
    if (!response.ok) throw new Error(`Failed to load PDF template: ${response.status}`);
    const pdfDoc = await PDFLib.PDFDocument.load(await response.arrayBuffer());
    const form = pdfDoc.getForm();
    const sys = actor.system;

    // ── Character Info ──
    _setText(form, "Name", actor.name);
    _setText(form, "Level", sys.attributes?.level?.value ?? 0);
    _setText(form, "XP", sys.attributes?.xp ?? 0);

    const ancestryItem = actor.items.find(i => i.type === "ancestry");
    const classItem = actor.items.find(i => i.type === "class");
    _setText(form, "Ancestry", ancestryItem?.name ?? "");
    _setText(form, "Class", classItem?.name ?? "");

    // Being type and Size — read from derived ancestryData
    const beingType = sys.ancestryData?.beingType ?? ancestryItem?.system?.ancestryType ?? "Humanlike";
    const size = sys.ancestryData?.size ?? ancestryItem?.system?.size ?? "medium";
    const sizeMap = { tiny: "T", small: "S", medium: "M", large: "L", huge: "H", gargantuan: "G" };
    _setDropdown(form, "Being Type", beingType);
    _setDropdown(form, "Size", sizeMap[size] ?? "M");

    // ── Stats (read derived .total which includes bonuses) ──
    for (const [statKey, pdfField] of Object.entries(STAT_PDF_MAP)) {
      const val = sys.stats?.[statKey]?.total ?? sys.stats?.[statKey]?.value ?? 0;
      _setText(form, pdfField, val);
    }

    // ── HP / Mana / Luck (all derived by the system) ──
    _setText(form, "Max HP", sys.health?.max ?? "");
    _setText(form, "Current HP", sys.health?.value ?? "");
    _setText(form, "Max Mana", sys.mana?.max || "");
    _setText(form, "Current Mana", sys.mana?.current || "");
    _setText(form, "Current Luck", sys.currentLuck ?? "");
    _setText(form, "Fatigue", sys.fatigue ?? 0);
    _setText(form, "Casting Maximum", sys.mana?.castingMax || "");

    // ── Armor Rating (derived by system) ──
    _setText(form, "Armor Rating", sys.armor ?? "");

    // ── Saves (read derived .difficulty) ──
    _setText(form, "Endure Save Difficulty", sys.saves?.endure?.difficulty ?? "");
    _setText(form, "Reflex Save Difficulty", sys.saves?.reflex?.difficulty ?? "");
    _setText(form, "Will Save Difficulty",   sys.saves?.will?.difficulty ?? "");

    // ── Skills (read derived .difficulty and .trained) ──
    for (const [skillKey, info] of Object.entries(SKILL_PDF_MAP)) {
      const skill = sys.skills?.[skillKey];
      _setText(form, info.dc, skill?.difficulty ?? "");
      _setCheck(form, info.trained, skill?.trained ?? false);
    }

    // ── Speed (read derived values) ──
    _setText(form, "Speed", sys.speed?.base ?? "");
    _setText(form, "Speed Bonus", "");
    _setText(form, "Crawl Speed", sys.speed?.crawl ?? "");
    _setText(form, "Travel Speed", sys.speed?.travel ?? "");

    // ── Wealth ──
    _setText(form, "Wealth (g)", sys.currency?.gold ?? "");
    _setText(form, "Wealth (s)", sys.currency?.silver ?? "");
    _setText(form, "Wealth (c)", sys.currency?.copper ?? "");

    // ── Weapons (up to 3 equipped weapon slots) ──
    const equippedWeapons = actor.items.filter(
      i => i.type === "equipment" && i.system?.equipmentType === "weapon" && i.system?.equipped
    );
    for (let w = 0; w < 3; w++) {
      const idx = w + 1;
      const weapon = equippedWeapons[w];
      if (weapon) {
        _setText(form, `Weapon ${idx}`, weapon.name);
        const isTwoHand = weapon.system.equipmentState === "twoHands";
        const dmg = isTwoHand ? weapon.system.damageTwoHands : weapon.system.damageOneHand;
        _setText(form, `Weapon Damage ${idx}`, dmg || "");
        const props = Array.isArray(weapon.system.properties) ? weapon.system.properties.join(", ") : "";
        _setText(form, `Weapon Properties ${idx}`, props);
        _setDropdown(form, `Grip ${idx}`, isTwoHand ? "2H" : "1H");
      } else {
        _setText(form, `Weapon ${idx}`, "");
        _setText(form, `Weapon Damage ${idx}`, "");
        _setText(form, `Weapon Properties ${idx}`, "");
        _setDropdown(form, `Grip ${idx}`, "F");
      }
    }

    // ── Inventory (up to 14 slots) ──
    const equipment = actor.items.filter(i => i.type === "equipment");
    equipment.sort((a, b) => {
      const aEq = a.system?.equipped ? 0 : 1;
      const bEq = b.system?.equipped ? 0 : 1;
      return aEq !== bEq ? aEq - bEq : a.name.localeCompare(b.name);
    });

    for (let i = 0; i < 14; i++) {
      const idx = i + 1;
      const item = equipment[i];
      if (item) {
        let displayName = item.name;
        if ((item.system.quantity ?? 1) > 1) displayName += ` (${item.system.quantity})`;
        _setText(form, `Inventory ${idx}`, displayName);
        _setText(form, `Item Slot ${idx}`, item.system.baseSlots ?? "");
      } else {
        _setText(form, `Inventory ${idx}`, "");
        _setText(form, `Item Slot ${idx}`, "");
      }
    }

    // Item slot totals (read derived values)
    _setText(form, "Maximum Item Slots", sys.inventory?.baseMaxSlots ?? sys.inventory?.maxSlots ?? "");
    _setText(form, "Occupied Item Slots", sys.inventory?.occupiedSlots ?? "");
    _setText(form, "Bonus Item Slots", "0");

    // ── Magic (full spell entries) ──
    // Format: "Spell Name [Damage Base: Type]: Description\rCrit: Crit text."
    const spells = actor.items
      .filter(i => i.type === "spell")
      .sort((a, b) => a.name.localeCompare(b.name));

    const spellEntries = spells.map(spell => {
      const s = spell.system;
      // Damage base: capitalize first letter, default to "-"
      const dmgType = s.damageType
        ? (s.damageType === "-" ? "-" : s.damageType.charAt(0).toUpperCase() + s.damageType.slice(1))
        : "-";
      const desc = _stripHtml(s.description || "");
      let entry = `${spell.name} [Damage Base: ${dmgType}]: ${desc}`;

      // Crit line — only if there's crit text or critContinual is set
      const critText = s.critContinual ? "Duration is continual." : (s.crit || "").trim();
      if (critText) entry += `\rCrit: ${critText}`;

      return entry;
    });

    // Split roughly evenly across the two magic fields
    const half = Math.ceil(spellEntries.length / 2);
    _setText(form, "Magic 1", spellEntries.slice(0, half).join("\r\r"));
    _setText(form, "Magic 2", spellEntries.slice(half).join("\r\r"));

    // ── Abilities Text ──
    const level = sys.attributes?.level?.value ?? 1;
    const abilityLines = [];

    // Ancestry traits
    if (ancestryItem?.system?.traits) {
      for (const trait of ancestryItem.system.traits) {
        if (trait.name) abilityLines.push(`${trait.name}: ${_stripHtml(trait.description)}`);
      }
    }
    // Class features up to current level (skip "Perk" entries)
    if (classItem?.system?.levelFeatures) {
      for (const feat of classItem.system.levelFeatures) {
        if (feat.level <= level && feat.name !== "Perk") {
          abilityLines.push(`${feat.name}: ${_stripHtml(feat.description)}`);
        }
      }
    }
    // Perks
    for (const perk of actor.items.filter(i => i.type === "perk")) {
      abilityLines.push(`${perk.name}: ${_stripHtml(perk.system?.description || "")}`);
    }

    _setText(form, "Abilities", abilityLines.join("\r\r"));

    // ── Save PDF (keep editable — don't flatten) ──
    const pdfBytes = await pdfDoc.save();
    console.log(`[VPI Export] PDF size: ${pdfBytes.length} bytes`);

    // Sanitize filename — strip characters not allowed in Windows filenames
    const safeName = actor.name.replace(/[\\/:*?"<>|]/g, "_");
    const filename = `${safeName} - Vagabond.pdf`;

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    ui.notifications.info(`Exported "${actor.name}" → ${filename}`);
    console.log(`[VPI Export] Downloaded as: ${filename}`);

  } catch (err) {
    console.error("[VPI Export] Error:", err);
    ui.notifications.error(`PDF Export failed: ${err.message}`);
  }
}

// ── Register Export Button on Character Sheet Header (AppV2) ─────────────────
// VagabondCharacterSheet extends ActorSheetV2 (ApplicationV2), so
// getActorSheetHeaderButtons (AppV1 hook) doesn't fire.
// Instead we inject via the render hook.

Hooks.on("renderVagabondCharacterSheet", (app, html) => {
  const actor = app.actor ?? app.document;
  if (actor?.type !== "character") return;

  // In AppV2, html is the sheet body — the outer window frame is app.element
  const appEl = app.element instanceof HTMLElement
    ? app.element
    : (app.element?.[0] ?? (html instanceof HTMLElement ? html : html[0])?.closest?.(".application,.window-app"));

  if (!appEl) return;

  // Avoid duplicate buttons on re-render
  if (appEl.querySelector(".vpi-export-pdf")) return;

  // AppV2 uses .window-controls; AppV1 uses .window-header .header-button
  const controls = appEl.querySelector(".window-controls")
    ?? appEl.querySelector(".window-header");
  if (!controls) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "header-control vpi-export-pdf";
  btn.title = "Export to PDF";
  btn.setAttribute("aria-label", "Export to PDF");
  btn.innerHTML = '<i class="fas fa-file-export"></i>';
  btn.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    exportActorToPdf(actor);
  });

  controls.insertBefore(btn, controls.firstChild);
});

// ── Expose globally for macros ──
// Usage: await VagabondPdfExport.exportActorToPdf(actor)
window.VagabondPdfExport = { exportActorToPdf };
console.log("[VPI Export] vagabond-pdf-export.js loaded. VagabondPdfExport =", window.VagabondPdfExport);
