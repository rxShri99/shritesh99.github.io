'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type TouchEvent,
} from 'react';
import './deck.css';

interface SlideDef {
  className?: string;
  content: ReactNode;
}

const slides: SlideDef[] = [
  // 1 — Title
  {
    content: (
      <>
        <p className="eyebrow">Flower Monthly · 2 September 2026</p>
        <h1>Pollen&nbsp;Mesh</h1>
        <p className="big">
          A bee carrying pollen between flowers that never touch.
        </p>
        <p className="wide">
          Companies hit by the same attacker find each other, without any of
          them handing over a log line.
        </p>
      </>
    ),
  },

  // 2 — About us
  {
    className: 'center',
    content: (
      <>
        <h2 className="middle">About us</h2>
        <div className="aboutgrid">
          <div className="bios">
            <div className="bio">
              <h3>Tanveer Singh</h3>
              <ul>
                <li>
                  Building <span className="at">LegacyLift</span>
                </li>
                <li>Full-stack developer</li>
              </ul>
            </div>
            <div className="bio">
              <h3>Shritesh Jamulkar</h3>
              <ul>
                <li>
                  Software Engineer <span className="at">@Booking.com</span>
                </li>
                <li>Full-stack developer</li>
              </ul>
            </div>
          </div>
          <figure className="photo">
            <img
              src="/slides/pollen-mesh/pic.jpg"
              alt="Shritesh Jamulkar and Tanveer Singh beside the Collaborative Agent Hackathon banner in Cambridge."
            />
          </figure>
        </div>
      </>
    ),
  },

  // 3 — The problem
  {
    content: (
      <>
        <p className="eyebrow">The problem</p>
        <h2>
          Each team sees a fragment.
          <br />
          Together, the fragments are the attack.
        </h2>
        <div className="cols c3">
          <div className="card">
            <span className="tag">Company A</span>
            <p>
              One Word document spawning an encoded PowerShell child. Odd.
              Probably nothing.
            </p>
          </div>
          <div className="card">
            <span className="tag">Company B</span>
            <p>
              An outbound connection to a domain nobody recognises. Odd.
              Probably nothing.
            </p>
          </div>
          <div className="card">
            <span className="tag">Company C</span>
            <p>The same domain, four hours later. Odd. Probably nothing.</p>
          </div>
        </div>
        <p className="wide">
          Raw logs cannot leave the perimeter, so nobody compares notes. The
          mechanism that exists (MISP, ISACs) works, but by hand, over days.{' '}
          <em className="cross">Attacks spread in hours.</em>
        </p>
      </>
    ),
  },

  // 4 — The idea
  {
    content: (
      <>
        <p className="eyebrow">The idea</p>
        <h2 style={{ maxWidth: '22ch' }}>
          Share the fingerprint of the threat, never the evidence.
        </h2>
        <p
          className="big"
          style={{ maxWidth: '44ch', color: 'var(--fg-muted)' }}
        >
          Three companies keep their logs to themselves and still catch the
          attack hitting all three, and a human says yes before anything
          moves.
        </p>
      </>
    ),
  },

  // 5 — Prior art
  {
    content: (
      <>
        <p className="eyebrow">Has anyone done this?</p>
        <h2>Close, but not this.</h2>
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '24%' }}>Approach</th>
                <th style={{ width: '38%' }}>What it does</th>
                <th>Where it stops</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="who">MISP / ISACs</td>
                <td>Manual indicator sharing between organisations</td>
                <td className="gap">No agents. Days, not hours.</td>
              </tr>
              <tr>
                <td className="who">Federated ML for IDS</td>
                <td>Shares model weights, not traffic</td>
                <td className="gap">
                  No LLM reasoning, no human gate, batch not live.
                </td>
              </tr>
              <tr>
                <td className="who">Commercial AI SOC</td>
                <td>
                  Deep single-org analysis: Copilot, CrowdStrike, XSIAM
                </td>
                <td className="gap">No cross-company view at all.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="wide">
          <span className="kicker">
            Local LLM reasoning + cross-org correlation with no raw data +
            two human gates.
          </span>{' '}
          That combination didn&apos;t turn up.
        </p>
      </>
    ),
  },

  // 6 — Architecture
  {
    content: (
      <>
        <p className="eyebrow">Architecture</p>
        <h2>One HTTP POST is the entire boundary crossing.</h2>
        <div className="boundary">
          <span className="tag">Inside each organisation. Never leaves</span>
          <div className="pipe">
            <div className="node sealed">
              <span className="tag">1</span>
              <b>Own log only</b>
              <small>JSONL, EDR export, or the live Windows Event Log</small>
            </div>
            <span className="arrow">→</span>
            <div className="node sealed">
              <span className="tag">2</span>
              <b>LLM triage</b>
              <small>
                Is this worth escalating? Reason first, verdict second.
              </small>
            </div>
            <span className="arrow">→</span>
            <div className="node sealed">
              <span className="tag">3</span>
              <b>Extract + hash</b>
              <small>In code, not by the model. Keyed HMAC.</small>
            </div>
          </div>
        </div>
        <div className="wire" aria-hidden="true"></div>
        <div className="pipe">
          <div className="node">
            <span className="tag">4</span>
            <b>Correlator</b>
            <small>
              FastAPI. No model. Matches on equal hash, or technique +
              overlapping window.
            </small>
          </div>
          <span className="arrow">→</span>
          <div className="node gate">
            <span className="tag">5</span>
            <b>Gate 1: disclose</b>
            <small>A human sees the exact payload and approves it.</small>
          </div>
          <span className="arrow">→</span>
          <div className="node gate">
            <span className="tag">6</span>
            <b>Gate 2: act</b>
            <small>Each organisation approves its own follow-up.</small>
          </div>
        </div>
      </>
    ),
  },

  // 7 — The signature
  {
    content: (
      <>
        <p className="eyebrow">The signature</p>
        <h2>The one shape that crosses the boundary.</h2>
        <pre>
          <span className="cm">
            # the complete outbound payload. there is nothing else
          </span>
          {'\n{\n  '}
          <span className="k">&quot;org_id&quot;</span>:       <span className="s">&quot;acme-corp&quot;</span>,
          {'\n  '}
          <span className="k">&quot;technique&quot;</span>:    <span className="s">&quot;T1059.001&quot;</span>,        <span className="cm"># MITRE ATT&amp;CK, regex-validated</span>
          {'\n  '}
          <span className="k">&quot;indicator&quot;</span>:    <span className="s">&quot;12f23ed9d97811dd&quot;</span>, <span className="cm"># keyed HMAC, never a raw domain</span>
          {'\n  '}
          <span className="k">&quot;window_start&quot;</span>: <span className="s">&quot;2026-08-26T09:14:02Z&quot;</span>,
          {'\n  '}
          <span className="k">&quot;window_end&quot;</span>:   <span className="s">&quot;2026-08-26T09:14:55Z&quot;</span>,
          {'\n  '}
          <span className="k">&quot;confidence&quot;</span>:   <span className="s">0.9</span>
          {'\n}'}
        </pre>
        <p className="wide">
          No log lines. No hostnames, usernames, IP addresses or file names.
          Same infrastructure → same hash, every time, because the indicator
          is extracted <em className="hl">in code</em>, where the model
          can&apos;t refuse it or drift.
        </p>
      </>
    ),
  },

  // 8 — What we got wrong first
  {
    content: (
      <>
        <p className="eyebrow">What we got wrong first</p>
        <h2>We broke our own hash.</h2>
        <div className="cols c2" style={{ alignItems: 'start' }}>
          <div className="card cross">
            <span className="tag">Version one</span>
            <p
              className="mono strike"
              style={{
                fontSize: 'clamp(.85rem, 1.4vw, 1.15rem)',
                maxWidth: 'none',
              }}
            >
              sha256(domain)
            </p>
            <p>
              Domains are a small, enumerable space. The value we published
              in our own README fell in{' '}
              <b style={{ color: 'var(--crossed)' }}>121 guesses</b> from an
              18-word list.
            </p>
          </div>
          <div className="card local">
            <span className="tag">Version two</span>
            <p
              className="mono"
              style={{
                fontSize: 'clamp(.85rem, 1.4vw, 1.15rem)',
                color: 'var(--local)',
                maxWidth: 'none',
              }}
            >
              HMAC(key, domain)
            </p>
            <p>
              Members hold the key.{' '}
              <b>The correlator never receives it.</b> Equal indicators still
              produce equal values, so matching is unchanged.
            </p>
          </div>
        </div>
        <p className="wide">
          <span className="kicker">
            The correlator can tell that two organisations saw the same
            indicator without being able to tell what that indicator was.
          </span>{' '}
          The break is still in the repo, with the test that stops us
          regressing.
        </p>
      </>
    ),
  },

  // 9 — Flower Agent, honestly
  {
    content: (
      <>
        <p className="eyebrow">Flower Agent, honestly</p>
        <h2>What the framework gave us, and what we built on top.</h2>
        <div className="cols c3" style={{ alignItems: 'start' }}>
          <div className="card local">
            <span className="tag">Flower gives you</span>
            <ul>
              <li>
                <b>AgentApp</b> and <code className="mono">@app.main()</code>
              </li>
              <li>Model calls routed through the SuperLink</li>
              <li>
                Persistent <code className="mono">context.state</code>, local
                only
              </li>
              <li>Runs on SuperGrid or a local SuperLink</li>
            </ul>
          </div>
          <div className="card">
            <span className="tag">We built</span>
            <ul>
              <li>Cross-org correlation and its state machine</li>
              <li>The keyed-hash privacy safeguard</li>
              <li>Both approval gates</li>
              <li>Real log ingestion, including the Windows Event Log</li>
            </ul>
          </div>
          <div className="card hold">
            <span className="tag">We deliberately did not build</span>
            <ul>
              <li>
                <b>Any agent-to-agent channel.</b>
              </li>
              <li>Flower offers none, and we added none.</li>
              <li>
                That absence <em className="hold">is</em> the privacy
                property. There is no messaging layer to abuse, audit or
                trust.
              </li>
            </ul>
          </div>
        </div>
        <p className="wide">
          Two organisations discover a shared attacker{' '}
          <em className="hl">without exchanging a single message</em>. They
          independently compute the same value, and a third party notices
          the values are equal.
        </p>
      </>
    ),
  },

  // 10 — Two gates
  {
    content: (
      <>
        <p className="eyebrow">Two gates</p>
        <h2>Remove the gates and there is no defensible product left.</h2>
        <div className="cols c2">
          <div className="card hold">
            <span className="tag">Gate 1: disclosure</span>
            <p>
              A human sees the <b>exact payload</b> before it crosses a
              boundary. Not a summary of it. All of it. Rejection is
              terminal.
            </p>
          </div>
          <div className="card hold">
            <span className="tag">Gate 2: action</span>
            <p>
              Each organisation approves its own follow-up{' '}
              <b>separately</b>. One declining does not undo another&apos;s
              decision.
            </p>
          </div>
        </div>
        <div className="pipe" style={{ alignItems: 'center' }}>
          <div className="node gate" style={{ flex: '0 1 auto' }}>
            <b>pending</b>
          </div>
          <span className="arrow">→</span>
          <div
            className="node"
            style={{
              flex: '0 1 auto',
              borderColor:
                'color-mix(in srgb, var(--crossed) 45%, transparent)',
            }}
          >
            <b>approved</b>
          </div>
          <span className="arrow">→</span>
          <div
            className="node"
            style={{
              flex: '0 1 auto',
              borderColor:
                'color-mix(in srgb, var(--local) 45%, transparent)',
            }}
          >
            <b>resolved</b>
          </div>
          <span className="arrow" style={{ opacity: 0.5 }}>
            &nbsp;&nbsp;or&nbsp;&nbsp;
          </span>
          <div className="node" style={{ flex: '0 1 auto' }}>
            <b style={{ color: 'var(--fg-subtle)' }}>rejected</b>
          </div>
        </div>
        <p className="wide">
          No code path discloses or acts on its own. Correlation is
          deterministic, so every match is reproducible and explainable to
          the person being asked to approve it.
        </p>
      </>
    ),
  },

  // 11 — What it does not solve
  {
    content: (
      <>
        <p className="eyebrow">What it does not solve</p>
        <h2>The limits, stated plainly.</h2>
        <div className="cols c2" style={{ alignItems: 'start' }}>
          <div className="card">
            <span className="tag">A malicious member</span>
            <p>
              They hold the key, so they can enumerate and reverse any value
              they see. HMAC stops outsiders, not insiders. Private set
              intersection is the honest next step, and we have not built it.
            </p>
          </div>
          <div className="card">
            <span className="tag">Metadata at the correlator</span>
            <p>
              Even unable to read indicators, it learns who correlates with
              whom, how often, and under which technique labels. That is a
              real relationship graph.
            </p>
          </div>
          <div className="card">
            <span className="tag">Fuzzy infrastructure</span>
            <p>
              Subdomain variation matches, because we collapse to the
              registrable domain. Typosquats and TLD rotation do not:
              different registrations, different values.
            </p>
          </div>
          <div className="card">
            <span className="tag">&ldquo;Locally&rdquo; has a limit</span>
            <p>
              No other organisation sees your telemetry. But triage sends
              each line to whatever endpoint your SuperLink points at.
              Inside your trust boundary, not on-device.
            </p>
          </div>
        </div>
      </>
    ),
  },

  // // 12 — Switching to the live system
  // {
  //   content: (
  //     <>
  //       <p className="eyebrow">Switching to the live system</p>
  //       <h2>Five things to watch for.</h2>
  //       <div className="pipe">
  //         <div className="node sealed">
  //           <span className="tag">1</span>
  //           <b>An attack lands</b>
  //           <small>
  //             Real events written into two organisations&apos; own log files.
  //           </small>
  //         </div>
  //         <div className="node sealed">
  //           <span className="tag">2</span>
  //           <b>Each reasons alone</b>
  //           <small>
  //             Watch what it throws away, not only what it keeps.
  //           </small>
  //         </div>
  //         <div className="node">
  //           <span className="tag">3</span>
  //           <b>The same value, twice</b>
  //           <small>Computed independently, never exchanged.</small>
  //         </div>
  //         <div className="node gate">
  //           <span className="tag">4</span>
  //           <b>Two gates</b>
  //           <small>
  //             A human approves the exact payload, then each org approves
  //             acting.
  //           </small>
  //         </div>
  //         <div className="node">
  //           <span className="tag">5</span>
  //           <b>A control that finds nothing</b>
  //           <small>One org, no match. It declines to invent a link.</small>
  //         </div>
  //       </div>
  //       <p className="wide">
  //         Nothing on the screen is pre-staged: launching writes real events
  //         into each organisation&apos;s own log file, and every agent has to
  //         find it in its own telemetry.
  //       </p>
  //     </>
  //   ),
  // },

  // 13 — In summary
  {
    content: (
      <>
        <p className="eyebrow">In summary</p>
        <h1 style={{ fontSize: 'clamp(1.9rem, 5vw, 4rem)', maxWidth: '19ch' }}>
          Three private log files. One shared attack, caught.
        </h1>
        <p className="big" style={{ maxWidth: '40ch' }}>
          And a human said yes twice before anything moved.
        </p>
        <div className="cols c3" style={{ maxWidth: '940px' }}>
          <div className="card stat">
            <b>0</b>
            <span>log lines shared, by construction</span>
          </div>
          <div className="card stat">
            <b>1</b>
            <span>outbound call per agent, ever</span>
          </div>
          <div className="card stat">
            <b>2</b>
            <span>human approvals before anything crosses</span>
          </div>
        </div>
        <p
          className="mono"
          style={{
            fontSize: 'clamp(.85rem, 1.4vw, 1.15rem)',
            color: 'var(--local)',
            maxWidth: 'none',
          }}
        >
          <a href="https://github.com/tanveerxz/pollen-mesh">
            github.com/tanveerxz/pollen-mesh
          </a>
        </p>
      </>
    ),
  },

  // 14 — Demo
  {
    className: 'center',
    content: (
      <>
        <p className="eyebrow">Demo</p>
        <h1>See this in action</h1>
        <p className="big" style={{ maxWidth: '50ch' }}>
          Live attack → local triage → hash match → two gates → resolved.
        </p>
      </>
    ),
  },

  // 15 — Thank you
  {
    className: 'center',
    content: (
      <>
        <p className="eyebrow">Thank you</p>
        <h1>Thank you.</h1>
        <p className="big" style={{ maxWidth: '32ch' }}>
          Any questions?
        </p>
        <p
          className="mono"
          style={{
            fontSize: 'clamp(.85rem, 1.4vw, 1.15rem)',
            color: 'var(--local)',
            maxWidth: 'none',
          }}
        >
          <a href="https://github.com/tanveerxz/pollen-mesh">
            github.com/tanveerxz/pollen-mesh
          </a>
        </p>
      </>
    ),
  },
];

