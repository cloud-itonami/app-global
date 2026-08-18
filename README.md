# app-global

**A Vite + Svelte 5 single-page scaffold, plus the declaration files describing the
application it is meant to become.** 26 tracked files, 87,807 bytes. There is no
backend in this repository, and nothing is deployed.

Read this file before `CLAUDE.md`, `MCP_TOOLS.md` or `PROJECT.jsonld`. Those three
were written inside the `etzhayyim/root` monorepo, before this directory was
extracted, and they describe a system larger than what was extracted. This file
says which parts of them you can act on today.

- Identity: `README.edn` (`:kind :app`, boundary `cloud-itonami/public-global`)
- Provenance: `migration.edn` — extracted from `etzhayyim/root@84c96c64`,
  path `60-apps/etzhayyim-project-global`, 24 files / 87,245 bytes. The two files
  added by the extraction are `README.edn` and `migration.edn`; everything else is
  byte-identical to the source tree, and `docs/verify-custody.cljs` checks that.
- Getting it running: **`docs/operator-quickstart.md`**

## What is actually here

```
appview/global-ui-w5n8p3q6/svelte/     the only runnable thing in the repo
CLAUDE.md MCP_TOOLS.md PROJECT.jsonld  descriptions of the intended system
kotodama.jsonld etzhayyim.json         actor / deployment manifests
NOTICE OWNERS README.edn migration.edn identity and licensing
```

The measured shape of the Svelte app, from a clean `pnpm install`:

| | |
|---|---|
| Hand-written application source | **849 bytes** — `App.svelte` 434, `main.ts` 122, `svelte.d.ts` 136, `test/global.test.ts` 157 |
| `pnpm-lock.yaml` | 64,565 bytes — **74% of the whole repository** |
| `pnpm test` | 1 file, 1 test, passes. The test is `expect(true).toBe(true)` |
| `pnpm build` | succeeds; `dist/` is 402 B html + 2.66 kB js + 240 B css |
| three.js / Threlte / d3 in that bundle | **0 bytes** — they are installed but nothing imports them |

`App.svelte` renders one heading and the sentence *"Vite entry scaffold after
SvelteKit cleanup."* That is the entire user-visible surface.

## What the other documents describe that is not here

These are not stale opinions — they are references to files that do not exist at
the paths given, because those paths are pre-extraction monorepo paths.

- **`MCP_TOOLS.md`** specifies 11 JSON-RPC tools at `POST /api/mcp`
  (`global.list_resources`, `global.get_graph`, `global.get_cofog_overview`, …).
  Its "Implementation References" section names
  `60-apps/etzhayyim-project-global/wasm/global-ui-w5n8p3q6/global-mcp-routes.go`
  and `…/svelte/src/lib/api/mcp.ts`. **Neither file is in this repository, and
  there is no Go source and no `src/lib/` here at all.** Its "Local Dev" section
  names two shell scripts under `legacy-runtime/`, which was not extracted either.
  Treat the document as a contract to implement against, not as a description of
  running code.
- **`CLAUDE.md`** describes a Threlte 3D viewer and a d3 force-directed graph
  layer. The dependencies for both are declared in `package.json` and install
  cleanly; no source file imports them. `CLAUDE.md` is accurate that these are
  intentional and not dead deps — it is the *current state* section, not the
  dependency rationale, that you should trust: it already says the app is a
  placeholder.
- **`PROJECT.jsonld`** lists six deployment milestones as `"Done"`, including
  *"Production access verification"*, *"Production smoke against global domain"*
  and *"Deploy global-app and expose /api/mcp"*. Measured 2026-08-18:
  `global.etzhayyim.com` is **NXDOMAIN**, as is `1.etzhayyim.com`, the scheduler
  target named in the same file. Those milestones were true of a deployment that
  no longer resolves. `https://global.etzhayyim.com/systems`, `/resource-flow`
  and `/resources` are not reachable.
- **`appview/README.md`** points at `projects/*/wasm/*-component` and a
  `legacy-runtime` implementation "kept for compatibility". No `wasm/` or
  `legacy-runtime/` directory was extracted.

## Known defects in what *is* here

- **`tailwind.config.js` cannot be loaded.** It imports
  `@etzhayyim/design-system/plugin`, which is not in `package.json`; importing the
  file gives `ERR_MODULE_NOT_FOUND`. Its `content` globs point five levels up at
  `packages/ts/design-system/dist`, which does not exist here, and two of the
  three globs are duplicates of each other. The production build succeeds anyway,
  which is the proof that nothing in the build path loads this file — the 240 B of
  emitted CSS all comes from the `<style>` block inside `App.svelte`. Wiring
  Tailwind up will take more than adding an import.
- **`vitest.config.ts` inlines two packages that are not dependencies** —
  `@etzhayyim/sdk-mock` and `@noble/hashes`. Harmless while no test imports them.
- **Both `favicon.png` files are the same 1×1 grayscale placeholder** (68 bytes,
  identical sha1), one at `static/`, one at `svelte/static/`.
- **`default.conf` is an nginx config**, while `kotodama.jsonld` declares
  `runtimeType: worker` serving `/wasm/svelte/dist` on `0.0.0.0:8080`. Two
  different serving stories are checked in; neither is exercised by anything here.

`pnpm check` failed on a clean checkout until 2026-08-18 — `svelte-check` reported
*"No Svelte configuration found in vite config"* because the repository had no
`svelte.config.js`. A three-line `svelte.config.js` was added; `pnpm check` now
reports 115 files, 0 errors. That is the only behavioural change made while
writing this README.

## If you are here to build the real thing

The order that the checked-in documents imply, and which nothing here blocks:

1. Implement `MCP_TOOLS.md`'s tool surface behind `POST /api/mcp`. The document is
   specific enough to code against — every tool has arguments and a result shape.
2. Add the MCP client the frontend needs, at the path `MCP_TOOLS.md` already
   names: `src/lib/api/mcp.ts`.
3. Replace the `App.svelte` placeholder with the three routes `PROJECT.jsonld`
   names — `/systems`, `/resource-flow`, `/resources`. Note that this workspace
   requires single-page apps addressed by fragment, not a second HTML document.
4. Only then does the Threlte + d3 dependency set start earning its place.

When you do any of this, `docs/verify-docs-claims.cljs` will go red, because this
README asserts those files are absent. That is deliberate: it is what stops this
page from quietly becoming as wrong as the documents it is warning you about.

## Verification

```bash
nbb docs/verify-docs-claims.cljs   # the factual claims above still hold
nbb docs/verify-custody.cljs       # extraction is byte-identical to its source
```

Exit `0` = pass, `1` = fail, `3` = could not determine. `3` exists so that "I could
not run the check" never returns the same value as "I ran it and found nothing".
