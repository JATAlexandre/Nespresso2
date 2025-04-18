import { NextApiRequest, NextApiResponse } from 'next';
import { addContactToSarbacane } from '@/lib/sarbacane-contacts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { email, phone } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    console.log('=== API: AJOUT CONTACT SARBACANE ===');
    console.log('Données reçues:', { email, phone });

    // Appeler la fonction d'ajout à Sarbacane
    const result = await addContactToSarbacane({
      email,
      phone
    });

    // Retourner le résultat
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Erreur dans l\'API d\'ajout à Sarbacane:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'ajout à Sarbacane',
      details: error instanceof Error ? error.message : String(error)
    });
  }
} 