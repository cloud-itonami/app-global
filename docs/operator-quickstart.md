# Operator quickstart — app-global

Every command below was run top-to-bottom on 2026-08-18 (macOS 26.3, arm64) and the
output shown is the output it produced. Where a step does something other than what
the checked-in documents lead you to expect, that is called out rather than omitted.

Prerequisites: `git`, `node`, `pnpm`. `nbb` is needed only for the two verifiers in
step 6 (`npm i -g nbb`; measured with nbb 1.4.210). Measured here with node v26.3.0,
pnpm 10.26.2.

There is nothing to deploy and nothing to configure. `global.etzhayyim.com` does not
resolve; see `README.md`.

## 1. Clone

```bash
git clone git@github.com:cloud-itonami/app-global.git
cd app-global
```

The whole repository is 31 tracked files. Only one directory is runnable:

```bash
cd appview/global-ui-w5n8p3q6/svelte
```

Every command from here to step 5 runs in that directory.

## 2. Install

```bash
pnpm install --frozen-lockfile
```

`pnpm-lock.yaml` is a v9 lockfile and installs clean — 8 dependencies, 11 dev
dependencies, ~5 s warm. `pnpm-workspace.yaml` allowlists exactly one package to run
build scripts (`esbuild`), so nothing else is asked to compile.

All eight runtime dependencies (`three`, `@threlte/core`, `@threlte/extras`,
`@threlte/flex`, `@types/three`, `d3-force-3d`, `d3-interpolate`, `d3-scale`) install
and none of them are imported by any source file. Step 4 shows the consequence.

## 3. Test

```bash
pnpm test
```

```
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

The single test is `expect(true).toBe(true)`. It passes, and it constrains nothing.
Do not read this green as coverage.

## 4. Build

```bash
pnpm build
```

```
✓ 134 modules transformed.
dist/index.html                 0.40 kB │ gzip: 0.28 kB
dist/assets/index-C-zwCK5o.css  0.24 kB │ gzip: 0.21 kB
dist/assets/index-BklnHfuO.js   2.66 kB │ gzip: 1.31 kB
```

2.66 kB of JavaScript is the whole application. Grepping the emitted bundle for
`threlte`, `THREE.` or `d3-force` returns **zero** matches — the 3D and graph
dependencies are declared but unreachable from the entry point.

The 240 bytes of CSS come from the `<style>` block inside `App.svelte`. Tailwind is
configured but not wired in: `tailwind.config.js` imports
`@etzhayyim/design-system/plugin`, which is not a dependency, and
`node -e "import('./tailwind.config.js')"` fails with `ERR_MODULE_NOT_FOUND`. The
build succeeding is the proof that nothing in the build path reads that file.

Serving `dist/` gives you one page containing the words *"Vite entry scaffold after
SvelteKit cleanup."*

## 5. Type-check

```bash
pnpm check
```

```
COMPLETED 115 FILES 0 ERRORS 0 WARNINGS 0 FILES_WITH_PROBLEMS
```

Before 2026-08-18 this step failed on a clean checkout with *"No Svelte configuration
found in vite config"*, because the repository had no `svelte.config.js`. One was
added; it is three lines and does nothing but supply `vitePreprocess()`.

## 6. Verify the documentation still describes the repository

Back at the repository root:

```bash
cd ../../..
nbb docs/verify-docs-claims.cljs
nbb docs/verify-custody.cljs
```

```
SCANNED	31 tracked file / 4 source file / 4 import 行 / 10 主張
PASS — README.md の 10 個の主張は今日も成り立つ

SCANNED	24 保管ファイル / 8 追加物 / 3 検査
PASS — 保管対象 24 ファイルは出所と同一
```

`verify-docs-claims` pins the factual assertions in `README.md` — that there is no Go
source, no `src/lib/`, no `three`/`Threlte`/`d3` import, and that the byte counts in
the README's table are still the byte counts on disk. **It is expected to go red when
somebody starts implementing.** That is the point: it forces `README.md` to be
updated in the same change rather than drifting into the state `MCP_TOOLS.md` and
`PROJECT.jsonld` are already in.

`verify-custody` reconstructs the extraction's source tree and compares it with the
hash recorded in `migration.edn`. Adding a file means adding it to
`:identity :allowed-additions`, or custody fails.

Both exit `0` on pass, `1` on fail, and `3` when they could not determine an answer —
missing input, unreadable input, or not being run from the repository root. `3` is a
distinct value on purpose, so that "the check did not run" can never be mistaken for
"the check found nothing".

Add `--origin` to `verify-custody` to also compare against the source tree as GitHub
serves it today (needs an authenticated `gh`).

## 7. What to do next

Nothing here is blocked on setup. The gap is the entire backend: `MCP_TOOLS.md`
specifies 11 JSON-RPC tools at `POST /api/mcp` and no implementation of them exists
in this repository. See the last section of `README.md` for the order the checked-in
documents imply.
