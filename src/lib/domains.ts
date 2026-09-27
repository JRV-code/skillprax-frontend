export const UNIVERSAL_DOMAINS = [
  {
    id: "natural-sciences",
    label: "Natural & Physical Sciences",
    desc: "Physics, Chemistry, Astronomy, Earth Sciences, Botany, Ecology",
    description: "Physics, Chemistry, Astronomy, Earth Sciences, Botany, Ecology",
    icon: "Atom"
  },
  {
    id: "engineering-tech",
    label: "Engineering & Applied Technology",
    desc: "Robotics, Electronics, Software, Embedded Systems, Mechanical",
    description: "Robotics, Electronics, Software, Embedded Systems, Mechanical",
    icon: "Cpu"
  },
  {
    id: "mathematics-logic",
    label: "Formal Sciences & Mathematics",
    desc: "Pure Mathematics, Logic, Probability, Statistics, Analysis",
    description: "Pure Mathematics, Logic, Probability, Statistics, Analysis",
    icon: "Binary"
  },
  {
    id: "social-sciences",
    label: "Social Sciences & Human Systems",
    desc: "Economics, Psychology, Sociology, Linguistics, Cognitive Science",
    description: "Economics, Psychology, Sociology, Linguistics, Cognitive Science",
    icon: "Users"
  },
  {
    id: "business-finance",
    label: "Business, Finance & Strategy",
    desc: "Markets, Entrepreneurship, Management, Venture Economics",
    description: "Markets, Entrepreneurship, Management, Venture Economics",
    icon: "TrendingUp"
  },
  {
    id: "humanities-philosophy",
    label: "Humanities, Philosophy & Law",
    desc: "Ethics, Jurisprudence, World History, Political Theory",
    description: "Ethics, Jurisprudence, World History, Political Theory",
    icon: "BookOpen"
  },
  {
    id: "arts-design",
    label: "Arts, Media & Spatial Design",
    desc: "3D Art, Architecture, Music Theory, UI/UX, Game Design",
    description: "3D Art, Architecture, Music Theory, UI/UX, Game Design",
    icon: "Palette"
  },
  {
    id: "health-athletics",
    label: "Health, Physiology & Performance",
    desc: "Human Anatomy, Nutrition, Kinesiology, Sports Science",
    description: "Human Anatomy, Nutrition, Kinesiology, Sports Science",
    icon: "Activity"
  },
  {
    id: "practical-crafts",
    label: "Practical Crafts & Applied Trades",
    desc: "Fabrication, Precision Audio, Electronics Repair, Agriculture",
    description: "Fabrication, Precision Audio, Electronics Repair, Agriculture",
    icon: "Wrench"
  }
] as const;

export type UniversalDomainId = typeof UNIVERSAL_DOMAINS[number]['id'];

// Compatibility exports
export const DOMAIN_CATEGORIES = UNIVERSAL_DOMAINS.map(d => ({
  id: d.id,
  name: d.label,
  examples: d.desc,
  icon: d.icon
}));
export const TECHNICAL_DOMAINS = DOMAIN_CATEGORIES;
