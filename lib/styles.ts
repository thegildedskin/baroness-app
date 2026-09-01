// The style+city landing pages (/styles/[slug]) — a static const array, no
// CMS. Each entry carries its own real copy (written per style, not
// templated), the artist-matching terms, style-specific FAQs and the value
// the Book CTA prefills into the intake form's style select (?style=).

export type StyleFaq = { q: string; a: string };

export type StylePage = {
  slug: string;
  /** Short style name — "Fine Line" */
  name: string;
  /** The page H1 — "Fine Line Tattoos in Garland, TX" */
  h1: string;
  kicker: string;
  metaTitle: string;
  metaDescription: string;
  /** Value passed to /book?style= — prefills the intake form's style select. */
  bookStyle: string;
  /** Cover-up page also pre-ticks the intake form's cover-up box. */
  coverUp?: boolean;
  /** Case-insensitive substrings matched against artist specialty/bio. */
  matchTerms: string[];
  /** Italic lede under the H1. */
  intro: string;
  /** Body copy — 250–400 words per page across these paragraphs. */
  paragraphs: string[];
  faqs: StyleFaq[];
  /**
   * Example piece from the studio's real gallery (public/gallery/manifest.json
   * filename, served via /api/gallery-img). Thumbnail on the /styles cards,
   * full-size hero on the style page. Swap freely for a better example.
   */
  galleryImage?: string;
};

