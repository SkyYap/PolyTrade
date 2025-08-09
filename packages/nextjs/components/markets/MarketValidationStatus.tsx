import React from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  XCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { ValidationResult } from "~~/app/markets/create/page";

interface MarketValidationStatusProps {
  validation: ValidationResult | null;
  isValidating: boolean;
}

export const MarketValidationStatus: React.FC<MarketValidationStatusProps> = ({
  validation,
  isValidating,
}) => {
  if (isValidating) {
    return (
      <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="loading loading-spinner loading-sm text-primary"></div>
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20"></div>
            </div>
            <div>
              <h3 className="font-semibold text-primary">Validating Market...</h3>
              <p className="text-xs text-primary/70">Running smart contract checks</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="skeleton h-2 w-full"></div>
            <div className="skeleton h-2 w-4/5"></div>
            <div className="skeleton h-2 w-3/5"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!validation) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-lg hover:shadow-xl transition-shadow duration-200">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-base-200 rounded-xl flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-base-content/40" />
            </div>
            <div>
              <h3 className="font-semibold text-base-content/60">Market Validation</h3>
              <p className="text-xs text-base-content/50">Ready for validation</p>
            </div>
          </div>
          <div className="bg-base-200/50 rounded-lg p-4 border-2 border-dashed border-base-300">
            <p className="text-sm text-base-content/60 text-center">
              ✨ Enter your market details to see real-time validation
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = () => {
    if (validation.isValid) return "success";
    if (validation.confidenceScore >= 50) return "warning";
    return "error";
  };

  const getStatusIcon = () => {
    if (validation.isValid) return <CheckCircleIcon className="w-6 h-6" />;
    if (validation.confidenceScore >= 50) return <ExclamationTriangleIcon className="w-6 h-6" />;
    return <XCircleIcon className="w-6 h-6" />;
  };

  const getGradientClasses = () => {
    if (validation.isValid) return "from-success/10 to-success/5 border-success/30";
    if (validation.confidenceScore >= 50) return "from-warning/10 to-warning/5 border-warning/30";
    return "from-error/10 to-error/5 border-error/30";
  };

  const statusColor = getStatusColor();

  return (
    <div className="space-y-4">
      {/* Main Validation Status */}
      <div className={`card bg-gradient-to-br ${getGradientClasses()} border shadow-xl hover:shadow-2xl transition-all duration-300`}>
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className={`relative text-${statusColor}`}>
              {getStatusIcon()}
              {validation.isValid && (
                <div className="absolute -top-1 -right-1">
                  <SparklesIcon className="w-4 h-4 text-success animate-pulse" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {validation.isValid ? "🎉 Market Ready!" : "⚠️ Needs Attention"}
              </h3>
              <p className={`text-sm text-${statusColor}/80 font-medium`}>
                Confidence Score: {validation.confidenceScore}%
              </p>
            </div>
            <div className={`badge badge-${statusColor} badge-lg font-bold`}>
              {validation.confidenceScore}%
            </div>
          </div>

          {/* Enhanced Score Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Validation Score</span>
              <span className={`font-bold text-${statusColor}`}>
                {validation.confidenceScore}% / 100%
              </span>
            </div>
            <div className="relative">
              <progress 
                className={`progress progress-${statusColor} w-full h-3`} 
                value={validation.confidenceScore} 
                max={100}
              ></progress>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full animate-pulse"></div>
            </div>
            <div className="flex justify-between text-xs text-base-content/60 mt-1">
              <span>Poor</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Enhanced Validation Checks */}
          <div className="grid grid-cols-1 gap-3">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${validation.meetsLiquidityRequirement ? 'bg-success/10' : 'bg-error/10'} border ${validation.meetsLiquidityRequirement ? 'border-success/20' : 'border-error/20'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${validation.meetsLiquidityRequirement ? 'bg-success text-success-content' : 'bg-error text-error-content'}`}>
                {validation.meetsLiquidityRequirement ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <XCircleIcon className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Liquidity Requirement</div>
                <div className="text-xs text-base-content/70">
                  {validation.meetsLiquidityRequirement ? 'Meets minimum threshold' : 'Below minimum required'}
                </div>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 p-3 rounded-lg ${validation.hasReasonableTimeframe ? 'bg-success/10' : 'bg-error/10'} border ${validation.hasReasonableTimeframe ? 'border-success/20' : 'border-error/20'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${validation.hasReasonableTimeframe ? 'bg-success text-success-content' : 'bg-error text-error-content'}`}>
                {validation.hasReasonableTimeframe ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <XCircleIcon className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Reasonable Timeframe</div>
                <div className="text-xs text-base-content/70">
                  {validation.hasReasonableTimeframe ? 'Good resolution timeline' : 'Timeline needs adjustment'}
                </div>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 p-3 rounded-lg ${validation.issues.length === 0 ? 'bg-success/10' : 'bg-warning/10'} border ${validation.issues.length === 0 ? 'border-success/20' : 'border-warning/20'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${validation.issues.length === 0 ? 'bg-success text-success-content' : 'bg-warning text-warning-content'}`}>
                {validation.issues.length === 0 ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">Format Validation</div>
                <div className="text-xs text-base-content/70">
                  {validation.issues.length === 0 ? 'All format checks passed' : `${validation.issues.length} issues found`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Issues Section */}
      {validation.issues.length > 0 && (
        <div className="card bg-gradient-to-br from-error/5 to-error/10 border border-error/20 shadow-lg">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-error/10 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-error" />
              </div>
              <div>
                <h4 className="font-semibold text-error text-lg">
                  Issues Found ({validation.issues.length})
                </h4>
                <p className="text-sm text-error/70">Please address these issues to proceed</p>
              </div>
            </div>
            <div className="space-y-3">
              {validation.issues.map((issue, index) => (
                <div key={index} className="bg-base-100 rounded-lg p-4 border border-error/20">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-error/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-error font-bold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-base-content">{issue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Suggestions Section */}
      {validation.suggestions.length > 0 && (
        <div className="card bg-gradient-to-br from-info/5 to-info/10 border border-info/20 shadow-lg">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-info/10 rounded-xl flex items-center justify-center">
                <LightBulbIcon className="w-6 h-6 text-info" />
              </div>
              <div>
                <h4 className="font-semibold text-info text-lg">
                  Smart Suggestions ({validation.suggestions.length})
                </h4>
                <p className="text-sm text-info/70">Tips to improve your market</p>
              </div>
            </div>
            <div className="space-y-3">
              {validation.suggestions.map((suggestion, index) => (
                <div key={index} className="bg-base-100 rounded-lg p-4 border border-info/20 hover:bg-info/5 transition-colors duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-info/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-info text-lg">💡</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-base-content leading-relaxed">{suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Success Message */}
      {validation.isValid && (
        <div className="card bg-gradient-to-br from-success/10 to-success/5 border border-success/30 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-success/20 rounded-2xl flex items-center justify-center">
                  <CheckCircleIcon className="w-8 h-8 text-success" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                  <span className="text-success-content text-xs font-bold">✓</span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-success text-xl">All Checks Passed!</h4>
                <p className="text-sm text-success/80 font-medium">Ready for blockchain deployment</p>
              </div>
            </div>
            <div className="bg-success/10 rounded-lg p-4 border border-success/20">
              <p className="text-sm text-success leading-relaxed">
                🚀 Excellent! Your market meets all validation requirements and is ready to be created on the blockchain. 
                The smart contract will automatically track arbitrage opportunities across platforms.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
