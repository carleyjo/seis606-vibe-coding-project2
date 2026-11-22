import { readdir, stat } from "node:fs/promises";

async function sourceBytes(directory) {
  let total = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    total += entry.isDirectory() ? await sourceBytes(path) : (await stat(path)).size;
  }
  return total;
}

const bytes = await sourceBytes("src");
if (bytes >= 100 * 1024) throw new Error(`Source bundle budget exceeded: ${bytes} bytes`);
console.log(`Source size check passed: ${bytes} bytes`);
