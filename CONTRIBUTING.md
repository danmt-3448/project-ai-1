# Contributing Guidelines & Rules

This document describes expectations and rules for contributing to this Next.js + TypeScript repository (frontend and backend). Follow these guidelines to keep the codebase consistent, secure, and reviewable.

## Branching & Pull Request Policy

- Use the `main` branch for production-ready code only.
- Create feature branches from `main` with descriptive names: `feature/<short-desc>`, `fix/<short-desc>`, `chore/<short-desc>`.
- Open a Pull Request (PR) to `main` for any change. PR title should be concise and descriptive.
- Include a short description of why the change is needed, testing performed, and any migration notes.
- PRs must have at least one approving review before merging.
- Use squash merges for a clean history unless history preservation is required.

## Code Style

- TypeScript: prefer strict typing; enable `strict` in `tsconfig.json` when possible.
- Formatting: use `prettier` with repository config. Run `npm run format` before opening a PR.
- Linting: use `eslint` with recommended rules for Next.js + TypeScript. Fix lint errors before merging.

## Tests

- Add unit tests for all new logic. Use `jest`/`vitest` as configured in the repo.
- Tests should run locally and in CI. Ensure `npm test` passes for both FE and BE.

## Commits

- Use conventional commits where practical: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`, `test:`.
- Keep commit messages small and focused.

## Security & Secrets

- Never commit secrets, API keys, or private keys to the repository.
- Use environment variables and store production secrets in Vercel environment settings or GitHub Secrets for CI.
- If a secret is accidentally committed, rotate it immediately and open an incident PR describing the rotation.

## Pull Request Checklist

- [ ] Branch name follows pattern
- [ ] CI passes (lint, typecheck, tests, build)
- [ ] No console.log left in production code
- [ ] Documentation updated when necessary (README, DEPLOYMENT.md)

## Review Expectations

- Keep reviews constructive and focused on code quality, correctness, security, and performance.
- Ask clarifying questions in PR comments.

## Releases

- Tag releases on `main` using semantic versioning.
- Provide a changelog entry summarizing user-facing changes and migration notes.

## Docker & Deployment Rules

- Docker images must be built with a reproducible Node.js base (e.g., `node:20-alpine`).
- Reduce image size by installing only production dependencies in final images.
- CI must build the image and run smoke tests before tagging.

## Linting and Type Checking

- All code must pass `eslint` and `tsc --noEmit` before merging.
- Use IDE integrations or run locally: `npm run lint` and `npm run type-check`.

## Escalation and Security Reporting

- Report security vulnerabilities privately to the maintainers and do not discuss them publicly until mitigated.

---

If you'd like I can also add a `CODE_OF_CONDUCT.md` and automate PR labeling and size checks. Would you like that next?
