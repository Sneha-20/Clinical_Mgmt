"use client";

import { Check } from "lucide-react";

export default function CaseHistoryStepper({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <StepItem step={1} label="Case History" currentStep={currentStep} />
      <StepConnector completed={currentStep > 1} />

      <StepItem step={2} label="Test Reports" currentStep={currentStep} />
      <StepConnector completed={currentStep > 2} />

      <StepItem step={3} label="Trial" currentStep={currentStep} />
    </div>
  );
}

function StepItem({ step, label, currentStep }) {
  const isCompleted = currentStep > step;
  const isActive = currentStep === step;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium
          ${
            isCompleted
              ? "bg-green-500 text-white"
              : isActive
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground"
          }`}
      >
        {isCompleted ? <Check className="h-4 w-4" /> : step}
      </div>

      <span
        className={`text-sm font-medium
          ${
            isCompleted || isActive
              ? "text-foreground"
              : "text-muted-foreground"
          }`}
      >
        {label}
      </span>
    </div>
  );
}

function StepConnector({ completed }) {
  return (
    <div
      className={`w-16 h-0.5 ${
        completed ? "bg-green-500" : "bg-muted"
      }`}
    />
  );
}
