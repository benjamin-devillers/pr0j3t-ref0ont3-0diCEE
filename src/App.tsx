import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Simulator from './components/Simulator';
import FolderWizard from './components/FolderWizard';
import DossierDetail from './components/DossierDetail';
import CompanyProfile from './components/CompanyProfile';
import Documentation from './components/Documentation';
import { OuateElseLogo } from './components/OuateElseLogo';
import { Dossier, ChantierItem } from './types';
import { 
  Home, 
  FilePlus, 
  ListTodo, 
  LifeBuoy, 
  Smile, 
  CreditCard, 
  Building, 
  Calculator, 
  BookOpen, 
  Phone, 
  Mail, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Camera
} from 'lucide-react';

// Prepopulated sample folders matching real types
const INITIAL_DOSSIERS: Dossier[] = [
  {
    id: 'd-1',
    reference: 'CEE-2026-440281',
    status: 'Incomplet',
    dateCreation: '2026-06-28',
    beneficiaire: {
      type: 'personne_morale',
      civility: 'M.',
      nom: 'Martin',
      prenom: 'Guillaume',
      raisonSociale: 'Leroy Merlin SAS',
      siret: '12345678901234',
      typePersonneMorale: 'entreprise',
      adresse: '1 Rue de la Garenne',
      codePostal: '59000',
      ville: 'Lille',
      email: 'contact@leroymerlin.fr',
      telephone: '03 20 11 22 33',
      situationFiscaleConnue: false
    },
    contact: {
      type: 'beneficiaire',
      nom: 'Martin',
      prenom: 'Guillaume',
      email: 'contact@leroymerlin.fr',
      telephone: '03 20 11 22 33'
    },
    objet: { type: 'renovation_batiment' },
    batiment: {
      type: 'batiment_tertiaire',
      nomBatiment: 'Entrepôt Logistique Lille-Sud',
      memeAdresseBeneficiaire: true
    },
    travaux: {
      referenceDevis: 'QT-LM-2026-89',
      dateDevis: '2026-06-15',
      dateRealisationPrevue: '10/2026',
      chantiers: [
        {
          id: 'c-1_1',
          ficheCode: 'BAR-EN-101',
          ficheTitle: 'Isolation de combles ou de toitures',
          properties: { surface: 120, resistance: 7.5 },
          volumeCumac: 1440,
          prime: 8640,
          intervenantType: 'societe',
          marque: 'ISOVER',
          referenceProduit: 'GR32'
        }
      ]
    },
    repartitionMode: 'global',
    repartitionGlobalPct: 80,
    primeTotale: 8640,
    partProfessionnelle: 1728,
    partBeneficiaire: 6912,
    typeDossier: 'declaration',
    documentsCharges: {
      devisSigne: false,
      cadreContribution: true,
      facture: false,
      attestationHonneurSignee: false
    }
  },
  {
    id: 'd-2',
    reference: 'CEE-2026-901824',
    status: 'Complet',
    dateCreation: '2026-05-12',
    beneficiaire: {
      type: 'personne_physique',
      civility: 'M.',
      nom: 'Petit',
      prenom: 'Jean-Pierre',
      adresse: '14 Avenue Foch',
      codePostal: '75016',
      ville: 'Paris',
      email: 'jp.petit@orange.fr',
      telephone: '06 12 34 56 78',
      situationFiscaleConnue: true,
      nombrePersonnesFoyer: 2,
      trancheRevenus: 'modeste',
      nombreAvisImposition: 1
    },
    contact: {
      type: 'beneficiaire',
      nom: 'Petit',
      prenom: 'Jean-Pierre',
      email: 'jp.petit@orange.fr',
      telephone: '06 12 34 56 78'
    },
    objet: { type: 'renovation_batiment' },
    batiment: {
      type: 'maison',
      memeAdresseBeneficiaire: true
    },
    travaux: {
      referenceDevis: 'QT-2026-340',
      dateDevis: '2026-05-01',
      dateRealisationPrevue: '06/2026',
      chantiers: [
        {
          id: 'c-2_1',
          ficheCode: 'BAR-EN-102',
          ficheTitle: 'Isolation de murs',
          properties: { surface: 95, resistance: 4.2 },
          volumeCumac: 1995,
          prime: 11970,
          intervenantType: 'societe',
          marque: 'URSA',
          referenceProduit: 'PureOne'
        }
      ]
    },
    repartitionMode: 'global',
    repartitionGlobalPct: 90,
    primeTotale: 11970,
    partProfessionnelle: 1197,
    partBeneficiaire: 10773,
    typeDossier: 'declaration',
    documentsCharges: {
      devisSigne: true,
      cadreContribution: true,
      facture: true,
      attestationHonneurSignee: true
    }
  },
  {
    id: 'd-3',
    reference: 'CEE-2026-118493',
    status: 'Déclaré',
    dateCreation: '2026-07-01',
    beneficiaire: {
      type: 'personne_physique',
      civility: 'Mme',
      nom: 'Dubois',
      prenom: 'Claire',
      adresse: '42 Rue des Lilas',
      codePostal: '69003',
      ville: 'Lyon',
      email: 'claire.dubois@gmail.com',
      telephone: '07 88 99 00 11',
      situationFiscaleConnue: true,
      nombrePersonnesFoyer: 1,
      trancheRevenus: 'tres_modeste',
      nombreAvisImposition: 1
    },
    contact: {
      type: 'beneficiaire',
      nom: 'Dubois',
      prenom: 'Claire',
      email: 'claire.dubois@gmail.com',
      telephone: '07 88 99 00 11'
    },
    objet: { type: 'renovation_batiment' },
    batiment: {
      type: 'appartement',
      memeAdresseBeneficiaire: true
    },
    travaux: {
      referenceDevis: 'QT-EL-2026-05',
      dateDevis: '2026-06-25',
      dateRealisationPrevue: '08/2026',
      chantiers: [
        {
          id: 'c-3_1',
          ficheCode: 'BAR-TH-113',
          ficheTitle: 'Chaudière biomasse individuelle',
          properties: { surface: 110, puissance: 15 },
          volumeCumac: 2750,
          prime: 16500,
          intervenantType: 'societe',
          marque: 'ATLANTIC',
          referenceProduit: 'Alfea Extensa'
        }
      ]
    },
    repartitionMode: 'global',
    repartitionGlobalPct: 85,
    primeTotale: 16500,
    partProfessionnelle: 2475,
    partBeneficiaire: 14025,
    typeDossier: 'declaration',
    documentsCharges: {
      devisSigne: false,
      cadreContribution: true,
      facture: false,
      attestationHonneurSignee: false
    }
  }
];

