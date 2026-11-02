# TASB Risk Management Fund · Member Portal

A working Next.js App Router prototype of the signed-in experience for a school district. It opens on the fictional Cedar Grove ISD business manager’s dashboard. The demonstration date is October 15, 2026, so claims, due dates and reminders stay consistent across presentations.

## Run locally

Use Node.js 22.13 or later and npm. From the folder containing this README:

```sh
npm ci
npm run dev
```

Open **http://localhost:3000**. No API keys or environment file are required.

## A three-minute presentation

1. **Start at the dashboard.** Point out the next task, claim activity and upcoming deadlines for Cedar Grove ISD. Open a claim to see how the status, documents and contact fit together.
2. **Report storm damage.** Open **Report a claim**, choose **Property**, and continue. On the incident screen, choose **Use example storm damage details**. On the documents screen, attach a sample roof photo. Review the summary, confirm and submit. Open the receipt, then return to **Claims** to find the same record.
3. **Show why roles matter.** Start a workers’ compensation report and use example details again. When submitted with district routing enabled, it goes to the district review queue instead of directly to the Fund. Switch to the Pine Hollow ISD finance role to see the narrower workspace.
4. **Connect the experience to the RFP.** Open the **Requirements guide** for a numbered crosswalk of 45 items with links into the corresponding screens. Use the filters to distinguish interactive experiences from illustrated integrations. The administration preview demonstrates how a district reference field can become required on a member’s claim form.

## Build and test

| Command | Result |
| --- | --- |
| `npm test` | Exercises sample claim routing and validation, district tasks and the requirements map. |
| `npm run build` | Creates the production Next.js application in `.next/`. |
| `npm start` | Serves that production build at http://localhost:3000. |
| `npm run build:static` | Generates a standalone static site in `out/` for a host with directory-index support. |

The production server build and static export are alternatives; run the matching build command for your intended host. Build output and installed dependencies are intentionally omitted from the source archive.

## Deploy to Vercel

The repository is ready for Vercel with no extra settings. `vercel.json` sets the Next.js framework preset, `npm ci` and `npm run build`. Node is pinned to 22.x through `engines` and `.nvmrc`. No environment variables are needed.

**From the dashboard:** choose **Add New → Project**, import `slamensdicreon/tasb` and select **Deploy**. Each push to `main` updates production, and other branches get preview URLs.

**From the CLI:**

```sh
npx vercel        # preview deployment
npx vercel --prod # production deployment
```

Use the server build (`npm run build`) on Vercel, not `npm run build:static`. Every route is prerendered either way, but the server build keeps Next.js routing and the 404 handling.

## Code map

- `app/` — App Router entry, layouts, routable portal sections and responsive styles.
- `components/` — dashboard and member screens, claim journey, shared controls, administration, and demo state.
- `lib/` — district and claim fixtures, routing and validation rules, requirements crosswalk, and icon paths.
- `public/assets/` — local campus and resource photographs, typeface, and brand assets; image credits are in [docs/ASSET-SOURCES.md](docs/ASSET-SOURCES.md).
- `tests/` and `scripts/` — behavioral checks and build helpers.

## Demonstration boundaries

All member records, contact details, claim numbers, financial amounts and statuses are sample data. Changes are saved in this browser’s local storage; a private browser window starts a fresh demonstration. File controls keep attachment names only. Sign-in, external services, payments, notifications, and submissions illustrate the intended experience using local state. No credentials, real claims, payments, email, or documents are sent. Role switching illustrates two personas; production authorization requires enforcement on a server.
