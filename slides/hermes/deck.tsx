'use client';

import 'reveal.js/theme/dracula.css';
import { Deck, Stack, Slide, Code, Markdown } from '@revealjs/react';
import RevealHighlight from 'reveal.js/plugin/highlight';
import RevealNotes from 'reveal.js/plugin/notes';
import MarkdownInline from '@/components/slides/MarkdownInline';
import logo from './media/logo.png';
import hermesAgentLogo from './media/hermes-agent.png';

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

const plugins = [RevealHighlight, RevealNotes];

export default function HermesDeck() {
  return (
    <Deck config={config} plugins={plugins} className="reveal-deck-root">
      <Slide backgroundImage={logo.src} data-background-size="contain">
        
      </Slide>
      <Slide>
        <h2>About Me</h2>
      </Slide>
      <Slide className="center">
        <div className="r-hstack justify-between">
          <div className="r-vstack items-stretch">
            <h2>What is Hermes?</h2>
            <p style={{ textAlign: 'left' }}>
                The self-improving AI agent and agent management platform built by <a href="https://nousresearch.com/">Nous Research</a>.   
            </p>
            <ul>
              <li>Persistent Memory</li>
              <li>Multi-Platform Gateway</li>
              <li>Scheduled Automations</li>
              <li>Model Agnostic</li>
              <li>Self-Improving Loop</li>
              <li>Execution Backends</li>
            </ul>
          </div>
          <img src={hermesAgentLogo.src} alt="Hermes Agent" width={600} />
        </div>
      </Slide>
      <Slide>
        <h2>Hermes Configuration</h2>
        <p>Hermes Directory Structure</p>
        <Code language="bash">
          {`
            ~/.hermes/
            ├── config.yaml     # Settings (model, terminal, TTS, compression, etc.)
            ├── .env            # API keys and secrets
            ├── auth.json       # OAuth provider credentials (Nous Portal, etc.)
            ├── SOUL.md         # Primary agent identity (slot #1 in system prompt)
            ├── memories/       # Persistent memory (MEMORY.md, USER.md)
            ├── skills/         # Agent-created skills (managed via skill_manage tool)
            ├── cron/           # Scheduled jobs
            ├── sessions/       # Gateway sessions
            └── logs/           # Logs (errors.log, gateway.log — secrets auto-redacted)
          `}
        </Code>
        <h4 style={{ textAlign: 'left' }}>Refrences</h4>
        <ul className="r-hstack justify-start">
          <li><a href="https://hermes-agent.nousresearch.com/docs/user-guide/configuration">Hermes Configuration</a></li>
        </ul>
      </Slide>
      <Slide>
        <h2>Open Claw vs Hermes</h2>
      </Slide>
      <Slide>
        <h2>Architecture</h2>
        {/* <div className="r-hstack"> */}
          <MarkdownInline src="/slides/hermes/arch.md" />
        {/* </div> */}
      </Slide>
      <Slide>
        <h2>Hermes + Qwen</h2>
      </Slide>
      <Slide>
        <h2>Memory: mem0</h2>
      </Slide>
      <Slide className="center">
        <h1>Let&apos;s Build</h1>
        <div style={{ width: '440px', height: '440px', margin: '0 auto' }}>
          <iframe
            src="https://giphy.com/embed/IzzAJCkxyVKGqZjlvV"
            style={{ width: '100%', height: '100%' }}
            className="giphy-embed"
            allowFullScreen
          ></iframe>
        </div>
      </Slide>

      <Stack>
        <Slide>
          <h2>Hermes Setup</h2>
          <br/>
          <p>Linux / macOS / WSL2 / Android (Termux)</p>
          <Code language="bash">
            {`curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash`}
          </Code>
          <Code language="bash">
            {`source ~/.bashrc   # or source ~/.zshrc`}
          </Code>
          <br/>
          <p>Windows (native) - Run in powershell:</p>
          <Code language="bash">
            {`iex (irm https://hermes-agent.nousresearch.com/install.ps1) `}
          </Code>

        </Slide>
        <Slide>
          <h2>Hermes Desktop / GUI</h2>
          <br/>
          <p>Hermes Desktop - Run in terminal:</p>
          <Code language="bash">
            {`
              hermes desktop
            `}
          </Code>
          <br/>
        </Slide>
      </Stack>

      <Slide>
        <h2>Hermes Configure</h2>
        <br/>
        <div className="centre">
          <p>hermes model - choose your LLM provider and model</p>
          <Code language="bash">
            {`
              hermes model       # choose your LLM provider and model
            `}
          </Code>
          <p>hermes tools - configure enabled tools</p>
          <Code language="bash">
            {`
              hermes tools       # configure enabled tools
            `}
          </Code>
          <p>hermes setup - run the full setup wizard</p>
          <Code language="bash">
            {`
              hermes setup       # run the full setup wizard
            `}
          </Code>
        </div>
      </Slide>

      <Slide>
        <h2>Let&apos;s talk to Hermes</h2>
        <br/>
        <p>Type `hermes` to start the Hermes CLI</p>
        <Markdown>
          ```
          hermes
          ```
        </Markdown>
      </Slide>

      <Slide>
        <h2>Connecting with Local Model</h2>
      </Slide>
      <Slide>
        <h2>Telegram Integration</h2>
        <br/>
        <Code language="bash">
          {`
            hermes gateway setup
          `}
        </Code>
        <br/>
      </Slide>
      <Slide>
        <h2>Give your AI Agent&apos;s Soul.md</h2>
      </Slide>
      <Slide>
        <h2>Multi-Agent Architecture</h2>
      </Slide>
      <Slide>
        <h2>Hermes Profiles</h2>
      </Slide>
      <Slide>
        <h2>Mem0 Memory</h2>
      </Slide>
      <Slide className="center">
        <h2>Thank You!</h2>
      </Slide>
    </Deck>
  );
}
