# CS Agent Management — Merchant Center Custom App

A Commercetools Merchant Center Custom Application that lets CS managers:

- Create and manage CS agent accounts (name, email, role, active/deactivated status)
- Browse the full agent action audit log with agent, date, and action-type filters

## Prerequisites

- Node.js 18+
- A Commercetools project with the agent portal storefront (`site/`) already deployed
- A registered Custom Application in Merchant Center (see below)

## Install dependencies

```bash
cd admin
npm install
```

## Run locally

```bash
npm start
# Opens on http://localhost:3001 — the MC App Kit proxies this through the MC dev server
```

## Environment variables

Create `admin/.env` (not committed):

```
CLOUD_IDENTIFIER=gcp-eu           # or gcp-us, aws-eu, aws-us
CTP_PROJECT_KEY=your-project-key  # required for local dev — sets the initial project context
CUSTOM_APPLICATION_ID=<id>        # from MC Settings → Custom Applications (production only)
APPLICATION_URL=https://...       # your deployed app URL (production only)
```

During local development only `CLOUD_IDENTIFIER` and `CTP_PROJECT_KEY` are required.
When deploying via commercetools Connect, `CUSTOM_APPLICATION_ID` and `APPLICATION_URL` are
injected automatically — you do not set them manually.

## Register the Custom Application in Merchant Center

1. Log in to Merchant Center → **Settings → Custom applications → Register a custom application**
2. Set:
   - **Application name**: CS Agent Management
   - **Entry point URI path**: `cs-agent-management`
   - **OAuth scopes** (view): `view_custom_objects`
   - **OAuth scopes** (manage): `manage_custom_objects`
3. Copy the generated **Application ID** if prompted (not required for local dev)

## Build for production

```bash
npm run build
npm run compile-html
```

Deploy the output of `public/` to any static host (Netlify, Vercel, S3+CloudFront).

## CT Custom Objects shape

The app reads and writes to two CT Custom Object containers:

| Container | Key format | Value type |
|---|---|---|
| `agent-credentials` | `<email-as-slug>` | `AgentRecord` (see `src/lib/types.ts`) |
| `agent-audit-log` | `<sessionId>-<timestamp>-<actionType>` | `AuditEntry` (see `src/lib/types.ts`) |

These containers are created automatically on first write. No CT schema setup is required.

## Provisioning the first agent

Until the MC App is set up, use the CLI tool in `tools/`:

```bash
# Edit the AGENTS array in tools/setup-agent-credentials.mjs, then:
node tools/setup-agent-credentials.mjs
```

Once at least one agent exists you can use the MC App to manage subsequent accounts.
