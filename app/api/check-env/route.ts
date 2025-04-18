import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Lister les variables d'environnement que nous voulons vérifier
    const envVars = {
      EMAIL_HOST: process.env.EMAIL_HOST,
      EMAIL_PORT: process.env.EMAIL_PORT,
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "Défini" : undefined,
      EMAIL_FROM: process.env.EMAIL_FROM,
    }

    // Préparer la réponse avec des informations masquées pour la sécurité
    const response = {
      success: true,
      variables: {
        EMAIL_HOST: {
          defined: Boolean(envVars.EMAIL_HOST),
          value: envVars.EMAIL_HOST || "Non défini",
        },
        EMAIL_PORT: {
          defined: Boolean(envVars.EMAIL_PORT),
          value: envVars.EMAIL_PORT || "Non défini",
        },
        EMAIL_USER: {
          defined: Boolean(envVars.EMAIL_USER),
          value: envVars.EMAIL_USER || "Non défini",
        },
        EMAIL_PASSWORD: {
          defined: Boolean(envVars.EMAIL_PASSWORD),
          value: envVars.EMAIL_PASSWORD ? "********" : "Non défini",
        },
        EMAIL_FROM: {
          defined: Boolean(envVars.EMAIL_FROM),
          value: envVars.EMAIL_FROM || "Non défini",
        },
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Erreur lors de la vérification des variables d'environnement:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la vérification des variables d'environnement",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
