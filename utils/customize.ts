import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import type { WidgetFlavor, AuthProvider, Framework } from "./templates.js";

/**
 * Apply user selections to the cloned template.
 * This function is designed to be idempotent and explicit.
 */
export async function applyCustomizations(
  projectDir: string,
  framework: Framework,
  widgets: WidgetFlavor,
  auth: AuthProvider,
) {
  if (framework === "react-vite") {
    await customizeViteReact(projectDir, widgets, auth);
  } else {
    await customizeNext(projectDir, widgets, auth);
  }
}

async function customizeNext(
  projectDir: string,
  widgets: WidgetFlavor,
  auth: AuthProvider,
) {
  const envPath = path.join(projectDir, ".env.local.example");
  const envLines = ["# Fill these and rename to .env.local"].filter(Boolean);
  await fs.writeFile(envPath, envLines.join("\n"), "utf8");

  const configPath = path.join(projectDir, "liquid.config.json");
  await fs.writeJSON(
    configPath,
    { framework: "next", widgets, auth },
    { spaces: 2 },
  );

  if (widgets === "nexus-core") {
    await removeElementsComponents(projectDir);
  } else if (widgets === "nexus-elements") {
    await replaceWithElementsComponents(projectDir);
  }

  console.log(chalk.green("Applied Next.js customizations."));
}

/**
 * Removes the elements-specific components when nexus-core is chosen
 */
async function removeElementsComponents(projectDir: string) {
  await fs.remove(path.join(projectDir, "components", "common"));
  await fs.remove(path.join(projectDir, "components", "fast-bridge"));
  await fs.remove(path.join(projectDir, "components", "unified-balance"));
  await fs.remove(path.join(projectDir, "app", "elements"));

  console.log(chalk.blue("Removed Elements components for nexus-core setup"));
}

/**
 * Replaces core components with elements components when nexus-elements is chosen
 */
async function replaceWithElementsComponents(projectDir: string) {
  const elementsPagePath = path.join(projectDir, "app", "elements", "page.tsx");
  const mainPagePath = path.join(projectDir, "app", "page.tsx");

  if (await fs.pathExists(elementsPagePath)) {
    const elementsPage = await fs.readFile(elementsPagePath, "utf8");
    await fs.writeFile(mainPagePath, elementsPage, "utf8");
    await fs.remove(path.join(projectDir, "app", "elements"));
  }

  await fs.remove(path.join(projectDir, "components", "BalanceDashboard.tsx"));
  await fs.remove(path.join(projectDir, "components", "BridgeModal.tsx"));
  await fs.remove(path.join(projectDir, "components", "ExecuteModal.tsx"));

  await fs.remove(path.join(projectDir, "hooks", "useAaveDeposit.ts"));
  await fs.remove(path.join(projectDir, "hooks", "useBridge.ts"));

  console.log(
    chalk.blue("Set up Elements as the main UI for nexus-elements setup"),
  );
}

async function customizeViteReact(
  projectDir: string,
  widgets: WidgetFlavor,
  auth: AuthProvider,
) {
  const pkgPath = path.join(projectDir, "package.json");
  const pkg = await fs.readJSON(pkgPath);

  const ensureDeps: Record<string, string> = {
    react: "^18.3.1",
    "react-dom": "^18.3.1",
    vite: "^5.0.0",
  };

  pkg.dependencies = { ...(pkg.dependencies ?? {}), ...ensureDeps };
  await fs.writeJSON(pkgPath, pkg, { spaces: 2 });

  const envPath = path.join(projectDir, ".env.example");
  const envLines = [].filter(Boolean);
  await fs.writeFile(envPath, envLines.join("\n"), "utf8");

  const configPath = path.join(projectDir, "liquid.config.json");
  await fs.writeJSON(
    configPath,
    { framework: "react-vite", widgets, auth },
    { spaces: 2 },
  );

  if (widgets === "nexus-elements") {
    await setupElementsForVite(projectDir);
  }

  console.log(chalk.green("Applied React + Vite customizations."));
}

/**
 * Sets up Elements components for Vite React template
 */
async function setupElementsForVite(projectDir: string) {
  console.log(chalk.blue("Setting up Elements for React+Vite template"));
}
