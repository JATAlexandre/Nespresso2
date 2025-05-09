"use client"

import { useSubscription } from "@/context/subscription-context"
import MachinesStep from "@/components/steps/machines-step"
import CoffeeStep from "@/components/steps/coffee-step"
import AccompanimentsStep from "@/components/steps/accompaniments-step"
import SummaryStep from "@/components/steps/summary-step"
import SubscriptionNavigation from "@/components/subscription-navigation"
import PreSummaryForm from "@/components/pre-summary-form"
import { useState } from "react"

export default function SubscriptionContent() {
  const { state, goToStep } = useSubscription()
  const { currentStep } = state
  const [showPreSummaryForm, setShowPreSummaryForm] = useState(false)

  // Fonction pour gérer la transition entre les accompagnements et le récapitulatif
  const handleAccompanimentsComplete = () => {
    setShowPreSummaryForm(true)
  }

  // Fonction pour gérer la soumission du formulaire pré-récapitulatif
  const handlePreSummaryFormSubmit = () => {
    setShowPreSummaryForm(false)
    goToStep("summary")
  }

  // Fonction pour revenir aux accompagnements depuis le formulaire
  const handlePreSummaryFormBack = () => {
    setShowPreSummaryForm(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SubscriptionNavigation onAccompanimentsComplete={handleAccompanimentsComplete} />

      <div className="mt-8">
        {currentStep === "machines" && <MachinesStep />}
        {currentStep === "coffee" && <CoffeeStep />}
        {currentStep === "accompaniments" && <AccompanimentsStep />}
        {currentStep === "summary" && <SummaryStep />}
      </div>

      {/* Formulaire pré-récapitulatif */}
      {showPreSummaryForm && <PreSummaryForm onSubmit={handlePreSummaryFormSubmit} onBack={handlePreSummaryFormBack} />}
    </div>
  )
}
