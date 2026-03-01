/**
 * Vagabond PDF Importer
 * Parses the official Vagabond Digital Sheet PDF and creates a Foundry actor.
 */

// ── Rulebook Lookup Data ──────────────────────────────────────────────────────

const VGB_WEAPONS = {
  "arbalest":           { grip:"2H", slots:2, damageOneHand:"d8",  damageTwoHands:"d8",  weaponSkill:"ranged",  properties:["Brutal","Ranged"],                range:"Far"  },
  "battleaxe":          { grip:"V",  slots:2, damageOneHand:"d6",  damageTwoHands:"d8",  weaponSkill:"melee",   properties:["Cleave"],                         range:"Close"},
  "bottle, glass":      { grip:"1H", slots:1, damageOneHand:"1",   damageTwoHands:"1",   weaponSkill:"finesse", properties:["Finesse","Thrown"],               range:"Close"},
  "buckler":            { grip:"1H", slots:1, damageOneHand:"1",   damageTwoHands:"1",   weaponSkill:"finesse", properties:["Finesse","Shield"],               range:"Close"},
  "caestus":            { grip:"F",  slots:1, damageOneHand:"d4",  damageTwoHands:"d4",  weaponSkill:"brawl",   properties:["Brawl"],                          range:"Close"},
  "club":               { grip:"1H", slots:1, damageOneHand:"d4",  damageTwoHands:"d4",  weaponSkill:"melee",   properties:[],                                 range:"Close"},
  "crossbow":           { grip:"2H", slots:2, damageOneHand:"d6",  damageTwoHands:"d6",  weaponSkill:"ranged",  properties:["Ranged"],                         range:"Far"  },
  "crossbow, light":    { grip:"1H", slots:1, damageOneHand:"d4",  damageTwoHands:"d4",  weaponSkill:"ranged",  properties:["Ranged"],                         range:"Far"  },
  "dagger":             { grip:"1H", slots:1, damageOneHand:"d4",  damageTwoHands:"d4",  weaponSkill:"finesse", properties:["Finesse","Keen","Thrown"],         range:"Close"},
  "flail":              { grip:"1H", slots:1, damageOneHand:"d8",  damageTwoHands:"d8",  weaponSkill:"melee",   properties:["Brutal"],                         range:"Close"},
  "garotte wire":       { grip:"2H", slots:1, damageOneHand:"0",   damageTwoHands:"0",   weaponSkill:"finesse", properties:["Entangle","Finesse"],             range:"Close"},
  "gauntlet":           { grip:"F",  slots:1, damageOneHand:"d4",  damageTwoHands:"d4",  weaponSkill:"brawl",   properties:["Brawl"],                          range:"Close"},
  "greataxe":           { grip:"2H", slots:2, damageOneHand:"d10", damageTwoHands:"d10", weaponSkill:"melee",   properties:["Brutal","Cleave"],                range:"Close"},
  "greatclub":          { grip:"2H", slots:2, damageOneHand:"d8",  damageTwoHands:"d8",  weaponSkill:"melee",   properties:[],                                 range:"Close"},
  "greatshield":        { grip:"2H", slots:2, damageOneHand:"d6",  damageTwoHands:"d6",  weaponSkill:"melee",   properties:["Shield"],                         range:"Close"},
  "greatsword":         { grip:"2H", slots:2, damageOneHand:"d10", damageTwoHands:"d10", weaponSkill:"melee",   properties:["Cleave","Keen"],                  range:"Close"},
  "handaxe":            { grip:"1H", slots:1, damageOneHand:"d4",  damageTwoHands:"d4",  weaponSkill:"melee",   properties:["Thrown"],                         range:"Close"},
  "handgun":            { grip:"1H", slots:1, damageOneHand:"d4",  damageTwoHands:"d4",  weaponSkill:"ranged",  properties:["Ranged"],                         range:"Far"  },
  "javelin":            { grip:"1H", slots:1, damageOneHand:"d4",  damageTwoHands:"d4",  weaponSkill:"melee",   properties:["Thrown"],                         range:"Close"},
  "katar":              { grip:"1H", slots:1, damageOneHand:"d4",  damageTwoHands:"d4",  weaponSkill:"brawl",   properties:["Brawl","Finesse","Keen"],          range:"Close"},
  "lance":              { grip:"2H", slots:3, damageOneHand:"d10", damageTwoHands:"d10", weaponSkill:"melee",   properties:["Keen","Long"],                    range:"Close"},
  "light hammer":       { grip:"1H", slots:1, damageOneHand:"d6",  damageTwoHands:"d6",  weaponSkill:"melee",   properties:["Brutal","Thrown"],                range:"Close"},
  "longbow":            { grip:"2H", slots:2, damageOneHand:"d8",  damageTwoHands:"d8",  weaponSkill:"ranged",  properties:["Keen","Ranged"],                  range:"Far"  },
  "longsword":          { grip:"V",  slots:2, damageOneHand:"d8",  damageTwoHands:"d10", weaponSkill:"melee",   properties:["Keen"],                           range:"Close"},
  "lucerne":            { grip:"2H", slots:2, damageOneHand:"d8",  damageTwoHands:"d8",  weaponSkill:"melee",   properties:["Brutal","Long"],                  range:"Close"},
  "mace":               { grip:"1H", slots:1, damageOneHand:"d6",  damageTwoHands:"d6",  weaponSkill:"melee",   properties:[],                                 range:"Close"},
  "morningstar":        { grip:"V",  slots:1, damageOneHand:"d6",  damageTwoHands:"d8",  weaponSkill:"melee",   properties:[],                                 range:"Close"},
  "net":                { grip:"2H", slots:2, damageOneHand:"0",   damageTwoHands:"0",   weaponSkill:"melee",   properties:["Entangle","Thrown"],              range:"Close"},
  "pike":               { grip:"2H", slots:3, damageOneHand:"d10", damageTwoHands:"d10", weaponSkill:"melee",   properties:["Keen","Long"],                    range:"Close"},
  "poleblade":          { grip:"2H", slots:2, damageOneHand:"d8",  damageTwoHands:"d8",  weaponSkill:"melee",   properties:["Cleave","Long"],                  range:"Close"},
  "rifle":              { grip:"2H", slots:2, damageOneHand:"d8",  damageTwoHands:"d8",  weaponSkill:"ranged",  properties:["Keen","Ranged"],                  range:"Far"  },
  "shortbow":           { grip:"2H", slots:2, damageOneHand:"d6",  damageTwoHands:"d6",  weaponSkill:"ranged",  properties:["Finesse","Keen","Ranged"],         range:"Far"  },
  "shortsword":         { grip:"1H", slots:1, damageOneHand:"d6",  damageTwoHands:"d6",  weaponSkill:"finesse", properties:["Finesse","Keen"],                 range:"Close"},
  "shotgun":            { grip:"2H", slots:2, damageOneHand:"d10", damageTwoHands:"d10", weaponSkill:"ranged",  properties:["Brutal","Near","Ranged"],          range:"Near" },
  "shotgun, sawed-off": { grip:"1H", slots:1, damageOneHand:"d8",  damageTwoHands:"d8",  weaponSkill:"ranged",  properties:["Brutal","Near","Ranged"],          range:"Near" },
  "sling":              { grip:"1H", slots:1, damageOneHand:"d4",  damageTwoHands:"d4",  weaponSkill:"ranged",  properties:["Ranged"],                         range:"Far"  },
  "spear":              { grip:"1H", slots:1, damageOneHand:"d6",  damageTwoHands:"d6",  weaponSkill:"melee",   properties:["Near","Thrown"],                  range:"Close"},
  "staff":              { grip:"V",  slots:1, damageOneHand:"d4",  damageTwoHands:"d6",  weaponSkill:"finesse", properties:["Finesse"],                        range:"Close"},
  "standard shield":    { grip:"1H", slots:2, damageOneHand:"d4",  damageTwoHands:"d4",  weaponSkill:"melee",   properties:["Shield"],                         range:"Close"},
  "unarmed":            { grip:"F",  slots:0, damageOneHand:"1",   damageTwoHands:"1",   weaponSkill:"brawl",   properties:["Brawl","Finesse"],                range:"Close"},
  "warhammer":          { grip:"V",  slots:2, damageOneHand:"d8",  damageTwoHands:"d10", weaponSkill:"melee",   properties:["Brutal"],                         range:"Close"},
  "whip, chain":        { grip:"1H", slots:2, damageOneHand:"d6",  damageTwoHands:"d6",  weaponSkill:"melee",   properties:["Brutal","Entangle","Long"],        range:"Close"},
  "whip, leather":      { grip:"1H", slots:1, damageOneHand:"1",   damageTwoHands:"1",   weaponSkill:"finesse", properties:["Entangle","Finesse","Long"],       range:"Close"},
};

