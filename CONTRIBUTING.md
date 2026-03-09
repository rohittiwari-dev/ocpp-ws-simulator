# Contributing to ocpp-ws-simulator

First off, thank you for considering contributing to **ocpp-ws-simulator**! Every contribution helps make OCPP development better for everyone.

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Commit Convention](#commit-convention)
- [Code Style](#code-style)

## Getting Started

This project is a standalone Next.js application built with [npm](https://npmjs.com/).

## Development Setup

### Prerequisites

- **Node.js** ≥ 18.0.0
- **npm** ≥ 10.x
- **Git**

### Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/rohittiwaridev/ocpp-ws-simulator.git
cd ocpp-ws-simulator

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

### Useful Commands

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start development server             |
| `npm run build` | Build the application for production |
| `npm start`     | Start the built production server    |
| `npm run lint`  | Run ESLint                           |

## How to Contribute

### Reporting Bugs

Found a bug? Please open an issue with:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your environment (Node.js version, OS, browser version, OCPP protocol version)

### Suggesting Features

Have an idea? Please open a feature request with:

- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

### Submitting Code

1. **Check existing issues** — Your idea may already be tracked
2. **Open an issue first** for significant changes — let's discuss before you invest time
3. **Fork the repo** and create a branch from `main`
4. **Follow the code style** — see [Code Style](#code-style) below
5. **Submit a pull request** — see [Pull Request Process](#pull-request-process)

## Pull Request Process

### Branch Naming

Use descriptive branch names with the following prefixes:

| Prefix      | Usage                 |
| ----------- | --------------------- |
| `feat/`     | New features          |
| `fix/`      | Bug fixes             |
| `docs/`     | Documentation changes |
| `refactor/` | Code refactoring      |
| `chore/`    | Maintenance tasks     |

### PR Checklist

Before submitting your PR, ensure:

- [ ] Your code builds without errors (`npm run build`)
- [ ] You've updated documentation if needed
- [ ] Your commits follow the [commit convention](#commit-convention)
- [ ] You've linked any related issues

### Review Process

1. A maintainer will review your PR
2. They may request changes — please address them in new commits
3. Once approved, a maintainer will merge the PR

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Each commit message should be structured as:

```
<type>(<scope>): <description>

[optional body]
```

### Types

| Type       | Description                                           |
| ---------- | ----------------------------------------------------- |
| `feat`     | New feature                                           |
| `fix`      | Bug fix                                               |
| `docs`     | Documentation changes                                 |
| `style`    | Formatting, missing semicolons, etc. (no code change) |
| `refactor` | Code refactoring (no feature or bug fix)              |
| `chore`    | Build process, dependencies, tooling                  |

## Code Style

- **TypeScript** — All source code must be in TypeScript
- **Formatting** — Use the project's existing formatting conventions (Tailwind, Next.js conventions)
- **Naming** — Use `camelCase` for variables/functions, `PascalCase` for React components/classes/types/interfaces
- **No `any`** — Avoid `any` types where possible; use proper typing

---

Thank you for helping make **ocpp-ws-simulator** better! 💚
