#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import path from "path";
import fs from "fs-extra";
import { input, select } from "@inquirer/prompts";
import degit from "degit";
import { z } from "zod";
import { detectPackageManager, run } from "./utils/exec.js";
import {
  TEMPLATE_SOURCES,
  SUPPORTED_OPTIONS,
  type Framework,
  type WidgetFlavor,
  type AuthProvider,
} from "./utils/templates.js";
import { applyCustomizations } from "./utils/customize.js";
import { asciiArt } from "./utils/ascii.js";

const program = new Command();

console.log("\n" + chalk.cyanBright(asciiArt) + "\n");

program
  .name("create-liquid-apps")
  .description("Scaffold an Avail Nexus demo app with your preferences")
  .version("1.0.0");

program
  .argument("[dir]", "Directory name for the new app")
  .option("--framework <name>", "Framework: next | react-vite | svelte")
  .option("--widgets <name>", "Widgets flavor: nexus-widgets | nexus-core")
  .option(
    "--auth <name>",
    "Auth provider: privy | dynamic | wagmi-familyconnect",
  )
  .action(async (dirArg: string | undefined, opts: Record<string, string>) => {
    const dir =
      dirArg ??
      (await input({
        message: "Project directory name:",
        default: "liquid-app",
      }));
    let framework = (opts.framework ??
      (await select<Framework>({
        message: "Choose a framework:",
        choices: [
          {
            name: "Next.js",
            value: "next",
            description:
              "Recommended full-stack React framework with SSR support",
          },
          {
            name: "React + Vite",
            value: "react-vite",
            description:
              "Lightweight React setup with Vite for faster development",
          },
          {
            name: "Svelte (Kit) (Coming Soon)",
            value: "svelte",
            disabled: true,
            description: "Compile-time framework with minimal runtime code",
          },
        ],
      }))) as Framework;

    const widgetChoices: Array<{
      name: string;
      value: WidgetFlavor;
      description: string;
      disabled?: boolean;
    }> =
      framework === "react-vite"
        ? [
            {
              name: "Nexus Elements (plug & play shadcn elements for easy integrations + customisability)",
              value: "nexus-elements",
              description:
                "Shadcn UI components powered by Nexus Core for easy integration & customizability",
            },
          ]
        : [
            {
              name: "Nexus Core (lower-level SDK)",
              value: "nexus-core",
              description:
                "Build custom UI with Avail's core SDK for maximum flexibility",
            },
            {
              name: "Nexus Elements (plug & play shadcn elements for easy integrations + customisability)",
              value: "nexus-elements",
              description:
                "Shadcn UI components powered by Nexus Core for easy integration & customizability",
            },
          ];

    let widgets = (opts.widgets ??
      (await select<WidgetFlavor>({
        message: "Choose Nexus's Iteration to use",
        choices: widgetChoices,
      }))) as WidgetFlavor;

    let auth = (opts.auth ??
      (await select<AuthProvider>({
        message: "Choose auth/provider:",
        choices: [
          {
            name: "Privy",
            value: "privy",
            description:
              "Simple wallet and social login with embedded wallet creation",
          },
          {
            name: "Dynamic",
            value: "dynamic",
            description:
              "Multi-chain authentication with embedded wallet support",
          },
          {
            name: "Wagmi + ConnectKit",
            value: "wagmi-familyconnect",
            description:
              "Popular React hooks library with smart account support",
          },
        ],
      }))) as AuthProvider;

    if (
      framework !== "next" &&
      framework !== "react-vite" &&
      framework === "svelte"
    ) {
      console.log(
        chalk.yellow(
          "Only Next.js and React+Vite are currently supported. Defaulting to Next.js.",
        ),
      );
      framework = "next" as Framework;
    }

    if (
      auth !== "wagmi-familyconnect" &&
      (auth === "privy" || auth === "dynamic")
    ) {
      console.log(
        chalk.yellow(
          "Only Wagmi + ConnectKit is currently supported. Defaulting to Wagmi + ConnectKit.",
        ),
      );
      auth = "wagmi-familyconnect" as AuthProvider;
    }

    if (framework === "react-vite" && widgets !== "nexus-elements") {
      console.log(
        chalk.yellow(
          "Only Nexus Elements is currently supported for React+Vite. Defaulting to Nexus Elements.",
        ),
      );
      widgets = "nexus-elements" as WidgetFlavor;
    } else if (
      framework !== "react-vite" &&
      widgets !== "nexus-core" &&
      widgets !== "nexus-elements" &&
      widgets === "nexus-widgets"
    ) {
      console.log(
        chalk.yellow(
          "Only Nexus Core and Nexus Elements are currently supported. Defaulting to Nexus Core.",
        ),
      );
      widgets = "nexus-core" as WidgetFlavor;
    }

    const SelectionSchema = z.object({
      framework: z.enum(["next", "react-vite", "svelte"]),
      widgets: z.enum(["nexus-widgets", "nexus-core", "nexus-elements"]),
      auth: z.enum(["privy", "dynamic", "wagmi-familyconnect"]),
      dir: z.string().min(1),
    });

    const selections = SelectionSchema.parse({ framework, widgets, auth, dir });

    const projectDir = path.resolve(process.cwd(), selections.dir);
    if (await fs.pathExists(projectDir)) {
      console.log(
        chalk.red(
          `Directory "${selections.dir}" already exists. Choose another name or remove it.`,
        ),
      );
      process.exit(1);
    }
    await fs.mkdirp(projectDir);

    const spinner = ora(`Cloning ${framework} template...`).start();
    try {
      // Use degit to clone the specific directory from the GitHub repo
      // Format for subdirectory: user/repo/subdir#branch
      const templatePath =
        framework === "react-vite"
          ? TEMPLATE_SOURCES.viteTemplatePath
          : TEMPLATE_SOURCES.templatePath;
      const repoPath = `${TEMPLATE_SOURCES.githubRepo}/${templatePath}#${TEMPLATE_SOURCES.branch}`;
      const emitter = degit(repoPath, {
        cache: false,
        force: true,
        verbose: false,
      });
      await emitter.clone(projectDir);
      spinner.succeed("Template cloned.");
    } catch (err) {
      spinner.fail("Failed to clone template.");
      console.error(err);
      process.exit(1);
    }

    await fs.remove(path.join(projectDir, ".git")).catch(() => {});
    await applyCustomizations(projectDir, framework, widgets, auth);

    const pm = await detectPackageManager();
    const pmName = pm?.name ?? "npm";
    const spinnerInstall = ora(
      `Installing dependencies with ${pmName}...`,
    ).start();
    try {
      if (pmName === "bun") {
        await run("bun", ["install"], projectDir);
      } else {
        await run(pmName, ["install"], projectDir);
      }
      spinnerInstall.succeed("Dependencies installed.");
    } catch (err) {
      spinnerInstall.fail("Failed to install dependencies.");
      console.error(err);
      console.log(chalk.yellow("You can manually run installation later."));
    }

    try {
      await run("git", ["init"], projectDir);
      await run("git", ["add", "."], projectDir);
      await run(
        "git",
        ["commit", "-m", "chore(init): scaffold with create-liquid-apps"],
        projectDir,
      );
    } catch (err) {
      console.log(
        chalk.yellow("Git init failed or git is not available. Skipping."),
      );
    }

    console.log();
    console.log(
      chalk.bold(`Success! Created ${selections.dir} using ${framework}.`),
    );
    console.log();
    console.log(`Next steps:`);
    console.log(`  1. cd ${selections.dir}`);
    if (framework === "next") {
      console.log(`  2. Set env in .env.local (see .env.local.example)`);
      console.log(
        `  3. ${pmName === "bun" ? "bun run dev" : `${pmName} run dev`}`,
      );
    } else if (framework === "react-vite") {
      console.log(`  2. Set env in .env (see .env.example)`);
      console.log(
        `  3. ${pmName === "bun" ? "bun run dev" : `${pmName} run dev`}`,
      );
    } else {
      console.log(`  2. Set env in .env (see .env.example)`);
      console.log(
        `  3. ${pmName === "bun" ? "bun run dev" : `${pmName} run dev`}`,
      );
    }
    console.log();
    console.log(chalk.gray(`Scaffolded with choices: ${widgets}, ${auth}`));
  });

program.parseAsync();