export default function PollenMeshDeck() {
  const [i, setI] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback((n: number) => {
    setI(Math.max(0, Math.min(n, slides.length - 1)));
  }, []);

  // Keyboard nav: arrows, PgUp/PgDn, space, digits, Home, End.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setI((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setI((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Home') {
        setI(0);
      } else if (e.key === 'End') {
        setI(slides.length - 1);
      } else if (/^[1-9]$/.test(e.key)) {
        setI(Math.min(slides.length - 1, parseInt(e.key, 10) - 1));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Deep-link on first mount if there's a #sN hash.
  useEffect(() => {
    const m = /^#s(\d+)$/.exec(window.location.hash);
    if (m) go(parseInt(m[1], 10) - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect current slide in the URL hash so back/forward and copy-paste work.
  useEffect(() => {
    try {
      window.location.hash = `s${i + 1}`;
    } catch {
      // ignore — some embedders block hash writes
    }
  }, [i]);

  // Click the right half to advance, left half to go back, but never when the
  // click was a text selection or a link.
  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('a')) return;
    if (String(window.getSelection())) return;
    setI((prev) =>
      e.clientX > window.innerWidth / 2
        ? Math.min(prev + 1, slides.length - 1)
        : Math.max(prev - 1, 0),
    );
  };

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 55) {
      setI((prev) =>
        dx < 0
          ? Math.min(prev + 1, slides.length - 1)
          : Math.max(prev - 1, 0),
      );
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="pm-deck"
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="bar"
        style={{ width: `${((i + 1) / slides.length) * 100}%` }}
      />
      <div className="brandmark">
        <svg
          className="dotmark"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="6" cy="9" r="2.6" fill="#6fae84" />
          <circle cx="12" cy="16" r="2.6" fill="#e0973a" />
          <circle cx="18" cy="7" r="2.6" fill="#d08072" />
        </svg>
        <span>Pollen Mesh</span>
      </div>
      <div className="hud">
        <span>
          {i + 1} / {slides.length}
        </span>
        <span>
          <kbd>←</kbd>
          <kbd>→</kbd> move
        </span>
      </div>
      <div className="deck">
        {slides.map(({ className, content }, n) => (
          <section
            key={n}
            className={`slide${className ? ` ${className}` : ''}${
              n === i ? ' on' : ''
            }`}
          >
            {content}
          </section>
        ))}
      </div>
    </div>
  );
}
