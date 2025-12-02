const { spawn } = require('child_process');

const isWindows = process.platform === 'win32';
const processes = [
  { name: 'api', args: ['--prefix', 'api', 'run', 'start'] },
  { name: 'ui', args: ['--prefix', 'ui', 'run', 'start'] },
];

const children = [];
let shuttingDown = false;

const shutdown = (code = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  children.forEach((child) => {
    if (child && !child.killed) {
      child.kill();
    }
  });
  process.exit(code);
};

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

processes.forEach(({ name, args }) => {
  const child = spawn('npm', args, {
    stdio: 'inherit',
    shell: isWindows,
  });

  children.push(child);

  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    if (code !== 0) {
      console.error(`${name} exited with code ${code}${signal ? ` (signal ${signal})` : ''}`);
      shutdown(code || 1);
    }
  });
});
