import React, { useState } from 'react';
import { 
  ArrowLeft, CheckCircle, FileText, Upload, Calendar, Building, MapPin, 
  UserCheck, Percent, HelpCircle, Check, ShieldCheck, RefreshCw, Send
} from 'lucide-react';
import { Dossier, ChantierItem } from '../types';
import { CEE_SHEETS_MAP } from '../lib/ceeData';

interface DossierDetailProps {
  dossier: Dossier;
  onBack: () => void;
  onUpdateDossier: (updated: Dossier) => void;
}

export default function DossierDetail({ dossier, onBack, onUpdateDossier }: DossierDetailProps) {
  const [selectedChantierId, setSelectedChantierId] = useState<string>(
    dossier.travaux.chantiers[0]?.id || ''
  );

  // Confirmation process state
  const [isConfirming, setIsConfirming] = useState(false);
  const [visitePrealable, setVisitePrealable] = useState('');
  const [acceptationDevis, setAcceptationDevis] = useState('');
  const [debutTravaux, setDebutTravaux] = useState('');
  const [factureDate, setFactureDate] = useState('');
  const [eSignTriggered, setESignTriggered] = useState(false);

  // Simulated file uploads
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>(
    dossier.documentsCharges || {
      devisSigne: false,
      cadreContribution: true,
      facture: false,
      attestationHonneurSignee: false,
      avisImposition: false,
      justificatifDomicile: false,
      cadastre: false
    }
  );

  // Selected chantier item
  const activeChantier = dossier.travaux.chantiers.find(c => c.id === selectedChantierId) || dossier.travaux.chantiers[0];

  // Helper mapping stepper steps based on dossier status
  const getStepperIndex = () => {
    switch (dossier.status) {
      case 'Simulé':
      case 'À engager':
      case 'Pré déclaré':
      case 'Déclaré':
        return 0; // Déclaré stage
      case 'Confirmé':
        return 1; // Confirmé stage
      case 'Incomplet':
      case 'Traitement en cours':
        return 2; // Documents envoyés stage
      case 'Complet':
        return 3; // Complet stage
      default:
        return 0;
    }
  };

  const currentStepperIdx = getStepperIndex();
  const STEPPER_STAGES = [
    { label: "Déclaré", desc: "Dossier enregistré" },
    { label: "Confirmé", desc: "Attestation générée" },
    { label: "Documents envoyés", desc: "En cours d'instruction" },
    { label: "Complet", desc: "Dossier validé & réglé" }
  ];

  // Recalculating totals if needed
  const totalVolume = dossier.travaux.chantiers.reduce((acc, c) => acc + c.volumeCumac, 0);
  const totalPrimeValue = totalVolume * 6;

  // Repartition calculations
  const partClient = dossier.repartitionMode === 'global' 
    ? (totalPrimeValue * dossier.repartitionGlobalPct) / 100 
    : dossier.travaux.chantiers.reduce((acc, c) => {
        const pct = dossier.repartitionChantiersPct?.[c.id] ?? 80;
        return acc + (c.prime * pct) / 100;
      }, 0);
  const partPro = totalPrimeValue - partClient;

  // File Upload trigger
  const handleSimulateUpload = (key: string) => {
    setUploadedDocs(prev => {
      const updated = { ...prev, [key]: true };
      
      // Auto save update on dossier
      const updatedDossier: Dossier = {
        ...dossier,
        documentsCharges: updated
      };
      
      // If all mandatory docs uploaded, change status to 'Traitement en cours'
      const hasMandatory = 
        updated.devisSigne && 
        updated.cadreContribution && 
        updated.facture && 
        updated.attestationHonneurSignee;
      
      if (hasMandatory && dossier.status === 'Confirmé') {
        updatedDossier.status = 'Traitement en cours';
      }

      onUpdateDossier(updatedDossier);
      return updated;
    });
  };

  // Launch confirmation flow (US-08 / F-82)
  const handleLaunchConfirmation = () => {
    setIsConfirming(true);
    setVisitePrealable(dossier.chronologie?.visitePrealable || '');
    setAcceptationDevis(dossier.chronologie?.acceptationDevis || '');
    setDebutTravaux(dossier.chronologie?.debutTravaux || '');
    setFactureDate(dossier.chronologie?.factureDate || '');
  };

  const handleConfirmDossierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitePrealable || !acceptationDevis || !debutTravaux || !factureDate) {
      alert("Veuillez renseigner toutes les dates de la chronologie obligatoire.");
      return;
    }

    // Check if e-signature criteria met (F-90bis)
    // E-sign conditions: rep has email & phone, beneficiary has email & phone, sig enabled
    const repEmail = dossier.beneficiaire.email;
    const repPhone = dossier.beneficiaire.telephone;
    const eSignEligible = repEmail && repPhone; // Simple simulation check

    if (eSignEligible && !eSignTriggered) {
      setESignTriggered(true);
      return; // Stop to show the simulated signature screen
    }

    // Save confirmation
    const updatedDossier: Dossier = {
      ...dossier,
      status: 'Confirmé',
      chronologie: {
        visitePrealable,
        acceptationDevis,
        debutTravaux,
        factureDate
      }
    };
    onUpdateDossier(updatedDossier);
    setIsConfirming(false);
    setESignTriggered(false);
  };

  const handleSendToInstruction = () => {
    // Check files
    const hasMandatory = 
      uploadedDocs.devisSigne && 
      uploadedDocs.cadreContribution && 
      uploadedDocs.facture && 
      uploadedDocs.attestationHonneurSignee;

    if (!hasMandatory) {
      alert("Impossible d'envoyer pour traitement. Veuillez d'abord uploader l'intégralité des 4 documents obligatoires.");
      return;
    }

    const updatedDossier: Dossier = {
      ...dossier,
      status: 'Traitement en cours'
    };
    onUpdateDossier(updatedDossier);
    alert("Dossier envoyé avec succès pour instruction par les équipes d'Adeena.");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 fade-in">
      {/* Back button and title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux dossiers
        </button>
        
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-xs">Référence dossier :</span>
          <span className="font-mono font-bold text-primary text-sm bg-slate-100 px-3 py-1 rounded-lg">
            {dossier.reference}
          </span>
        </div>
      </div>

      {/* stepper of progression */}
      <div className="bg-white rounded-3xl border border-black/10 shadow-xs p-6 mb-8 overflow-x-auto">
        <div className="flex justify-between items-center min-w-[600px] relative">
          <div className="absolute top-5 left-12 right-12 h-0.5 bg-slate-200 -z-10"></div>
          {STEPPER_STAGES.map((stage, idx) => {
            const isCurrent = currentStepperIdx === idx;
            const isPast = currentStepperIdx > idx;

            return (
              <div key={stage.label} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isPast 
                    ? 'bg-secondary text-white' 
                    : isCurrent 
                      ? 'bg-primary text-white ring-4 ring-primary/10' 
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                }`}>
                  {isPast ? <Check className="w-5 h-5" /> : idx + 1}
                </div>
                <span className={`mt-2 text-xs font-bold ${isCurrent ? 'text-primary' : 'text-slate-400'}`}>
                  {stage.label}
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">{stage.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left side stacked (Aggregates, Docs, Chantiers list) vs Right side details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column (width: 1/3) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Block 1: Prime totale */}
          <div className="bg-primary text-white rounded-3xl p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full blur-xl"></div>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Aide financière valorisée</p>
            <h3 className="text-3xl font-extrabold text-secondary mt-1">
              {totalPrimeValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </h3>
            
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Économie totale :</span>
                <span className="font-mono font-bold text-white">{totalVolume.toFixed(2)} MWh cumac</span>
              </div>
              <div className="flex justify-between">
                <span>Part Bénéficiaire :</span>
                <span className="font-bold text-secondary">
                  {partClient.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Part Professionnelle :</span>
                <span className="font-bold text-white">
                  {partPro.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            </div>
          </div>

          {/* Block 2: Documents upload checklist */}
          <div className="bg-white rounded-3xl border border-black/10 shadow-xs p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-primary uppercase">Documents du dossier</h4>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">
                {Object.values(uploadedDocs).filter(Boolean).length} / 7
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pièces obligatoires</p>
              
              {/* Doc 1: Devis signé */}
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className={`w-4 h-4 ${uploadedDocs.devisSigne ? 'text-secondary' : 'text-slate-400'}`} />
                  <span className="font-medium text-slate-700">Devis signé par le client</span>
                </div>
                {uploadedDocs.devisSigne ? (
                  <span className="text-[9px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> OK
                  </span>
                ) : (
                  <button
                    onClick={() => handleSimulateUpload('devisSigne')}
                    className="text-[9px] bg-primary hover:bg-opacity-90 text-white font-bold px-2.5 py-1 rounded cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" /> Joindre
                  </button>
                )}
              </div>

              {/* Doc 2: Cadre de contribution */}
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className={`w-4 h-4 ${uploadedDocs.cadreContribution ? 'text-secondary' : 'text-slate-400'}`} />
                  <span className="font-medium text-slate-700">Cadre contribution horodaté</span>
                </div>
                {uploadedDocs.cadreContribution ? (
                  <span className="text-[9px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> OK
                  </span>
                ) : (
                  <button
                    onClick={() => handleSimulateUpload('cadreContribution')}
                    className="text-[9px] bg-primary hover:bg-opacity-90 text-white font-bold px-2.5 py-1 rounded cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" /> Joindre
                  </button>
                )}
              </div>

              {/* Doc 3: Facture */}
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className={`w-4 h-4 ${uploadedDocs.facture ? 'text-secondary' : 'text-slate-400'}`} />
                  <span className="font-medium text-slate-700">Facture des travaux</span>
                </div>
                {uploadedDocs.facture ? (
                  <span className="text-[9px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> OK
                  </span>
                ) : (
                  <button
                    onClick={() => handleSimulateUpload('facture')}
                    className="text-[9px] bg-primary hover:bg-opacity-90 text-white font-bold px-2.5 py-1 rounded cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" /> Joindre
                  </button>
                )}
              </div>

              {/* Doc 4: Attestation sur l'honneur */}
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className={`w-4 h-4 ${uploadedDocs.attestationHonneurSignee ? 'text-secondary' : 'text-slate-400'}`} />
                  <span className="font-medium text-slate-700">Attestation d'honneur signée</span>
                </div>
                {uploadedDocs.attestationHonneurSignee ? (
                  <span className="text-[9px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> OK
                  </span>
                ) : (
                  <button
                    onClick={() => handleSimulateUpload('attestationHonneurSignee')}
                    className="text-[9px] bg-primary hover:bg-opacity-90 text-white font-bold px-2.5 py-1 rounded cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" /> Joindre
                  </button>
                )}
              </div>
            </div>

            {/* Optional docs */}
            <div className="space-y-3 pt-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pièces facultatives complémentaires</p>
              
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-700 font-medium">Justificatif de domicile</span>
                {uploadedDocs.justificatifDomicile ? (
                  <span className="text-[9px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Reçu</span>
                ) : (
                  <button onClick={() => handleSimulateUpload('justificatifDomicile')} className="text-slate-400 hover:text-primary text-[10px] cursor-pointer">Joindre</button>
                )}
              </div>

              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-700 font-medium">Extrait cadastral</span>
                {uploadedDocs.cadastre ? (
                  <span className="text-[9px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Reçu</span>
                ) : (
                  <button onClick={() => handleSimulateUpload('cadastre')} className="text-slate-400 hover:text-primary text-[10px] cursor-pointer">Joindre</button>
                )}
              </div>
            </div>
          </div>

          {/* Block 3: Travaux row links */}
          <div className="bg-white rounded-3xl border border-black/10 shadow-xs p-5 space-y-3">
            <h4 className="text-xs font-bold text-primary uppercase border-b border-slate-100 pb-2">Travaux de ce dossier</h4>
            <div className="space-y-2">
              {dossier.travaux.chantiers.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedChantierId(c.id)}
                  className={`border rounded-lg p-3 cursor-pointer text-left transition-all ${
                    selectedChantierId === c.id 
                      ? 'border-secondary bg-secondary/5 font-semibold' 
                      : 'border-slate-150 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-primary font-bold">{c.ficheCode}</span>
                    <span className="text-[10px] text-slate-400">{c.volumeCumac} MWh</span>
                  </div>
                  <div className="text-[10px] text-slate-700 mt-1.5 truncate">{c.ficheTitle}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right side detailed workspace (width: 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Beneficiary summary */}
          <div className="bg-white rounded-3xl border border-black/10 shadow-xs p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Beneficiary coordinates */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-primary uppercase border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-secondary" /> Bénéficiaire
              </h4>
              
              <div className="text-xs space-y-2 text-slate-700">
                {dossier.beneficiaire.type === 'personne_morale' ? (
                  <>
                    <p className="font-bold text-slate-900 text-sm">{dossier.beneficiaire.raisonSociale}</p>
                    <p><strong>SIRET :</strong> {dossier.beneficiaire.siret} ({dossier.beneficiaire.typePersonneMorale?.toUpperCase()})</p>
                    <p><strong>Signataire légal :</strong> {dossier.beneficiaire.civility} {dossier.beneficiaire.prenom} {dossier.beneficiaire.nom}</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-slate-900 text-sm">{dossier.beneficiaire.civility} {dossier.beneficiaire.prenom} {dossier.beneficiaire.nom}</p>
                  </>
                )}
                <p><strong>Adresse de facturation :</strong> {dossier.beneficiaire.adresse}, {dossier.beneficiaire.codePostal} {dossier.beneficiaire.ville}</p>
                <p><strong>Coordonnées :</strong> {dossier.beneficiaire.email} | {dossier.beneficiaire.telephone}</p>
                
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catégorie de précarité</span>
                  <span className="text-xs font-semibold text-primary mt-1 inline-block bg-primary/5 px-2.5 py-1 rounded">
                    Précarité : {dossier.beneficiaire.situationFiscaleConnue ? (dossier.beneficiaire.trancheRevenus?.toUpperCase().replace('_', ' ') || 'Classique P5') : 'Classique P5'}
                  </span>
                </div>
              </div>
            </div>

            {/* Works location address */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-primary uppercase border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-secondary" /> Lieu des travaux
              </h4>
              
              <div className="text-xs space-y-2 text-slate-700">
                <p><strong>Type de bâtiment :</strong> {dossier.batiment?.type.toUpperCase()}</p>
                {dossier.batiment?.nomBatiment && <p><strong>Nom copropriété / bâtiment :</strong> {dossier.batiment.nomBatiment}</p>}
                
                <p>
                  <strong>Adresse des travaux :</strong> {dossier.batiment?.memeAdresseBeneficiaire 
                    ? dossier.beneficiaire.adresse + ", " + dossier.beneficiaire.codePostal + " " + dossier.beneficiaire.ville
                    : dossier.batiment?.adresseTravaux + ", " + dossier.batiment?.codePostalTravaux + " " + dossier.batiment?.villeTravaux
                  }
                </p>

                {dossier.batiment?.residenceSecondaire && <p className="text-amber-700 font-semibold text-[10px] bg-amber-50 px-2 py-0.5 rounded inline-block">Maison secondaire</p>}
                {dossier.batiment?.locataireNomPrenom && <p><strong>Occupant / Locataire :</strong> {dossier.batiment.locataireNomPrenom}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Active selected chantier item specs */}
          {activeChantier && (
            <div className="bg-white rounded-3xl border border-black/10 shadow-xs p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase">{activeChantier.ficheCode}</span>
                  <h4 className="font-bold text-primary text-sm mt-1">{activeChantier.ficheTitle}</h4>
                </div>
                
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Mode de versement</span>
                  <span className="text-xs font-semibold text-secondary">Prime déduite de la facture travaux</span>
                </div>
              </div>

              {/* Repartition sliders row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Répartition de la prime</span>
                  
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-700">
                    <span>Part client reversée</span>
                    <span className="font-bold text-secondary">
                      {((activeChantier.prime * (dossier.repartitionMode === 'global' ? dossier.repartitionGlobalPct : (dossier.repartitionChantiersPct?.[activeChantier.id] ?? 80))) / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-700">
                    <span>Part professionnelle</span>
                    <span className="font-bold text-primary">
                      {((activeChantier.prime * (100 - (dossier.repartitionMode === 'global' ? dossier.repartitionGlobalPct : (dossier.repartitionChantiersPct?.[activeChantier.id] ?? 80)))) / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                </div>

                {/* Technical parameters summary table */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Propriétés techniques</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
                    <div>Marque : <span className="font-bold text-slate-800">{activeChantier.marque || 'N/A'}</span></div>
                    <div>Modèle : <span className="font-bold text-slate-800">{activeChantier.referenceProduit || 'N/A'}</span></div>
                    {Object.entries(activeChantier.properties).map(([propKey, propVal]) => (
                      <div key={propKey}>
                        {propKey.toUpperCase()} : <span className="font-bold text-slate-800">{propVal !== '' ? String(propVal) : 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Call to confirmation / Action workflow triggers */}
          {dossier.status === 'Déclaré' && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-950 text-sm">Ce dossier est en attente de confirmation</h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Vous devez compléter la chronologie obligatoire (dates de visites préalable, d'acceptation du devis, etc.) et valider l'attestation d'honneur pour éditer les documents contractuels.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleLaunchConfirmation}
                  className="bg-primary hover:bg-opacity-95 text-white font-bold py-2.5 px-6 rounded-lg text-xs transition-all cursor-pointer shadow-sm"
                >
                  Lancer la confirmation du dossier
                </button>
              </div>
            </div>
          )}

          {dossier.status === 'Confirmé' && (
            <div className="bg-green-50 border border-green-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-secondary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-green-950 text-sm">Dossier Confirmé — Prêt pour envoi</h4>
                  <p className="text-xs text-green-800 mt-1 leading-relaxed">
                    Toutes les dates techniques et chronologiques ont été renseignées avec succès. Joignez les 4 documents requis ci-contre pour soumettre ce dossier à l'instruction définitive.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleSendToInstruction}
                  className="bg-secondary hover:bg-opacity-90 text-white font-bold py-2.5 px-6 rounded-lg text-xs transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Envoyer le dossier pour traitement
                </button>
              </div>
            </div>
          )}

          {dossier.status === 'Traitement en cours' && (
            <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 flex items-start gap-4">
              <RefreshCw className="w-6 h-6 text-blue-600 shrink-0 mt-0.5 animate-spin" />
              <div>
                <h4 className="font-bold text-blue-950 text-sm">Dossier en cours d'instruction</h4>
                <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                  Votre dossier et l'ensemble des documents justificatifs sont actuellement en cours d'analyse réglementaire réglementaire par nos instructeurs CEE d'Adeena. Vous recevrez une notification d'ici quelques jours.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONFIRMATION TIMELINE MODAL DIALOG */}
      {isConfirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl shadow-sm max-w-lg w-full border border-black/10 p-6 fade-in max-h-[90vh] overflow-y-auto">
            {eSignTriggered ? (
              <div className="text-center py-6 space-y-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 text-primary rounded-full">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-sans text-xl text-primary font-black tracking-tight">Signature électronique de l'attestation</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    La signature électronique OdiCEE (YouSign) est disponible pour ce dossier. Un code SMS de validation à usage unique a été simulé.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 max-w-sm mx-auto text-left space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Code SMS de confirmation</span>
                  <div className="flex justify-between items-center bg-white p-2.5 rounded border border-slate-200 text-xs font-mono">
                    <span className="text-slate-600">Code d'activation :</span>
                    <span className="font-bold text-primary text-sm">849 301</span>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    Simulation : Le client bénéficiaire et votre représentant recevront chacun ce code de signature par SMS.
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setESignTriggered(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Finalize
                      const updatedDossier: Dossier = {
                        ...dossier,
                        status: 'Confirmé',
                        chronologie: {
                          visitePrealable,
                          acceptationDevis,
                          debutTravaux,
                          factureDate
                        },
                        documentsCharges: {
                          ...uploadedDocs,
                          attestationHonneurSignee: true // E-sign automatically uploads AH
                        }
                      };
                      onUpdateDossier(updatedDossier);
                      setUploadedDocs(prev => ({ ...prev, attestationHonneurSignee: true }));
                      setIsConfirming(false);
                      setESignTriggered(false);
                      alert("Dossier validé et attestation d'honneur signée électroniquement !");
                    }}
                    className="flex-1 bg-secondary hover:bg-opacity-90 text-white py-2 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Signer l'attestation
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmDossierSubmit} className="space-y-4">
                <div className="border-b border-black/10 pb-2">
                  <h3 className="font-sans text-lg text-primary font-black tracking-tight">Saisie de la chronologie obligatoire</h3>
                  <p className="text-xs text-slate-400 font-medium">Renseignez la chronologie légale du chantier pour générer l'attestation sur l'honneur.</p>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Date de visite préalable réglementaire *</label>
                    <input
                      type="date"
                      required
                      value={visitePrealable}
                      onChange={(e) => setVisitePrealable(e.target.value)}
                      className="w-full rounded border border-slate-200 p-2.5 text-xs bg-slate-50/50"
                    />
                    <p className="text-[9px] text-slate-400">Doit être impérativement antérieure à la date d'acceptation du devis.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Date d'acceptation du devis (signature) *</label>
                    <input
                      type="date"
                      required
                      value={acceptationDevis}
                      onChange={(e) => setAcceptationDevis(e.target.value)}
                      className="w-full rounded border border-slate-200 p-2.5 text-xs bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Date réelle de début des travaux *</label>
                    <input
                      type="date"
                      required
                      value={debutTravaux}
                      onChange={(e) => setDebutTravaux(e.target.value)}
                      className="w-full rounded border border-slate-200 p-2.5 text-xs bg-slate-50/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Date d'édition de la facture finale *</label>
                    <input
                      type="date"
                      required
                      value={factureDate}
                      onChange={(e) => setFactureDate(e.target.value)}
                      className="w-full rounded border border-slate-200 p-2.5 text-xs bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsConfirming(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-opacity-95 text-white py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                  >
                    Générer l'attestation d'honneur
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
