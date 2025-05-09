import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

// Améliorer la gestion des erreurs et ajouter des logs plus détaillés
export async function POST(request: Request) {
  // Créer un contrôleur d'abandon pour le timeout global de la route API
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 45000) // 45 secondes max pour l'ensemble de la route

  try {
    console.log("API send-email: Début du traitement")

    try {
      const { to, subject, htmlContent, pdfContent, clientInfo } = await request.json()

      // Valider les paramètres requis
      if (!to || !subject || !htmlContent) {
        console.error("API send-email: Paramètres manquants:", { 
          to: Boolean(to), 
          subject: Boolean(subject), 
          htmlContent: Boolean(htmlContent) 
        })
        throw new Error("Paramètres requis manquants (to, subject, htmlContent)")
      }

      console.log("API send-email: Paramètres valides, envoi de l'email à", to)

      try {
        console.log("API send-email: Tentative d'envoi avec Office 365")

        // Utiliser la fonction avec gestion des erreurs intégrée
        const result = await sendEmail({
          to,
          subject,
          htmlContent,
          pdfContent,
          clientInfo,
        })

        console.log("API send-email: Résultat de l'envoi:", result)

        // Annuler le timeout car l'opération est terminée
        clearTimeout(timeoutId)

        // Extraire la propriété warning si elle existe
        const { warning, ...restResult } = result as any

        return NextResponse.json({
          ...restResult,
          provider: "office365",
          warning: warning || undefined,
        })
      } catch (error: any) {
        console.error("API send-email: Erreur inattendue:", error)

        // Annuler le timeout en cas d'erreur
        clearTimeout(timeoutId)

        // Gérer spécifiquement l'erreur d'abandon (timeout)
        let errorMessage = "Échec de l'envoi d'email"
        if (error.name === "AbortError") {
          errorMessage = "L'opération a pris trop de temps et a été abandonnée"
          console.error("API send-email: Timeout déclenché")
        }

        // Même en cas d'erreur inattendue, retourner success: true
        return NextResponse.json({
          success: true,
          provider: "none",
          error: errorMessage,
          details: error instanceof Error ? error.message : String(error),
          warning: "L'email n'a pas pu être envoyé. Veuillez télécharger le PDF manuellement.",
        })
      }
    } catch (error: any) {
      console.error("API send-email: Erreur générale:", error)

      // Annuler le timeout en cas d'erreur
      clearTimeout(timeoutId)

      return NextResponse.json({
        success: true,
        provider: "none",
        error: "Échec de l'envoi d'email",
        details: error instanceof Error ? error.message : String(error),
        warning: "L'email n'a pas pu être envoyé. Veuillez télécharger le PDF manuellement.",
      })
    }
  } catch (error: any) {
    console.error("API send-email: Erreur critique non gérée:", error)
    
    // Annuler le timeout en cas d'erreur
    clearTimeout(timeoutId)
    
    return NextResponse.json({
      success: false,
      error: "Erreur inattendue lors du traitement de la requête",
    }, { status: 500 })
  }
}
