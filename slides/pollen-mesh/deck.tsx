'use client';

import 'reveal.js/theme/dracula.css';
import { Deck, Slide, Code, Markdown } from '@revealjs/react';
import RevealHighlight from 'reveal.js/plugin/highlight';
import RevealNotes from 'reveal.js/plugin/notes';
import RevealMarkdown from 'reveal.js/plugin/markdown';
import MarkdownInline from '@/components/slides/MarkdownInline';

const config = {
  hash: true,
  controls: true,
  controlsTutorial: true,
  controlsLayout: 'bottom-right',
  controlsBackArrows: 'faded',
  progress: true,
  transition: 'slide',
  backgroundTransition: 'fade',
  touch: false,
  navigationMode: 'grid',
  center: false,
} as const;

const plugins = [RevealHighlight, RevealNotes, RevealMarkdown];

export default function PollenMeshDeck() {
  return (
    <Deck config={config} plugins={plugins} className="reveal-deck-root">
      <Slide className="center">
        <h1>Pollen Mesh</h1>
        <p style={{ fontSize: '0.55em', opacity: 0.75, marginTop: '0.6em' }}>
          A bee carrying pollen between flowers that never touch.
        </p>
        <p style={{ fontSize: '0.4em', opacity: 0.5, marginTop: '2em' }}>
          Flower Monthly · September 2, 2026
        </p>
      </Slide>

      <Slide>
        <h2>About Us</h2>
        <div className="r-hstack justify-between">
          <div className="r-vstack" style={{ fontSize: '0.7em', alignItems: 'flex-start' }}>
            <h3 >Shritesh Jamulkar</h3>
            <ul>
              <li>Software Engineer @Booking.com</li>
              <li>Full Stack Developer</li>
            </ul>
            <h3>Tanveer Singh</h3>
            <ul>
              <li>(Prev.) Software Engineer Intern @Kloak Ltd.</li>
              <li>Full Stack Developer</li>
            </ul>
          </div>
          <img
            src="/slides/pollen-mesh/pic.jpg"
            alt="My Photo"
            width={357}
            height={500}
            style={{
              objectFit: 'cover',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
            }}
          />
        </div>
      </Slide>

      <Slide className="center">
        <h2>The Problem</h2>
        <p style={{ fontSize: '0.7em', maxWidth: '80%', margin: '1em auto' }}>
          A coordinated attack hits three companies at once. Each SOC sees a
          fragment. Together the fragments are the attack.
        </p>
        <p style={{ fontSize: '0.55em', opacity: 0.6, maxWidth: '75%', margin: '1em auto' }}>
          Raw logs can&apos;t leave the perimeter. MISP works — by hand, over
          days. Attacks spread in hours.
        </p>
      </Slide>

      <Slide className="center">
        <h2>The Idea</h2>
        <p style={{ fontSize: '0.6em', maxWidth: '80%', margin: '1.5em auto', lineHeight: 1.6 }}>
          Three companies keep their logs to themselves, but still catch the
          attack hitting all three — because their agents share the{' '}
          <em>fingerprint</em> of the threat, never the evidence, and a human
          has to say yes before anything moves.
        </p>
      </Slide>

      <Slide>
        <h2>Has anyone done this?</h2>
        <table style={{ fontSize: '0.55em', width: '100%' }}>
          <thead>
            <tr>
              <th></th>
              <th>What they do</th>
              <th>Gap</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>MISP / ISACs</td>
              <td>Manual indicator sharing between orgs</td>
              <td>No agents. Days, not hours.</td>
            </tr>
            <tr>
              <td>Federated ML for IDS</td>
              <td>Share model weights, not traffic</td>
              <td>No LLM. No human gate. Batch, not live.</td>
            </tr>
            <tr>
              <td>Commercial AI SOC</td>
              <td>Copilot, CrowdStrike, XSIAM…</td>
              <td>Single-org. No cross-company view.</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: '0.45em', opacity: 0.55, marginTop: '1.2em' }}>
          Local LLM reasoning + no-raw-data cross-org correlation + dual human
          gates — that combination didn&apos;t turn up.
        </p>
      </Slide>

      <Slide>
        <h2>Architecture</h2>
        <MarkdownInline src="/slides/pollen-mesh/arch.md" />
        <p style={{ fontSize: '0.4em', opacity: 0.55, marginTop: '0.4em' }}>
          The only thing that ever crosses a boundary is one HTTP POST of one
          signature.
        </p>
      </Slide>

      <Slide>
        <h2>The Signature</h2>
        <p style={{ fontSize: '0.55em', opacity: 0.7 }}>
          The one shape that crosses the boundary.
        </p>
        <Code language="python">
          {`SignatureV1 = {
    "technique":    str,    # MITRE ATT&CK technique id
    "indicator":    str,    # one-way hash, never a raw IP/domain
    "window_start": str,    # ISO 8601
    "window_end":   str,
    "confidence":   float,  # 0..1
}`}
        </Code>
        <p style={{ fontSize: '0.45em', opacity: 0.55, marginTop: '0.8em' }}>
          Same infrastructure → same hash, every time. Extracted in code —
          the model can&apos;t refuse or drift.
        </p>
      </Slide>

      <Slide>
        <h2>Flower Agent, honestly</h2>
        <div className="r-hstack justify-between items-start" style={{ fontSize: '0.55em', textAlign: 'left' }}>
          <div className="r-vstack" style={{ flex: 1 }}>
            <h4>What it gives you</h4>
            <ul>
              <li><code>AgentApp</code> + <code>@app.main()</code></li>
              <li>Bounded tool loop, model calls</li>
              <li>Persistent <code>context.state</code></li>
              <li>Runs on SuperGrid or locally</li>
            </ul>
          </div>
          <div className="r-vstack" style={{ flex: 1 }}>
            <h4>What you still build</h4>
            <ul>
              <li>Agent-to-agent messaging</li>
              <li>Cross-org state &amp; correlation</li>
              <li>The privacy safeguard</li>
              <li>The approval gates</li>
            </ul>
          </div>
        </div>
        <p style={{ fontSize: '0.45em', opacity: 0.55, marginTop: '1em' }}>
          Flower gives you a strong <em>single-agent</em> building block. The
          mesh is plumbing we built.
        </p>
      </Slide>

      <Slide>
        <h2>Two Gates. The Product.</h2>
        <div style={{ fontSize: '0.6em', textAlign: 'left', maxWidth: '85%', margin: '0 auto' }}>
          <p><strong>Gate 1</strong> — a human sees the exact payload before disclosure.</p>
          <p><strong>Gate 2</strong> — each org independently approves local action.</p>
        </div>
        <Code language="text">
          {`pending → approved → resolved
   or
pending → rejected`}
        </Code>
        <p style={{ fontSize: '0.45em', opacity: 0.55, marginTop: '0.6em' }}>
          Remove the gates and there&apos;s no defensible product left.
        </p>
      </Slide>

      <Slide className="center">
        <h1>Demo</h1>
        <p style={{ fontSize: '0.55em', opacity: 0.6, marginTop: '1em' }}>
          Live attack → local triage → hash match → two gates → resolved
        </p>
      </Slide>

      <Slide className="center">
        <h2>Thank You!</h2>
        <p style={{ fontSize: '0.5em', opacity: 0.6, marginTop: '1em' }}>
          <a href="https://github.com/tanveerxz/pollen-mesh">github.com/tanveerxz/pollen-mesh</a>
        </p>
      </Slide>
    </Deck>
  );
}
