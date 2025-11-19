export type Framework = "next" | "react-vite" | "svelte";
export type WidgetFlavor = "nexus-widgets" | "nexus-core" | "nexus-elements";
export type AuthProvider = "privy" | "dynamic" | "wagmi-familyconnect";

export const SUPPORTED_OPTIONS = {
  frameworks: ["next"] as Framework[],
  widgetFlavors: ["nexus-core", "nexus-elements"] as WidgetFlavor[],
  authProviders: ["wagmi-familyconnect"] as AuthProvider[],
};

export const TEMPLATE_SOURCES = {
  // User and repo name in format needed for degit (without https://github.com/)
  githubRepo: "abheektripathy/create-liquid-app",
  branch: "main",
  templatePath: "base/next-template",
};
