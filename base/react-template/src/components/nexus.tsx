"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FastBridge from "./fast-bridge/fast-bridge";
import { useAccount } from "wagmi";
import { useNexus } from "./nexus/NexusProvider";
import UnifiedBalance from "./unified-balance/unified-balance";

export default function Nexus() {
  const { address } = useAccount();
  const { nexusSDK } = useNexus();
  if (!nexusSDK) return null;
  return (
    <div className="flex items-center justify-center w-full max-w-xl flex-col gap-6 z-10">
      <Tabs defaultValue="balance" className="w-full items-center">
        <TabsList>
          <TabsTrigger value="balance">Unified Balance</TabsTrigger>
          <TabsTrigger value="bridge">Send Tokens</TabsTrigger>
        </TabsList>
        <TabsContent
          value="balance"
          className="w-full items-center flex justify-center"
        >
          <UnifiedBalance />
        </TabsContent>
        <TabsContent
          value="bridge"
          className="w-full items-center flex justify-center bg-transparent"
        >
          <FastBridge connectedAddress={address ?? `0x`} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
