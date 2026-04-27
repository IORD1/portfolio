'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { selectedWork, sideQuests, type Project } from './projects/projects-data';
import { mainVisuals, miniVisuals, cardAnimClass } from './projects/visuals';

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
  const lofiAudioRef = useRef<HTMLAudioElement>(null);
  const metalAudioRef = useRef<HTMLAudioElement>(null);

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

    // Parallax on hero squircles + nav shrink
    const squircles = document.querySelectorAll<HTMLElement>(
      '.ambient .squircle'
    );
    const navEl = document.querySelector<HTMLElement>('.nav');
    let ticking = false;
    const SHRINK_AT = 80;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          squircles.forEach((s, i) => {
            const speed = 0.05 + i * 0.04;
            s.style.translate = `0 ${y * speed}px`;
          });
          if (navEl) {
            if (y > SHRINK_AT) navEl.classList.add('is-shrunk');
            else navEl.classList.remove('is-shrunk');
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

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

    // Ambient player — user spec: show & play after 60s
    const player = document.getElementById('player');
    const playBtn = document.getElementById('player-play');
    const nextBtn = document.getElementById('player-next');
    const loopBtn = document.getElementById('player-loop');
    const closeBtn = document.getElementById('player-close');
    const progressBar = player?.querySelector<HTMLElement>('.player-bar') ?? null;
    const progressFill = player?.querySelector<HTMLElement>('.player-bar-fill') ?? null;
    const lofiAudio = lofiAudioRef.current;
    const metalAudio = metalAudioRef.current;

    const currentAudio = () =>
      player?.classList.contains('is-metal') ? metalAudio : lofiAudio;
    const otherAudio = () =>
      player?.classList.contains('is-metal') ? lofiAudio : metalAudio;

    let minimizeTimer: ReturnType<typeof setTimeout> | null = null;
    let appearTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleMinimize = (delay = 3000) => {
      if (minimizeTimer) clearTimeout(minimizeTimer);
      minimizeTimer = setTimeout(() => {
        if (player && !player.matches(':hover')) {
          player.classList.add('is-minimized');
        }
      }, delay);
    };

    // Browsers block audio autoplay without user interaction — if play()
    // rejects, fall back to paused state so the play button is shown.
    const tryPlay = (audio: HTMLAudioElement | null) => {
      if (!audio) return;
      audio.play().catch(() => {
        player?.classList.add('is-paused');
      });
    };

    // Loop is on by default; both tracks loop indefinitely. When toggled off,
    // the `ended` handler advances to the other track instead.
    if (lofiAudio) lofiAudio.loop = true;
    if (metalAudio) metalAudio.loop = true;

    appearTimer = setTimeout(() => {
      if (!player) return;
      player.classList.add('is-visible');
      player.setAttribute('aria-hidden', 'false');
      scheduleMinimize(3500);
      tryPlay(lofiAudio);
    }, 60000);

    const onEnter = () => {
      if (minimizeTimer) clearTimeout(minimizeTimer);
    };
    const onLeave = () => scheduleMinimize(1500);
    player?.addEventListener('mouseenter', onEnter);
    player?.addEventListener('mouseleave', onLeave);

    const onPlay = () => {
      if (!player) return;
      const isPaused = player.classList.toggle('is-paused');
      const isMetal = player.classList.contains('is-metal');
      const current = isMetal ? metalAudio : lofiAudio;
      if (!current) return;
      if (isPaused) current.pause();
      else tryPlay(current);
    };
    playBtn?.addEventListener('click', onPlay);

    const onNext = () => {
      if (!player) return;
      player.classList.add('is-metal');
      player.classList.remove('is-paused');
      if (minimizeTimer) clearTimeout(minimizeTimer);
      if (lofiAudio) {
        lofiAudio.pause();
        lofiAudio.currentTime = 0;
      }
      if (progressFill) progressFill.style.width = '0%';
      tryPlay(metalAudio);
    };
    nextBtn?.addEventListener('click', onNext);

    const onClose = () => {
      if (!player) return;
      player.classList.remove('is-visible');
      player.setAttribute('aria-hidden', 'true');
      if (minimizeTimer) clearTimeout(minimizeTimer);
      lofiAudio?.pause();
      metalAudio?.pause();
    };
    closeBtn?.addEventListener('click', onClose);

    const onTimeUpdate = (e: Event) => {
      const audio = e.target as HTMLAudioElement;
      if (audio !== currentAudio() || !progressFill) return;
      const ratio = audio.duration ? Math.min(1, audio.currentTime / audio.duration) : 0;
      progressFill.style.width = `${ratio * 100}%`;
    };
    lofiAudio?.addEventListener('timeupdate', onTimeUpdate);
    metalAudio?.addEventListener('timeupdate', onTimeUpdate);

    const onBarClick = (e: MouseEvent) => {
      const audio = currentAudio();
      if (!progressBar || !audio || !audio.duration) return;
      const r = progressBar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      audio.currentTime = ratio * audio.duration;
    };
    progressBar?.addEventListener('click', onBarClick);

    const onLoopToggle = () => {
      if (!player) return;
      const turningOff = !player.classList.contains('is-no-loop');
      player.classList.toggle('is-no-loop', turningOff);
      const loopOn = !turningOff;
      if (lofiAudio) lofiAudio.loop = loopOn;
      if (metalAudio) metalAudio.loop = loopOn;
    };
    loopBtn?.addEventListener('click', onLoopToggle);

    // Fires only when loop=false. Advance to the other track and play.
    const onEnded = () => {
      if (!player) return;
      const goingToMetal = !player.classList.contains('is-metal');
      player.classList.toggle('is-metal', goingToMetal);
      player.classList.remove('is-paused');
      const finished = otherAudio();
      const next = currentAudio();
      if (finished) {
        finished.pause();
        finished.currentTime = 0;
      }
      if (next) {
        next.currentTime = 0;
        if (progressFill) progressFill.style.width = '0%';
        tryPlay(next);
      }
    };
    lofiAudio?.addEventListener('ended', onEnded);
    metalAudio?.addEventListener('ended', onEnded);

    return () => {
      io.disconnect();
      cardHandlers.forEach((handler, card) =>
        card.removeEventListener('mousemove', handler)
      );
      window.removeEventListener('scroll', onScroll);
      if (hs && hsScrollHandler) hs.removeEventListener('scroll', hsScrollHandler);
      if (hsResizeHandler) window.removeEventListener('resize', hsResizeHandler);
      hscrollBtnHandlers.forEach((handler, btn) =>
        btn.removeEventListener('click', handler)
      );
      player?.removeEventListener('mouseenter', onEnter);
      player?.removeEventListener('mouseleave', onLeave);
      playBtn?.removeEventListener('click', onPlay);
      nextBtn?.removeEventListener('click', onNext);
      loopBtn?.removeEventListener('click', onLoopToggle);
      closeBtn?.removeEventListener('click', onClose);
      progressBar?.removeEventListener('click', onBarClick);
      lofiAudio?.removeEventListener('timeupdate', onTimeUpdate);
      metalAudio?.removeEventListener('timeupdate', onTimeUpdate);
      lofiAudio?.removeEventListener('ended', onEnded);
      metalAudio?.removeEventListener('ended', onEnded);
      if (minimizeTimer) clearTimeout(minimizeTimer);
      if (appearTimer) clearTimeout(appearTimer);
    };
  }, []);

  return (
    <>
      <div className="grain" aria-hidden="true"></div>

      {/* NAV */}
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
      <header className="hero">
        <div className="ambient" aria-hidden="true">
          <div className="squircle s1"></div>
          <div className="squircle s2"></div>
          <div className="squircle s3"></div>
          <div className="squircle s4"></div>
        </div>
        <div className="wrap hero-inner reveal">
          <span className="status-chip">
            <span className="dot"></span>Available for interesting problems
          </span>
          <h1>
            Design. Architect. <span className="dim">Engineer.</span>
          </h1>
          <p className="hero-sub">
            Software engineer currently building the next big surety platform at SuretyNow. I build for the fun of building — fluent with AI agents as a daily tool, pairing, scaffolding, refactoring.
          </p>
          <div className="hero-meta">
            <span><strong>Pune, India</strong>IST / UTC +5:30</span>
            <span><strong>SuretyNow</strong>Software Engineer</span>
            <span><strong>B.E. CE, IIIT Pune</strong>SGPA 8.72</span>
            <span><strong>13+ projects</strong>Shipped &amp; scrappy</span>
          </div>
        </div>
      </header>

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

      {/* AMBIENT PLAYER */}
      <div id="player" className="player" aria-hidden="true">
        <div className="player-disc" aria-label="Now playing">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="player-art current" src="/lofi-cover.jpg" alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="player-art swap" src="/metal-cover.webp" alt="" />
          <div className="player-spindle"></div>
        </div>
        <div className="player-body">
          <div className="player-meta">
            <div className="player-label">Now playing</div>
            <div className="player-track current">Lofi Loft — endless beats</div>
            <div className="player-track swap">Death — The Sound of Perseverance</div>
            <div className="player-bar">
              <span className="player-bar-fill"></span>
            </div>
          </div>
          <div className="player-controls">
            <button className="player-btn" id="player-play" aria-label="Pause">
              <svg className="ico-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
              <svg className="ico-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 5v14l12-7z" />
              </svg>
            </button>
            <button className="player-btn player-loop" id="player-loop" aria-label="Toggle loop">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m17 2 4 4-4 4" />
                <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                <path d="m7 22-4-4 4-4" />
                <path d="M21 13v1a4 4 0 0 1-4 4H3" />
              </svg>
            </button>
            <button className="player-btn player-next" id="player-next" aria-label="Skip to real music">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M6 5v14l10-7zM17 5h2v14h-2z" />
              </svg>
            </button>
            <div className="player-next-tip" aria-hidden="true">
              I don&apos;t care about this soothing music, I want real music.
            </div>
          </div>
        </div>
        <button className="player-close" id="player-close" aria-label="Close player">×</button>
      </div>

      <audio ref={lofiAudioRef} src="/lofi.mp3" preload="none" />
      <audio ref={metalAudioRef} src="/metal.mp3" preload="none" />
    </>
  );
}
