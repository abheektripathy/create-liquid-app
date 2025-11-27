"use client";
import { useAccount } from "wagmi";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { useNexus } from "./nexus/NexusProvider";
import { type EthereumProvider } from "@avail-project/nexus-core";

const NexusInitButton = () => {
  const { status, connector } = useAccount();
  const { handleInit, loading, nexusSDK } = useNexus();

  const handleInitWithLoading = async () => {
    const provider = (await connector?.getProvider()) as EthereumProvider;
    await handleInit(provider);
  };

  if (status === "connected" && !nexusSDK?.isInitialized()) {
    return (
      <Button onClick={handleInitWithLoading} className="h-10">
        {loading ? (
          <Loader2 className="animate-spin size-5 text-primary-foreground" />
        ) : (
          "Connect Nexus"
        )}
      </Button>
    );
  }

  return null;
};

export default NexusInitButton;
