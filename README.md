<div align="center">

<p align="center">
  <img src="https://raw.githubusercontent.com/rohittiwari-dev/ocpp-ws-io/main/assets/banner.svg" alt="ocpp-ws-io" width="420" />
</p>

**Visual OCPP Charge Point Emulator**

A modern, open-source web UI for simulating one or more EV charge points against any CSMS (Central System) — built on the rock-solid foundation of [ocpp-ws-io](https://ocpp-ws-io.rohittiwari.me).

[![Live](https://img.shields.io/badge/Live-ocpp.rohittiwari.me-brightgreen?style=flat-square)](https://ocpp.rohittiwari.me)
[![Part of ocpp-ws-io](https://img.shields.io/badge/ecosystem-ocpp--ws--io-blue?style=flat-square)](https://github.com/rohittiwari-dev/ocpp-ws-io)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org)

[Live Demo](https://ocpp.rohittiwari.me) · [ocpp-ws-io Docs](https://ocpp-ws-io.rohittiwari.me) · [Report a Bug](https://github.com/rohittiwaridev/ocpp-ws-simulator/issues)

</div>

---

## Why ocpp-ws-simulator?

Building and testing an OCPP-compliant Charging Station Management System (CSMS) requires a reliable way to simulate realistic EV charge point behaviors. **ocpp-ws-simulator** provides a stunning visual interface to make debugging and testing effortless:

- 🏎️ **Instant Visual Feedback** — A responsive, modern web UI for simulating multi-connector charge points and real-time charging sessions.
- 🔌 **Detailed Message Logging** — Filter, search, and expand detailed TX/RX/System/Error logs with a built-in JSON viewer.
- 🎯 **Full Protocol Support** — Effortlessly switch between OCPP 1.6, 2.0.1, and 2.1 natively.
- 🔋 **Mock Meter Values & Diagnostics** — Manually trigger arbitrary energy readings to test billing, firmware statuses, and data transfers.
- 🔒 **Local or Cloud Ready** — Run entirely locally for isolated development, or deploy it with the built-in Auth gate for your team.
- 🧩 **Built on `ocpp-ws-io`** — Inherits type-safe, rock-solid RPC framing using the underlying [ocpp-ws-io](https://npm.im/ocpp-ws-io) core engine.

> [!WARNING]
> **This project is currently under active testing and development.** Features may be incomplete, APIs unstable, and breaking changes can occur without notice. Not recommended for production use yet.

> [!NOTE]
> This simulator is maintained as a **standalone repository** — separate from the [ocpp-ws-io monorepo](https://github.com/rohittiwari-dev/ocpp-ws-io) — for easy cloning, self-hosting, and independent distribution.

## Part of the ocpp-ws-io Ecosystem

This simulator is a critical part of the broader `ocpp-ws-io` ecosystem, designed to give developers the visual tools needed along with the programmatic libraries.

| Project                                                                    | Description                              | Status       |
| -------------------------------------------------------------------------- | ---------------------------------------- | ------------ |
| [`ocpp-ws-io`](https://github.com/rohittiwari-dev/ocpp-ws-io)              | Core OCPP WebSocket RPC client & server  | ✅ Published |
| [`ocpp-ws-cli`](https://www.npmjs.com/package/ocpp-ws-cli)                 | CLI for generation, simulation & testing | ✅ Published |
| [`ocpp-ws-simulator`](https://github.com/rohittiwaridev/ocpp-ws-simulator) | Visual web UI emulator (This Repo)       | ✅ Active    |

## Quick Start

### Prerequisites

- **Node.js** ≥ 18.0.0
- npm / bun

### Using `ocpp-ws-cli` (Recommended)

The easiest way to start the visual simulator is using the official CLI. It will automatically download, install, and start the simulator for you:

```bash
npx ocpp-ws-cli studio
```

Alternatively, you can launch it using the interactive menu:

```bash
npx ocpp-ws-cli
# Select "Visual Simulator" from the menu
```

### Clone & Run (Manual)

This repository is standalone — no monorepo setup required.

```bash
git clone https://github.com/rohittiwaridev/ocpp-ws-simulator.git
cd ocpp-ws-simulator
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Enable login screen (optional — set to "false" or remove to skip auth)
NEXT_PUBLIC_ALLOW_AUTH="true"
ALLOW_AUTH="true"

# Credentials (used when ALLOW_AUTH=true)
USERNAME="your_username"
PASSWORD="your_password"
```

## Usage

1. Click **Settings** (⚙) or the endpoint chip in the header to configure your CSMS WebSocket URL and Charge Point Identity.
2. Select your required OCPP version using the version picker.
3. Click **Connect** to establish the WebSocket connection to your CSMS.
4. Use the connector cards to visually simulate charging flows: authorizing, starting/stopping transactions, and sending meter readings to the cloud.
5. Watch the **OCPP Log** panel for detailed message traces and payload inspection.

## Tech Stack

| Layer         | Tech                                            |
| ------------- | ----------------------------------------------- |
| Framework     | [Next.js 15](https://nextjs.org) (App Router)   |
| Engine        | [ocpp-ws-io](https://ocpp-ws-io.rohittiwari.me) |
| Styling       | Tailwind CSS v4                                 |
| State         | Zustand                                         |
| UI primitives | shadcn/ui                                       |

## Search Keywords

`ocpp` `ev-charging` `simulator` `ocpp-simulator` `charge-point-emulator` `evse` `csms` `ocpp-1.6` `ocpp-2.0.1` `ocpp-2.1` `websocket` `typescript` `open-source` `react` `nextjs`

## Contributing

Contributions are welcome! This is a standalone repository so you can clone and work on it independently.

1. Fork this repository
2. Create your feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/)
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request

## Security

To report a security vulnerability, please check if there is a `SECURITY.md` in the repository or contact the maintainer directly.

## License

[MIT](LICENSE) © 2026 [Rohit Tiwari](https://rohittiwari.me)
