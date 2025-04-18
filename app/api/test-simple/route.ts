import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Utiliser la valeur fournie directement
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

    // Récupérer la réponse
    const status = response.status
    const statusText = response.statusText
    let data

    try {
      data = await response.json()
    } catch (e) {
      data = await response.text()
    }

    return NextResponse.json({
      success: response.ok,
      status,
      statusText,
      data,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
