// The Baroness Tattoo Academy — full program data, ported from the
// Baroness.Art project (data.js). 32 courses · 4 modules · 32 studio
// assignments · 10 portfolio projects. Edit copy here; /edu and
// /edu/curriculum both read from this file.

export type Course = {
  id: number;
  /** Course title */
  t: string;
  /** Subtitle */
  s: string;
  intro: string;
  /** [heading, explanation] teaching beats */
  beats: [string, string][];
  topics: string[];
  /** Studio assignment(s) */
  hw: string[];
};

export type AcademyModule = {
  roman: string;
  name: string;
  range: string;
  tagline: string;
  courses: Course[];
};

export type AcademyFaq = { q: string; a: string };

export const MODULES: AcademyModule[] = [
{
  roman:"I", name:"Foundations of Fine Art", range:"Courses 1–13",
  tagline:"See like an artist before you ever hold a machine — observation, form, value, color, and composition.",
  courses:[
    {id:1,t:"The Legacy of Art",s:"Introduction to Art & Art History",
     intro:"Before you ever pick up a machine, you join a lineage. This lesson frames tattooing as the newest branch of a very old tree — and shows why the principles that made a Caravaggio readable across a dark church also make a tattoo readable across a forearm.",
     beats:[["Why history matters to a tattooer","The masters solved the same problems you face: leading an eye, suggesting form, surviving being viewed from a distance. Borrowing their solutions is faster than reinventing them."],["Movements at a glance","A quick tour from Renaissance modeling to Baroque drama to modern graphic flatness — each a different lever you can pull in a design."],["Translating a principle","Take one idea, like Baroque chiaroscuro, and trace how it becomes high-contrast black-and-grey on skin."]],
     topics:["Major artistic movements","Renaissance through Modern Art","Influential artists","Applying historical principles to tattooing"],
     hw:["Select 3 historical artworks from different periods","Write 3–5 sentences on what makes each visually effective","Identify one principle that could translate into tattooing"]},
    {id:2,t:"The Art of Observation",s:"Gesture & Observational Drawing",
     intro:"Most beginners draw what they think a thing looks like, not what it actually looks like. Observation is the discipline of shutting off assumptions and copying reality — the single habit that separates artists from tracers.",
     beats:[["Gesture before detail","Capture the line of action in seconds before worrying about edges. Movement first keeps a drawing alive."],["Measuring by comparison","Use your pencil to compare angles and proportions instead of guessing. Sight-size keeps you accurate."],["Life versus photos","Why drawing from life teaches you more, and how to still use photo reference honestly."]],
     topics:["Learning to see accurately","Capturing movement","Measuring proportions","Drawing from life"],
     hw:["Complete 10 one-minute gesture drawings","Complete 5 five-minute observational sketches from life"]},
    {id:3,t:"Constructing Form",s:"Shape, Structure & Volume",
     intro:"Every complex object is a few simple solids in disguise. Learn to see the sphere, box, and cylinder inside a skull or a rose and you can draw it from any angle, in any light, without a reference.",
     beats:[["The three primitives","Sphere, box, and cylinder, and how nearly every form reduces to them."],["Simplify, then complicate","Block the big masses first; add detail only once the structure reads as 3D."],["Construction in action","Building a skull from primitives, step by step."]],
     topics:["Geometric foundations","Simplification techniques","Building complex forms","Three-dimensional thinking"],
     hw:["Draw 5 spheres, 5 cubes, and 5 cylinders","Construct a skull using basic geometric shapes"]},
    {id:4,t:"Value & Contrast",s:"The Language of Light",
     intro:"Tattoos live and die on value — the lightness or darkness of each mark. Color and detail are luxuries; value is structure. This lesson trains your eye to see it and your hand to control it.",
     beats:[["The value scale","Why a controlled ten-step scale is the foundation of every rendering decision you'll make."],["Contrast creates focus","The eye travels to the area of highest contrast. Place that contrast on purpose."],["The squint test","Squint to collapse color and detail into pure value and check whether your image still reads."]],
     topics:["Value scales","Contrast relationships","Focal points","Readability"],
     hw:["Create a 10-step value scale","Render a sphere using only black and white"]},
    {id:5,t:"Visual Hierarchy",s:"Guiding the Eye",
     intro:"A good design tells the eye where to go first, second, and third. Without hierarchy everything competes and the piece reads as noise. Here you learn to direct attention deliberately.",
     beats:[["Dominance","One clear focal point. Decide what wins before you commit a single line."],["The three tiers","Primary, secondary, tertiary — a path for the eye to travel through the piece."],["Tools of emphasis","Contrast, isolation, size, and detail are your levers for building hierarchy."]],
     topics:["Dominance and emphasis","Focal areas","Design balance","Visual storytelling"],
     hw:["Create three thumbnail compositions","Identify primary, secondary, and tertiary focal points"]},
    {id:6,t:"Spatial Drawing",s:"Perspective & Depth",
     intro:"Depth is an illusion you build with perspective and atmosphere. Even stylized tattoos benefit from believable space. This lesson gives you the rules — and shows when to bend them for the body.",
     beats:[["One- and two-point perspective","The practical scaffolding of believable space, without the engineering-drawing tedium."],["Atmospheric depth","Lower contrast and softer edges push elements back and pull others forward."],["Perspective on a curved canvas","Why a forearm or calf quietly changes every rule you just learned."]],
     topics:["One-point perspective","Two-point perspective","Atmospheric depth","Creating believable space"],
     hw:["Draw a simple room in one-point perspective","Draw a simple building in two-point perspective"]},
    {id:7,t:"Light as Design",s:"Light, Shadow & Form",
     intro:"Light isn't just illumination — it's a design choice that defines form and mood. Understand how light wraps a form and you can render anything convincingly.",
     beats:[["Anatomy of light on form","Highlight, halftone, core shadow, reflected light, and cast shadow — the five notes of rendering."],["Commit to one light source","A single clear light keeps form readable; competing lights flatten everything."],["Edges tell the story","Hard versus soft edges describe both surface and focus."]],
     topics:["Core shadows","Cast shadows","Reflected light","Rendering techniques"],
     hw:["Light a household object with a single light source","Produce one finished graphite study"]},
    {id:8,t:"The Figure Beneath",s:"Introduction to Human Anatomy",
     intro:"You don't need a medical degree, but you do need the landmarks and major masses of the body — both to draw figures and to place tattoos that flow with anatomy.",
     beats:[["Landmarks over memorization","The bony points that show through skin and anchor every proportion."],["Major muscle groups","The big masses that actually change a silhouette."],["Surface anatomy for placement","Reading the living body you'll be tattooing, not the textbook one."]],
     topics:["Skeletal landmarks","Major muscle groups","Surface anatomy","Artistic anatomy"],
     hw:["Label major muscle groups on a reference image","Complete three torso anatomy studies"]},
    {id:9,t:"Principles of Composition",s:"Creating Cohesive Artwork",
     intro:"Composition is how the parts become a whole. Balance, rhythm, and flow are what make a design feel inevitable rather than arranged. This lesson is a toolkit for arranging any subject.",
     beats:[["Balance","Symmetrical versus asymmetrical, and how to feel visual weight in an image."],["Rhythm and movement","Repeating shapes and directional lines that carry the eye through the piece."],["Flow","Designing lines that lead in and around, never dumping the eye off an edge."]],
     topics:["Balance","Rhythm","Movement","Visual flow"],
     hw:["Create four composition thumbnails using the same subject","Compare which composition is strongest and why"]},
    {id:10,t:"The Power of Absence",s:"Negative Space & Design",
     intro:"What you leave out is as powerful as what you put in. Negative space gives a tattoo room to breathe, ages gracefully, and stays readable for decades. Beginners overfill; professionals edit.",
     beats:[["Breathing room","Why crowded tattoos blur and muddy as they age and spread."],["Shape relationships","The space between objects is itself a shape — design it on purpose."],["Editing a busy design","Removing elements to make the whole stronger."]],
     topics:["Breathing room","Shape relationships","Readability","Tattoo applications"],
     hw:["Create two black-and-white compositions using negative space","Redesign a tattoo using more effective breathing room"]},
    {id:11,t:"Atmosphere & Drama",s:"Dynamic Lighting and Mood",
     intro:"Lighting sets emotion. The same subject can feel serene, ominous, or heroic depending on how it's lit. This lesson is about choosing a mood and rendering toward it.",
     beats:[["High key versus low key","Bright and open versus dark and dramatic — and what each one says to the viewer."],["Rim and edge lighting","Separating a subject from its background with a stroke of light."],["Mood as a decision","Pick the emotional register before you render, not after."]],
     topics:["Cinematic lighting","Emotional storytelling","High-contrast rendering","Dramatic compositions"],
     hw:["Create three lighting studies: high key, low key, and rim lighting"]},
    {id:12,t:"The Spectrum",s:"Color Theory for Artists",
     intro:"Color is a language with its own grammar. Before you put color in skin you need to understand how hues relate, how temperature shifts mood, and how to mix and mute deliberately.",
     beats:[["The wheel and its relationships","Primary, secondary, complementary, analogous, and triadic — the vocabulary of color."],["Temperature","Warm versus cool, and how temperature alone creates depth and feeling."],["Mixing and muting","Controlling saturation so your colors support each other instead of fighting."]],
     topics:["The color wheel & relationships","Temperature & mood","Harmonies: complementary, analogous, triadic","Mixing & muting color"],
     hw:["Paint or build a 12-step color wheel","Create three swatch sets — complementary, analogous, and triadic"]},
    {id:13,t:"Building the Perfect Reference",s:"Reference Photography for Artists",
     intro:"Great tattoos often start with great reference. Instead of scavenging blurry images, you'll learn to shoot and assemble custom reference that gives you exactly the light, angle, and detail you need.",
     beats:[["Shooting usable reference","Lighting and angle choices that hand you real information to draw from."],["Reference boards","Assembling several sources into one coherent target image."],["Reference, not tracing","Using reference to inform your decisions rather than copy them blindly."]],
     topics:["Taking usable photos","Lighting setups","Composition","Creating custom references"],
     hw:["Photograph an object using three different lighting setups","Create a reference board for a future tattoo concept"]}
  ]
},
{
  roman:"II", name:"Tattoo Arts & Design", range:"Courses 14–21",
  tagline:"Translate fine-art skill into tattoo-specific design, plus the safety, tools, and machines of the trade.",
  courses:[
    {id:14,t:"The History of Tattooing",s:"From Ancient Ritual to Modern Art",
     intro:"Tattooing is a global, ancient practice with deep cultural roots and a fast-moving modern industry. Knowing where it comes from makes you a more thoughtful — and more ethical — artist.",
     beats:[["Global traditions","From Polynesian tatau to Japanese irezumi to Western traditional, and what each values."],["The modern industry","How tattooing professionalized and branched into the styles you see today."],["Ethics and appropriation","Handling culturally significant imagery with knowledge and respect."]],
     topics:["Global tattoo traditions","Evolution of the industry","Modern tattoo movements","Professional ethics"],
     hw:["Research one historical tattoo tradition","Create a one-page summary with visual examples"]},
    {id:15,t:"Designing for Living Canvases",s:"Tattoo Design & Body Composition",
     intro:"Paper is flat and still; the body is curved and moving. A design that ignores the canvas fights it. This lesson teaches you to design with the body — its flow, its movement, and its future.",
     beats:[["Body flow","Lining up a design's main lines with the anatomy of the limb it lives on."],["Movement and placement","How a design reads as the body bends and moves."],["Designing for aging","Choices that keep a piece readable twenty years from now."]],
     topics:["Body flow","Movement","Placement theory","Long-term readability"],
     hw:["Design a tattoo for the forearm, calf, and shoulder","Explain how body flow influenced each design"]},
    {id:16,t:"The Digital Atelier",s:"Designing in Procreate",
     intro:"The modern design studio is an iPad. Procreate lets you sketch, revise, mock up on a client photo, and export a clean stencil — faster and more flexibly than paper. This lesson builds your digital workflow.",
     beats:[["Workspace and brushes","Setting up Procreate so it works the way a tattoo designer actually needs."],["Layers and stencils","Building line, shadow, and color on separate layers, then exporting a clean stencil."],["Client mockups","Placing a design onto a photo of the body to check it and to sell it."]],
     topics:["iPad & Procreate workflow","Brushes & layers for tattoo design","Building clean digital stencils","Client mockups & flash sheets"],
     hw:["Recreate a previous design digitally in Procreate","Export one stencil-ready line drawing"]},
    {id:17,t:"Professional Tattoo Safety",s:"Cross Contamination & Studio Protocol",
     intro:"This is the non-negotiable lesson. Bloodborne pathogens are a real risk to you and your client, and sterile technique is the price of admission to the trade. Treat every word here as gospel.",
     beats:[["Bloodborne pathogens","What you are protecting against, and why there's no room for shortcuts."],["Barrier protection","Gloves, wraps, and a strict clean-versus-dirty workflow."],["Setup and breakdown","A repeatable, contamination-free station routine. (Formal certification is a separate, required step.)"]],
     topics:["Bloodborne pathogens","Barrier protection","Sterile workflow","Industry standards"],
     hw:["Create a complete station setup checklist","Identify contamination risks in provided examples"]},
    {id:18,t:"Understanding the Canvas",s:"Skin Anatomy for Tattoo Artists",
     intro:"Skin isn't a passive surface — it's a living organ with layers, and ink has to land in exactly the right one. Understand the canvas and you'll understand why tattoos heal, settle, and age the way they do.",
     beats:[["Layers of skin","Epidermis, dermis, and precisely where pigment needs to sit."],["Why depth matters","Too shallow and it fades; too deep and it blows out into a blur."],["Healing and aging","What happens to ink over the first weeks and over decades."]],
     topics:["Layers of skin","Ink placement","Healing process","Aging tattoos"],
     hw:["Label the layers of skin","Explain where tattoo pigment should reside"]},
    {id:19,t:"Needle Theory",s:"Cartridge Configurations & Applications",
     intro:"The cartridge is your brush, and choosing the wrong one is like painting a portrait with a roller. This lesson decodes liners, shaders, and magnums so you can match the tool to the mark.",
     beats:[["Liners","Tight groupings for crisp, confident lines."],["Shaders and magnums","Spreading ink for soft value and solid packing."],["Building your reference chart","Matching configurations to the jobs they're actually best at."]],
     topics:["Liners","Round shaders","Magnums","Specialized configurations"],
     hw:["Match 15 needle configurations to their ideal applications","Create a personal needle reference chart"]},
    {id:20,t:"Machine Mechanics",s:"Rotary Machines, Voltage & Stroke Length",
     intro:"Your machine is a tool you must understand to control. Voltage, stroke, and give determine how the needle meets skin. This lesson demystifies what's happening in your hand.",
     beats:[["Machine anatomy","The parts of a rotary and what each one contributes to the hit."],["Voltage and stroke","How your settings change the needle for lining, shading, and packing."],["Troubleshooting","Reading a problem on the skin back to its cause in the machine."]],
     topics:["Machine anatomy","Voltage management","Stroke selection","Troubleshooting"],
     hw:["Build a machine settings chart","Explain ideal voltage ranges for lining, shading, and packing"]},
    {id:21,t:"Precision Transfer",s:"Stencil Creation & Placement",
     intro:"A perfect design ruined by a crooked or distorted stencil is a daily tragedy in careless shops. Stencil work is its own craft — placement, body mapping, and avoiding distortion on curves.",
     beats:[["Preparing a clean stencil","Getting from finished design to a crisp, durable transfer."],["Body mapping and placement","Positioning for flow, symmetry, and how the client actually carries the piece."],["Avoiding distortion","Applying to curved surfaces without warping your linework."]],
     topics:["Stencil preparation","Body mapping","Placement strategy","Avoiding distortion"],
     hw:["Create and apply three stencils to practice surfaces","Document placement adjustments"]}
  ]
},
{
  roman:"III", name:"Tattoo Application Theory", range:"Courses 22–28",
  tagline:"The mechanics of mark-making on skin — line, shade, saturation, color, healing, and the full workflow.",
  courses:[
    {id:22,t:"The Science of Linework",s:"Line Theory & Execution",
     intro:"Line is the skeleton of most tattoos, and clean, confident line is the hardest fundamental to fake. This lesson covers depth, stretch, and the mechanics of a solid line.",
     beats:[["Needle depth and angle","Landing ink consistently in the dermis, pass after pass."],["Stretching the skin","A proper three-point stretch gives you a flat, predictable surface."],["Confidence and speed","Why hesitation is what actually produces shaky, broken lines."]],
     topics:["Needle depth","Stretching techniques","Consistency","Clean linework"],
     hw:["Complete 50 straight lines and 50 curved lines","Complete 25 circles on practice skin"]},
    {id:23,t:"The Art of Shading",s:"Black & Grey Theory",
     intro:"Black-and-grey shading is where a tattoo gains dimension. Whip and pendulum motions, controlled dilution, and smooth transitions turn flat line into believable form.",
     beats:[["Whip and pendulum","The two core motions and the texture each one produces."],["Building value gradually","Layering from light to dark instead of forcing it in one pass."],["Smooth transitions","Avoiding the harsh bands and blotches that mark a beginner."]],
     topics:["Whip shading","Pendulum shading","Texture creation","Smooth transitions"],
     hw:["Create a smooth gradient from black to skin tone","Complete one shaded geometric study"]},
    {id:24,t:"Saturation & Packing",s:"Achieving Solid Application",
     intro:"Solid, even saturation is what makes bold work read across a room and last a lifetime. Packing is a skill of consistency and skin-reading — push too hard and you trade saturation for trauma.",
     beats:[["Even black packing","Overlapping passes that build to a flat, uniform solid."],["Reading the skin","Knowing when an area is saturated versus when it's overworked."],["Protecting the skin","Reaching full saturation without unnecessary damage."]],
     topics:["Color packing","Black packing","Avoiding skin trauma","Consistent saturation"],
     hw:["Pack five solid black shapes and five solid color shapes","Evaluate consistency across both"]},
    {id:25,t:"Color Application & Healing",s:"Color on Living Skin",
     intro:"Color on skin behaves differently than color on paper — the skin tone underneath is always part of the mix, and color heals and shifts over time. This lesson covers packing color and predicting how it settles.",
     beats:[["Packing color","Even, saturated color laid down without overworking the skin."],["Skin tone as a layer","How the canvas beneath quietly changes every color you apply."],["Healing and longevity","Which colors hold, which fade, and how to plan for both."]],
     topics:["Color packing technique","Layering & saturation","How color settles & heals","Color choices across skin tones"],
     hw:["Pack three color swatches on fake skin","Build a skin-tone color reference chart"]},
    {id:26,t:"Gradients & Transitions",s:"Creating Seamless Blends",
     intro:"Realism and dimension come from seamless transitions — value or color melting from one to the next with no visible seam. This lesson is about blends, in both black-and-grey and color.",
     beats:[["Soft shading for blends","Feathering edges into gradients the eye can't find the seam in."],["Grayscale reproduction","Matching the full value range of a reference image."],["Dimension through transition","Using blends to turn a flat shape into a rounded form."]],
     topics:["Soft shading","Gradient techniques","Realism applications","Dimension and depth"],
     hw:["Create three blended gradients","Reproduce a grayscale reference image"]},
    {id:27,t:"Reading the Heal",s:"Aftercare & Troubleshooting",
     intro:"The tattoo isn't finished when you wipe it down — it's finished when it heals. This lesson covers the aftercare you give clients, the healing timeline, and how to diagnose what went wrong when a heal goes sideways.",
     beats:[["Client aftercare","Clear, simple instructions that protect both your work and their skin."],["The healing timeline","What's normal at day three, day seven, and day thirty."],["Diagnosing problems","Tracing blowouts, fallout, and patchy heals back to their causes — and knowing when to touch up."]],
     topics:["Client aftercare instructions","The healing timeline","Diagnosing blowouts, fallout & patchy heals","When and how to touch up"],
     hw:["Write a client aftercare guide","Diagnose the cause in five provided problem-heal examples"]},
    {id:28,t:"Advanced Application Methods",s:"Combining Techniques for Realistic Tattooing",
     intro:"This is where everything converges. You'll combine line, shade, saturation, and color into a single coherent workflow — the way a real tattoo is actually built, from stencil to final pass.",
     beats:[["Sequencing a tattoo","The order operations actually happen in on a real piece."],["Integrating techniques","Moving from line into shade into color without muddying anything."],["The full workflow","Reference to stencil to finished, healed tattoo."]],
     topics:["Linework integration","Shading integration","Saturation control","Full tattoo workflow"],
     hw:["Capstone: build one complete tattoo project — reference board, composition sketches, final artwork, stencil, and practice-skin application"]}
  ]
},
{
  roman:"IV", name:"The Professional Tattoo Artist", range:"Courses 29–32",
  tagline:"Turn skill into a career — consultations, portfolio, pricing, and earning your place in a studio.",
  courses:[
    {id:29,t:"The Consultation",s:"Working With Clients",
     intro:"The tattoo starts before the machine turns on. A good consultation aligns the client's idea with what's actually tattooable, sets expectations, and builds the trust that lets you do your best work.",
     beats:[["Reading the idea","Translating a vague request into a concrete, tattooable design direction."],["Managing expectations","Honest conversations about size, placement, detail, and how it will age."],["Comfort and consent","Communication that keeps the client relaxed, informed, and in control."]],
     topics:["Reading a client's idea","Managing expectations","Drawing & adjusting on the spot","Consent, comfort & communication"],
     hw:["Run a mock consultation from a written brief","Produce a consultation-to-design summary"]},
    {id:30,t:"Building the Book",s:"Portfolio & Presence",
     intro:"Your portfolio is your résumé, your advertisement, and your ticket into a shop. This lesson is about curating, photographing, and presenting work that gets you taken seriously.",
     beats:[["Curate ruthlessly","Show your best and most consistent work, not everything you've ever made."],["Photographing tattoos","Lighting and angles that present work honestly and well."],["Finding your lane","Choosing a style to become known for so people remember you."]],
     topics:["Curating a portfolio that lands an apprenticeship","Photographing your work","Social media & personal brand","Choosing a style to be known for"],
     hw:["Assemble a 10-piece portfolio","Photograph and edit three finished pieces"]},
    {id:31,t:"The Business of Ink",s:"Pricing & Studio Economics",
     intro:"Talent doesn't pay rent — pricing, policies, and basic business sense do. This lesson covers the money side that art schools never teach and that quietly sinks talented artists.",
     beats:[["Pricing your work","Hourly rates, day rates, and minimums, and how to set yours."],["Deposits and no-shows","Policies that protect your time and your income."],["Overhead and taxes","Supplies, booth rent versus employment, and keeping clean records."]],
     topics:["Pricing & day rates","Deposits, booking & no-shows","Supplies, overhead & taxes","Booth rent vs. employment"],
     hw:["Build a personal pricing sheet","Draft your deposit & booking policy"]},
    {id:32,t:"Earning the Chair",s:"Apprenticeship & Studio Life",
     intro:"Most careers start with an apprenticeship, and most apprenticeships are earned, not given. This lesson is the honest playbook for approaching a mentor, behaving in a shop, and surviving your first months.",
     beats:[["Approaching a mentor","How to ask, what to bring, and what never to do."],["Shop etiquette","The unwritten rules of studio life and hierarchy."],["What owners look for","Attitude, reliability, and humility over raw talent, almost every time."]],
     topics:["Finding & approaching a mentor","Studio etiquette & hierarchy","What shop owners look for","Your first months on the floor"],
     hw:["Write a tailored apprenticeship outreach message","Build a checklist for a shop trial day"]}
  ]
}
];

