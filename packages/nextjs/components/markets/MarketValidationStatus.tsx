import React from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  XCircleIcon,
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
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className="loading loading-spinner loading-sm text-primary"></div>
            <h3 className="font-semibold">Validating Market...</h3>
          </div>
          <p className="text-sm text-base-content/70">
            Checking your market parameters against our smart contract validation rules.
          </p>
        </div>
      </div>
    );
  }

  if (!validation) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheckIcon className="w-6 h-6 text-base-content/40" />
            <h3 className="font-semibold text-base-content/60">Market Validation</h3>
          </div>
          <p className="text-sm text-base-content/60">
            Enter your market details to see validation results.
          </p>
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

  const statusColor = getStatusColor();

  return (
    <div className="space-y-4">
      {/* Main Validation Status */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-4">
            <div className={`text-${statusColor}`}>
              {getStatusIcon()}
            </div>
            <div>
              <h3 className="font-semibold">
                {validation.isValid ? "Market Ready" : "Needs Attention"}
              </h3>
              <p className="text-sm text-base-content/70">
                Confidence Score: {validation.confidenceScore}%
              </p>
            </div>
          </div>

          {/* Score Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Validation Score</span>
              <span className={`font-medium text-${statusColor}`}>
                {validation.confidenceScore}%
              </span>
            </div>
            <progress 
              className={`progress progress-${statusColor} w-full`} 
              value={validation.confidenceScore} 
              max={100}
            ></progress>
          </div>

          {/* Validation Checks */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {validation.meetsLiquidityRequirement ? (
                <CheckCircleIcon className="w-4 h-4 text-success" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-error" />
              )}
              <span>Liquidity Requirement</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              {validation.hasReasonableTimeframe ? (
                <CheckCircleIcon className="w-4 h-4 text-success" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-error" />
              )}
              <span>Reasonable Timeframe</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              {validation.issues.length === 0 ? (
                <CheckCircleIcon className="w-4 h-4 text-success" />
              ) : (
                <ExclamationTriangleIcon className="w-4 h-4 text-warning" />
              )}
              <span>Format Validation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Issues */}
      {validation.issues.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-error" />
              <h4 className="font-semibold text-error">
                Issues Found ({validation.issues.length})
              </h4>
            </div>
            <ul className="space-y-2">
              {validation.issues.map((issue, index) => (
                <li key={index} className="text-sm text-base-content/70 flex items-start gap-2">
                  <span className="text-error font-bold">•</span>
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {validation.suggestions.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-3">
              <LightBulbIcon className="w-5 h-5 text-info" />
              <h4 className="font-semibold text-info">
                Suggestions ({validation.suggestions.length})
              </h4>
            </div>
            <ul className="space-y-2">
              {validation.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-base-content/70 flex items-start gap-2">
                  <span className="text-info">💡</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Success Message */}
      {validation.isValid && (
        <div className="card bg-success/5 border border-success/20 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="w-5 h-5 text-success" />
              <h4 className="font-semibold text-success">All Checks Passed!</h4>
            </div>
            <p className="text-sm text-success/80">
              Your market meets all validation requirements and is ready to be created on the blockchain.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
