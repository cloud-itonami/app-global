import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

// svelte-check resolves the Svelte config through vite.config.ts, and errors with
// "No Svelte configuration found in vite config" when neither the plugin nor this
// file supplies one. Without it `pnpm check` fails on a clean checkout.
export default { preprocess: vitePreprocess() }
