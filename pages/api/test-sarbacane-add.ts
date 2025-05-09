import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    // Récupérer les données du corps de la requête
    const { email, companyName, phone } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }
    
    console.log('=== TEST AJOUT DIRECT CONTACT SARBACANE ===');
    console.log('Données reçues:', { email, companyName, phone });
    
    // Récupérer les identifiants
    const accountId = process.env.SARBACANE_ACCOUNT_ID || "";
    const apiKey = process.env.SARBACANE_API_KEY || "";

    if (!accountId || !apiKey) {
      return res.status(400).json({ error: "Identifiants Sarbacane manquants" });
    }

    // Créer l'authentification
    const authHeader = `Basic ${Buffer.from(`${accountId}:${apiKey}`).toString("base64")}`;
    
    // ID de la liste "Lead simu café" (trouvée avec le test de connexion)
    const listId = "31841b7a-8f8d-421f-99d7-3cd528fb3c6e";
    
    // Préparer les données du contact
    const contactData = {
      email: email,
      phone: phone || ""
    };
    
    console.log('Données de contact pour l\'API:', JSON.stringify(contactData));
    
    // Utiliser directement l'API Sarbacane classique qui a fonctionné
    const endpoint = `https://api.sarbacane.com/v1/lists/${listId}/contacts`;
    console.log('Endpoint utilisé:', endpoint);
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
        "Accept": "application/json",
      },
      body: JSON.stringify(contactData)
    });
    
    console.log('Statut réponse:', response.status, response.statusText);
    
    // Lire le corps de la réponse (texte brut)
    const responseText = await response.text();
    console.log('Corps de la réponse:', responseText);
    
    let responseData;
    try {
      // Tenter de parser le JSON si présent
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      responseData = { raw: responseText };
    }
    
    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: "Contact ajouté avec succès",
        status: response.status,
        data: responseData
      });
    } else {
      // Si erreur 409, c'est que le contact existe déjà
      if (response.status === 409) {
        return res.status(200).json({
          success: true,
          message: "Le contact existe déjà dans la liste",
          status: response.status,
          data: responseData
        });
      }
      
      return res.status(400).json({
        success: false,
        error: "Erreur lors de l'ajout du contact",
        status: response.status,
        data: responseData
      });
    }
  } catch (error) {
    console.error('Erreur:', error);
    return res.status(500).json({
      success: false,
      error: "Erreur technique lors de l'ajout",
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 