const VGB_ARMOR = {
  "light armor":  { armorType:"light",  slots:2 },
  "medium armor": { armorType:"medium", slots:2 },
  "heavy armor":  { armorType:"heavy",  slots:3 },
  "l. armor":     { armorType:"light",  slots:2 },
  "m. armor":     { armorType:"medium", slots:2 },
  "h. armor":     { armorType:"heavy",  slots:3 },
};

const VGB_SPELLS = new Set([
  "Adhere","Amplify","Animate","Apoplex","Aqua","Babble","Beast","Bless","Blink","Burn",
  "Charm","Color","Confuse","Control","Cure","Disintegrate","Dispel","Enchant","Enflesh",
  "Erupt","Exalt","Fade","Fear","Fog","Forge","Freeze","Frostburn","Gas","Goop","Guide",
  "Gust","Hold","Hymn","Junk","Kinesis","Knock","Leech","Levitate","Life","Light",
  "Mend","Mirage","Moon","Morph","Mute","Polymorph","Portal","Raise","Rust","Shade",
  "Shrink","Sleep","Speak","Sprout","Tempo","Terraform","Truth","Ward","Zap",
]);

// Skill → stat mapping
const SKILL_STAT = {
  melee:"might", brawl:"might",
  finesse:"dexterity", sneak:"dexterity",
  detect:"awareness", mysticism:"awareness", survival:"awareness", ranged:"awareness",
  arcana:"reason", craft:"reason", medicine:"reason",
  influence:"presence", leadership:"presence", performance:"presence",
};

