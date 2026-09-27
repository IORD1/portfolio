'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { selectedWork, sideQuests, type Project } from './projects/projects-data';
import { mainVisuals, miniVisuals, cardAnimClass } from './projects/visuals';
import ThemeToggle from './theme-toggle';
import DeskPlant from './desk-plant';

function ProjectCard({ project }: { project: Project }) {
  const sizeClass = project.card.size ? ` ${project.card.size}` : '';
  const animClass = cardAnimClass[project.slug] ? ` ${cardAnimClass[project.slug]}` : '';
  const isWide = project.card.size === 'wide';
  const href = project.page ? `/projects/${project.slug}` : project.links?.github ?? '#';
  const external = !project.page && !!project.links?.github;

  const inner = (
    <>
      <div className="project-visual">{mainVisuals[project.slug]}</div>
      <div className="project-body">
        <div className="project-title-row">
          <div>
            <div className="project-title">{project.name}</div>
            {isWide && <p className="project-desc">{project.card.description}</p>}
          </div>
          <div className="project-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M7 17 17 7" />
              <path d="M8 7h9v9" />
            </svg>
          </div>
        </div>
        {!isWide && <p className="project-desc">{project.card.description}</p>}
        <div className="project-tags">
          {project.card.tags.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
      </div>
    </>
  );

  const className = `project-card${sizeClass}${animClass}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}

function MiniCard({ project }: { project: Project }) {
  const body = (
    <>
      <div className="mini-visual">{miniVisuals[project.slug]}</div>
      <div className="mini-body">
        <div className="mini-title">{project.name}</div>
        <p className="mini-desc">{project.card.description}</p>
        <div className="mini-tags">
          {project.card.tags.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
      </div>
    </>
  );

  if (project.page) {
    return (
      <Link href={`/projects/${project.slug}`} className="mini-card">
        {body}
      </Link>
    );
  }
  if (project.links?.github) {
    return (
      <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="mini-card">
        {body}
      </a>
    );
  }
  return <article className="mini-card">{body}</article>;
}

export default function Home() {

  useEffect(() => {
    // Scroll reveal
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document
      .querySelectorAll('.reveal, .reveal-stagger')
      .forEach((el) => io.observe(el));

    // Cursor-aware project cards (radial spotlight)
    const cards = document.querySelectorAll<HTMLElement>('.project-card');
    const cardHandlers = new Map<HTMLElement, (e: MouseEvent) => void>();
    cards.forEach((card) => {
      const handler = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      };
      card.addEventListener('mousemove', handler);
      cardHandlers.set(card, handler);
    });

    // Horizontal scroll buttons for Side quests
    const hs = document.getElementById('hscroll');
    const hscrollBtns = document.querySelectorAll<HTMLElement>('.hscroll-btn');
    const hscrollBtnHandlers = new Map<HTMLElement, () => void>();
    let hsScrollHandler: (() => void) | null = null;
    let hsResizeHandler: (() => void) | null = null;
    if (hs) {
      hscrollBtns.forEach((btn) => {
        const handler = () => {
          const dir = Number(btn.dataset.dir) || 1;
          hs.scrollBy({ left: dir * 320, behavior: 'smooth' });
        };
        btn.addEventListener('click', handler);
        hscrollBtnHandlers.set(btn, handler);
      });
      const wrap = hs.closest('.hscroll-wrap');
      const syncEdges = () => {
        if (!wrap) return;
        const hasOverflow = hs.scrollWidth - hs.clientWidth > 4;
        const atStart = hs.scrollLeft <= 48;
        const atEnd = hs.scrollLeft + hs.clientWidth >= hs.scrollWidth - 4;
        wrap.classList.toggle('has-scrolled', !atStart);
        wrap.classList.toggle('has-overflow', hasOverflow && !atEnd);
      };
      hsScrollHandler = syncEdges;
      hsResizeHandler = syncEdges;
      hs.addEventListener('scroll', syncEdges, { passive: true });
      window.addEventListener('resize', syncEdges);
      requestAnimationFrame(() => {
        hs.scrollLeft = 0;
        syncEdges();
      });
    }

    return () => {
      io.disconnect();
      cardHandlers.forEach((handler, card) =>
        card.removeEventListener('mousemove', handler)
      );
      if (hs && hsScrollHandler) hs.removeEventListener('scroll', hsScrollHandler);
      if (hsResizeHandler) window.removeEventListener('resize', hsResizeHandler);
      hscrollBtnHandlers.forEach((handler, btn) =>
        btn.removeEventListener('click', handler)
      );
    };
  }, []);

  return (
    <>

      {/* NAV + HERO: together fill the first viewport */}
      <div className="fold">
      <nav className="nav">
        <Link href="/" className="nav-name" aria-label="Prathmesh Ingole">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/name-logo.svg" alt="Prathmesh Ingole" className="nav-logo-full" />
          <span className="nav-logo-mini" aria-hidden="true">π</span>
        </Link>
        <div className="nav-links">
          <a href="#work">Projects</a>
          <a href="#stack">Toolbox</a>
          <a href="#journey">Quest log</a>
        </div>
        <div className="nav-cta">
          <ThemeToggle />
          <a href="/Prathmesh_Ingole_Resume.pdf" className="btn btn-ghost" download>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            Resume
          </a>
          <a href="mailto:pratham111ingole@gmail.com" className="btn btn-primary">
            Email me
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17 17 7" />
              <path d="M8 7h9v9" />
            </svg>
          </a>
        </div>
      </nav>

      {/* HERO */}
      <div className="desk">
        <div className="desk-glow" aria-hidden="true"></div>
        <header className="hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/desk/cutting-mat.svg" alt="" className="mat" draggable={false} />
          <div className="hero-inner"></div>
        </header>
        <DeskPlant />
        {/* Placeholder until the lamp render is ready: public/desk/lamp.png */}
        <div className="desk-obj desk-lamp" aria-hidden="true">lamp.png</div>
        {/* Sun through a window off to the left: frame shadows and foliage drifting over the desk */}
        <div className="desk-sun" aria-hidden="true">
          <div className="desk-sun-window"><div className="desk-sun-panes"></div></div>
          <div className="desk-sun-leaves"></div>
        </div>
      </div>
      </div>

      {/* WORK / PROJECTS */}
      <section id="work">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <div className="label">Selected work</div>
              <h2>Six projects I keep coming back to.</h2>
            </div>
            <p className="desc">A mix of ML, real-time systems, developer tools and scrappy weekend builds. Click any to read the full story.</p>
          </div>

          <div className="projects reveal-stagger">
            {selectedWork.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>

          <a
            href="https://github.com/IORD1?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="view-all reveal"
          >
            See all 13 projects on GitHub
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M7 17 17 7" />
              <path d="M8 7h9v9" />
            </svg>
          </a>
        </div>
      </section>

      {/* MORE PROJECTS — horizontal scroll */}
      <section id="more-work">
        <div className="wrap more-head reveal">
          <div>
            <div className="label">Side quests</div>
            <h2>Seven more I loved building.</h2>
          </div>
          <p className="desc">Weekend builds, hackathon wins, experiments. Drag or scroll horizontally.</p>
        </div>

        <div className="hscroll-wrap reveal">
          <div className="hscroll" id="hscroll">
            {sideQuests.map((p) => (
              <MiniCard key={p.slug} project={p} />
            ))}
          </div>

          <div className="hscroll-edge left" aria-hidden="true"></div>
          <div className="hscroll-edge right" aria-hidden="true"></div>

          <div className="hscroll-controls">
            <button className="hscroll-btn" data-dir="-1" aria-label="Scroll left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="hscroll-btn" data-dir="1" aria-label="Scroll right">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* STACK */}
      <section id="stack">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <div className="label">What I&apos;ve worked on</div>
              <h2>Tools I reach for. Problems I&apos;ve shipped.</h2>
            </div>
            <p className="desc">Comfortable across the stack — from C++ systems to React UIs to Python ML notebooks.</p>
          </div>

          <div className="highlight-row reveal-stagger">
            <div className="highlight-card">
              <div className="icon-sq">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4" />
                  <path d="m16.2 7.8 2.9-2.9" />
                  <path d="M18 12h4" />
                  <path d="m16.2 16.2 2.9 2.9" />
                  <path d="M12 18v4" />
                  <path d="m4.9 19.1 2.9-2.9" />
                  <path d="M2 12h4" />
                  <path d="m4.9 4.9 2.9 2.9" />
                </svg>
              </div>
              <h3>AI agents as a daily driver</h3>
              <p>
                I treat AI agents the way most engineers treat their editor — constantly, intentionally, as a lever on what&apos;s possible. Scaffolding, refactoring, debugging, research. It&apos;s not a toy: it&apos;s how I ship faster and chase bigger ideas.
              </p>
            </div>
            <div className="highlight-card">
              <div className="icon-sq">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2 3 7v10l9 5 9-5V7l-9-5z" />
                  <path d="M3.3 7 12 12l8.7-5" />
                  <path d="M12 22V12" />
                </svg>
              </div>
              <h3>For the fun of building</h3>
              <p>
                Thirteen shipped side-projects is the map of my curiosity. Anime trackers, IoT traffic lights, a crypto chat app, a sort benchmarking suite. If it sounds fun to build, I&apos;ll build it this weekend.
              </p>
            </div>
          </div>

          <div className="skills-grid reveal-stagger" style={{ marginTop: 14 }}>
            <div className="skill-card">
              <h3>
                <span className="tile">{'{ }'}</span>Languages
              </h3>
              <ul>
                <li>Python</li>
                <li>C++</li>
                <li>JavaScript</li>
                <li>TypeScript</li>
                <li>C#</li>
                <li>SQL</li>
              </ul>
            </div>
            <div className="skill-card">
              <h3>
                <span className="tile">◇</span>Frameworks
              </h3>
              <ul>
                <li>React</li>
                <li>Next.js</li>
                <li>React Native</li>
                <li>Node</li>
                <li>Express</li>
                <li>Flask</li>
                <li>Expo</li>
              </ul>
            </div>
            <div className="skill-card">
              <h3>
                <span className="tile">◉</span>Data &amp; ML
              </h3>
              <ul>
                <li>Pandas</li>
                <li>SVM</li>
                <li>Gradient Boost</li>
                <li>Plotly</li>
                <li>PowerBI</li>
                <li>NLP</li>
              </ul>
            </div>
            <div className="skill-card">
              <h3>
                <span className="tile">⌘</span>Infra
              </h3>
              <ul>
                <li>Firebase</li>
                <li>MongoDB</li>
                <li>Docker</li>
                <li>GCP</li>
                <li>Postman</li>
                <li>Linux</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* JOURNEY */}
      <section id="journey">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <div className="label">Quest log</div>
              <h2>From IIIT Pune to building surety tech.</h2>
            </div>
            <p className="desc">The path so far — in reverse chronological order.</p>
          </div>

          <div className="journey reveal-stagger">
            <div className="journey-row">
              <div className="journey-year">2024 — Now</div>
              <div>
                <div className="journey-title">Software Engineer, SuretyNow</div>
                <div className="journey-sub">Building the next big surety platform. Full-stack, AI-accelerated, always shipping.</div>
              </div>
              <div className="journey-tag">Current</div>
            </div>

            <div className="journey-row">
              <div className="journey-year">2023</div>
              <div>
                <div className="journey-title">SEO &amp; Web Intern, IOFT</div>
                <div className="journey-sub">Built out the Institute of Futuristic Technologies site. SEO, 3D-on-the-web, sitemaps.</div>
              </div>
              <div className="journey-tag">Internship</div>
            </div>

            <div className="journey-row">
              <div className="journey-year">2021 — 2024</div>
              <div>
                <div className="journey-title">B.E. Computer Engineering, IIIT Pune</div>
                <div className="journey-sub">SGPA 8.72. Won &quot;Best GUI&quot; at CONVENE 2k24. CESA Web Master. Hackathon repeat-winner.</div>
              </div>
              <div className="journey-tag">Degree</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="footer-top reveal">
            <h2>
              Got something<br />worth <span className="dim">building?</span>
            </h2>
            <div className="footer-cta">
              <a href="mailto:pratham111ingole@gmail.com" className="email-link">
                pratham111ingole@gmail.com
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M7 17 17 7" />
                  <path d="M8 7h9v9" />
                </svg>
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <div>© 2026 Prathmesh Ingole — Pune, IN</div>
            <div className="socials">
              <a href="https://github.com/IORD1" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
                </svg>
                GitHub
              </a>
              <a href="https://linkedin.com/in/prathmeshingole" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5V8h3v11zM6.5 6.7a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5zM19 19h-3v-5.5c0-1.4-.5-2.3-1.7-2.3-1 0-1.5.6-1.8 1.3v6.5h-3V8h2.9v1.3c.4-.6 1.2-1.5 2.8-1.5 2.1 0 3.8 1.3 3.8 4.2V19z" />
                </svg>
                LinkedIn
              </a>
              <a href="https://leetcode.com/u/prathmeshingole" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.5 2.2a1 1 0 0 1 1.4 0l2.1 2.1a1 1 0 0 1-1.4 1.4l-2.1-2.1a1 1 0 0 1 0-1.4zM10 7.6 4.6 13a4.8 4.8 0 0 0 0 6.8l1.8 1.8a4.8 4.8 0 0 0 6.8 0l5.4-5.4a1 1 0 0 0-1.4-1.4l-5.4 5.4a2.8 2.8 0 0 1-4 0L6 18.4a2.8 2.8 0 0 1 0-4L11.4 9a2.8 2.8 0 0 1 4 0l1.7 1.8a1 1 0 0 0 1.4-1.4L16.9 7.6a4.8 4.8 0 0 0-6.8 0zM13 14h7a1 1 0 1 1 0 2h-7a1 1 0 1 1 0-2z" />
                </svg>
                LeetCode
              </a>
            </div>
          </div>
        </div>
      </footer>

    </>
  );
}
