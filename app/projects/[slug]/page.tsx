import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';
import {
  getNextSelected,
  getProject,
  projectsWithPages,
  type Project,
  type Section,
} from '../projects-data';
import RevealOnScroll from './RevealOnScroll';

export function generateStaticParams() {
  return projectsWithPages().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project?.page) return {};
  return {
    title: `${project.navTitle ?? project.name} — Prathmesh Ingole`,
    description: project.page.subtitle,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project?.page) notFound();
  const next = getNextSelected(slug);
  const sections = project.page.sections;
  const lastSectionIdx = sections.length - 1;

  return (
    <>
      <RevealOnScroll />
      <div className="grain" aria-hidden="true"></div>

      <nav className="nav">
        <Link href="/" className="nav-name">
          Prathmesh Ingole
        </Link>
        <div className="nav-links">
          <Link href="/#work">Work</Link>
          <Link href="/#stack">Stack</Link>
          <Link href="/#journey">Journey</Link>
        </div>
        <div className="nav-cta">
          <a href="/Prathmesh_Ingole_Resume.pdf" className="btn btn-ghost" download>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            Resume
          </a>
          <a href="mailto:pratham111ingole@gmail.com" className="btn btn-primary">
            Email me
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M7 17 17 7" />
              <path d="M8 7h9v9" />
            </svg>
          </a>
        </div>
      </nav>

      <header className="project-hero">
        <div className="wrap">
          <Link href="/#work" className="back-link reveal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            All projects
          </Link>
          <h1 className="project-hero-title reveal">
            {project.page.title.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </h1>
          <p className="project-hero-sub reveal">{project.page.subtitle}</p>

          <div className="project-meta-row reveal">
            <div>
              <div className="m-label">Year</div>
              <div className="m-val">{project.page.meta.year}</div>
            </div>
            <div>
              <div className="m-label">Role</div>
              <div className="m-val">{project.page.meta.role}</div>
            </div>
            <div>
              <div className="m-label">Stack</div>
              <div className="m-val">{project.page.meta.stack}</div>
            </div>
            <div>
              <div className="m-label">Status</div>
              <div className="m-val">{project.page.meta.status}</div>
            </div>
          </div>

          <div className="project-screens reveal">
            <div className="screens-track">
              {project.page.screens.map((s, i) => (
                <a key={i} className="screen-card" href={s.src} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.src} alt={s.alt} loading="lazy" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="wrap">
        {sections.map((section, i) => (
          <SectionBlock
            key={i}
            section={section}
            project={project}
            isLast={i === lastSectionIdx}
          />
        ))}
      </div>

      {next && (
        <section className="next-project">
          <div className="wrap">
            <Link href={`/projects/${next.slug}`}>
              <div>
                <div className="np-label">Next project</div>
                <div className="np-title">{next.title}</div>
              </div>
              <div className="np-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </section>
      )}
    </>
  );
}

function SectionBlock({
  section,
  project,
  isLast,
}: {
  section: Section;
  project: Project;
  isLast: boolean;
}) {
  const showLinks = isLast && (project.links?.github || project.links?.tryout);
  return (
    <div className="project-body-grid">
      <h3>{section.heading}</h3>
      <div className="content reveal">
        {section.paragraphs?.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {section.stackLine && <p>{section.stackLine}</p>}
        {section.list && (
          <ul>
            {section.list.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
        {section.team && (
          <div className="team-row">
            {section.team.map((m) => (
              <a key={m.handle} className="team-member" href={m.href} target="_blank" rel="noopener noreferrer">
                <span className="team-avatar">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.avatar} alt={m.name} loading="lazy" />
                </span>
                <span className="team-info">
                  <span className="team-name">
                    {m.name} {m.isYou && <span className="team-you">you</span>}
                  </span>
                  <span className="team-handle">{m.handle}</span>
                </span>
              </a>
            ))}
          </div>
        )}
        {showLinks && (
          <div className="project-links">
            {project.links?.github && (
              <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
                </svg>
                View repository
              </a>
            )}
            {project.links?.tryout && (
              <a href={project.links.tryout} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Try it live
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17 17 7" />
                  <path d="M8 7h9v9" />
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
