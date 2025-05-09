"use client"

import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import {
  HelpCircle,
  X,
  Send,
  MessageCircle,
  Coffee,
  ThumbsUp,
  Users,
  Milk,
  Check,
  CreditCard,
  ArrowRight,
  Info,
} from "lucide-react"
import { machines } from "@/lib/data"
import Image from "next/image"
import { useSubscription } from "@/context/subscription-context"

type Question = {
  id: string
  text: string
  options?: string[]
  type: "select" | "number" | "text"
  icon: React.ReactNode
  description?: string
}

type Answer = {
  questionId: string
  answer: string
}

type MachineRecommendation = {
  id: string
  name: string
  image: string
  description: string
  matchScore: number
  reasons: string[]
  features: string[]
}

const questions: Question[] = [
  {
    id: "collaborators",
    text: "Quel est votre nombre de collaborateur ?",
    type: "number",
    icon: <Users className="h-5 w-5 text-[#c36043]" />,
    description: "Cette information nous aide à déterminer la taille de machine adaptée à votre entreprise.",
  },
  {
    id: "milk",
    text: "Souhaitez-vous des boissons lactées ?",
    options: ["Oui", "Non"],
    type: "select",
    icon: <Milk className="h-5 w-5 text-[#c36043]" />,
    description: "Cappuccinos, lattes et autres boissons à base de lait nécessitent des fonctionnalités spécifiques.",
  },
  {
    id: "payment",
    text: "Souhaitez-vous un module de paiement sur la machine ?",
    options: ["Oui", "Non"],
    type: "select",
    icon: <CreditCard className="h-5 w-5 text-[#c36043]" />,
    description: "Un module de paiement permet de facturer les consommations aux utilisateurs.",
  },
]