// Class casting skill (used to set manaSkill on actor)
const CLASS_MANA_SKILL = {
  bard:"performance", druid:"mysticism", luminary:"mysticism", magus:"arcana",
  revelator:"leadership", sorcerer:"influence", witch:"mysticism", wizard:"arcana",
};
const CLASS_CASTING_STAT = {
  bard:"presence", druid:"awareness", luminary:"awareness", magus:"reason",
  revelator:"presence", sorcerer:"presence", witch:"awareness", wizard:"reason",
};
const SPELLCASTER_CLASSES = new Set([
  "alchemist","bard","druid","luminary","magus","revelator","sorcerer","witch","wizard",
]);

// ── PDF Text Parser ───────────────────────────────────────────────────────────

class VagabondPDFParser {
  constructor(pages) {
    // pages: array of strings, one per PDF page
    this.lines1 = (pages[0] || "").split("\n").map(l => l.trim()).filter(Boolean);
    this.lines2 = (pages[1] || "").split("\n").map(l => l.trim()).filter(Boolean);
  }

  parse() {
    return {
      name:      this._name(),
      level:     this._level(),
      ancestry:  this._ancestry(),
      className: this._class(),
      xp:        this._xp(),
      stats:     this._stats(),
      hp:        this._hp(),
      skills:    this._skills(),
      saves:     this._saves(),
      currency:  this._currency(),
      inventory: this._inventory(),
      spells:    this._spells(),
      mana:      this._mana(),
      abilities: this._abilities(),
    };
  }

  _name() { return this.lines1[0] || "Unknown Hero"; }

  _level() {
    for (const l of this.lines1) {
      const m = l.match(/^(\d+)\s+\S+\s+\S+\s+\d+$/);
      if (m) return parseInt(m[1]);
    }
    return 1;
  }

  _ancestry() {
    for (const l of this.lines1) {
      const m = l.match(/^\d+\s+(\S+)\s+\S+\s+\d+$/);
      if (m) return this._titleCase(m[1]);
    }
    return "";
  }

  _class() {
    for (const l of this.lines1) {
      const m = l.match(/^\d+\s+\S+\s+(\S+)\s+\d+$/);
      if (m) return this._titleCase(m[1]);
    }
    return "";
  }

  _xp() {
    for (const l of this.lines1) {
      const m = l.match(/^\d+\s+\S+\s+\S+\s+(\d+)$/);
      if (m) return parseInt(m[1]);
    }
    return 0;
  }

  _hp() {
    for (const l of this.lines1) {
      const m = l.match(/^\/\s*(\d+)$/);
      if (m) return { max: parseInt(m[1]) };
    }
    return { max: 0 };
  }

  _stats() {
    const stats = {};
    for (const name of ["MIGHT","DEXTERITY","AWARENESS","REASON","PRESENCE","LUCK"]) {
      for (const l of this.lines1) {
        const m = l.match(new RegExp(`\\b${name}\\s+(\\d+)`));
        if (m) { stats[name.toLowerCase()] = parseInt(m[1]); break; }
      }
    }
    return stats;
  }

  _skills() {
    const skills = {};
    const stats  = this._stats();
    for (const skill of Object.keys(SKILL_STAT)) {
      for (const l of this.lines1) {
        const m = l.match(new RegExp(`\\b${skill.toUpperCase()}\\s+(\\d+)`));
        if (m) {
          const diff     = parseInt(m[1]);
          const statVal  = stats[SKILL_STAT[skill]] || 0;
          const trained  = diff === (20 - statVal * 2);
          skills[skill]  = { trained, bonus: [] };
          break;
        }
      }
    }
    return skills;
  }

  _saves() {
    const saves = {};
    for (const l of this.lines1) {
      const m = l.match(/^(REFLEX|ENDURE|WILL)\s*\[.*?\]\s*(\d+)/);
      if (m) saves[m[1].toLowerCase()] = parseInt(m[2]);
    }
    return saves;
  }

  _currency() {
    for (const l of this.lines2) {
      const m = l.match(/WEALTH:\s*(\d+)G\s*(\d+)S\s*(\d+)C/i);
      if (m) return { gold: parseInt(m[1]), silver: parseInt(m[2]), copper: parseInt(m[3]) };
    }
    return { gold: 0, silver: 0, copper: 0 };
  }

