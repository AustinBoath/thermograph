#!/usr/bin/env node
// start.js — launches logger and server together in one terminal

const { spawn } = require("child_process");
const path = require("path");

function run(label, file, color) {
  const proc = spawn(process.execPath, [path.join(__dirname, file)], {
    stdio: ["ignore", "pipe", "pipe"]
  });

  const prefix = `\x1b[${color}m[${label}]\x1b[0m `;

  proc.stdout.on("data", (d) =>
    d.toString().split("\n").filter(Boolean).forEach((l) => console.log(prefix + l))
  );
  proc.stderr.on("data", (d) =>
    d.toString().split("\n").filter(Boolean).forEach((l) => console.error(prefix + l))
  );
  proc.on("exit", (code) => {
    console.error(`${prefix}exited with code ${code}`);
    process.exit(code ?? 1);
  });

  return proc;
}

console.log("\x1b[32m🌡️  HomeKit Temp Logger — starting up\x1b[0m\n");

const logger = run("LOGGER", "logger.js", "36"); // cyan
const server = run("SERVER", "server.js", "35"); // magenta

// Clean shutdown on Ctrl-C
process.on("SIGINT", () => {
  console.log("\n\x1b[33mShutting down…\x1b[0m");
  logger.kill();
  server.kill();
  setTimeout(() => process.exit(0), 300);
});