export const STYLE_PAGES: StylePage[] = [
  {
    slug: "fine-line-tattoos-garland-tx",
    name: "Fine Line",
    galleryImage: "640306160_18388366060146430_126221886822033680.jpg", // micro-realism pigeon
    h1: "Fine Line Tattoos in Garland, TX",
    kicker: "The Thin Gold Thread",
    metaTitle: "Fine Line Tattoos in Garland, TX | Baroness Tattoo — Firewheel",
    metaDescription:
      "Fine line tattoos by fine-art trained artists at Baroness Tattoo, Firewheel Town Center, Garland TX. Single-needle delicacy that heals clean and ages honestly. Book with a $100 deposit.",
    bookStyle: "Fine line",
    matchTerms: ["fine line", "fine-line", "fineline", "single needle", "single-needle"],
    intro:
      "Single-needle work, drawn with a draughtsman's restraint — the tattoo equivalent of writing in ink you cannot cross out.",
    paragraphs: [
      "Fine line is the least forgiving style in tattooing. There is no shading to hide behind, no bold outline to carry a shaky hand — every line sits alone on the skin and answers for itself. It is, at heart, drawing: contour, weight, negative space. Which is exactly why it belongs in a house of fine-art trained artists. Our residents drew for years before they ever picked up a machine, and it shows in the places fine line lives or dies — the taper of a stem, the curve of a jawline in a micro-portrait, lettering that stays crisp at eight point.",
      "A word of honesty about healing and age, because fine line deserves it: thin lines soften. Over years, ink spreads microscopically under the skin, and a line laid too thin, too shallow, or too close to its neighbor will blur into fog. The remedy is judgment — knowing the minimum size a design can survive at, spacing details so they still read in a decade, and placing work on skin that treats it kindly. We will tell you when your Pinterest reference is drawn at a scale that cannot heal, and we will redraw it at one that can. That conversation is free; the cover-up for a shop that skipped it is not.",
      "Fine line suits first tattoos, quiet meaningful pieces, botanical work, delicate script, and anyone who wants something felt more than announced. Sittings are typically shorter and gentler than bold work — many pieces finish within an hour or two.",
      "You'll find us at Firewheel Town Center in Garland — bring the idea, the artist handles the restraint.",
    ],
    faqs: [
      {
        q: "Do fine line tattoos fade faster?",
        a: "They soften rather than vanish. Thin lines spread slightly as skin ages, so scale and spacing matter more than in any other style — our artists size designs so they still read cleanly in ten years, and will say so when a reference is drawn too small to survive.",
      },
      {
        q: "Does fine line hurt less?",
        a: "Generally yes — single-needle work is lighter on the skin and sittings are shorter. Most guests describe it as a scratching discomfort, very manageable.",
      },
      {
        q: "How small can a fine line tattoo be?",
        a: "Smaller than most styles, but not infinitely small — lettering below roughly a half-inch tall and micro-details packed too tightly will blur as they heal. Your artist will tell you the honest minimum for your design.",
      },
    ],
  },
  {
    slug: "black-and-grey-realism-garland-tx",
    name: "Black & Grey Realism",
    galleryImage: "686041825_18399724834146430_853037633092867592.jpg", // realist scorpion
    h1: "Black & Grey Realism Tattoos in Garland, TX",
    kicker: "Portraits in Smoke and Silver",
    metaTitle: "Black & Grey Realism Tattoos in Garland, TX | Baroness Tattoo",
    metaDescription:
      "Black and grey realism at Baroness Tattoo, Garland TX — portraits, statuary and chiaroscuro by fine-art trained artists at Firewheel Town Center. Book a consultation.",
    bookStyle: "Black & grey realism",
    matchTerms: ["black & grey", "black and grey", "black & gray", "black and gray", "realism", "realistic", "portrait"],
    intro:
      "The old masters worked in charcoal before they worked in oil. Black and grey realism is that discipline, carried onto skin.",
    paragraphs: [
      "Realism is rendered, not outlined. A portrait, a rose in full chiaroscuro, a marble saint — these are built the way a charcoal drawing is built: values first, from the deepest black through a dozen greys to untouched skin standing in for light. There is no line to blame or to hide behind; if the values are wrong, the face is wrong, and everyone who knows the face will know it. This is why we insist on fine-art training in this house. An artist who has spent years doing figure drawing understands skulls under skin, how light falls on a cheekbone, why an eye reads dead when the highlight sits a millimeter off.",
      "Black and grey also happens to be the style that ages most gracefully. Black pigment is the most stable thing in tattooing — while colors shift and fade at different rates, a well-built grey wash softens evenly, like a photograph warming with age rather than a poster bleaching in a window. The one rule: realism needs room. Smooth gradients and fine transitions demand physical space on the skin, so a realistic piece crammed small becomes mud in five years. Expect your artist to recommend a palm-sized minimum for anything with a face in it, and expect larger work to take multiple sittings — good smoke cannot be hurried.",
      "This is the style for memorial portraits, religious and statuary work, animals rendered true, and anyone drawn to drama without color. If it should look like it was photographed rather than drawn, this is your door.",
      "Bring a clear, high-resolution reference — with portraits especially, the photo is half the piece. We'll tell you plainly whether yours can carry a tattoo.",
    ],
    faqs: [
      {
        q: "How big does a realism tattoo need to be?",
        a: "Bigger than you think. Smooth gradients need physical room — for anything with a face in it, expect a palm-sized minimum. Cramped realism turns muddy within a few years, and we won't take a piece we know will do that.",
      },
      {
        q: "What reference photo do I need for a portrait?",
        a: "One sharp, well-lit, high-resolution photo beats twenty blurry ones. The photo is half the piece — if the reference can't carry a tattoo, your artist will say so before any money changes hands.",
      },
      {
        q: "Does black and grey age better than color?",
        a: "Yes — black pigment is the most stable in tattooing. A well-built grey wash softens evenly with age instead of shifting hue, which is why the style has such longevity.",
      },
    ],
  },
  {
    slug: "illustrative-tattoos-garland-tx",
    name: "Illustrative",
    galleryImage: "497726601_1323249775400884_9122255851003204109.jpg", // fire dragon sleeve
    h1: "Illustrative Tattoos in Garland, TX",
    kicker: "Drawn, Not Photographed",
    metaTitle: "Illustrative Tattoos in Garland, TX | Baroness Tattoo — Fine Art on Skin",
    metaDescription:
      "Illustrative and fine-art tattoos in Garland, TX — etching, ink-wash and storybook styles by artists who draw first. Baroness Tattoo at Firewheel Town Center.",
    bookStyle: "Illustrative / fine art",
    matchTerms: ["illustrative", "illustration", "fine art", "fine-art", "sketch", "etching", "engraving"],
    intro:
      "Where realism asks the skin to become a photograph, illustrative work lets it stay a drawing — and owns it proudly.",
    paragraphs: [
      "Illustrative tattooing is the broadest room in the house, and the most personal. It borrows from wherever the artist's hand grew up: etching and engraving, ink-wash, woodcut, storybook plates, botanical lithographs, the crosshatched margins of old anatomies. The linework is expressive rather than invisible — you are meant to see the hand that drew it. That is the entire point. A photograph shows you what a thing looked like; a drawing shows you what someone saw in it.",
      "This is the style where fine-art training stops being a selling point and becomes simply visible. Composition, line economy, how a hatched shadow wraps a form — these are studio-classroom skills, and our residents carry sketchbooks the way other people carry phones. Bring us a half-idea — a fox, your grandmother's brooch, a line from a poem — and the drawing that comes back will be built for your body specifically: flowing with the muscle it sits on, not pasted flat like a sticker.",
      "Illustrative work ages on its own terms, and rather well. Because the style embraces visible line and deliberate texture, the slow softening that flattens photorealism reads here as character — an etching gone slightly warm with time is still an etching. Sensible line weights and honest spacing keep a piece legible for decades.",
      "It suits people who want a tattoo that is unmistakably theirs — art commissioned, not chosen from a wall. If your reference folder looks more like a museum than a tattoo portfolio, you're ours. The consultation costs a conversation; the deposit is $100 and applies to the piece.",
    ],
    faqs: [
      {
        q: "What counts as an illustrative tattoo?",
        a: "Anything drawn as art first — etching and engraving styles, ink-wash, sketchwork, storybook and botanical illustration. If it would look at home on paper in a frame, it's illustrative.",
      },
      {
        q: "Can you design something custom from a rough idea?",
        a: "That's the house specialty. Bring a half-idea — an animal, an heirloom, a line of text — and your artist designs a piece built for your body and placement. The deposit covers the design work.",
      },
      {
        q: "Do illustrative tattoos age well?",
        a: "Yes — visible linework and deliberate texture forgive the slow softening that troubles photorealism. With sane line weights and spacing, an illustrative piece stays legible for decades.",
      },
    ],
  },
  {
    slug: "floral-tattoos-garland-tx",
    name: "Floral",
    galleryImage: "520299901_18357739168146430_852701704931236993.jpg", // b&g roses + butterflies
    h1: "Floral Tattoos in Garland, TX",
    kicker: "The Eternal Garden",
    metaTitle: "Floral & Botanical Tattoos in Garland, TX | Baroness Tattoo",
    metaDescription:
      "Floral and botanical tattoos in Garland, TX — fine line stems, black & grey roses, illustrative botanicals drawn to flow with the body. Baroness Tattoo, Firewheel Town Center.",
    bookStyle: "Floral / botanical",
    matchTerms: ["floral", "botanical", "flower", "flora"],
    intro:
      "Flowers are the oldest subject in art and the most requested in tattooing — and almost nobody draws them well. We noticed.",
    paragraphs: [
      "A rose is not a symbol of a rose; it is a specific architecture — petals spiraling around a center, each one catching light differently. The difference between a floral tattoo that breathes and one that looks like clip-art is entirely botanical understanding: how a peony differs from a ranunculus, where the leaf actually joins the stem, why a lily's throat darkens. Our artists trained on still life before skin, and they draw flowers the way the old botanical illustrators did — from structure outward, not from someone else's flash.",
      "Florals are also the most body-led style we do. A stem is a line the body already wants — down a spine, along a collarbone, wrapping a forearm — and a bouquet composed for your placement will flow where a copied design sits stiff. This is why we draw florals on the body, for the body, rather than resizing a stock rose until it fits.",
      "On healing and age: fine line florals stay delicate but soften soonest, so we give petals room and keep stamens from crowding; black and grey florals hold their depth for decades; whip-shaded and illustrative botanicals sit between. Your artist will steer scale and detail to the placement — a thigh can hold a full garden's worth of detail, a wrist wants a single confident stem.",
      "Florals suit first tattoos and fiftieth ones: memorial birth-month flowers, bouquets marking children, or beauty needing no justification at all. Tell the booking form your flowers and placement, and the garden gets drawn for you.",
    ],
    faqs: [
      {
        q: "Which flowers tattoo best?",
        a: "Structurally distinct ones — peonies, roses, chrysanthemums, lilies — hold up beautifully. Very pale, wispy blooms (think baby's breath) need thoughtful handling at small sizes. Tell us the flower and the placement; we'll design to both.",
      },
      {
        q: "Fine line or black and grey for a floral piece?",
        a: "Fine line stays delicate and quiet but softens sooner; black and grey holds depth for decades. Many of our best florals mix the two — fine outlines with soft shading. Your artist will recommend based on size and placement.",
      },
      {
        q: "Can florals work around or over scars and older tattoos?",
        a: "Often, yes — organic shapes are the most forgiving thing we have for flowing around scars or through an existing collection. Send a photo through the booking form and we'll tell you honestly.",
      },
    ],
  },
  {
    slug: "cover-up-tattoos-garland-tx",
    name: "Cover-Ups",
    galleryImage: "Screenshot 2025-08-12 103515.png", // blast-over black cuff + mandala
    h1: "Cover-Up Tattoos in Garland, TX",
    kicker: "The Second Draft",
    metaTitle: "Cover-Up Tattoos in Garland, TX | Baroness Tattoo — Honest Assessments",
    metaDescription:
      "Cover-up and rework tattoos in Garland, TX. Honest assessments first — then a design that makes the old piece disappear into something better. Baroness Tattoo, Firewheel.",
    bookStyle: "Cover-up / rework",
    coverUp: true,
    matchTerms: ["cover", "cover-up", "coverup", "rework"],
    intro:
      "Everyone in this trade has seen the tattoo you stopped loving. The question is never how it happened — only what it becomes next.",
    paragraphs: [
      "A cover-up is a design problem wearing a disguise, and it is the hardest kind of design problem: the new piece must succeed as art while making an existing piece structurally disappear. Dark ink does not come out; it can only be out-thought — old lines dissolved into new shadows, a blown-out name swallowed by the deepest fold of a peony, the eye led firmly away from where the past sits. It is closer to chess than to drawing, and artists trained in composition play it far better than artists trained only in tracing. That is the house advantage here.",
      "We start with honesty, because cover-ups punish optimism. Some pieces cover cleanly. Some need one or two sessions of laser lightening first — not removal, just enough fading to open the palette — and we will tell you when yours is one of them, because covering too-dark work with darker work is how people end up needing a third tattoo. Tick the cover-up box in the booking form, attach a clear photo in decent light, and an artist will give you a real assessment before you put a dollar down.",
      "What to expect: cover-ups run larger and darker than the piece they replace — physics, not preference. Black and grey realism, dense florals, and bold illustrative work are the reliable workhorses; delicate fine line generally is not, though it can dress the edges. Healing is ordinary; the only thing that takes longer is the design, and it should.",
      "The best cover-ups don't look like cover-ups. They look like the tattoo you meant to get the first time.",
    ],
    faqs: [
      {
        q: "Can any tattoo be covered?",
        a: "Most, not all — and we'll tell you which yours is before you pay anything. Very dark, dense or fresh work sometimes needs a session or two of laser lightening first to open the palette. Send a clear photo through the booking form for an honest assessment.",
      },
      {
        q: "Does a cover-up have to be bigger and darker?",
        a: "Yes, as a rule — new ink must out-weigh old ink, so expect roughly 2–3× the footprint and a design that leans on shadow. That constraint is exactly why cover-ups reward good designers.",
      },
      {
        q: "Do cover-ups cost more?",
        a: "They're priced like any custom piece of their final size — but the design time is real, which is what the $100 deposit (applied to your total) covers. No surprise fees for the 'cover-up' label itself.",
      },
    ],
  },
  {
    slug: "script-lettering-tattoos-garland-tx",
    name: "Script & Lettering",
    galleryImage: "486189520_18489978070008293_196253547585756297.jpg", // acorn · "think happy thoughts"
    h1: "Script & Lettering Tattoos in Garland, TX",
    kicker: "The Written Word, Kept",
    metaTitle: "Script & Lettering Tattoos in Garland, TX | Baroness Tattoo",
    metaDescription:
      "Script and lettering tattoos in Garland, TX — calligraphy, serif and fine line script sized to stay readable for life. Baroness Tattoo at Firewheel Town Center.",
    bookStyle: "Script / lettering",
    matchTerms: ["script", "lettering", "calligraphy", "typograph"],
    intro:
      "A word on skin is the most honest tattoo there is — everyone can read it, forever. Which is exactly why it must be built to last.",
    paragraphs: [
      "Lettering looks like the simplest thing we do and is quietly one of the hardest. Type is a discipline centuries deep — stroke contrast, kerning, baseline rhythm — and skin is a hostile medium for it: it stretches, it ages, and it blurs whatever was placed too small or too tight. Every faded grey smudge that used to be a name was drawn by someone who didn't respect the letterform. Our artists do. Calligraphy and typography are fine-art disciplines before they are tattoo styles, and we treat a single word with the same design attention as a back piece.",
      "The rules we will hold you to, kindly: letters need minimum height to survive (roughly a half-inch for script, less for clean block forms); loops and counters — the holes in your e's and a's — need room, or time fills them in; and placement matters enormously, because a line of text follows the body's curve or fights it. We letter your actual words in several hands — flowing copperplate, quiet serif, fine line minimalist, bold blackletter — sized honestly for the placement, and you choose with your eyes rather than your imagination.",
      "One more service worth naming: spelling, dates and translations get verified in writing before needle touches skin. If it's Latin, a lyric, or your grandmother's handwriting scanned from a letter — bring the source. Handwriting pieces, especially, are among the most moving work we do.",
      "Script suits memorials, vows, verses, names earned rather than merely liked. Say the words in the booking form; we'll make them permanent properly.",
    ],
    faqs: [
      {
        q: "How small can lettering be?",
        a: "Script needs roughly a half-inch of letter height to stay readable for life; clean block letters can go a little smaller. Below that, loops close up and words become smudges — we'll show you the honest minimum for your placement.",
      },
      {
        q: "Can you tattoo someone's actual handwriting?",
        a: "Yes — handwriting pieces are some of the most meaningful work in the house. Bring a clear photo or scan of the original writing and we'll prepare it at a size that preserves its character and survives healing.",
      },
      {
        q: "What about words in another language?",
        a: "Gladly — with the source verified in writing before we tattoo it. You confirm the exact spelling and meaning (in writing, at design approval), because permanence and 'pretty sure' don't mix.",
      },
    ],
  },
];

export function getStylePage(slug: string): StylePage | undefined {
  return STYLE_PAGES.find((s) => s.slug === slug);
}
