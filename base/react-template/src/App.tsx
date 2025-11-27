import Background from "@/components/background";
import ConnectWallet from "@/components/connect-wallet";
import Nexus from "@/components/nexus";
import NexusInitButton from "@/components/nexus-init";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export default function Home() {
  return (
    <Background>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-card/20">
        <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 md:p-12 gap-y-4">
          <div className="flex flex-col items-center justify-center gap-y-4 max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm font-medium text-primary">
                Welcome to Avail Nexus
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Avail Nexus{" "}
              <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                Vite
              </span>{" "}
              Template
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Explore Nexus Elements to install pre-built components via
              shadcn/ui. <br /> Build once, scale anywhere.
            </p>
          </div>
          <div className="flex items-center justify-center gap-x-3">
            <ConnectWallet />
            <NexusInitButton />
            <a href={"https://elements.nexus.availproject.org"} target="_blank">
              <Button
                variant={"link"}
                className="bg-accent-foreground text-primary-foreground flex items-center justify-center gap-x-2 h-10"
              >
                <ArrowUpRight className="size-4" />
                Vist Nexus Elements
              </Button>
            </a>
          </div>

          {/* Nexus Component */}
          <div className="w-full max-w-4xl mt-8 flex items-center justify-center">
            <Nexus />
          </div>
        </div>
      </div>
    </Background>
  );
}
