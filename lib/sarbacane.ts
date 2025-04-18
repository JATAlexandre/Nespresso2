/**
 * Utilitaire pour l'API Sarbacane
 */

// Types pour l'API Sarbacane
type EmailRecipient = {
  email: string
  name?: string
}

type EmailAttachment = {
  name: string
  content: string // Base64 encoded content
  contentType: string
}

type EmailRequest = {
  sender: {
    email: string
    name: string
  }
  to: EmailRecipient[]
  subject: string
  htmlContent: string
  attachments?: EmailAttachment[]
}

/**
 * Envoie un email via l'API Sarbacane
 */
export async function sendEmailViaSarbacane({
  to,
  subject,
  htmlContent,
  pdfContent,
}: {
  to: string
  subject: string
  htmlContent: string
  pdfContent?: string
}) {
  // Utiliser les valeurs fournies directement
  const accountId = process.env.SARBACANE_ACCOUNT_ID || "5ad5f34ab85b532bca1496ba"
  const apiKey = process.env.SARBACANE_API_KEY || "vr6NJGgCQUOViR79jIK60w"

  console.log("Tentative d'envoi d'email via Sarbacane à:", to)
  console.log("Utilisation des identifiants:", {
    accountId: accountId.substring(0, 5) + "...",
    apiKey: "***" + apiKey.substring(apiKey.length - 5),
  })

  // Valider l'adresse email
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    throw new Error("Adresse email invalide: " + to)
  }

  try {
    // Créer l'en-tête d'authentification Basic
    const authHeader = `Basic ${Buffer.from(`${accountId}:${apiKey}`).toString("base64")}`
    console.log("En-tête d'authentification généré")

    // Préparer le corps de la requête pour l'API Sarbacane
    const payload: any = {
      sender: {
        name: "Juste à Temps",
        email: "contact@justeatemps.com",
      },
      to: [
        {
          email: to,
          name: to.split("@")[0], // Utiliser la partie locale de l'email comme nom par défaut
        },
      ],
      subject: subject,
      htmlContent: htmlContent,
    }

    // Ajouter la pièce jointe PDF si fournie
    if (pdfContent) {
      try {
        // Vérifier si le contenu est déjà en base64 ou s'il contient encore le préfixe
        const base64Content = pdfContent.includes("base64,") ? pdfContent.split("base64,")[1] : pdfContent

        // Ajouter la pièce jointe au format attendu par Sarbacane
        payload.attachments = [
          {
            name: `Abonnement_JAT_${new Date().toISOString().slice(0, 10)}.pdf`,
            content: base64Content,
            contentType: "application/pdf",
          },
        ]
        console.log("Pièce jointe PDF ajoutée à l'email")
      } catch (error) {
        console.error("Erreur lors de la préparation du PDF:", error)
        console.warn("L'email sera envoyé sans pièce jointe PDF")
      }
    }

    console.log("Envoi de la requête à l'API Sarbacane...")

    // Créer un contrôleur d'abandon pour pouvoir annuler la requête après un certain délai
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // Timeout de 30 secondes

    try {
      // Essayer d'abord avec l'API Tipimail (nouvelle API de Sarbacane)
      const apiUrl = "https://api.tipimail.com/v1/messages/send"

      console.log("Tentative avec l'API Tipimail:", apiUrl)

      // Envoyer la requête à l'API avec le signal d'abandon
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      // Annuler le timeout car la requête est terminée
      clearTimeout(timeoutId)

      // Log de la réponse complète pour le débogage
      console.log("Statut de la réponse:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Réponse d'erreur brute:", errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData = { message: errorText }
        }
        console.error("Erreur Sarbacane:", errorData)
        throw new Error(`Erreur Sarbacane: ${JSON.stringify(errorData)}`)
      }

      const result = await response.json()
      console.log("Email envoyé avec succès via Sarbacane:", result)
      return { success: true, messageId: result.id || result.messageId }
    } catch (fetchError) {
      // Annuler le timeout en cas d'erreur
      clearTimeout(timeoutId)

      // Gérer spécifiquement l'erreur de timeout
      if (fetchError.name === "AbortError") {
        console.error("La requête a été abandonnée après 30 secondes (timeout)")
        throw new Error("Délai d'attente dépassé lors de la connexion à Sarbacane")
      }

      // Essayer avec l'ancienne API Sarbacane si la première tentative échoue
      console.log("Échec avec Tipimail, tentative avec l'API Sarbacane classique...")

      try {
        const oldApiUrl = "https://api.sarbacane.com/v1/emails/send"
        const controller2 = new AbortController()
        const timeoutId2 = setTimeout(() => controller2.abort(), 30000)

        const response2 = await fetch(oldApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller2.signal,
        })

        clearTimeout(timeoutId2)

        if (!response2.ok) {
          const errorText = await response2.text()
          console.error("Réponse d'erreur brute (API classique):", errorText)
          throw new Error(`Erreur Sarbacane (API classique): ${errorText}`)
        }

        const result = await response2.json()
        console.log("Email envoyé avec succès via l'API Sarbacane classique:", result)
        return { success: true, messageId: result.id || result.messageId }
      } catch (oldApiError) {
        console.error("Échec également avec l'API Sarbacane classique:", oldApiError)
        throw oldApiError
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email via Sarbacane:", error)
    throw error
  }
}

