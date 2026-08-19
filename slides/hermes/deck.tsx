'use client';

import 'reveal.js/theme/dracula.css';
import { Deck, Stack, Slide, Code, Markdown } from '@revealjs/react';
import RevealHighlight from 'reveal.js/plugin/highlight';
import RevealNotes from 'reveal.js/plugin/notes';
import RevealMarkdown from 'reveal.js/plugin/markdown';
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

const plugins = [RevealHighlight, RevealNotes, RevealMarkdown];

export default function HermesDeck() {
  return (
    <Deck config={config} plugins={plugins} className="reveal-deck-root">
      <Slide backgroundImage={logo.src} data-background-size="contain"></Slide>
      <Slide>
        <h2>About Me</h2>
        <div className="r-hstack justify-between items-start">
          <div className="r-vstack " style={{ fontSize: '0.8em' }}>
            <h3>Shritesh Jamulkar</h3>
            <ul>
              <li>Software Engineer @Booking.com</li>
              <li>Full Stack Developer</li>
              <li>Big time Organizer</li>
              <li>AI Enthusiast</li>
            </ul>
            <div
              className="r-hstack justify-between items-start"
              style={{ fontSize: '0.5em', width: '70%' }}
            >
              <div className="r-vstack">
                <img src="/LinkedinQR.png" width={100} height={100}></img>
                <p>
                  Connect with me on <br /> LinkedIn
                </p>
              </div>
              <div className="r-vstack">
                <img
                  src="/slides/hermes/hermesQR.png"
                  width={100}
                  height={100}
                ></img>
                <p>Workshop Slides</p>
              </div>
            </div>
          </div>
          <img
            src="/profile.jpeg"
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
        <div className="r-hstack justify-between">
          <div className="r-vstack items-stretch" style={{ fontSize: '0.8em' }}>
            <h2>What is Hermes?</h2>
            <p style={{ textAlign: 'left' }}>
              The self-improving AI agent and agent management platform built by{' '}
              <a href="https://nousresearch.com/">Nous Research</a>.
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
        <h4 style={{ textAlign: 'left' }}>References</h4>
        <ul className="r-hstack justify-start">
          <li>
            <a href="https://hermes-agent.nousresearch.com/docs/user-guide/configuration">
              Hermes Configuration
            </a>
          </li>
        </ul>
      </Slide>
      <Slide>
        <h2>Hermes vs OpenClaw</h2>
        <table style={{ fontSize: '0.5em' }}>
          <thead>
            <tr>
              <th></th>
              <th>Hermes</th>
              <th>OpenClaw</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Core</td>
              <td>
                Built in Python by Nous Research. It prioritizes a
                self-reinforced learning loop where the agent creates and
                refines its own skills over time.
              </td>
              <td>
                Built in TypeScript with a heavy focus on gateway connectivity.
                It supports over 50 messaging channels and thousands of
                community skills.
              </td>
            </tr>
            <tr>
              <td>Process model</td>
              <td>A runtime you invoke, gateway optional</td>
              <td>A resident Gateway daemon</td>
            </tr>
            <tr>
              <td>File writes</td>
              <td>Your current working directory</td>
              <td>Fenced workspace, ~/.openclaw/workspace/</td>
            </tr>
            <tr>
              <td>Memory</td>
              <td>One SQLite store with full-text search</td>
              <td>Per-session JSONL, compacted on overflow</td>
            </tr>
            <tr>
              <td>Skills</td>
              <td>Auto-generated from repeated patterns</td>
              <td>ClawHub registry, manually curated</td>
            </tr>
            <tr>
              <td>Where it runs</td>
              <td>Local, Docker, SSH, Singularity, Modal, Daytona</td>
              <td>Your device, plus an optional Docker socket</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: '0.5em' }}>
          Same model, 300 events: Hermes recalled in <strong>113 ms</strong>,
          OpenClaw in <strong>19.6 s</strong> — OpenClaw replays its full
          session log into context, Hermes runs a local full-text query.
        </p>
      </Slide>
      <Slide>
        <h2>Architecture</h2>
        <MarkdownInline src="/slides/hermes/arch.md" />
      </Slide>
      <Slide>
        <h2>Hermes + Qwen</h2>
        <div
          className="r-hstack justify-between items-start"
          style={{ fontSize: '0.7em' }}
        >
          <div className="r-vstack items-stretch" style={{ textAlign: 'left' }}>
            <p>
              Hermes is model agnostic — Qwen earns the local slot because it:
            </p>
            <ul>
              <li>ships native tool calling</li>
              <li>comes in sizes that fit a laptop</li>
              <li>keeps every token on your machine</li>
            </ul>
          </div>
          <table style={{ fontSize: '0.8em' }}>
            <thead>
              <tr>
                <th>Model</th>
                <th>Needs</th>
                <th>Good for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Qwen3.5-4B</td>
                <td>8–12 GB</td>
                <td>Fast, simple tool use</td>
              </tr>
              <tr>
                <td>Qwen3.5-9B</td>
                <td>16–24 GB</td>
                <td>The everyday sweet spot</td>
              </tr>
              <tr>
                <td>Qwen3.5-35B-A3B</td>
                <td>48 GB+</td>
                <td>Multi-step agent work</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '0.5em' }}>
          Qwen&apos;s own docs recommend a <em>Hermes-style</em> tool-use format
          — the one Nous Research&apos;s models gave their name to.
        </p>
        <h4 style={{ textAlign: 'left' }}>References</h4>
        <ul className="r-vstack items-start" style={{ fontSize: '0.6em' }}>
          <li>
            <a href="https://github.com/QwenLM/Qwen3/blob/main/docs/source/getting_started/concepts.md">
              Qwen tool calling
            </a>
          </li>
          <li>
            <a href="https://huggingface.co/collections/Qwen/qwen3">
              Qwen model collection
            </a>
          </li>
        </ul>
      </Slide>
      <Slide>
        <h2>Memory: mem0</h2>
        <MarkdownInline src="/slides/hermes/mem0.md" />
        <Markdown style={{ fontSize: '0.5em' }}>
          {`
            > Mem0: Server-side LLM fact extraction with semantic search and hybrid multi-signal retrieval.
          `}
        </Markdown>
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
      <Slide>
        <h2>Prerequsite</h2>
        <div className="centre">
          <br />
          <ul>
            <li>Docker</li>
            <li>LM Studio / Ollama</li>
            <li>Local Qwen model </li>
            <li>Python 3.9</li>
          </ul>
        </div>
      </Slide>
      <Stack>
        <Slide>
          <h2>Hermes Setup</h2>
          <br />
          <p>Linux / macOS / WSL2 / Android (Termux)</p>
          <Code language="bash">
            {`curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash`}
          </Code>
          <Code language="bash">
            {`source ~/.bashrc   # or source ~/.zshrc`}
          </Code>
          <p>Mac</p>
          <Code language="bash">{`brew install hermes-agent`}</Code>
          <p>Windows (native) - Run in powershell:</p>
          <Code language="bash">
            {`iex (irm https://hermes-agent.nousresearch.com/install.ps1) `}
          </Code>
        </Slide>
        <Slide>
          <h2>Hermes Desktop / GUI</h2>
          <br />
          <p>Hermes Desktop - Run in terminal:</p>
          <Code language="bash">
            {`
              hermes desktop
            `}
          </Code>
          <br />
        </Slide>
      </Stack>
      <Slide>
        <h2>Hermes Configure</h2>
        <br />
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
        <Markdown
          style={{ fontSize: '0.5em', textAlign: 'center' }}
        >{`> You can import your OpenClaw Settings too.`}</Markdown>
      </Slide>
      <Slide>
        <h2>Let&apos;s talk to Hermes</h2>
        <br />
        <p>Type `hermes` to start the Hermes CLI</p>
        <Markdown>``` hermes ```</Markdown>
      </Slide>
      <Slide>
        <h2>Connecting with Local Model</h2>
        <br />
        <p>
          Type `hermes model` to change the model and choose Ollama or LMStudio
        </p>
        <Code language="bash">
          {`
              hermes model       # choose your LLM provider and model
          `}
        </Code>
        <p>Or</p>
        <p>Edit `~/.hermes/config.yaml` and restart the gateway</p>
        <Code language="yaml">
          {`
          model:
            default: qwen/qwen3.8-27b
            provider: lmstudio
            timeout: 120
            base_url: http://127.0.0.1:1234/v1
          `}
        </Code>
      </Slide>
      <Slide>
        <h2>Hermes Gateway</h2>
        <br />
        <p>hermes gateway setup - setup the gateway</p>
        <Code language="bash">
          {`
            hermes gateway setup
          `}
        </Code>
        <p>hermes gateway start - start the gateway</p>
        <Code language="bash">
          {`
            hermes gateway start
          `}
        </Code>
        <p>hermes gateway stop - stop the gateway</p>
        <Code language="bash">
          {`
            hermes gateway stop
          `}
        </Code>
      </Slide>
      <Slide>
        <h2>Telegram Integration</h2>
        <br />
        <p>Launch @BotFather and create a new bot</p>
        <a href="https://t.me/BotFather">https://t.me/BotFather</a>
        <p>Type `/newbot` and follow the instructions</p>
        <p>Get the token and add it to the .env file</p>
        <Code language="bash">{`TELEGRAM_BOT_TOKEN=your_token`}</Code>
        <p>Restart the gateway</p>
        <Code language="bash">{`hermes gateway restart`}</Code>
      </Slide>
      <Slide>
        <h3>Multi-Agents</h3>
        <h6>Personal Research Team ⭐</h6>
        <Markdown className="text-left" style={{ fontSize: '0.5em' }}>
          {`
          #### Orchestrator Agent
          > Controls the workflow.
          #### Research Agent
          > "What has happened recently with local AI agents?"
          #### Analysis Agent
          > "How does this relate to what the user already knows?"
          #### Synthesis Agent
          > "What should the user actually know?"
          `}
        </Markdown>
      </Slide>
      <Slide>
        <h2>Multi-Agent Architecture</h2>
        <h6>Personal Research Team ⭐</h6>
        <MarkdownInline src="/slides/hermes/multi-arch.md" />
      </Slide>
      <Slide>
        <h2>Hermes Profiles</h2>
        <p>Research Agent</p>
        <Code language="bash">
          {`
              hermes profile create researcher
              researcher setup
            `}
        </Code>
        <p>Analysis Agent</p>
        <Code language="bash">
          {`
              hermes profile create analyst
              analyst setup
            `}
        </Code>
        <p>Synthesis Agent</p>
        <Code language="bash">
          {`
              hermes profile create synthesizer
              synthesizer setup
            `}
        </Code>
      </Slide>
      <Slide>
        <h2>Hermes Profiles - Soul.md</h2>
        <br />
        <div style={{ fontSize: '0.7em', textAlign: 'left' }}>
          <p>Orchestrator Agent - Edit `~/.hermes/SOUL.md`</p>
          <ul>
            <li>
              <a href="/slides/hermes/Orchestrator-Agent-Soul.md">
                Orchestrator Agent Soul.md
              </a>
            </li>
          </ul>
          <p>Research Agent - Edit `~/.hermes/profiles/researcher/SOUL.md`</p>
          <ul>
            <li>
              <a href="/slides/hermes/Research-Agent-Soul.md">
                Research Agent Soul.md
              </a>
            </li>
          </ul>
          <p>Analysis Agent - Edit `~/.hermes/profiles/analyst/SOUL.md`</p>
          <ul>
            <li>
              <a href="/slides/hermes/Analysis-Agent-Soul.md">
                Analysis Agent Soul.md
              </a>
            </li>
          </ul>
          <p>Synthesis Agent - Edit `~/.hermes/profiles/synthesizer/SOUL.md`</p>
          <ul>
            <li>
              <a href="/slides/hermes/Synthesis-Agent-Soul.md">
                Synthesis Agent Soul.md
              </a>
            </li>
          </ul>
        </div>
      </Slide>
      <Stack>
        <Slide>
          <h2>Mem0 Memory - MCP Server</h2>
          <div
            className="items-start"
            style={{ fontSize: '0.8em', textAlign: 'left' }}
          >
            <p>Postgres + pgvector, Neo4j and the mem0 API</p>
            <p>Create a new directory:</p>
            <Code language="bash">{`mkdir mem0 && cd mem0`}</Code>
            <p>Download the files:</p>
            <ul className="r-vstack items-start" style={{ fontSize: '0.8em' }}>
              <li>
                <a href="/slides/hermes/mem0/docker-compose.yml" download>
                  docker-compose.yml
                </a>
              </li>
              <li>
                <a href="/slides/hermes/mem0/init-db.sh" download>
                  init-db.sh
                </a>
              </li>
            </ul>
            <p>Start the container:</p>
            <Code language="bash">
              {`
              docker compose up -d
            `}
            </Code>
            <p>
              The mem0 API lands on port 8888, which is the URL the MCP server
              uses.
            </p>
          </div>
        </Slide>
        <Slide>
          <h2>Mem0 Memory - MCP Server Configuration</h2>
          <p>LMStudio</p>
          <Code language="yaml">
            {`
               LMSTUDIO_BASE_URL: \${LMSTUDIO_BASE_URL:-http://host.docker.internal:1234/v1}
               LMSTUDIO_MODEL: \${LMSTUDIO_MODEL:-google/gemma-4-12b-qat}
               LMSTUDIO_EMBEDDING_MODEL: \${LMSTUDIO_EMBEDDING_MODEL:-text-embedding-nomic-embed-text-v2-moe}
               LMSTUDIO_EMBEDDING_ENCODING_FORMAT: \${LMSTUDIO_EMBEDDING_ENCODING_FORMAT:-float}
          `}
          </Code>
          <p>Ollama</p>
          <Code language="yaml">
            {`
               OLLAMA_BASE_URL: \${OLLAMA_BASE_URL:-http://host.docker.internal:11434/v1}
               OLLAMA_MODEL: \${OLLAMA_MODEL:-google/gemma-4-12b-qat}
               OLLAMA_EMBEDDING_MODEL: \${OLLAMA_EMBEDDING_MODEL:-text-embedding-nomic-embed-text-v2-moe}
               OLLAMA_EMBEDDING_ENCODING_FORMAT: \${OLLAMA_EMBEDDING_ENCODING_FORMAT:-float}
          `}
          </Code>
        </Slide>
      </Stack>
      <Slide>
        <h2>Mem0 Memory</h2>
        <br />
        <p>Edit `~/.hermes/config.yaml` and all the profiles</p>
        <Code language="yaml">
          {`
              mcp_servers:
                mem0:
                  url: http://localhost:8888/mcp
            `}
        </Code>
        <p>Restart the gateway and reload the MCP server:</p>
        <Code language="bash">
          {`
              hermes gateway restart
              hermes 
          `}
        </Code>
        <Code>
          {`
             /reload_mcp 
          `}
        </Code>
      </Slide>
      <Slide>
        <h2>See this in action</h2>
        <p>Orchestrator Agent</p>
        <Markdown className="text-left" style={{ fontSize: '0.7em', textAlign: 'left' }}>
          {`
            - I'm researching local AI agents. Remember that I'm particularly interested in privacy, self-hosted models, and running AI entirely on my own hardware.
            - Research the current landscape of local AI agents. Focus on self-hosting, privacy, local model support, and agent frameworks. Compare the main approaches and tell me what I should explore next.
            - Continue my research. What has changed since my last session, and what should I investigate next?
          `}
        </Markdown>
      </Slide>
      <Slide>
        <h2>hermes cron</h2>
        <p>Ask the agent to set up the cron job</p>
        <ul className="text-left" style={{ fontSize: '0.7em', textAlign: 'left' }}>
          <li>
            Every day at 9 AM, research the latest developments in local AI agents, focusing on self-hosted models, privacy, agent frameworks, and local inference. Compare today's findings with my previous research using your memory. Identify anything new or important, and prepare a concise research digest for me.
          </li>
          <li>
            Run my scheduled local AI research task now.
          </li>
        </ul>
        <p>Or</p>
        <p>Create a new cron job from the CLI</p>
        <Code language="bash">
          {`
            hermes cron create "every 2h" "Research the latest developments in local AI agents. Focus on self-hosted models, privacy, local inference, and agent frameworks. Compare the findings with my previous research and tell me what I should investigate next."
          `}
        </Code>
      </Slide>
      <Stack>
        <Slide>
          <h2>Use cases</h2>
          <br />
          <div style={{ fontSize: '0.8em', textAlign: 'left' }}>
            <ul>
              <li>
                <strong>Morning research briefing</strong> — cron wakes the
                team, you read the digest on Telegram
              </li>
              <li>
                <strong>Second brain</strong> — drop links and notes in chat,
                ask about them weeks later
              </li>
              <li>
                <strong>Private repo assistant</strong> — local model on local
                files, writing its own skills
              </li>
            </ul>
          </div>
        </Slide>
        <Slide>
          <h3>Morning research briefing</h3>
          <MarkdownInline src="/slides/hermes/usecase-briefing.md" />
        </Slide>
        <Slide>
          <h3>Second brain</h3>
          <MarkdownInline src="/slides/hermes/usecase-secondbrain.md" />
        </Slide>
        <Slide>
          <h3>Private repo assistant</h3>
          <MarkdownInline src="/slides/hermes/usecase-private.md" />
        </Slide>
      </Stack>
      <Slide className="center">
        <h2>Thank You!</h2>
      </Slide>
    </Deck>
  );
}
