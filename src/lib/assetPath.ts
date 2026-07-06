/**
 * Exercise image paths in src/data/exercises.ts are plain string data (not Vite-analyzed
 * imports), so Vite's `base` rewriting never touches them at build time. This resolves
 * them against the actual configured base (e.g. '/workout-me/' on GitHub Pages, '/' in dev).
 */
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
