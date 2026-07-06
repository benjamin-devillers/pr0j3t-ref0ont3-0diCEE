import React, { useState } from 'react';
import { Search, Plus, Calculator, Download, AlertTriangle, CheckSquare, Eye, Copy, Trash2, ChevronDown, ChevronUp, FileSpreadsheet } from 'lucide-react';
import { Dossier, DossierStatus } from '../types';

interface DashboardProps {
  dossiers: Dossier[];
  companyInfo: any;
  onNavigateToWizard: (initialChantiers?: any) => void;
  onNavigateToSimulator: () => void;
  onViewDossier: (dossierId: string) => void;
  onDuplicateDossier: (dossierId: string) => void;
  onDeleteDossier: (dossierId: string) => void;
}

const STATUS_CHIPS: { label: string; status: DossierStatus | 'All'; color: string; bg: string }[] = [
  { label: 'Tous les statuts', status: 'All', color: 'text-slate-600', bg: 'bg-slate-100' },
  { label: 'Simulé', status: 'Simulé', color: 'text-amber-700', bg: 'bg-amber-100' },
  { label: 'À engager', status: 'À engager', color: 'text-blue-700', bg: 'bg-blue-100' },
  { label: 'Pré déclaré', status: 'Pré déclaré', color: 'text-purple-700', bg: 'bg-purple-100' },
  { label: 'Déclaré', status: 'Déclaré', color: 'text-indigo-700', bg: 'bg-indigo-100' },
  { label: 'Confirmé', status: 'Confirmé', color: 'text-cyan-700', bg: 'bg-cyan-100' },
  { label: 'En cours', status: 'Traitement en cours', color: 'text-orange-700', bg: 'bg-orange-100' },
  { label: 'Incomplet', status: 'Incomplet', color: 'text-red-700', bg: 'bg-red-100' },
  { label: 'Complet', status: 'Complet', color: 'text-green-700', bg: 'bg-green-100' },
  { label: 'Refusé', status: 'Refusé', color: 'text-rose-700', bg: 'bg-rose-100' },
];

