import React, { useState } from 'react';
import { Plus, Trash2, Calculator, Save, RefreshCw, Send, ArrowRight, Sparkles, AlertCircle, Calendar } from 'lucide-react';
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

  // Date d'édition du devis
  const todayStr = new Date().toISOString().split('T')[0];
  const [dateDevis, setDateDevis] = useState<string>(todayStr);

  const formatDateFR = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Bonification state
  const [bonificationType, setBonificationType] = useState<'aucun' | 'coup_de_pouce' | 'zni' | 'cpe'>('aucun');
  const [cpeDuree, setCpeDuree] = useState<'10_ans_ou_moins' | 'plus_de_10_ans'>('10_ans_ou_moins');
  const [cpeEconomiePct, setCpeEconomiePct] = useState<number>(20);

  // Property editors state per chantier item
  const handleAddSheet = (codeToAdd?: string | React.MouseEvent) => {
    const code = typeof codeToAdd === 'string' ? codeToAdd : selectedSheetCode;
    const sheet = CEE_SHEETS_MAP[code];
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

    setSimulationChantiers(prev => [...prev, newChantier]);
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
    setDateDevis(todayStr);
    setBonificationType('aucun');
    setCpeDuree('10_ans_ou_moins');
    setCpeEconomiePct(20);
  };

  // Calculations
  const baseCumac = simulationChantiers.reduce((acc, c) => acc + c.volumeCumac, 0);

  let bonificationMultiplier = 1;
  let bonificationLabel = 'Aucune';

  if (bonificationType === 'coup_de_pouce') {
    bonificationMultiplier = 2;
    bonificationLabel = 'Coup de pouce (x2)';
  } else if (bonificationType === 'zni') {
    bonificationMultiplier = 2;
    bonificationLabel = 'ZNI (x2)';
  } else if (bonificationType === 'cpe') {
    const pct = Math.max(0, cpeEconomiePct || 0);
    if (cpeDuree === 'plus_de_10_ans') {
      bonificationMultiplier = 1 + (2 * (pct / 100));
      bonificationLabel = `CPE (>10 ans, ${pct}% éco) : x${bonificationMultiplier.toFixed(2)}`;
    } else {
      bonificationMultiplier = 1 + (pct / 100);
      bonificationLabel = `CPE (≤10 ans, ${pct}% éco) : x${bonificationMultiplier.toFixed(2)}`;
    }
  }

  const totalCumac = baseCumac * bonificationMultiplier;
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
          <div className="bg-white rounded-3xl p-6 border border-black/10 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-secondary" />
                <label htmlFor="dateDevis" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Date d'édition du devis
                </label>
              </div>
              <input
                id="dateDevis"
                type="date"
                value={dateDevis}
                onChange={(e) => setDateDevis(e.target.value)}
                className="rounded-xl border border-black/10 px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-secondary/50 cursor-pointer"
              />
            </div>

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

            {isLoggedIn && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-black text-secondary uppercase tracking-widest block">
                    Ajout rapide — Vos 3 chantiers les plus fréquents
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { code: 'BAR-EN-101', name: 'Combles / Toitures' },
                    { code: 'BAR-EN-102', name: 'Isolation Murs' },
                    { code: 'BAR-TH-104', name: 'Pompe à Chaleur' }
                  ].map((frequent) => {
                    const sheet = CEE_SHEETS_MAP[frequent.code];
                    if (!sheet) return null;
                    return (
                      <button
                        key={frequent.code}
                        type="button"
                        onClick={() => handleAddSheet(frequent.code)}
                        className="flex items-center justify-between p-3 rounded-2xl border border-black/10 bg-slate-50/90 hover:bg-white hover:border-secondary hover:shadow-xs transition-all text-left cursor-pointer group"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="text-[9px] font-mono font-bold text-slate-400 group-hover:text-secondary block">
                            {frequent.code}
                          </span>
                          <p className="text-xs font-black text-slate-800 truncate mt-0.5">
                            {frequent.name}
                          </p>
                        </div>
                        <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 group-hover:border-secondary group-hover:bg-secondary flex items-center justify-center shrink-0 transition-colors">
                          <Plus className="w-3.5 h-3.5 text-slate-600 group-hover:text-white" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bonifications CEE Card */}
          <div className="bg-white rounded-3xl p-6 border border-black/10 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-0.5">
                  Valorisation renforcée
                </span>
                <h3 className="font-black text-primary text-sm uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-secondary" /> Bonification CEE
                </h3>
              </div>
              <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Non cumulables
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Activez une bonification applicable à votre projet pour majorer le volume de CEE valorisé.
            </p>

            {/* Bonification Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'aucun', label: 'Aucune', desc: 'Standard' },
                { id: 'coup_de_pouce', label: 'Coup de pouce', desc: 'Bonification x2' },
                { id: 'zni', label: 'ZNI', desc: 'Outre-mer / Corse' },
                { id: 'cpe', label: 'CPE', desc: 'Perf. Énergétique' }
              ].map((bonif) => {
                const isSelected = bonificationType === bonif.id;
                return (
                  <button
                    key={bonif.id}
                    type="button"
                    onClick={() => setBonificationType(bonif.id as any)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-black/10 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">{bonif.label}</span>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-white bg-white/20' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white block"></span>}
                      </div>
                    </div>
                    <span className={`text-[10px] font-medium mt-1.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      {bonif.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* CPE conditional fields */}
            {bonificationType === 'cpe' && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-primary">
                    Paramètres du Contrat de Performance Énergétique (CPE)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Duration of contract */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Durée du contrat *
                    </label>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setCpeDuree('10_ans_ou_moins')}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                          cpeDuree === '10_ans_ou_moins'
                            ? 'bg-secondary/10 border-secondary text-primary font-black shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>10 ans ou moins</span>
                        <span className="text-[10px] text-slate-400 font-mono">Factor = 1 + %éco</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCpeDuree('plus_de_10_ans')}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                          cpeDuree === 'plus_de_10_ans'
                            ? 'bg-secondary/10 border-secondary text-primary font-black shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>Strictement plus de 10 ans</span>
                        <span className="text-[10px] text-slate-400 font-mono">Factor = 1 + 2×%éco</span>
                      </button>
                    </div>
                  </div>

                  {/* Percentage of energy savings */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Pourcentage d'économie d'énergie (%) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        placeholder="Ex: 20"
                        value={cpeEconomiePct}
                        onChange={(e) => setCpeEconomiePct(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                        className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-white font-bold text-slate-800 pr-8"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium leading-normal">
                      Saisissez le pourcentage d'économie d'énergie garanti contractuellement.
                    </p>
                  </div>
                </div>
              </div>
            )}
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
                <span className="text-slate-300">Volume de base</span>
                <span className="font-mono">{baseCumac.toFixed(2)} MWh</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10 text-xs font-bold uppercase tracking-wide">
                <span className="text-slate-300">Bonification</span>
                <span className={`font-mono text-xs ${bonificationType !== 'aucun' ? 'text-secondary font-black' : 'text-slate-300'}`}>
                  {bonificationLabel}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10 text-xs font-bold uppercase tracking-wide">
                <span className="text-slate-300">Volume bonifié</span>
                <span className="font-mono text-secondary font-black">{totalCumac.toFixed(2)} MWh</span>
              </div>
              <div className="py-4">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Aide financière valorisée</p>
                <div className="text-4xl font-black text-secondary mt-2 tracking-tight">
                  {totalPrime.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                  {isLoggedIn
                    ? `Basé sur les tarifs de votre contrat à la date du ${formatDateFR(dateDevis)}`
                    : "Basé sur un coefficient de valorisation fixe de 6 € / MWh cumac."}
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
