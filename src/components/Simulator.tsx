import React, { useState } from 'react';
import { Plus, Trash2, Calculator, Save, RefreshCw, Send, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { CEE_SHEETS_LIST, CEE_SHEETS_MAP } from '../lib/ceeData';
import { ChantierItem } from '../types';

interface SimulatorProps {
  isLoggedIn: boolean;
  onSaveDraft: (clientNom: string, clientPrenom: string, chantiers: ChantierItem[]) => void;
  onTransformToDossier: (chantiers: ChantierItem[]) => void;
  onNavigateToLogin: () => void;
}

export default function Simulator({
  isLoggedIn,
  onSaveDraft,
  onTransformToDossier,
  onNavigateToLogin
}: SimulatorProps) {
  const [selectedSheetCode, setSelectedSheetCode] = useState(CEE_SHEETS_LIST[0].code);
  const [simulationChantiers, setSimulationChantiers] = useState<ChantierItem[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [clientNom, setClientNom] = useState('');
  const [clientPrenom, setClientPrenom] = useState('');
  const [draftSavedMessage, setDraftSavedMessage] = useState(false);

  // Property editors state per chantier item
  const handleAddSheet = () => {
    const sheet = CEE_SHEETS_MAP[selectedSheetCode];
    if (!sheet) return;

    // Build default properties
    const defaultProps: Record<string, any> = {};
    sheet.properties.forEach(prop => {
      if (prop.type === 'select' && prop.options) {
        defaultProps[prop.key] = prop.options[0];
      } else {
        defaultProps[prop.key] = '';
      }
    });

    const newChantier: ChantierItem = {
      id: 'sim-' + Math.random().toString(36).substring(2, 9),
      ficheCode: sheet.code,
      ficheTitle: sheet.title,
      properties: defaultProps,
      volumeCumac: 0,
      prime: 0,
      intervenantType: 'societe',
      marque: '',
      referenceProduit: ''
    };

    setSimulationChantiers([...simulationChantiers, newChantier]);
  };

  const handleRemoveChantier = (id: string) => {
    setSimulationChantiers(simulationChantiers.filter(c => c.id !== id));
  };

  const handlePropertyChange = (chantierId: string, key: string, value: any) => {
    setSimulationChantiers(prev => prev.map(chantier => {
      if (chantier.id !== chantierId) return chantier;

      const updatedProperties = {
        ...chantier.properties,
        [key]: value
      };

      const sheet = CEE_SHEETS_MAP[chantier.ficheCode];
      let volumeCumac = 0;
      if (sheet) {
        volumeCumac = sheet.calculateCumac(updatedProperties);
      }
      const prime = volumeCumac * 6;

      return {
        ...chantier,
        properties: updatedProperties,
        volumeCumac,
        prime
      };
    }));
  };

  const handleReset = () => {
    setSimulationChantiers([]);
    setClientNom('');
    setClientPrenom('');
    setDraftSavedMessage(false);
  };

  // Calculations
  const totalCumac = simulationChantiers.reduce((acc, c) => acc + c.volumeCumac, 0);
  const totalPrime = totalCumac * 6;

  const handleDraftSaveClick = () => {
    if (simulationChantiers.length === 0) return;
    setShowSaveModal(true);
  };

  const handleConfirmDraftSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNom || !clientPrenom) return;

    onSaveDraft(clientNom, clientPrenom, simulationChantiers);
    setDraftSavedMessage(true);
    setTimeout(() => {
      setShowSaveModal(false);
      setDraftSavedMessage(false);
    }, 2000);
  };

  const handleTransformDossierClick = () => {
    if (simulationChantiers.length === 0) return;
    onTransformToDossier(simulationChantiers);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Simulateur</span>
          <h1 className="font-sans text-2xl md:text-3xl text-primary font-black tracking-tight">
            Simulateur de Prime CEE
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ajoutez des opérations, configurez les valeurs techniques et estimez la prime OdiCEE instantanément.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {simulationChantiers.length > 0 && (
            <button
              onClick={handleReset}
              className="bg-white hover:bg-slate-50 border border-black/10 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Middle side: Sheets configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Operations catalog adder card */}
          <div className="bg-white rounded-3xl p-6 border border-black/10 shadow-xs">
            <h3 className="font-black text-primary text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-secondary" /> Ajouter une opération standardisée
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedSheetCode}
                onChange={(e) => setSelectedSheetCode(e.target.value)}
                className="flex-1 rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent text-xs bg-slate-50 font-bold text-slate-700"
              >
                {CEE_SHEETS_LIST.map((sheet) => (
                  <option key={sheet.code} value={sheet.code}>
                    {sheet.code} — {sheet.shortDescription}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAddSheet}
                className="bg-primary hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Ajouter au projet
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-wide">
              Formule réglementaire de calcul : Volume MWh Cumac × 6 € par MWh valorisé.
            </p>
          </div>

          {/* List of active simulation operations */}
          {simulationChantiers.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-black/10 shadow-xs flex flex-col items-center justify-center space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl text-slate-400 border border-black/5">
                <Calculator className="w-8 h-8" />
              </div>
              <div className="max-w-sm">
                <h4 className="font-black text-primary text-base">Aucune opération ajoutée</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Sélectionnez une fiche CEE ci-dessus pour configurer les caractéristiques techniques du chantier et générer la prime correspondante.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {simulationChantiers.map((chantier, idx) => {
                const sheet = CEE_SHEETS_MAP[chantier.ficheCode];
                if (!sheet) return null;

                return (
                  <div key={chantier.id} className="bg-white rounded-3xl border border-black/10 shadow-xs overflow-hidden fade-in">
                    {/* Header of chantier */}
                    <div className="bg-slate-50 px-6 py-4 border-b border-black/10 flex justify-between items-center">
                      <div>
                        <span className="bg-primary text-white text-[9px] font-bold px-2.5 py-1 rounded-md font-mono uppercase">
                          {chantier.ficheCode}
                        </span>
                        <h4 className="font-black text-primary text-sm mt-2">{sheet.title}</h4>
                      </div>
                      <button
                        onClick={() => handleRemoveChantier(chantier.id)}
                        className="text-rose-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 border border-transparent hover:border-black/5 transition-all cursor-pointer"
                        title="Supprimer cette opération"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {/* Technical Fields and Guidance */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: inputs */}
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Caractéristiques techniques</h5>
                        
                        <div className="grid grid-cols-1 gap-4">
                          {sheet.properties.map((prop) => (
                            <div key={prop.key} className="space-y-1">
                              <label className="block text-xs font-bold text-slate-700">
                                {prop.label} {prop.required && <span className="text-red-500">*</span>}
                              </label>
                              
                              {prop.type === 'select' ? (
                                <select
                                  value={chantier.properties[prop.key] ?? ''}
                                  onChange={(e) => handlePropertyChange(chantier.id, prop.key, e.target.value)}
                                  className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-slate-50 font-medium"
                                >
                                  {prop.options?.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="number"
                                  placeholder={prop.placeholder}
                                  value={chantier.properties[prop.key] ?? ''}
                                  onChange={(e) => handlePropertyChange(chantier.id, prop.key, e.target.value)}
                                  className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-slate-50 font-bold"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: regulations rules and individual outcome */}
                      <div className="bg-slate-50 rounded-2xl p-5 border border-black/5 flex flex-col justify-between">
                        <div>
                          <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-secondary" /> Rappel réglementaire
                          </h5>
                          <ul className="space-y-1.5 mt-2">
                            {sheet.rules.map((rule, rIdx) => (
                              <li key={rIdx} className="text-[11px] text-slate-500 leading-relaxed list-disc list-inside font-medium">
                                {rule}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Individual estimation outcome */}
                        <div className="mt-4 pt-4 border-t border-black/5 flex justify-between items-end">
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Volume</p>
                            <p className="font-mono text-sm font-black text-primary">
                              {chantier.volumeCumac} MWh cumac
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Prime estimée</p>
                            <p className="text-lg font-black text-secondary">
                              {chantier.prime.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right side: Estimator aggregation summary */}
        <div className="space-y-6">
          <div className="bg-primary text-white rounded-3xl p-6 border border-black/15 shadow-sm relative overflow-hidden">
            {/* Background design glow */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-secondary/15 -mr-10 -mt-10 blur-xl"></div>
            
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Résumé de l'estimation</span>
            <h3 className="font-sans text-xl font-black text-white tracking-tight mb-6">Récapitulatif</h3>
            
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center py-2 border-b border-white/10 text-xs font-bold uppercase tracking-wide">
                <span className="text-slate-300">Opérations</span>
                <span>{simulationChantiers.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10 text-xs font-bold uppercase tracking-wide">
                <span className="text-slate-300">Volume global</span>
                <span className="font-mono">{totalCumac.toFixed(2)} MWh</span>
              </div>
              <div className="py-4">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Aide financière valorisée</p>
                <div className="text-4xl font-black text-secondary mt-2 tracking-tight">
                  {totalPrime.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                  Basé sur un coefficient de valorisation fixe de 6 € / MWh cumac.
                </p>
              </div>

              {simulationChantiers.length > 0 && (
                <div className="pt-4 space-y-3">
                  <button
                    onClick={handleDraftSaveClick}
                    className="w-full bg-white/10 hover:bg-white/15 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10"
                  >
                    <Save className="w-4 h-4" /> Enregistrer en brouillon
                  </button>

                  <button
                    onClick={handleTransformDossierClick}
                    className="w-full bg-secondary hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    <Send className="w-4 h-4" /> Transformer en dossier
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Connected banner guide */}
          {!isLoggedIn && (
            <div className="bg-white rounded-3xl p-6 border border-black/10 shadow-xs flex flex-col items-center text-center space-y-4">
              <div className="bg-blue-50 p-3 rounded-2xl text-secondary border border-blue-100">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-primary text-sm">Vous êtes artisan RGE ?</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Connectez-vous pour sauvegarder vos estimations, gérer vos chantiers et obtenir des attestations de conformité.
                </p>
              </div>
              <button
                onClick={onNavigateToLogin}
                className="w-full bg-primary hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-all cursor-pointer shadow-xs border border-black/5"
              >
                Se connecter / Créer un compte
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Save Draft Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full border border-black/10 p-6 fade-in">
            {draftSavedMessage ? (
              <div className="text-center py-6 space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 text-secondary rounded-2xl border border-green-100">
                  <Save className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-primary tracking-tight">Simulation enregistrée !</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Le brouillon pour <strong className="text-primary">{clientPrenom} {clientNom}</strong> a été sauvegardé avec succès dans votre espace de travail.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmDraftSave} className="space-y-4">
                <div className="border-b border-black/5 pb-3">
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Sauvegarde</span>
                  <h3 className="text-lg font-black text-primary tracking-tight">Enregistrer la simulation</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Indiquez le nom du client final pour référencer cette simulation de prime dans vos dossiers.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Prénom du bénéficiaire</label>
                    <input
                      type="text"
                      required
                      placeholder="Jean"
                      value={clientPrenom}
                      onChange={(e) => setClientPrenom(e.target.value)}
                      className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-slate-50 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Nom du bénéficiaire</label>
                    <input
                      type="text"
                      required
                      placeholder="Dupont"
                      value={clientNom}
                      onChange={(e) => setClientNom(e.target.value)}
                      className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-slate-50 font-bold"
                    />
                  </div>
                </div>

                {!isLoggedIn && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800 text-[11px] leading-relaxed font-semibold">
                    Note : Vous n'êtes pas connecté. Pour valider l'enregistrement de ce brouillon, vous devrez vous connecter ou vous inscrire à l'étape suivante.
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-black/5">
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Sauvegarder
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
