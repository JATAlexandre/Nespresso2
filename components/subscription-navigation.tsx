"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSubscription } from "@/context/subscription-context"
import SubscriptionSteps from "@/components/subscription-steps"

type SubscriptionNavigationProps = {
  onAccompanimentsComplete?: () => void
}

export default function SubscriptionNavigation({ onAccompanimentsComplete }: SubscriptionNavigationProps) {
  // Mettre à jour l'import pour inclure calculateMonthlyPrice
  const { state, goToNextStep, goToPreviousStep, calculateMonthlyPrice } = useSubscription()
  const { currentStep, selectedMachines, selectedCoffees } = state

  // Ajouter le calcul du prix total mensuel
  const totalMonthlyPrice = calculateMonthlyPrice()

  const canProceed = () => {
    switch (currentStep) {
      case "machines":
        return selectedMachines.length > 0 // Modifié pour vérifier le tableau de machines
      case "coffee":
        return selectedCoffees.length > 0
      case "accompaniments":
        return true // Accompaniments are optional
      case "summary":
        return true
      default:
        return false
    }
  }

  const handleNextStep = () => {
    if (currentStep === "accompaniments" && onAccompanimentsComplete) {
      onAccompanimentsComplete()
    } else {
      goToNextStep()
    }
  }

  return (
    <div className="bg-white py-6 border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        {/* Modifier la div qui contient "MA FORMULE" pour inclure le prix total uniquement sur l'étape récapitulative */}
        <div className="flex items-center mb-4 md:mb-0 bg-gray-100 px-4 py-2 rounded-md">
          <ShoppingCart className="mr-2 h-5 w-5" />
          <div className="flex flex-col">
            <span className="font-medium">MA FORMULE</span>
            {currentStep === "summary" && totalMonthlyPrice > 0 && (
              <span className="text-sm text-[#c36043] font-semibold">{totalMonthlyPrice.toFixed(2)}€ / mois</span>
            )}
          </div>
        </div>

        <SubscriptionSteps />

        <div className="flex gap-2">
          {currentStep !== "machines" && (
            <Button variant="outline" onClick={goToPreviousStep} className="border-[#c36043] text-[#c36043]">
              RETOUR
            </Button>
          )}

          <Button
            className="bg-[#c36043] hover:bg-[#a34e35] text-white"
            onClick={handleNextStep}
            disabled={!canProceed()}
          >
            {currentStep === "summary" ? "FINALISER" : "ÉTAPE SUIVANTE"}
          </Button>
        </div>
      </div>
    </div>
  )
}
