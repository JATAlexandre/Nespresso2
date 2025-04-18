"use client"

import { createContext, useContext, useState, type ReactNode, useCallback } from "react"
import type {
  SubscriptionState,
  SubscriptionStep,
  Machine,
  CoffeeVariety,
  Accompaniment,
  ContractDuration,
  Accessory,
} from "@/lib/types"

// Mettre à jour le type SubscriptionContextType pour inclure les méthodes pour les accessoires
type SubscriptionContextType = {
  state: SubscriptionState
  goToStep: (step: SubscriptionStep) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  addMachine: (machine: Machine) => void // Nouvelle fonction pour ajouter une machine
  removeMachine: (machineId: string) => void // Nouvelle fonction pour supprimer une machine
  addCoffee: (coffee: CoffeeVariety) => void
  removeCoffee: (coffeeId: string) => void
  addAccompaniment: (accompaniment: Accompaniment) => void
  removeAccompaniment: (accompanimentId: string) => void
  addAccessory: (accessory: Accessory) => void
  removeAccessory: (accessoryId: string) => void
  calculateTotal: () => number
  calculateMonthlyPrice: () => number
  setContractDuration: (duration: ContractDuration) => void
}

const initialState: SubscriptionState = {
  currentStep: "machines",
  selectedMachines: [], // Modifié pour avoir un tableau vide de machines
  selectedCoffees: [],
  selectedAccompaniments: [],
  selectedAccessories: [],
  totalPrice: 0,
  contractDuration: 36, // Durée par défaut: 36 mois
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

// Ajouter les méthodes pour gérer les accessoires dans le provider
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SubscriptionState>(initialState)

  const calculateTotal = useCallback(() => {
    let total = 0

    // Calculer le total pour toutes les machines sélectionnées
    state.selectedMachines.forEach((machine) => {
      total += machine.price
    })

    state.selectedCoffees.forEach((coffee) => {
      total += coffee.price
    })

    state.selectedAccompaniments.forEach((accompaniment) => {
      total += accompaniment.price
    })

    state.selectedAccessories.forEach((accessory) => {
      total += accessory.price
    })

    return total
  }, [state.selectedMachines, state.selectedCoffees, state.selectedAccompaniments, state.selectedAccessories])

  const calculateMonthlyPrice = useCallback(() => {
    let monthlyPrice = 0

    // Prix mensuel de toutes les machines en fonction de la durée du contrat
    state.selectedMachines.forEach((machine) => {
      switch (state.contractDuration) {
        case 24:
          monthlyPrice += machine.monthlyPrice24
          break
        case 36:
          monthlyPrice += machine.monthlyPrice36
          break
        case 48:
          monthlyPrice += machine.monthlyPrice48
          break
        default:
          monthlyPrice += machine.monthlyPrice36
      }
    })

    // Ajouter le prix mensuel du café
    const totalCoffeePrice = state.selectedCoffees.reduce((total, coffee) => {
      // Pour Prodacteurs l'Intense, utiliser directement 21.60€
      if (coffee.id === "coffee-2") {
        // Vérifier si c'est la première occurrence de ce café
        const coffeeCount = state.selectedCoffees.filter((c) => c.id === "coffee-2").length
        if (coffeeCount > 0) {
          // Ne compter qu'une seule fois le prix fixe de 21.60€
          const isFirstOccurrence =
            state.selectedCoffees.indexOf(coffee) === state.selectedCoffees.findIndex((c) => c.id === "coffee-2")
          return total + (isFirstOccurrence ? 21.6 : 0)
        }
        return total
      }
      // Pour les autres cafés, ajouter leur prix unitaire
      return total + coffee.price
    }, 0)

    monthlyPrice += totalCoffeePrice

    // Ajouter le prix mensuel des accompagnements (sans division par la durée du contrat)
    const totalAccompanimentsPrice = state.selectedAccompaniments.reduce(
      (total, accompaniment) => total + accompaniment.price,
      0,
    )

    monthlyPrice += totalAccompanimentsPrice

    // Ajouter le prix mensuel des accessoires
    const totalAccessoriesPrice = state.selectedAccessories.reduce((total, accessory) => total + accessory.price, 0)

    monthlyPrice += totalAccessoriesPrice

    return monthlyPrice
  }, [
    state.selectedMachines,
    state.selectedCoffees,
    state.selectedAccompaniments,
    state.selectedAccessories,
    state.contractDuration,
  ])

  const setContractDuration = useCallback((duration: ContractDuration) => {
    setState((prev) => ({
      ...prev,
      contractDuration: duration,
    }))
  }, [])

  const goToStep = useCallback((step: SubscriptionStep) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
    }))
  }, [])

  const goToNextStep = useCallback(() => {
    setState((prev) => {
      const currentStep = prev.currentStep
      let nextStep: SubscriptionStep = "machines"

      switch (currentStep) {
        case "machines":
          nextStep = "coffee"
          break
        case "coffee":
          nextStep = "accompaniments"
          break
        case "accompaniments":
          nextStep = "summary"
          break
        case "summary":
          nextStep = "summary" // Stay on summary
          break
      }

      return {
        ...prev,
        currentStep: nextStep,
      }
    })
  }, [])

  const goToPreviousStep = useCallback(() => {
    setState((prev) => {
      const currentStep = prev.currentStep
      let prevStep: SubscriptionStep = "machines"

      switch (currentStep) {
        case "machines":
          prevStep = "machines" // Stay on machines
          break
        case "coffee":
          prevStep = "machines"
          break
        case "accompaniments":
          prevStep = "coffee"
          break
        case "summary":
          prevStep = "accompaniments"
          break
      }

      return {
        ...prev,
        currentStep: prevStep,
      }
    })
  }, [])

  // Nouvelles fonctions pour gérer plusieurs machines
  const addMachine = useCallback((machine: Machine) => {
    setState((prev) => ({
      ...prev,
      selectedMachines: [...prev.selectedMachines, machine],
    }))
  }, [])

  const removeMachine = useCallback((machineId: string) => {
    setState((prev) => ({
      ...prev,
      selectedMachines: prev.selectedMachines.filter((m) => m.id !== machineId),
    }))
  }, [])

  const addCoffee = useCallback((coffee: CoffeeVariety) => {
    setState((prev) => ({
      ...prev,
      selectedCoffees: [...prev.selectedCoffees, coffee],
    }))
  }, [])

  const removeCoffee = useCallback((coffeeId: string) => {
    setState((prev) => ({
      ...prev,
      selectedCoffees: prev.selectedCoffees.filter((c) => c.id !== coffeeId),
    }))
  }, [])

  const addAccompaniment = useCallback((accompaniment: Accompaniment) => {
    setState((prev) => ({
      ...prev,
      selectedAccompaniments: [...prev.selectedAccompaniments, accompaniment],
    }))
  }, [])

  const removeAccompaniment = useCallback((accompanimentId: string) => {
    setState((prev) => ({
      ...prev,
      selectedAccompaniments: prev.selectedAccompaniments.filter((a) => a.id !== accompanimentId),
    }))
  }, [])

  // Ajouter les méthodes pour gérer les accessoires
  const addAccessory = useCallback((accessory: Accessory) => {
    setState((prev) => ({
      ...prev,
      selectedAccessories: [...prev.selectedAccessories, accessory],
    }))
  }, [])

  const removeAccessory = useCallback((accessoryId: string) => {
    setState((prev) => ({
      ...prev,
      selectedAccessories: prev.selectedAccessories.filter((a) => a.id !== accessoryId),
    }))
  }, [])

  const value = {
    state,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    addMachine,
    removeMachine,
    addCoffee,
    removeCoffee,
    addAccompaniment,
    removeAccompaniment,
    addAccessory,
    removeAccessory,
    calculateTotal,
    calculateMonthlyPrice,
    setContractDuration,
  }

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}
