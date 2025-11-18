"use client";

import FastBridge from "@/components/fast-bridge/fast-bridge";
import UnifiedBalance from "@/components/unified-balance/unified-balance";
import { SUPPORTED_CHAINS } from "@avail-project/nexus-core";
import { ConnectKitButton } from "connectkit";
import Image from "next/image";
import { Hex } from "viem";
import { useAccount, useDisconnect } from "wagmi";

export default function Home() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col py-20 px-16 bg-white dark:bg-black">
        {/* Header with logos and address */}
        <div className="flex w-full items-center justify-between mb-16">
          <div className="flex items-center gap-6">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={100}
              height={20}
              priority
            />
            <span className="text-zinc-400 dark:text-zinc-600">+</span>
            <Image
              src="/connectkit-logo.png"
              alt="ConnectKit logo"
              width={40}
              height={40}
              priority
            />
            <span className="text-zinc-400 dark:text-zinc-600">+</span>
            <Image
              src="/avail-logo.png"
              className="rounded-lg!"
              alt="Avail logo"
              width={40}
              height={40}
              priority
            />
          </div>
          {isConnected && address ? (
            <div className="flex items-center gap-3">
              <div className="text-sm text-zinc-500 dark:text-zinc-500">
                {formatAddress(address)}
              </div>
              <button
                onClick={() => disconnect()}
                className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Disconnect wallet"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-zinc-500 dark:text-zinc-500"
                >
                  <path
                    d="M1 1L13 13M1 13L13 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <ConnectKitButton.Custom>
              {({ show }) => (
                <button
                  onClick={show}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-8 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[180px]"
                >
                  Connect Wallet
                </button>
              )}
            </ConnectKitButton.Custom>
          )}
        </div>

        {address && (
          <div className="flex flex-col space-y-10 mx-auto">
            <UnifiedBalance />
            <FastBridge
              connectedAddress={address as Hex}
              onComplete={() => {
                console.log("congrats bridge is complete");
              }}
              prefill={{
                token: "USDC",
                chainId: SUPPORTED_CHAINS.BASE,
              }}
              onError={(e) => {
                console.error("congrats bridge has error", e);
              }}
              onStart={() => {
                console.log("bridge is starting");
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
