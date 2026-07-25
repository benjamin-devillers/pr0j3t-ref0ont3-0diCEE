import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, Sparkles, Search, User, Users, Landmark, AlertTriangle, 
  Plus, Trash2, ArrowRight, ArrowLeft, Check, CheckCircle, ShieldAlert, Copy, Save
} from 'lucide-react';
import { Beneficiary, Contact, ObjetDossier, BatimentInfo, TravauxInfo, ChantierItem, Intervenant } from '../types';
import { CEE_SHEETS_LIST, CEE_SHEETS_MAP, MOCK_CLIENTS, MOCK_INTERVENANTS, BRANDS } from '../lib/ceeData';

interface FolderWizardProps {
  initialChantiers?: ChantierItem[];
  onWizardComplete: (newDossier: any, nextAction?: 'dashboard' | 'new_folder' | 'upload_devis') => void;
  onCancel: () => void;
  key?: any;
}

const getAnahCeilings = (nbPersons: number, isIdf: boolean) => {
  const n = Math.max(1, nbPersons);
  if (isIdf) {
    const baseTresModeste = [23541, 34551, 41493, 48447, 55427];
    const baseModeste = [28657, 42058, 50513, 58981, 67473];
    const extraTresModeste = 6971;
    const extraModeste = 8486;
    const tresModeste = n <= 5 ? baseTresModeste[n - 1] : baseTresModeste[4] + (n - 5) * extraTresModeste;
    const modeste = n <= 5 ? baseModeste[n - 1] : baseModeste[4] + (n - 5) * extraModeste;
    return { tresModeste, modeste };
  } else {
    const baseTresModeste = [17009, 24875, 29917, 34948, 40002];
    const baseModeste = [21805, 31889, 38349, 44792, 51281];
    const extraTresModeste = 5045;
    const extraModeste = 6478;
    const tresModeste = n <= 5 ? baseTresModeste[n - 1] : baseTresModeste[4] + (n - 5) * extraTresModeste;
    const modeste = n <= 5 ? baseModeste[n - 1] : baseModeste[4] + (n - 5) * extraModeste;
    return { tresModeste, modeste };
  }
};

