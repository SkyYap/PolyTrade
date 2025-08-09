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
    },
    {
      id: "preview",
      name: "Review & Preview",
      description: "Verify market details",
      icon: EyeIcon,
    },
    {
      id: "creating",
      name: "Creating Market",
      description: "Deploying to blockchain",
      icon: SparklesIcon,
    },
    {
      id: "success",
      name: "Market Created",
      description: "Successfully deployed",
      icon: TrophyIcon,
    },
  ];

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  const getStepClasses = (status: string) => {
    switch (status) {
      case "completed":
        return "step step-primary";
      case "current":
        return "step step-primary";
      case "upcoming":
        return "step";
      default:
        return "step";
    }
  };

  return (
    <div className="w-full">
      {/* Desktop Progress */}
      <div className="hidden md:block">
        <div className="steps steps-horizontal w-full">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;
            
            return (
              <div key={step.id} className={getStepClasses(status)}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${status === "completed" ? "bg-primary text-primary-content" : 
                      status === "current" ? "bg-primary text-primary-content" : 
                      "bg-base-300 text-base-content/60"}
                  `}>
                    {status === "completed" ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className={`font-medium text-sm ${
                      status === "current" ? "text-primary" : 
                      status === "completed" ? "text-primary" : 
                      "text-base-content/60"
                    }`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-base-content/50">
                      {step.description}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Progress</h3>
              <span className="text-sm text-base-content/60">
                Step {steps.findIndex(step => step.id === currentStep) + 1} of {steps.length}
              </span>
            </div>
            
            {/* Current Step Display */}
            <div className="flex items-center gap-3 mb-4">
              {(() => {
                const currentStepData = steps.find(step => step.id === currentStep);
                const Icon = currentStepData?.icon || DocumentTextIcon;
                return (
                  <>
                    <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{currentStepData?.name}</div>
                      <div className="text-xs text-base-content/60">{currentStepData?.description}</div>
                    </div>
                  </>
                );
              })()}
            </div>
            
            {/* Progress Bar */}
            <progress 
              className="progress progress-primary w-full" 
              value={steps.findIndex(step => step.id === currentStep) + 1} 
              max={steps.length}
            ></progress>
            
            {/* Steps List */}
            <div className="mt-4 space-y-2">
              {steps.map((step, index) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;
                
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center
                      ${status === "completed" ? "bg-primary text-primary-content" : 
                        status === "current" ? "bg-primary text-primary-content" : 
                        "bg-base-300 text-base-content/60"}
                    `}>
                      {status === "completed" ? (
                        <CheckCircleIcon className="w-3 h-3" />
                      ) : (
                        <Icon className="w-3 h-3" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm ${
                        status === "current" ? "font-semibold text-primary" : 
                        status === "completed" ? "font-medium text-primary" : 
                        "text-base-content/60"
                      }`}>
                        {step.name}
                      </div>
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
