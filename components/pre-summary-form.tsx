"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Building, Mail, Phone, ArrowLeft, Check, Coffee } from "lucide-react"
import { useSubscription } from "@/context/subscription-context"

type FormData = {
  companyName: string
  email: string
  phone: string
}

type PreSummaryFormProps = {
  onSubmit: () => void
  onBack: () => void
}

export default function PreSummaryForm({ onSubmit, onBack }: PreSummaryFormProps) {
  const { state } = useSubscription()
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    email: "",
    phone: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [modalVisible, setModalVisible] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Animation d'entrée du modal
  useEffect(() => {
    setModalVisible(true)

    // Récupérer les informations client du localStorage
    const savedClientInfo = localStorage.getItem("clientInfo")
    if (savedClientInfo) {
      try {
        const parsedInfo = JSON.parse(savedClientInfo)
        setFormData({
          companyName: parsedInfo.companyName || "",
          email: parsedInfo.email || "",
          phone: parsedInfo.phone || "",
        })
      } catch (e) {
        console.error("Erreur lors de la récupération des informations client:", e)
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Veuillez entrer le nom de votre société"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Veuillez entrer votre email professionnel"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Veuillez entrer un email valide"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Veuillez entrer votre numéro de téléphone"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      // Animation de succès avant de fermer le modal
      setShowSuccess(true)
      setTimeout(() => {
        setModalVisible(false)
        setTimeout(() => {
          // Sauvegarder les données du formulaire dans localStorage
          localStorage.setItem("clientInfo", JSON.stringify(formData))
          onSubmit()
        }, 300)
      }, 1500)
    }
  }

  const handlePrevious = () => {
    onBack()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex items-center justify-center h-screen p-4 bg-black/30 backdrop-blur-sm fixed inset-0 z-50">
      <div
        className={`bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden transition-all duration-500 ${
          modalVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* En-tête */}
        <div className="bg-white p-6 border-b relative">
          <div className="flex justify-center mb-4">
            <Image
              src="https://cdn.prod.website-files.com/676921b633d8a05ea45dc26f/67a365e551363df33a0ea472_logo_JAT_2COUL_baseline.png"
              alt="Logo Juste à Temps"
              width={160}
              height={50}
              className="object-contain"
            />
          </div>
          <p className="text-base font-medium text-center text-black mb-2">Accéder au détail de ma formule</p>

          {/* Résumé de la formule */}
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <div className="flex items-center justify-center">
              <div>
                <p className="text-sm font-medium text-center">Encore un petit effort pour accéder à vos tarifs</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 relative">
          {showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80">
              <div className="text-center transform scale-up animate-bounce">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xl font-bold text-green-600">Parfait !</p>
                <p className="text-sm text-gray-600">Accès au récapitulatif...</p>
              </div>
            </div>
          )}

          <div className="input-container">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Société</label>
              <div className="relative">
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Votre société"
                  className={`w-full p-2.5 pl-9 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#c36043] transition-all ${
                    errors.companyName ? "border-red-500" : "border-gray-200"
                  } hover:border-[#c36043]/50`}
                  autoFocus
                />
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="email@votresociete.com"
                  className={`w-full p-2.5 pl-9 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#c36043] transition-all ${
                    errors.email ? "border-red-500" : "border-gray-200"
                  } hover:border-[#c36043]/50`}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="01 23 45 67 89"
                  className={`w-full p-2.5 pl-9 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#c36043] transition-all ${
                    errors.phone ? "border-red-500" : "border-gray-200"
                  } hover:border-[#c36043]/50`}
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 transition-all group"
            >
              <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Retour
            </Button>

            <Button
              onClick={handleSubmit}
              className="bg-[#c36043] hover:bg-[#a34e35] text-white transition-all group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Accéder au récapitulatif
                <Coffee className="h-4 w-4 ml-1 group-hover:rotate-12 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-[#a34e35] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Button>
          </div>
        </div>

        {/* Barre de progression en bas avec animation */}
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-[#c36043] transition-all duration-500 ease-in-out" style={{ width: "100%" }}></div>
        </div>
      </div>
    </div>
  )
}
