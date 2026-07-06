import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for uploaded documents/images
app.use(express.json({ limit: '20mb' }));

// Lazy init of GoogleGenAI
let ai: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Mock Magic Link Authentication Endpoint
app.post('/api/auth/magic-link', (req, res) => {
  const { email, registrationInfo } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'L\'adresse email est requise' });
  }

  // Generate a mock token and link
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const isRegistered = email.includes('test') || email.includes('abokine') || email.includes('gmail') || !!registrationInfo;
  
  // In a real app we would send an email. For this demo, we output the URL
  const magicLink = `/api/auth/callback?token=${token}&email=${encodeURIComponent(email)}`;
  
  res.json({
    success: true,
    message: 'Magic link généré avec succès !',
    magicLink: magicLink,
    email: email,
    isRegistered: isRegistered,
    token: token
  });
});

// API endpoint to parse uploaded devis using Gemini 3.5 Flash
app.post('/api/analyse-devis', async (req, res) => {
  const { fileBase64, mimeType, fileName } = req.body;

  if (!fileBase64) {
    return res.status(400).json({ error: 'Le fichier encodé en base64 est requis.' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const client = getGenAI();

  if (!client || !geminiKey) {
    console.warn("GEMINI_API_KEY n'est pas configurée. Utilisation du fallback statique de simulation.");
    // Return mock parsed data for demo purposes when Gemini key is missing
    return res.json({
      success: true,
      mode: 'mock_fallback',
      data: {
        beneficiaireNom: 'Martin',
        beneficiairePrenom: 'Jean-Pierre',
        beneficiaireRaisonSociale: '',
        beneficiaireSiret: '',
        beneficiaireAdresse: '14 Rue de la République',
        beneficiaireCodePostal: '69002',
        beneficiaireVille: 'Lyon',
        devisReference: 'DEV-' + Math.floor(100000 + Math.random() * 900000),
        devisDate: new Date().toISOString().split('T')[0],
        travauxReferenceFiche: 'BAR-TH-104', // Air/water heat pump
        travauxSurface: 0,
        travauxMarque: 'Atlantic',
        travauxReferenceProduit: 'Alféa Extensa A.I.',
        concerneRénovation: true
      }
    });
  }

  try {
    const filePart = {
      inlineData: {
        data: fileBase64,
        mimeType: mimeType || 'application/pdf'
      }
    };

    const textPart = {
      text: `Analyse ce devis de travaux de rénovation énergétique (CEE) en France et extrais les informations requises dans le schéma JSON de réponse.
      Si des informations manquent dans le document, laisse les champs correspondants vides ou avec des valeurs logiques par défaut.
      Fais particulièrement attention à identifier :
      1. Le nom, prénom et l'adresse du bénéficiaire (client).
      2. Le numéro ou référence du devis ainsi que sa date de création.
      3. Le type de travaux (ex: Isolation combles, Pompe à chaleur, chaudière) et essaie d'en déduire le code de fiche CEE standard (ex: BAR-EN-101 pour isolation combles, BAR-TH-104 pour pompe à chaleur air/eau, BAR-EN-102 pour isolation murs).
      4. S'il y a une marque ou une référence produit spécifique mentionnée (ex: Daikin, Atlantic, Bosch).`
    };

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [filePart, textPart],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            beneficiaireNom: { type: Type.STRING, description: 'Nom de famille du bénéficiaire' },
            beneficiairePrenom: { type: Type.STRING, description: 'Prénom du bénéficiaire' },
            beneficiaireRaisonSociale: { type: Type.STRING, description: 'Raison sociale si c\'est une entreprise' },
            beneficiaireSiret: { type: Type.STRING, description: 'SIRET si c\'est une entreprise' },
            beneficiaireAdresse: { type: Type.STRING, description: 'Adresse postale complète de facturation/travaux' },
            beneficiaireCodePostal: { type: Type.STRING, description: 'Code postal de l\'adresse' },
            beneficiaireVille: { type: Type.STRING, description: 'Ville de l\'adresse' },
            devisReference: { type: Type.STRING, description: 'Référence ou numéro de devis' },
            devisDate: { type: Type.STRING, description: 'Date d\'édition du devis au format AAAA-MM-JJ' },
            travauxReferenceFiche: { 
              type: Type.STRING, 
              description: 'Code de fiche CEE le plus probable parmi : BAR-EN-101, BAR-EN-102, BAR-TH-104, BAR-TH-113' 
            },
            travauxSurface: { type: Type.NUMBER, description: 'Surface isolée ou concernée s\'il y a lieu en m²' },
            travauxMarque: { type: Type.STRING, description: 'Marque de l\'appareil ou isolant (ex: Atlantic, Bosch, Daikin)' },
            travauxReferenceProduit: { type: Type.STRING, description: 'Référence exacte du modèle ou produit' },
            concerneRénovation: { type: Type.BOOLEAN, description: 'Vrai si les travaux concernent une rénovation de bâtiment' }
          },
          required: ['devisReference', 'travauxReferenceFiche']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      mode: 'gemini_extracted',
      data: parsedData
    });
  } catch (err: any) {
    console.error('Erreur d\'extraction Gemini:', err);
    res.status(500).json({ 
      error: 'Erreur lors de l\'analyse du devis via Gemini.', 
      details: err.message,
      // Provide mock fallback even on error so the app never blocks the user
      fallbackData: {
        beneficiaireNom: 'Martin',
        beneficiairePrenom: 'Jean-Pierre',
        beneficiaireAdresse: '14 Rue de la République',
        beneficiaireCodePostal: '69002',
        beneficiaireVille: 'Lyon',
        devisReference: 'DEV-ERR-883',
        devisDate: new Date().toISOString().split('T')[0],
        travauxReferenceFiche: 'BAR-TH-104',
        travauxMarque: 'Atlantic',
        travauxReferenceProduit: 'Alféa Extensa A.I.',
        concerneRénovation: true
      }
    });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OdiCEE Server] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
