// skillprax-frontend/src/lib/pillars.ts

export interface KnowledgePillar {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export const KNOWLEDGE_PILLARS: KnowledgePillar[] = [
  { id: "natural-sciences", label: "Natural Sciences", description: "Physics, chemistry, biology, earth and environmental science", icon: "Atom" },
  { id: "mathematics", label: "Mathematics", description: "Pure and applied math, statistics, logic", icon: "Sigma" },
  { id: "engineering", label: "Engineering", description: "Software, mechanical, electrical, civil, and other engineering disciplines", icon: "Cog" },
  { id: "social-sciences", label: "Social Sciences", description: "Psychology, sociology, economics, political science, anthropology", icon: "Users" },
  { id: "business-finance", label: "Business & Finance", description: "Management, marketing, accounting, investing, entrepreneurship", icon: "Briefcase" },
  { id: "humanities-law", label: "Humanities & Law", description: "History, philosophy, literature, languages, legal studies", icon: "Scale" },
  { id: "arts-design", label: "Arts & Design", description: "Visual arts, music, writing, industrial and graphic design", icon: "Palette" },
  { id: "health-athletics", label: "Health & Athletics", description: "Medicine, nutrition, sports science, fitness, physical training", icon: "HeartPulse" },
  { id: "applied-crafts", label: "Applied Crafts", description: "Cooking, woodworking, textiles, trades, and other hands-on skills", icon: "Hammer" },
];

export function getPillarById(id: string): KnowledgePillar | undefined {
  return KNOWLEDGE_PILLARS.find((p) => p.id === id || p.label.toLowerCase() === id.toLowerCase());
}

export const UNIVERSAL_DOMAINS = KNOWLEDGE_PILLARS.map((p) => ({
  id: p.id,
  label: p.label,
  desc: p.description,
  icon: p.icon,
}));
