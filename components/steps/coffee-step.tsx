"use client"
import { useSubscription } from "@/context/subscription-context"
import { coffeeVarieties } from "@/lib/data"
import { Check, Plus, Minus, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState } from "react"

export default function CoffeeStep() {
  const { state, addCoffee, removeCoffee } = useSubscription()
  const { selectedCoffees } = state
  const [hoveredCoffee, setHoveredCoffee] = useState<string | null>(null)

  const getCoffeeQuantity = (coffeeId: string) => {
    return selectedCoffees.filter((coffee) => coffee.id === coffeeId).length
  }

  const handleAddCoffee = (coffeeId: string) => {
    const coffee = coffeeVarieties.find((c) => c.id === coffeeId)
    if (coffee) {
      addCoffee(coffee)
    }
  }

  const handleRemoveCoffee = (coffeeId: string) => {
    removeCoffee(coffeeId)
  }

  // Calculer le prix par tasse en fonction de la quantité
  const getPricePerCup = (coffee: any) => {
    // Pour Prodacteurs l'Intense, utiliser directement 0.18€
    if (coffee.id === "coffee-2") {
      return 0.18
    }
    // 1kg = 120 tasses
    return coffee.price / 120
  }

  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-wider mb-6">CHOISISSEZ VOS CAFÉS</h2>
        <p className="max-w-3xl mx-auto text-gray-600">
          Sélectionnez les variétés de café que vous souhaitez inclure dans votre abonnement.
        </p>
        <div className="flex items-center justify-center mt-4 bg-amber-50 p-3 rounded-lg max-w-md mx-auto">
          <Coffee className="h-5 w-5 text-amber-700 mr-2" />
          <p className="text-sm text-amber-800">1 kg de café = 120 tasses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {coffeeVarieties.map((coffee) => {
          const quantity = getCoffeeQuantity(coffee.id)
          const isSelected = quantity > 0
          const isHovered = hoveredCoffee === coffee.id
          const pricePerCup = getPricePerCup(coffee)

          return (
            <div
              key={coffee.id}
              className={`relative bg-white rounded-lg overflow-hidden transition-all duration-300 ${
                isSelected
                  ? "border-[#c36043] border-2 shadow-lg transform scale-[1.02]"
                  : "border border-gray-200 hover:shadow-md"
              }`}
              onMouseEnter={() => setHoveredCoffee(coffee.id)}
              onMouseLeave={() => setHoveredCoffee(null)}
            >
              {/* Déplacer l'icône de vérification en bas à droite pour éviter la superposition */}
              {isSelected && (
                <div className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-[#c36043] flex items-center justify-center shadow-md">
                  <Check className="h-5 w-5 text-white" />
                </div>
              )}

              {/* En-tête avec l'intensité - fond blanc */}
              <div className="h-24 w-full relative bg-white p-4 border-b">
                <div className="relative z-10 flex justify-between items-start h-full">
                  <div>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-800">Intensité {coffee.intensity}/10</span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-6 rounded-sm ${i < coffee.intensity ? "bg-[#c36043]" : "bg-gray-200"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Image et nom du café */}
              <div className="p-6 flex flex-col items-center">
                <div className="relative w-48 h-48 mb-4 transition-transform duration-300 group">
                  <div className="relative z-10 flex items-center justify-center h-full">
                    <div className="relative w-40 h-40">
                      <Image
                        src="https://cdn.prod.website-files.com/676921b633d8a05ea45dc26f/67f78e88e6dff4656209fe92_ChatGPT%20Image%20Apr%2010%2C%202025%20at%2011_20_32%20AM.png"
                        alt={coffee.name}
                        fill
                        className={`object-contain transition-transform duration-300 ${isHovered ? "scale-110" : ""}`}
                      />
                    </div>
                  </div>
                </div>

                <h3 className="font-bold text-xl text-center mb-4">{coffee.name}</h3>
                <p className="text-sm text-gray-600 text-center mb-4 line-clamp-2">{coffee.description}</p>

                {/* Prix et informations */}
                <div className="w-full bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Prix par kg:</span>
                    <span className="font-bold text-lg">{coffee.price.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Prix par tasse:</span>
                    <span className="font-medium text-[#c36043]">{pricePerCup.toFixed(2)}€</span>
                  </div>

                  {quantity > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Quantité:</span>
                        <span className="font-medium">{quantity} kg</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600">Tasses:</span>
                        <span className="font-medium">{quantity * 120}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contrôles de quantité */}
                <div className="flex items-center justify-center w-full mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-10 w-10 rounded-full ${
                      isSelected ? "border-[#c36043] text-[#c36043]" : "border-gray-300 text-gray-400"
                    }`}
                    onClick={() => handleRemoveCoffee(coffee.id)}
                    disabled={!isSelected}
                  >
                    <Minus className="h-5 w-5" />
                  </Button>

                  <span className="mx-6 font-medium text-lg w-8 text-center">{quantity}</span>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full border-[#c36043] text-[#c36043] hover:bg-[#c36043] hover:text-white transition-colors"
                    onClick={() => handleAddCoffee(coffee.id)}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
