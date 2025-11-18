import { execa } from "execa";

export async function run(cmd: string, args: string[], cwd?: string) {
  const subprocess = execa(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  return subprocess;
}

export async function detectPackageManager() {
  // Prefer pnpm, else bun, yarn, npm
  const candidates = [
    { name: "pnpm", check: ["--version"], install: ["install"], add: ["add"] },
    { name: "bun", check: ["--version"], install: ["install"], add: ["add"] },
    { name: "yarn", check: ["--version"], install: ["install"], add: ["add"] },
    {
      name: "npm",
      check: ["--version"],
      install: ["install"],
      add: ["install"],
    },
  ];

  for (const c of candidates) {
    try {
      await execa(c.name, c.check, { stdio: "ignore" });
      return c;
    } catch (_) {}
  }
  return null;
}
