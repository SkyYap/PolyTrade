"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { MarketCreationForm } from "~~/components/markets/MarketCreationForm";
import { MarketPreview } from "~~/components/markets/MarketPreview";
import { MarketValidationStatus } from "~~/components/markets/MarketValidationStatus";
import { CreationProgress } from "~~/components/markets/CreationProgress";

export interface MarketFormData {
  question: string;
  platform: "polymarket" | "kalshi";
  category: string;
  endDate: string;
  liquidityThreshold: number;
  description: string;
  tags: string[];
  outcomeType: "binary" | "multiple" | "scalar";
  outcomes?: string[];
  minValue?: number;
  maxValue?: number;
  unit?: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  confidenceScore: number;
  meetsLiquidityRequirement: boolean;
  hasReasonableTimeframe: boolean;
  suggestions: string[];
}

const CreateMarket: NextPage = () => {
  const { address } = useAccount();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState<"form" | "preview" | "creating" | "success">("form");
  const [formData, setFormData] = useState<MarketFormData>({
    question: "",
    platform: "polymarket",
    category: "",
    endDate: "",
    liquidityThreshold: 1000,
    description: "",
    tags: [],
    outcomeType: "binary",
  });
  
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdMarketId, setCreatedMarketId] = useState<string | null>(null);

  const handleFormChange = (newData: Partial<MarketFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
    setError(null);
  };

  const handleValidationResult = (result: ValidationResult) => {
    setValidation(result);
  };

  const handleFormSubmit = async () => {
    if (!validation?.isValid) {
      setError("Please fix validation issues before proceeding");
      return;
    }
    
    setCurrentStep("preview");
  };

  const handlePreviewConfirm = async () => {
    try {
      setCurrentStep("creating");
      setError(null);

      // Here you would integrate with your smart contract or API
      // For now, we'll simulate the creation process
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success
      const mockMarketId = `market_${Date.now()}`;
      setCreatedMarketId(mockMarketId);
      setCurrentStep("success");
      
    } catch (err) {
      console.error("Market creation failed:", err);
      setError(err instanceof Error ? err.message : "Failed to create market");
      setCurrentStep("preview");
    }
  };

  const handleStartOver = () => {
    setCurrentStep("form");
    setFormData({
      question: "",
      platform: "polymarket",
      category: "",
      endDate: "",
      liquidityThreshold: 1000,
      description: "",
      tags: [],
      outcomeType: "binary",
    });
    setValidation(null);
    setError(null);
    setCreatedMarketId(null);
  };

  const handleGoToMarket = () => {
    if (createdMarketId) {
      router.push(`/markets/${createdMarketId}`);
    }
  };

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center">
              <div className="mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-warning" />
              </div>
              <h2 className="card-title justify-center text-2xl mb-2">Wallet Not Connected</h2>
              <p className="text-base-content/70 mb-6">
                You need to connect your wallet to create markets on the blockchain.
              </p>
              <div className="card-actions justify-center">
                <button 
                  onClick={() => router.push("/markets")}
                  className="btn btn-outline"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to Markets
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push("/markets")}
              className="btn btn-ghost btn-sm"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Markets
            </button>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Create New Market</h1>
          </div>
          
          <p className="text-lg text-base-content/70 max-w-2xl">
            Create a new prediction market on Polymarket or Kalshi. Our smart contract will validate 
            your market and track arbitrage opportunities automatically.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <CreationProgress currentStep={currentStep} />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6">
            <ExclamationTriangleIcon className="w-6 h-6" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="btn btn-sm btn-ghost">
              ×
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column - Form/Preview */}
          <div className="lg:col-span-8">
            {currentStep === "form" && (
              <MarketCreationForm
                data={formData}
                onChange={handleFormChange}
                onSubmit={handleFormSubmit}
                onValidationResult={handleValidationResult}
                isValidating={isValidating}
                validation={validation}
              />
            )}

            {currentStep === "preview" && (
              <MarketPreview
                data={formData}
                validation={validation}
                onConfirm={handlePreviewConfirm}
                onBack={() => setCurrentStep("form")}
                onEdit={() => setCurrentStep("form")}
              />
            )}

            {currentStep === "creating" && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center py-16">
                  <div className="mx-auto w-16 h-16 mb-6">
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Creating Your Market</h2>
                  <p className="text-base-content/70 mb-4">
                    Please wait while we process your market creation on the blockchain...
                  </p>
                  <div className="steps steps-horizontal max-w-md mx-auto">
                    <div className="step step-primary">Validate</div>
                    <div className="step step-primary">Deploy</div>
                    <div className="step">Confirm</div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === "success" && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body text-center py-16">
                  <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircleIcon className="w-10 h-10 text-success" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Market Created Successfully! 🎉</h2>
                  <p className="text-base-content/70 mb-6">
                    Your market has been created and deployed to the blockchain. It's now live and ready for trading.
                  </p>
                  
                  <div className="bg-base-200 rounded-lg p-4 mb-6">
                    <div className="text-sm text-base-content/70 mb-1">Market ID</div>
                    <div className="font-mono text-lg">{createdMarketId}</div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleGoToMarket}
                      className="btn btn-primary"
                    >
                      <BoltIcon className="w-4 h-4" />
                      View Market
                    </button>
                    <button
                      onClick={handleStartOver}
                      className="btn btn-outline"
                    >
                      Create Another Market
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Validation & Help */}
          <div className="lg:col-span-4">
            <div className="sticky top-4 space-y-6">
              {/* Validation Status */}
              {(currentStep === "form" || currentStep === "preview") && (
                <MarketValidationStatus
                  validation={validation}
                  isValidating={isValidating}
                />
              )}

              {/* Help & Tips */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-4">
                    <InformationCircleIcon className="w-5 h-5 text-info" />
                    <h3 className="font-semibold">Tips for Success</h3>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <strong>Clear Questions:</strong> Make sure your question is unambiguous and has a clear resolution criteria.
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <strong>Reasonable Timeframe:</strong> Markets should resolve within 1 day to 1 year for optimal liquidity.
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <strong>Sufficient Liquidity:</strong> Higher liquidity thresholds attract more traders and arbitrageurs.
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <strong>Choose Platform Wisely:</strong> Consider the audience and market types each platform specializes in.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Info */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="font-semibold mb-4">Platform Comparison</h3>
                  
                  <div className="space-y-4">
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <strong className="text-sm">Polymarket</strong>
                      </div>
                      <div className="text-xs text-base-content/70">
                        • Crypto-native audience<br/>
                        • Global events & politics<br/>
                        • USDC-based trading<br/>
                        • Lower fees (2% on winnings)
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-secondary rounded-full"></div>
                        <strong className="text-sm">Kalshi</strong>
                      </div>
                      <div className="text-xs text-base-content/70">
                        • CFTC-regulated platform<br/>
                        • US-focused events<br/>
                        • USD-based trading<br/>
                        • Traditional finance feel
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMarket;