  _parsePage2() {
    if (this._page2cache) return this._page2cache;

    const inventory  = [];
    const rightLines = [];

    const INV_BOTH = /^(.*?)(\[EQUIPPED\])?\s+(\d+)\s+(.+)$/;
    const INV_ONLY = /^(.*?)(\[EQUIPPED\])?\s+(\d+)$/;
    const SKIP     = /^(INVENTORY|WEALTH:|\/\s*\d+\s*SLOTS)/i;

    for (const line of this.lines2) {
      if (SKIP.test(line)) continue;

      // Pure right-col section headers
      if (/^(ABILITIES|TRAITS|CLASS FEATURES)$/i.test(line)) {
        rightLines.push(line); continue;
      }
      if (/^SPELLS\s+MANA/i.test(line)) {
        rightLines.push(line); continue;
      }

      // "ITEM SLOTS Breath Attack" — strip left label, keep right content
      const itemSlots = line.match(/^ITEM SLOTS\s+(.+)$/);
      if (itemSlots) { rightLines.push(itemSlots[1]); continue; }

      // Left item + right content on same line
      const both = line.match(INV_BOTH);
      if (both) {
        const raw     = both[1] + (both[2] ? " [EQUIPPED]" : "");
        const slots   = parseInt(both[3]);
        const right   = both[4].trim();
        const equipped= raw.includes("[EQUIPPED]");
        const name    = raw.replace("[EQUIPPED]","").trim();
        if (name) inventory.push({ name, slots, equipped });
        if (right) rightLines.push(right);
        continue;
      }

      // Left item only
      const only = line.match(INV_ONLY);
      if (only) {
        const raw     = only[1] + (only[2] ? " [EQUIPPED]" : "");
        const slots   = parseInt(only[3]);
        const equipped= raw.includes("[EQUIPPED]");
        const name    = raw.replace("[EQUIPPED]","").trim();
        if (name) inventory.push({ name, slots, equipped });
        continue;
      }

      // Pure right-col line
      rightLines.push(line);
    }

    this._page2cache = { inventory, rightLines };
    return this._page2cache;
  }

  _inventory() { return this._parsePage2().inventory; }

  _mana() {
    for (const l of this._parsePage2().rightLines) {
      const m = l.match(/^SPELLS\s+MANA\s*\/\s*(\d+)\s*CAST\s*MAX\s*(\d+)$/i);
      if (m) return { max: parseInt(m[1]), castMax: parseInt(m[2]) };
    }
    return { max: 0, castMax: 0 };
  }

  _spells() {
    const spells  = [];
    let inSpells  = false;
    for (const l of this._parsePage2().rightLines) {
      if (/^SPELLS\s+MANA/i.test(l)) { inSpells = true; continue; }
      if (!inSpells) continue;
      if (l && !l.match(/^(MANA|CAST)/i)) spells.push(l);
    }
    return spells;
  }

  _abilities() {
    const traits = [], classFeatures = [];
    let section  = null;
    for (const l of this._parsePage2().rightLines) {
      if (/^ABILITIES$/i.test(l))        continue;
      if (/^TRAITS$/i.test(l))           { section = "traits"; continue; }
      if (/^CLASS FEATURES$/i.test(l))   { section = "class";  continue; }
      if (/^SPELLS\s+MANA/i.test(l))     { section = null;     continue; }
      if (!l || !section) continue;
      if (section === "traits")  traits.push(l);
      if (section === "class")   classFeatures.push(l);
    }
    return { traits, classFeatures };
  }

  _titleCase(s) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
}

// ── Item Classifier ───────────────────────────────────────────────────────────

function classifyItem(name, slots, equipped) {
  const lower = name.toLowerCase();

  // Weapon — exact then fuzzy (handles "Minor Striking Light hammer" etc.)
  let w = VGB_WEAPONS[lower];
  if (!w) {
    for (const [key, data] of Object.entries(VGB_WEAPONS)) {
      if (lower.endsWith(key)) { w = data; break; }  // "...light hammer" → "light hammer"
    }
  }
  if (w) {
    return {
      type: "equipment",
      system: {
        equipmentType: "weapon", weaponSkill: w.weaponSkill,
        grip: w.grip, range: (w.range || "close").toLowerCase(),
        damageOneHand: w.damageOneHand, damageTwoHands: w.damageTwoHands,
        properties: w.properties, baseSlots: slots > 0 ? slots : w.slots,
        equipped, equipmentState: equipped ? "oneHand" : "unequipped",
        quantity: 1,
      },
    };
  }

  // Armor
  for (const [key, a] of Object.entries(VGB_ARMOR)) {
    if (lower.includes(key)) {
      return {
        type: "equipment",
        system: {
          equipmentType: "armor", armorType: a.armorType,
          baseSlots: slots > 0 ? slots : a.slots,
          equipped, equipmentState: "unequipped", quantity: 1,
        },
      };
    }
  }

  // Generic gear
  return {
    type: "equipment",
    system: {
      equipmentType: "gear", baseSlots: slots,
      equipped, equipmentState: "unequipped", quantity: 1,
    },
  };
}

