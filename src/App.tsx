import React, { useState } from 'react';
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

  const handleGenerateReport = () => {
    // 1. Gather Telemetry
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

    // 2. Draw Schematic Screenshot representing high-fidelity layout on a taller canvas to hold diagnostics
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1100; // Extra height for the integrated report parameters
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, 1200, 1100);

      // Sidebar background
      const grad = ctx.createLinearGradient(0, 0, 0, 750);
      grad.addColorStop(0, '#0F172A'); // Slate 900
      grad.addColorStop(1, '#1E293B'); // Slate 800
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 260, 750);

      // Logo house structure in sidebar
      ctx.fillStyle = '#328CC1'; // Secondary logo color
      ctx.beginPath();
      ctx.moveTo(40, 65);
      ctx.lineTo(40, 45);
      ctx.lineTo(60, 30);
      ctx.lineTo(80, 45);
      ctx.lineTo(80, 65);
      ctx.closePath();
      ctx.fill();
      
      // Draw cloud inside house
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(55, 52, 6, 0, Math.PI * 2);
      ctx.arc(65, 52, 6, 0, Math.PI * 2);
      ctx.arc(60, 47, 6, 0, Math.PI * 2);
      ctx.fill();

      // Company text in sidebar
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(companyName, 95, 48);
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('ADMINISTRATEUR', 95, 61);

      // Sidebar separator line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(20, 85);
      ctx.lineTo(240, 85);
      ctx.stroke();

      // Sidebar items navigation simulation
      const navItems = ['Accueil', 'Déclarer', 'Simuler une prime', 'Ma société'];
      navItems.forEach((item, index) => {
        const itemY = 135 + index * 52;
        const isActive = item === activeItem;

        if (isActive) {
          ctx.fillStyle = '#1E293B';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(15, itemY - 20, 230, 36, 8);
          } else {
            ctx.rect(15, itemY - 20, 230, 36);
          }
          ctx.fill();
          ctx.fillStyle = '#328CC1'; // active item coloring
        } else {
          ctx.fillStyle = '#94A3B8';
        }

        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(item, 45, itemY);

        // indicator bullet
        ctx.fillStyle = isActive ? '#328CC1' : '#475569';
        ctx.beginPath();
        ctx.arc(28, itemY - 4, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Top Header bar simulation
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(260, 0, 940, 70);
      ctx.strokeStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.moveTo(260, 70);
      ctx.lineTo(1200, 70);
      ctx.stroke();

      // Header Titles (OdiCEE Partenaires + version)
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('OdiCEE Partenaires', 290, 36);
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('v27.01', 290, 52);

      // User avatar profile bubble in right side of header
      ctx.fillStyle = '#F1F5F9';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(980, 16, 190, 38, 19);
      } else {
        ctx.rect(980, 16, 190, 38);
      }
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(companyName.length > 20 ? companyName.substring(0, 18) + '...' : companyName, 995, 38);

      // Main Content panel rendering title
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(activeViewLabel, 290, 125);

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Aperçu instantané d\'audit technique', 290, 148);

      // Active view bodies schematic layout rendering
      if (currentView === 'dashboard') {
        // Draw 3 statistics card boxes
        for (let i = 0; i < 3; i++) {
          const cardX = 290 + i * 290;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(cardX, 180, 270, 130, 16);
          } else {
            ctx.rect(cardX, 180, 270, 130);
          }
          ctx.fill();
          ctx.strokeStyle = '#E2E8F0';
          ctx.stroke();

          // Card Headers labels
          ctx.fillStyle = '#64748B';
          ctx.font = 'bold 11px sans-serif';
          const labels = ['DOSSIERS EN COURS', 'PRIME GENEREE', 'TAUX DE VALIDATION'];
          ctx.fillText(labels[i], cardX + 20, 215);

          // Card Values figures
          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 26px sans-serif';
          const values = [String(dossiers.length), '184 250 €', '94.2%'];
          ctx.fillText(values[i], cardX + 20, 255);

          // Subtext percentage highlights
          ctx.fillStyle = '#10B981';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText('● Performance optimale', cardX + 20, 288);
        }

        // Folders list block mockup
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(290, 340, 880, 370, 16);
        } else {
          ctx.rect(290, 340, 880, 370);
        }
        ctx.fill();
        ctx.strokeStyle = '#E2E8F0';
        ctx.stroke();

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('Suivi des dossiers CEE actifs', 315, 380);

        // Draw individual item rows representing dossiers list
        dossiers.slice(0, 5).forEach((d, idx) => {
          const rowY = 425 + idx * 52;
          ctx.fillStyle = '#64748B';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(d.reference, 315, rowY);
          ctx.fillText(d.beneficiaire.nom + ' ' + d.beneficiaire.prenom, 480, rowY);
          ctx.fillText(d.dateCreation, 710, rowY);
          
          // Badge background
          ctx.fillStyle = d.status === 'Complet' ? '#DEF7EC' : '#FEF3C7';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(910, rowY - 14, 100, 20, 10);
          } else {
            ctx.rect(910, rowY - 14, 100, 20);
          }
          ctx.fill();
          ctx.fillStyle = d.status === 'Complet' ? '#03543F' : '#92400E';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(d.status, 930, rowY);
        });
      } else if (currentView === 'company') {
        // Form Layout mockup
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(290, 185, 880, 520, 16);
        } else {
          ctx.rect(290, 185, 880, 520);
        }
        ctx.fill();
        ctx.strokeStyle = '#E2E8F0';
        ctx.stroke();

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('Informations Administratives Légales : ' + companyName, 320, 225);

        // Simulate form fields outlines
        const fields = [
          { label: 'Raison Sociale', value: companyName },
          { label: 'SIRET', value: userCompany?.siret || '49201930100023' },
          { label: 'Adresse', value: userCompany?.adresse || '12 RUE DE LA PAIX' },
          { label: 'Ville', value: userCompany?.ville || 'Paris' }
        ];

        fields.forEach((field, idx) => {
          const fieldY = 275 + idx * 82;
          ctx.fillStyle = '#64748B';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(field.label, 320, fieldY);

          ctx.fillStyle = '#F8FAFC';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(320, fieldY + 8, 410, 36, 8);
          } else {
            ctx.rect(320, fieldY + 8, 410, 36);
          }
          ctx.fill();
          ctx.strokeStyle = '#CBD5E1';
          ctx.stroke();

          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(field.value, 335, fieldY + 30);
        });

        // Right hand side info box
        ctx.fillStyle = '#F0F9FF';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(770, 260, 370, 380, 16);
        } else {
          ctx.rect(770, 260, 370, 380);
        }
        ctx.fill();
        ctx.strokeStyle = '#B9E6FE';
        ctx.stroke();

        ctx.fillStyle = '#0369A1';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('Documents et Attestations', 800, 305);
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('Attestation URSSAF - Vigilance légale', 800, 340);
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('✔ CONFORME ET ENREGISTRÉ', 800, 365);
      } else {
        // Generic active view visual representation
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(290, 180, 880, 500, 20);
        } else {
          ctx.rect(290, 180, 880, 500);
        }
        ctx.fill();
        ctx.strokeStyle = '#E2E8F0';
        ctx.stroke();

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('Module de Traitement : ' + activeViewLabel, 330, 230);

        // Drawing simple line skeletons
        ctx.strokeStyle = '#F1F5F9';
        ctx.lineWidth = 14;
        for (let i = 0; i < 7; i++) {
          ctx.beginPath();
          ctx.moveTo(330, 290 + i * 44);
          ctx.lineTo(1130, 290 + i * 44);
          ctx.stroke();
        }
      }

      // --- INTEGRATED METADATA & DIAGNOSTICS FOR JPG REPORT ---
      // Draw horizontal separator at y=760
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 760);
      ctx.lineTo(1200, 760);
      ctx.stroke();

      // Top banner of technical report at y=780
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(20, 780, 1160, 50);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText("RAPPORT D'ASSISTANCE TECHNIQUE - DIAGNOSTIC SYSTEME", 40, 812);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 11px monospace';
      ctx.fillText("VERSION 27.01", 1070, 812);

      // Main content block for diagnostics parameters
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(20, 830, 1160, 240);
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 780, 1160, 290);

      // Grid of parameters
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 12px sans-serif';

      // Column 1
      ctx.fillText("Date de génération :", 50, 870);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(reportDate, 220, 870);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText("URL Active :", 50, 910);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(reportUrl.substring(0, 100), 220, 910);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText("Entreprise :", 50, 950);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(companyName, 220, 950);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText("Vue active :", 50, 990);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(activeViewLabel, 220, 990);

      // Column 2
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText("Navigateur :", 620, 870);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 11px monospace';
      const uaPart1 = reportUA.substring(0, 60);
      const uaPart2 = reportUA.substring(60, 120);
      ctx.fillText(uaPart1, 790, 870);
      if (uaPart2) ctx.fillText(uaPart2, 790, 888);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText("Système / Périphérique :", 620, 915);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(reportPlatform, 790, 915);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText("Résolution physique :", 620, 955);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(reportScreenSize, 790, 955);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText("Dimensions Viewport :", 620, 995);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(reportViewport, 790, 995);

      // Warning instruction footer block
      ctx.fillStyle = '#EFF6FF';
      ctx.fillRect(40, 1025, 1120, 34);
      ctx.strokeStyle = '#BFDBFE';
      ctx.strokeRect(40, 1025, 1120, 34);

      ctx.fillStyle = '#1E40AF';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText("📩 ACTION : Veuillez transmettre ce rapport JPG de diagnostic à votre chargé de clientèle.", 60, 1046);
    }

    const reportDataUrl = canvas.toDataURL('image/jpeg', 0.95);

    // 3. Download JPG trigger
    const link = document.createElement("a");
    link.setAttribute("href", reportDataUrl);
    link.setAttribute("download", `Rapport_Assistance_OdiCEE_${Date.now()}.jpg`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 4. Trigger snackbar alert
    triggerToast("Transmettez le rapport généré à votre chargé de clientèle");
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
                  27.01
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
