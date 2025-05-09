"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Building, Mail, Phone, ArrowRight, ArrowLeft, Check, Coffee, Star } from "lucide-react"

type ClientInfo = {
  companyName: string
  email: string
  phone: string
}

type WelcomeModalProps = {
  onSubmit: (clientInfo: ClientInfo) => void
}

export default function WelcomeModal({ onSubmit }: WelcomeModalProps) {
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    companyName: "",
    email: "",
    phone: "",
  })
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Partial<ClientInfo>>({})
  const [animation, setAnimation] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Animation d'entrée du modal
  useEffect(() => {
    setModalVisible(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setClientInfo((prev) => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name as keyof ClientInfo]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateStep = () => {
    const newErrors: Partial<ClientInfo> = {}

    if (step === 1 && !clientInfo.companyName.trim()) {
      newErrors.companyName = "Veuillez entrer le nom de votre société"
    }

    if (step === 2) {
      if (!clientInfo.email.trim()) {
        newErrors.email = "Veuillez entrer votre email"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientInfo.email)) {
        newErrors.email = "Veuillez entrer un email valide"
      }
    }

    if (step === 3 && !clientInfo.phone.trim()) {
      newErrors.phone = "Veuillez entrer votre numéro de téléphone"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      if (step < 3) {
        setAnimation("fade-out")
        setTimeout(() => {
          setStep(step + 1)
          setAnimation("fade-in")
        }, 300)
      } else {
        // Animation de succès avant de fermer le modal
        setShowSuccess(true)
        setTimeout(() => {
          setModalVisible(false)
          setTimeout(() => {
            onSubmit(clientInfo)
          }, 300)
        }, 1500)
      }
    }
  }

  const handlePrevious = () => {
    setAnimation("fade-out")
    setTimeout(() => {
      setStep(step - 1)
      setAnimation("fade-in")
    }, 300)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleNext()
    }
  }

  return (
    <div className="flex items-center justify-center h-screen p-4 bg-black/30 backdrop-blur-sm">
      <div
        className={`bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden transition-all duration-500 ${
          modalVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* En-tête simple */}
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
          <p className="text-base font-medium text-center text-black mb-2">
            Apprenons à vous connaître en 15 secondes !
          </p>
        </div>

        {/* Indicateur d'étape minimaliste */}
        <div className="p-6 relative">
          {showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80">
              <div className="text-center transform scale-up animate-bounce">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-xl font-bold text-green-600">Parfait !</p>
                <p className="text-sm text-gray-600">Nous sommes ravis de vous accueillir</p>
              </div>
            </div>
          )}

          <div className="flex justify-center mb-8">
            <div className="flex items-center justify-center w-48 mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 flex items-center justify-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                      i < step
                        ? "bg-green-500 text-white"
                        : i === step
                          ? "bg-[#c36043] text-white"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {i < step ? <Check className="h-3.5 w-3.5" /> : <span className="text-sm">{i}</span>}
                  </div>
                  {i < 3 && (
                    <div
                      className={`h-0.5 w-8 transition-all duration-300 ${i < step ? "bg-green-500" : "bg-gray-100"}`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contenu de l'étape avec animation subtile */}
          <div
            className={`transition-all duration-300 ${
              animation === "fade-out"
                ? "opacity-0 transform -translate-y-4"
                : animation === "fade-in"
                  ? "opacity-100 transform translate-y-0"
                  : ""
            }`}
          >
            {step === 1 && (
              <div className="input-container">
                <label className="block text-sm font-medium text-gray-700 mb-1">Société</label>
                <div className="relative">
                  <input
                    type="text"
                    name="companyName"
                    value={clientInfo.companyName}
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
            )}

            {step === 2 && (
              <div className="input-container">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Votre email professionnel</label>
                  <span className="text-xs text-[#c36043] font-medium flex items-center">
                    <Star className="h-3 w-3 mr-1 animate-spin" />
                    Plus que 4 secondes !
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={clientInfo.email}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="email@votresociete.com"
                    className={`w-full p-2.5 pl-9 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#c36043] transition-all ${
                      errors.email ? "border-red-500" : "border-gray-200"
                    } hover:border-[#c36043]/50`}
                    autoFocus
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            )}

            {step === 3 && (
              <div className="input-container">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Votre numéro de téléphone</label>
                  <span className="text-xs text-[#c36043] font-medium flex items-center">
                    <Coffee className="h-3 w-3 mr-1 animate-bounce" />
                    Un dernier effort !
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={clientInfo.phone}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="01 23 45 67 89"
                    className={`w-full p-2.5 pl-9 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#c36043] transition-all ${
                      errors.phone ? "border-red-500" : "border-gray-200"
                    } hover:border-[#c36043]/50`}
                    autoFocus
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            )}

            <p className="mt-2 text-xs text-gray-500">
              {step === 1 && "Ces informations nous permettront de personnaliser votre expérience."}
              {step === 2 && "Nous vous enverrons votre devis personnalisé à cette adresse."}
              {step === 3 && "Un conseiller pourra vous contacter pour finaliser votre abonnement."}
            </p>
          </div>

          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="border-gray-200 text-gray-600 hover:bg-gray-50 transition-all group"
              >
                <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                Retour
              </Button>
            ) : (
              <div></div>
            )}

            <Button
              onClick={handleNext}
              className="bg-[#c36043] hover:bg-[#a34e35] text-white transition-all group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                {step < 3 ? (
                  <>
                    Suivant
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    Commencer
                    <Coffee className="h-4 w-4 ml-1 group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </span>
              <span className="absolute inset-0 bg-[#a34e35] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Button>
          </div>
        </div>

        {/* Barre de progression en bas avec animation */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-[#c36043] transition-all duration-500 ease-in-out"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}