export const FAQS: AcademyFaq[] = [
  {q:"Do I need to know how to draw already?",a:"No. The program is built to start at zero — Module I covers observation, form, value, and composition from the ground up. If you already draw, you'll move faster and lean into the design and application modules sooner, but no prior skill is assumed."},
  {q:"Will this program license me to tattoo?",a:"No, and any course that claims otherwise isn't being honest with you. Baroness teaches the art, design, theory, and business of tattooing. Actual licensing, bloodborne-pathogen certification, and the hands-on apprenticeship most regions require are separate steps you complete locally — this program prepares you to earn them."},
  {q:"Can I tattoo real skin during the course?",a:"Practice in the program is done on paper and synthetic fake skin only. You should never tattoo human skin outside a licensed, supervised setting in your jurisdiction. The application courses are theory and fake-skin technique designed to make you ready for that supervised step."},
  {q:"What equipment will I need?",a:"To begin, just a sketchbook and pencils. An iPad with Procreate is recommended for the digital design module but not required. For the later application courses you'll want practice (fake) skin and a basic rotary machine — we provide guidance on affordable starter setups before you buy anything."},
  {q:"How long does the program take?",a:"It's self-paced with lifetime access, so you set the pace. Most students working a few hours a week complete the full 32 courses over several months. The assignments and portfolio projects are designed to be finished in roughly one to three hours each."},
  {q:"Do I actually get feedback on my work?",a:"Yes — that's the core of the program. Every studio assignment can be submitted for notes, and all ten graded portfolio projects plus the capstone tattoo receive an individual written critique, so you're improving with direction rather than guessing alone."},
  {q:"Are payment plans available?",a:"Yes. The full program can be split into monthly payments at checkout, and enrollment includes a 14-day curriculum guarantee so you can make sure it's the right fit."}
];