// ── Compendium Lookup ─────────────────────────────────────────────────────────

// Cache pack indexes to avoid repeated fetches
const _packCache = {};
async function _getPackIndex(packId) {
  if (!_packCache[packId]) {
    const pack = game.packs.get(packId);
    if (!pack) throw new Error(`Pack not found: ${packId}`);
    _packCache[packId] = await pack.getIndex();
  }
  return _packCache[packId];
}

async function findInPack(packId, name) {
  const index = await _getPackIndex(packId);
  const entry = index.find(e => e.name.toLowerCase() === name.toLowerCase());
  if (!entry) return null;
  const pack = game.packs.get(packId);
  return await pack.getDocument(entry._id);
}

// For inventory items, try weapon → armor → gear in order
async function findInventoryItem(name) {
  // Try weapon packs with fuzzy suffix match (handles "Minor Striking Light hammer")
  const weaponIndex = await _getPackIndex("vagabond.weapons");
  const weaponEntry = weaponIndex.find(e =>
    name.toLowerCase() === e.name.toLowerCase() ||
    name.toLowerCase().endsWith(e.name.toLowerCase())
  );
  if (weaponEntry) {
    return await game.packs.get("vagabond.weapons").getDocument(weaponEntry._id);
  }

  for (const packId of ["vagabond.armor", "vagabond.gear"]) {
    const doc = await findInPack(packId, name);
    if (doc) return doc;
  }
  return null;
}

// ── Actor Builder ─────────────────────────────────────────────────────────────

async function buildActorFromParsed(d) {
  const classLower    = d.className.toLowerCase();
  const manaSkill     = CLASS_MANA_SKILL[classLower]   || null;
  const castingStat   = CLASS_CASTING_STAT[classLower] || "reason";
  const isSpellcaster = SPELLCASTER_CLASSES.has(classLower);

  const statsData = {};
  for (const [k, v] of Object.entries(d.stats)) {
    statsData[k] = { value: v, bonus: ["0"] };
  }

  const skillsData = {};
  for (const key of Object.keys(SKILL_STAT)) {
    skillsData[key] = { trained: d.skills[key]?.trained ?? false, bonus: [] };
  }

  const actorDoc = await Actor.create({ name: d.name, type: "character" });
  if (!actorDoc) throw new Error("Actor.create() returned null.");
  const actor = game.actors.get(actorDoc.id);
  if (!actor) throw new Error("Actor not found after creation.");
  console.log("[VPI] Actor created id:", actorDoc.id, "live ref id:", actor.id);

  const updates = {
    "system.health.value":             d.hp.max,
    "system.health.max":               d.hp.max,
    "system.currentLuck":              d.stats.luck ?? 0,
    "system.attributes.level.value":   Math.max(1, d.level),
    "system.attributes.xp":            d.xp,
    "system.attributes.isSpellcaster": isSpellcaster,
    "system.attributes.manaSkill":     manaSkill,
    "system.attributes.castingStat":   castingStat,
    "system.details.constructed":       true,
    "system.details.builderDismissed":   true,
    "system.currency.gold":            d.currency.gold,
    "system.currency.silver":          d.currency.silver,
    "system.currency.copper":          d.currency.copper,
  };
  for (const [k, v] of Object.entries(d.stats)) {
    updates["system.stats." + k + ".value"] = v;
  }
  for (const key of Object.keys(SKILL_STAT)) {
    updates["system.skills." + key + ".trained"] = skillsData[key].trained;
  }
  try {
    await actor.update(updates);
  } catch(e) {
    console.error("[VPI] actor.update() failed:", e, JSON.stringify(updates));
    throw e;
  }

  // Look up all items from compendium
  const itemDatas = [];
  const warnings  = [];

  // Ancestry & class (these auto-add traits/features)
  for (const [packId, name] of [
    ["vagabond.ancestries", d.ancestry],
    ["vagabond.classes",    d.className],
  ]) {
    if (!name) continue;
    const doc = await findInPack(packId, name);
    if (doc) itemDatas.push(doc.toObject());
    else warnings.push(`${packId}: "${name}" not found`);
  }

  // Inventory
  const NEVER_EQUIP = new Set(["backpack"]);
  for (const inv of d.inventory) {
    const doc = await findInventoryItem(inv.name);
    if (doc) {
      const obj = doc.toObject();
      if (obj.system) {
        // Backpack should never be equipped regardless of PDF
        // Weapons: trust the PDF equipped state
        const isNeverEquip = NEVER_EQUIP.has(inv.name.toLowerCase());
        const shouldEquip = isNeverEquip ? false : inv.equipped;
        obj.system.equipped = shouldEquip;
        if (shouldEquip && obj.system.equipmentType === "weapon") {
          obj.system.equipmentState = "oneHand";
        }
      }
      itemDatas.push(obj);
    } else {
      warnings.push(`inventory: "${inv.name}" not found in compendium`);
    }
  }

  // Spells — only import if character is a spellcaster class
  // Non-spellcasters may have racial spells (e.g. Naturally Attuned) but adding
  // them causes the system to auto-calculate mana incorrectly
  if (isSpellcaster) {
    for (const name of d.spells) {
      const doc = await findInPack("vagabond.spells", name);
      if (doc) {
        const obj = doc.toObject();
        if (obj.system) obj.system.favorite = true;
        itemDatas.push(obj);
      } else warnings.push(`spells: "${name}" not found`);
    }
  } else if (d.spells.length) {
    warnings.push(`Spells skipped for non-spellcaster class: ${d.spells.join(", ")}. Add racial spells manually if needed.`);
  }

  // Perks (from PDF abilities — traits/features are handled by ancestry/class)
  for (const name of [...d.abilities.traits, ...d.abilities.classFeatures]) {
    const doc = await findInPack("vagabond.perks", name);
    if (doc) itemDatas.push(doc.toObject());
    // Perks not found are silently skipped — they come from ancestry/class automatically
  }

  if (itemDatas.length) await actor.createEmbeddedDocuments("Item", itemDatas);

  if (warnings.length) {
    console.warn("[VPI] Some items not found in compendium:\n" + warnings.join("\n"));
    ui.notifications.warn(`Import complete with warnings — check console for missing items.`);
  }


  // Warn if no perks imported — all characters should have at least one
  const hasPerk = itemDatas.some(i => i.type === "perk");
  if (!hasPerk) {
    new Dialog({
      title: "Don't Forget Perks!",
      content: `<p><strong>${d.name}</strong> has no perks imported.</p>
        <p>All characters have at least one perk. Please add them manually from
        <strong>Compendium &rarr; Perks</strong>.</p>`,
      buttons: { ok: { label: "Got it", icon: '<i class="fas fa-check"></i>' } },
      default: "ok",
    }).render(true);
  }
  return actor;
}

