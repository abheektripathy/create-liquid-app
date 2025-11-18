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

        const result = await nexusSDK.simulateBridge({
          token: token as keyof typeof TOKEN_METADATA,
          amount: BigInt(amount),
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

        // Use the bridge method with onEvent to track progress
        const result: BridgeResult = await nexusSDK.bridge(
          {
            token: token as keyof typeof TOKEN_METADATA,
            amount: BigInt(amount),
            toChainId,
          },
          {
            onEvent: (event: NexusEvent) => {
              try {
                if (event.name === NEXUS_EVENTS.STEPS_LIST) {
                  const stepsList = Array.isArray(event.args)
                    ? (event.args as BridgeStepType[])
                    : [];
                  setSteps(stepsList);
                  console.log("Bridge steps:", stepsList);
                }
              } catch (error) {
                console.error("Error processing steps list:", error);
              }
              try {
                if (event.name === NEXUS_EVENTS.STEP_COMPLETE) {
                  const stepIndex =
                    typeof event.args === "number" ? event.args : 0;
                  setCurrentStepIndex(stepIndex);
                  if (steps[stepIndex]) {
                    // Create a readable description based on the step type
                    const step = steps[stepIndex];
                    let description = "";

                    if (typeof step === "object" && step.type) {
                      switch (step.type) {
                        case "ALLOWANCE_USER_APPROVAL":
                          description = "Waiting for allowance approval...";
                          break;
                        case "TRANSACTION_SENT":
                          description =
                            "Transaction sent, waiting for confirmation...";
                          break;
                        default:
                          description = `Processing step: ${step.type}`;
                      }
                    }

                    setCurrentStepDescription(description);
                    setCurrentStep(description);
                  }
                  console.log(`Completed step ${stepIndex}:`, steps[stepIndex]);
                }
              } catch (error) {
                console.error("Error processing step completion:", error);
              }

              try {
                // Handle other custom events - these are not part of NEXUS_EVENTS enum
                // but can be handled as custom events
                if (event.name === "INTENT_CREATED") {
                  console.log("Intent created:", event);
                  toast.info("Please approve the transaction in your wallet", {
                    duration: 10000,
                  });
                }
                if (event.name === "ALLOWANCE_REQUIRED") {
                  console.log("Allowance required:", event);
                  toast.info("Please approve the token allowance", {
                    duration: 10000,
                  });
                }
              } catch (error) {
                console.error("Error handling custom event:", error);
              }
            },
          },
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
