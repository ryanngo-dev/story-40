// Placeholder word list - can be easily replaced later with a larger dataset
export const WORD_LIST = [
  // Concrete nouns - places & structures
  "lighthouse", "umbrella", "mirror", "pocket", "bridge", "window", 
  "photograph", "garden", "doorway", "shadow", "candle", "compass",
  "threshold", "anchor", "horizon", "lantern", "keyhole", "meadow",
  "tower", "cottage", "alley", "fountain", "chapel", "cellar",
  "attic", "harbor", "crossroads", "gallery", "archive", "balcony",
  
  // Concrete nouns - objects
  "letter", "coin", "ribbon", "bottle", "clock", "map",
  "knife", "rope", "wheel", "crown", "mask", "chain",
  "feather", "stone", "pearl", "thread", "bell", "ring",
  "veil", "brush", "journal", "telescope", "hourglass", "locket",
  "chalice", "flask", "banner", "quill", "scroll", "diagram",
  
  // Abstract nouns - emotions & states
  "whisper", "silence", "memory", "hope", "secret", "courage",
  "patience", "momentum", "twilight", "fragment", "echo", "destiny",
  "promise", "refuge", "solitude", "gravity", "rhythm", "fortune",
  "truth", "mercy", "valor", "wisdom", "chaos", "harmony",
  "clarity", "doubt", "faith", "legacy", "innocence", "justice",
  
  // Abstract nouns - concepts
  "journey", "ritual", "burden", "lesson", "riddle", "legend",
  "oath", "vision", "paradox", "threshold", "mystery", "prophecy",
  "reckoning", "sanctuary", "testament", "voyage", "awakening", "confession",
  "departure", "reunion", "discovery", "surrender", "revelation", "transformation",
  
  // Verbs - movement
  "drift", "shatter", "bloom", "vanish", "linger", "stumble",
  "unravel", "shimmer", "crumble", "wander", "breathe", "dissolve",
  "awaken", "surrender", "tremble", "emerge", "scatter", "collide",
  "chase", "spiral", "leap", "dive", "spin", "crawl",
  "glide", "plunge", "soar", "wade", "stagger", "tumble",
  
  // Verbs - transformation & action
  "ignite", "mend", "sever", "forge", "carve", "weave",
  "pierce", "kindle", "tether", "smother", "resurrect", "fracture",
  "eclipse", "summon", "banish", "haunt", "whisper", "proclaim",
  "betray", "defend", "illuminate", "conceal", "inherit", "relinquish",
  
  // Adjectives - physical qualities
  "forgotten", "tender", "hollow", "peculiar", "distant", "gentle",
  "empty", "wild", "silver", "quiet", "broken", "endless",
  "delicate", "restless", "faded", "velvet", "amber", "crimson",
  "ancient", "luminous", "weathered", "barren", "sacred", "fleeting",
  "rusted", "crystalline", "brittle", "fierce", "ornate", "threadbare",
  
  // Adjectives - atmospheric
  "haunted", "serene", "turbulent", "somber", "radiant", "bleak",
  "ethereal", "stark", "murky", "pristine", "desolate", "vibrant",
  "tangled", "obscure", "vivid", "hushed", "jagged", "gossamer",
  "volatile", "tranquil", "raw", "opaque", "translucent", "phosphorescent",
  
  // Sensory words - visual
  "thunder", "frost", "smoke", "crimson", "mist", "amber",
  "steel", "marble", "sapphire", "obsidian", "copper", "ash",
  "pearl", "ebony", "jade", "quartz", "bronze", "indigo",
  "vermillion", "emerald", "charcoal", "ivory", "scarlet", "granite",
  
  // Sensory words - tactile & sound
  "velvet", "bitter", "crackle", "honey", "thorns", "satin",
  "gravel", "silk", "thunder", "murmur", "roar", "hum",
  "chime", "rustle", "groan", "sigh", "clatter", "thud",
  "drip", "snap", "splash", "creak", "screech", "whistle",
  
  // Emotional/evocative
  "laughter", "sorrow", "wonder", "dread", "longing", "relief",
  "betrayal", "grace", "shame", "pride", "fear", "joy",
  "anguish", "triumph", "remorse", "ecstasy", "despair", "bliss",
  "rage", "serenity", "jealousy", "compassion", "guilt", "awe",
  
  // Time & nature
  "dawn", "dusk", "midnight", "autumn", "winter", "spring",
  "storm", "drought", "harvest", "solstice", "equinox", "eclipse",
  "tide", "current", "breeze", "gale", "drizzle", "downpour",
  "bloom", "decay", "growth", "erosion", "cycle", "season"
];

/**
 * Gets daily words based on date seed (same words each day)
 * @param count Number of words to select (default: 3)
 * @param date The date to seed from (default: today)
 * @returns Array of seeded words for the day
 */
export function getDailyWords(count: number = 3, date = new Date()): string[] {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

  // Simple seeded random function
  let random = seed;
  const seededRandom = () => {
    random = (random * 9301 + 49297) % 233280;
    return random / 233280;
  };

  const indices: number[] = [];
  while (indices.length < count) {
    const index = Math.floor(seededRandom() * WORD_LIST.length);
    if (!indices.includes(index)) {
      indices.push(index);
    }
  }

  return indices.map(i => WORD_LIST[i]);
}

/**
 * Randomly selects N words from the word list (for manual override)
 * @param count Number of words to select (default: 3)
 * @returns Array of randomly selected words
 */
export function getRandomWords(count: number = 3): string[] {
  const shuffled = [...WORD_LIST].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
