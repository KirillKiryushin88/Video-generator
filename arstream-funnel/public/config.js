// Everything a marketer changes lives here. No build step needed.
window.FUNNEL_CONFIG = {
  artist: {
    name: "Arstream",
    tagline: "Dancehall & Patois",
    avatar: "https://i.audiomack.com/arstream/e69933bff1.webp?width=400",
  },

  // Where the follow happens. Order = default priority of the buttons.
  // "auto" lets the page reorder by visitor signals (see pickPlatformOrder in index.html).
  platformMode: "auto",
  platforms: {
    audiomack: {
      label: "Follow on Audiomack",
      url: "https://audiomack.com/arstream",
    },
    spotify: {
      label: "Follow on Spotify",
      url: "https://open.spotify.com/artist/1pwBLhu1EUlDA8xyxSDnUl",
    },
    // Fill in once the channel exists; the button is hidden while url is empty.
    youtube: {
      label: "Subscribe on YouTube",
      url: "",
    },
  },
  defaultOrder: ["audiomack", "spotify", "youtube"],

  // Spotify embed used for the in-page preview (artist top tracks).
  previewUri: "spotify:artist:1pwBLhu1EUlDA8xyxSDnUl",
  previewSeconds: 15,

  // Google tag. Leave ids empty to run without tracking (local testing).
  google: {
    adsId: "", // "AW-123456789"
    ga4Id: "", // "G-XXXXXXX"
    // One conversion action per funnel step, created in Google Ads.
    // Mark only follow_click* as Primary; preview_15s stays Secondary.
    labels: {
      preview_15s: "",
      follow_click: "",
      follow_click_after_preview: "",
    },
    currency: "USD",
  },

  // Bandit endpoint (Netlify functions). Set to "" to disable server learning.
  api: "/api",

  // Creative hooks. The page picks one per visit:
  //   1) ?v=<id> from the ad URL, 2) keyword/utm match, 3) bandit, 4) random.
  variants: [
    {
      id: "patois",
      match: ["patois", "jamaican", "yardie"],
      kicker: "Real patois. No filter.",
      headline: "Dancehall the way it sounds on the road",
      sub: "Arstream drops raw patois bars over heavy riddims. Follow so the next one lands in your feed first.",
    },
    {
      id: "fans-of",
      match: ["vybz", "kartel", "popcaan", "chronic law", "skeng", "valiant", "masicka"],
      kicker: "If Kartel and Popcaan are on repeat",
      headline: "Your next dancehall obsession",
      sub: "New-school energy with an old-school bounce. Follow Arstream and catch every release.",
    },
    {
      id: "new-drop",
      match: ["new", "2026", "latest", "release"],
      kicker: "New album out now",
      headline: "12 Years Later. Press play.",
      sub: "The new project from Arstream. Follow to get the next drop the day it lands.",
    },
  ],
};
