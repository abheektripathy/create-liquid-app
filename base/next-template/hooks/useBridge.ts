"use client";

import { useState, useCallback } from "react";
import { useNexus } from "@/components/nexus/NexusProvider";
import { toast } from "sonner";
import {
  BridgeResult,
  SimulationResult,
  TOKEN_METADATA,
  NEXUS_EVENTS,
  BridgeStepType,
} from "@avail-project/nexus-core";
import { parseUnits } from "viem";

// Define event handler parameter type
interface NexusEvent {
  name: string;
  args: unknown;
}

interface BridgeParams {
  token: string;
  amount: string;
  toChainId: number;
}

export function useBridge() {
  const { nexusSDK } = useNexus();
  const [isBridging, setIsBridging] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [steps, setSteps] = useState<BridgeStepType[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentStepDescription, setCurrentStepDescription] = useState("");

  const simulateBridge = useCallback(
    async ({ token, amount, toChainId }: BridgeParams) => {
      if (!nexusSDK) {
        toast.error("SDK not initialized");
        return null;
      }

      if (!amount || parseFloat(amount) <= 0) {
        toast.error("Please enter a valid amount");
        return null;
      }

      setIsSimulating(true);
      setCurrentStep("Simulating bridge...");

      try {
        const tokenMetadata =
          TOKEN_METADATA[token as keyof typeof TOKEN_METADATA];
        if (!tokenMetadata) {
          throw new Error(`Token ${token} not supported`);
        }

        const amountWei = parseUnits(amount, tokenMetadata.decimals);
        const result = await nexusSDK.simulateBridge({
          token: token as keyof typeof TOKEN_METADATA,
          amount: amountWei,
          toChainId,
        });
        setSimulation(result);
        setCurrentStep("");
        return result;
      } catch (error) {
        console.error("Simulation error:", error);
        toast.error(
          error instanceof Error ? error.message : "Simulation failed",
        );
        setCurrentStep("");
        return null;
      } finally {
        setIsSimulating(false);
      }
    },
    [nexusSDK],
  );

  const executeBridge = useCallback(
    async ({ token, amount, toChainId }: BridgeParams) => {
      if (!nexusSDK) {
        toast.error("SDK not initialized");
        return { success: false, error: "SDK not initialized" };
      }

      setIsBridging(true);
      setCurrentStep("Preparing transaction...");
      setSteps([]);
      setCurrentStepIndex(0);

      try {
        const tokenMetadata =
          TOKEN_METADATA[token as keyof typeof TOKEN_METADATA];
        if (!tokenMetadata) {
          toast.error(`Token ${token} not supported`);
          throw new Error(`Token ${token} not supported`);
        }

        setCurrentStep("Initiating bridge...");
        const amountWei = parseUnits(amount, tokenMetadata.decimals);

        const result: BridgeResult = await nexusSDK.bridge(
          {
            token: token as keyof typeof TOKEN_METADATA,
            amount: amountWei,
            toChainId,
          },
          {},
        );
        setCurrentStep("");

        const explorerUrl = result.explorerUrl;
        if (explorerUrl) {
          toast.success(`Successfully bridged ${amount} ${token}!`, {
            duration: 8000,
            action: {
              label: "View Transaction",
              onClick: () => window.open(explorerUrl, "_blank"),
            },
          });

          return { success: true, explorerUrl };
        } else {
          toast.error(
            "Bridge transaction failed - no transaction hash returned",
          );
          return { success: false, error: "No transaction hash returned" };
        }
      } catch (error) {
        console.error("Bridge error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Bridge transaction failed";
        toast.error(errorMessage, { duration: 8000 });
        setCurrentStep("Transaction failed");
        return { success: false, error: errorMessage };
      } finally {
        setIsBridging(false);
      }
    },
    [nexusSDK, steps, setCurrentStep],
  );

  return {
    isBridging,
    isSimulating,
    currentStep,
    simulation,
    simulateBridge,
    executeBridge,
    steps,
    currentStepIndex,
    currentStepDescription,
  };
}
