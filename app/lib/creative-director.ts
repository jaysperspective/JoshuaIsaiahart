// Creative Director showcases — curated brand-world case studies.
// Hardcoded on purpose: these are hand-built editorial pieces, not the
// admin/DB-driven galleries. Add a new object to `showcases` to add a case study.

export interface ShowcaseImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface ShowcaseVideo {
  url: string;
  title: string;
  note?: string; // optional line under the film — insertion slot
}

export interface Credit {
  role: string;
  name: string;
}

export interface LiveVideo {
  src: string;
  poster?: string;
  alt: string;
  caption?: string;
}

export interface AppShowcase {
  name: string;
  tagline: string;
  description: string;
  appStoreUrl: string;
  qr: string; // path to QR image
  screenshots: ShowcaseImage[];
}

export interface ShowcaseLink {
  label: string;
  href: string;
}

export interface Swatch {
  hex: string; // without leading '#'
  name: string;
}

export interface Showcase {
  id: string;
  no: string; // "01"
  title: string;
  client: string;
  role: string;
  year?: string;
  // Brand accents used to tint the section (falls back to editorial palette)
  brand: {
    primary: string; // main brand color
    secondary: string;
    ink: string;
    type?: string; // brand typeface note
  };
  intro: string; // lede paragraph
  body: string[]; // supporting paragraphs
  // Strategic insertion slots — leave empty to reserve the space; fill later.
  pullQuote?: string; // large pull quote under the header
  directorsNote?: string[]; // "Director's Note" narrative block, one string per paragraph
  liveNote?: string; // context line under "The live world"
  credits?: Credit[]; // role → name at the foot of the case study
  swatches?: Swatch[];
  logos?: { src: string; label: string }[]; // logo system variants
  brandAsset?: { label: string; href: string }; // e.g. brand guide PDF
  collateral?: ShowcaseImage[]; // applied identity — flyers, covers, the feed
  images: ShowcaseImage[];
  liveVideo?: LiveVideo; // a portrait motion clip featured in the live grid
  app?: AppShowcase; // a product built for the world
  videos: ShowcaseVideo[];
  links: ShowcaseLink[];
}

