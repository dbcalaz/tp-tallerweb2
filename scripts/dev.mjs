import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const tasks = [
  {
    name: 'API',
    cwd: 'back',
    args: [path.join(projectRoot, 'back', 'node_modules', 'tsx', 'dist', 'cli.mjs'), 'watch', 'src/index.ts'],
  },
  {
    name: 'WEB',
    cwd: 'front',
    args: [path.join(projectRoot, 'front', 'node_modules', '@angular', 'cli', 'bin', 'ng.js'), 'serve'],
  },
];
const children = [];
let stopping = false;

function pipeLines(stream, name, writer) {
  const lines = createInterface({ input: stream });
  lines.on('line', (line) => writer.write('[' + name + '] ' + line + '\n'));
}

for (const task of tasks) {
  const child = spawn(process.execPath, task.args, {
    cwd: path.join(projectRoot, task.cwd),
    shell: false,
    stdio: ['inherit', 'pipe', 'pipe'],
  });
  children.push(child);
  pipeLines(child.stdout, task.name, process.stdout);
  pipeLines(child.stderr, task.name, process.stderr);
  child.on('error', (error) => {
    process.stderr.write('[' + task.name + '] No se pudo iniciar: ' + error.message + '\n');
  });
  child.on('close', (code) => {
    if (!stopping && code !== 0) {
      process.stderr.write('[' + task.name + '] terminó con código ' + code + '.\n');
    }
  });
}

process.stdout.write('Iniciando frontend y backend. Presioná Ctrl+C para detener ambos.\n');
process.on('SIGINT', () => {
  stopping = true;
  for (const child of children) child.kill('SIGINT');
  process.exit(0);
});
