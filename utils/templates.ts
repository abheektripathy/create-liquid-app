export type Framework = "next" | "react-vite" | "svelte";
export type WidgetFlavor = "nexus-widgets" | "nexus-core" | "nexus-elements";
export type AuthProvider = "privy" | "dynamic" | "wagmi-familyconnect";

//update repos to point here at the base repos
export const TEMPLATE_SOURCES: Record<
  Framework,
  { repo: string; branch?: string }
> = {
  next: {
    repo: "git@github.com:abheektripathy/nexus-connectkit-next.git",
    branch: "main",
  },
  "react-vite": {
    repo: "git@github.com:abheektripathy/nexus-vite-react-template.git",
    branch: "main",
  },
  svelte: {
    repo: "git@github.com:abheektripathy/nexus-sveltekit-template.git",
    branch: "main",
  },
};