// ── PDF Extraction ────────────────────────────────────────────────────────────

// ── Interactive PDF Form Field Parser ─────────────────────────────────────────

async function extractFormFields(file) {
  const lib = await _loadPDFJS();
  const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
  const page = await pdf.getPage(1);
  const annotations = await page.getAnnotations();
  if (!annotations || annotations.length === 0) return null;

  const fields = {};
  for (const annot of annotations) {
    const name = annot.fieldName || annot.alternativeText;
    if (!name) continue;
    let value = annot.fieldValue ?? "";
    if (Array.isArray(value)) value = value[0] ?? "";
    fields[name] = String(value).trim();
  }
  return Object.keys(fields).length > 0 ? fields : null;
}

function parseFormFields(f) {
  const get = k => (f[k] ?? "").trim();
  const trained = k => { const v = get(k); return v !== "" && v !== "Off"; };

  // Stat field names vary between PDF versions (LOG vs RSN)
  const stats = {
    might:    parseInt(get("MIT")) || 0,
    dexterity:parseInt(get("DEX")) || 0,
    awareness:parseInt(get("AWR")) || 0,
    reason:   parseInt(get("LOG") || get("RSN")) || 0,
    presence: parseInt(get("PRS")) || 0,
    luck:     parseInt(get("LUK")) || 0,
  };

  const skills = {};
  const SKILL_FIELDS = {
    melee:      "Melee Weapons Trained",
    ranged:     "Ranged Weapons Trained",
    brawl:      "Brawn Trained",
    finesse:    "Finesse Trained",
    sneak:      "Sneak Trained",
    detect:     "Detect Trained",
    mysticism:  "Mysticism Trained",
    survival:   "Survival Trained",
    arcana:     "Arcana Trained",
    craft:      "Craft Trained",
    medicine:   "Medicine Trained",
    influence:  "Influence Trained",
    leadership: "Leadership Trained",
    performance:"Performance Trained",
  };
  for (const [skill, field] of Object.entries(SKILL_FIELDS)) {
    skills[skill] = { trained: trained(field) };
  }

  return {
    name:      get("Name")     || "Unknown",
    level:     parseInt(get("Level")) || 1,
    ancestry:  get("Ancestry") || "",
    className: get("Class")    || "",
    xp:        parseInt(get("XP")) || 0,
    stats,
    hp:        { max: parseInt(get("Max HP")) || 0 },
    skills,
    saves:     {},
    currency:  {
      gold:   parseInt(get("Wealth (g)")) || 0,
      silver: parseInt(get("Wealth (s)")) || 0,
      copper: parseInt(get("Wealth (c)")) || 0,
    },
    inventory: [],
    spells:    [],
    mana:      { max: 0, castMax: 0 },
    abilities: { traits: [], classFeatures: [] },
  };
}

