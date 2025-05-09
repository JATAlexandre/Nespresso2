import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('=== TEST CONNEXION SARBACANE ===');
    
    // Récupérer les identifiants
    const accountId = process.env.SARBACANE_ACCOUNT_ID || "";
    const apiKey = process.env.SARBACANE_API_KEY || "";

    console.log("Identifiants Sarbacane:", { 
      accountIdExists: !!accountId, 
      apiKeyExists: !!apiKey,
      accountIdLength: accountId.length,
      apiKeyLength: apiKey.length
    });

    if (!accountId || !apiKey) {
      return res.status(400).json({ error: "Identifiants Sarbacane manquants dans .env" });
    }

    // Créer l'authentification
    const authHeader = `Basic ${Buffer.from(`${accountId}:${apiKey}`).toString("base64")}`;

    // Tester l'API Tipimail
    console.log("Test de connexion à l'API Tipimail...");
    try {
      const tipiResponse = await fetch("https://api.tipimail.com/v1/lists", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader,
          "Accept": "application/json",
        }
      });

      console.log("Réponse Tipimail:", {
        status: tipiResponse.status,
        statusText: tipiResponse.statusText,
        ok: tipiResponse.ok
      });

      if (tipiResponse.ok) {
        const data = await tipiResponse.json();
        return res.status(200).json({
          success: true,
          api: "tipimail",
          status: tipiResponse.status,
          message: "Connexion à l'API Tipimail réussie",
          lists: Array.isArray(data) ? data.map(list => ({ id: list.id, name: list.name })) : data
        });
      }

      const tipiErrorText = await tipiResponse.text();
      console.log("Erreur Tipimail brute:", tipiErrorText);
    } catch (tipiError) {
      console.error("Erreur lors de la connexion à Tipimail:", tipiError);
    }

    // Tester l'API Sarbacane classique en fallback
    console.log("Échec Tipimail. Test de connexion à l'API Sarbacane classique...");
    try {
      const sarbacaneResponse = await fetch("https://api.sarbacane.com/v1/lists", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader,
          "Accept": "application/json",
        }
      });

      console.log("Réponse Sarbacane classique:", {
        status: sarbacaneResponse.status,
        statusText: sarbacaneResponse.statusText,
        ok: sarbacaneResponse.ok
      });

      if (sarbacaneResponse.ok) {
        const data = await sarbacaneResponse.json();
        return res.status(200).json({
          success: true,
          api: "sarbacane",
          status: sarbacaneResponse.status,
          message: "Connexion à l'API Sarbacane classique réussie",
          lists: Array.isArray(data) ? data.map(list => ({ id: list.id, name: list.name })) : data
        });
      }

      const sarbacaneErrorText = await sarbacaneResponse.text();
      console.log("Erreur Sarbacane classique brute:", sarbacaneErrorText);
      
      try {
        const errorData = JSON.parse(sarbacaneErrorText);
        return res.status(400).json({
          success: false,
          error: "Échec des deux APIs Sarbacane",
          sarbacaneError: errorData
        });
      } catch (e) {
        return res.status(400).json({
          success: false,
          error: "Échec des deux APIs Sarbacane",
          sarbacaneErrorText: sarbacaneErrorText
        });
      }
    } catch (sarbacaneError) {
      console.error("Erreur lors de la connexion à Sarbacane classique:", sarbacaneError);
      return res.status(500).json({
        success: false,
        error: "Impossible de se connecter aux APIs Sarbacane",
        details: sarbacaneError instanceof Error ? sarbacaneError.message : String(sarbacaneError)
      });
    }
  } catch (error) {
    console.error("Erreur générale:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur lors du test de connexion",
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 