"use client"

import Image from "next/image"
import { useSubscription } from "@/context/subscription-context"
import { machines } from "@/lib/data"
import {
  Check,
  Coffee,
  Users,
  Clock,
  Award,
  Leaf,
  Minimize,
  CreditCard,
  Milk,
  Percent,
  Plus,
  Minus,
} from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { ContractDuration } from "@/lib/types"
import { useState, useEffect } from "react"

export default function MachinesStep() {
  const { state, addMachine, removeMachine, setContractDuration } = useSubscription()
  const { selectedMachines, contractDuration } = state
  const [hoveredMachine, setHoveredMachine] = useState<string | null>(null)
  const [savings24to36, setSavings24to36] = useState<number>(0)
  const [savings36to48, setSavings36to48] = useState<number>(0)
  const [activeMachine, setActiveMachine] = useState<any>(null)

  // Mettre à jour les économies lorsque les machines sélectionnées changent
  useEffect(() => {
    // Utiliser la première machine sélectionnée ou la GIGA X3 par défaut
    let machineForSavings

    if (selectedMachines.length > 0) {
      machineForSavings = selectedMachines[0]
      setActiveMachine(machineForSavings)
    } else {
      // Utiliser GIGA X3 comme machine par défaut pour les économies
      machineForSavings = machines.find((m) => m.id === "JURA GIGA X3")
      if (machineForSavings) {
        setActiveMachine(machineForSavings)
      }
    }

    if (machineForSavings) {
      // Calculer les économies pour cette machine
      const savings24to36 = calculateSavings(machineForSavings, 24, 36)
      // Calculer l'économie de 48 mois par rapport à 24 mois, pas par rapport à 36 mois
      const savings36to48 = calculateSavings(machineForSavings, 24, 48)

      setSavings24to36(savings24to36)
      setSavings36to48(savings36to48)
    }
  }, [selectedMachines])

  const handleDurationChange = (value: string) => {
    setContractDuration(Number.parseInt(value) as ContractDuration)
  }

  // Fonction pour obtenir la quantité d'une machine spécifique
  const getMachineQuantity = (machineId: string) => {
    return selectedMachines.filter((machine) => machine.id === machineId).length
  }

  // Fonction pour vérifier si une machine est sélectionnée
  const isMachineSelected = (machineId: string) => {
    return selectedMachines.some((machine) => machine.id === machineId)
  }

  // Fonction pour obtenir l'icône correspondant au type de caractéristique
  const getFeatureIcon = (type: string) => {
    switch (type) {
      case "cafe":
        return <Coffee className="h-5 w-5" />
      case "bureau":
        return <Users className="h-5 w-5" />
      case "rapide":
        return <Clock className="h-5 w-5" />
      case "premium":
        return <Award className="h-5 w-5" />
      case "eco":
        return <Leaf className="h-5 w-5" />
      case "compact":
        return <Minimize className="h-5 w-5" />
      case "paiement":
        return <CreditCard className="h-5 w-5" />
      case "lait":
        return <Milk className="h-5 w-5" />
      default:
        return <Coffee className="h-5 w-5" />
    }
  }

  // Calculer le pourcentage d'économie entre deux durées de contrat
  const calculateSavings = (machine: any, fromDuration: ContractDuration, toDuration: ContractDuration) => {
    if (!machine) return 0

    let fromPrice = 0
    let toPrice = 0

    switch (fromDuration) {
      case 24:
        fromPrice = machine.monthlyPrice24
        break
      case 36:
        fromPrice = machine.monthlyPrice36
        break
      case 48:
        fromPrice = machine.monthlyPrice48
        break
    }

    switch (toDuration) {
      case 24:
        toPrice = machine.monthlyPrice24
        break
      case 36:
        toPrice = machine.monthlyPrice36
        break
      case 48:
        toPrice = machine.monthlyPrice48
        break
    }

    return Math.round(((fromPrice - toPrice) / fromPrice) * 100)
  }

  // Gérer l'ajout d'une machine
  const handleAddMachine = (machineId: string) => {
    const machine = machines.find((m) => m.id === machineId)
    if (machine) {
      addMachine(machine)
      // Mettre à jour la machine active pour les calculs d'économie
      setActiveMachine(machine)
      // Recalculer les économies
      setSavings24to36(calculateSavings(machine, 24, 36))
      // Calculer l'économie de 48 mois par rapport à 24 mois
      setSavings36to48(calculateSavings(machine, 24, 48))
    }
  }

  // Gérer la suppression d'une machine
  const handleRemoveMachine = (machineId: string) => {
    // Supprimer une occurrence de la machine
    removeMachine(machineId)

    // Mettre à jour les économies si nécessaire
    if (selectedMachines.length <= 1) {
      // Si c'était la dernière machine de ce type, utiliser GIGA X3 comme référence
      const defaultMachine = machines.find((m) => m.id === "JURA GIGA X3")
      if (defaultMachine) {
        setActiveMachine(defaultMachine)
        setSavings24to36(calculateSavings(defaultMachine, 24, 36))
        setSavings36to48(calculateSavings(defaultMachine, 24, 48))
      }
    } else if (selectedMachines[0].id === machineId && selectedMachines.length > 1) {
      // Si on supprime la première machine mais qu'il en reste d'autres
      const nextMachine = selectedMachines.find((m) => m.id !== machineId)
      if (nextMachine) {
        setActiveMachine(nextMachine)
        setSavings24to36(calculateSavings(nextMachine, 24, 36))
        setSavings36to48(calculateSavings(nextMachine, 24, 48))
      }
    }
  }

  // Extraire les plages de tasses par jour d'une machine
  const extractCupsRange = (machine: (typeof machines)[0]) => {
    const feature = machine.features.find((f) => f.type === "cafe")
    if (!feature) return { min: 0, max: 0 }

    const match = feature.label.match(/(\d+)\s*à\s*(\d+)/)
    if (match && match.length >= 3) {
      return {
        min: Number.parseInt(match[1]),
        max: Number.parseInt(match[2]),
      }
    }

    return { min: 0, max: 0 }
  }

  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-wider mb-6">CHOISISSEZ VOS MACHINES</h2>
        <p className="max-w-3xl mx-auto text-gray-600">
          Sélectionnez les machines qui correspondent le mieux aux besoins de votre entreprise et de vos collaborateurs.
          Vous pouvez choisir plusieurs machines pour différents espaces ou étages.
        </p>
      </div>

      {/* Section des durées de contrat */}
      <div className="mb-16 max-w-4xl mx-auto">
        <h3 className="text-xl font-bold mb-4 text-[#c36043]">Durée de votre contrat</h3>

        <RadioGroup
          defaultValue="36"
          value={contractDuration.toString()}
          onValueChange={handleDurationChange}
          className="grid grid-cols-3 gap-4"
        >
          <div
            className={`border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${
              contractDuration === 24
                ? "border-[#c36043] border-2 bg-orange-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleDurationChange("24")}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <RadioGroupItem value="24" id="duration-24" className="mr-2" />
                <Label htmlFor="duration-24" className="text-lg font-bold">
                  24 mois
                </Label>
              </div>
              <div className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">Standard</div>
            </div>
            <p className="text-sm text-gray-600 ml-6">Engagement standard, flexibilité moyenne</p>
          </div>

          <div
            className={`border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${
              contractDuration === 36
                ? "border-[#c36043] border-2 bg-orange-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleDurationChange("36")}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <RadioGroupItem value="36" id="duration-36" className="mr-2" />
                <Label htmlFor="duration-36" className="text-lg font-bold">
                  36 mois
                </Label>
              </div>
              <div className="bg-[#c36043] text-white px-2 py-1 rounded text-xs font-medium">Recommandé</div>
            </div>
            <p className="text-sm text-gray-600 ml-6">Bon équilibre entre économies et durée d'engagement</p>
            <div className="mt-2 ml-6 flex items-center">
              <Percent className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">Économisez {savings24to36}%</span>
            </div>
          </div>

          <div
            className={`border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${
              contractDuration === 48
                ? "border-[#c36043] border-2 bg-orange-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleDurationChange("48")}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <RadioGroupItem value="48" id="duration-48" className="mr-2" />
                <Label htmlFor="duration-48" className="text-lg font-bold">
                  48 mois
                </Label>
              </div>
              <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">Économique</div>
            </div>
            <p className="text-sm text-gray-600 ml-6">Mensualité la plus basse, engagement long terme</p>
            <div className="mt-2 ml-6 flex items-center">
              <Percent className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600 font-medium">Économisez {savings36to48}%</span>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {machines.map((machine) => {
          // Déterminer le prix mensuel en fonction de la durée du contrat
          let monthlyPrice
          switch (contractDuration) {
            case 24:
              monthlyPrice = machine.monthlyPrice24
              break
            case 36:
              monthlyPrice = machine.monthlyPrice36
              break
            case 48:
              monthlyPrice = machine.monthlyPrice48
              break
            default:
              monthlyPrice = machine.monthlyPrice36
          }

          const quantity = getMachineQuantity(machine.id)
          const isSelected = isMachineSelected(machine.id)
          const isHovered = hoveredMachine === machine.id
          const cupsRange = extractCupsRange(machine)

          return (
            <div
              key={machine.id}
              className={`relative bg-white p-6 border rounded-md flex flex-col items-center transition-all duration-300 ${
                isSelected
                  ? "border-[#c36043] border-2 shadow-lg"
                  : isHovered
                    ? "border-[#c36043]/50 shadow-md transform scale-[1.01]"
                    : "border-gray-200 hover:shadow-md"
              }`}
              onMouseEnter={() => {
                setHoveredMachine(machine.id)
                // Mettre à jour les économies au survol
                setSavings24to36(calculateSavings(machine, 24, 36))
                setSavings36to48(calculateSavings(machine, 24, 48))
              }}
              onMouseLeave={() => {
                setHoveredMachine(null)
                // Restaurer les économies de la machine active
                if (activeMachine) {
                  setSavings24to36(calculateSavings(activeMachine, 24, 36))
                  setSavings36to48(calculateSavings(activeMachine, 24, 48))
                }
              }}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#c36043] flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}

              <div className="h-64 w-64 relative mb-4 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={machine.image || "/placeholder.svg"}
                  alt={machine.name}
                  fill
                  className={`object-contain transition-transform duration-300 ${isHovered ? "scale-110" : ""}`}
                />
              </div>
              <h3 className="font-medium text-lg">{machine.name}</h3>
              <div className="text-center mt-2">
                <div className="bg-[#f8f3e9] text-[#c36043] px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center mb-2">
                  <Coffee className="h-4 w-4 mr-1.5" />
                  {cupsRange.min} à {cupsRange.max} tasses/jour
                </div>
              </div>
              <div className="mt-4 text-center">
                <p
                  className={`font-semibold text-lg transition-all duration-300 ${isSelected ? "text-[#c36043]" : ""}`}
                >
                  {monthlyPrice}€ / mois
                </p>
                <p className="text-xs text-gray-500">Contrat de {contractDuration} mois</p>
                <p className="text-xs text-gray-500 mt-1">Forfait maintenance inclus</p>
              </div>

              {/* Caractéristiques avec icônes */}
              <div className="flex justify-center mt-4 gap-6">
                {machine.features
                  .filter((feature) => feature.type !== "cafe") // Filtrer pour exclure les caractéristiques de type "cafe"
                  .map((feature, index) => (
                    <div key={index} className="flex flex-col items-center group">
                      <div
                        className={`w-8 h-8 flex items-center justify-center transition-transform duration-200 ${isHovered ? "scale-110" : ""}`}
                      >
                        {getFeatureIcon(feature.type)}
                      </div>
                      <span className="text-xs mt-1 group-hover:text-[#c36043] transition-colors">{feature.label}</span>
                    </div>
                  ))}
              </div>

              {/* Contrôles de quantité et CTA */}
              <div className="mt-6 w-full">
                {/* Contrôles de quantité toujours visibles */}
                <div className="flex items-center justify-center">
                  <button
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      quantity > 0 ? "border-[#c36043] text-[#c36043]" : "border-gray-300 text-gray-300"
                    }`}
                    onClick={() => handleRemoveMachine(machine.id)}
                    disabled={quantity === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="mx-4 font-medium w-8 text-center">{quantity}</span>
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center border border-[#c36043] text-[#c36043] hover:bg-[#c36043] hover:text-white transition-colors"
                    onClick={() => handleAddMachine(machine.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
