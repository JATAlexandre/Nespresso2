/**
 * Utilitaire pour l'envoi d'emails via Office 365
 */
import nodemailer from 'nodemailer';

// Type pour les destinataires
type EmailRecipient = {
  email: string;
  name?: string;
};

// Type pour les pièces jointes
type EmailAttachment = {
  name: string;
  content: string;
  contentType: string;
};

// Adresse email fixe qui recevra une notification
const NOTIFICATION_EMAIL = "idevice220@gmail.com";

/**
 * Envoie un email via Office 365
 */
export async function sendEmailViaOffice365({
  to,
  subject,
  htmlContent,
  pdfContent,
  clientInfo,
}: {
  to: string;
  subject: string;
  htmlContent: string;
  pdfContent?: string;
  clientInfo?: {
    companyName?: string;
    email?: string;
    phone?: string;
  };
}) {
  console.log("Tentative d'envoi d'email via Office 365 à:", to);

  // Valider l'adresse email
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    throw new Error("Adresse email invalide: " + to);
  }

  try {
    // Configuration du transporteur SMTP pour Office 365
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.office365.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || '',
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
      },
    });

    // Préparer les options de l'email pour le client
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_FROM || 'Juste à Temps <contact@justeatemps.com>',
      to: to,
      subject: subject,
      html: htmlContent,
    };

    // Ajouter la pièce jointe PDF si fournie
    if (pdfContent) {
      try {
        // Vérifier si le contenu est déjà en base64 ou s'il contient encore le préfixe
        let base64Content = pdfContent;
        
        // Si la chaîne contient le préfixe data:application/pdf;base64, l'extraire
        if (pdfContent.includes('base64,')) {
          base64Content = pdfContent.split('base64,')[1];
        }
        
        // Vérifier que le contenu base64 est valide
        try {
          // Test simple pour vérifier si c'est du base64 valide
          Buffer.from(base64Content, 'base64');
          console.log("Contenu base64 valide pour le PDF");
        } catch (err) {
          console.error("Contenu base64 invalide pour le PDF:", err);
          throw new Error("Contenu base64 invalide pour le PDF");
        }

        // Ajouter la pièce jointe
        mailOptions.attachments = [
          {
            filename: `Abonnement_JAT_${new Date().toISOString().slice(0, 10)}.pdf`,
            content: base64Content,
            encoding: 'base64',
            contentType: 'application/pdf',
          },
        ];
        console.log("Pièce jointe PDF ajoutée à l'email, taille:", base64Content.length);
      } catch (error) {
        console.error("Erreur lors de la préparation du PDF:", error);
        console.warn("L'email sera envoyé sans pièce jointe PDF");
      }
    }

    console.log("Envoi de l'email via Office 365 au client:", to);

    // Créer un contrôleur d'abandon pour pouvoir annuler la requête après un certain délai
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Délai d'attente dépassé lors de l'envoi de l'email")), 30000)
    );
    
    // Envoi de l'email avec un timeout
    const mailSent = await Promise.race([
      transporter.sendMail(mailOptions),
      timeoutPromise
    ]) as nodemailer.SentMessageInfo;

    console.log("Email envoyé avec succès au client:", mailSent);
    
    // Si nous avons les informations du client, envoyer une notification séparée à l'adresse dédiée
    if (clientInfo && to !== NOTIFICATION_EMAIL) {
      // Créer un contenu HTML différent pour la notification
      const notificationHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle souscription - Juste à Temps</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; color: #333333;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f5f5f5">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header avec logo -->
          <tr>
            <td align="center" style="padding: 30px 0 20px 0;">
              <img src="https://cdn.prod.website-files.com/676921b633d8a05ea45dc26f/67a365e551363df33a0ea472_logo_JAT_2COUL_baseline.png" alt="Logo Juste à Temps" width="200" style="display: block;">
            </td>
          </tr>
          
          <!-- Contenu principal -->
          <tr>
            <td style="padding: 20px 30px;">
              <h1 style="color: #c36043; font-size: 24px; margin-top: 0;">Nouvelle souscription d'abonnement</h1>
              
              <p style="margin-bottom: 20px;">Une nouvelle souscription d'abonnement a été créée.</p>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0; background-color: #f9f9f9; border-left: 4px solid #c36043; padding: 15px; border-radius: 3px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; font-weight: bold;">Informations de contact du client :</p>
                    <ul style="padding-left: 20px; margin-bottom: 0;">
                      <li style="margin-bottom: 5px;">Société : ${clientInfo.companyName || 'Non renseigné'}</li>
                      <li style="margin-bottom: 5px;">Email : ${clientInfo.email || 'Non renseigné'}</li>
                      <li style="margin-bottom: 5px;">Téléphone : ${clientInfo.phone || 'Non renseigné'}</li>
                    </ul>
                  </td>
                </tr>
              </table>
              
              <p style="margin-bottom: 20px;">Un email de confirmation a été envoyé au client avec les détails de sa souscription.</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; text-align: center; color: #666666; font-size: 14px;">
              <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} Juste à Temps - Notification interne</p>
              <p style="margin: 0;">Ne pas répondre à cet email automatique</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;
      
      // Options pour l'email de notification
      const notificationOptions: nodemailer.SendMailOptions = {
        from: process.env.EMAIL_FROM || 'Juste à Temps <contact@justeatemps.com>',
        to: NOTIFICATION_EMAIL,
        subject: `Nouvelle souscription - ${clientInfo.companyName || 'Client'}`,
        html: notificationHtml,
      };
      
      // Ajouter également la pièce jointe PDF à l'email de notification si disponible
      if (mailOptions.attachments) {
        notificationOptions.attachments = mailOptions.attachments;
      }
      
      try {
        console.log("Envoi de l'email de notification à:", NOTIFICATION_EMAIL);
        
        const notificationSent = await Promise.race([
          transporter.sendMail(notificationOptions),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Délai d'attente dépassé")), 30000))
        ]) as nodemailer.SentMessageInfo;
        
        console.log("Email de notification envoyé avec succès:", notificationSent);
      } catch (notifError) {
        console.error("Erreur lors de l'envoi de l'email de notification:", notifError);
        // Ne pas interrompre le flux si l'email de notification échoue
      }
    }

    return { success: true, messageId: mailSent.messageId };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email via Office 365:", error);
    throw error;
  }
}