const LEGAL_CONTENT: Record<string, { title: string; body: string }> = {
  cgu: {
    title: "Conditions Générales d'Utilisation",
    body: "Les présentes conditions générales d'utilisation régissent l'accès et l'utilisation de la plateforme OdiCEE par Adeena. En accédant à ce service, vous acceptez sans réserve les termes décrits ci-après..."
  },
  confidentialite: {
    title: "Politique de confidentialité",
    body: "Adeena s'engage à protéger la confidentialité des données personnelles collectées dans le cadre de l'utilisation d'OdiCEE, conformément au Règlement Général sur la Protection des Données (RGPD)..."
  },
  mentions: {
    title: "Mentions légales",
    body: "OdiCEE est édité par Adeena, société soumise au droit français. Directeur de la publication : [Nom]. Hébergement : [Hébergeur]. Pour toute question, contactez-nous à l'adresse suivante..."
  }
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userCompany, setUserCompany] = useState<any>(null);
  
  // Navigation views: 'login' | 'dashboard' | 'simulator' | 'wizard' | 'detail' | 'company' | 'documentation'
  const [currentView, setCurrentView] = useState<'login' | 'dashboard' | 'simulator' | 'wizard' | 'detail' | 'company' | 'documentation'>('login');
  
  // Folders/Dossiers state list
  const [dossiers, setDossiers] = useState<Dossier[]>(INITIAL_DOSSIERS);
  const [activeDossierId, setActiveDossierId] = useState<string | null>(null);
  
  // Transit chantiers state when converting simulator run into folder creation
  const [transitChantiers, setTransitChantiers] = useState<ChantierItem[]>([]);

  // Key to reset the wizard when creating a new folder
  const [wizardKey, setWizardKey] = useState(0);

  // Gestion de l'affichage des pages légales dans le footer
  const [activeLegalPage, setActiveLegalPage] = useState<'cgu' | 'confidentialite' | 'mentions' | null>(null);

  // Sidebar, Mobile, and Account Manager states
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleGenerateReport = async () => {
    // Mathematical color converters
    const oklabToRgb = (L: number, a: number, b: number): [number, number, number] => {
      const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
      const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
      const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

      const l = l_ * l_ * l_;
      const m = m_ * m_ * m_;
      const s = s_ * s_ * s_;

      const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
      const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      const blue = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

      const gamma = (c: number) => {
        const abs = Math.abs(c);
        const res = abs <= 0.0031308 ? 12.92 * abs : 1.055 * Math.pow(abs, 1 / 2.4) - 0.055;
        return c < 0 ? -res : res;
      };

      const R = Math.min(255, Math.max(0, Math.round(gamma(r) * 255)));
      const G = Math.min(255, Math.max(0, Math.round(gamma(g) * 255)));
      const B = Math.min(255, Math.max(0, Math.round(gamma(blue) * 255)));

      return [R, G, B];
    };

    const oklchToRgb = (L: number, C: number, H: number): [number, number, number] => {
      const hueRad = (H * Math.PI) / 180;
      const a = C * Math.cos(hueRad);
      const b = C * Math.sin(hueRad);
      return oklabToRgb(L, a, b);
    };

    const parsePart = (val: string, maxVal = 1): number => {
      if (!val) return 0;
      let parsed = parseFloat(val);
      if (val.endsWith('%')) {
        parsed = (parseFloat(val) / 100) * maxVal;
      } else if (val.endsWith('deg')) {
        parsed = parseFloat(val);
      } else if (val.endsWith('rad')) {
        parsed = parseFloat(val) * (180 / Math.PI);
      } else if (val.endsWith('turn')) {
        parsed = parseFloat(val) * 360;
      }
      return isNaN(parsed) ? 0 : parsed;
    };

    const parseAndReplaceColors = (text: string): string => {
      if (!text) return '';
      
      // Replace oklch
      let result = text.replace(/oklch\(([^)]+)\)/gi, (match, content) => {
        try {
          const parts = content.trim().split(/[\s,/]+/).filter(Boolean);
          if (parts.length < 3) return match;
          
          const L = parsePart(parts[0], 1);
          const C = parsePart(parts[1], 1);
          const H = parsePart(parts[2], 360);
          const A = parts[3] ? parsePart(parts[3], 1) : 1;
          
          const [r, g, b] = oklchToRgb(L, C, H);
          return `rgba(${r}, ${g}, ${b}, ${A})`;
        } catch (e) {
          return 'rgba(128, 128, 128, 1)';
        }
      });

      // Replace oklab
      result = result.replace(/oklab\(([^)]+)\)/gi, (match, content) => {
        try {
          const parts = content.trim().split(/[\s,/]+/).filter(Boolean);
          if (parts.length < 3) return match;
          
          const L = parsePart(parts[0], 1);
          const a = parsePart(parts[1], 1);
          const b = parsePart(parts[2], 1);
          const A = parts[3] ? parsePart(parts[3], 1) : 1;
          
          const [r, g, bRes] = oklabToRgb(L, a, b);
          return `rgba(${r}, ${g}, ${bRes}, ${A})`;
        } catch (e) {
          return 'rgba(128, 128, 128, 1)';
        }
      });

      return result;
    };

    // Arrays to store originals for restoration
    const stylesToRestore: { element: HTMLStyleElement; originalText: string }[] = [];
    const inlineStylesToRestore: { element: HTMLElement; originalStyle: string }[] = [];

    try {
      triggerToast("Génération du rapport d'assistance en cours...");

      // 1. Process all <style> tags to replace oklch/oklab values with RGBA before capturing
      const styleElements = Array.from(document.querySelectorAll('style'));
      for (const styleEl of styleElements) {
        const text = styleEl.textContent || '';
        if (text.toLowerCase().includes('oklch') || text.toLowerCase().includes('oklab')) {
          stylesToRestore.push({ element: styleEl, originalText: text });
          styleEl.textContent = parseAndReplaceColors(text);
        }
      }

      // 2. Process all elements with inline style attributes
      const styledElements = Array.from(document.querySelectorAll('[style]')) as HTMLElement[];
      for (const el of styledElements) {
        const styleAttr = el.getAttribute('style') || '';
        if (styleAttr.toLowerCase().includes('oklch') || styleAttr.toLowerCase().includes('oklab')) {
          inlineStylesToRestore.push({ element: el, originalStyle: styleAttr });
          el.setAttribute('style', parseAndReplaceColors(styleAttr));
        }
      }

      // 3. Capture the live screen using html2canvas with transformed styles
      const screenshotCanvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 1.5, // Crisp resolution balance
        backgroundColor: '#F1F3F5',
        logging: false
      });

      // 4. Gather diagnostics parameters
      const reportUrl = window.location.href;
      const reportUA = navigator.userAgent;
      const reportPlatform = (navigator as any).userAgentData?.platform || navigator.platform || "Inconnu";
      const reportScreenSize = `${window.screen.width}x${window.screen.height} (DPR: ${window.devicePixelRatio || 1})`;
      const reportViewport = `${window.innerWidth}x${window.innerHeight}`;
      const reportDate = new Date().toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'medium' });
      const activeViewLabel = 
        currentView === 'dashboard' ? 'Tableau de bord' :
        currentView === 'wizard' ? 'Nouveau dossier CEE (Wizard)' :
        currentView === 'simulator' ? 'Simulateur de primes' :
        currentView === 'company' ? 'Ma société' :
        currentView === 'documentation' ? 'Boîtes à outils' :
        currentView === 'detail' ? 'Détail de dossier' : 'Accueil';
      const companyName = userCompany?.raisonSociale || 'Ouate Else';

      // 3. Create a final taller canvas to append the diagnostics info
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = screenshotCanvas.width;
      
      const extraHeight = Math.round(320 * (screenshotCanvas.width / 1200)); // proportional extra height
      finalCanvas.height = screenshotCanvas.height + extraHeight;

      const ctx = finalCanvas.getContext('2d');
      if (ctx) {
        // Draw the real screenshot first
        ctx.drawImage(screenshotCanvas, 0, 0);

        // Draw the diagnostic panel background in the appended space
        const startY = screenshotCanvas.height;
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(0, startY, finalCanvas.width, extraHeight);

        // Scale factor for drawing text proportionally
        const scale = finalCanvas.width / 1200;

        // Draw separator
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(0, startY);
        ctx.lineTo(finalCanvas.width, startY);
        ctx.stroke();

        // Draw header of technical report
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(20 * scale, startY + 20 * scale, finalCanvas.width - 40 * scale, 50 * scale);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(15 * scale)}px sans-serif`;
        ctx.fillText("RAPPORT D'ASSISTANCE TECHNIQUE - DIAGNOSTIC SYSTEME (SCREENSHOT REEL)", 40 * scale, startY + 50 * scale);

        ctx.fillStyle = '#38BDF8';
        ctx.font = `bold ${Math.round(11 * scale)}px monospace`;
        ctx.fillText("VERSION 27.01", finalCanvas.width - 150 * scale, startY + 50 * scale);

        // Main content block for diagnostics parameters
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(20 * scale, startY + 70 * scale, finalCanvas.width - 40 * scale, 230 * scale);
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1 * scale;
        ctx.strokeRect(20 * scale, startY + 70 * scale, finalCanvas.width - 40 * scale, 230 * scale);

        // Grid of parameters
        ctx.fillStyle = '#475569';
        ctx.font = `bold ${Math.round(12 * scale)}px sans-serif`;

        // Column 1
        ctx.fillText("Date de génération :", 50 * scale, startY + 110 * scale);
        ctx.fillStyle = '#0F172A';
        ctx.font = `bold ${Math.round(12 * scale)}px monospace`;
        ctx.fillText(reportDate, 220 * scale, startY + 110 * scale);

        ctx.fillStyle = '#475569';
        ctx.font = `bold ${Math.round(12 * scale)}px sans-serif`;
        ctx.fillText("URL Active :", 50 * scale, startY + 145 * scale);
        ctx.fillStyle = '#0F172A';
        ctx.font = `bold ${Math.round(12 * scale)}px monospace`;
        ctx.fillText(reportUrl.substring(0, 80), 220 * scale, startY + 145 * scale);

        ctx.fillStyle = '#475569';
        ctx.font = `bold ${Math.round(12 * scale)}px sans-serif`;
        ctx.fillText("Entreprise :", 50 * scale, startY + 180 * scale);
        ctx.fillStyle = '#0F172A';
        ctx.font = `bold ${Math.round(12 * scale)}px monospace`;
        ctx.fillText(companyName, 220 * scale, startY + 180 * scale);

        ctx.fillStyle = '#475569';
        ctx.font = `bold ${Math.round(12 * scale)}px sans-serif`;
        ctx.fillText("Vue active :", 50 * scale, startY + 215 * scale);
        ctx.fillStyle = '#0F172A';
        ctx.font = `bold ${Math.round(12 * scale)}px monospace`;
        ctx.fillText(activeViewLabel, 220 * scale, startY + 215 * scale);

        // Column 2
        ctx.fillStyle = '#475569';
        ctx.font = `bold ${Math.round(12 * scale)}px sans-serif`;
        ctx.fillText("Navigateur :", 620 * scale, startY + 110 * scale);
        ctx.fillStyle = '#0F172A';
        ctx.font = `bold ${Math.round(11 * scale)}px monospace`;
        const uaPart1 = reportUA.substring(0, 50);
        const uaPart2 = reportUA.substring(50, 100);
        ctx.fillText(uaPart1, 790 * scale, startY + 110 * scale);
        if (uaPart2) ctx.fillText(uaPart2, 790 * scale, startY + 125 * scale);

        ctx.fillStyle = '#475569';
        ctx.font = `bold ${Math.round(12 * scale)}px sans-serif`;
        ctx.fillText("Système / Périphérique :", 620 * scale, startY + 150 * scale);
        ctx.fillStyle = '#0F172A';
        ctx.font = `bold ${Math.round(12 * scale)}px monospace`;
        ctx.fillText(reportPlatform, 790 * scale, startY + 150 * scale);

        ctx.fillStyle = '#475569';
        ctx.font = `bold ${Math.round(12 * scale)}px sans-serif`;
        ctx.fillText("Résolution physique :", 620 * scale, startY + 185 * scale);
        ctx.fillStyle = '#0F172A';
        ctx.font = `bold ${Math.round(12 * scale)}px monospace`;
        ctx.fillText(reportScreenSize, 790 * scale, startY + 185 * scale);

        ctx.fillStyle = '#475569';
        ctx.font = `bold ${Math.round(12 * scale)}px sans-serif`;
        ctx.fillText("Dimensions Viewport :", 620 * scale, startY + 220 * scale);
        ctx.fillStyle = '#0F172A';
        ctx.font = `bold ${Math.round(12 * scale)}px monospace`;
        ctx.fillText(reportViewport, 790 * scale, startY + 220 * scale);

        // Warning instruction footer block
        ctx.fillStyle = '#EFF6FF';
        ctx.fillRect(40 * scale, startY + 250 * scale, finalCanvas.width - 80 * scale, 34 * scale);
        ctx.strokeStyle = '#BFDBFE';
        ctx.strokeRect(40 * scale, startY + 250 * scale, finalCanvas.width - 80 * scale, 34 * scale);

        ctx.fillStyle = '#1E40AF';
        ctx.font = `bold ${Math.round(11 * scale)}px sans-serif`;
        ctx.fillText("📩 ACTION : Veuillez transmettre ce rapport JPG de diagnostic à votre chargé de clientèle.", 60 * scale, startY + 271 * scale);
      }

      // Convert the final combined canvas to jpeg
      const reportDataUrl = finalCanvas.toDataURL('image/jpeg', 0.95);

      // Download trigger
      const link = document.createElement("a");
      link.setAttribute("href", reportDataUrl);
      link.setAttribute("download", `Rapport_Assistance_OdiCEE_${Date.now()}.jpg`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      triggerToast("Rapport d'assistance généré avec succès !");
    } catch (err) {
      console.error(err);
      triggerToast("Erreur lors de la capture d'écran");
    } finally {
      // Restore all styled elements and <style> tags to their exact original text
      for (const item of stylesToRestore) {
        try {
          item.element.textContent = item.originalText;
        } catch (e) {
          // ignore
        }
      }
      for (const item of inlineStylesToRestore) {
        try {
          item.element.setAttribute('style', item.originalStyle);
        } catch (e) {
          // ignore
        }
      }
    }
  };

  const handleLoginSuccess = (email: string, companyInfo?: any) => {
    const fullCompanyInfo = {
      raisonSociale: companyInfo?.raisonSociale || 'Ouate Else',
      siret: companyInfo?.siret || '49201930100023',
      adresse: companyInfo?.adresse || "15 Boulevard de l'Innovation",
      codePostal: companyInfo?.codePostal || '75008',
      ville: companyInfo?.ville || 'Paris',
      representantLegal: companyInfo?.representantLegal || 'Jean Rénovateur',
      fonctionRepresentant: companyInfo?.fonctionRepresentant || 'Gérant',
      formeJuridique: companyInfo?.formeJuridique || 'SAS',
      urssafIssueDate: companyInfo?.urssafIssueDate || '2026-05-15',
      urssafFileName: companyInfo?.urssafFileName || 'attestation_vigilance_urssaf_2026.pdf',
      contactNom: companyInfo?.contactNom || 'Jean Rénovateur',
      contactEmail: email,
      telephone: companyInfo?.telephone || '06 12 34 56 78',
      signatureElectroniqueActive: true
    };
    setUserCompany(fullCompanyInfo);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserCompany(null);
    setCurrentView('login');
  };

  const handleNavigateToSimulator = () => {
    setTransitChantiers([]);
    setCurrentView('simulator');
  };

  const handleNavigateToWizard = (loadedChantiers?: any) => {
    setTransitChantiers(loadedChantiers || []);
    setCurrentView('wizard');
  };

  const handleNavigateToDossierDetail = (dossierId: string) => {
    setActiveDossierId(dossierId);
    setCurrentView('detail');
  };

  // Duplicate helper (F-19)
  const handleDuplicateDossier = (dossierId: string) => {
    const toDup = dossiers.find(d => d.id === dossierId);
    if (!toDup) return;

    const duplicated: Dossier = {
      ...toDup,
      id: 'dos-dup-' + Math.random().toString(36).substring(2, 9),
      reference: 'CEE-2026-' + Math.floor(100000 + Math.random() * 900000),
      dateCreation: new Date().toISOString().split('T')[0],
      status: 'À engager'
    };

    setDossiers(prev => [duplicated, ...prev]);
    alert(`Dossier dupliqué avec succès sous la référence ${duplicated.reference}`);
  };

  // Delete helper (F-21)
  const handleDeleteDossier = (dossierId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement ce dossier ?")) {
      setDossiers(prev => prev.filter(d => d.id !== dossierId));
    }
  };

  // Save draft output from simulation (US-06)
  const handleSaveDraftFromSimulator = (clientNom: string, clientPrenom: string, chantiers: ChantierItem[]) => {
    const totalVolume = chantiers.reduce((acc, c) => acc + c.volumeCumac, 0);
    const totalPrime = totalVolume * 6;

    const newDraft: Dossier = {
      id: 'dos-draft-' + Math.random().toString(36).substring(2, 9),
      reference: 'CEE-2026-' + Math.floor(100000 + Math.random() * 900000),
      status: 'À engager',
      dateCreation: new Date().toISOString().split('T')[0],
      beneficiaire: {
        type: 'personne_physique',
        civility: 'M.',
        nom: clientNom || 'Nom Client',
        prenom: clientPrenom || 'Prénom',
        adresse: 'Adresse à renseigner',
        codePostal: '75000',
        ville: 'Paris',
        email: 'client@example.com',
        telephone: '0600000000'
      },
      contact: {
        type: 'beneficiaire',
        nom: clientNom || 'Nom Client',
        prenom: clientPrenom || 'Prénom',
        email: 'client@example.com',
        telephone: '0600000000'
      },
      objet: { type: 'renovation_batiment' },
      travaux: {
        referenceDevis: 'PROJET_SIMULE',
        dateDevis: new Date().toISOString().split('T')[0],
        dateRealisationPrevue: 'N/A',
        chantiers
      },
      repartitionMode: 'global',
      repartitionGlobalPct: 80,
      primeTotale: totalPrime,
      partProfessionnelle: totalPrime * 0.2,
      partBeneficiaire: totalPrime * 0.8
    };

    setDossiers(prev => [newDraft, ...prev]);
    setCurrentView('dashboard');
  };

  // Convert simulation chantiers directly into folder wizard creation (US-07)
  const handleTransformSimulatorToDossier = (chantiers: ChantierItem[]) => {
    setTransitChantiers(chantiers);
    setCurrentView('wizard');
  };

  // Add folder created via FolderWizard
  const handleWizardComplete = (newDossier: Dossier, nextAction?: 'dashboard' | 'new_folder' | 'upload_devis') => {
    setDossiers(prev => {
      if (prev.some(d => d.id === newDossier.id)) {
        return prev;
      }
      return [newDossier, ...prev];
    });
    setTransitChantiers([]);
    if (nextAction === 'new_folder' || nextAction === 'upload_devis') {
      setWizardKey(prev => prev + 1);
      setCurrentView('wizard');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleUpdateDossierInList = (updated: Dossier) => {
    setDossiers(prev => prev.map(d => d.id === updated.id ? updated : d));
  };

  const activeDossier = dossiers.find(d => d.id === activeDossierId);

  const activeItem = currentView === 'dashboard' || currentView === 'detail' 
    ? 'Accueil' 
    : currentView === 'wizard' 
    ? 'Déclarer' 
    : currentView === 'simulator' 
    ? 'Simuler une prime' 
    : currentView === 'company'
    ? 'Ma société'
    : currentView === 'documentation'
    ? 'Documentation'
    : '';

  const getUserFullName = () => {
    if (!userCompany) return { firstName: '', lastName: '' };
    if (userCompany.contactNom) {
      const parts = userCompany.contactNom.trim().split(/\s+/);
      if (parts.length >= 2) {
        return {
          firstName: parts[0],
          lastName: parts.slice(1).join(' ')
        };
      }
      return {
        firstName: parts[0] || 'Utilisateur',
        lastName: ''
      };
    }
    return {
      firstName: 'Jean',
      lastName: 'Rénovateur'
    };
  };

  const getUserRole = () => {
    return 'Admninistrateur';
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Tableau de bord';
      case 'simulator':
        return 'Simulateur de prime CEE';
      case 'wizard':
        return 'Nouveau dossier CEE';
      case 'detail':
        return 'Détail du dossier';
      case 'company':
        return 'Ma société';
      case 'documentation':
        return 'Boîtes à outils';
      default:
        return 'Accueil';
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F5] font-sans text-[#1A1C1E] antialiased flex flex-col justify-between">
      {/* Container wrapper that supports sidebar and right content side-by-side when authenticated */}
      <div className={isAuthenticated && userCompany ? "flex flex-row min-h-screen w-full relative" : "w-full"}>
        
        {/* Sidebar */}
        {isAuthenticated && userCompany && (
          <aside className={`bg-primary border-r border-black/10 flex flex-col justify-between shrink-0 transition-all duration-300 md:translate-x-0 h-screen sticky top-0 z-50 ${isSidebarCollapsed ? 'w-20' : 'w-64'} ${isMobileSidebarOpen ? 'translate-x-0 fixed inset-y-0 left-0 shadow-xl' : 'hidden md:flex'}`}>
            <div className="flex flex-col h-full justify-between w-full">
              
              {/* Top Section with Company Logo */}
              <div className="p-4 space-y-5 overflow-y-auto">
                
                {/* Company Logo & Controls */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm p-1">
                      <OuateElseLogo />
                    </div>
                    {!isSidebarCollapsed && (
                      <div className="leading-tight min-w-0">
                        <span className="text-xs font-black text-white block truncate" title={userCompany.raisonSociale || userCompany.name}>
                          {userCompany.raisonSociale || userCompany.name || 'Ma Société'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase block truncate">
                          le 05/07/2026
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {!isSidebarCollapsed ? (
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button 
                        onClick={() => setIsSidebarCollapsed(true)} 
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer hidden md:block"
                        title="Réduire le menu"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer md:hidden">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsSidebarCollapsed(false)} 
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer hidden md:block animate-pulse ml-1"
                      title="Agrandir le menu"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Navigation Group */}
                <div className="space-y-2">
                  {isSidebarCollapsed && (
                    <div className="border-t border-white/10 my-2" />
                  )}
                  <div className="space-y-1">
                    {[
                      { name: 'Accueil', icon: Home, action: () => { setCurrentView('dashboard'); setIsMobileSidebarOpen(false); } },
                      { name: 'Déclarer', icon: FilePlus, action: () => { handleNavigateToWizard(); setIsMobileSidebarOpen(false); } },
                      { name: 'Mes actions', icon: ListTodo, action: () => triggerToast("Mes actions : Bientôt disponible !") },
                      { name: 'Mes SAV', icon: LifeBuoy, action: () => triggerToast("Mes SAV : Bientôt disponible !") },
                      { name: 'Satisfaction', icon: Smile, action: () => triggerToast("Satisfaction : Bientôt disponible !") },
                      { name: 'Facturation', icon: CreditCard, action: () => triggerToast("Facturation : Bientôt disponible !") }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = activeItem === item.name;
                      return (
                        <button
                          key={item.name}
                          onClick={item.action}
                          className={`w-full flex items-center gap-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 text-left'
                          } ${
                            isActive
                              ? 'bg-secondary text-primary font-black shadow-md'
                              : 'text-slate-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                          {!isSidebarCollapsed && <span>{item.name}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Boite à outils Group */}
                <div className="space-y-2">
                  {isSidebarCollapsed ? (
                    <div className="border-t border-white/10 my-2" />
                  ) : (
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Boîte à outils</h3>
                  )}
                  <div className="space-y-1">
                    {[
                      { name: 'Ma société', icon: Building, action: () => { setCurrentView('company'); setIsMobileSidebarOpen(false); } },
                      { name: 'Simuler une prime', icon: Calculator, action: () => { handleNavigateToSimulator(); setIsMobileSidebarOpen(false); } },
                      { name: 'Documentation', icon: BookOpen, action: () => { setCurrentView('documentation'); setIsMobileSidebarOpen(false); } }
                    ].map((item) => {
                      const Icon = item.icon;
                      const isActive = activeItem === item.name;
                      return (
                        <button
                          key={item.name}
                          onClick={item.action}
                          className={`w-full flex items-center gap-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 text-left'
                          } ${
                            isActive
                              ? 'bg-secondary text-primary font-black shadow-md'
                              : 'text-slate-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
                          {!isSidebarCollapsed && <span>{item.name}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Bottom Section */}
              <div className="p-4 border-t border-white/15 bg-black/10 space-y-3">
                {/* Account Manager Card */}
                <div className={`bg-white/5 border border-white/10 rounded-xl p-2 shadow-inner space-y-2 relative ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
                  {!isSidebarCollapsed && (
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Votre chargée de clientèle
                    </div>
                  )}
                  <div className={`flex items-center justify-between w-full gap-1.5 ${isSidebarCollapsed ? 'flex-col justify-center' : ''}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                        <img
                          src="/src/assets/images/client_manager_1783160889680.jpg"
                          alt="Sophie Durand"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      {!isSidebarCollapsed && (
                        <div className="leading-tight min-w-0">
                          <div className="text-[11px] font-extrabold text-white truncate">Sophie Durand</div>
                          <div className="text-[9px] text-slate-400 font-bold">Adeena</div>
                        </div>
                      )}
                    </div>
                    
                    <div className={`flex gap-1 shrink-0 ${isSidebarCollapsed ? 'justify-center w-full pt-1' : ''}`}>
                      {/* Telephone Icon Button */}
                      <button
                        onClick={() => {
                          setShowPhone(!showPhone);
                          if (!showPhone) setShowEmail(false);
                        }}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                          showPhone ? 'bg-secondary text-primary shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                        title={showPhone ? 'Masquer le numéro' : 'Afficher le numéro'}
                      >
                        <Phone className="w-3 h-3" />
                      </button>

                      {/* Email Icon Button */}
                      <button
                        onClick={() => {
                          setShowEmail(!showEmail);
                          if (!showEmail) setShowPhone(false);
                        }}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                          showEmail ? 'bg-secondary text-primary shadow-sm' : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                        title={showEmail ? "Masquer l'e-mail" : "Afficher l'e-mail"}
                      >
                        <Mail className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Revealed Info display */}
                  {(showPhone || showEmail) && (
                    <div className={`text-[10px] font-bold text-center leading-tight break-all p-1.5 bg-black/40 rounded-lg text-white border border-white/5 animate-fade-in ${
                      isSidebarCollapsed 
                        ? 'absolute left-16 bottom-0 ml-4 bg-slate-900 border border-white/10 p-2 shadow-2xl z-50 w-44' 
                        : 'w-full'
                    }`}>
                      {showPhone && <div className="truncate">📞 01 45 67 89 10</div>}
                      {showEmail && <div className="truncate text-[9px]">✉️ sophie.durand@adeena.fr</div>}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </aside>
        )}

        {/* Overlay for mobile menu */}
        {isAuthenticated && userCompany && isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Right Content Column (Header + Main Content + Footer) */}
        <div className={isAuthenticated && userCompany ? "flex-1 flex flex-col min-w-0 min-h-screen bg-[#F1F3F5]" : "flex-1 flex flex-col min-h-screen justify-between bg-[#F1F3F5]"}>
          
          {/* Header Navbar for logged-in users */}
          {isAuthenticated && userCompany && (
            <header className="bg-white border-b border-slate-200 h-16 sticky top-0 z-40 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
              {/* Left: Page Title & Mobile Trigger */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <button
                  onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer mr-1"
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="w-5 h-5 text-slate-600" />
                </button>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-800 truncate">
                  {getPageTitle()}
                </h1>
              </div>

              {/* Center: OdiCEE Title Centered */}
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <span className="text-sm sm:text-base tracking-tight font-black text-primary leading-none">
                  Odi<span className="text-secondary">CEE</span> Partenaires
                </span>
                <span className="text-[10px] text-slate-400 font-bold font-mono mt-0.5 leading-none">
                  version 27.01 by Adeena 
                </span>
              </div>

              {/* Right: User Name, Role, and Logout Picto */}
              <div className="flex-1 flex items-center justify-end gap-4 min-w-0">
                <div className="text-right hidden sm:block leading-tight">
                  <span className="text-xs font-bold text-slate-800 block">
                    {getUserFullName().firstName} {getUserFullName().lastName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    {getUserRole()}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-100 shadow-xs"
                  title="Déconnexion"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            </header>
          )}

          {/* Main workspace */}
          <main className={`flex-1 py-6 ${isAuthenticated && userCompany ? "px-4 sm:px-6 lg:px-8" : ""}`}>
            {currentView === 'login' && (
              <Login 
                onLoginSuccess={handleLoginSuccess} 
                onNavigateToSimulator={handleNavigateToSimulator}
              />
            )}

            {currentView === 'dashboard' && isAuthenticated && (
              <Dashboard 
                dossiers={dossiers}
                companyInfo={userCompany}
                onNavigateToWizard={handleNavigateToWizard}
                onNavigateToSimulator={handleNavigateToSimulator}
                onViewDossier={handleNavigateToDossierDetail}
                onDuplicateDossier={handleDuplicateDossier}
                onDeleteDossier={handleDeleteDossier}
              />
            )}

            {currentView === 'simulator' && (
              <Simulator
                isLoggedIn={isAuthenticated}
                onSaveDraft={handleSaveDraftFromSimulator}
                onTransformToDossier={handleTransformSimulatorToDossier}
                onNavigateToLogin={() => setCurrentView('login')}
              />
            )}

            {currentView === 'wizard' && isAuthenticated && (
              <FolderWizard
                key={wizardKey}
                initialChantiers={transitChantiers}
                onWizardComplete={handleWizardComplete}
                onCancel={() => {
                  setTransitChantiers([]);
                  setCurrentView('dashboard');
                }}
              />
            )}

            {currentView === 'detail' && isAuthenticated && activeDossier && (
              <DossierDetail
                dossier={activeDossier}
                onBack={() => {
                  setActiveDossierId(null);
                  setCurrentView('dashboard');
                }}
                onUpdateDossier={(updated) => {
                  handleUpdateDossierInList(updated);
                }}
              />
            )}

            {currentView === 'company' && isAuthenticated && userCompany && (
              <CompanyProfile
                companyInfo={userCompany}
                onUpdateCompany={(updated) => {
                  setUserCompany(updated);
                  triggerToast("Informations de la société mises à jour !");
                }}
                onBack={() => setCurrentView('dashboard')}
              />
            )}

            {currentView === 'documentation' && isAuthenticated && (
              <Documentation />
            )}
          </main>

          {/* Footer */}
          <footer className="mt-8 border-t border-black/5 bg-white">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-[0.25em] text-[#64748B] gap-2 text-center sm:text-left">
              <span>© 2026 ESPACE PARTENAIRE ODICEE</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveLegalPage(activeLegalPage === 'cgu' ? null : 'cgu')}
                  className="hover:text-[#3B82F6] transition-colors cursor-pointer normal-case tracking-normal font-bold"
                >
                  Conditions Générales d'Utilisation
                </button>
                <span className="opacity-30">|</span>
                <button
                  onClick={() => setActiveLegalPage(activeLegalPage === 'confidentialite' ? null : 'confidentialite')}
                  className="hover:text-[#3B82F6] transition-colors cursor-pointer normal-case tracking-normal font-bold"
                >
                  Politique de confidentialité
                </button>
                <span className="opacity-30">|</span>
                <button
                  onClick={() => setActiveLegalPage(activeLegalPage === 'mentions' ? null : 'mentions')}
                  className="hover:text-[#3B82F6] transition-colors cursor-pointer normal-case tracking-normal font-bold"
                >
                  Mentions légales
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-75 normal-case tracking-normal">Made with 💚 par Adeena</span>
                <button
                  type="button"
                  onClick={handleGenerateReport}
                  title="Prendre une copie d'écran et générer un rapport"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center border border-transparent hover:border-slate-200 shadow-2xs"
                  id="btn-screenshot-report"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Panneau extensible affichant le contenu de la page légale sélectionnée */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-black/5 ${
                activeLegalPage ? 'max-h-96' : 'max-h-0'
              }`}
            >
              {activeLegalPage && (
                <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 relative">
                  <button
                    onClick={() => setActiveLegalPage(null)}
                    className="absolute top-4 right-4 sm:right-6 lg:right-8 text-xs bg-[#F1F3F5] hover:bg-slate-200 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-[#1A1C1E]"
                  >
                    Fermer ✕
                  </button>
                  <h3 className="text-sm font-black uppercase tracking-wide text-[#1A1C1E] mb-3 pr-24">
                    {LEGAL_CONTENT[activeLegalPage].title}
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed normal-case tracking-normal max-h-48 overflow-y-auto">
                    {LEGAL_CONTENT[activeLegalPage].body}
                  </p>
                </div>
              )}
            </div>
          </footer>

        </div>

      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-xs font-bold animate-bounce z-50">
          <span>✨</span> {toastMessage}
        </div>
      )}
    </div>
  );
}
