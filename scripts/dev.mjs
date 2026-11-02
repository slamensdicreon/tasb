import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// Some preview hosts pass Vite's flag names. Next supports the same explicit
// host/port combination; an occupied explicit port is already an error.
const args = process.argv
  .slice(2)
  .filter((flag) => flag !== "--strictPort")
  .map((flag) => (flag === "--host" ? "--hostname" : flag));
const child = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), "dev", ...args],
  { stdio: "inherit" },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, () => child.kill(signal));
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
