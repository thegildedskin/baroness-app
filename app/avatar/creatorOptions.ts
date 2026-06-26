// Attribute tag catalog for the AI likeness creator (the "create from scratch /
// from image" flow). Each section is a group of pill tags; the user's picks are
// composed into a prompt by composePrompt() and sent to /api/ai-avatar.
//
// This mirrors the Delulu-style control panel (tags → prompt → image) but is
// tuned for a tattoo house: skin/bare/tattoo options are first-class so a
// likeness can show off ink.

export type TagSection = {
  key: string;
  label: string;
  multi?: boolean;            // allow multiple picks
  options: { id: string; label: string }[];
};

export const SECTIONS: TagSection[] = [
  {
    key: "style", label: "Style",
    options: [
      { id: "realistic", label: "Realistic" },
      { id: "rococo", label: "Rococo Noble" },
      { id: "anime", label: "Anime" },
      { id: "neotrad", label: "Neo-Traditional" },
      { id: "darkfantasy", label: "Dark Fantasy" },
      { id: "pinup", label: "Pin-Up" },
      { id: "cyberpunk", label: "Cyberpunk" },
      { id: "watercolor", label: "Watercolor" },
    ],
  },
  {
    key: "gender", label: "Gender",
    options: [
      { id: "woman", label: "Woman" },
      { id: "man", label: "Man" },
      { id: "nonbinary", label: "Non-Binary" },
      { id: "transwoman", label: "Trans Woman" },
      { id: "transman", label: "Trans Man" },
    ],
  },
  {
    key: "age", label: "Age",
    options: [
      { id: "young", label: "Young Adult" },
      { id: "adult", label: "Adult" },
      { id: "mature", label: "Mature" },
    ],
  },
  {
    key: "build", label: "Build",
    options: [
      { id: "slim", label: "Slim" },
      { id: "athletic", label: "Athletic" },
      { id: "curvy", label: "Curvy" },
      { id: "muscular", label: "Muscular" },
      { id: "plus", label: "Plus" },
    ],
  },
  {
    key: "skin", label: "Skin Tone",
    options: [
      { id: "porcelain", label: "Porcelain" },
      { id: "honey", label: "Honey" },
      { id: "olive", label: "Olive" },
      { id: "tan", label: "Tan" },
      { id: "bronze", label: "Bronze" },
      { id: "deep", label: "Deep" },
    ],
  },
  {
    key: "hair", label: "Hair",
    options: [
      { id: "short", label: "Short" },
      { id: "long", label: "Long" },
      { id: "wavy", label: "Wavy" },
      { id: "buzzed", label: "Buzzed" },
      { id: "updo", label: "Court Updo" },
      { id: "mohawk", label: "Mohawk" },
      { id: "braids", label: "Braids" },
      { id: "bald", label: "Bald" },
    ],
  },
  {
    key: "eyes", label: "Eyes",
    options: [
      { id: "brown", label: "Brown" },
      { id: "hazel", label: "Hazel" },
      { id: "green", label: "Green" },
      { id: "blue", label: "Blue" },
      { id: "grey", label: "Grey" },
      { id: "amber", label: "Amber" },
    ],
  },
  {
    key: "outfit", label: "Outfit",
    options: [
      { id: "bare", label: "Bare (show ink)" },
      { id: "sleeveless", label: "Sleeveless" },
      { id: "corset", label: "Corset" },
      { id: "gown", label: "Rococo Gown" },
      { id: "tailcoat", label: "Tailcoat" },
      { id: "leather", label: "Leather" },
      { id: "streetwear", label: "Streetwear" },
      { id: "armor", label: "Armor" },
    ],
  },
  {
    key: "tattoos", label: "Tattoos", multi: true,
    options: [
      { id: "none", label: "None" },
      { id: "sleeve", label: "Arm Sleeve" },
      { id: "chest", label: "Chest Piece" },
      { id: "back", label: "Back Piece" },
      { id: "neck", label: "Neck" },
      { id: "hand", label: "Hand" },
      { id: "leg", label: "Leg" },
      { id: "bodysuit", label: "Full Bodysuit" },
    ],
  },
  {
    key: "extras", label: "Extras", multi: true,
    options: [
      { id: "piercings", label: "Piercings" },
      { id: "septum", label: "Septum Ring" },
      { id: "choker", label: "Choker" },
      { id: "veil", label: "Veil" },
      { id: "crown", label: "Coronet" },
      { id: "smokyeyes", label: "Smoky Eyes" },
      { id: "freckles", label: "Freckles" },
      { id: "horns", label: "Horns" },
      { id: "wings", label: "Wings" },
      { id: "halo", label: "Halo" },
    ],
  },
];

// A selection maps each section key to one id (single) or an array (multi).
export type CreatorSelection = Record<string, string | string[] | undefined>;

function labelsFor(key: string, sel: CreatorSelection): string[] {
  const section = SECTIONS.find((s) => s.key === key);
  if (!section) return [];
  const v = sel[key];
  const ids = Array.isArray(v) ? v : v ? [v] : [];
  return ids
    .map((id) => section.options.find((o) => o.id === id)?.label)
    .filter((x): x is string => !!x);
}

// Build a natural-language prompt from the picked tags + free text.
export function composePrompt(sel: CreatorSelection, freeText = ""): string {
  const style = labelsFor("style", sel)[0];
  const gender = labelsFor("gender", sel)[0] || "person";
  const age = labelsFor("age", sel)[0];
  const build = labelsFor("build", sel)[0];
  const skin = labelsFor("skin", sel)[0];
  const hair = labelsFor("hair", sel)[0];
  const eyes = labelsFor("eyes", sel)[0];
  const outfit = labelsFor("outfit", sel)[0];
  const tattoos = labelsFor("tattoos", sel).filter((t) => t !== "None");
  const extras = labelsFor("extras", sel);

  const subject = [age?.toLowerCase(), build?.toLowerCase(), gender.toLowerCase()]
    .filter(Boolean).join(" ");

  const parts: string[] = [`A ${subject}`];
  if (skin) parts.push(`${skin.toLowerCase()} skin`);
  if (hair) parts.push(`${hair.toLowerCase()} hair`);
  if (eyes) parts.push(`${eyes.toLowerCase()} eyes`);

  let sentence = parts.join(", ") + ".";

  if (outfit) {
    const bare = outfit === "Bare (show ink)";
    sentence += bare
      ? " Bare-chested / shirtless to reveal tattoos."
      : outfit === "Sleeveless"
        ? " Wearing a sleeveless top, bare arms."
        : ` Wearing ${outfit.toLowerCase()}.`;
  }
  if (tattoos.length) {
    sentence += ` Detailed visible tattoos: ${tattoos.map((t) => t.toLowerCase()).join(", ")}.`;
  }
  if (extras.length) {
    sentence += ` ${extras.join(", ")}.`;
  }
  if (style) sentence += ` ${style} style.`;
  if (freeText.trim()) sentence += ` ${freeText.trim()}`;

  return sentence;
}
