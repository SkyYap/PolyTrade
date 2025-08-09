import React from "react";
import {
  CheckCircleIcon,
  DocumentTextIcon,
  EyeIcon,
  SparklesIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

interface CreationProgressProps {
  currentStep: "form" | "preview" | "creating" | "success";
}

export const CreationProgress: React.FC<CreationProgressProps> = ({ currentStep }) => {
  const steps = [
    {
      id: "form",
      name: "Market Details",
      description: "Enter market information",
      icon: DocumentTextIcon,
      color: "primary",
    },
    {
      id: "preview",
      name: "Review & Preview",
      description: "Verify market details",
      icon: EyeIcon,
      color: "secondary",
    },
    {
      id: "creating",
      name: "Creating Market",
      description: "Deploying to blockchain",
      icon: SparklesIcon,
      color: "accent",
    },
    {
      id: "success",
      name: "Market Created",
      description: "Successfully deployed",
      icon: TrophyIcon,
      color: "success",
    },
  ];

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  const getStepClasses = (status: string, step: any) => {
    const baseClasses = "relative";
    if (status === "completed") return `${baseClasses} step-completed`;
    if (status === "current") return `${baseClasses} step-current`;
    return `${baseClasses} step-upcoming`;
  };

  return (
    <div className="w-full">
      {/* Desktop Progress */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-base-300 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${((steps.findIndex(step => step.id === currentStep) + 1) / steps.length) * 100}%` 
              }}
            ></div>
          </div>
          
          {/* Steps */}
          <div className="flex justify-between relative z-10">
            {steps.map((step, index) => {
              const status = getStepStatus(step.id);
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center relative transition-all duration-300 shadow-lg
                    ${status === "completed" ? 
                      "bg-gradient-to-br from-success to-success/80 text-success-content shadow-success/25" : 
                      status === "current" ? 
                      `bg-gradient-to-br from-${step.color} to-${step.color}/80 text-${step.color}-content shadow-${step.color}/25 scale-110` : 
                      "bg-base-200 text-base-content/40 hover:bg-base-300"}
                  `}>
                    {status === "completed" ? (
                      <CheckCircleIcon className="w-8 h-8" />
                    ) : (
                      <Icon className="w-8 h-8" />
                    )}
                    
                    {/* Animated ring for current step */}
                    {status === "current" && (
                      <div className="absolute inset-0 rounded-2xl border-4 border-primary/30 animate-pulse"></div>
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="text-center mt-4 max-w-32">
                    <div className={`font-semibold text-sm transition-colors duration-200 ${
                      status === "current" ? `text-${step.color}` : 
                      status === "completed" ? "text-success" : 
                      "text-base-content/60"
                    }`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-base-content/50 mt-1">
                      {step.description}
                    </div>
                    
                    {/* Status Badge */}
                    <div className="mt-2">
                      {status === "completed" && (
                        <span className="badge badge-success badge-xs">✓ Done</span>
                      )}
                      {status === "current" && (
                        <span className={`badge badge-${step.color} badge-xs animate-pulse`}>Active</span>
                      )}
                      {status === "upcoming" && (
                        <span className="badge badge-outline badge-xs">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl border border-base-300">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Progress</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-base-content/70">
                  Step {steps.findIndex(step => step.id === currentStep) + 1} of {steps.length}
                </span>
                <div className="badge badge-primary badge-sm">
                  {Math.round(((steps.findIndex(step => step.id === currentStep) + 1) / steps.length) * 100)}%
                </div>
              </div>
            </div>
            
            {/* Current Step Display */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
              {(() => {
                const currentStepData = steps.find(step => step.id === currentStep);
                const Icon = currentStepData?.icon || DocumentTextIcon;
                return (
                  <>
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-primary-content rounded-xl flex items-center justify-center shadow-lg">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-primary">{currentStepData?.name}</div>
                      <div className="text-sm text-primary/70">{currentStepData?.description}</div>
                    </div>
                  </>
                );
              })()}
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-base-content/60 mb-2">
                <span>Start</span>
                <span>Complete</span>
              </div>
              <div className="relative">
                <progress 
                  className="progress progress-primary w-full h-3" 
                  value={steps.findIndex(step => step.id === currentStep) + 1} 
                  max={steps.length}
                ></progress>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {/* Steps List */}
            <div className="space-y-3">
              {steps.map((step, index) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;
                
                return (
                  <div key={step.id} className={`
                    flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                    ${status === "current" ? 'bg-primary/10 border border-primary/30' :
                      status === "completed" ? 'bg-success/10 border border-success/30' :
                      'bg-base-200/50 border border-base-300'}
                  `}>
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                      ${status === "completed" ? "bg-success text-success-content" : 
                        status === "current" ? "bg-primary text-primary-content" : 
                        "bg-base-300 text-base-content/60"}
                    `}>
                      {status === "completed" ? (
                        <CheckCircleIcon className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium transition-colors duration-200 ${
                        status === "current" ? "text-primary" : 
                        status === "completed" ? "text-success" : 
                        "text-base-content/60"
                      }`}>
                        {step.name}
                      </div>
                      <div className="text-xs text-base-content/50">
                        {step.description}
                      </div>
                    </div>
                    <div>
                      {status === "completed" && (
                        <span className="badge badge-success badge-xs">✓</span>
                      )}
                      {status === "current" && (
                        <span className="badge badge-primary badge-xs animate-pulse">●</span>
                      )}
                      {status === "upcoming" && (
                        <span className="badge badge-outline badge-xs">○</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