export default function Dashboard({
  dossiers,
  companyInfo,
  onNavigateToWizard,
  onNavigateToSimulator,
  onViewDossier,
  onDuplicateDossier,
  onDeleteDossier
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<DossierStatus | 'All'>('All');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredDossiers = dossiers.filter(d => {
    const matchesSearch =
      d.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.beneficiaire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.beneficiaire.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.beneficiaire.raisonSociale || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.travaux.chantiers.some(c => c.ficheCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === 'All' || d.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Calculate high-level metrics for top cards
  const incompleteDossiers = dossiers.filter(d => d.status === 'Incomplet');
  const totalIncompleteAmount = incompleteDossiers.reduce((acc, d) => acc + d.primeTotale, 0);

  const completeDossiers = dossiers.filter(d => d.status === 'Complet');
  const totalCompleteAmount = completeDossiers.reduce((acc, d) => acc + d.primeTotale, 0);

  const handleExportCSV = () => {
    // Basic CSV mock export alert
    alert("Export de " + filteredDossiers.length + " dossiers partenaires généré au format excel/csv !");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 fade-in">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Tableau de bord</span>
          <h1 className="font-sans text-2xl md:text-3xl text-primary font-black tracking-tight">
            Espace Partenaire : <span className="text-secondary font-black">{companyInfo?.raisonSociale || 'Société RGE'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez vos dossiers CEE, effectuez des simulations de primes et suivez la validation de vos dossiers.
          </p>
        </div>
      </div>

      {/* Metric aggregate Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Incomplets */}
        <div className="bg-[#FFF1F2] border border-rose-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-rose-800 uppercase tracking-wider">Incomplets</p>
              <p className="text-2xl font-black text-rose-950 mt-2">{incompleteDossiers.length} dossiers</p>
            </div>
            <div className="bg-rose-100 p-2.5 rounded-xl text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-rose-800 mt-6 font-bold uppercase tracking-wide">
            Cumul prime : {totalIncompleteAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>

        {/* Card 2: Regles */}
        <div className="bg-[#ECFDF5] border border-emerald-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Règles & Validés</p>
              <p className="text-2xl font-black text-emerald-950 mt-2">
                {completeDossiers.length > 0 ? `${completeDossiers.length} validés` : 'Aucun dossier'}
              </p>
            </div>
            <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-700">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-800 mt-6 font-bold uppercase tracking-wide">
            Revenus garantis : {totalCompleteAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>

        {/* Card 3: New dossier shortcut */}
        <button
          onClick={() => onNavigateToWizard()}
          className="bg-white border border-black/10 rounded-3xl p-6 hover:border-secondary text-left transition-all shadow-xs group cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Nouveau dossier</p>
              <h4 className="font-black text-primary group-hover:text-secondary transition-colors text-base mt-2">Déclarer un dossier</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Créer ou charger un devis pour enregistrer un nouveau dossier CEE.</p>
            </div>
            <div className="bg-slate-50 group-hover:bg-primary group-hover:text-white p-2.5 rounded-xl text-primary border border-black/5 transition-all">
              <Plus className="w-5 h-5" />
            </div>
          </div>
          <span className="text-xs text-secondary font-black mt-6 flex items-center gap-1 group-hover:translate-x-1 transition-all uppercase tracking-wider">
            Créer un dossier →
          </span>
        </button>

        {/* Card 4: New simulation shortcut */}
        <button
          onClick={onNavigateToSimulator}
          className="bg-white border border-black/10 rounded-3xl p-6 hover:border-secondary text-left transition-all shadow-xs group cursor-pointer flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Simulateur</p>
              <h4 className="font-black text-primary group-hover:text-secondary transition-colors text-base mt-2">Simuler une prime</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Estimer le montant d'aide sans engagement avec notre simulateur.</p>
            </div>
            <div className="bg-slate-50 group-hover:bg-primary group-hover:text-white p-2.5 rounded-xl text-primary border border-black/5 transition-all">
              <Calculator className="w-5 h-5" />
            </div>
          </div>
          <span className="text-xs text-secondary font-black mt-6 flex items-center gap-1 group-hover:translate-x-1 transition-all uppercase tracking-wider">
            Ouvrir le simulateur →
          </span>
        </button>
      </div>

      {/* Search and export actions bar */}
      <div className="bg-white rounded-3xl border border-black/10 shadow-xs p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          {/* Search container */}
          <div className="relative flex-1 max-w-lg">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Rechercher par n° de dossier, bénéficiaire, fiche CEE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent text-xs bg-slate-50"
            />
          </div>

          {/* Export action */}
          <button
            onClick={handleExportCSV}
            className="bg-slate-50 hover:bg-slate-100 border border-black/10 text-slate-700 font-bold px-4 py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Exporter les dossiers
          </button>
        </div>

        {/* Filters Chips Scroll Container */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
          {STATUS_CHIPS.map(chip => (
            <button
              key={chip.status}
              onClick={() => setSelectedStatus(chip.status)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
                selectedStatus === chip.status
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-black/5'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main dossiers list table */}
      <div className="bg-white rounded-3xl border border-black/10 shadow-xs overflow-hidden">
        {filteredDossiers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Search className="w-8 h-8 mx-auto text-slate-300 mb-3" />
            <p className="font-bold text-slate-700">Aucun dossier trouvé</p>
            <p className="text-xs text-slate-400 mt-1">Essayez d'ajuster vos critères de recherche ou vos filtres de statut.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-black/10 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                  <th className="p-4 pl-6">N° Dossier</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Créé le</th>
                  <th className="p-4">Bénéficiaire</th>
                  <th className="p-4">Situation fiscale</th>
                  <th className="p-4">Type de travaux</th>
                  <th className="p-4 text-right">Prime Totale</th>
                  <th className="p-4 pr-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-xs">
                {filteredDossiers.map(dossier => {
                  const isExpanded = expandedRows[dossier.id];
                  const hasMultipleChantiers = dossier.travaux.chantiers.length > 1;

                  // Find status chip styling
                  const chipStyle = STATUS_CHIPS.find(c => c.status === dossier.status) || { color: 'text-slate-700', bg: 'bg-slate-100' };

                  return (
                    <React.Fragment key={dossier.id}>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-6 font-mono font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            {hasMultipleChantiers && (
                              <button
                                onClick={() => toggleRow(dossier.id)}
                                className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            )}
                            <span>{dossier.reference}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider ${chipStyle.bg} ${chipStyle.color}`}>
                            {dossier.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">{dossier.dateCreation}</td>
                        <td className="p-4 font-bold text-slate-800">
                          {dossier.beneficiaire.type === 'personne_physique' ? (
                            <span>{dossier.beneficiaire.prenom} {dossier.beneficiaire.nom}</span>
                          ) : (
                            <span title={dossier.beneficiaire.raisonSociale}>
                              {dossier.beneficiaire.raisonSociale} <span className="text-[10px] text-slate-400 font-bold uppercase">({dossier.beneficiaire.typePersonneMorale?.toUpperCase()})</span>
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {dossier.beneficiaire.situationFiscaleConnue ? (
                            <span className="text-secondary font-bold bg-secondary/10 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                              {dossier.beneficiaire.trancheRevenus?.replace('_', ' ').toUpperCase() || 'OUI'}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-bold uppercase text-[9px]">Non connue</span>
                          )}
                        </td>
                        <td className="p-4 font-bold text-slate-600">
                          {dossier.travaux.chantiers.map(c => c.ficheCode).join(', ')}
                        </td>
                        <td className="p-4 text-right font-black text-slate-900">
                          {dossier.primeTotale.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </td>
                        <td className="p-4 pr-6">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onViewDossier(dossier.id)}
                              className="text-primary hover:text-secondary p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-black/5 transition-all cursor-pointer"
                              title="Voir / Éditer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDuplicateDossier(dossier.id)}
                              className="text-slate-400 hover:text-primary p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-black/5 transition-all cursor-pointer"
                              title="Dupliquer"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteDossier(dossier.id)}
                              className="text-slate-400 hover:text-red-600 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-black/5 transition-all cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Collapsible details for multi-chantiers folders */}
                      {isExpanded && hasMultipleChantiers && (
                        <tr className="bg-slate-50/20">
                          <td colSpan={8} className="p-4 pl-12 border-t border-b border-black/5">
                            <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Détail des opérations du dossier :</p>
                              {dossier.travaux.chantiers.map((chantier, cIdx) => (
                                <div key={chantier.id} className="flex justify-between items-center bg-white border border-black/10 rounded-2xl p-4 shadow-2xs">
                                  <div className="flex items-center gap-3">
                                    <span className="bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-md font-mono">
                                      {chantier.ficheCode}
                                    </span>
                                    <span className="font-bold text-slate-800 text-xs">{chantier.ficheTitle}</span>
                                  </div>
                                  <div className="flex items-center gap-8 text-xs">
                                    <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wide">{chantier.volumeCumac} MWh cumac</span>
                                    <span className="font-black text-secondary">
                                      {chantier.prime.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
