import fs from 'fs';
import path from 'path';

// Cross-platform cleanup script for Windows, macOS, and Linux
const targets = ['dist', 'server.cjs', 'server.cjs.map'];

for (const target of targets) {
  const fullPath = path.resolve(process.cwd(), target);
  try {
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`[Clean] Successfully removed: ${target}`);
    }
  } catch (err) {
    console.warn(`[Clean] Could not remove ${target}:`, err.message);
  }
}
