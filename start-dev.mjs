// Dev server launcher — sets NODE_ENV then runs tsx
process.env.NODE_ENV = 'development';

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tsx = path.join(__dirname, 'node_modules', 'tsx', 'dist', 'cli.mjs');

const child = spawn(process.execPath, [tsx, 'server/_core/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' },
  cwd: __dirname,
});

child.on('exit', (code) => process.exit(code ?? 0));
