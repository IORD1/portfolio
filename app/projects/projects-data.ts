import projectsJson from '@/data/projects.json';

export type TeamMember = {
  name: string;
  handle: string;
  href: string;
  avatar: string;
  isYou?: boolean;
};

export type Section = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  team?: TeamMember[];
  stackLine?: string;
};

export type ProjectPage = {
  title: string[];
  subtitle: string;
  meta: { year: string; role: string; stack: string; status: string };
  screens: { src: string; alt: string }[];
  sections: Section[];
};

export type ProjectCard = {
  size?: 'wide' | 'narrow';
  description: string;
  tags: string[];
};

export type ProjectLinks = {
  github?: string;
  tryout?: string;
};

export type Project = {
  slug: string;
  name: string;
  navTitle?: string;
  card: ProjectCard;
  links?: ProjectLinks;
  page?: ProjectPage;
};

type RawProject = Omit<Project, 'slug'>;
type RawData = {
  selectedWork: string[];
  sideQuests: string[];
  projects: Record<string, RawProject>;
};

const raw = projectsJson as RawData;

function resolve(slug: string): Project {
  const p = raw.projects[slug];
  if (!p) throw new Error(`Unknown project slug: ${slug}`);
  return { slug, ...p };
}

export const selectedWork: Project[] = raw.selectedWork.map(resolve);
export const sideQuests: Project[] = raw.sideQuests.map(resolve);

export function getProject(slug: string): Project | undefined {
  const p = raw.projects[slug];
  return p ? { slug, ...p } : undefined;
}

export function projectsWithPages(): Project[] {
  return Object.entries(raw.projects)
    .filter(([, p]) => p.page)
    .map(([slug, p]) => ({ slug, ...p }));
}

export function getNextSelected(slug: string): { slug: string; title: string } | undefined {
  const order = raw.selectedWork;
  const idx = order.indexOf(slug);
  if (idx === -1) return undefined;
  const nextSlug = order[(idx + 1) % order.length];
  const next = raw.projects[nextSlug];
  if (!next) return undefined;
  return { slug: nextSlug, title: next.navTitle ?? next.name };
}
