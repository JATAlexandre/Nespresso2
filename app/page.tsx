"use client"

import Image from "next/image"
import Header from "@/components/header"
import SubscriptionContent from "@/components/subscription-content"
import { SubscriptionProvider } from "@/context/subscription-context"
import HelpChat from "@/components/help-chat"
import { useState, useEffect } from "react"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simuler un temps de chargement court
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <Image
            src="https://cdn.prod.website-files.com/676921b633d8a05ea45dc26f/67a365e551363df33a0ea472_logo_JAT_2COUL_baseline.png"
            alt="Logo Juste à Temps"
            width={220}
            height={70}
            className="object-contain"
          />
        </div>
      </div>
    )
  }

  return (
    <SubscriptionProvider>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <Header />

        {/* Hero Section */}
        <div className="relative h-[400px] w-full">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <Image
            src="https://cdn.prod.website-files.com/676921b633d8a05ea45dc26f/67937691b2fa1f2b839580d6_shutterstock_2494192235.jpg"
            alt="Réunion professionnelle avec café"
            fill
            className="object-cover"
          />
          <div className="relative z-20 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-wider mb-4">CRÉER MON ABONNEMENT</h1>
            <p className="text-xl">Votre offre sur-mesure</p>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50">
          <SubscriptionContent />
        </main>

        {/* Help Chat */}
        <HelpChat />
      </div>
    </SubscriptionProvider>
  )
}
