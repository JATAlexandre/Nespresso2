import { NextApiRequest, NextApiResponse } from 'next';
import { addContactToSarbacane } from '../../lib/sarbacane-contacts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    console.log('=== DÉBUT TEST API SARBACANE ===');
    console.log('Corps de la requête:', req.body);

    // Extraire les données
    const { email, phone } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'L\'email est requis' });
    }

    // Appeler la fonction d'ajout à Sarbacane
    console.log('Appel de la fonction addContactToSarbacane');
    const result = await addContactToSarbacane({
      email,
      phone
    });
    console.log('Résultat de l\'ajout:', result);

    // Retourner le résultat
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Erreur dans l\'API de test:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors du test d\'ajout à Sarbacane',
      details: error instanceof Error ? error.message : String(error)
    });
  } finally {
    console.log('=== FIN TEST API SARBACANE ===');
  }
} 