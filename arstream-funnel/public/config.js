// Everything a marketer changes lives here. No build step needed.
window.FUNNEL_CONFIG = {
  artist: {
    name: "Arstream",
    tagline: "Original music. Animated worlds.",
    // Assets from the official site; copy them next to index.html if you host elsewhere.
    wordmark: "https://arstream.space/sequence-v1/assets/wordmark.webp",
    poster: "https://arstream.space/media/v1/poster.png",
    site: "https://arstream.space/",
  },

  // Follow/subscribe destinations. Order = default priority.
  // The first three become big buttons; the rest go to the "more platforms" row.
  platforms: {
    spotify: { label: "Follow on Spotify", url: "https://open.spotify.com/artist/1pwBLhu1EUlDA8xyxSDnUl" },
    // sub_confirmation=1 opens YouTube's "Subscribe?" dialog straight away.
    youtube: { label: "Subscribe on YouTube", url: "https://www.youtube.com/channel/UCSs998rJMeez9p5gZouLCew?sub_confirmation=1" },
    apple: { label: "Follow on Apple Music", url: "https://music.apple.com/artist/arstream/1765567867" },
    audiomack: { label: "Audiomack", url: "https://audiomack.com/arstream" },
    soundcloud: { label: "SoundCloud", url: "https://soundcloud.com/arstream" },
    ytmusic: { label: "YouTube Music", url: "https://music.youtube.com/channel/UC--8eYOmhwGjLZiD48FaUvw" },
    deezer: { label: "Deezer", url: "https://www.deezer.com/artist/279784691" },
    amazon: { label: "Amazon Music", url: "https://music.amazon.com/artists/B0DFMT1BH6/arstream" },
    tidal: { label: "TIDAL", url: "https://tidal.com/artist/50105493" },
    instagram: { label: "Instagram", url: "https://www.instagram.com/arstream/" },
  },
  defaultOrder: ["spotify", "youtube", "apple", "audiomack", "soundcloud", "ytmusic", "deezer", "amazon", "tidal", "instagram"],
  // "auto" reorders by visitor signals (see pickPlatformOrder in index.html).
  platformMode: "auto",
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

  // One variant per entry point into the catalogue. The page picks one per visit:
  //   1) ?v=<id> from the ad URL, 2) keyword/utm match, 3) bandit per traffic source, 4) random.
  // preview: { spotify: "spotify:track:..." } or { youtube: "<videoId>" }.
  // platform: optional destination to put first for this variant.
  variants: [
    {
      id: "electronic",
      match: ["electronic", "synth", "house", "techno", "edm", "ambient", "space", "lost frequencies", "chill", "outerstellar"],
      kicker: "Electronic · Outerstellar",
      headline: "A chase through collapsing worlds. Headphones on.",
      sub: "Cinematic electronic music with its own animated film. Follow Arstream for the next world.",
      preview: { spotify: "spotify:track:5dTr1mTfyrfHj3op8hfukT" },
    },
    {
      id: "hiphop",
      match: ["hip hop", "hip-hop", "hiphop", "rap", "mac miller", "j cole", "j. cole", "joey bada", "lofi", "lo-fi", "late night", "the unknown"],
      kicker: "Alternative hip-hop · The Only Canvas",
      headline: "For late nights and unfinished ideas.",
      sub: "The Unknown: a notebook turns into a city of paper. If mellow, reflective rap is your night rotation, start here.",
      preview: { spotify: "spotify:track:3cyQusCEIdzHRS9bUah562" },
    },
    {
      id: "dancehall",
      match: ["dancehall", "patois", "reggae", "sean paul", "vybz", "kartel", "popcaan", "island", "riddim"],
      kicker: "Dancehall · Patois",
      headline: "Turn the room up.",
      sub: "Dancehall & Patois, Vol. 1. Nine tracks made for the speaker, not the background.",
      preview: { spotify: "spotify:album:07X40InN28ePk158c5jrcX" },
    },
    {
      id: "films",
      match: ["animated", "animation", "music video", "film", "cartoon", "sanity", "visual"],
      kicker: "Arstream cinema",
      headline: "Every song gets its own hand-drawn world.",
      sub: "Watch Sanity, an animated music film. Subscribe for the next one.",
      preview: { youtube: "LnAXv875RU4" },
      platform: "youtube",
    },
    {
      id: "album",
      match: ["12 years", "new album", "album", "2026", "new music"],
      kicker: "New album · 24 October 2026",
      headline: "12 years later.",
      sub: "Short musical ideas shared on Instagram twelve years ago. Now an album of 14 tracks.",
      preview: { spotify: "spotify:album:3C2D0wyxxD7eV36qGrJvqE" },
    },
  ],
};