async function extractPagesFromPDF(file) {
  const lib = await _loadPDFJS();
  if (lib.GlobalWorkerOptions && !lib.GlobalWorkerOptions.workerSrc) {
    lib.GlobalWorkerOptions.workerSrc = "/scripts/pdfjs/build/pdf.worker.mjs";
  }
  const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const tc   = await page.getTextContent();

    // Group items by Y coordinate (3px tolerance)
    const lineMap = new Map();
    for (const item of tc.items) {
      if (item.str === "") continue;  // keep single spaces, they are real separators
      const y = Math.round(item.transform[5]);
      const x = item.transform[4];
      let key = y;
      for (const k of lineMap.keys()) {
        if (Math.abs(k - y) <= 3) { key = k; break; }
      }
      if (!lineMap.has(key)) lineMap.set(key, []);
      lineMap.get(key).push({ str: item.str, x });
    }

    // Sort lines top-to-bottom; within each line sort left-to-right
    // Join with space when horizontal gap > 15px, else concatenate directly
    const lines = [...lineMap.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, items]) => {
        items.sort((a, b) => a.x - b.x);
        let result = items[0].str;
        for (let i = 1; i < items.length; i++) {
          const gap = items[i].x - (items[i-1].x + items[i-1].str.length * 6);
          result += (gap > 2 ? " " : "") + items[i].str;
        }
        return result.trim();
      })
      .filter(Boolean);

    pages.push(lines.join("\n"));
  }
  return pages;
}



async function _loadPDFJS() {
  if (globalThis._vpiPdfjsLib) return globalThis._vpiPdfjsLib;

  const libPaths = [
    "/scripts/pdfjs/build/pdf.mjs",
    "/scripts/pdfjs/pdf.mjs",
    "/public/scripts/pdfjs/build/pdf.mjs",
  ];
  const workerPaths = [
    "/scripts/pdfjs/build/pdf.worker.mjs",
    "/scripts/pdfjs/pdf.worker.mjs",
    "/public/scripts/pdfjs/build/pdf.worker.mjs",
  ];

  let lib = null;
  for (const path of libPaths) {
    try {
      const m = await import(path);
      lib = m?.getDocument ? m : m?.default;
      if (lib?.getDocument) break;
      lib = null;
    } catch (_) {}
  }

  if (!lib) throw new Error(
    "Could not load pdf.js. Run this in the browser console to find the path:\n" +
    "[...document.querySelectorAll('script[src]')].map(s=>s.src).filter(s=>s.includes('pdf'))"
  );

  if (lib.GlobalWorkerOptions && !lib.GlobalWorkerOptions.workerSrc) {
    for (const wp of workerPaths) {
      try {
        const r = await fetch(wp, { method: "HEAD" });
        if (r.ok) { lib.GlobalWorkerOptions.workerSrc = wp; break; }
      } catch (_) {}
    }
  }

  globalThis._vpiPdfjsLib = lib;
  return lib;
}

// ── Import Dialog ─────────────────────────────────────────────────────────────

class VagabondImportDialog extends Dialog {
  constructor() {
    super({
      title: "Import Vagabond Character from PDF",
      content: `
        <div class="vpi-body">
          <p class="vpi-intro">Select the <strong>Vagabond Digital Sheet</strong> PDF.</p>
          <div class="vpi-drop-zone" id="vpi-drop">
            <i class="fas fa-file-pdf vpi-drop-icon"></i>
            <span id="vpi-drop-label">Click to select PDF or drag &amp; drop here</span>
            <input type="file" id="vpi-file" accept=".pdf" style="display:none">
          </div>
          <div class="vpi-preview" id="vpi-preview" style="display:none">
            <div id="vpi-hdr"></div>
            <div id="vpi-grid"></div>
          </div>
          <div class="vpi-status" id="vpi-status"></div>
        </div>`,
      buttons: {
        import: { icon:"<i class='fas fa-file-import'></i>", label:"Import Character", callback: html => this._onImport(html) },
        cancel: { icon:"<i class='fas fa-times'></i>", label:"Cancel" },
      },
      default: "import",
    }, { width: 530, classes: ["vpi-dialog"] });
    this._data = null;
  }