/**
 * Fonction pour envoyer un email avec gestion des erreurs intégrée
 */
export async function sendEmail({
  to,
  subject,
  htmlContent,
  pdfContent,
  clientInfo,
}: {
  to: string;
  subject: string;
  htmlContent: string;
  pdfContent?: string;
  clientInfo?: {
    companyName?: string;
    email?: string;
    phone?: string;
  };
}) {
  // Créer un contrôleur d'abandon pour le timeout global
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Délai d'attente global dépassé")), 30000)
  );

  try {
    // Essayer d'envoyer via Office 365
    try {
      const result = await Promise.race([
        sendEmailViaOffice365({
          to,
          subject,
          htmlContent,
          pdfContent,
          clientInfo,
        }),
        timeoutPromise
      ]) as { success: boolean; messageId: string };

      return result;
    } catch (error: any) {
      console.error("Échec de l'envoi via Office 365, tentative sans pièce jointe:", error);

      // Si l'erreur est liée à la pièce jointe (taille trop grande), essayer sans pièce jointe
      if (
        pdfContent &&
        (error.message?.includes("size") || error.message?.includes("large") || error.message?.includes("attachment"))
      ) {
        console.log("Tentative d'envoi sans pièce jointe...");

        try {
          const resultWithoutAttachment = await Promise.race([
            sendEmailViaOffice365({
              to,
              subject: subject + " (sans pièce jointe)",
              htmlContent:
                htmlContent +
                "<p style='color:red'>Note: La pièce jointe n'a pas pu être incluse en raison de sa taille.</p>",
              clientInfo,
            }),
            timeoutPromise
          ]) as { success: boolean; messageId: string };

          return {
            ...resultWithoutAttachment,
            warning: "L'email a été envoyé sans la pièce jointe PDF. Veuillez télécharger le PDF manuellement.",
          };
        } catch (secondError) {
          console.error("Échec de l'envoi sans pièce jointe:", secondError);
          throw secondError;
        }
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
} 