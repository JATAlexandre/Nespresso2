"use client"

import type React from "react"

import { Coffee, Settings, Check, Cookie } from "lucide-react"
import { useSubscription } from "@/context/subscription-context"
import type { SubscriptionStep } from "@/lib/types"

export default function SubscriptionSteps() {
  const { state, goToStep } = useSubscription()
  const { currentStep, selectedMachines } = state

  const steps: { id: SubscriptionStep; label: string; icon: React.ReactNode }[] = [
    { id: "machines", label: "Machines", icon: <Settings className="h-5 w-5" /> },
    { id: "coffee", label: "Gammes de café", icon: <Coffee className="h-5 w-5" /> },
    { id: "accompaniments", label: "Accompagnements", icon: <Cookie className="h-5 w-5" /> },
    { id: "summary", label: "Récapitulatif", icon: <Check className="h-5 w-5" /> },
  ]

  const handleStepClick = (step: SubscriptionStep) => {
    // Only allow navigation to steps that make sense
    if (step === "coffee" && selectedMachines.length === 0) return
    if (step === "accompaniments" && state.selectedCoffees.length === 0) return
    if (step === "summary" && state.currentStep !== "summary") return

    goToStep(step)
  }

  return (
    <div className="flex items-center justify-center space-x-2 md:space-x-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          {index > 0 && <div className="w-6 md:w-10 h-[1px] bg-gray-300 mr-2 md:mr-4"></div>}
          <div className="flex flex-col items-center cursor-pointer" onClick={() => handleStepClick(step.id)}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep === step.id ? "bg-[#c36043] text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {step.icon}
            </div>
            <span className="text-xs mt-1 text-center">{step.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
