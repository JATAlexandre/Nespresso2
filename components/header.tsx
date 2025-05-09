"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export default function Header() {
  const [clientInfo, setClientInfo] = useState<{
    companyName: string
    email: string
    phone: string
  } | null>(null)

  useEffect(() => {
    // Récupérer les informations client du localStorage
    const savedClientInfo = localStorage.getItem("clientInfo")
    if (savedClientInfo) {
      setClientInfo(JSON.parse(savedClientInfo))
    }
  }, [])

  return (
    <header className="border-b border-gray-200 py-4 px-6 flex justify-between items-center bg-white">
      <div className="w-1/3 flex justify-start">
        <div className="relative w-48">
          <input
            type="text"
            className="w-full border border-gray-300 rounded-sm px-3 py-1.5 text-sm"
            placeholder="Rechercher..."
          />
        </div>
      </div>

      <div className="w-1/3 flex justify-center">
        <div className="w-56">
          <Image
            src="https://cdn.prod.website-files.com/676921b633d8a05ea45dc26f/67a365e551363df33a0ea472_logo_JAT_2COUL_baseline.png"
            alt="Logo Juste à Temps"
            width={220}
            height={70}
            className="object-contain"
          />
        </div>
      </div>

      <div className="w-1/3 flex justify-end items-center">
        <Button
          className="bg-[#c36043] hover:bg-[#a34e35] text-white font-medium px-4 py-2 rounded-sm"
          onClick={() => window.open("https://form.typeform.com/to/tfmUyGiz", "_blank")}
        >
          CONTACTER UN EXPERT
        </Button>
      </div>
    </header>
  )
}
