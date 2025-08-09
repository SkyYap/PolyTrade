import React, { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import {
  BoltIcon,
  CalendarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  PlusIcon,
  TagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { MarketFormData, ValidationResult } from "~~/app/markets/create/page";

interface MarketCreationFormProps {
  data: MarketFormData;
  onChange: (data: Partial<MarketFormData>) => void;
  onSubmit: () => void;
  onValidationResult: (result: ValidationResult) => void;
  isValidating: boolean;
  validation: ValidationResult | null;
}

const CATEGORIES = [
  "Politics",
  "Cryptocurrency", 
  "Sports",
  "Economics",
  "Technology",
  "Climate",
  "Entertainment",
  "Business",
  "Science",
  "Other"
];

const OUTCOME_TYPES = [
  { value: "binary", label: "Binary (Yes/No)", description: "Simple yes or no question" },
  { value: "multiple", label: "Multiple Choice", description: "Choose from several options" },
  { value: "scalar", label: "Scalar (Numeric)", description: "Predict a numeric value" },
];

export const MarketCreationForm: React.FC<MarketCreationFormProps> = ({
  data,
  onChange,
  onSubmit,
  onValidationResult,
  isValidating,
  validation,
}) => {
  const [newTag, setNewTag] = useState("");
  const [newOutcome, setNewOutcome] = useState("");
  const [debouncedQuestion] = useDebounce(data.question, 500);
  const [debouncedEndDate] = useDebounce(data.endDate, 500);

  // Validate market in real-time
  useEffect(() => {
    const validateMarket = async () => {
      if (!debouncedQuestion || !debouncedEndDate) {
        onValidationResult({
          isValid: false,
          issues: [],
          confidenceScore: 0,
          meetsLiquidityRequirement: false,
          hasReasonableTimeframe: false,
          suggestions: [],
        });
        return;
      }

      try {
        // Simulate validation (replace with actual smart contract call)
        const mockValidation = await simulateValidation({
          question: debouncedQuestion,
          endDate: debouncedEndDate,
          liquidityThreshold: data.liquidityThreshold,
        });
        
        onValidationResult(mockValidation);
      } catch (error) {
        console.error("Validation error:", error);
      }
    };

    validateMarket();
  }, [debouncedQuestion, debouncedEndDate, data.liquidityThreshold, onValidationResult]);

  const simulateValidation = async (params: {
    question: string;
    endDate: string;
    liquidityThreshold: number;
  }): Promise<ValidationResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Question validation
    if (params.question.length < 10) {
      issues.push("Question is too short (minimum 10 characters)");
      score -= 20;
    }
    
    if (params.question.length > 200) {
      issues.push("Question is too long (maximum 200 characters)");
      score -= 10;
    }

    if (!params.question.includes("?")) {
      suggestions.push("Consider ending your question with a question mark");
      score -= 5;
    }

    // Date validation
    const endDate = new Date(params.endDate);
    const now = new Date();
    const timeDiff = endDate.getTime() - now.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);

    const hasReasonableTimeframe = daysDiff >= 1 && daysDiff <= 365;
    
    if (daysDiff < 1) {
      issues.push("Market end date must be at least 1 day in the future");
      score -= 30;
    } else if (daysDiff > 365) {
      issues.push("Market end date should be within 1 year");
      score -= 10;
    }

    // Liquidity validation
    const meetsLiquidityRequirement = params.liquidityThreshold >= 1000;
    if (!meetsLiquidityRequirement) {
      issues.push("Liquidity threshold must be at least $1,000");
      score -= 15;
    }

    // Suggestions
    if (params.liquidityThreshold < 5000) {
      suggestions.push("Higher liquidity ($5,000+) attracts more traders");
    }

    if (daysDiff > 30 && daysDiff < 90) {
      suggestions.push("2-3 month timeframes typically have good engagement");
    }

    return {
      isValid: score >= 70 && issues.length === 0,
      issues,
      confidenceScore: Math.max(0, score),
      meetsLiquidityRequirement,
      hasReasonableTimeframe,
      suggestions,
    };
  };

  const addTag = () => {
    if (newTag.trim() && !data.tags.includes(newTag.trim()) && data.tags.length < 5) {
      onChange({ tags: [...data.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange({ tags: data.tags.filter(tag => tag !== tagToRemove) });
  };

  const addOutcome = () => {
    if (newOutcome.trim() && data.outcomes && !data.outcomes.includes(newOutcome.trim())) {
      onChange({ outcomes: [...data.outcomes, newOutcome.trim()] });
      setNewOutcome("");
    }
  };

  const removeOutcome = (outcomeToRemove: string) => {
    if (data.outcomes) {
      onChange({ outcomes: data.outcomes.filter(outcome => outcome !== outcomeToRemove) });
    }
  };

  const handleOutcomeTypeChange = (outcomeType: "binary" | "multiple" | "scalar") => {
    const updates: Partial<MarketFormData> = { outcomeType };
    
    if (outcomeType === "binary") {
      updates.outcomes = undefined;
      updates.minValue = undefined;
      updates.maxValue = undefined;
      updates.unit = undefined;
    } else if (outcomeType === "multiple") {
      updates.outcomes = [];
      updates.minValue = undefined;
      updates.maxValue = undefined;
      updates.unit = undefined;
    } else if (outcomeType === "scalar") {
      updates.outcomes = undefined;
      updates.minValue = 0;
      updates.maxValue = 100;
      updates.unit = "";
    }
    
    onChange(updates);
  };

  const isFormValid = validation?.isValid && data.question && data.category && data.endDate;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <DocumentTextIcon className="w-5 h-5 text-primary" />
          </div>
          <h2 className="card-title text-2xl">Market Details</h2>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
          {/* Question */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Market Question *</span>
              <span className="label-text-alt">{data.question.length}/200</span>
            </label>
            <textarea
              className={`textarea textarea-bordered h-24 ${
                data.question && validation && !validation.isValid ? "textarea-error" : ""
              }`}
              placeholder="e.g., Will Bitcoin reach $100,000 by December 31, 2025?"
              value={data.question}
              onChange={(e) => onChange({ question: e.target.value })}
              maxLength={200}
            />
            <label className="label">
              <span className="label-text-alt text-xs text-base-content/60">
                Be specific and unambiguous. Include clear resolution criteria.
              </span>
            </label>
          </div>

          {/* Platform & Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Platform *</span>
              </label>
              <select
                className="select select-bordered"
                value={data.platform}
                onChange={(e) => onChange({ platform: e.target.value as "polymarket" | "kalshi" })}
              >
                <option value="polymarket">Polymarket</option>
                <option value="kalshi">Kalshi</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Category *</span>
              </label>
              <select
                className="select select-bordered"
                value={data.category}
                onChange={(e) => onChange({ category: e.target.value })}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Outcome Type */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Outcome Type *</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {OUTCOME_TYPES.map((type) => (
                <label key={type.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="outcomeType"
                    value={type.value}
                    checked={data.outcomeType === type.value}
                    onChange={(e) => handleOutcomeTypeChange(e.target.value as any)}
                    className="radio radio-primary radio-sm mr-2"
                  />
                  <div className="inline-block">
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-base-content/60">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Multiple Choice Outcomes */}
          {data.outcomeType === "multiple" && (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Possible Outcomes</span>
              </label>
              <div className="space-y-2">
                {data.outcomes?.map((outcome, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      className="input input-bordered input-sm flex-1"
                      value={outcome}
                      onChange={(e) => {
                        const newOutcomes = [...(data.outcomes || [])];
                        newOutcomes[index] = e.target.value;
                        onChange({ outcomes: newOutcomes });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeOutcome(outcome)}
                      className="btn btn-sm btn-ghost text-error"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered input-sm flex-1"
                    placeholder="Add outcome option..."
                    value={newOutcome}
                    onChange={(e) => setNewOutcome(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addOutcome()}
                  />
                  <button
                    type="button"
                    onClick={addOutcome}
                    className="btn btn-sm btn-outline"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scalar Range */}
          {data.outcomeType === "scalar" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Minimum Value</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={data.minValue || 0}
                  onChange={(e) => onChange({ minValue: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Maximum Value</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={data.maxValue || 100}
                  onChange={(e) => onChange({ maxValue: parseFloat(e.target.value) || 100 })}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Unit</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="e.g., USD, %, points"
                  value={data.unit || ""}
                  onChange={(e) => onChange({ unit: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* End Date & Liquidity Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">End Date & Time *</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered"
                value={data.endDate}
                onChange={(e) => onChange({ endDate: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Liquidity Threshold</span>
              </label>
              <div className="input-group">
                <span className="bg-base-200 px-3 flex items-center text-sm">$</span>
                <input
                  type="number"
                  className="input input-bordered flex-1"
                  placeholder="1000"
                  min="1000"
                  step="100"
                  value={data.liquidityThreshold}
                  onChange={(e) => onChange({ liquidityThreshold: parseInt(e.target.value) || 1000 })}
                />
              </div>
              <label className="label">
                <span className="label-text-alt text-xs">Minimum $1,000 required</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Description (Optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-20"
              placeholder="Provide additional context, resolution criteria, or relevant information..."
              value={data.description}
              onChange={(e) => onChange({ description: e.target.value })}
              maxLength={1000}
            />
            <label className="label">
              <span className="label-text-alt">{data.description.length}/1000</span>
            </label>
          </div>

          {/* Tags */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Tags (Optional)</span>
            </label>
            <div className="space-y-2">
              {data.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((tag, index) => (
                    <div key={index} className="badge badge-outline gap-2">
                      <TagIcon className="w-3 h-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-error hover:text-error-focus"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {data.tags.length < 5 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered input-sm flex-1"
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="btn btn-sm btn-outline"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="card-actions justify-end pt-4">
            <button
              type="submit"
              disabled={!isFormValid || isValidating}
              className="btn btn-primary btn-lg"
            >
              {isValidating ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Validating...
                </>
              ) : (
                <>
                  <BoltIcon className="w-5 h-5" />
                  Preview Market
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