export const showcases: Showcase[] = [
  {
    id: "plus-n-trust",
    no: "01",
    title: "Constructing a World",
    client: "Plus N Trust",
    role: "Creative Director",
    year: "2023 — Present",
    brand: {
      primary: "#db52a6",
      secondary: "#e3d9ac",
      ink: "#313030",
      type: "Menlo",
    },
    intro:
      "Plus N Trust began as a passion project: a few friends who wanted a space to share music and create. It quickly grew into a world of music lovers. As creative director, I shape the brand identity and the feel of that world, from color theory to image style, with a focus on consistency and attention to detail. Here are some samples of what we've built.",
    body: [],
    // --- Strategic insertion slots: fill these in later ---
    pullQuote: "", // one bold line — the thesis of the world
    directorsNote: [], // ["paragraph 1", "paragraph 2", ...]
    liveNote: "", // one line of context under the live photos
    credits: [], // [{ role: "Photography", name: "Joshua Isaiah" }, ...]
    swatches: [
      { hex: "db52a6", name: "Magenta" },
      { hex: "313030", name: "Charcoal" },
      { hex: "e3d9ac", name: "Sand" },
    ],
    logos: [
      { src: "/creative-director/plusntrust/logos/pnt-logo-wordmark.png", label: "Primary wordmark" },
      { src: "/creative-director/plusntrust/logos/pnt-logo-venn.png", label: "Venn mark" },
      { src: "/creative-director/plusntrust/logos/pnt-logo-circle.png", label: "Circle plus" },
      { src: "/creative-director/plusntrust/logos/pnt-logo-approved.png", label: "Approved" },
      { src: "/creative-director/plusntrust/logos/pnt-logo-plusone.png", label: "+ONE" },
      { src: "/creative-director/plusntrust/logos/pnt-logo-trust.png", label: "Trust lockup" },
      { src: "/creative-director/plusntrust/logos/pnt-logo-badge.png", label: "Badge" },
      { src: "/creative-director/plusntrust/logos/pnt-logo-group.png", label: "PNT Group, LLC" },
    ],
    brandAsset: {
      label: "Brand Guide (PDF)",
      href: "/creative-director/plusntrust/pnt-brand-id.pdf",
    },
    collateral: [
      {
        src: "/creative-director/plusntrust/pnt-collateral-01.jpg",
        alt: "+CloseFriends at Wild Days DC flyer, November 2025",
        caption: "+CloseFriends · event flyer",
      },
      {
        src: "/creative-director/plusntrust/pnt-collateral-02.jpg",
        alt: "A Dozen Roses For You, II — playlist cover art",
        caption: "A Dozen Roses For You, II · cover",
      },
      {
        src: "/creative-director/plusntrust/pnt-collateral-03.jpg",
        alt: "+CloseFriends at Wild Days flyer, June 2024",
        caption: "+CloseFriends · event flyer",
      },
      {
        src: "/creative-director/plusntrust/pnt-collateral-masego.jpg",
        alt: "Masego — Fix Your Face Tour Afterparty flyer, Officina DC",
        caption: "Masego Afterparty · event flyer",
      },
      {
        src: "/creative-director/plusntrust/pnt-collateral-04.jpg",
        alt: "Plus N Trust Instagram feed — a wall of event and content design",
        caption: "@plusntrust · the feed",
      },
    ],
    images: [
      {
        src: "/creative-director/plusntrust/pnt-live-02.jpg",
        alt: "Performer with arm raised in blue and violet light",
        caption: "Live — the room",
      },
      {
        src: "/creative-director/plusntrust/pnt-live-03.jpg",
        alt: "Artist in fur coat and shades against a warm red backdrop",
        caption: "Live — the headliner",
      },
      {
        src: "/creative-director/plusntrust/pnt-live-04.jpg",
        alt: "Singer in white at the mic, exit sign glowing behind",
        caption: "Live — center stage",
      },
      {
        src: "/creative-director/plusntrust/pnt-live-05.jpg",
        alt: "Profile of a vocalist in low magenta and teal light",
        caption: "Live — in the dark",
      },
      {
        src: "/creative-director/plusntrust/pnt-live-01.jpg",
        alt: "Vocalist under magenta stage light, silhouetted crowd in foreground",
        caption: "Live — magenta wash",
      },
      {
        src: "/creative-director/plusntrust/pnt-live-06.jpg",
        alt: "Crowd at the DJ booth, throwback jerseys and orange dress",
        caption: "Live — the floor",
      },
      {
        src: "/creative-director/plusntrust/pnt-live-07.jpg",
        alt: "Packed room dancing under warm light",
        caption: "Live — the room",
      },
      {
        src: "/creative-director/plusntrust/pnt-live-08.jpg",
        alt: "DJ and host on the mic behind the decks",
        caption: "Live — behind the decks",
      },
      {
        src: "/creative-director/plusntrust/pnt-live-09.jpg",
        alt: "Friends dancing close on a crowded floor",
        caption: "Live — dancing",
      },
      {
        src: "/creative-director/plusntrust/pnt-live-10.jpg",
        alt: "The crowd gathered under the greenery and warm light",
        caption: "Live — the crowd",
      },
      {
        src: "/creative-director/plusntrust/pnt-live-11.jpg",
        alt: "Wide view of the party against the mural wall",
        caption: "Live — the whole room",
      },
      {
        src: "/creative-director/plusntrust/pnt-live-12.jpg",
        alt: "Performer on the mic under a purple wash",
        caption: "Live — on the mic",
      },
    ],
    liveVideo: {
      src: "/creative-director/plusntrust/pnt-live-clip.mp4",
      poster: "/creative-director/plusntrust/pnt-live-clip-poster.jpg",
      alt: "Plus N Trust live — motion clip",
      caption: "Live — motion",
    },
    app: {
      name: "plusONE",
      tagline: "Tickets",
      description:
        "The world needed its own front door. plusONE is the ticketing app for the Plus N Trust universe — events, RSVPs, and community in one place, carrying the same mark and voice all the way down to the app icon.",
      appStoreUrl: "https://apps.apple.com/us/app/plusone-tickets/id6789144671",
      qr: "/creative-director/plusntrust/app/plusone-qr.png",
      screenshots: [
        { src: "/creative-director/plusntrust/app/pnt-app-01.jpg", alt: "plusONE app — upcoming events feed" },
        { src: "/creative-director/plusntrust/app/pnt-app-02.jpg", alt: "plusONE app — event detail" },
      ],
    },
    videos: [
      { url: "https://youtu.be/CuOSkq8mK28", title: "+One Series: Masego" },
      { url: "https://youtu.be/IB5-YMa2jLg", title: "+One Series: Autumn Labella" },
      { url: "https://youtu.be/S4y5g_j_8fQ", title: "+One Series: Nali" },
    ],
    links: [
      { label: "plusntrust.org", href: "https://plusntrust.org" },
      { label: "plusntrust.com", href: "https://plusntrust.com" },
      { label: "Instagram", href: "https://www.instagram.com/plusntrust" },
      { label: "YouTube", href: "https://www.youtube.com/@plusntrust/featured" },
    ],
  },
];
