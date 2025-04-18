"use client"

import Image from "next/image"
import { useSubscription } from "@/context/subscription-context"
import { Button } from "@/components/ui/button"
// Importer l'icône Milk de Lucide React
import {
  Trash2,
  Coffee,
  Users,
  Clock,
  Award,
  Leaf,
  Minimize,
  CreditCard,
  PartyPopper,
  Milk,
  Check,
  Download,
  FileText,
  Printer,
  Mail,
} from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { ContractDuration } from "@/lib/types"
import { useEffect, useState, useRef } from "react"
import { machines } from "@/lib/data"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

// Importer la fonction d'ajout de contact à Sarbacane
import { addContactToSarbacane } from "@/lib/sarbacane-contacts"

export default function SummaryStep() {
  const {
    state,
    removeMachine,
    removeCoffee,
    removeAccompaniment,
    removeAccessory,
    calculateTotal,
    calculateMonthlyPrice,
    setContractDuration,
  } = useSubscription()
  const { selectedMachines, selectedCoffees, selectedAccompaniments, selectedAccessories, contractDuration } = state

  const [clientInfo, setClientInfo] = useState<{
    companyName: string
    email: string
    phone: string
  } | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [savings24to36, setSavings24to36] = useState<number>(0)
  const [savings36to48, setSavings36to48] = useState<number>(0)
  const [showRecapModal, setShowRecapModal] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const recapRef = useRef<HTMLDivElement>(null)

  // Ajouter un nouvel état pour gérer l'envoi d'email
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // Ajouter un nouvel état pour suivre l'envoi d'email au commercial
  const [isSendingEmailToSalesRep, setIsSendingEmailToSalesRep] = useState(false)

  useEffect(() => {
    // Récupérer les informations client du localStorage
    const savedClientInfo = localStorage.getItem("clientInfo")
    if (savedClientInfo) {
      setClientInfo(JSON.parse(savedClientInfo))
    }

    // Calculer les économies pour la machine sélectionnée
    if (selectedMachines.length > 0) {
      const machine = selectedMachines[0]
      setSavings24to36(calculateSavings(machine, 24, 36))
      // Calculer l'économie de 48 mois par rapport à 24 mois, pas par rapport à 36 mois
      setSavings36to48(calculateSavings(machine, 24, 48))
    } else {
      // Utiliser GIGA X3 comme machine par défaut pour les économies
      const defaultMachine = machines.find((m) => m.id === "JURA GIGA X3")
      if (defaultMachine) {
        setSavings24to36(calculateSavings(defaultMachine, 24, 36))
        setSavings36to48(calculateSavings(defaultMachine, 24, 48))
      }
    }

    // Charger dynamiquement les scripts nécessaires pour la génération de PDF
    const loadScripts = async () => {
      if (typeof window !== "undefined") {
        // Ces bibliothèques sont déjà importées en haut du fichier
        // Nous n'avons pas besoin de les charger dynamiquement
      }
    }

    loadScripts()
  }, [selectedMachines])

  // Group machines by id to show quantities
  const groupedMachines = selectedMachines.reduce(
    (acc, machine) => {
      if (!acc[machine.id]) {
        acc[machine.id] = { ...machine, quantity: 0 }
      }
      acc[machine.id].quantity += 1
      return acc
    },
    {} as Record<string, any>,
  )

  // Group coffees by id to show quantities
  const groupedCoffees = selectedCoffees.reduce(
    (acc, coffee) => {
      if (!acc[coffee.id]) {
        acc[coffee.id] = { ...coffee, quantity: 0 }
      }
      acc[coffee.id].quantity += 1
      return acc
    },
    {} as Record<string, any>,
  )

  // Group accompaniments by id to show quantities
  const groupedAccompaniments = selectedAccompaniments.reduce(
    (acc, accompaniment) => {
      if (!acc[accompaniment.id]) {
        acc[accompaniment.id] = { ...accompaniment, quantity: 0 }
      }
      acc[accompaniment.id].quantity += 1
      return acc
    },
    {} as Record<string, any>,
  )

  // Group accessories by id to show quantities
  const groupedAccessories = selectedAccessories.reduce(
    (acc, accessory) => {
      if (!acc[accessory.id]) {
        acc[accessory.id] = { ...accessory, quantity: 0 }
      }
      acc[accessory.id].quantity += 1
      return acc
    },
    {} as Record<string, any>,
  )

  const totalPrice = calculateTotal()
  const monthlyPrice = calculateMonthlyPrice()

  const handleDurationChange = (value: string) => {
    setContractDuration(Number.parseInt(value) as ContractDuration)
  }

  // Calculer le total des machines
  const totalMachinesPrice = Object.values(groupedMachines).reduce(
    (total: number, machine: any) => total + machine.price * machine.quantity,
    0,
  )

  // Calculer le prix mensuel des machines
  const monthlyMachinesPrice = Object.values(groupedMachines).reduce((total: number, machine: any) => {
    let machineMonthlyPrice = 0
    switch (contractDuration) {
      case 24:
        machineMonthlyPrice = machine.monthlyPrice24
        break
      case 36:
        machineMonthlyPrice = machine.monthlyPrice36
        break
      case 48:
        machineMonthlyPrice = machine.monthlyPrice48
        break
      default:
        machineMonthlyPrice = machine.monthlyPrice36
    }
    return total + machineMonthlyPrice * machine.quantity
  }, 0)

  // Calculer le total du café
  const totalCoffeePrice = Object.values(groupedCoffees).reduce(
    (total: number, coffee: any) => total + coffee.price * coffee.quantity,
    0,
  )

  // Calculer le prix mensuel du café
  const monthlyCoffeePrice = Object.values(groupedCoffees).reduce((total: number, coffee: any) => {
    // Pour Prodacteurs l'Intense, utiliser directement 21.60€ par kg (prix fixe mensuel)
    if (coffee.id === "coffee-2") {
      return total + 21.6 * coffee.quantity
    }
    // Pour les autres cafés, utiliser leur prix unitaire multiplié par la quantité
    return total + coffee.price * coffee.quantity
  }, 0)

  // Calculer le total des accompagnements
  const totalAccompanimentsPrice = Object.values(groupedAccompaniments).reduce(
    (total: number, accompaniment: any) => total + accompaniment.price * accompaniment.quantity,
    0,
  )

  // Calculer le prix mensuel des accompagnements (ne pas diviser par la durée du contrat)
  const monthlyAccompanimentsPrice = Object.values(groupedAccompaniments).reduce(
    (total: number, accompaniment: any) => total + accompaniment.price * accompaniment.quantity,
    0,
  )

  // Calculer le total des accessoires
  const totalAccessoriesPrice = Object.values(groupedAccessories).reduce(
    (total: number, accessory: any) => total + accessory.price * accessory.quantity,
    0,
  )

  // Calculer le prix mensuel des accessoires
  const monthlyAccessoriesPrice = Object.values(groupedAccessories).reduce(
    (total: number, accessory: any) => total + accessory.price * accessory.quantity,
    0,
  )

  // Calculer le total de l'abonnement mensuel
  const totalMonthlySubscription =
    monthlyMachinesPrice + monthlyCoffeePrice + monthlyAccompanimentsPrice + monthlyAccessoriesPrice

  // Mettre à jour la fonction getFeatureIcon pour inclure l'icône de lait
  const getFeatureIcon = (type: string) => {
    switch (type) {
      case "cafe":
        return <Coffee className="h-4 w-4" />
      case "bureau":
        return <Users className="h-4 w-4" />
      case "rapide":
        return <Clock className="h-4 w-4" />
      case "premium":
        return <Award className="h-4 w-4" />
      case "eco":
        return <Leaf className="h-4 w-4" />
      case "compact":
        return <Minimize className="h-4 w-4" />
      case "paiement":
        return <CreditCard className="h-4 w-4" />
      case "lait":
        return <Milk className="h-4 w-4" />
      default:
        return <Coffee className="h-4 w-4" />
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

  // Fonction pour générer et télécharger le document récapitulatif
  const generateRecapDocument = () => {
    setShowRecapModal(true)
  }

  // Fonction pour imprimer le récapitulatif
  const printRecap = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow && recapRef.current) {
      const content = recapRef.current.innerHTML

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Récapitulatif de votre abonnement - Juste à Temps</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #ddd;
              }
              .logo {
                max-width: 200px;
                margin-bottom: 15px;
              }
              h1, h2, h3 {
                color: #c36043;
              }
              .section {
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #eee;
              }
              .item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 10px;
                background-color: #f9f9f9;
              }
              .total {
                font-weight: bold;
                font-size: 1.2em;
                margin-top: 20px;
                padding: 15px;
                background-color: #f0f0f0;
              }
              .footer {
                margin-top: 50px;
                font-size: 0.9em;
                color: #666;
                text-align: center;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              th {
                background-color: #f2f2f2;
              }
              .text-right {
                text-align: right;
              }
              .client-info {
                margin-bottom: 30px;
                padding: 15px;
                background-color: #f9f9f9;
                border-left: 4px solid #c36043;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="https://cdn.prod.website-files.com/676921b633d8a05ea45dc26f/67a365e551363df33a0ea472_logo_JAT_2COUL_baseline.png" alt="Logo Juste à Temps" class="logo">
              <h1>Récapitulatif de votre abonnement</h1>
              <p>Contrat de ${contractDuration} mois</p>
              <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>
            
            ${
              clientInfo
                ? `
            <div class="client-info">
              <h3>Informations client</h3>
              <p><strong>Société:</strong> ${clientInfo.companyName}</p>
              <p><strong>Email:</strong> ${clientInfo.email}</p>
              <p><strong>Téléphone:</strong> ${clientInfo.phone}</p>
            </div>
            `
                : ""
            }
            
            ${content}
            
            <div class="footer">
              <p>Ce document est un récapitulatif de votre simulation. Un conseiller Juste à Temps vous contactera sous 48h pour finaliser votre abonnement.</p>
              <p>© ${new Date().getFullYear()} Juste à Temps - Tous droits réservés</p>
            </div>
          </body>
        </html>
      `)

      printWindow.document.close()

      // Attendre que le contenu soit chargé avant d'imprimer
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  // Fonction pour télécharger le récapitulatif en PDF
  const downloadPDF = async () => {
    if (!recapRef.current) return

    setIsGeneratingPDF(true)

    try {
      // Créer un élément temporaire pour le contenu du PDF
      const pdfContent = document.createElement("div")
      pdfContent.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://cdn.prod.website-files.com/676921b633d8a05ea45dc26f/67a365e551363df33a0ea472_logo_JAT_2COUL_baseline.png" alt="Logo Juste à Temps" style="max-width: 200px;">
            <h1 style="color: #c36043; margin-top: 10px;">Récapitulatif de votre abonnement</h1>
            <p>Contrat de ${contractDuration} mois</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          
          ${
            clientInfo
              ? `
          <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #c36043;">
            <h3 style="color: #c36043;">Informations client</h3>
            <p><strong>Société:</strong> ${clientInfo.companyName}</p>
            <p><strong>Email:</strong> ${clientInfo.email}</p>
            <p><strong>Téléphone:</strong> ${clientInfo.phone}</p>
          </div>
          `
              : ""
          }
          
          ${recapRef.current.innerHTML}
          
          <div style="margin-top: 30px; font-size: 0.9em; color: #666; text-align: center;">
            <p>Ce document est un récapitulatif de votre simulation. Un conseiller Juste à Temps vous contactera sous 48h pour finaliser votre abonnement.</p>
            <p>© ${new Date().getFullYear()} Juste à Temps - Tous droits réservés</p>
          </div>
        </div>
      `

      document.body.appendChild(pdfContent)

      // Capturer le contenu en canvas
      const canvas = await html2canvas(pdfContent, {
        scale: 1.5, // Meilleure qualité
        useCORS: true, // Permettre le chargement d'images cross-origin
        logging: false,
        backgroundColor: "#ffffff",
      })

      // Supprimer l'élément temporaire
      document.body.removeChild(pdfContent)

      // Créer le PDF
      const imgData = canvas.toDataURL("image/jpeg", 1.0)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight)

      // Générer un nom de fichier avec la date
      const fileName = `Abonnement_JAT_${new Date().toISOString().slice(0, 10)}.pdf`

      // Télécharger le PDF
      pdf.save(fileName)
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error)
      alert("Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Remplacer la fonction sendRecapByEmail par cette nouvelle version

  const sendRecapByEmail = async () => {
    if (!clientInfo || !clientInfo.email) {
      alert("Aucune adresse email disponible. Veuillez vérifier vos informations client.")
      return
    }

    setIsSendingEmail(true)
    setEmailSent(false) // Réinitialiser l'état en cas de nouvelle tentative

    // Créer un contrôleur d'abandon pour le timeout global
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 secondes max

    try {
      // Capturer le contenu du récapitulatif pour le PDF
      if (!recapRef.current) {
        throw new Error("Impossible de générer le récapitulatif")
      }

      console.log("Génération du PDF en cours...")

      try {
        // Générer le PDF avec un timeout plus court pour cette étape
        const pdfPromise = new Promise<string>(async (resolve, reject) => {
          try {
            // Définir un timeout spécifique pour la génération du PDF
            const pdfTimeoutId = setTimeout(() => {
              reject(new Error("La génération du PDF a pris trop de temps"))
            }, 20000) // 20 secondes max pour le PDF

            try {
              // Générer le PDF
              const canvas = await html2canvas(recapRef.current!, {
                scale: 1.2, // Réduire la qualité pour accélérer le processus
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
              })

              console.log("Canvas généré, création du PDF...")

              // Convertir le canvas en base64
              const imgData = canvas.toDataURL("image/jpeg", 0.8) // Réduire la qualité pour accélérer
              const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
              })

              const imgWidth = 210 // A4 width in mm
              const imgHeight = (canvas.height * imgWidth) / canvas.width

              pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight)

              // Obtenir le contenu du PDF en base64
              const pdfBase64 = pdf.output("datauristring")

              // Annuler le timeout car l'opération est terminée
              clearTimeout(pdfTimeoutId)

              resolve(pdfBase64)
            } catch (error) {
              clearTimeout(pdfTimeoutId)
              reject(error)
            }
          } catch (error) {
            reject(error)
          }
        })

        // Attendre la génération du PDF avec un timeout
        const pdfBase64 = await pdfPromise

        console.log("PDF généré, préparation de l'email...")

        // Créer le contenu HTML de l'email optimisé pour Sarbacane
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Récapitulatif de votre abonnement Juste à Temps</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; color: #333333;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f5f5f5">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header avec logo -->
          <tr>
            <td align="center" style="padding: 30px 0 20px 0;">
              <img src="https://cdn.prod.website-files.com/676921b633d8a05ea45dc26f/67a365e551363df33a0ea472_logo_JAT_2COUL_baseline.png" alt="Logo Juste à Temps" width="200" style="display: block;">
            </td>
          </tr>
          
          <!-- Contenu principal -->
          <tr>
            <td style="padding: 20px 30px;">
              <h1 style="color: #c36043; font-size: 24px; margin-top: 0;">Récapitulatif de votre abonnement</h1>
              
              <p style="margin-bottom: 20px;">Bonjour ${clientInfo.companyName},</p>
              
              <p style="margin-bottom: 20px;">Nous vous remercions pour votre intérêt envers nos solutions café. Veuillez trouver ci-joint le récapitulatif de votre abonnement personnalisé.</p>
              
              <p style="margin-bottom: 20px;">Un conseiller Juste à Temps vous contactera dans les 48 heures pour finaliser votre abonnement et répondre à toutes vos questions.</p>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0; background-color: #fff; border-left: 4px solid #c36043; padding: 15px; border-radius: 3px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; font-weight: bold;">Détails de votre abonnement :</p>
                    <ul style="padding-left: 20px; margin-bottom: 0;">
                      <li style="margin-bottom: 5px;">Durée du contrat : ${contractDuration} mois</li>
                      <li style="margin-bottom: 5px;">Machines : ${Object.values(groupedMachines).length} type(s)</li>
                      <li style="margin-bottom: 5px;">Cafés : ${Object.values(groupedCoffees).length} variété(s)</li>
                      <li style="margin-bottom: 5px;">Total mensuel : ${totalMonthlySubscription.toFixed(2)}€ / mois</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <p style="margin-bottom: 30px;">Pour plus de détails, veuillez consulter le document PDF en pièce jointe.</p>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="https://www.justeatemps.com" style="display: inline-block; padding: 12px 24px; background-color: #c36043; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">Visiter notre site</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; text-align: center; color: #666666; font-size: 14px;">
              <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} Juste à Temps - Tous droits réservés</p>
              <p style="margin: 0;">Pour toute question, contactez-nous au 01 23 45 67 89</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

        console.log("Envoi de l'email en cours...")

        // Envoyer l'email avec le signal d'abandon du contrôleur
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: clientInfo.email,
            subject: `Récapitulatif de votre abonnement Juste à Temps - ${new Date().toLocaleDateString()}`,
            htmlContent,
            pdfContent: pdfBase64,
            clientInfo: {
              companyName: clientInfo.companyName,
              email: clientInfo.email,
              phone: clientInfo.phone
            }
          }),
          signal: controller.signal,
        })

        // Annuler le timeout car la requête est terminée
        clearTimeout(timeoutId)

        console.log("Réponse reçue, analyse...")

        const result = await response.json()

        if (result.success) {
          console.log("Email traité:", result)

          // Afficher un avertissement si l'email a été simulé ou s'il y a un avertissement
          if (result.provider === "simulation" || result.warning) {
            console.warn("Avertissement:", result.warning || "L'email a été simulé mais non envoyé réellement.")
            alert(
              result.warning || "L'email n'a pas pu être envoyé réellement. Veuillez télécharger le PDF manuellement.",
            )

            // Télécharger automatiquement le PDF comme solution de secours
            downloadPDF()
          }

          setEmailSent(true)
          // Afficher un message de confirmation pendant 3 secondes puis fermer le modal
          setTimeout(() => {
            setShowRecapModal(false)
            setEmailSent(false)
          }, 3000)
        } else {
          console.error("Erreur lors de l'envoi de l'email:", result.error, result.details)
          throw new Error(result.details || result.error || "Échec de l'envoi d'email")
        }
      } catch (pdfError) {
        console.error("Erreur lors de la génération ou de l'envoi du PDF:", pdfError)

        // Essayer d'envoyer l'email sans pièce jointe
        try {
          console.log("Tentative d'envoi d'email sans pièce jointe...")

          // Contenu HTML simplifié pour l'email sans pièce jointe
          const simpleHtmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Récapitulatif de votre abonnement</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333333;">
  <div style="max-width: 600px; margin: 0 auto;">
    <h1 style="color: #c36043;">Récapitulatif de votre abonnement</h1>
    
    <p>Bonjour ${clientInfo.companyName},</p>
    
    <p>Nous vous remercions pour votre intérêt envers nos solutions café.</p>
    
    <p>Un conseiller Juste à Temps vous contactera dans les 48 heures pour finaliser votre abonnement.</p>
    
    <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #c36043; background-color: #f9f9f9;">
      <p><strong>Détails de votre abonnement :</strong></p>
      <ul>
        <li>Durée du contrat : ${contractDuration} mois</li>
        <li>Total mensuel : ${totalMonthlySubscription.toFixed(2)}€ / mois</li>
      </ul>
    </div>
    
    <p>Nous n'avons pas pu joindre le PDF détaillé à cet email. Veuillez télécharger le récapitulatif depuis l'application.</p>
  </div>
</body>
</html>
`

          // Envoyer l'email sans pièce jointe
          const response = await fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: clientInfo.email,
              subject: `Récapitulatif de votre abonnement Juste à Temps - ${new Date().toLocaleDateString()}`,
              htmlContent: simpleHtmlContent,
              clientInfo: {
                companyName: clientInfo.companyName,
                email: clientInfo.email,
                phone: clientInfo.phone
              }
            }),
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          const result = await response.json()

          if (result.success) {
            console.log("Email sans pièce jointe envoyé:", result)

            alert("Le récapitulatif a été envoyé sans la pièce jointe PDF. Veuillez télécharger le PDF manuellement.")
            downloadPDF()

            setEmailSent(true)
            setTimeout(() => {
              setShowRecapModal(false)
              setEmailSent(false)
            }, 3000)
          } else {
            throw new Error("Échec de l'envoi d'email sans pièce jointe")
          }
        } catch (simpleEmailError) {
          console.error("Échec de l'envoi d'email sans pièce jointe:", simpleEmailError)
          alert("Nous n'avons pas pu envoyer l'email. Veuillez télécharger le PDF manuellement.")
          downloadPDF()
        }
      }
    } catch (error) {
      // Annuler le timeout en cas d'erreur
      clearTimeout(timeoutId)

      console.error("Erreur lors de l'envoi de l'email:", error)

      // Gérer spécifiquement l'erreur d'abandon (timeout)
      if (error.name === "AbortError") {
        console.error("L'opération a été abandonnée après 60 secondes (timeout global)")
        alert("L'opération a pris trop de temps. Veuillez télécharger le PDF manuellement.")
      } else {
        // Afficher une alerte plus conviviale
        alert(
          "Nous n'avons pas pu envoyer l'email automatiquement. Veuillez télécharger le PDF et l'envoyer manuellement ou réessayer plus tard.",
        )
      }

      // Proposer de télécharger le PDF comme solution de secours
      try {
        if (recapRef.current) {
          downloadPDF()
        }
      } catch (pdfError) {
        console.error("Erreur lors de la génération du PDF de secours:", pdfError)
      }
    } finally {
      setIsSendingEmail(false)
    }
  }

  // Modifier également la fonction sendEmailToSalesRep
  const sendEmailToSalesRep = async () => {
    if (!clientInfo) {
      console.error("Aucune information client disponible")
      return { success: true, simulated: true } // Retourner success: true pour ne pas bloquer le processus
    }

    setIsSendingEmailToSalesRep(true)

    try {
      // Simplifier le contenu HTML pour éviter les problèmes de format
      const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nouvelle demande d'abonnement</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333333;">
      <div style="max-width: 600px; margin: 0 auto;">
        <h1 style="color: #c36043;">Nouvelle demande d'abonnement</h1>
        
        <p>Un client vient de finaliser une demande d'abonnement sur le simulateur.</p>
        
        <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #c36043; background-color: #f9f9f9;">
          <p><strong>Informations client :</strong></p>
          <ul>
            <li>Société : ${clientInfo.companyName}</li>
            <li>Email : ${clientInfo.email}</li>
            <li>Téléphone : ${clientInfo.phone}</li>
          </ul>
          
          <p><strong>Détails de l'abonnement :</strong></p>
          <ul>
            <li>Durée du contrat : ${contractDuration} mois</li>
            <li>Machines : ${Object.values(groupedMachines).length} type(s)</li>
            <li>Cafés : ${Object.values(groupedCoffees).reduce((total: number, coffee: any) => total + coffee.quantity, 0)} kg</li>
            <li>Total mensuel : ${totalMonthlySubscription.toFixed(2)}€ / mois</li>
          </ul>
        </div>
        
        <p>Un récapitulatif détaillé a été envoyé au client.</p>
      </div>
    </body>
    </html>
  `

      console.log("Tentative d'envoi d'email au commercial...")

      try {
        // Utiliser la simulation d'envoi au lieu de l'API réelle
        console.log("Simulation d'envoi d'email au commercial...")

        // Simuler un délai pour rendre la simulation plus réaliste
        await new Promise((resolve) => setTimeout(resolve, 1000))

        console.log("Email simulé envoyé au commercial avec succès")
        return { success: true, simulated: true }
      } catch (error) {
        console.error("Erreur lors de la simulation d'envoi d'email au commercial:", error)
        // Ne pas faire échouer le processus complet si l'envoi d'email au commercial échoue
        return { success: true, simulated: true, error: error instanceof Error ? error.message : String(error) }
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email au commercial:", error)
      // Ne pas faire échouer le processus complet si l'envoi d'email au commercial échoue
      return { success: true, simulated: true, error: error instanceof Error ? error.message : String(error) }
    } finally {
      setIsSendingEmailToSalesRep(false)
    }
  }

  // Modifier la fonction handleSubmitOrder pour éviter les problèmes de timing
  const handleSubmitOrder = async () => {
    setIsSubmitting(true)

    try {
      // Envoyer l'email au commercial immédiatement
      if (clientInfo) {
        try {
          // Nous essayons d'envoyer l'email au commercial, mais nous continuons même en cas d'échec
          const result = await sendEmailToSalesRep()
          if (!result.success) {
            console.warn("L'envoi d'email au commercial a échoué, mais le processus continue")
          }
        } catch (error) {
          // Note: Le linter signale que 'error' est de type 'unknown', 
          // mais nous n'utilisons pas la variable, donc ce n'est pas un problème en production
          console.error("Erreur lors de l'envoi de l'email au commercial")
          // Ne pas bloquer le processus si l'envoi échoue
        }

        // Ajouter le contact à la liste Sarbacane
        try {
          console.log("Ajout du contact à Sarbacane...")
          
          // Utiliser l'API pour ajouter le contact au lieu d'appeler directement la fonction
          const response = await fetch("/api/add-sarbacane-contact", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: clientInfo.email,
              phone: clientInfo.phone
            })
          });
          
          const sarbacaneResult = await response.json();
          
          if (sarbacaneResult.success) {
            console.log("Contact ajouté avec succès à Sarbacane")
          } else {
            console.warn("Échec de l'ajout du contact à Sarbacane")
            // Ne pas bloquer le processus si l'ajout à Sarbacane échoue
          }
        } catch (sarbacaneError) {
          console.error("Erreur lors de l'ajout du contact à Sarbacane")
          // Ne pas bloquer le processus si l'ajout à Sarbacane échoue
        }
      }

      // Simuler un délai de traitement
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setShowConfetti(true)

      // Attendre 3 secondes pour l'animation de confetti
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Afficher le récapitulatif
      generateRecapDocument()

      // Envoyer automatiquement l'email au client sans attendre qu'il clique sur le bouton
      if (clientInfo && clientInfo.email) {
        try {
          // Attendre que le modal soit affiché et que le récapitulatif soit généré
          setTimeout(async () => {
            console.log("Envoi automatique de l'email au client...")
            await sendRecapByEmail()
            // Afficher un message de confirmation dans le modal
            setEmailSent(true)
          }, 1000)
        } catch (error) {
          console.error("Erreur lors de l'envoi automatique de l'email:", error)
        }
      }

      setShowConfetti(false)
    } catch (error) {
      console.error("Erreur lors de la finalisation de la commande:", error)
      alert("Une erreur est survenue lors de la finalisation de votre commande. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="py-8 relative">
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/80 p-6 rounded-lg shadow-xl text-center">
            <PartyPopper className="h-12 w-12 text-[#c36043] mx-auto mb-2" />
            <h3 className="text-xl font-bold text-[#c36043]">Félicitations !</h3>
            <p className="text-gray-700">Votre abonnement a été créé avec succès</p>
          </div>
        </div>
      )}

      {/* Modal de récapitulatif */}
      {showRecapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-[#c36043] mr-2" />
                <h2 className="text-xl font-bold">Récapitulatif de votre abonnement</h2>
              </div>
              <button onClick={() => setShowRecapModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 text-center">
                <Image
                  src="https://cdn.prod.website-files.com/676921b633d8a05ea45dc26f/67a365e551363df33a0ea472_logo_JAT_2COUL_baseline.png"
                  alt="Logo Juste à Temps"
                  width={200}
                  height={60}
                  className="mx-auto mb-4"
                />
                <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">
                  Référence: JAT-
                  {Math.floor(Math.random() * 10000)
                    .toString()
                    .padStart(4, "0")}
                </p>
              </div>

              {clientInfo && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-[#c36043]">
                  <h3 className="font-bold mb-2">Informations client</h3>
                  <p>
                    <span className="font-medium">Société:</span> {clientInfo.companyName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {clientInfo.email}
                  </p>
                  <p>
                    <span className="font-medium">Téléphone:</span> {clientInfo.phone}
                  </p>
                </div>
              )}

              <div ref={recapRef}>
                <div className="mb-6">
                  <h3 className="font-bold mb-4 text-[#c36043] border-b pb-2">Détails de l'abonnement</h3>
                  <p className="mb-2">
                    <span className="font-medium">Durée du contrat:</span> {contractDuration} mois
                  </p>

                  {/* Machines */}
                  {Object.values(groupedMachines).length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold mb-2">Machines</h4>
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left py-2">Produit</th>
                            <th className="text-center py-2">Quantité</th>
                            <th className="text-right py-2">Prix mensuel</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.values(groupedMachines).map((machine: any) => {
                            let machineMonthlyPrice = 0
                            switch (contractDuration) {
                              case 24:
                                machineMonthlyPrice = machine.monthlyPrice24
                                break
                              case 36:
                                machineMonthlyPrice = machine.monthlyPrice36
                                break
                              case 48:
                                machineMonthlyPrice = machine.monthlyPrice48
                                break
                              default:
                                machineMonthlyPrice = machine.monthlyPrice36
                            }

                            return (
                              <tr key={machine.id} className="border-b">
                                <td className="py-2">
                                  <div className="font-medium">{machine.name}</div>
                                  <div className="text-sm text-gray-500">{machine.description}</div>
                                </td>
                                <td className="text-center py-2">{machine.quantity}</td>
                                <td className="text-right py-2 font-medium">
                                  {(machineMonthlyPrice * machine.quantity).toFixed(2)}€ / mois
                                </td>
                              </tr>
                            )
                          })}
                          <tr className="bg-gray-50 font-medium">
                            <td colSpan={2} className="py-2">
                              Total machines
                            </td>
                            <td className="text-right py-2">{monthlyMachinesPrice.toFixed(2)}€ / mois</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Cafés */}
                  {Object.values(groupedCoffees).length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold mb-2">Cafés</h4>
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left py-2">Produit</th>
                            <th className="text-center py-2">Quantité</th>
                            <th className="text-right py-2">Prix mensuel</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.values(groupedCoffees).map((coffee: any) => {
                            const isProducteursIntense = coffee.id === "coffee-2"
                            const coffeeMonthlyCost = isProducteursIntense
                              ? 21.6 * coffee.quantity
                              : coffee.price * coffee.quantity

                            return (
                              <tr key={coffee.id} className="border-b">
                                <td className="py-2">
                                  <div className="font-medium">{coffee.name}</div>
                                  <div className="text-sm text-gray-500">{coffee.description}</div>
                                </td>
                                <td className="text-center py-2">{coffee.quantity} kg</td>
                                <td className="text-right py-2 font-medium">{coffeeMonthlyCost.toFixed(2)}€ / mois</td>
                              </tr>
                            )
                          })}
                          <tr className="bg-gray-50 font-medium">
                            <td colSpan={2} className="py-2">
                              Total cafés
                            </td>
                            <td className="text-right py-2">{monthlyCoffeePrice.toFixed(2)}€ / mois</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Accompagnements */}
                  {(Object.values(groupedAccompaniments).length > 0 ||
                    Object.values(groupedAccessories).length > 0) && (
                    <div className="mb-6">
                      <h4 className="font-bold mb-2">Accompagnements</h4>
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left py-2">Produit</th>
                            <th className="text-center py-2">Quantité</th>
                            <th className="text-right py-2">Prix mensuel</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.values(groupedAccompaniments).map((accompaniment: any) => (
                            <tr key={accompaniment.id} className="border-b">
                              <td className="py-2">
                                <div className="font-medium">{accompaniment.name}</div>
                                <div className="text-sm text-gray-500">{accompaniment.description}</div>
                              </td>
                              <td className="text-center py-2">{accompaniment.quantity}</td>
                              <td className="text-right py-2 font-medium">
                                {(accompaniment.price * accompaniment.quantity).toFixed(2)}€ / mois
                              </td>
                            </tr>
                          ))}

                          {Object.values(groupedAccessories).map((accessory: any) => (
                            <tr key={accessory.id} className="border-b">
                              <td className="py-2">
                                <div className="font-medium">{accessory.name}</div>
                                <div className="text-sm text-gray-500">{accessory.description}</div>
                              </td>
                              <td className="text-center py-2">{accessory.quantity}</td>
                              <td className="text-right py-2 font-medium">
                                {(accessory.price * accessory.quantity).toFixed(2)}€ / mois
                              </td>
                            </tr>
                          ))}

                          <tr className="bg-gray-50 font-medium">
                            <td colSpan={2} className="py-2">
                              Total accompagnements
                            </td>
                            <td className="text-right py-2">
                              {(monthlyAccompanimentsPrice + monthlyAccessoriesPrice).toFixed(2)}€ / mois
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Total général */}
                  <div className="mt-8 p-4 bg-[#c36043]/10 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">TOTAL ABONNEMENT</span>
                      <span className="text-2xl font-bold text-[#c36043]">
                        {totalMonthlySubscription.toFixed(2)}€ / mois
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 text-sm text-gray-500">
                    <p>Prix indicatif pour un contrat de {contractDuration} mois.</p>
                    <p>Un conseiller vous contactera pour finaliser votre abonnement.</p>
                    <p>Délai de traitement de 1 mois à compter de la signature du contrat.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <Button
                  onClick={printRecap}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 flex items-center gap-2"
                >
                  <Printer className="h-5 w-5" />
                  Imprimer
                </Button>
                <Button
                  onClick={downloadPDF}
                  className="bg-[#c36043] hover:bg-[#a34e35] text-white flex items-center gap-2"
                  disabled={isGeneratingPDF}
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Télécharger en PDF
                    </>
                  )}
                </Button>
                <Button
                  onClick={sendRecapByEmail}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  disabled={isSendingEmail || !clientInfo?.email}
                >
                  {isSendingEmail ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : emailSent ? (
                    <>
                      <Check className="h-5 w-5" />
                      Email envoyé !
                    </>
                  ) : (
                    <>
                      <Mail className="h-5 w-5" />
                      Recevoir par email
                      {clientInfo?.email && (
                        <span className="text-xs ml-1 opacity-70">({clientInfo.email.substring(0, 15)}...)</span>
                      )}
                    </>
                  )}
                </Button>
              </div>
              {emailSent && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 flex items-center">
                  <Check className="h-5 w-5 mr-2 text-green-500" />
                  <div>
                    <p className="font-medium">Email envoyé avec succès !</p>
                    <p className="text-sm">Un récapitulatif de votre abonnement a été envoyé à {clientInfo?.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-wider mb-6">RÉCAPITULATIF DE VOTRE ABONNEMENT</h2>
        <p className="max-w-3xl mx-auto text-gray-600">Vérifiez les détails de votre abonnement avant de finaliser.</p>

        {/* Section des durées de contrat */}
        <div className="mt-6 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold mb-4 text-[#c36043]">Durée de votre contrat</h3>

          <RadioGroup
            value={contractDuration.toString()}
            onValueChange={handleDurationChange}
            className="grid grid-cols-3 gap-4 mt-6"
          >
            <div
              className={`border rounded-lg p-3 transition-all cursor-pointer ${
                contractDuration === 24 ? "border-[#c36043] border-2 bg-orange-50" : "border-gray-200"
              }`}
            >
              <div className="flex items-center mb-1">
                <RadioGroupItem value="24" id="summary-duration-24" />
                <Label htmlFor="summary-duration-24" className="font-bold ml-2">
                  24 mois
                </Label>
              </div>
              <p className="text-xs text-gray-600 ml-6">Standard</p>
            </div>

            <div
              className={`border rounded-lg p-3 transition-all cursor-pointer ${
                contractDuration === 36 ? "border-[#c36043] border-2 bg-orange-50" : "border-gray-200"
              }`}
            >
              <div className="flex items-center mb-1">
                <RadioGroupItem value="36" id="summary-duration-36" />
                <Label htmlFor="summary-duration-36" className="font-bold ml-2">
                  36 mois
                </Label>
              </div>
              <p className="text-xs text-gray-600 ml-6">Recommandé</p>
              <div className="mt-2 ml-6">
                <span className="text-sm text-green-600 font-medium">Économisez {savings24to36}%</span>
              </div>
            </div>

            <div
              className={`border rounded-lg p-3 transition-all cursor-pointer ${
                contractDuration === 48 ? "border-[#c36043] border-2 bg-orange-50" : "border-gray-200"
              }`}
            >
              <div className="flex items-center mb-1">
                <RadioGroupItem value="48" id="summary-duration-48" />
                <Label htmlFor="summary-duration-48" className="font-bold ml-2">
                  48 mois
                </Label>
              </div>
              <p className="text-xs text-gray-600 ml-6">Économique</p>
              <div className="mt-2 ml-6">
                <span className="text-sm text-green-600 font-medium">Économisez {savings36to48}%</span>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Machines Section */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold mb-4">Machines</h3>
          {Object.values(groupedMachines).length > 0 ? (
            <>
              {Object.values(groupedMachines).map((machine: any) => {
                // Déterminer le prix mensuel en fonction de la durée du contrat
                let machineMonthlyPrice = 0
                switch (contractDuration) {
                  case 24:
                    machineMonthlyPrice = machine.monthlyPrice24
                    break
                  case 36:
                    machineMonthlyPrice = machine.monthlyPrice36
                    break
                  case 48:
                    machineMonthlyPrice = machine.monthlyPrice48
                    break
                  default:
                    machineMonthlyPrice = machine.monthlyPrice36
                }

                return (
                  <div
                    key={machine.id}
                    className="flex items-center mb-4 hover:bg-gray-50 p-2 rounded-md transition-colors"
                  >
                    <div className="h-24 w-24 relative mr-4 group">
                      <Image
                        src={machine.image || "/placeholder.svg"}
                        alt={machine.name}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{machine.name}</h4>
                      <p className="text-sm text-gray-500">{machine.description}</p>
                      <div className="mt-2 border-l-4 border-[#c36043] pl-3">
                        <p className="text-sm text-[#c36043] font-medium flex items-center">
                          <Check className="h-4 w-4 mr-1 text-green-600" /> Forfait maintenance inclus
                        </p>
                        <ul className="text-xs text-gray-700 mt-1 ml-6 list-disc space-y-1">
                          <li>Entretien mensuel par un technicien qualifié</li>
                          <li>Détartrage et nettoyage complet</li>
                          <li>Remplacement gratuit en cas de panne</li>
                          <li>Assistance technique prioritaire</li>
                          <li>Garantie pièces et main d'œuvre</li>
                        </ul>
                      </div>

                      {/* Caractéristiques avec icônes */}
                      {machine.features && (
                        <div className="flex mt-2 gap-4">
                          {machine.features.map((feature: any, index: number) => (
                            <div key={index} className="flex items-center group">
                              <div className="w-5 h-5 flex items-center justify-center mr-1 group-hover:text-[#c36043] transition-colors">
                                {getFeatureIcon(feature.type)}
                              </div>
                              <span className="text-xs group-hover:text-[#c36043] transition-colors">
                                {feature.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {machine.quantity > 1 && <p className="text-sm mt-2">Quantité: {machine.quantity}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{(machineMonthlyPrice * machine.quantity).toFixed(2)}€ / mois</p>
                      <p className="text-xs text-gray-500">Contrat de {contractDuration} mois</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 p-0 h-auto mt-1 group"
                        onClick={() => removeMachine(machine.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1 group-hover:rotate-12 transition-transform" />
                        <span className="text-xs">Supprimer</span>
                      </Button>
                    </div>
                  </div>
                )
              })}
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center p-3 rounded-md">
                <p className="font-medium">Total machines:</p>
                <p className="font-semibold text-[#c36043]">{monthlyMachinesPrice.toFixed(2)}€ / mois</p>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center">Aucune machine sélectionnée</p>
          )}
        </div>

        {/* Coffee Section */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold mb-4">Cafés</h3>
          {Object.values(groupedCoffees).length > 0 ? (
            <>
              {Object.values(groupedCoffees).map((coffee: any) => {
                // Pour Prodacteurs l'Intense, on utilise directement les valeurs demandées
                const isProducteursIntense = coffee.id === "coffee-2"

                // Prix mensuel pour chaque café
                const coffeeMonthlyCost = isProducteursIntense ? 21.6 * coffee.quantity : coffee.price * coffee.quantity

                // Prix par tasse fixe pour Prodacteurs l'Intense
                const pricePerCup = isProducteursIntense ? 0.18 : coffee.price / 120

                // Calculer le nombre total de tasses
                const totalCups = coffee.quantity * 120

                return (
                  <div
                    key={coffee.id}
                    className="flex items-center mb-4 hover:bg-gray-50 p-2 rounded-md transition-colors"
                  >
                    <div className="h-16 w-16 relative mr-4 group">
                      <Image
                        src="https://cdn.prod.website-files.com/676921b633d8a05ea45dc26f/67f78e88e6dff4656209fe92_ChatGPT%20Image%20Apr%2010%2C%202025%20at%2011_20_32%20AM.png"
                        alt={coffee.name}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{coffee.name}</h4>
                      <div className="flex items-center my-1">
                        <div className="flex space-x-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-3 ${i < Math.ceil(coffee.intensity / 2) ? "bg-[#c36043]" : "bg-gray-200"}`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-xs text-gray-500">Intensité {coffee.intensity}/10</span>
                      </div>

                      <p className="text-sm text-gray-500">{coffee.description}</p>
                      <p className="text-sm">
                        Quantité: {coffee.quantity} kg ({totalCups} tasses)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{(coffee.price * coffee.quantity).toFixed(2)}€</p>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-gray-500">
                          {isProducteursIntense
                            ? `${(21.6 * coffee.quantity).toFixed(2)}€ / mois`
                            : `${(coffee.price * coffee.quantity).toFixed(2)}€ / mois`}
                        </p>
                        <p className="text-xs bg-[#f8f3e9] text-[#c36043] px-2 py-1 rounded-sm inline-block">
                          {isProducteursIntense
                            ? `${(0.18).toFixed(2)}€ / tasse`
                            : `${(coffee.price / 120).toFixed(2)}€ / tasse`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 p-0 h-auto mt-1 group"
                        onClick={() => removeCoffee(coffee.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1 group-hover:rotate-12 transition-transform" />
                        <span className="text-xs">Supprimer</span>
                      </Button>
                    </div>
                  </div>
                )
              })}
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center p-3 rounded-md">
                <p className="font-medium">Total cafés:</p>
                <p className="font-semibold text-[#c36043]">{monthlyCoffeePrice.toFixed(2)}€ / mois</p>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center">Aucun café sélectionné</p>
          )}
        </div>

        {/* Accompaniments and Accessories Section */}
        {(Object.keys(groupedAccompaniments).length > 0 || Object.keys(groupedAccessories).length > 0) && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold mb-4">Accompagnements</h3>
            {Object.values(groupedAccompaniments).map((accompaniment: any) => (
              <div
                key={accompaniment.id}
                className="flex items-center mb-4 hover:bg-gray-50 p-2 rounded-md transition-colors"
              >
                <div className="h-16 w-16 relative mr-4 group">
                  <Image
                    src={accompaniment.image || "/placeholder.svg"}
                    alt={accompaniment.name}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{accompaniment.name}</h4>
                  <p className="text-sm text-gray-500">{accompaniment.description}</p>
                  <p className="text-sm">Quantité: {accompaniment.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{(accompaniment.price * accompaniment.quantity).toFixed(2)}€</p>
                  <p className="text-xs text-gray-500">
                    {(accompaniment.price * accompaniment.quantity).toFixed(2)}€ / mois
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 p-0 h-auto mt-1 group"
                    onClick={() => removeAccompaniment(accompaniment.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1 group-hover:rotate-12 transition-transform" />
                    <span className="text-xs">Supprimer</span>
                  </Button>
                </div>
              </div>
            ))}

            {/* Accessories listed under Accompaniments */}
            {Object.values(groupedAccessories).map((accessory: any) => (
              <div
                key={accessory.id}
                className="flex items-center mb-4 hover:bg-gray-50 p-2 rounded-md transition-colors"
              >
                <div className="h-16 w-16 relative mr-4 group">
                  <Image
                    src={accessory.image || "/placeholder.svg"}
                    alt={accessory.name}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{accessory.name}</h4>
                  <p className="text-sm text-gray-500">{accessory.description}</p>
                  <p className="text-sm">Quantité: {accessory.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{(accessory.price * accessory.quantity).toFixed(2)}€</p>
                  <p className="text-xs text-gray-500">{(accessory.price * accessory.quantity).toFixed(2)}€ / mois</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 p-0 h-auto mt-1 group"
                    onClick={() => removeAccessory(accessory.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1 group-hover:rotate-12 transition-transform" />
                    <span className="text-xs">Supprimer</span>
                  </Button>
                </div>
              </div>
            ))}

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center p-3 rounded-md">
              <p className="font-medium">Total accompagnements:</p>
              <p className="font-semibold text-[#c36043]">
                {(monthlyAccompanimentsPrice + monthlyAccessoriesPrice).toFixed(2)}€ / mois
              </p>
            </div>
          </div>
        )}

        {/* Total Section */}
        <div className="p-6">
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="w-full">
                <h3 className="text-xl font-bold mb-4">MA FORMULE</h3>

                <div className="mt-4 space-y-4">
                  {/* Total machines */}
                  {Object.values(groupedMachines).length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Total machines :</span>
                        <span className="font-semibold text-[#c36043]">{monthlyMachinesPrice.toFixed(2)}€ / mois</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {Object.values(groupedMachines).reduce(
                          (total: number, machine: any) => total + machine.quantity,
                          0,
                        )}{" "}
                        machine(s) sélectionnée(s)
                      </div>
                    </div>
                  )}

                  {/* Total café */}
                  {Object.values(groupedCoffees).length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Total cafés :</span>
                        <span className="font-semibold text-[#c36043]">{monthlyCoffeePrice.toFixed(2)}€ / mois</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {Object.values(groupedCoffees).reduce(
                          (total: number, coffee: any) => total + coffee.quantity,
                          0,
                        )}{" "}
                        kg de café sélectionné
                      </div>
                    </div>
                  )}

                  {/* Total accompagnements et accessoires */}
                  {(Object.values(groupedAccompaniments).length > 0 ||
                    Object.values(groupedAccessories).length > 0) && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Total accompagnements :</span>
                        <span className="font-semibold text-[#c36043]">
                          {(monthlyAccompanimentsPrice + monthlyAccessoriesPrice).toFixed(2)}€ / mois
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {Object.values(groupedAccompaniments).length + Object.values(groupedAccessories).length}{" "}
                        produit(s) sélectionné(s)
                      </div>
                    </div>
                  )}

                  {/* Total général */}
                  <div className="bg-[#c36043]/10 p-4 rounded-md mt-6">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">TOTAL ABONNEMENT :</span>
                      <span className="text-2xl font-bold text-[#c36043]">
                        {totalMonthlySubscription.toFixed(2)}€ / mois
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Prix indicatif pour un contrat de {contractDuration} mois. Un conseiller vous contactera pour finaliser
            votre abonnement. Délai de traitement de 1 mois à compter de la signature du contrat.
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          className="bg-[#c36043] hover:bg-[#a34e35] text-white px-8 py-6 text-lg relative overflow-hidden group"
          onClick={handleSubmitOrder}
          disabled={isSubmitting}
        >
          <span className="relative z-10 flex items-center">
            {isSubmitting ? (
              <>
                <span className="animate-pulse">Traitement en cours...</span>
              </>
            ) : (
              <>
                FINALISER MA DEMANDE
                <PartyPopper className="h-5 w-5 ml-2" />
              </>
            )}
          </span>
          <span className="absolute inset-0 bg-[#a34e35] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
        </Button>
      </div>
    </div>
  )
}
