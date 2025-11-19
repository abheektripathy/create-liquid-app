export type Framework = "next" | "react-vite" | "svelte";
export type WidgetFlavor = "nexus-widgets" | "nexus-core" | "nexus-elements";
export type AuthProvider = "privy" | "dynamic" | "wagmi-familyconnect";

export const SUPPORTED_OPTIONS = {
  frameworks: ["next"] as Framework[],
  widgetFlavors: ["nexus-core", "nexus-elements"] as WidgetFlavor[],
  authProviders: ["wagmi-familyconnect"] as AuthProvider[],
};

export const TEMPLATE_SOURCES = {
  localPath: "base/next-template",
};
