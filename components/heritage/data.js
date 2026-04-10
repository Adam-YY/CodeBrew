export const INITIAL_MEMBERS = [
  { id: "gf", name: "Grandpa Chen", role: "Grandfather", avatar: "👴", born: 1945, parentId: null, generation: 1 },
  { id: "gm", name: "Grandma Chen", role: "Grandmother", avatar: "👵", born: 1948, parentId: null, generation: 1 },
  { id: "dad", name: "Wei Chen", role: "Father", avatar: "👨", born: 1972, parentId: "gf", generation: 2 },
  { id: "mom", name: "Mei Lin", role: "Mother", avatar: "👩", born: 1975, parentId: null, generation: 2 },
  { id: "son", name: "Brian Chen", role: "Son", avatar: "🧑", born: 2004, parentId: "dad", generation: 3 },
  { id: "daughter", name: "Lily Chen", role: "Daughter", avatar: "👧", born: 2007, parentId: "dad", generation: 3 },
];

export const INITIAL_NOTES = [
  {
    id: 1,
    from: "gf",
    to: "son",
    type: "tradition",
    title: "Chinese New Year Preparations",
    eventDate: "01-28",
    content:
      "Every year, 3 days before Chinese New Year, we must clean the entire house — this sweeps away bad luck. On New Year's Eve, make sure to prepare these dishes: whole steamed fish (年年有余), dumplings (shaped like gold ingots for wealth), and nian gao (年糕). The fish must never be fully eaten — always leave some for the next day. After dinner, stay up past midnight together. This is called 守岁. In the morning, wear new red clothes and give red envelopes to the children. Visit the eldest family members first.",
    unlockDate: null,
    createdAt: "2024-01-02",
  },
  {
    id: 2,
    from: "gm",
    to: "daughter",
    type: "letter",
    title: "For Your Wedding Day",
    eventDate: "06-15",
    content:
      "My dear Lily, if I am not there to see you in your dress, know that I am watching from somewhere beautiful. Remember: a strong marriage is two people who choose each other every single day. Your grandfather and I had hard years — war, immigration, poverty — but we chose each other through all of it. Wear my jade bracelet. It was given to me by my mother, and her mother before her. It carries the love of four generations now. Be brave, be kind, and always keep your own name in your heart.",
    unlockDate: "2030-06-15",
    createdAt: "2024-03-01",
  },
  {
    id: 3,
    from: "gf",
    to: "all",
    type: "tradition",
    title: "Qingming Festival — Tomb Sweeping",
    eventDate: "04-05",
    content:
      "On Qingming (清明节), we visit the graves of our ancestors. Bring fresh flowers, incense, and the rice wine your great-grandfather liked. Clean the gravestone. Burn joss paper. Tell them about the year — they are listening. After, we have a family picnic nearby. This is not a sad day. It is a day of connection.",
    unlockDate: null,
    createdAt: "2024-04-01",
  },
  {
    id: 4,
    from: "gm",
    to: "son",
    type: "item",
    title: "The Jade Pendant",
    eventDate: null,
    content:
      "This pendant was carved in Fujian province in 1920. Your great-great-grandfather wore it when he first sailed to Southeast Asia to start a new life. It has been passed to the eldest son of each generation. When you hold it, you hold the courage of everyone who came before you. Keep it safe. One day, give it to your child and tell them this story.",
    unlockDate: null,
    createdAt: "2024-05-12",
  },
  {
    id: 5,
    from: "dad",
    to: "son",
    type: "tradition",
    title: "Mid-Autumn Festival",
    eventDate: "09-17",
    content:
      "We gather on the night of the full moon. Your grandmother's mooncake recipe is in the brown notebook in the kitchen — the one with lotus paste and salted egg yolk. We set up a table outside, light lanterns, and share mooncakes under the moon. Tell the story of Chang'e to the little ones. Your grandfather used to say: 'The moon is the same one our ancestors watched. When you look up, you see what they saw.'",
    unlockDate: null,
    createdAt: "2024-08-20",
  },
  {
    id: 6,
    from: "gf",
    to: "daughter",
    type: "letter",
    title: "For Your 18th Birthday",
    eventDate: "03-20",
    content:
      "Little Lily, you are a woman now. When I was 18, the world was very different — but the important things are the same. Be honest even when it is hard. Work with your hands as well as your mind. And never forget where your family comes from. I have put money aside for your education. Use it well. Make us proud — but more importantly, make yourself proud.",
    unlockDate: "2025-03-20",
    createdAt: "2024-02-10",
  },
  {
    id: 7,
    from: "mom",
    to: "all",
    type: "tradition",
    title: "Family Dumpling Night — Every Sunday",
    eventDate: null,
    content:
      "Every Sunday evening, we make dumplings together. This is not about the food — it is about the time. Grandpa rolls the dough, the children fold (even badly — that's okay), and we talk about our week. The recipe: 500g pork mince, Chinese cabbage (salted and squeezed dry), ginger, soy sauce, sesame oil, a little sugar. Mix well. Grandma says the secret is to let the filling rest for 1 hour.",
    unlockDate: null,
    createdAt: "2024-06-01",
    recurrence: "weekly",
  },
  {
    id: 8,
    from: "gm",
    to: "all",
    type: "item",
    title: "The Family Photo Album (1960-1990)",
    eventDate: null,
    content:
      "This album contains photographs from our first years in Melbourne. Page 12 has the photo of our shop on Little Bourke Street — that is where everything began. We worked 16-hour days, but we were free. Every photo has a story. Ask me while I can still tell them.",
    unlockDate: null,
    createdAt: "2024-07-12",
  },
];

export const INITIAL_UPLOADS = [
  { id: "media-1", type: "document", name: "Grandma's Dumpling Recipe.pdf", from: "gm", to: "all", date: "2024-12-01", url: "", fileType: "application/pdf" },
  { id: "media-2", type: "voice", name: "Grandpa's story about Melbourne.mp3", from: "gf", to: "all", date: "2024-11-15", url: "", fileType: "audio/mpeg" },
  { id: "media-3", type: "video", name: "2024 CNY Family Dinner.mp4", from: "dad", to: "all", date: "2024-02-10", url: "", fileType: "video/mp4" },
];

export const DEFAULT_AVATARS = ["👵", "👴", "👩", "👨", "🧑", "👧", "👦", "🧓", "🧔", "👩‍🦳", "👨‍🦳"];