export default function HelpChat() {
  const { addMachine, goToStep } = useSubscription()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [numberInput, setNumberInput] = useState<string>("")
  const [recommendations, setRecommendations] = useState<MachineRecommendation[]>([])
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showPulse, setShowPulse] = useState(false)
  const [isButtonExpanded, setIsButtonExpanded] = useState(false)
  const [currentHighlightedMachine, setCurrentHighlightedMachine] = useState<string | null>(null)

  // Effet pour faire pulser le bouton périodiquement et le rendre plus visible
  useEffect(() => {
    // Toujours afficher le bouton étendu pour maximiser la visibilité
    setIsButtonExpanded(true)

    return () => {
      // Nettoyage si nécessaire
    }
  }, [isOpen])

  const handleOpen = () => {
    setIsOpen(true)
    setIsMinimized(false)
    setIsButtonExpanded(false)
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(false)
    // Reset the chat
    setCurrentQuestionIndex(0)
    setAnswers([])
    setIsComplete(false)
    setSelectedOption("")
    setNumberInput("")
    setRecommendations([])
    setShowRecommendations(false)

    // Réafficher le bouton étendu après un délai
    setTimeout(() => {
      setIsButtonExpanded(true)
    }, 3000)
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleAnswer = () => {
    let answer = ""

    if (questions[currentQuestionIndex].type === "select") {
      answer = selectedOption
      setSelectedOption("")
    } else if (questions[currentQuestionIndex].type === "number") {
      answer = numberInput
      setNumberInput("")
    }

    if (!answer) return

    const newAnswer: Answer = {
      questionId: questions[currentQuestionIndex].id,
      answer,
    }

    const updatedAnswers = [...answers, newAnswer]
    setAnswers(updatedAnswers)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Generate recommendations based on all answers
      const machineRecommendations = generateRecommendations(updatedAnswers)
      setRecommendations(machineRecommendations)
      setShowRecommendations(true)
      setIsComplete(true)
    }
  }

  const generateRecommendations = (answers: Answer[]): MachineRecommendation[] => {
    // Extract answers
    const collaboratorsAnswer = answers.find((a) => a.questionId === "collaborators")
    const milkAnswer = answers.find((a) => a.questionId === "milk")
    const paymentAnswer = answers.find((a) => a.questionId === "payment")

    const collaborators = collaboratorsAnswer ? Number.parseInt(collaboratorsAnswer.answer) : 0
    const wantsMilkDrinks = milkAnswer ? milkAnswer.answer === "Oui" : false
    const wantsPaymentModule = paymentAnswer ? paymentAnswer.answer === "Oui" : false

    // Estimate cups per day based on number of collaborators
    // Assuming each collaborator drinks 2 cups per day on average
    const estimatedCupsPerDay = collaborators * 2

    // Calculate match score for each machine
    const recommendations = machines.map((machine) => {
      let matchScore = 0
      const reasons: string[] = []
      const features: string[] = []

      // Check cups per day capacity
      const cupsRangeText = machine.features.find((f) => f.type === "cafe")?.label || ""
      const cupsRange = cupsRangeText.match(/(\d+)\s*à\s*(\d+)/)

      let minCups = 0
      let maxCups = 0

      if (cupsRange && cupsRange.length >= 3) {
        minCups = Number.parseInt(cupsRange[1])
        maxCups = Number.parseInt(cupsRange[2])
        features.push(`${minCups} à ${maxCups} tasses/jour`)
      }

      // Évaluation plus précise de la capacité
      if (estimatedCupsPerDay >= minCups && estimatedCupsPerDay <= maxCups) {
        // Correspondance parfaite
        matchScore += 40
        reasons.push(`Capacité idéale pour votre consommation estimée (${estimatedCupsPerDay} tasses/jour)`)
      } else if (estimatedCupsPerDay < minCups) {
        // Capacité surdimensionnée
        const overCapacityRatio = estimatedCupsPerDay / minCups
        if (overCapacityRatio >= 0.8) {
          // Proche de la capacité minimale
          matchScore += 25
          reasons.push(
            `Capacité légèrement surdimensionnée mais adaptée à votre consommation (${estimatedCupsPerDay} tasses/jour)`,
          )
        } else if (overCapacityRatio >= 0.5) {
          // Moyennement surdimensionnée
          matchScore += 10
          reasons.push(`Capacité surdimensionnée pour votre consommation actuelle, mais offre une marge de croissance`)
        } else {
          // Très surdimensionnée
          matchScore -= 10
          reasons.push(`Capacité largement surdimensionnée pour votre consommation actuelle`)
        }
      } else if (estimatedCupsPerDay > maxCups) {
        // Capacité sous-dimensionnée
        const underCapacityRatio = maxCups / estimatedCupsPerDay
        if (underCapacityRatio >= 0.8) {
          // Proche de la capacité maximale
          matchScore += 15
          reasons.push(
            `Capacité légèrement sous-dimensionnée mais pourrait convenir (${estimatedCupsPerDay} tasses/jour vs ${maxCups} max)`,
          )
        } else if (underCapacityRatio >= 0.6) {
          // Moyennement sous-dimensionnée
          matchScore -= 5
          reasons.push(`Capacité insuffisante pour votre consommation estimée`)
        } else {
          // Très sous-dimensionnée
          matchScore -= 30
          reasons.push(`Capacité nettement insuffisante pour votre consommation estimée`)
        }
      }

      // Check milk drinks capability - Logique améliorée
      if (wantsMilkDrinks) {
        const hasMilkFeature = machine.features.some((f) => f.type === "lait")
        if (hasMilkFeature) {
          const milkFeature = machine.features.find((f) => f.type === "lait")
          if (milkFeature) {
            features.push(milkFeature.label)
          }

          // Critère essentiel - forte pondération
          matchScore += 35
          reasons.push("Compatible avec les boissons lactées que vous souhaitez")
        } else {
          // Critère essentiel non satisfait - forte pénalité
          matchScore -= 50
          reasons.push("Ne propose pas de fonctionnalité pour boissons lactées (critère important)")
        }
      } else {
        // Si l'utilisateur ne veut pas de boissons lactées
        const hasMilkFeature = machine.features.some((f) => f.type === "lait")
        if (!hasMilkFeature) {
          // Bonus pour les machines sans système lait quand ce n'est pas nécessaire
          matchScore += 15
          reasons.push("Machine sans système lait, idéale pour vos besoins")
        }
      }

      // Check payment module - Logique améliorée
      if (wantsPaymentModule) {
        const hasPaymentModule = machine.features.some((f) => f.type === "paiement")
        if (hasPaymentModule) {
          // Critère essentiel - forte pondération
          matchScore += 35
          reasons.push("Équipée d'un module de paiement intégré comme demandé")
          features.push("Module de paiement intégré")
        } else {
          // Critère essentiel non satisfait - forte pénalité
          matchScore -= 50
          reasons.push("Ne dispose pas de module de paiement (critère important)")
        }
      }

      // Add other relevant features
      machine.features.forEach((feature) => {
        if (feature.type === "compact" && !features.includes(feature.label)) {
          features.push(feature.label)
        }
      })

      // Normalisation du score pour éviter les valeurs négatives
      const normalizedScore = Math.max(0, Math.min(100, matchScore))

      return {
        id: machine.id,
        name: machine.name,
        image: machine.image,
        description: machine.description,
        matchScore: normalizedScore,
        reasons,
        features,
      }
    })

    // Filtrer les machines avec un score trop bas (moins de 20%)
    const filteredRecommendations = recommendations.filter((rec) => rec.matchScore >= 20)

    // Si aucune machine ne correspond suffisamment, prendre les 3 meilleures quand même
    const finalRecommendations = filteredRecommendations.length > 0 ? filteredRecommendations : recommendations

    // Sort by match score (highest first) and take top 3
    return finalRecommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAnswer()
    }
  }

  const handleSelectMachine = (machineId: string) => {
    const machine = machines.find((m) => m.id === machineId)
    if (machine) {
      addMachine(machine)
      goToStep("machines")
      handleClose()
    }
  }

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex]

    if (question.type === "select" && question.options) {
      return (
        <div className="mt-6 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-3">
            <div className="bg-[#c36043]/10 p-2 rounded-full mr-3">{question.icon}</div>
            <h3 className="text-lg font-semibold text-gray-800">{question.text}</h3>
          </div>

          {question.description && <p className="text-sm text-gray-600 mb-4 ml-12">{question.description}</p>}

          <div className="flex flex-col gap-2 ml-12 mt-4">
            {question.options.map((option) => (
              <button
                key={option}
                className={`text-left px-4 py-3 rounded-md text-sm ${
                  selectedOption === option
                    ? "bg-[#c36043] text-white shadow-md"
                    : "bg-gray-50 hover:bg-gray-100 hover:shadow-sm border border-gray-100"
                }`}
                onClick={() => setSelectedOption(option)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${selectedOption === option ? "bg-white" : "border border-gray-300"}`}
                  >
                    {selectedOption === option && <Check className="h-3 w-3 text-[#c36043]" />}
                  </div>
                  {option}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              size="lg"
              className="bg-[#c36043] hover:bg-[#a34e35] px-6 shadow-sm"
              onClick={handleAnswer}
              disabled={!selectedOption}
            >
              <Send className="h-4 w-4 mr-2" />
              Suivant
            </Button>
          </div>
        </div>
      )
    } else if (question.type === "number") {
      return (
        <div className="mt-6 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-3">
            <div className="bg-[#c36043]/10 p-2 rounded-full mr-3">{question.icon}</div>
            <h3 className="text-lg font-semibold text-gray-800">{question.text}</h3>
          </div>

          {question.description && <p className="text-sm text-gray-600 mb-4 ml-12">{question.description}</p>}

          <div className="flex ml-12 mt-4">
            <input
              type="number"
              value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#c36043] text-lg"
              placeholder="Entrez un nombre"
              min="1"
            />
            <Button
              className="bg-[#c36043] hover:bg-[#a34e35] rounded-l-none px-6"
              onClick={handleAnswer}
              disabled={!numberInput}
            >
              Suivant
            </Button>
          </div>
        </div>
      )
    }

    return null
  }

  const renderChatHistory = () => {
    return (
      <div className="mb-6 max-h-60 overflow-y-auto space-y-4">
        {answers.map((answer, index) => {
          const question = questions.find((q) => q.id === answer.questionId)
          return (
            <div key={index}>
              <div className="flex items-start mb-3">
                <div className="bg-[#c36043]/10 p-2 rounded-full mr-2 flex-shrink-0">{question?.icon}</div>
                <div className="bg-white rounded-lg p-3 text-sm text-gray-700 flex-1 shadow-sm border border-gray-100">
                  <p className="font-medium">{question?.text}</p>
                </div>
              </div>
              <div className="flex items-start justify-end">
                <div className="bg-[#c36043] rounded-lg p-3 text-sm text-white shadow-sm max-w-[80%]">
                  <p>{answer.answer}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderRecommendations = () => {
    if (recommendations.length === 0) {
      return (
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">
            Nous n'avons pas trouvé de machine correspondant à vos critères. Veuillez contacter un conseiller.
          </p>
        </div>
      )
    }

    return (
      <div className="p-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-[#c36043] mb-6">
          <h3 className="text-xl font-bold mb-2 text-gray-800">Machines recommandées pour vous</h3>
          <p className="text-sm text-gray-600">
            Basé sur vos réponses, voici les machines qui correspondent le mieux à vos besoins.
          </p>
          <div className="flex items-center bg-[#fff8ee] p-3 rounded-md mt-3">
            <Info className="h-5 w-5 text-[#c36043] mr-2" />
            <p className="text-sm text-gray-700">
              <span className="font-medium">Estimation:</span> Pour{" "}
              {answers.find((a) => a.questionId === "collaborators")?.answer || "0"} collaborateurs, nous estimons une
              consommation d'environ{" "}
              {Number.parseInt(answers.find((a) => a.questionId === "collaborators")?.answer || "0") * 2} tasses par
              jour.
            </p>
          </div>
        </div>

        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`bg-white border rounded-lg p-5 hover:shadow-lg transition-all duration-300 ${
                currentHighlightedMachine === rec.id ? "border-[#c36043] border-2 shadow-lg" : "border-gray-200"
              }`}
              onMouseEnter={() => setCurrentHighlightedMachine(rec.id)}
              onMouseLeave={() => setCurrentHighlightedMachine(null)}
            >
              <div className="flex items-center mb-4">
                <div className="relative h-24 w-24 mr-4 bg-gray-50 p-2 rounded-lg">
                  <Image
                    src={rec.image || "/placeholder.svg"}
                    alt={rec.name}
                    fill
                    className={`object-contain transition-transform duration-300 ${
                      currentHighlightedMachine === rec.id ? "scale-110" : ""
                    }`}
                    sizes="96px"
                    style={{ objectFit: "contain", objectPosition: "center" }}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-800">{rec.name}</h4>
                  <p className="text-sm text-gray-500">{rec.description}</p>

                  <div className="mt-2">
                    <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1">
                      <div
                        className="bg-[#c36043] h-2.5 rounded-full"
                        style={{ width: `${Math.round(rec.matchScore)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Correspondance</span>
                      <span className="text-sm font-semibold text-[#c36043]">{Math.round(rec.matchScore)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {rec.features.map((feature, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center"
                  >
                    {feature.includes("tasses") && <Coffee className="h-3 w-3 mr-1" />}
                    {feature.includes("lait") && <Milk className="h-3 w-3 mr-1" />}
                    {feature.includes("paiement") && <CreditCard className="h-3 w-3 mr-1" />}
                    {feature}
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="font-medium text-sm mb-2 text-gray-700">Pourquoi cette machine ?</p>
                <ul className="space-y-1">
                  {rec.reasons.map((reason, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                size="lg"
                className="w-full bg-[#c36043] hover:bg-[#a34e35] shadow-sm group"
                onClick={() => handleSelectMachine(rec.id)}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Sélectionner cette machine
                <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderCompletionMessage = () => {
    if (showRecommendations) {
      return renderRecommendations()
    }

    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-sm">
        <div className="w-20 h-20 mx-auto bg-[#c36043]/10 rounded-full flex items-center justify-center mb-4">
          <Coffee className="h-10 w-10 text-[#c36043]" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-800">Merci pour vos réponses !</h3>
        <p className="text-gray-600 mb-6">
          Un conseiller va analyser vos besoins et vous contactera très prochainement.
        </p>
        <Button className="bg-[#c36043] hover:bg-[#a34e35] shadow-sm px-8" onClick={handleClose} size="lg">
          Fermer
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Bouton flottant amélioré et plus visible */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleOpen}
            className={`
              bg-[#c36043] text-white py-4 px-6 rounded-full shadow-lg 
              flex items-center gap-3 transform transition-all duration-300
              hover:bg-[#a34e35] hover:scale-105 hover:shadow-xl
            `}
            onMouseEnter={() => setIsButtonExpanded(true)}
            onMouseLeave={() => !isOpen && setTimeout(() => setIsButtonExpanded(false), 2000)}
          >
            <div className="relative">
              <HelpCircle className="h-7 w-7" />
              {/* Badge de notification amélioré */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full text-[#c36043] text-xs font-bold flex items-center justify-center border-2 border-white animate-bounce">
                1
              </div>
            </div>

            {/* Texte toujours visible */}
            <div className="flex flex-col">
              <span className="font-bold text-base whitespace-nowrap">Besoin d'aide ?</span>
              <span className="text-xs text-white/90">Cliquez ici pour être guidé</span>
            </div>

            {/* Indicateur visuel pour attirer l'attention */}
          </button>
        </div>
      )}

      {/* Chat box simplifié */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={handleClose}></div>

          <div
            className={`bg-white rounded-xl shadow-2xl relative w-full max-w-3xl overflow-hidden ${isMinimized ? "h-16" : "max-h-[90vh]"}`}
          >
            {/* Header simplifié */}
            <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-[#c36043]/10 p-2 rounded-full mr-3">
                  <Coffee className="h-5 w-5 text-[#c36043]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Besoin d'un coup de pouce ?</h3>
                  <p className="text-xs text-gray-500">Trouvez la machine idéale pour votre entreprise</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleMinimize}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  {isMinimized ? (
                    <MessageCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-xl leading-none">−</span>
                  )}
                </button>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Body simplifié */}
            {!isMinimized && (
              <div className="p-6 bg-gray-50" style={{ maxHeight: "calc(90vh - 4.5rem)", overflowY: "auto" }}>
                {!isComplete ? (
                  <>
                    {currentQuestionIndex === 0 && answers.length === 0 && (
                      <div className="mb-6 p-5 bg-white rounded-lg shadow-sm border border-gray-100">
                        <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
                          <div className="bg-[#c36043]/10 p-1.5 rounded-full mr-2">
                            <Coffee className="h-4 w-4 text-[#c36043]" />
                          </div>
                          Trouvez votre machine idéale
                        </h4>
                        <p className="text-gray-600 mb-4">
                          Répondez à 3 questions simples pour découvrir les machines qui correspondent parfaitement à
                          vos besoins.
                        </p>

                        <div className="flex items-center justify-between mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-7 h-7 rounded-full bg-[#c36043] text-white flex items-center justify-center mr-2">
                              <span>1</span>
                            </div>
                            <span>Collaborateurs</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mr-2">
                              <span>2</span>
                            </div>
                            <span>Boissons lactées</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center mr-2">
                              <span>3</span>
                            </div>
                            <span>Module de paiement</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {answers.length > 0 && renderChatHistory()}
                    {renderQuestion()}
                  </>
                ) : (
                  renderCompletionMessage()
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
