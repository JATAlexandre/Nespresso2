"use client"

import Image from "next/image"
import { useSubscription } from "@/context/subscription-context"
import { accompaniments, accessories } from "@/lib/data"
import { Check, Plus, Minus, Coffee, Cookie, Candy, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

export default function AccompanimentsStep() {
  const { state, addAccompaniment, removeAccompaniment, addAccessory, removeAccessory } = useSubscription()
  const { selectedAccompaniments, selectedAccessories } = state
  const [activeTab, setActiveTab] = useState("accessory")

  const getAccompanimentQuantity = (accompanimentId: string) => {
    return selectedAccompaniments.filter((accompaniment) => accompaniment.id === accompanimentId).length
  }

  const getAccessoryQuantity = (accessoryId: string) => {
    return selectedAccessories.filter((accessory) => accessory.id === accessoryId).length
  }

  const handleAddAccompaniment = (accompanimentId: string) => {
    const accompaniment = accompaniments.find((a) => a.id === accompanimentId)
    if (accompaniment) {
      addAccompaniment(accompaniment)
    }
  }

  const handleRemoveAccompaniment = (accompanimentId: string) => {
    removeAccompaniment(accompanimentId)
  }

  const handleAddAccessory = (accessoryId: string) => {
    const accessory = accessories.find((a) => a.id === accessoryId)
    if (accessory) {
      addAccessory(accessory)
    }
  }

  const handleRemoveAccessory = (accessoryId: string) => {
    removeAccessory(accessoryId)
  }

  // Filtrer les accompagnements par catégorie
  const chocolates = accompaniments.filter((a) => a.category === "chocolate")
  const biscuits = accompaniments.filter((a) => a.category === "biscuit")
  const sweets = accompaniments.filter((a) => a.category === "sucre")

  // Obtenir le nombre total d'éléments sélectionnés par catégorie
  const getSelectedCountByCategory = (category: string) => {
    return selectedAccompaniments.filter((a) => {
      const item = accompaniments.find((acc) => acc.id === a.id)
      return item?.category === category
    }).length
  }

  const selectedChocolatesCount = getSelectedCountByCategory("chocolate")
  const selectedBiscuitsCount = getSelectedCountByCategory("biscuit")
  const selectedSweetsCount = getSelectedCountByCategory("sucre")
  const selectedAccessoriesCount = selectedAccessories.length

  // Couleurs de fond pour chaque catégorie
  const categoryColors = {
    accessory: {
      bg: "bg-[#f8e9f3]",
      border: "border-purple-200",
      text: "text-purple-800",
      light: "bg-purple-50",
    },
    sucre: {
      bg: "bg-[#e9f3f8]",
      border: "border-blue-200",
      text: "text-blue-800",
      light: "bg-blue-50",
    },
    chocolate: {
      bg: "bg-[#f8f3e9]",
      border: "border-amber-200",
      text: "text-amber-800",
      light: "bg-amber-50",
    },
    biscuit: {
      bg: "bg-[#f3f8e9]",
      border: "border-green-200",
      text: "text-green-800",
      light: "bg-green-50",
    },
  }

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-wider mb-4">CHOISISSEZ VOS ACCOMPAGNEMENTS</h2>
        <p className="max-w-3xl mx-auto text-gray-600 mb-2">
          Complétez votre expérience café avec une sélection de chocolats, biscuits, sucres et accessoires.
        </p>
      </div>

      <Tabs defaultValue="accessory" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <TabsList className="grid w-full grid-cols-4 mb-4 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="accessory"
              className={`flex items-center gap-2 ${activeTab === "accessory" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setActiveTab("accessory")}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${categoryColors.accessory.bg}`}>
                <Package className="h-4 w-4 text-purple-700" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Accessoires</span>
                {selectedAccessoriesCount > 0 && (
                  <span className="text-xs text-purple-700 font-medium">{selectedAccessoriesCount} sélectionné(s)</span>
                )}
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="sucre"
              className={`flex items-center gap-2 ${activeTab === "sucre" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setActiveTab("sucre")}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${categoryColors.sucre.bg}`}>
                <Coffee className="h-4 w-4 text-blue-700" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Sucres</span>
                {selectedSweetsCount > 0 && (
                  <span className="text-xs text-blue-700 font-medium">{selectedSweetsCount} sélectionné(s)</span>
                )}
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="chocolate"
              className={`flex items-center gap-2 ${activeTab === "chocolate" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setActiveTab("chocolate")}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${categoryColors.chocolate.bg}`}>
                <Candy className="h-4 w-4 text-amber-700" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Chocolats</span>
                {selectedChocolatesCount > 0 && (
                  <span className="text-xs text-amber-700 font-medium">{selectedChocolatesCount} sélectionné(s)</span>
                )}
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="biscuit"
              className={`flex items-center gap-2 ${activeTab === "biscuit" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setActiveTab("biscuit")}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${categoryColors.biscuit.bg}`}>
                <Cookie className="h-4 w-4 text-green-700" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Biscuits</span>
                {selectedBiscuitsCount > 0 && (
                  <span className="text-xs text-green-700 font-medium">{selectedBiscuitsCount} sélectionné(s)</span>
                )}
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Résumé des sélections */}
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedAccessoriesCount > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">
                <Package className="h-3 w-3" />
                <span>{selectedAccessoriesCount} accessoire(s)</span>
              </div>
            )}
            {selectedSweetsCount > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                <Coffee className="h-3 w-3" />
                <span>{selectedSweetsCount} sucre(s)</span>
              </div>
            )}
            {selectedChocolatesCount > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs">
                <Candy className="h-3 w-3" />
                <span>{selectedChocolatesCount} chocolat(s)</span>
              </div>
            )}
            {selectedBiscuitsCount > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                <Cookie className="h-3 w-3" />
                <span>{selectedBiscuitsCount} biscuit(s)</span>
              </div>
            )}
            {selectedAccessoriesCount === 0 &&
              selectedSweetsCount === 0 &&
              selectedChocolatesCount === 0 &&
              selectedBiscuitsCount === 0 && (
                <div className="text-sm text-gray-500 italic">Aucun accompagnement sélectionné</div>
              )}
          </div>
        </div>

        {/* En-tête de catégorie pour Accessoires */}
        <TabsContent value="accessory">
          <div
            className={`${categoryColors.accessory.bg} p-4 rounded-md mb-6 border ${categoryColors.accessory.border} flex items-center`}
          >
            <div className="bg-white p-2 rounded-full mr-4">
              <Package className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-purple-800 mb-1">Accessoires</h3>
              <p className="text-sm text-gray-600">
                Complétez votre expérience café avec nos accessoires pratiques et indispensables.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {accessories.map((accessory) => renderAccessoryCard(accessory))}
          </div>
        </TabsContent>

        {/* En-tête de catégorie pour Sucres */}
        <TabsContent value="sucre">
          <div
            className={`${categoryColors.sucre.bg} p-4 rounded-md mb-6 border ${categoryColors.sucre.border} flex items-center`}
          >
            <div className="bg-white p-2 rounded-full mr-4">
              <Coffee className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-blue-800 mb-1">Sucres</h3>
              <p className="text-sm text-gray-600">
                Sucrez votre café selon vos préférences avec notre gamme de sucres et édulcorants.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {sweets.map((accompaniment) => renderAccompanimentCard(accompaniment, "sucre"))}
          </div>
        </TabsContent>

        {/* En-tête de catégorie pour Chocolats */}
        <TabsContent value="chocolate">
          <div
            className={`${categoryColors.chocolate.bg} p-4 rounded-md mb-6 border ${categoryColors.chocolate.border} flex items-center`}
          >
            <div className="bg-white p-2 rounded-full mr-4">
              <Candy className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-amber-800 mb-1">Chocolats</h3>
              <p className="text-sm text-gray-600">
                Offrez une touche gourmande à votre pause café avec notre sélection de chocolats fins.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {chocolates.map((accompaniment) => renderAccompanimentCard(accompaniment, "chocolate"))}
          </div>
        </TabsContent>

        {/* En-tête de catégorie pour Biscuits */}
        <TabsContent value="biscuit">
          <div
            className={`${categoryColors.biscuit.bg} p-4 rounded-md mb-6 border ${categoryColors.biscuit.border} flex items-center`}
          >
            <div className="bg-white p-2 rounded-full mr-4">
              <Cookie className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-800 mb-1">Biscuits</h3>
              <p className="text-sm text-gray-600">
                Accompagnez votre café avec nos délicieux biscuits, parfaits pour une pause gourmande.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {biscuits.map((accompaniment) => renderAccompanimentCard(accompaniment, "biscuit"))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderAccompanimentCard(accompaniment: (typeof accompaniments)[0], category: string) {
    const quantity = getAccompanimentQuantity(accompaniment.id)
    const isSelected = quantity > 0
    const categoryColor = categoryColors[category as keyof typeof categoryColors]

    return (
      <div
        key={accompaniment.id}
        className={`relative bg-white p-6 border rounded-lg flex flex-col items-center hover:shadow-md transition-shadow ${
          isSelected ? `border-2 ${categoryColor.border} shadow-md` : "border-gray-200"
        }`}
      >
        {isSelected && (
          <div
            className={`absolute top-2 right-2 w-6 h-6 rounded-full ${categoryColor.bg} flex items-center justify-center`}
          >
            <Check className={`h-4 w-4 ${categoryColor.text}`} />
          </div>
        )}

        <div className="h-32 w-32 relative mb-4 group">
          <div
            className={`absolute inset-0 rounded-full ${categoryColor.light} opacity-0 group-hover:opacity-100 transition-opacity`}
          ></div>
          <Image
            src={accompaniment.image || "/placeholder.svg?height=150&width=150"}
            alt={accompaniment.name}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-110 z-10"
          />
        </div>

        <h3 className="font-medium text-lg text-center">{accompaniment.name}</h3>
        <p className="text-sm text-gray-500 text-center mt-2 mb-4 line-clamp-2">{accompaniment.description}</p>
        <p className="font-semibold">{accompaniment.price.toFixed(2)}€</p>

        <div className="flex items-center mt-4">
          <Button
            variant="outline"
            size="icon"
            className={`h-8 w-8 rounded-full ${isSelected ? categoryColor.border : ""}`}
            onClick={() => handleRemoveAccompaniment(accompaniment.id)}
            disabled={!isSelected}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <span className="mx-4 font-medium w-8 text-center">{quantity}</span>

          <Button
            variant="outline"
            size="icon"
            className={`h-8 w-8 rounded-full ${categoryColor.border}`}
            onClick={() => handleAddAccompaniment(accompaniment.id)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  function renderAccessoryCard(accessory: (typeof accessories)[0]) {
    const quantity = getAccessoryQuantity(accessory.id)
    const isSelected = quantity > 0
    const categoryColor = categoryColors.accessory

    return (
      <div
        key={accessory.id}
        className={`relative bg-white p-6 border rounded-lg flex flex-col items-center hover:shadow-md transition-shadow ${
          isSelected ? `border-2 ${categoryColor.border} shadow-md` : "border-gray-200"
        }`}
      >
        {isSelected && (
          <div
            className={`absolute top-2 right-2 w-6 h-6 rounded-full ${categoryColor.bg} flex items-center justify-center`}
          >
            <Check className={`h-4 w-4 ${categoryColor.text}`} />
          </div>
        )}

        <div className="h-32 w-32 relative mb-4 group">
          <div
            className={`absolute inset-0 rounded-full ${categoryColor.light} opacity-0 group-hover:opacity-100 transition-opacity`}
          ></div>
          <Image
            src={accessory.image || "/placeholder.svg?height=150&width=150"}
            alt={accessory.name}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-110 z-10"
          />
        </div>

        <h3 className="font-medium text-lg text-center">{accessory.name}</h3>
        <p className="text-sm text-gray-500 text-center mt-2 mb-4 line-clamp-2">{accessory.description}</p>
        <p className="font-semibold">{accessory.price.toFixed(2)}€</p>

        <div className="flex items-center mt-4">
          <Button
            variant="outline"
            size="icon"
            className={`h-8 w-8 rounded-full ${isSelected ? categoryColor.border : ""}`}
            onClick={() => handleRemoveAccessory(accessory.id)}
            disabled={!isSelected}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <span className="mx-4 font-medium w-8 text-center">{quantity}</span>

          <Button
            variant="outline"
            size="icon"
            className={`h-8 w-8 rounded-full ${categoryColor.border}`}
            onClick={() => handleAddAccessory(accessory.id)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }
}
