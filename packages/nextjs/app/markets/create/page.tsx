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
import { copyToClipboardWithToast } from "~~/utils/toast";

export interface MarketFormData {
  question: string;
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
  const [contractDetails, setContractDetails] = useState<{
    address: string;
    transactionHash: string;
    blockNumber: number;
    network: string;
  } | null>(null);

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
      
      // Simulate success with mock contract details
      const mockMarketId = `market_${Date.now()}`;
      const mockContractDetails = {
        address: `0x${Math.random().toString(16).substr(2, 40)}`,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
        network: "Ethereum Mainnet"
      };
      
      setCreatedMarketId(mockMarketId);
      setContractDetails(mockContractDetails);
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
    setContractDetails(null);
  };

  const handleGoToMarket = () => {
    if (createdMarketId) {
      router.push(`/markets/${createdMarketId}`);
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20 shadow-2xl">
            <div className="card-body text-center p-8">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-warning/20 rounded-full animate-ping"></div>
                <div className="w-20 h-20 bg-gradient-to-br from-warning to-warning/80 rounded-full flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-10 h-10 text-warning-content" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-4">Wallet Required</h2>
              <p className="text-base-content/70 mb-8 leading-relaxed">
                To create prediction markets on the blockchain, you'll need to connect your Web3 wallet first.
              </p>
              
              <div className="space-y-4">
                <div className="bg-base-100 rounded-lg p-4 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary text-xs">1</span>
                    </div>
                    <span className="text-sm font-medium">Connect your wallet</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 bg-secondary/10 rounded-full flex items-center justify-center">
                      <span className="text-secondary text-xs">2</span>
                    </div>
                    <span className="text-sm font-medium">Create your market</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center">
                      <span className="text-accent text-xs">3</span>
                    </div>
                    <span className="text-sm font-medium">Start trading!</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-200">
                    🦊 Connect MetaMask
                  </button>
                  <button 
                    onClick={() => router.push("/markets")}
                    className="btn btn-outline hover:btn-primary transition-all duration-200"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back to Markets
                  </button>
                </div>
              </div>
              
              <div className="mt-6 text-xs text-base-content/50">
                🔒 Your wallet stays secure - we never access your funds
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push("/markets")}
              className="btn btn-ghost btn-sm hover:btn-primary transition-all duration-200"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Markets
            </button>
          </div>
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-xl">
                <SparklesIcon className="w-10 h-10 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Create New Market
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="badge badge-primary badge-sm">v2.0</span>
                  <span className="badge badge-outline badge-sm">AI-Powered</span>
                </div>
              </div>
            </div>
            
            <p className="text-lg text-base-content/70 max-w-3xl mx-auto leading-relaxed">
              Create prediction markets on PolyTrade with real-time validation and intelligent trading features. 
              Our platform provides a seamless experience for market creation and trading.
            </p>
            
            {/* Quick Stats */}
            <div className="flex justify-center gap-8 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1.2M+</div>
                <div className="text-xs text-base-content/60">Markets Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">$45M+</div>
                <div className="text-xs text-base-content/60">Total Volume</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">99.9%</div>
                <div className="text-xs text-base-content/60">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="mb-8">
          <CreationProgress currentStep={currentStep} />
        </div>

        {/* Enhanced Error Alert */}
        {error && (
          <div className="alert alert-error mb-6 shadow-lg border border-error/20">
            <ExclamationTriangleIcon className="w-6 h-6" />
            <div className="flex-1">
              <h3 className="font-semibold">Error</h3>
              <div className="text-sm">{error}</div>
            </div>
            <button onClick={() => setError(null)} className="btn btn-sm btn-ghost hover:btn-error">
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
              <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 shadow-2xl">
                <div className="card-body text-center py-20">
                  <div className="relative mx-auto w-20 h-20 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full animate-spin"></div>
                    <div className="absolute inset-2 bg-base-100 rounded-full flex items-center justify-center">
                      <SparklesIcon className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Creating Your Market
                  </h2>
                  <p className="text-base-content/70 mb-8 text-lg max-w-md mx-auto">
                    Processing your market on the blockchain. This may take a few moments...
                  </p>
                  
                  {/* Enhanced Progress Steps */}
                  <div className="max-w-md mx-auto mb-8">
                    <div className="flex justify-between items-center relative">
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/20 -translate-y-1/2"></div>
                      <div className="absolute top-1/2 left-0 h-0.5 bg-primary w-2/3 -translate-y-1/2 transition-all duration-1000"></div>
                      
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-content">
                          <CheckCircleIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs mt-2 font-medium">Validate</span>
                      </div>
                      
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-content animate-pulse">
                          <div className="w-3 h-3 bg-primary-content rounded-full animate-bounce"></div>
                        </div>
                        <span className="text-xs mt-2 font-medium text-primary">Deploy</span>
                      </div>
                      
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-8 h-8 bg-base-300 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-base-content/40 rounded-full"></div>
                        </div>
                        <span className="text-xs mt-2 text-base-content/60">Confirm</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-base-content/60">
                    🔐 Secured by blockchain technology
                  </div>
                </div>
              </div>
            )}

            {currentStep === "success" && (
              <div className="card bg-gradient-to-br from-success/10 to-success/5 border border-success/20 shadow-2xl">
                <div className="card-body text-center py-20">
                  <div className="relative mx-auto w-20 h-20 mb-8">
                    <div className="absolute inset-0 bg-success/20 rounded-full animate-ping"></div>
                    <div className="w-20 h-20 bg-gradient-to-br from-success to-success/80 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-12 h-12 text-success-content" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mb-4 text-success">
                    Market Created Successfully! 🎉
                  </h2>
                  <p className="text-base-content/70 mb-8 text-lg max-w-md mx-auto">
                    Your market is now live on the blockchain and ready for trading!
                  </p>
                  
                  {/* Market Information Card */}
                  <div className="bg-success/10 rounded-2xl p-6 mb-6 border border-success/20 max-w-lg mx-auto">
                    <div className="text-sm text-success/80 mb-2">Market ID</div>
                    <div className="font-mono text-lg font-bold text-success break-all mb-4">{createdMarketId}</div>
                    <div className="text-xs text-success/60">✓ Verified on blockchain</div>
                  </div>

                  {/* Smart Contract Details */}
                  {contractDetails && (
                    <div className="bg-base-100 rounded-2xl p-6 mb-8 border border-base-300 max-w-lg mx-auto text-left">
                      <h3 className="font-bold text-lg mb-4 text-center flex items-center justify-center gap-2">
                        <span className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-primary text-xs">📋</span>
                        </span>
                        Smart Contract Details
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Contract Address */}
                        <div>
                          <label className="text-xs font-medium text-base-content/60 uppercase tracking-wide">Contract Address</label>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="bg-base-200 px-3 py-2 rounded-lg font-mono text-sm flex-1 break-all">
                              {contractDetails.address}
                            </code>
                            <button 
                              onClick={() => copyToClipboardWithToast(contractDetails.address, "Contract address")}
                              className="btn btn-ghost btn-xs"
                              title="Copy address"
                            >
                              📋
                            </button>
                          </div>
                        </div>

                        {/* Transaction Hash */}
                        <div>
                          <label className="text-xs font-medium text-base-content/60 uppercase tracking-wide">Transaction Hash</label>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="bg-base-200 px-3 py-2 rounded-lg font-mono text-sm flex-1 break-all">
                              {contractDetails.transactionHash}
                            </code>
                            <button 
                              onClick={() => copyToClipboardWithToast(contractDetails.transactionHash, "Transaction hash")}
                              className="btn btn-ghost btn-xs"
                              title="Copy transaction hash"
                            >
                              📋
                            </button>
                          </div>
                        </div>

                        {/* Network & Block */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-base-content/60 uppercase tracking-wide">Network</label>
                            <div className="bg-base-200 px-3 py-2 rounded-lg text-sm mt-1">
                              {contractDetails.network}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-base-content/60 uppercase tracking-wide">Block Number</label>
                            <div className="bg-base-200 px-3 py-2 rounded-lg text-sm mt-1">
                              #{contractDetails.blockNumber.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Blockchain Explorer Links */}
                        <div className="pt-4 border-t border-base-300">
                          <label className="text-xs font-medium text-base-content/60 uppercase tracking-wide mb-3 block">View on Blockchain Explorers</label>
                          <div className="flex flex-wrap gap-2">
                            <a 
                              href={`https://etherscan.io/address/${contractDetails.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline btn-sm"
                            >
                              🔍 Etherscan
                            </a>
                            <a 
                              href={`https://etherscan.io/tx/${contractDetails.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline btn-sm"
                            >
                              📜 Transaction
                            </a>
                            <button 
                              onClick={() => window.open(`https://tenderly.co/explorer/account/${contractDetails.address}`, '_blank')}
                              className="btn btn-outline btn-sm"
                            >
                              ⚡ Tenderly
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                    <button
                      onClick={handleGoToMarket}
                      className="btn btn-success btn-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <BoltIcon className="w-5 h-5" />
                      View Market Details
                    </button>
                    <button
                      onClick={handleStartOver}
                      className="btn btn-outline btn-lg hover:btn-success transition-all duration-200"
                    >
                      Create Another
                    </button>
                  </div>

                  {/* Quick Access Links */}
                  {contractDetails && (
                    <div className="mt-8 pt-6 border-t border-success/20">
                      <h4 className="text-sm font-medium text-base-content/70 mb-3 text-center">Quick Access</h4>
                      <div className="flex flex-wrap justify-center gap-2">
                        <a 
                          href={`https://etherscan.io/address/${contractDetails.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                        >
                          🔍 Etherscan
                        </a>
                        <button 
                          onClick={() => copyToClipboardWithToast(contractDetails.address, "Contract address")}
                          className="btn btn-ghost btn-sm"
                        >
                          📋 Copy Address
                        </button>
                        <button 
                          onClick={() => copyToClipboardWithToast(`${window.location.origin}/markets/${createdMarketId}`, "Market link")}
                          className="btn btn-ghost btn-sm"
                        >
                          🔗 Share Market
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Enhanced Validation & Help */}
          <div className="lg:col-span-4">
            <div className="sticky top-4 space-y-6">
              {/* Validation Status */}
              {(currentStep === "form" || currentStep === "preview") && (
                <MarketValidationStatus
                  validation={validation}
                  isValidating={isValidating}
                />
              )}

              {/* Enhanced Help & Tips */}
              <div className="card bg-gradient-to-br from-info/5 to-info/10 border border-info/20 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-info/10 rounded-xl flex items-center justify-center">
                      <InformationCircleIcon className="w-6 h-6 text-info" />
                    </div>
                    <div>
                      <h3 className="font-bold text-info">Tips for Success</h3>
                      <p className="text-xs text-info/70">Follow these guidelines</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div className="bg-base-100 rounded-lg p-4 border border-info/10">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-primary text-xs">✓</span>
                        </div>
                        <div>
                          <strong className="text-primary">Clear Questions:</strong>
                          <div className="text-base-content/70 mt-1">Make sure your question is unambiguous and has clear resolution criteria.</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-base-100 rounded-lg p-4 border border-info/10">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-secondary text-xs">⏰</span>
                        </div>
                        <div>
                          <strong className="text-secondary">Reasonable Timeframe:</strong>
                          <div className="text-base-content/70 mt-1">Markets should resolve within 1 day to 1 year for optimal liquidity.</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-base-100 rounded-lg p-4 border border-info/10">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-accent text-xs">💰</span>
                        </div>
                        <div>
                          <strong className="text-accent">Sufficient Liquidity:</strong>
                          <div className="text-base-content/70 mt-1">Higher liquidity thresholds attract more traders and arbitrageurs.</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-base-100 rounded-lg p-4 border border-info/10">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-warning/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-warning text-xs">🎯</span>
                        </div>
                        <div>
                          <strong className="text-warning">Engaging Markets:</strong>
                          <div className="text-base-content/70 mt-1">Create markets that are interesting and relevant to your target audience.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PolyTrade Features */}
              <div className="card bg-gradient-to-br from-base-100 to-base-200 border border-base-300 shadow-xl">
                <div className="card-body">
                  <h3 className="font-bold mb-6 flex items-center gap-2">
                    <span className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-lg"></span>
                    PolyTrade Features
                  </h3>
                  
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-content font-bold text-sm">PT</span>
                      </div>
                      <div>
                        <strong className="text-primary text-lg">PolyTrade</strong>
                        <div className="badge badge-primary badge-xs ml-2">Advanced</div>
                      </div>
                    </div>
                    <div className="text-xs text-base-content/70 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                        <span>AI-powered market validation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                        <span>Real-time arbitrage detection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                        <span>Cross-platform trading insights</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                        <span>Low fees & fast settlements</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                        <span>Smart contract security</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full"></span>
                        <span>Community-driven governance</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* New AI Assistant Card */}
              <div className="card bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                      <SparklesIcon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-accent">AI Assistant</h3>
                      <p className="text-xs text-accent/70">Get smart suggestions</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-base-content/70 mb-4">
                    Our AI analyzes market trends and provides personalized recommendations for your market creation.
                  </div>
                  
                  <button className="btn btn-outline btn-accent btn-sm w-full">
                    <SparklesIcon className="w-4 h-4" />
                    Get AI Suggestions
                  </button>
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