  activateListeners(html) {
    super.activateListeners(html);
    const root  = html instanceof HTMLElement ? html : html[0];
    const drop  = root.querySelector("#vpi-drop");
    const input = root.querySelector("#vpi-file");
    drop.addEventListener("click",    () => input.click());
    input.addEventListener("change",  e => e.target.files[0] && this._load(e.target.files[0], root));
    drop.addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("vpi-over"); });
    drop.addEventListener("dragleave",() => drop.classList.remove("vpi-over"));
    drop.addEventListener("drop", e => {
      e.preventDefault(); drop.classList.remove("vpi-over");
      const f = e.dataTransfer.files[0];
      if (f?.name.endsWith(".pdf")) this._load(f, root);
    });
  }

  async _load(file, root) {
    const status = root.querySelector("#vpi-status");
    root.querySelector("#vpi-drop-label").textContent = file.name;
    root.querySelector("#vpi-preview").style.display = "none";
    this._setStatus(status, "loading", "Reading PDF…");
    try {
      // Try form field parser first (interactive PDF)
      const fields = await extractFormFields(file);
      let data;
      if (fields && fields["Name"]) {
        data = parseFormFields(fields);
        this._setStatus(status, "ok", "✓ Ready to import (interactive PDF)");
      } else {
        // Fall back to coordinate-based parser (digital sheet PDF)
        const pages = await extractPagesFromPDF(file);
        data = new VagabondPDFParser(pages).parse();
        this._setStatus(status, "ok", "✓ Ready to import");
      }
      this._data = data;
      this._showPreview(data, root);
    } catch(e) {
      console.error("[VPI]", e);
      this._setStatus(status, "error", `Error: ${e.message}`);
    }
  }

  _showPreview(d, root) {
    const hdr  = root.querySelector("#vpi-hdr");
    const grid = root.querySelector("#vpi-grid");

    hdr.innerHTML = `<div class="vpi-name">${d.name}</div>
      <div class="vpi-sub">Level ${d.level} &bull; ${d.ancestry} &bull; ${d.className} &bull; ${d.xp} XP</div>`;

    const statRow = ["might","dexterity","awareness","reason","presence","luck"]
      .map(k => `<div class="vpi-stat"><span>${k.slice(0,3).toUpperCase()}</span><b>${d.stats[k]??0}</b></div>`).join("");

    const trained = Object.entries(d.skills).filter(([,s])=>s.trained)
      .map(([k])=>k[0].toUpperCase()+k.slice(1)).join(", ") || "None";

    const invStr   = d.inventory.map(i=>`${i.name}${i.equipped?" ✓":""}`).join(", ") || "None";
    const spellStr = d.spells.join(", ") || "None";
    const traitStr = [...d.abilities.traits,...d.abilities.classFeatures].join(", ") || "None";
    const wealth   = `${d.currency.gold}g ${d.currency.silver}s ${d.currency.copper}c`;

    grid.innerHTML = `
      <div class="vpi-row"><label>Stats</label><div class="vpi-stat-row">${statRow}</div></div>
      <div class="vpi-row"><label>HP</label><span>${d.hp.max}${d.mana.max ? ` &bull; Mana ${d.mana.max} (cast max ${d.mana.castMax})` : ""}</span></div>
      <div class="vpi-row"><label>Wealth</label><span>${wealth}</span></div>
      <div class="vpi-row"><label>Trained Skills</label><span>${trained}</span></div>
      <div class="vpi-row"><label>Inventory (${d.inventory.length})</label><span class="vpi-sm">${invStr}</span></div>
      ${d.spells.length ? `<div class="vpi-row"><label>Spells</label><span>${spellStr}</span></div>` : ""}
      <div class="vpi-row"><label>Abilities</label><span class="vpi-sm">${traitStr}</span></div>`;

    root.querySelector("#vpi-preview").style.display = "block";
  }

  async _onImport(html) {
    const root   = html instanceof HTMLElement ? html : html[0];
    const status = root.querySelector("#vpi-status");
    if (!this._data) { ui.notifications.warn("Please select a PDF first."); return; }
    this._setStatus(status, "loading", "Creating actor…");
    try {
      const actor = await buildActorFromParsed(this._data);
      ui.notifications.info(`"${actor.name}" imported successfully!`);
      actor.sheet.render(true);
      this.close();
    } catch(e) {
      console.error("[VPI]", e);
      this._setStatus(status, "error", `Import failed: ${e.message}`);
    }
  }

  _setStatus(el, type, msg) {
    el.className   = `vpi-status vpi-status--${type}`;
    el.textContent = msg;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

Hooks.on("renderActorDirectory", (_app, html) => {
  const root = html instanceof HTMLElement ? html : html[0];
  if (!root || root.querySelector(".vpi-btn")) return;

  const btn = document.createElement("button");
  btn.className = "vpi-btn";
  btn.type      = "button";
  btn.innerHTML = `<i class="fas fa-file-import"></i> Import from PDF`;
  btn.addEventListener("click", () => new VagabondImportDialog().render(true));

  const footer    = root.querySelector("footer");
  const createBtn = root.querySelector("button[data-action='create'], .create-entity");
  if (footer)         footer.appendChild(btn);
  else if (createBtn) createBtn.parentElement.insertBefore(btn, createBtn.nextSibling);
});