// Fonction de secours pour simuler l'envoi d'email (utilisée quand l'API échoue)
export async function simulateEmailSend({
  to,
  subject,
  htmlContent,
}: {
  to: string
  subject: string
  htmlContent: string
}) {
  console.log("Simulation d'envoi d'email à:", to)
  console.log("Sujet:", subject)

  // Simuler un délai pour rendre la simulation plus réaliste
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    success: true,
    messageId: `simulated-${Date.now()}`,
    simulated: true,
  }
}

// Fonction pour envoyer un email avec gestion des erreurs intégrée
export async function sendEmailWithFallback({
  to,
  subject,
  htmlContent,
  pdfContent,
}: {
  to: string
  subject: string
  htmlContent: string
  pdfContent?: string
}) {
  // Créer un contrôleur d'abandon pour le timeout global
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 secondes max

  try {
    // Essayer d'abord d'envoyer via Sarbacane
    try {
      const result = await sendEmailViaSarbacane({
        to,
        subject,
        htmlContent,
        pdfContent,
      })

      // Annuler le timeout car l'opération est terminée
      clearTimeout(timeoutId)

      return result
    } catch (error) {
      console.error("Échec de l'envoi via Sarbacane, tentative sans pièce jointe:", error)

      // Si l'erreur est liée à la pièce jointe (taille trop grande), essayer sans pièce jointe
      if (
        pdfContent &&
        (error.message?.includes("size") || error.message?.includes("large") || error.message?.includes("attachment"))
      ) {
        console.log("Tentative d'envoi sans pièce jointe...")

        try {
          const resultWithoutAttachment = await sendEmailViaSarbacane({
            to,
            subject: subject + " (sans pièce jointe)",
            htmlContent:
              htmlContent +
              "<p style='color:red'>Note: La pièce jointe n'a pas pu être incluse en raison de sa taille.</p>",
          })

          // Annuler le timeout car l'opération est terminée
          clearTimeout(timeoutId)

          return {
            ...resultWithoutAttachment,
            warning: "L'email a été envoyé sans la pièce jointe PDF. Veuillez télécharger le PDF manuellement.",
          }
        } catch (secondError) {
          console.error("Échec de l'envoi sans pièce jointe:", secondError)
          throw secondError // Propager l'erreur pour utiliser la simulation
        }
      } else {
        throw error // Propager l'erreur pour utiliser la simulation
      }
    }
  } catch (error) {
    // Annuler le timeout en cas d'erreur
    clearTimeout(timeoutId)

    console.error("Échec de l'envoi via Sarbacane, utilisation de la simulation:", error)

    // Gérer spécifiquement l'erreur d'abandon (timeout)
    if (error.name === "AbortError") {
      console.error("L'opération a été abandonnée après 30 secondes (timeout global)")
    }

    // En cas d'échec, utiliser la simulation
    return {
      ...(await simulateEmailSend({ to, subject, htmlContent })),
      warning: "L'email n'a pas pu être envoyé via le service d'emailing. Veuillez télécharger le PDF manuellement.",
    }
  }
}
