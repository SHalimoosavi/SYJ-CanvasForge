# Contributing to SYJ-CanvasForge

Thanks for considering a contribution. This project aims to stay production-quality, so please read through this guide before opening a pull request.

## Getting started

```bash
git clone https://github.com/SHalimoosavi/SYJ-CanvasForge.git
cd SYJ-CanvasForge
npm install
npm run dev
```

See [docs/DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) for project conventions and [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for how the codebase is organized.

## Workflow

1. Fork the repository and create a branch off `main`: `git checkout -b feature/short-description`.
2. Make your change, following the existing feature-first structure and TypeScript-strict style.
3. Add or update tests for any new logic in `services/`, `lib/`, `store/`, or non-trivial components.
4. Run the full check suite locally:
   ```bash
   npm run typecheck
   npm run lint
   npm run format:check
   npm run test
   npm run build
   ```
5. Commit with a clear, descriptive message and open a pull request against `main`.

## Pull request expectations

- **One concern per PR.** Small, focused PRs are much easier to review than large ones.
- **No unrelated formatting churn.** Run `npm run format` only on files you actually touched.
- **Tests for behavior changes.** If you fix a bug or add a feature, add a test that would have caught the bug / verifies the feature.
- **Update docs** if you change public behavior, add a script, or change the architecture.
- **Describe what and why** in the PR description, not just what changed in the diff.

## Reporting bugs

Open an issue with:

- Steps to reproduce
- What you expected vs. what happened
- Browser/OS
- A sample file, if the bug is file-specific (redact anything sensitive first)

## Feature requests

Open an issue describing the use case, not just the desired implementation — it helps evaluate whether it fits the project's scope (a client-side, privacy-first PDF/image editor).

## Code of conduct

Be respectful and constructive. Disagreements about implementation are fine and expected; keep discussion focused on the technical merits.
