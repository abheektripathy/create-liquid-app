import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import type { WidgetFlavor, AuthProvider, Framework } from "./templates.ts";

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
  // For now, only Next.js is supported
  await customizeNext(projectDir, widgets, auth);
}

async function customizeNext(
  projectDir: string,
  widgets: WidgetFlavor,
  auth: AuthProvider,
) {
  const envPath = path.join(projectDir, ".env.local.example");
  const envLines = [
    "# Fill these and rename to .env.local",
    "NEXT_PUBLIC_CHAIN_ID=23294",
    "NEXT_PUBLIC_AVAIL_RPC=https://rpc.availproject.org",
  ].filter(Boolean);
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

  if (widgets === "nexus-widgets") {
    ensureDeps["@avail-project/nexus-widgets"] = "^0.1.0";
  } else {
    ensureDeps["@avail-project/nexus-core"] = "^0.1.0";
  }

  if (auth === "privy") {
    ensureDeps["@privy-io/react-auth"] = "^1.0.0";
  } else if (auth === "dynamic") {
    ensureDeps["@dynamic-labs/sdk-react"] = "^1.0.0";
  } else if (auth === "wagmi-familyconnect") {
    ensureDeps["wagmi"] = "^2.12.2";
    ensureDeps["@familyconnect/react"] = "^0.3.0";
  }

  pkg.dependencies = { ...(pkg.dependencies ?? {}), ...ensureDeps };
  await fs.writeJSON(pkgPath, pkg, { spaces: 2 });

  const envPath = path.join(projectDir, ".env.example");
  const envLines = [
    "VITE_PUBLIC_CHAIN_ID=23294",
    "VITE_PUBLIC_AVAIL_RPC=https://rpc.availproject.org",
    auth === "privy" ? "VITE_PRIVY_APP_ID=" : "",
    auth === "dynamic" ? "VITE_DYNAMIC_ENV_ID=" : "",
  ].filter(Boolean);
  await fs.writeFile(envPath, envLines.join("\n"), "utf8");

  const configPath = path.join(projectDir, "liquid.config.json");
  await fs.writeJSON(
    configPath,
    { framework: "react-vite", widgets, auth },
    { spaces: 2 },
  );

  console.log(chalk.green("Applied React + Vite customizations."));
}

async function customizeSvelte(
  projectDir: string,
  widgets: WidgetFlavor,
  auth: AuthProvider,
) {
  const pkgPath = path.join(projectDir, "package.json");
  const pkg = await fs.readJSON(pkgPath);

  const ensureDeps: Record<string, string> = {
    svelte: "^4.2.0",
    "@sveltejs/kit": "^2.0.0",
  };

  if (widgets === "nexus-widgets") {
    ensureDeps["@avail-project/nexus-widgets"] = "^0.1.0";
  } else {
    ensureDeps["@avail-project/nexus-core"] = "^0.1.0";
  }

  if (auth === "privy") {
    ensureDeps["@privy-io/react-auth"] = "^1.0.0"; // If using svelte, replace with appropriate SDK or bridge
  } else if (auth === "dynamic") {
    ensureDeps["@dynamic-labs/sdk-react"] = "^1.0.0"; // Same note as above
  } else if (auth === "wagmi-familyconnect") {
    ensureDeps["wagmi"] = "^2.12.2"; // wagmi is React-specific; consider viem + custom for Svelte
    ensureDeps["@familyconnect/react"] = "^0.3.0";
  }

  pkg.dependencies = { ...(pkg.dependencies ?? {}), ...ensureDeps };
  await fs.writeJSON(pkgPath, pkg, { spaces: 2 });

  const envPath = path.join(projectDir, ".env.example");
  const envLines = [
    "PUBLIC_CHAIN_ID=23294",
    "PUBLIC_AVAIL_RPC=https://rpc.availproject.org",
  ];
  await fs.writeFile(envPath, envLines.join("\n"), "utf8");

  const configPath = path.join(projectDir, "liquid.config.json");
  await fs.writeJSON(
    configPath,
    { framework: "svelte", widgets, auth },
    { spaces: 2 },
  );

  console.log(chalk.green("Applied Svelte customizations."));
}
