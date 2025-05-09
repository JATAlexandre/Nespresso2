export type Machine = {
  id: string
  name: string
  description: string
  image: string
  price: number
  monthlyPrice24: number
  monthlyPrice36: number
  monthlyPrice48: number
  features: {
    type: "cafe" | "bureau" | "rapide" | "premium" | "eco" | "compact" | "paiement" | "lait"
    label: string
  }[]
}

export type CoffeeVariety = {
  id: string
  name: string
  intensity: number
  description: string
  image: string
  price: number
  pricePerCup: number
  reference: string
  brand: string
}

export type Accompaniment = {
  id: string
  name: string
  description: string
  image: string
  price: number
  category: "chocolate" | "biscuit" | "sucre"
}

export type Accessory = {
  id: string
  name: string
  description: string
  image: string
  price: number
}

export type SubscriptionStep = "machines" | "coffee" | "accompaniments" | "summary"

export type ContractDuration = 24 | 36 | 48

export type SubscriptionState = {
  currentStep: SubscriptionStep
  selectedMachines: Machine[] // Modifié pour avoir un tableau de machines
  selectedCoffees: CoffeeVariety[]
  selectedAccompaniments: Accompaniment[]
  selectedAccessories: Accessory[]
  totalPrice: number
  contractDuration: ContractDuration
}
