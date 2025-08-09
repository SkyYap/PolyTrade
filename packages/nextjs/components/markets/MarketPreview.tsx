import React from "react";
import {
  ArrowLeftIcon,
  BoltIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TagIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { MarketFormData, ValidationResult } from "~~/app/markets/create/page";

interface MarketPreviewProps {
  data: MarketFormData;
  validation: ValidationResult | null;
  onConfirm: () => void;
  onBack: () => void;
  onEdit: () => void;
}

export const MarketPreview: React.FC<MarketPreviewProps> = ({
  data,
  validation,
  onConfirm,
  onBack,
  onEdit,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysUntilEnd = () => {
    const endDate = new Date(data.endDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-info/10 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-info" />
              </div>
              <h2 className="text-2xl font-bold">Market Preview</h2>
            </div>
            <button onClick={onEdit} className="btn btn-ghost btn-sm">
              <PencilIcon className="w-4 h-4" />
              Edit
            </button>
          </div>
          
          <div className="alert alert-info">
            <CheckCircleIcon className="w-6 h-6" />
            <div>
              <div className="font-semibold">Ready to Create</div>
              <div className="text-sm">Review your market details below, then confirm to deploy to the blockchain.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Card Preview */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="badge badge-primary badge-sm">
                PolyTrade
              </span>
              <span className="badge badge-outline badge-sm">
                {data.category}
              </span>
              <span className="badge badge-success badge-sm">
                New Market
              </span>
            </div>
            <div className="text-sm text-base-content/60">
              {getDaysUntilEnd()} days remaining
            </div>
          </div>

          {/* Question */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">{data.question}</h3>
            {data.description && (
              <p className="text-base-content/70 text-sm leading-relaxed">
                {data.description}
              </p>
            )}
          </div>

          {/* Outcome Display */}
          <div className="mb-6">
            {data.outcomeType === "binary" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="btn btn-outline btn-success no-animation cursor-default">
                  <CheckCircleIcon className="w-4 h-4" />
                  Yes
                  <span className="badge badge-ghost">50%</span>
                </div>
                <div className="btn btn-outline btn-error no-animation cursor-default">
                  <CheckCircleIcon className="w-4 h-4" />
                  No
                  <span className="badge badge-ghost">50%</span>
                </div>
              </div>
            )}

            {data.outcomeType === "multiple" && data.outcomes && (
              <div className="space-y-2">
                {data.outcomes.map((outcome, index) => (
                  <div key={index} className="btn btn-outline no-animation cursor-default justify-between">
                    {outcome}
                    <span className="badge badge-ghost">
                      {(100 / data.outcomes!.length).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {data.outcomeType === "scalar" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Range: {data.minValue} - {data.maxValue} {data.unit}</span>
                  <span>Current estimate: {((data.minValue || 0) + (data.maxValue || 100)) / 2} {data.unit}</span>
                </div>
                <div className="w-full bg-base-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full w-1/2"></div>
                </div>
              </div>
            )}
          </div>

          {/* Market Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="stat bg-base-200 rounded-lg p-3">
              <div className="stat-figure text-primary">
                <CurrencyDollarIcon className="w-6 h-6" />
              </div>
              <div className="stat-title text-xs">Liquidity</div>
              <div className="stat-value text-lg">${data.liquidityThreshold.toLocaleString()}</div>
            </div>

            <div className="stat bg-base-200 rounded-lg p-3">
              <div className="stat-figure text-info">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div className="stat-title text-xs">Ends</div>
              <div className="stat-value text-lg">{getDaysUntilEnd()}d</div>
            </div>

            <div className="stat bg-base-200 rounded-lg p-3">
              <div className="stat-figure text-success">
                <UserGroupIcon className="w-6 h-6" />
              </div>
              <div className="stat-title text-xs">Traders</div>
              <div className="stat-value text-lg">0</div>
            </div>

            <div className="stat bg-base-200 rounded-lg p-3">
              <div className="stat-figure text-warning">
                <ChartBarIcon className="w-6 h-6" />
              </div>
              <div className="stat-title text-xs">Volume</div>
              <div className="stat-value text-lg">$0</div>
            </div>
          </div>

          {/* Tags */}
          {data.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag, index) => (
                  <span key={index} className="badge badge-outline gap-1">
                    <TagIcon className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* End Date */}
          <div className="flex items-center gap-2 text-sm text-base-content/60">
            <CalendarIcon className="w-4 h-4" />
            Market closes on {formatDate(data.endDate)}
          </div>
        </div>
      </div>

      {/* Validation Summary */}
      {validation && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="font-semibold mb-4">Validation Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="stat bg-success/10 rounded-lg p-3">
                <div className="stat-title text-xs text-success">Confidence Score</div>
                <div className="stat-value text-lg text-success">{validation.confidenceScore}%</div>
              </div>
              
              <div className="stat bg-info/10 rounded-lg p-3">
                <div className="stat-title text-xs text-info">Liquidity Check</div>
                <div className="stat-value text-lg text-info">
                  {validation.meetsLiquidityRequirement ? "✓" : "✗"}
                </div>
              </div>
              
              <div className="stat bg-warning/10 rounded-lg p-3">
                <div className="stat-title text-xs text-warning">Timeframe</div>
                <div className="stat-value text-lg text-warning">
                  {validation.hasReasonableTimeframe ? "✓" : "✗"}
                </div>
              </div>
            </div>

            {validation.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Suggestions for improvement:</h4>
                <ul className="space-y-1">
                  {validation.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-base-content/70 flex items-start gap-2">
                      <span className="text-info">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estimated Costs */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="font-semibold mb-4">Estimated Costs</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Smart Contract Deployment</span>
              <span className="font-medium">~$5-15 (gas fees)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>PolyTrade Platform Fee</span>
              <span className="font-medium">Free</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Initial Liquidity (optional)</span>
              <span className="font-medium">${data.liquidityThreshold.toLocaleString()}</span>
            </div>
            <div className="divider my-2"></div>
            <div className="flex justify-between font-semibold">
              <span>Total Platform Costs</span>
              <span className="text-primary">~$5-15</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={onBack} className="btn btn-outline btn-lg flex-1">
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Edit
        </button>
        <button 
          onClick={onConfirm} 
          className="btn btn-primary btn-lg flex-1"
          disabled={!validation?.isValid}
        >
          <BoltIcon className="w-5 h-5" />
          Create Market
        </button>
      </div>
    </div>
  );
};