export default function FolderWizard({ initialChantiers, onWizardComplete, onCancel }: FolderWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Étape 0: Lancement
  const [useDevisAnalyse, setUseDevisAnalyse] = useState<boolean | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [fileName, setFileName] = useState('');

  // Clients base
  const [clientsDatabase, setClientsDatabase] = useState(MOCK_CLIENTS);
  const [selectedClientIndex, setSelectedClientIndex] = useState<number | null>(null);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [manualGeographicRegion, setManualGeographicRegion] = useState<'idf' | 'province' | null>(null);
  const [isNewClientMode, setIsNewClientMode] = useState<boolean>(false);

  // Étape 1: Bénéficiaire state
  const [beneficiary, setBeneficiary] = useState<Beneficiary>({
    type: 'personne_physique',
    civility: '',
    nom: '',
    prenom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    email: '',
    telephone: '',
    telephonePortable: '',
    telephoneFixe: '',
    situationFiscaleConnue: false,
    nombrePersonnesFoyer: 1,
    trancheRevenus: 'autres',
    nombreAvisImposition: 1,
    titulairesSupplementaires: []
  });

  // Étape 1 bis: Contact
  const [contact, setContact] = useState<Contact>({
    type: 'beneficiaire',
    nom: '',
    prenom: '',
    email: '',
    telephone: ''
  });

  // Étape 2: Objet
  const [objet, setObjet] = useState<ObjetDossier>({ type: 'renovation_batiment' });

  // Étape 2 bis: Bâtiment
  const [batiment, setBatiment] = useState<BatimentInfo>({
    type: 'maison',
    memeAdresseBeneficiaire: true,
    residenceSecondaire: false
  });

  // Étape 3: Travaux
  const [referenceDevis, setReferenceDevis] = useState('');
  const [dateDevis, setDateDevis] = useState(new Date().toISOString().split('T')[0]);
  const [dateRealisationPrevue, setDateRealisationPrevue] = useState('');
  const [chantiers, setChantiers] = useState<ChantierItem[]>(initialChantiers || []);

  // Adding work item helpers
  const [activeFicheCode, setActiveFicheCode] = useState(CEE_SHEETS_LIST[0].code);
  const [ficheSearchTerm, setFicheSearchTerm] = useState('');
  const [showFicheDropdown, setShowFicheDropdown] = useState(false);

  // Sync autocomplete search input with selected fiche
  useEffect(() => {
    if (activeFicheCode) {
      const activeSheet = CEE_SHEETS_MAP[activeFicheCode];
      if (activeSheet) {
        setFicheSearchTerm(`${activeSheet.code} — ${activeSheet.shortDescription}`);
      }
    }
  }, [activeFicheCode]);

  // Builders/Intervenants list
  const [intervenantsList, setIntervenantsList] = useState<Intervenant[]>(MOCK_INTERVENANTS);
  const [showNewIntervenantModal, setShowNewIntervenantModal] = useState(false);
  const [newIntervenant, setNewIntervenant] = useState<Partial<Intervenant>>({
    raisonSociale: '',
    siret: '',
    representantNom: '',
    representantPrenom: '',
    fonction: '',
    email: '',
    telephone: '',
    documents: { kbis: '', urssaf: '', rge: [] }
  });

  // Share premium properties
  const [repartitionMode, setRepartitionMode] = useState<'global' | 'independant'>('global');
  const [repartitionGlobalPct, setRepartitionGlobalPct] = useState(80); // Min 50%
  const [repartitionChantiersPct, setRepartitionChantiersPct] = useState<Record<string, number>>({});
  const [repartitionChantiersAmount, setRepartitionChantiersAmount] = useState<Record<string, number>>({});

  // Étape 6: Type de dossier
  const [typeDossier, setTypeDossier] = useState<'pre_declaration' | 'declaration'>('declaration');

  // Generated reference
  const [generatedRef] = useState('CEE-2026-' + Math.floor(100000 + Math.random() * 900000));

  // Confirmation screen states
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [finalDossierObject, setFinalDossierObject] = useState<any>(null);

  // Initialize from initialChantiers
  useEffect(() => {
    if (initialChantiers && initialChantiers.length > 0) {
      setChantiers(initialChantiers);
      setCurrentStep(1); // Skip Step 0 if simulation is loaded
    }
  }, [initialChantiers]);

  // Read beneficiary & signatory contact auto fills
  useEffect(() => {
    if (contact.type === 'beneficiaire') {
      setContact({
        type: 'beneficiaire',
        nom: beneficiary.nom,
        prenom: beneficiary.prenom,
        email: beneficiary.email,
        telephone: beneficiary.telephone
      });
    } else if (contact.type === 'signataire') {
      setContact({
        type: 'signataire',
        nom: beneficiary.nom,
        prenom: beneficiary.prenom,
        email: beneficiary.email,
        telephone: beneficiary.telephone,
        role: 'Signataire Autorisé'
      });
    }
  }, [beneficiary, contact.type]);

  // Pre-fill helper from Gemini Extraction
  const handleDevisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setAnalyzing(true);

    const progressSteps = [
      "Fichier reçu, vérification du format...",
      "Analyse sémantique des clauses contractuelles...",
      "Extraction des données d'identité du client...",
      "Identification des fiches d'opérations standardisées éligibles...",
      "Vérification de la qualification RGE requise...",
      "Calcul préliminaire des volumes de MWh cumac..."
    ];

    let stepIdx = 0;
    setAnalysisProgress(progressSteps[0]);
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < progressSteps.length) {
        setAnalysisProgress(progressSteps[stepIdx]);
      }
    }, 1000);

    // Read file as base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = (reader.result as string).split(',')[1];
      
      try {
        const response = await fetch('/api/analyse-devis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64String,
            mimeType: file.type,
            fileName: file.name
          })
        });
        const result = await response.json();
        clearInterval(interval);
        setAnalyzing(false);

        if (result.success && result.data) {
          const extracted = result.data;
          // Apply extracted values to wizard state
          setSelectedClientIndex(null);
          setIsNewClientMode(true);
          setBeneficiary(prev => ({
            ...prev,
            type: extracted.beneficiaireRaisonSociale ? 'personne_morale' : 'personne_physique',
            civility: extracted.beneficiaireCivilite || '',
            nom: extracted.beneficiaireNom || '',
            prenom: extracted.beneficiairePrenom || '',
            raisonSociale: extracted.beneficiaireRaisonSociale || '',
            siret: extracted.beneficiaireSiret || '',
            adresse: extracted.beneficiaireAdresse || '',
            codePostal: extracted.beneficiaireCodePostal || '',
            ville: extracted.beneficiaireVille || ''
          }));

          setReferenceDevis(extracted.devisReference || '');
          if (extracted.devisDate) {
            setDateDevis(extracted.devisDate);
          }

          // Build chantier if fiche recognized
          const sheetCode = extracted.travauxReferenceFiche;
          const sheet = CEE_SHEETS_MAP[sheetCode];
          if (sheet) {
            // default properties
            const defaultProps: Record<string, any> = {};
            sheet.properties.forEach(p => {
              if (p.key === 'surface' && extracted.travauxSurface) {
                defaultProps[p.key] = extracted.travauxSurface;
              } else if (p.type === 'select' && p.options) {
                defaultProps[p.key] = p.options[0];
              } else {
                defaultProps[p.key] = '';
              }
            });

            const newChantier: ChantierItem = {
              id: 'extracted-' + Math.random().toString(36).substring(2, 9),
              ficheCode: sheet.code,
              ficheTitle: sheet.title,
              properties: defaultProps,
              volumeCumac: sheet.calculateCumac(defaultProps),
              prime: sheet.calculateCumac(defaultProps) * 6,
              intervenantType: 'societe',
              marque: extracted.travauxMarque || '',
              referenceProduit: extracted.travauxReferenceProduit || ''
            };

            setChantiers([newChantier]);
          }

          // Advance
          setCurrentStep(1);
        } else {
          setAnalyzing(false);
          alert("Échec de l'extraction automatisée des données. Lancement du parcours de saisie classique.");
          setCurrentStep(1);
        }
      } catch (err) {
        clearInterval(interval);
        setAnalyzing(false);
        alert("Erreur technique de communication. Saisie classique activée.");
        setCurrentStep(1);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSelectClient = (idx: number) => {
    const selected = clientsDatabase[idx];
    setSelectedClientIndex(idx);
    setManualGeographicRegion(null); // Reset manual override
    setIsNewClientMode(false);

    const isMobile = selected.telephone.startsWith('06') || selected.telephone.startsWith('07') || selected.telephone.replace(/\s/g, '').startsWith('+336') || selected.telephone.replace(/\s/g, '').startsWith('+337');
    
    setBeneficiary({
      type: selected.type,
      civility: selected.civility || 'M.',
      nom: selected.nom,
      prenom: selected.prenom,
      raisonSociale: selected.raisonSociale || '',
      siret: selected.siret || '',
      typePersonneMorale: selected.typePersonneMorale || undefined,
      adresse: selected.adresse,
      codePostal: selected.codePostal,
      ville: selected.ville,
      email: selected.email,
      telephone: selected.telephone,
      telephonePortable: isMobile ? selected.telephone : '',
      telephoneFixe: !isMobile ? selected.telephone : '',
      situationFiscaleConnue: selected.situationFiscaleConnue || false,
      nombrePersonnesFoyer: selected.nombrePersonnesFoyer || 1,
      trancheRevenus: selected.trancheRevenus || 'autres',
      nombreAvisImposition: selected.nombreAvisImposition || 1,
      titulairesSupplementaires: selected.titulairesSupplementaires || []
    });
  };

  const handleCreateNewClient = () => {
    setSelectedClientIndex(null);
    setManualGeographicRegion(null); // Reset manual override
    setIsNewClientMode(true);
    setBeneficiary({
      type: 'personne_physique',
      civility: '',
      nom: '',
      prenom: '',
      adresse: '',
      codePostal: '',
      ville: '',
      email: '',
      telephone: '',
      telephonePortable: '',
      telephoneFixe: '',
      situationFiscaleConnue: false,
      nombrePersonnesFoyer: 1,
      trancheRevenus: 'autres',
      nombreAvisImposition: 1,
      titulairesSupplementaires: []
    });
  };

  const handleAddChantier = (code?: string) => {
    const codeToUse = code || activeFicheCode;
    const sheet = CEE_SHEETS_MAP[codeToUse];
    if (!sheet) return;

    const defaultProps: Record<string, any> = {};
    sheet.properties.forEach(p => {
      if (p.type === 'select' && p.options) {
        defaultProps[p.key] = p.options[0];
      } else {
        defaultProps[p.key] = '';
      }
    });

    const newChantier: ChantierItem = {
      id: 'ch-' + Math.random().toString(36).substring(2, 9),
      ficheCode: sheet.code,
      ficheTitle: sheet.title,
      properties: defaultProps,
      volumeCumac: 0,
      prime: 0,
      intervenantType: 'societe',
      marque: Object.keys(BRANDS)[0],
      referenceProduit: BRANDS[Object.keys(BRANDS)[0] as keyof typeof BRANDS][0]
    };

    setChantiers([...chantiers, newChantier]);
  };

  const handleRemoveChantier = (id: string) => {
    setChantiers(chantiers.filter(c => c.id !== id));
  };

  const handleChantierPropertyChange = (chantierId: string, key: string, value: any) => {
    setChantiers(prev => prev.map(c => {
      if (c.id !== chantierId) return c;

      const updatedProperties = {
        ...c.properties,
        [key]: value
      };

      const sheet = CEE_SHEETS_MAP[c.ficheCode];
      let volumeCumac = 0;
      if (sheet) {
        volumeCumac = sheet.calculateCumac(updatedProperties);
      }
      const prime = volumeCumac * 6;

      return {
        ...c,
        properties: updatedProperties,
        volumeCumac,
        prime
      };
    }));
  };

  const handleChantierSelectChange = (chantierId: string, key: 'marque' | 'referenceProduit', value: string) => {
    setChantiers(prev => prev.map(c => {
      if (c.id !== chantierId) return c;

      if (key === 'marque') {
        const brandRefs = BRANDS[value as keyof typeof BRANDS] || [];
        return {
          ...c,
          marque: value,
          referenceProduit: brandRefs[0] || ''
        };
      } else {
        return {
          ...c,
          referenceProduit: value
        };
      }
    }));
  };

  // Intervenant modal builder submission
  const handleCreateIntervenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIntervenant.raisonSociale || !newIntervenant.siret) return;

    const created: Intervenant = {
      id: 'int-' + Math.random().toString(36).substring(2, 9),
      raisonSociale: newIntervenant.raisonSociale,
      siret: newIntervenant.siret,
      representantNom: newIntervenant.representantNom || '',
      representantPrenom: newIntervenant.representantPrenom || '',
      fonction: newIntervenant.fonction || '',
      email: newIntervenant.email || '',
      telephone: newIntervenant.telephone || '',
      documents: {
        kbis: 'kbis_uploaded.pdf',
        urssaf: 'urssaf_uploaded.pdf',
        rge: ['rge_uploaded.pdf']
      }
    };

    setIntervenantsList([...intervenantsList, created]);
    setShowNewIntervenantModal(false);
    setNewIntervenant({
      raisonSociale: '',
      siret: '',
      representantNom: '',
      representantPrenom: '',
      fonction: '',
      email: '',
      telephone: '',
      documents: { kbis: '', urssaf: '', rge: [] }
    });
  };

  // Share calculation outputs
  const totalVolumeCumac = chantiers.reduce((acc, c) => acc + c.volumeCumac, 0);
  const totalPrimeValue = totalVolumeCumac * 6;

  let sharePartBeneficiaire = 0;
  if (repartitionMode === 'global') {
    sharePartBeneficiaire = (totalPrimeValue * repartitionGlobalPct) / 100;
  } else {
    // Cumulative sum per independent sharing choices
    sharePartBeneficiaire = chantiers.reduce((acc, c) => {
      const amt = repartitionChantiersAmount[c.id] !== undefined ? repartitionChantiersAmount[c.id] : Math.round(c.prime * 0.8);
      return acc + amt;
    }, 0);
  }

  const sharePartProfessionnelle = totalPrimeValue - sharePartBeneficiaire;

  const handleNextStep = () => {
    // Validation controls per step
    if (currentStep === 1) {
      if (selectedClientIndex === null && !isNewClientMode) {
        alert("Veuillez rechercher et sélectionner un bénéficiaire ou cliquer sur 'Nouveau Client' pour en créer un.");
        return;
      }
      if (beneficiary.type === 'personne_physique' && (!beneficiary.nom || !beneficiary.prenom)) {
        alert("Le nom et prénom du bénéficiaire sont requis.");
        return;
      }
      if (beneficiary.type === 'personne_morale' && (!beneficiary.raisonSociale || !beneficiary.siret)) {
        alert("La raison sociale et le n° SIRET de la personne morale sont requis.");
        return;
      }
      if (!beneficiary.telephonePortable && !beneficiary.telephoneFixe) {
        alert("Au moins un numéro de téléphone (portable ou fixe) est obligatoire.");
        return;
      }
      // Check additional tax notice declarants if count > 2
      if (beneficiary.type === 'personne_physique' && beneficiary.situationFiscaleConnue) {
        if ((beneficiary.nombreAvisImposition || 1) > 2) {
          const tits = beneficiary.titulairesSupplementaires || [];
          const requiredCount = (beneficiary.nombreAvisImposition || 1) - 2;
          for (let i = 0; i < requiredCount; i++) {
            if (!tits[i] || !tits[i].nom?.trim() || !tits[i].prenom?.trim()) {
              alert(`Veuillez renseigner le nom et prénom du déclarant pour l'avis d'imposition supplémentaire n°${i + 3}.`);
              return;
            }
          }
        }
      }
    }

    if (currentStep === 4 && chantiers.length === 0) {
      alert("Veuillez configurer au moins une opération de travaux pour ce dossier.");
      return;
    }

    if (currentStep === 5) {
      // Constraint: client gets at least 50%
      if (repartitionMode === 'global' && repartitionGlobalPct < 50) {
        alert("Règle de gestion bloquante : la part du bénéficiaire ne peut pas être inférieure à 50% de la prime totale.");
        return;
      }
      if (repartitionMode === 'independant') {
        const tooLow = chantiers.some(c => (repartitionChantiersPct[c.id] || 80) < 50);
        if (tooLow) {
          alert("Règle de gestion bloquante : aucune part bénéficiaire ne peut être inférieure à 50% sur l'un des chantiers.");
          return;
        }
      }
    }

    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (currentStep === 1 && useDevisAnalyse === false) {
      setCurrentStep(0);
      setUseDevisAnalyse(null);
    } else {
      setCurrentStep(prev => Math.max(0, prev - 1));
    }
  };

  const handleFinalSubmit = () => {
    const finalDossier = {
      id: 'dos-' + Math.random().toString(36).substring(2, 9),
      reference: generatedRef,
      status: typeDossier === 'pre_declaration' ? 'Pré déclaré' : 'Déclaré',
      dateCreation: new Date().toISOString().split('T')[0],
      beneficiary,
      contact,
      objet,
      batiment,
      travaux: {
        referenceDevis,
        dateDevis,
        dateRealisationPrevue,
        chantiers
      },
      repartitionMode,
      repartitionGlobalPct,
      repartitionChantiersPct,
      primeTotale: totalPrimeValue,
      partProfessionnelle: sharePartProfessionnelle,
      partBeneficiaire: sharePartBeneficiaire,
      typeDossier,
      documentsCharges: {
        devisSigne: typeDossier === 'declaration',
        cadreContribution: true,
        facture: false,
        attestationHonneurSignee: false
      }
    };

    setFinalDossierObject(finalDossier);
    setIsConfirmed(true);
  };

  // STEP CHIPS HEADERS (1 to 8)
  const WIZARD_STEPS = [
    { label: "Lancement", idx: 0 },
    { label: "Bénéficiaire", idx: 1 },
    { label: "Contact", idx: 2 }, // Step 1 bis Contact
    { label: "Objet", idx: 3 }, // Step 2 and 2bis
    { label: "Travaux", idx: 4 }, // Step 3
    { label: "Calcul", idx: 5 }, // Step 5 Share
    { label: "Récapitulatif", idx: 6 }, // Step 6 Review
    { label: "Type de dossier", idx: 7 } // Step 7 Type de dossier
  ];

  const isIdfPostalCode = (beneficiary.codePostal || '').startsWith('75') || 
                          (beneficiary.codePostal || '').startsWith('77') || 
                          (beneficiary.codePostal || '').startsWith('78') || 
                          (beneficiary.codePostal || '').startsWith('91') || 
                          (beneficiary.codePostal || '').startsWith('92') || 
                          (beneficiary.codePostal || '').startsWith('93') || 
                          (beneficiary.codePostal || '').startsWith('94') || 
                          (beneficiary.codePostal || '').startsWith('95');

  const currentRegion = isIdfPostalCode ? 'idf' : 'province';

  const isStep1Valid = (() => {
    if (selectedClientIndex !== null) return true;
    if (!isNewClientMode) return false;
    
    // New client mode
    if (beneficiary.type === 'personne_physique') {
      if (!beneficiary.nom?.trim() || !beneficiary.prenom?.trim()) return false;
    } else if (beneficiary.type === 'personne_morale') {
      if (!beneficiary.raisonSociale?.trim() || !beneficiary.siret?.trim() || !beneficiary.nom?.trim() || !beneficiary.prenom?.trim()) return false;
    }
    
    if (!beneficiary.adresse?.trim() || !beneficiary.codePostal?.trim() || !beneficiary.ville?.trim()) return false;
    if (!beneficiary.email?.trim()) return false;
    if (!beneficiary.telephonePortable?.trim() && !beneficiary.telephoneFixe?.trim()) return false;
    
    if (beneficiary.type === 'personne_physique' && beneficiary.situationFiscaleConnue) {
      if ((beneficiary.nombreAvisImposition || 1) > 2) {
        const tits = beneficiary.titulairesSupplementaires || [];
        const requiredCount = (beneficiary.nombreAvisImposition || 1) - 2;
        for (let i = 0; i < requiredCount; i++) {
          if (!tits[i] || !tits[i].nom?.trim() || !tits[i].prenom?.trim()) {
            return false;
          }
        }
      }
    }
    return true;
  })();

  const isStep2Valid = (() => {
    if (contact.type !== 'autre') return true;
    if (!contact.prenom?.trim() || !contact.nom?.trim() || !contact.email?.trim() || !contact.telephone?.trim() || !contact.role?.trim()) {
      return false;
    }
    return true;
  })();

  const isStep3Valid = (() => {
    if (objet.type === 'transport') return true;
    if (!batiment.type) return false;
    
    if (batiment.type !== 'maison' && batiment.type !== 'appartement') {
      if (!batiment.nomBatiment?.trim()) return false;
    }
    
    if (batiment.type === 'batiment_residentiel_collectif' && beneficiary.typePersonneMorale === 'bailleur_social') {
      if (!batiment.nombreLogementsConcerne || batiment.nombreLogementsConcerne <= 0) return false;
      if (!batiment.nombreLogementsConventionnesBailleur || batiment.nombreLogementsConventionnesBailleur <= 0) return false;
    }
    
    if (!batiment.memeAdresseBeneficiaire) {
      if (!batiment.adresseTravaux?.trim() || !batiment.codePostalTravaux?.trim() || !batiment.villeTravaux?.trim()) {
        return false;
      }
    }
    return true;
  })();

  const filteredClients = clientSearchTerm ? clientsDatabase.filter(cl => {
    const term = clientSearchTerm.toLowerCase();
    const fullName = `${cl.prenom || ''} ${cl.nom || ''}`.toLowerCase();
    const raison = (cl.raisonSociale || '').toLowerCase();
    const phone = (cl.telephone || '').toLowerCase();
    const email = (cl.email || '').toLowerCase();
    const cp = (cl.codePostal || '').toLowerCase();
    const city = (cl.ville || '').toLowerCase();
    return fullName.includes(term) || raison.includes(term) || phone.includes(term) || email.includes(term) || cp.includes(term) || city.includes(term);
  }) : [];

  if (isConfirmed && finalDossierObject) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-8 fade-in">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-black/10 shadow-lg p-8 md:p-10 space-y-8 text-center fade-in">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="font-sans text-2xl md:text-3xl text-primary font-black tracking-tight">Dossier créé avec succès !</h2>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Félicitations, votre dossier d'aide à la rénovation énergétique a bien été enregistré.
              </p>
            </div>
          </div>

          {/* Dossier info summary card */}
          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 text-left space-y-4">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Référence du dossier</span>
              <span className="text-sm font-extrabold text-primary font-mono select-all bg-primary/10 px-3 py-1 rounded">
                {finalDossierObject.reference}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-600">
                <strong>Bénéficiaire :</strong>{' '}
                {finalDossierObject.beneficiary.civility} {finalDossierObject.beneficiary.prenom} {finalDossierObject.beneficiary.nom}
                {finalDossierObject.beneficiary.type === 'personne_morale' && ` (${finalDossierObject.beneficiary.raisonSociale})`}
              </p>
              <p className="text-slate-600">
                <strong>Montant de la prime estimée :</strong>{' '}
                <span className="font-bold text-secondary font-mono">
                  {finalDossierObject.primeTotale.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </p>
              <p className="text-slate-600">
                <strong>Type de traitement :</strong>{' '}
                <span className="font-semibold text-primary">
                  {finalDossierObject.typeDossier === 'pre_declaration' ? 'Pré-déclaration (Validation préalable)' : 'Déclaration Directe'}
                </span>
              </p>
            </div>
          </div>

          {/* Mail notification banner */}
          <div className="p-4 bg-blue-50 border border-blue-150 rounded-2xl flex items-start gap-3 text-left text-blue-800 text-xs leading-relaxed">
            <FileText className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <strong>Envoi par email :</strong> Le document réglementaire <strong>Cadre Contribution</strong> a été généré avec succès et envoyé par mail à l'adresse du bénéficiaire <strong>{finalDossierObject.beneficiary.email}</strong>.
            </div>
          </div>

          {/* Call to actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <button
              onClick={() => onWizardComplete(finalDossierObject, 'dashboard')}
              className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Revenir à l'accueil
            </button>
            
            <button
              onClick={() => onWizardComplete(finalDossierObject, 'upload_devis')}
              className="w-full bg-secondary hover:bg-opacity-95 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Upload className="w-4 h-4" /> Charger un devis
            </button>

            <button
              onClick={() => onWizardComplete(finalDossierObject, 'new_folder')}
              className="w-full bg-primary hover:bg-opacity-95 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nouveau dossier
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 fade-in">
      {/* Wizard Step Progression Stepper */}
      {currentStep > 0 && currentStep <= 7 && (
        <div className="mb-8 overflow-x-auto pb-4 scrollbar-none">
          <div className="flex items-center min-w-[700px] justify-between text-xs font-semibold relative">
            {/* Visual connector line */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-10"></div>
            
            {WIZARD_STEPS.map((step, sIdx) => {
              const stepMap = [0, 1, 2, 3, 4, 5, 6, 7]; // Maps visual steps to technical index
              const stepInternalIdx = stepMap[sIdx];
              const isPast = currentStep > stepInternalIdx;
              const isCurrent = currentStep === stepInternalIdx;

              return (
                <div key={step.label} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isPast 
                      ? 'bg-secondary text-white' 
                      : isCurrent 
                        ? 'bg-primary text-white ring-4 ring-primary/10' 
                        : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}>
                    {isPast ? <Check className="w-4 h-4" /> : sIdx}
                  </div>
                  <span className={`mt-2 text-[10px] tracking-tight ${isCurrent ? 'text-primary font-bold' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 0: Lancement */}
      {currentStep === 0 && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-black/10 shadow-xs p-8 space-y-8 fade-in">
          <div className="text-center space-y-2">
            <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Étape 1 :Lancement</span>
            <h2 className="font-sans text-2xl md:text-3xl text-primary font-black tracking-tight">Comment souhaitez-vous déclarer ?</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">
              OdiCEE vous permet de déclarer à blanc ou d'analyser automatiquement un devis par intelligence artificielle pour pré-remplir l'ensemble du parcours.
            </p>
          </div>

          {analyzing ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-primary animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-secondary" />
              </div>
              <div className="text-center max-w-xs space-y-1">
                <h4 className="font-black text-primary text-sm">Analyse intelligente en cours</h4>
                <p className="text-xs text-secondary font-mono animate-pulse font-bold">{analysisProgress}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Box 1: AI Devis analysis */}
              <div className="border border-black/10 hover:border-secondary rounded-2xl p-6 text-center space-y-4 cursor-pointer transition-all shadow-xs group relative bg-white">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto border border-secondary/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-primary group-hover:text-secondary text-sm">Analyse intelligente</h4>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    Uploadez le devis client (PDF ou Image). L'IA OdiCEE extrait l'identité du client, le type de travaux et pré-renseigne tout le dossier.
                  </p>
                </div>
                
                <label className="block bg-secondary hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all mt-4">
                  <Upload className="w-3.5 h-3.5 inline mr-1.5" /> Charger un devis
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleDevisUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Box 2: Manual blank form */}
              <div 
                onClick={() => { setUseDevisAnalyse(false); setCurrentStep(1); }}
                className="border border-black/10 hover:border-secondary rounded-2xl p-6 text-center space-y-4 cursor-pointer transition-all shadow-xs group flex flex-col justify-between bg-white"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center mx-auto border border-black/5">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-primary group-hover:text-secondary text-sm">Saisie manuelle</h4>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Remplissez manuellement les formulaires de l'espace partenaire étape par étape sans charger de fichier initial.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => { setUseDevisAnalyse(false); setCurrentStep(1); }}
                  className="w-full bg-primary hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all mt-4"
                >
                  Saisie manuelle<ArrowRight className="w-3.5 h-3.5 inline ml-1.5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-wider underline cursor-pointer"
            >
              Retourner au tableau de bord
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: Bénéficiaire */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl border border-black/10 shadow-xs p-6 md:p-8 space-y-6 fade-in">
          <div>
            <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Étape 1 : Bénéficiaire</span>
            <h3 className="font-sans text-xl md:text-2xl text-primary font-black tracking-tight mt-1">Saisie du bénéficiaire du dossier CEE</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Recherchez un client connu dans votre base ou créez un nouveau bénéficiaire physique ou moral.</p>
          </div>

          {/* Customer Search & Switch Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-black/5 space-y-4">
            <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
              <Search className="w-4 h-4 text-secondary" /> Rechercher dans vos clients existants
            </h4>

            {/* Barre de recherche */}
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, raison sociale, email, téléphone, code postal ou ville..."
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-secondary focus:outline-none bg-white shadow-xs"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              {clientSearchTerm && (
                <button
                  type="button"
                  onClick={() => setClientSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded"
                >
                  Effacer
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredClients.map((cl) => {
                const clIdx = clientsDatabase.findIndex(c => c === cl);
                return (
                  <div
                    key={clIdx}
                    onClick={() => handleSelectClient(clIdx)}
                    className={`border rounded-xl p-3.5 cursor-pointer text-left transition-all bg-white relative ${
                      selectedClientIndex === clIdx 
                        ? 'border-secondary bg-blue-50/50' 
                        : 'border-black/10 hover:border-slate-300'
                    }`}
                  >
                    {selectedClientIndex === clIdx && (
                      <span className="absolute top-2 right-2 text-secondary bg-secondary/10 rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                    <div className="text-xs font-bold text-primary truncate">
                      {cl.type === 'personne_physique' ? `${cl.prenom} ${cl.nom}` : cl.raisonSociale}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 space-y-0.5">
                      <div className="truncate">{cl.adresse}</div>
                      <div>{cl.codePostal} {cl.ville}</div>
                      {cl.telephone && <div className="truncate text-[9px] text-slate-500">📞 {cl.telephone}</div>}
                      {cl.email && <div className="truncate text-[9px] text-slate-500">✉️ {cl.email}</div>}
                    </div>
                    <div className="text-[9px] font-bold text-secondary mt-2 uppercase tracking-wide">
                      {cl.type === 'personne_physique' ? 'Personne physique' : 'Personne morale'}
                    </div>
                  </div>
                );
              })}

              <div
                onClick={handleCreateNewClient}
                className={`border-2 border-dashed rounded-xl p-3.5 cursor-pointer text-center flex flex-col justify-center items-center gap-1 transition-all bg-white ${
                  selectedClientIndex === null && isNewClientMode
                    ? 'border-secondary bg-secondary/5 text-secondary' 
                    : 'border-slate-200 hover:border-slate-300 text-slate-400'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="text-[10px] font-bold">Nouveau Client</span>
              </div>
            </div>

            {clientSearchTerm && filteredClients.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-2">Aucun client trouvé pour cette recherche.</p>
            )}
            {!clientSearchTerm && (
              <p className="text-xs text-slate-400 text-center py-2">Saisissez un nom ou un critère de recherche pour afficher les résultats de votre base.</p>
            )}
          </div>

          {/* Active Client Summary (if selected from search and not in creation mode) */}
          {selectedClientIndex !== null && !isNewClientMode && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[9px] font-bold text-secondary uppercase tracking-wider block">Client existant sélectionné</span>
                <h4 className="font-sans text-sm font-black text-primary mt-0.5">
                  {beneficiary.type === 'personne_physique' ? `${beneficiary.prenom} ${beneficiary.nom}` : beneficiary.raisonSociale}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {beneficiary.adresse}, {beneficiary.codePostal} {beneficiary.ville}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-slate-400 font-medium">
                  {beneficiary.email && <span>✉️ {beneficiary.email}</span>}
                  {beneficiary.telephone && <span>📞 {beneficiary.telephone}</span>}
                  <span>📂 Type: {beneficiary.type === 'personne_physique' ? 'Personne physique' : 'Personne morale'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCreateNewClient}
                className="text-xs font-bold text-secondary hover:text-blue-600 underline shrink-0 bg-transparent border-none cursor-pointer"
              >
                Changer pour un nouveau client
              </button>
            </div>
          )}

          {/* Form inputs for active client */}
          {isNewClientMode && (
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Formulaire bénéficiaire</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Type Switch */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Type de bénéficiaire</label>
                <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setBeneficiary({ ...beneficiary, type: 'personne_physique' })}
                    className={`flex-1 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                      beneficiary.type === 'personne_physique' ? 'bg-secondary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Personne physique
                  </button>
                  <button
                    type="button"
                    onClick={() => setBeneficiary({ ...beneficiary, type: 'personne_morale' })}
                    className={`flex-1 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                      beneficiary.type === 'personne_morale' ? 'bg-secondary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Personne morale
                  </button>
                </div>
              </div>

              {/* Specific inputs */}
              {beneficiary.type === 'personne_physique' ? (
                <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Civilité</label>
                    <select
                      value={beneficiary.civility}
                      onChange={(e) => setBeneficiary({ ...beneficiary, civility: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-slate-50/50"
                    >
                      <option value="">-- Choisir --</option>
                      <option value="M.">M.</option>
                      <option value="Mme">Mme</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Prénom</label>
                    <input
                      type="text"
                      required
                      value={beneficiary.prenom}
                      onChange={(e) => setBeneficiary({ ...beneficiary, prenom: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-slate-50/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Nom</label>
                    <input
                      type="text"
                      required
                      value={beneficiary.nom}
                      onChange={(e) => setBeneficiary({ ...beneficiary, nom: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Type de personne morale</label>
                      <select
                        value={beneficiary.typePersonneMorale || 'entreprise'}
                        onChange={(e) => setBeneficiary({ ...beneficiary, typePersonneMorale: e.target.value as any })}
                        className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-slate-50/50"
                      >
                        <option value="entreprise">Entreprise / PME</option>
                        <option value="collectivite">Collectivité territoriale</option>
                        <option value="bailleur_social">Bailleur social</option>
                        <option value="copropriete">Copropriété</option>
                        <option value="sci">SCI</option>
                        <option value="association">Association</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Raison sociale</label>
                      <input
                        type="text"
                        required
                        value={beneficiary.raisonSociale}
                        onChange={(e) => setBeneficiary({ ...beneficiary, raisonSociale: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-slate-50/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">SIRET</label>
                      <input
                        type="text"
                        required
                        maxLength={14}
                        value={beneficiary.siret}
                        onChange={(e) => setBeneficiary({ ...beneficiary, siret: e.target.value.replace(/\D/g, '') })}
                        className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-slate-50/50"
                      />
                    </div>
                  </div>
                  
                  {/* Persona details for Personne morale */}
                  <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Civilité Signataire</label>
                      <select
                        value={beneficiary.civility}
                        onChange={(e) => setBeneficiary({ ...beneficiary, civility: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                      >
                        <option value="">-- Choisir --</option>
                        <option value="M.">M.</option>
                        <option value="Mme">Mme</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Prénom Signataire</label>
                      <input
                        type="text"
                        required
                        value={beneficiary.prenom}
                        onChange={(e) => setBeneficiary({ ...beneficiary, prenom: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Nom Signataire</label>
                      <input
                        type="text"
                        required
                        value={beneficiary.nom}
                        onChange={(e) => setBeneficiary({ ...beneficiary, nom: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Standard contact coordinates */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Adresse principale</label>
                <input
                  type="text"
                  required
                  value={beneficiary.adresse}
                  onChange={(e) => setBeneficiary({ ...beneficiary, adresse: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-slate-50/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Code Postal</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={beneficiary.codePostal}
                  onChange={(e) => setBeneficiary({ ...beneficiary, codePostal: e.target.value.replace(/\D/g, '') })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-slate-50/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Ville</label>
                <input
                  type="text"
                  required
                  value={beneficiary.ville}
                  onChange={(e) => setBeneficiary({ ...beneficiary, ville: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Adresse email</label>
                <input
                  type="email"
                  required
                  value={beneficiary.email}
                  onChange={(e) => setBeneficiary({ ...beneficiary, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-slate-50/50"
                />
              </div>

              {/* Téléphone portable / Téléphone fixe */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Téléphone portable (facultatif)</label>
                <input
                  type="tel"
                  placeholder="Ex: 06 12 34 56 78"
                  value={beneficiary.telephonePortable || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBeneficiary({ 
                      ...beneficiary, 
                      telephonePortable: val,
                      telephone: val || beneficiary.telephoneFixe || '' 
                    });
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-slate-50/50"
                />
                <p className="text-[10px] text-slate-400 italic">
                  Permet la signature électronique de l'AH.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Téléphone fixe (facultatif)</label>
                <input
                  type="tel"
                  placeholder="Ex: 01 12 34 56 78"
                  value={beneficiary.telephoneFixe || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBeneficiary({ 
                      ...beneficiary, 
                      telephoneFixe: val,
                      telephone: beneficiary.telephonePortable || val || '' 
                    });
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-slate-50/50"
                />
                <p className="text-[10px] text-slate-400 italic">
                  Alternative de contact fixe.
                </p>
              </div>

              {/* Obligation notice */}
              <div className="col-span-1 md:col-span-3 bg-blue-50/40 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-800">
                ⚠️ <strong>Note téléphonique :</strong> Au moins un des deux numéros (fixe ou portable) est obligatoire. Un numéro de téléphone portable valide est nécessaire pour activer la <strong>signature électronique</strong> sécurisée de l'Attestation sur l'Honneur (AH).
              </div>
              </div>
            </div>
          )}

          {/* Fiscal section (Only applicable to physical individuals) */}
          {(selectedClientIndex !== null || isNewClientMode) && beneficiary.type === 'personne_physique' && (
              <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Situation fiscale de mon client</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">La situation fiscale du client est-elle connue ?</span>
                    <div className="flex rounded bg-slate-200 p-0.5">
                      <button
                        type="button"
                        onClick={() => setBeneficiary({ ...beneficiary, situationFiscaleConnue: true })}
                        className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                          beneficiary.situationFiscaleConnue 
                            ? 'bg-secondary text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        type="button"
                        onClick={() => setBeneficiary({ ...beneficiary, situationFiscaleConnue: false })}
                        className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                          !beneficiary.situationFiscaleConnue 
                            ? 'bg-secondary text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>
                </div>

                {!beneficiary.situationFiscaleConnue ? (
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-amber-800 text-xs leading-relaxed">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong>Avertissement :</strong> En n'indiquant pas la situation fiscale de votre client, le système affectera par défaut le statut "Autres" (Classique). Ce client ne pourra pas bénéficier d'un éventuel bonus précarité majorant sa prime.
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    {/* Membres du foyer - Boutons de sélection */}
                    <div className="space-y-1.5 col-span-1 md:col-span-3">
                      <label className="block text-xs font-bold text-slate-700">Membres du foyer</label>
                      <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              const newNbPersons = num;
                              const newAvis = Math.min(newNbPersons, beneficiary.nombreAvisImposition || 1);
                              
                              const additionalCount = Math.max(0, newAvis - 2);
                              let newTitulaires = [...(beneficiary.titulairesSupplementaires || [])];
                              if (newTitulaires.length < additionalCount) {
                                  while (newTitulaires.length < additionalCount) {
                                    newTitulaires.push({ nom: '', prenom: '' });
                                  }
                              } else if (newTitulaires.length > additionalCount) {
                                newTitulaires = newTitulaires.slice(0, additionalCount);
                              }

                              setBeneficiary({ 
                                ...beneficiary, 
                                nombrePersonnesFoyer: newNbPersons,
                                nombreAvisImposition: newAvis,
                                titulairesSupplementaires: newTitulaires
                              });
                            }}
                            className={`w-9 h-9 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                              beneficiary.nombrePersonnesFoyer === num
                                ? 'bg-secondary text-white border-secondary'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Nombre d'avis d'imposition - Boutons de sélection */}
                    <div className="space-y-1.5 col-span-1 md:col-span-3">
                      <label className="block text-xs font-bold text-slate-700">Nombre d'avis d'imposition</label>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: beneficiary.nombrePersonnesFoyer || 1 }, (_, i) => i + 1).map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              const additionalCount = Math.max(0, num - 2);
                              let newTitulaires = [...(beneficiary.titulairesSupplementaires || [])];
                              if (newTitulaires.length < additionalCount) {
                                while (newTitulaires.length < additionalCount) {
                                  newTitulaires.push({ nom: '', prenom: '' });
                                }
                              } else if (newTitulaires.length > additionalCount) {
                                newTitulaires = newTitulaires.slice(0, additionalCount);
                              }
                              setBeneficiary({ 
                                ...beneficiary, 
                                nombreAvisImposition: num,
                                titulairesSupplementaires: newTitulaires
                              });
                            }}
                            className={`w-9 h-9 text-xs font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                              beneficiary.nombreAvisImposition === num
                                ? 'bg-secondary text-white border-secondary'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tranche de revenus - Boutons/Cards */}
                    <div className="space-y-1.5 col-span-1 md:col-span-3">
                      <label className="block text-xs font-bold text-slate-700">Tranche de revenus</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setBeneficiary({ ...beneficiary, trancheRevenus: 'tres_modeste' })}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            beneficiary.trancheRevenus === 'tres_modeste'
                              ? 'bg-secondary text-white border-secondary'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs font-bold uppercase tracking-wider">précaire</span>
                          <span className={`text-[10px] mt-1 ${beneficiary.trancheRevenus === 'tres_modeste' ? 'text-white/85' : 'text-slate-400'}`}>
                            Revenus très modestes (Plafond Bleu)
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBeneficiary({ ...beneficiary, trancheRevenus: 'modeste' })}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            beneficiary.trancheRevenus === 'modeste'
                              ? 'bg-secondary text-white border-secondary'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs font-bold uppercase tracking-wider">Modeste</span>
                          <span className={`text-[10px] mt-1 ${beneficiary.trancheRevenus === 'modeste' ? 'text-white/85' : 'text-slate-400'}`}>
                            Revenus modestes (Plafond Jaune)
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBeneficiary({ ...beneficiary, trancheRevenus: 'autres' })}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            beneficiary.trancheRevenus === 'autres'
                              ? 'bg-secondary text-white border-secondary'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs font-bold uppercase tracking-wider">Classique</span>
                          <span className={`text-[10px] mt-1 ${beneficiary.trancheRevenus === 'autres' ? 'text-white/85' : 'text-slate-400'}`}>
                            Autres tranches (Plafond Violet / Rose)
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                  {/* Avis d'imposition supplémentaires (> 2) (rendered inside the main fiscal card, visible if situation is known and count > 2) */}
                  {beneficiary.situationFiscaleConnue && (beneficiary.nombreAvisImposition || 1) > 2 && (
                    <div className="col-span-1 md:col-span-3 space-y-4 p-4 bg-amber-50/30 border border-amber-100 rounded-xl mt-4">
                      <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                        ⚠️ Déclarant(s) pour avis d'imposition supplémentaires
                      </h5>
                      <p className="text-[11px] text-amber-800">
                        Veuillez renseigner le prénom et le nom du ou des co-déclarants pour chaque avis d'imposition supplémentaire (à partir du 3ème).
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: (beneficiary.nombreAvisImposition || 1) - 2 }).map((_, idx) => {
                          const noticeIndex = idx + 3;
                          const arrayIdx = idx;
                          const currentDeclarant = (beneficiary.titulairesSupplementaires || [])[arrayIdx] || { nom: '', prenom: '' };

                          return (
                            <div key={noticeIndex} className="bg-white p-3.5 rounded-lg border border-slate-200/60 space-y-3">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                                Déclarant(s) - Avis d'imposition n°{noticeIndex}
                              </span>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="block text-[10px] font-bold text-slate-600">Prénom</label>
                                  <input
                                    type="text"
                                    required
                                    value={currentDeclarant.prenom}
                                    onChange={(e) => {
                                      const newTitulaires = [...(beneficiary.titulairesSupplementaires || [])];
                                      while (newTitulaires.length <= arrayIdx) {
                                        newTitulaires.push({ nom: '', prenom: '' });
                                      }
                                      newTitulaires[arrayIdx] = { ...newTitulaires[arrayIdx], prenom: e.target.value };
                                      setBeneficiary({ ...beneficiary, titulairesSupplementaires: newTitulaires });
                                    }}
                                    className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none bg-slate-50/50"
                                    placeholder="Prénom"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="block text-[10px] font-bold text-slate-600">Nom</label>
                                  <input
                                    type="text"
                                    required
                                    value={currentDeclarant.nom}
                                    onChange={(e) => {
                                      const newTitulaires = [...(beneficiary.titulairesSupplementaires || [])];
                                      while (newTitulaires.length <= arrayIdx) {
                                        newTitulaires.push({ nom: '', prenom: '' });
                                      }
                                      newTitulaires[arrayIdx] = { ...newTitulaires[arrayIdx], nom: e.target.value };
                                      setBeneficiary({ ...beneficiary, titulairesSupplementaires: newTitulaires });
                                    }}
                                    className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none bg-slate-50/50"
                                    placeholder="Nom"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tableau dynamique des revenus ANAH (Affiche le barème des plafonds, toujours visible !) */}
                  <div className="col-span-1 md:col-span-3 bg-white border border-slate-150 rounded-xl p-4 mt-4">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-secondary" /> Barème des plafonds de ressources ANAH ({currentRegion === 'idf' ? 'Île-de-France' : 'Autres Régions'})
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 font-bold">
                            <th className="p-2.5">Personnes au foyer</th>
                            <th className="p-2.5">précaire (Très Modeste)</th>
                            <th className="p-2.5">Modeste</th>
                            <th className="p-2.5">Classique (Autres)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[1, 2, 3, 4, 5, Math.max(6, beneficiary.nombrePersonnesFoyer || 1)].map((num) => {
                            const isActive = (beneficiary.nombrePersonnesFoyer || 1) === num || (num === Math.max(6, beneficiary.nombrePersonnesFoyer || 1) && (beneficiary.nombrePersonnesFoyer || 1) >= 6);
                            const { tresModeste, modeste } = getAnahCeilings(num, currentRegion === 'idf');
                            
                            return (
                              <tr
                                key={num}
                                className={`border-b border-slate-100 transition-colors ${
                                  isActive 
                                    ? 'bg-secondary/15 font-black text-primary border-l-4 border-l-secondary' 
                                    : 'text-slate-600 hover:bg-slate-50/50'
                                }`}
                              >
                                <td className="p-2.5">
                                  {num === Math.max(6, beneficiary.nombrePersonnesFoyer || 1) && num >= 6 
                                    ? `${beneficiary.nombrePersonnesFoyer} personnes` 
                                    : `${num} ${num === 1 ? 'personne' : 'personnes'}`}
                                  {isActive && <span className="ml-2 text-[10px] text-secondary font-bold">(Foyer actuel)</span>}
                                </td>
                                <td className="p-2.5">≤ {tresModeste.toLocaleString('fr-FR')} €</td>
                                <td className="p-2.5">≤ {modeste.toLocaleString('fr-FR')} €</td>
                                <td className="p-2.5">&gt; {modeste.toLocaleString('fr-FR')} €</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      * Les revenus pris en compte correspondent au Revenu Fiscal de Référence (RFR) indiqué sur l'avis d'imposition de l'année N-1.
                    </p>
                  </div>
                </div>
              )}

          {/* Stepper buttons */}
          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handlePrevStep}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold py-2.5 px-6 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <button
              onClick={handleNextStep}
              disabled={!isStep1Valid}
              className={`font-semibold py-2.5 px-6 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                isStep1Valid
                  ? 'bg-secondary text-white hover:bg-opacity-95 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Étape suivante <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Contact pour le contrôle */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl border border-black/10 shadow-xs p-6 md:p-8 space-y-6 fade-in">
          <div>
            <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Étape 2 : Contact</span>
            <h3 className="font-sans text-xl md:text-2xl text-primary font-black tracking-tight mt-1">Personne à contacter pour le contrôle des travaux</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Spécifiez l'identité de l'interlocuteur privilégié pour les inspections et audits réglementaires réglementaires.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 rounded-xl p-4">
            <label className={`border rounded-lg p-4 bg-white cursor-pointer transition-all flex items-start gap-3 ${
              contact.type === 'beneficiaire'
                ? 'border-secondary ring-1 ring-secondary'
                : 'border-slate-200 hover:border-slate-300'
            }`}>
              <input
                type="radio"
                name="contactType"
                checked={contact.type === 'beneficiaire'}
                onChange={() => setContact({ ...contact, type: 'beneficiaire' })}
                className="mt-1 accent-secondary"
              />
              <div>
                <span className="font-bold text-slate-800 text-xs block">Le Bénéficiaire</span>
                <span className="text-[10px] text-slate-400">Le client principal déclaré à l'étape précédente.</span>
              </div>
            </label>

            {beneficiary.type === 'personne_morale' && (
              <label className={`border rounded-lg p-4 bg-white cursor-pointer transition-all flex items-start gap-3 ${
                contact.type === 'signataire'
                  ? 'border-secondary ring-1 ring-secondary'
                  : 'border-slate-200 hover:border-slate-300'
              }`}>
                <input
                  type="radio"
                  name="contactType"
                  checked={contact.type === 'signataire'}
                  onChange={() => setContact({ ...contact, type: 'signataire' })}
                  className="mt-1 accent-secondary"
                />
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Le Signataire</span>
                  <span className="text-[10px] text-slate-400">Le représentant légal de la personne morale.</span>
                </div>
              </label>
            )}

            <label className={`border rounded-lg p-4 bg-white cursor-pointer transition-all flex items-start gap-3 ${
              contact.type === 'autre'
                ? 'border-secondary ring-1 ring-secondary'
                : 'border-slate-200 hover:border-slate-300'
            }`}>
              <input
                type="radio"
                name="contactType"
                checked={contact.type === 'autre'}
                onChange={() => setContact({
                  type: 'autre',
                  nom: '',
                  prenom: '',
                  email: '',
                  telephone: '',
                  role: ''
                })}
                className="mt-1 accent-secondary"
              />
              <div>
                <span className="font-bold text-slate-800 text-xs block">Une autre personne</span>
                <span className="text-[10px] text-slate-400">Un gestionnaire, un locataire, ou un tiers dédié.</span>
              </div>
            </label>
          </div>

          {/* Form details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-slate-100 rounded-xl">
            {contact.type !== 'autre' ? (
              <div className="col-span-1 md:col-span-2 text-xs text-slate-500 leading-relaxed bg-blue-50/50 p-4 border border-blue-100 rounded-lg">
                <strong>Pré-remplissage automatique :</strong> Les informations du contact de contrôle sont synchronisées avec le bénéficiaire en lecture seule.
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3 pt-3 border-t border-blue-100 text-primary font-bold">
                  <div>Nom : {contact.prenom} {contact.nom}</div>
                  <div>Email : {contact.email}</div>
                  <div>Tél : {contact.telephone}</div>
                  <div>Rôle : {contact.type === 'beneficiaire' ? 'Bénéficiaire' : 'Signataire'}</div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Prénom</label>
                  <input
                    type="text"
                    required
                    value={contact.prenom}
                    onChange={(e) => setContact({ ...contact, prenom: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Nom</label>
                  <input
                    type="text"
                    required
                    value={contact.nom}
                    onChange={(e) => setContact({ ...contact, nom: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Adresse email</label>
                  <input
                    type="email"
                    required
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Téléphone portable</label>
                  <input
                    type="tel"
                    required
                    value={contact.telephone}
                    onChange={(e) => setContact({ ...contact, telephone: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1.5 col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700">Rôle / Lien avec le client</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maître d'œuvre, Fils, Locataire principal"
                    value={contact.role || ''}
                    onChange={(e) => setContact({ ...contact, role: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-slate-50/50"
                  />
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handlePrevStep}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold py-2.5 px-6 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <button
              onClick={handleNextStep}
              disabled={!isStep2Valid}
              className={`font-semibold py-2.5 px-6 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                isStep2Valid
                  ? 'bg-secondary text-white hover:bg-opacity-95 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Étape suivante <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Objet et Bâtiment (Étape 2 / 2bis) */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl border border-black/10 shadow-xs p-6 md:p-8 space-y-6 fade-in">
          <div>
            <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Étape 3 : Objet du dossier</span>
            <h3 className="font-sans text-xl md:text-2xl text-primary font-black tracking-tight mt-1">
              {objet.type === 'renovation_batiment' ? 'Objet et informations sur le bâtiment' : 'Objet du dossier'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Spécifiez l'objet du dossier ainsi que le type de bâtiment où se réalisent les opérations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 2: Objet du dossier */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Objet du dossier</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setObjet({ type: 'renovation_batiment' })}
                  className={`border rounded-xl p-4 cursor-pointer text-left transition-all flex flex-col justify-between ${
                    objet.type === 'renovation_batiment' 
                      ? 'border-secondary bg-secondary/5 ring-1 ring-secondary' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <FileText className="w-5 h-5 text-primary mb-2" />
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Rénovation de bâtiment</span>
                    <span className="text-[10px] text-slate-400">Maisons, appartements, tertiaires...</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setObjet({ type: 'transport' })}
                  className={`border rounded-xl p-4 cursor-pointer text-left transition-all flex flex-col justify-between ${
                    objet.type === 'transport' 
                      ? 'border-secondary bg-secondary/5 ring-1 ring-secondary' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <FileText className="w-5 h-5 text-primary mb-2" />
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">Opération liée au transport</span>
                    <span className="text-[10px] text-slate-400">Flotte, logistique, ferroviaire...</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2bis: Type de bâtiment */}
            {objet.type === 'renovation_batiment' && (
              <div className="space-y-3 col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700">Type de bâtiment</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(beneficiary.type === 'personne_physique' ? [
                    { value: 'maison', label: 'Maison individuelle' },
                    { value: 'appartement', label: 'Appartement' },
                    { value: 'batiment_tertiaire', label: 'Bâtiment tertiaire' }
                  ] : [
                    { value: 'batiment_residentiel_collectif', label: 'Bâtiment résidentiel collectif' },
                    { value: 'maison', label: 'Maison individuelle' },
                    { value: 'appartement', label: 'Appartement' },
                    { value: 'batiment_tertiaire', label: 'Bâtiment tertiaire' },
                    { value: 'batiment_agricole', label: 'Bâtiment agricole' },
                    { value: 'batiment_industriel', label: 'Bâtiment industriel' }
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setBatiment({ ...batiment, type: opt.value as any })}
                      className={`p-3 text-center border rounded-xl font-bold text-xs transition-all cursor-pointer flex flex-col items-center justify-center min-h-[50px] ${
                        batiment.type === opt.value
                          ? 'border-secondary bg-secondary/5 text-secondary ring-1 ring-secondary'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Conditional properties */}
          {objet.type === 'renovation_batiment' && (
            <div className="space-y-4 bg-slate-50/50 rounded-xl p-5 border border-slate-100">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Champs complémentaires obligatoires</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Nom batiment si autre que maison/appartement */}
                {batiment.type !== 'maison' && batiment.type !== 'appartement' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Nom du bâtiment / Copropriété</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Résidence Fleurie - Bâtiment C"
                      value={batiment.nomBatiment || ''}
                      onChange={(e) => setBatiment({ ...batiment, nomBatiment: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary bg-white"
                    />
                  </div>
                )}

                {/* 2. Bailleur social + résidentiel collectif */}
                {batiment.type === 'batiment_residentiel_collectif' && beneficiary.typePersonneMorale === 'bailleur_social' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Nombre de logements concernés</label>
                      <input
                        type="number"
                        min={1}
                        value={batiment.nombreLogementsConcerne || ''}
                        onChange={(e) => setBatiment({ ...batiment, nombreLogementsConcerne: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Logements sous convention bailleur social</label>
                      <input
                        type="number"
                        min={1}
                        value={batiment.nombreLogementsConventionnesBailleur || ''}
                        onChange={(e) => setBatiment({ ...batiment, nombreLogementsConventionnesBailleur: parseInt(e.target.value) || 0 })}
                        className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary bg-white"
                      />
                    </div>
                  </>
                )}

                {/* 3. Même adresse ? */}
                <div className="space-y-1.5 col-span-1 md:col-span-2">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-700">Les travaux ont-ils lieu à la même adresse que le bénéficiaire ?</span>
                    <div className="flex rounded bg-slate-200 p-0.5">
                      <button
                        type="button"
                        onClick={() => setBatiment({ ...batiment, memeAdresseBeneficiaire: true })}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          batiment.memeAdresseBeneficiaire ? 'bg-secondary text-white' : 'text-slate-500 hover:text-slate-600'
                        }`}
                      >
                        Oui
                      </button>
                      <button
                        type="button"
                        onClick={() => setBatiment({ ...batiment, memeAdresseBeneficiaire: false })}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                          !batiment.memeAdresseBeneficiaire ? 'bg-secondary text-white' : 'text-slate-500 hover:text-slate-600'
                        }`}
                      >
                        Non
                      </button>
                    </div>
                  </div>
                </div>

                {/* If different address works */}
                {!batiment.memeAdresseBeneficiaire && (
                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1.5 col-span-1 md:col-span-3">
                      <label className="block text-xs font-bold text-slate-700">Adresse du lieu des travaux</label>
                      <input
                        type="text"
                        required
                        value={batiment.adresseTravaux || ''}
                        onChange={(e) => setBatiment({ ...batiment, adresseTravaux: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Code postal travaux</label>
                      <input
                        type="text"
                        required
                        value={batiment.codePostalTravaux || ''}
                        onChange={(e) => setBatiment({ ...batiment, codePostalTravaux: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">Ville travaux</label>
                      <input
                        type="text"
                        required
                        value={batiment.villeTravaux || ''}
                        onChange={(e) => setBatiment({ ...batiment, villeTravaux: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary bg-white"
                      />
                    </div>

                    {beneficiary.type === 'personne_physique' && (
                      <div className="space-y-1.5 col-span-1 md:col-span-3 flex justify-between items-center border-b border-slate-100 pb-2 pt-2">
                        <span className="text-xs font-bold text-slate-700">Il s'agit d'une résidence secondaire ?</span>
                        <div className="flex rounded bg-slate-200 p-0.5">
                          <button
                            type="button"
                            onClick={() => setBatiment({ ...batiment, residenceSecondaire: true })}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                              batiment.residenceSecondaire ? 'bg-secondary text-white' : 'text-slate-500 hover:text-slate-600'
                            }`}
                          >
                            Oui
                          </button>
                          <button
                            type="button"
                            onClick={() => setBatiment({ ...batiment, residenceSecondaire: false })}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                              !batiment.residenceSecondaire ? 'bg-secondary text-white' : 'text-slate-500 hover:text-slate-600'
                            }`}
                          >
                            Non
                          </button>
                        </div>
                      </div>
                    )}

                    {beneficiary.type === 'personne_physique' && !batiment.residenceSecondaire && (
                      <div className="space-y-1.5 col-span-1 md:col-span-3">
                        <label className="block text-xs font-bold text-slate-700">Nom et prénom du locataire occupant (facultatif)</label>
                        <input
                          type="text"
                          placeholder="Laisser vide s'il s'agit d'un logement vacant"
                          value={batiment.locataireNomPrenom || ''}
                          onChange={(e) => setBatiment({ ...batiment, locataireNomPrenom: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary bg-white"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handlePrevStep}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold py-2.5 px-6 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <button
              onClick={handleNextStep}
              disabled={!isStep3Valid}
              className={`font-semibold py-2.5 px-6 rounded-lg text-xs transition-all flex items-center gap-1.5 ${
                isStep3Valid
                  ? 'bg-secondary text-white hover:bg-opacity-95 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Étape suivante <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Travaux (Étape 3) */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl border border-black/10 shadow-xs p-6 md:p-8 space-y-6 fade-in">
          <div>
            <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Étape 4 : Aides</span>
            <h3 className="font-sans text-xl md:text-2xl text-primary font-black tracking-tight mt-1">Sélectionner les opérations</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Configurez le devis et attachez une ou plusieurs fiches d'opérations correspondantes.</p>
          </div>

          {/* Reference devis and dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Référence du devis</label>
              <input
                type="text"
                required
                placeholder="Ex: QT-2026-88"
                value={referenceDevis}
                onChange={(e) => setReferenceDevis(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Date d'édition du devis</label>
              <input
                type="date"
                required
                value={dateDevis}
                onChange={(e) => setDateDevis(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Date prévue de réalisation</label>
              <input
                type="text"
                required
                placeholder="Ex: 10/2026 ou 15/10/2026"
                value={dateRealisationPrevue}
                onChange={(e) => setDateRealisationPrevue(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Chantiers block */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Opérations du dossier ({chantiers.length})</h4>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Ajouts rapides :</span>
                  {[
                    { code: 'BAR-TH-104', label: 'PAC Air/Eau' },
                    { code: 'BAR-EN-101', label: 'Combles' },
                    { code: 'BAR-EN-102', label: 'Isolation Murs' }
                  ].map(item => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => handleAddChantier(item.code)}
                      className="bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/20 font-bold px-2 py-0.5 rounded-full text-[10px] transition-all cursor-pointer flex items-center gap-0.5"
                    >
                      <Plus className="w-2.5 h-2.5" /> {item.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto items-center relative">
                <div className="relative w-64 md:w-80">
                  <div className="relative">
                    <input
                      type="text"
                      value={ficheSearchTerm}
                      placeholder="Rechercher une fiche (ex: BAR-TH-104)..."
                      onChange={(e) => {
                        setFicheSearchTerm(e.target.value);
                        setShowFicheDropdown(true);
                      }}
                      onFocus={() => setShowFicheDropdown(true)}
                      className="w-full rounded-lg border border-slate-200 pl-3 pr-8 py-1.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none bg-white"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  
                  {showFicheDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowFicheDropdown(false)}
                      />
                      <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg z-20 divide-y divide-slate-100">
                        {CEE_SHEETS_LIST.filter(sh => {
                          const term = ficheSearchTerm.toLowerCase();
                          return sh.code.toLowerCase().includes(term) || 
                                 sh.shortDescription.toLowerCase().includes(term) ||
                                 sh.title.toLowerCase().includes(term);
                        }).length === 0 ? (
                          <div className="p-3 text-xs text-slate-400 text-center">Aucune fiche trouvée</div>
                        ) : (
                          CEE_SHEETS_LIST.filter(sh => {
                            const term = ficheSearchTerm.toLowerCase();
                            return sh.code.toLowerCase().includes(term) || 
                                   sh.shortDescription.toLowerCase().includes(term) ||
                                   sh.title.toLowerCase().includes(term);
                          }).map(sh => (
                            <button
                              key={sh.code}
                              type="button"
                              onClick={() => {
                                setActiveFicheCode(sh.code);
                                setFicheSearchTerm(`${sh.code} — ${sh.shortDescription}`);
                                setShowFicheDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-slate-50 flex flex-col ${
                                activeFicheCode === sh.code ? 'bg-secondary/10 text-secondary font-semibold' : 'text-slate-700'
                              }`}
                            >
                              <span className="font-mono font-bold text-[10px]">{sh.code}</span>
                              <span className="truncate">{sh.shortDescription}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={() => handleAddChantier()}
                  className="bg-secondary hover:bg-opacity-95 text-white font-semibold py-1.5 px-3 rounded-lg text-xs flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" /> Ajouter
                </button>
              </div>
            </div>

            {chantiers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 border border-dashed rounded-xl">
                Aucune opération configurée. Utilisez les boutons ou la recherche ci-dessus pour ajouter des travaux d'économies d'énergie.
              </div>
            ) : (
              <div className="space-y-6">
                {chantiers.map((ch, cIdx) => {
                  const sheet = CEE_SHEETS_MAP[ch.ficheCode];
                  if (!sheet) return null;

                  return (
                    <div key={ch.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      {/* Header of specific chantier */}
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                        <div>
                          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded font-mono uppercase">{ch.ficheCode}</span>
                          <span className="font-bold text-slate-800 text-xs ml-2">{sheet.shortDescription}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              // Duplicate chantier
                              const duplicated: ChantierItem = {
                                ...ch,
                                id: 'dup-' + Math.random().toString(36).substring(2, 9)
                              };
                              setChantiers([...chantiers, duplicated]);
                            }}
                            className="text-slate-500 hover:text-primary p-1 rounded hover:bg-white text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" /> Dupliquer
                          </button>
                          <button
                            onClick={() => handleRemoveChantier(ch.id)}
                            className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-white cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Rappel des règles de la fiche - Placed BEFORE inputs */}
                      {sheet.rules && sheet.rules.length > 0 && (
                        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 text-xs text-slate-700">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Rappel des règles de la fiche</span>
                          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                            {sheet.rules.map((rule, rIdx) => (
                              <li key={rIdx} className="leading-tight pl-1 -indent-3.5 ml-3.5 text-slate-500">{rule}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Properties & product configuration inputs */}
                      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 1. Form variables */}
                        <div className="space-y-3">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase">Données fiches</h5>
                          {sheet.properties.map(p => (
                            <div key={p.key} className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-700">{p.label}</label>
                              {p.type === 'select' ? (
                                <select
                                  value={ch.properties[p.key] ?? ''}
                                  onChange={(e) => handleChantierPropertyChange(ch.id, p.key, e.target.value)}
                                  className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:ring-1 focus:ring-primary focus:outline-none bg-white"
                                >
                                  {p.options?.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="number"
                                  placeholder={p.placeholder}
                                  value={ch.properties[p.key] ?? ''}
                                  onChange={(e) => handleChantierPropertyChange(ch.id, p.key, e.target.value)}
                                  className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:ring-1 focus:ring-primary focus:outline-none bg-white"
                                />
                              )}
                            </div>
                          ))}
                        </div>

                        {/* 2. Builder/Intervenant & Product properties */}
                        <div className="space-y-3">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase">Intervenant & Produit</h5>
                          
                          {/* Builder Choice */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-700">Professionnel réalisant l'opération</label>
                            <select
                              value={ch.intervenantType}
                              onChange={(e) => handleChantierPropertyChange(ch.id, 'intervenantType', e.target.value)}
                              className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none bg-white"
                            >
                              <option value="societe">Notre société (Partenaire principal)</option>
                              <option value="autre">Autre sous-traitant / installateur</option>
                            </select>
                          </div>

                          {/* If other intervenant */}
                          {ch.intervenantType === 'autre' && (
                            <div className="space-y-2 bg-slate-50 p-2.5 rounded border border-slate-100">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-600">Sélection de l'installateur</span>
                                <button
                                  type="button"
                                  onClick={() => setShowNewIntervenantModal(true)}
                                  className="text-[9px] text-primary font-bold hover:underline cursor-pointer"
                                >
                                  + Créer tiers
                                </button>
                              </div>
                              <select
                                value={ch.intervenantId || ''}
                                onChange={(e) => handleChantierPropertyChange(ch.id, 'intervenantId', e.target.value)}
                                className="w-full rounded border border-slate-200 px-2 py-1 text-[11px] bg-white"
                              >
                                <option value="">Choisir un tiers qualifié...</option>
                                {intervenantsList.map(int => (
                                  <option key={int.id} value={int.id}>{int.raisonSociale} (SIRET {int.siret})</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Product reference details */}
                          <div className="space-y-1 pt-1">
                            <label className="text-[10px] font-semibold text-slate-700">Marque matériel</label>
                            <select
                              value={ch.marque}
                              onChange={(e) => handleChantierSelectChange(ch.id, 'marque', e.target.value)}
                              className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none bg-white"
                            >
                              {Object.keys(BRANDS).map(b => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-700">Référence produit</label>
                            <select
                              value={ch.referenceProduit}
                              onChange={(e) => handleChantierSelectChange(ch.id, 'referenceProduit', e.target.value)}
                              className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:outline-none bg-white"
                            >
                              {(BRANDS[ch.marque as keyof typeof BRANDS] || []).map(ref => (
                                <option key={ref} value={ref}>{ref}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* 3. Outcomes results inside chantier box */}
                        <div className="bg-slate-50 rounded-xl p-4 flex flex-col justify-between border border-slate-100">
                          <div className="space-y-4">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Éligibilité</span>
                              <div className="mt-2">
                                {ch.volumeCumac > 0 ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Conforme aux exigences
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Non éligible (Vérifier caractéristiques)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {ch.volumeCumac === 0 && (
                            <div className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 leading-relaxed mt-2">
                              <strong>Attention :</strong> Caractéristiques techniques insuffisantes pour valider l'éligibilité de cette fiche CEE.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handlePrevStep}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-250 text-slate-700 font-semibold py-2.5 px-6 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <button
              onClick={handleNextStep}
              className="bg-secondary hover:bg-opacity-95 text-white font-semibold py-2.5 px-6 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5"
            >
              Étape suivante <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Calcul de la prime & partage (Étape 4) */}
      {currentStep === 5 && (
        <div className="bg-white rounded-3xl border border-black/10 shadow-xs p-6 md:p-8 space-y-6 fade-in">
          <div>
            <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Étape 5 : Calcul & Répartition de la prime</span>
            <h3 className="font-sans text-xl md:text-2xl text-primary font-black tracking-tight mt-1">Calcul de la prime et mode de répartition</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Déterminez comment répartir la prime totale générée entre la part client (déduite du devis) et la part revenant à votre société.</p>
          </div>

          {/* Sharing mode switch */}
          <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50 max-w-md">
            <button
              type="button"
              onClick={() => setRepartitionMode('global')}
              className={`flex-1 py-2 text-center text-xs font-bold rounded cursor-pointer transition-all ${
                repartitionMode === 'global' ? 'bg-secondary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Répartition globale (%)
            </button>
            <button
              type="button"
              onClick={() => setRepartitionMode('independant')}
              className={`flex-1 py-2 text-center text-xs font-bold rounded cursor-pointer transition-all ${
                repartitionMode === 'independant' ? 'bg-secondary text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Répartition par chantiers
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left/Middle Column: Config sliders */}
            <div className="lg:col-span-2 bg-slate-50/50 rounded-xl border border-slate-100 p-5 space-y-6">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Part allouée au client</h4>
              
              {repartitionMode === 'global' ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Pourcentage global reversé au client</span>
                    <span className="text-primary font-bold">{repartitionGlobalPct} %</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={repartitionGlobalPct}
                    onChange={(e) => setRepartitionGlobalPct(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-secondary"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>50% (Minimum légal OdiCEE)</span>
                    <span>100% (Intégralité reversée)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {chantiers.map(ch => {
                    const currentAmt = repartitionChantiersAmount[ch.id] !== undefined 
                      ? repartitionChantiersAmount[ch.id] 
                      : Math.round(ch.prime * 0.8);
                    const minAmt = Math.round(ch.prime * 0.5);
                    const maxAmt = Math.round(ch.prime);
                    
                    return (
                      <div key={ch.id} className="bg-white border border-slate-150 rounded-2xl p-5 space-y-4 shadow-xs">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black bg-primary/10 text-primary uppercase font-mono">
                              {ch.ficheCode}
                            </span>
                            <h5 className="text-xs font-bold text-slate-800 mt-1 leading-tight">{ch.ficheTitle}</h5>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Prime brute générée</span>
                            <span className="text-xs font-extrabold text-primary font-mono">
                              {ch.prime.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          {/* Slider control */}
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">
                              Ajuster la part client
                            </label>
                            <input
                              type="range"
                              min={minAmt}
                              max={maxAmt}
                              value={currentAmt}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setRepartitionChantiersAmount({
                                  ...repartitionChantiersAmount,
                                  [ch.id]: val
                                });
                              }}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-secondary"
                            />
                            <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                              <span>Min légal : {minAmt.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} (50%)</span>
                              <span>Max : {maxAmt.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} (100%)</span>
                            </div>
                          </div>

                          {/* Numeric input control */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">
                              Saisir le montant (€)
                            </label>
                            <div className="relative rounded-md shadow-xs">
                              <input
                                type="number"
                                min={minAmt}
                                max={maxAmt}
                                value={currentAmt}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  setRepartitionChantiersAmount({
                                    ...repartitionChantiersAmount,
                                    [ch.id]: isNaN(val) ? 0 : val
                                  });
                                }}
                                onBlur={() => {
                                  const val = repartitionChantiersAmount[ch.id];
                                  const constrained = Math.max(minAmt, Math.min(maxAmt, val !== undefined ? val : Math.round(ch.prime * 0.8)));
                                  setRepartitionChantiersAmount({
                                    ...repartitionChantiersAmount,
                                    [ch.id]: Math.round(constrained)
                                  });
                                }}
                                className="block w-full pr-7 pl-3 py-1.5 text-xs font-bold font-mono border border-slate-300 rounded-lg focus:ring-secondary focus:border-secondary text-primary"
                              />
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-slate-400 text-[10px] font-bold font-mono">€</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Breakdown summary for this specific item */}
                        <div className="flex justify-between items-center text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600">
                          <div>
                            <span className="font-semibold text-secondary">Part client :</span>{' '}
                            <span className="font-bold font-mono text-slate-800">
                              {currentAmt.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-primary">Part pro :</span>{' '}
                            <span className="font-bold font-mono text-slate-800">
                              {Math.max(0, ch.prime - currentAmt).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-blue-800 text-xs leading-relaxed">
                <ShieldAlert className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Avis réglementaire OdiCEE :</strong> Conformément aux règles éthiques et légales, la part allouée au bénéficiaire final (client) ne peut pas être inférieure à 50% de la prime CEE générée.
                </div>
              </div>
            </div>

            {/* Right Column: Calculations aggregation summary */}
            <div className="bg-primary text-white rounded-3xl p-6 shadow-xs space-y-6">
              <div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Valorisation financière</span>
                <h4 className="font-sans text-xl font-black text-white mt-1">Bilan financier</h4>
              </div>

              <div className="space-y-4 text-xs">
                {/* Details of each aid premium in the valorisation cartouche */}
                <div className="pt-1 pb-3 border-b border-white/10 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Primes par aide</span>
                  {chantiers.map(ch => (
                    <div key={ch.id} className="flex justify-between items-center text-[11px] text-slate-300">
                      <span className="truncate max-w-[150px] font-medium" title={`${ch.ficheCode} - ${ch.ficheTitle}`}>
                        {ch.ficheCode}
                      </span>
                      <span className="font-bold text-white font-mono">
                        {ch.prime.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between py-1.5 border-b border-white/10 text-slate-300">
                  <span>Volume cumac total</span>
                  <span className="font-mono font-bold text-white">{totalVolumeCumac} MWh</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10 text-slate-300">
                  <span>Prime globale brute</span>
                  <span className="font-bold text-white">
                    {totalPrimeValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>

                <div className="py-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Part client (Déduction devis)</span>
                  <span className="text-2xl font-extrabold text-secondary tracking-tight block mt-0.5">
                    {sharePartBeneficiaire.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>

                <div className="py-2 border-t border-white/10">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Part professionnelle (votre commission)</span>
                  <span className="text-lg font-bold text-white block mt-0.5">
                    {sharePartProfessionnelle.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handlePrevStep}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold py-2.5 px-6 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <button
              onClick={handleNextStep}
              className="bg-secondary hover:bg-opacity-95 text-white font-semibold py-2.5 px-6 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5"
            >
              Étape suivante <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Récapitulatif (Étape 5) */}
      {currentStep === 6 && (
        <div className="bg-white rounded-3xl border border-black/10 shadow-xs p-6 md:p-8 space-y-6 fade-in">
          <div>
            <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Étape 6 : Récapitulatif</span>
            <h3 className="font-sans text-xl md:text-2xl text-primary font-black tracking-tight mt-1">Récapitulatif de saisie</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Veuillez vérifier l'ensemble des informations saisies avant de finaliser la prime et le type de dossier.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Beneficiary summary */}
            <div className="border border-slate-150 rounded-xl p-5 space-y-3 bg-slate-50/50">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-primary uppercase">Bénéficiaire & Contact</span>
                <button onClick={() => setCurrentStep(1)} className="text-[10px] text-primary hover:underline font-bold cursor-pointer">Modifier</button>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600">
                <p><strong>Nom :</strong> {beneficiary.civility} {beneficiary.prenom} {beneficiary.nom}</p>
                {beneficiary.type === 'personne_morale' && <p><strong>Société :</strong> {beneficiary.raisonSociale} (SIRET {beneficiary.siret})</p>}
                <p><strong>Adresse :</strong> {beneficiary.adresse}, {beneficiary.codePostal} {beneficiary.ville}</p>
                <p><strong>Email / Tél :</strong> {beneficiary.email} / {beneficiary.telephone}</p>
                <p>
                  <strong>Situation fiscale :</strong> {beneficiary.situationFiscaleConnue ? `Oui (${beneficiary.trancheRevenus?.toUpperCase().replace('_', ' ')})` : 'Non renseignée'}
                </p>
                <p className="pt-2 border-t border-slate-200/50 text-[11px]"><strong>Contact de contrôle :</strong> {contact.prenom} {contact.nom} ({contact.role || 'Client'})</p>
              </div>
            </div>

            {/* Box 2: Batiment & Devis summary */}
            <div className="border border-slate-150 rounded-xl p-5 space-y-3 bg-slate-50/50">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-primary uppercase">Bâtiment & Devis</span>
                <button onClick={() => setCurrentStep(3)} className="text-[10px] text-primary hover:underline font-bold cursor-pointer">Modifier</button>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600">
                <p><strong>Bâtiment :</strong> {batiment.type.toUpperCase().replace('_', ' ')}</p>
                <p><strong>Même adresse bénéficiaire :</strong> {batiment.memeAdresseBeneficiaire ? 'Oui' : 'Non'}</p>
                {!batiment.memeAdresseBeneficiaire && <p><strong>Adresse travaux :</strong> {batiment.adresseTravaux}, {batiment.codePostalTravaux} {batiment.villeTravaux}</p>}
                <p className="pt-2 border-t border-slate-200/50"><strong>Devis Réf :</strong> {referenceDevis}</p>
                <p><strong>Date devis :</strong> {dateDevis}</p>
                <p><strong>Réalisation prévue :</strong> {dateRealisationPrevue}</p>
              </div>
            </div>

            {/* Box 3: Calcul & Répartition summary */}
            <div className="border border-slate-150 rounded-xl p-5 space-y-3 bg-slate-50/50">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-primary uppercase">Calcul & Répartition</span>
                <button onClick={() => setCurrentStep(5)} className="text-[10px] text-primary hover:underline font-bold cursor-pointer">Modifier</button>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600">
                <p><strong>Mode :</strong> {repartitionMode === 'global' ? 'Répartition globale' : 'Répartition par chantiers'}</p>
                {repartitionMode === 'global' && <p><strong>Part client :</strong> {repartitionGlobalPct}%</p>}
                <p><strong>Volume cumac total :</strong> <span className="font-mono">{totalVolumeCumac} MWh</span></p>
                <p><strong>Prime brute totale :</strong> <span className="font-semibold">{totalPrimeValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span></p>
                <p className="text-secondary font-bold pt-2 border-t border-slate-200/50"><strong>Part client :</strong> {sharePartBeneficiaire.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
                <p className="text-primary font-bold"><strong>Part pro (commission) :</strong> {sharePartProfessionnelle.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
              </div>
            </div>
          </div>

          {/* List of operations summary */}
          <div className="border border-slate-150 rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-150 pb-2">
              <span className="text-xs font-bold text-primary uppercase">Détail des chantiers ({chantiers.length})</span>
              <button onClick={() => setCurrentStep(4)} className="text-[10px] text-primary hover:underline font-bold cursor-pointer">Modifier</button>
            </div>
            
            <div className="space-y-2">
              {chantiers.map(ch => (
                <div key={ch.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-mono font-bold">{ch.ficheCode}</span>
                    <span className="font-semibold">{ch.ficheTitle}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <span>{ch.volumeCumac} MWh cumac</span>
                    <span className="font-bold text-secondary">
                      {ch.prime.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handlePrevStep}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold py-2.5 px-6 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <button
              onClick={handleNextStep}
              className="bg-primary hover:bg-opacity-95 text-white font-semibold py-2.5 px-6 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5"
            >
              Étape suivante <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: Choix Type de Dossier & Confirmation Final (Étape 6) */}
      {currentStep === 7 && (
        <div className="bg-white rounded-3xl border border-black/10 shadow-xs p-6 md:p-8 space-y-6 fade-in">
          <div>
            <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Étape 7 : Type de dossier</span>
            <h3 className="font-sans text-xl md:text-2xl text-primary font-black tracking-tight mt-1">Choix du type de traitement du dossier</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Choisissez le type d'engagement réglementaire pour finaliser la création du dossier dans votre espace.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl">
            {/* Option 1: Pré-déclaration */}
            <label className="border rounded-xl p-5 bg-white hover:border-primary cursor-pointer transition-all flex items-start gap-4 shadow-sm">
              <input
                type="radio"
                name="dossierType"
                checked={typeDossier === 'pre_declaration'}
                onChange={() => setTypeDossier('pre_declaration')}
                className="mt-1"
              />
              <div className="space-y-1">
                <span className="font-bold text-slate-800 text-sm block">Pré-déclaration</span>
                <span className="text-xs text-slate-500 leading-relaxed block">
                  Demande de validation préalable du devis non signé par les instructeurs Adeena/OdiCEE **avant** tout démarrage des travaux chantiers.
                </span>
                <span className="inline-flex mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
                  Recommandé si doute éligibilité
                </span>
              </div>
            </label>

            {/* Option 2: Déclaration */}
            <label className="border rounded-xl p-5 bg-white hover:border-primary cursor-pointer transition-all flex items-start gap-4 shadow-sm">
              <input
                type="radio"
                name="dossierType"
                checked={typeDossier === 'declaration'}
                onChange={() => setTypeDossier('declaration')}
                className="mt-1"
              />
              <div className="space-y-1">
                <span className="font-bold text-slate-800 text-sm block">Déclaration Directe</span>
                <span className="text-xs text-slate-500 leading-relaxed block">
                  Dépôt du dossier finalisé pour engagement immédiat des travaux sans passer par l'étape de pré-validation des conseillers OdiCEE.
                </span>
                <span className="inline-flex mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                  Rapide & fluide
                </span>
              </div>
            </label>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800 text-xs leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong>Engagement réglementaire :</strong> En validant la création de ce dossier, vous certifiez l'exactitude des données de simulation et d'éligibilité fournies. Les cadres réglementaires de contribution vous seront transmis par email d'ici quelques minutes.
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handlePrevStep}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold py-2.5 px-6 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <button
              onClick={handleFinalSubmit}
              className="bg-secondary hover:bg-opacity-90 text-white font-bold py-2.5 px-8 rounded-lg text-xs cursor-pointer transition-all flex items-center gap-1.5 shadow-md"
            >
              Finaliser et créer le dossier <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* NEW INTERVENANT POPUP MODAL */}
      {showNewIntervenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-100 p-6 fade-in max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateIntervenant} className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-serif text-lg text-primary font-normal">Nouveau sous-traitant / installateur tiers</h3>
                <p className="text-xs text-slate-400">Ajoutez un intervenant qualifié et joignez ses justificatifs administratifs obligatoires.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Raison sociale *</label>
                  <input
                    type="text"
                    required
                    value={newIntervenant.raisonSociale}
                    onChange={(e) => setNewIntervenant({ ...newIntervenant, raisonSociale: e.target.value })}
                    className="w-full rounded border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-primary bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">SIRET *</label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    value={newIntervenant.siret}
                    onChange={(e) => setNewIntervenant({ ...newIntervenant, siret: e.target.value.replace(/\D/g, '') })}
                    className="w-full rounded border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-primary bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Prénom Représentant</label>
                  <input
                    type="text"
                    value={newIntervenant.representantPrenom}
                    onChange={(e) => setNewIntervenant({ ...newIntervenant, representantPrenom: e.target.value })}
                    className="w-full rounded border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-primary bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Nom Représentant</label>
                  <input
                    type="text"
                    value={newIntervenant.representantNom}
                    onChange={(e) => setNewIntervenant({ ...newIntervenant, representantNom: e.target.value })}
                    className="w-full rounded border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-primary bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Email de contact</label>
                  <input
                    type="email"
                    value={newIntervenant.email}
                    onChange={(e) => setNewIntervenant({ ...newIntervenant, email: e.target.value })}
                    className="w-full rounded border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-primary bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">Téléphone de contact</label>
                  <input
                    type="tel"
                    value={newIntervenant.telephone}
                    onChange={(e) => setNewIntervenant({ ...newIntervenant, telephone: e.target.value })}
                    className="w-full rounded border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-primary bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Upload simulated documents (as requested by F-56) */}
              <div className="border border-dashed border-slate-200 rounded-lg p-3.5 bg-slate-50 space-y-2 text-xs">
                <p className="font-bold text-slate-600 text-[10px] uppercase">Justificatifs obligatoires (Upload requis)</p>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 text-[11px]">1. Extrait K-BIS de l'intervenant</span>
                  <span className="text-[10px] bg-secondary/15 text-secondary px-2 py-0.5 rounded font-bold">Inclus (Auto)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 text-[11px]">2. Attestation de vigilance URSSAF</span>
                  <span className="text-[10px] bg-secondary/15 text-secondary px-2 py-0.5 rounded font-bold">Inclus (Auto)</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 text-[11px]">3. Qualification(s) RGE valide(s)</span>
                  <span className="text-[10px] bg-secondary/15 text-secondary px-2 py-0.5 rounded font-bold">Inclus (Auto)</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewIntervenantModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-opacity-95 text-white py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                >
                  Ajouter l'intervenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
