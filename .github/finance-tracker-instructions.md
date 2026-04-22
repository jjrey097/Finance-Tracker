# Copilot instructions for Finance-Tracker

This file documents project-specific commands, architecture notes, and conventions to help future Copilot sessions and contributors.

## 1) Build, run, test, and lint commands

Backend (API - .NET 8):
- Build: dotnet build
- Run (dev): dotnet run --project FinanceTracker.Api.csproj
- Publish: dotnet publish -c Release -o ./out
- Database: the API uses SQLite file `finance.db` in repo root. To reset the DB: stop the app and delete `finance.db` (the app recreates it on startup).
- Tests: No test projects detected. There is no single-test runner configured.
- Lint: No .NET linting (e.g., dotnet format/StyleCop) configured in repo.

Frontend (finance-tracker-ui - Vue + Vite):
- Install: cd finance-tracker-ui && npm install
- Dev server: cd finance-tracker-ui && npm run dev  (vite, default port 5173)
- Build: cd finance-tracker-ui && npm run build
- Preview: cd finance-tracker-ui && npm run preview
- Single test: No test scripts configured in package.json.

To run full dev (recommended):
- Terminal A: dotnet run --project FinanceTracker.Api.csproj
- Terminal B: cd finance-tracker-ui && npm install && npm run dev
- The backend CORS policy allows http://localhost:5173 (Dev policy).

## 2) High-level architecture

- Backend: ASP.NET Core minimal-API-style host with controllers in `Controllers/`. EF Core (SQLite) is used via `Data/AppDbContext.cs` and registered in `Program.cs`.
- Database: SQLite file `finance.db` located at repo root. Program.cs calls `Database.EnsureCreated()` and, on failure, deletes and recreates the DB. There are no EF Migrations present; the app uses EnsureCreated semantics rather than migrations.
- Frontend: Vue 3 application in `finance-tracker-ui/`. During development it runs with Vite (port 5173). In production the built SPA is served from `wwwroot/` by the ASP.NET app; Program.cs maps a SPA fallback to `index.html`.
- Dev flow: The API exposes Swagger in development. Static assets in `wwwroot/` are served directly and include a built frontend (already committed in the repo).

## 3) Key conventions and repository specifics

- Committed build artifacts: `bin/`, `obj/`, and `wwwroot/` built assets are present in the repository. Be cautious: these are committed binaries and may be large. Avoid committing additional build outputs.
- Database persistence: `finance.db` is committed. The app will recreate or delete it automatically on schema issues. Back up data before schema changes.
- CORS: A named policy `Dev` is configured to allow `http://localhost:5173`. Use that origin for local frontend dev.
- No tests or CI detected: No GitHub Actions workflows or test projects were found. Consider adding CI and a test suite for reliable automation.
- Migrations: No `Migrations/` folder or EF migration scripts found — schema evolution is handled by EnsureCreated (not recommended for production where migrations give controlled DB changes).
- API endpoints: Implemented via controllers in `Controllers/`. Swagger is available in development for endpoint discovery.
- Frontend store & routing: The Vue app uses Pinia for state and Vue Router (see `finance-tracker-ui/src/stores/` and `finance-tracker-ui/src/views/`).

## 4) AI / Assistant related files scanned

No existing assistant rule files detected in the repo root or .github: CLAUDE.md, .cursorrules, AGENTS.md, .windsurfrules, CONVENTIONS.md, .clinerules were not found. This file serves as the canonical Copilot guidance for the repo.

---

If you want the file adjusted (more detail on controllers, models, or a short quickstart), say which area to expand.
