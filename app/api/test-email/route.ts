import { NextResponse } from "next/server"
import { sendEmailViaSarbacane } from "@/lib/sarbacane"
import { sendEmailViaOffice365 } from "@/lib/email"

export async function GET(request: Request) {
  try {
    // Utiliser les valeurs fournies directement
    const accountId = "5ad5f34ab85b532bca1496ba"
    const apiKey = "vr6NJGgCQUOViR79jIK60w"

    // Créer l'en-tête d'authentification Basic
    const authHeader = `Basic ${Buffer.from(`${accountId}:${apiKey}`).toString("base64")}`

    // Tester l'API Sarbacane avec une requête simple
    const response = await fetch("https://api.sarbacane.com/v1/info", {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        message: "Erreur lors du test de l'API Sarbacane",
        status: response.status,
        error: errorText,
      })
    }

    // Pas besoin de vérifier si les variables sont définies puisqu'on utilise des valeurs codées en dur
    return NextResponse.json({
      success: true,
      message: "Configuration Sarbacane détectée",
      env: {
        SARBACANE_ACCOUNT_ID: accountId.substring(0, 5) + "...",
        SARBACANE_API_KEY: "***" + apiKey.substring(apiKey.length - 5),
      },
    })
  } catch (error) {
    console.error("Erreur lors du test de configuration:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur de test",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Adresse email manquante" }, { status: 400 })
    }

    // Créer des informations client fictives pour le test
    const testClientInfo = {
      companyName: "Société Test",
      email: email,
      phone: "01 23 45 67 89"
    }

    // Envoyer un email de test simple sans pièce jointe
    const result = await sendEmailViaOffice365({
      to: email,
      subject: "Test d'envoi d'email",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #c36043;">Test de configuration email</h1>
          <p>Ceci est un email de test pour vérifier que la configuration de l'envoi d'emails fonctionne correctement.</p>
          <p>Date et heure du test: ${new Date().toLocaleString()}</p>
        </div>
      `,
      clientInfo: testClientInfo
    })

    return NextResponse.json({
      success: true,
      message: "Email de test envoyé avec succès",
      result,
    })
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de test:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Échec de l'envoi d'email de test",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
