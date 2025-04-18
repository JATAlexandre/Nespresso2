/**
 * Utilitaire pour gérer les contacts dans Sarbacane
 */

/**
 * Type pour représenter un contact Sarbacane
 */
type SarbacaneContact = {
  email: string;
  phone?: string;
};

/**
 * Ajoute un contact à la liste "Lead simu café" dans Sarbacane
 */
export async function addContactToSarbacane({
  email,
  phone,
}: {
  email: string;
  phone?: string;
}) {
  console.log("=== DÉBUT addContactToSarbacane ===");
  console.log("Paramètres reçus:", { email, phone });
  
  // Valider l'adresse email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("Validation email échouée:", email);
    throw new Error("Adresse email invalide pour l'ajout à Sarbacane: " + email);
  }

  try {
    // Utiliser les valeurs d'environnement pour l'authentification
    const accountId = process.env.SARBACANE_ACCOUNT_ID || "";
    const apiKey = process.env.SARBACANE_API_KEY || "";

    console.log("Variables d'environnement:", { 
      accountIdExists: !!accountId, 
      apiKeyExists: !!apiKey,
      accountIdLength: accountId.length,
      apiKeyLength: apiKey.length
    });

    if (!accountId || !apiKey) {
      console.error("Identifiants Sarbacane manquants dans les variables d'environnement");
      return { success: false, error: "Configuration Sarbacane manquante" };
    }

    console.log("Tentative d'ajout de contact à Sarbacane:", email);

    // Créer l'en-tête d'authentification Basic
    const authHeader = `Basic ${Buffer.from(`${accountId}:${apiKey}`).toString("base64")}`;
    console.log("En-tête d'authentification généré (format masqué): Basic ***");

    // Préparer les données du contact (format simple avec phone à la racine)
    const contactData: SarbacaneContact = {
      email: email,
      ...(phone && { phone: phone })
    };
    console.log("Données de contact préparées:", JSON.stringify(contactData));

    // ID direct de la liste "Lead simu café" (évite la recherche qui peut échouer)
    const listId = "31841b7a-8f8d-421f-99d7-3cd528fb3c6e";
    console.log("Utilisation directe de l'ID de liste:", listId);
    
    // Ajouter directement le contact à la liste avec l'API Sarbacane classique qui fonctionne
    return await addContactToList(listId, contactData, authHeader, true);
    
  } catch (error) {
    console.error("Erreur générale lors de l'ajout du contact à Sarbacane:", error);
    return { 
      success: false, 
      error: "Erreur lors de l'ajout du contact à Sarbacane",
      details: error instanceof Error ? error.message : String(error),
    };
  } finally {
    console.log("=== FIN addContactToSarbacane ===");
  }
}

/**
 * Ajoute un contact à une liste spécifique
 */
async function addContactToList(
  listId: string, 
  contactData: SarbacaneContact, 
  authHeader: string,
  useClassicApi: boolean = false
) {
  console.log("=== DÉBUT addContactToList ===");
  try {
    const endpoint = useClassicApi 
      ? `https://api.sarbacane.com/v1/lists/${listId}/contacts` 
      : `https://api.tipimail.com/v1/lists/${listId}/contacts`;
    
    console.log(`Ajout du contact à la liste ${listId} via ${useClassicApi ? 'API classique' : 'Tipimail'}`);
    console.log("URL d'endpoint:", endpoint);
    console.log("Données envoyées:", JSON.stringify(contactData));
    
    console.log("Envoi de la requête d'ajout du contact...");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
        "Accept": "application/json",
      },
      body: JSON.stringify(contactData)
    });

    // Log de la réponse complète pour le débogage
    console.log("Statut de la réponse:", response.status, response.statusText);
    console.log("Headers de réponse:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error("Réponse non OK lors de l'ajout du contact:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("Réponse d'erreur brute:", errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error("Réponse d'erreur parsée:", JSON.stringify(errorData));
      } catch (e) {
        console.error("Impossible de parser la réponse d'erreur comme JSON");
        errorData = { message: errorText };
      }
      
      // Si le contact existe déjà, ce n'est pas une erreur
      if (response.status === 409 || (errorData && errorData.message && errorData.message.includes("already exists"))) {
        console.log("Le contact existe déjà dans la liste");
        return { success: true, message: "Le contact existe déjà dans la liste" };
      }
      
      throw new Error(`Erreur Sarbacane: ${JSON.stringify(errorData)}`);
    }

    console.log("Parsage de la réponse JSON...");
    const result = await response.json();
    console.log("Contact ajouté avec succès à la liste Sarbacane:", result);
    
    return { 
      success: true, 
      message: "Contact ajouté avec succès à la liste Sarbacane",
      data: result 
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout du contact à la liste:", error);
    throw error;
  } finally {
    console.log("=== FIN addContactToList ===");
  }
} 