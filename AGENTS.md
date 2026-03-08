# Repository Guidelines

## Project Structure & Module Organization
This repository is a Tauri desktop app with a React + TypeScript frontend. Put UI code in `src/`: `components/` for reusable pieces, `views/` for routed screens, `layouts/` for shell layout, `services/` for business logic, `hooks/` for custom hooks, and `utils/` for shared helpers. Static assets live in `public/` and `src/assets/`. Native desktop code lives in `src-tauri/`; Rust entry points are under `src-tauri/src/`, and SQLite-related code is in `src-tauri/src/database/`. Build output is generated in `dist/` and should not be edited manually.

## Build, Test, and Development Commands
Use `pnpm install` to install frontend dependencies. `pnpm dev` starts the Vite web app, while `pnpm tarui:dev` runs the full Tauri desktop app for local development. `pnpm build` compiles TypeScript and bundles the frontend. `pnpm tarui:build` creates a production desktop build. `pnpm test` runs the Vitest suite. `pnpm version` executes `scripts/update-version.js` to update versioned files before tagging a release.

## Coding Style & Naming Conventions
Follow the existing Prettier rules: 2-space indentation, single quotes, no semicolons, trailing commas where valid, and a 120-character line width. Prefer TypeScript for frontend changes. Use `PascalCase` for React components (`AuthorTag.tsx`), `camelCase` for hooks and utilities (`useAuthor.ts`, `projectConfig.ts`), and lowercase route view files (`home.tsx`, `settings.tsx`). Keep modules focused; put cross-cutting logic in `services/` or `utils/` instead of inside views.

## Testing Guidelines
Vitest is the test runner. Place tests close to the code they cover using `__tests__` directories and `*.test.ts` naming, following `src/utils/__tests__/utils.test.ts`. Add or update tests when changing transformation logic, utility functions, or versioning scripts. Run `pnpm test` before opening a pull request.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commit prefixes such as `feat:`, `fix:`, and `chore:`. Keep commit messages imperative and scoped to one change. PRs should include a short summary, testing notes, and screenshots for UI updates. Link related issues when applicable. For releases, update versioned files, create a `vX.Y.Z` tag, and push the tag to trigger the GitHub Actions release workflow.

## Security & Configuration Notes
Do not commit private signing keys, API keys, or local project paths. Keep Tauri updater credentials in GitHub Secrets, and review changes to `src-tauri/tauri.conf.json` carefully because they affect packaging, updater behavior, and desktop permissions.
