import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Download, 
  BookOpen, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  HelpCircle,
  Calculator as CalcIcon,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface DocItem {
  id: string;
  title: string;
  category: 'prerequis' | 'memos' | 'notes';
  downloadName: string;
  keywords: string[];
  lastUpdated: string;
  renderContent: () => React.ReactNode;
}

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string>('plafonds-revenus');
  const [expandedCategories, setExpandedCategories] = useState({
    prerequis: true,
    memos: true,
    notes: true
  });

  // Category display names matching the image
  const categoryNames = {
    prerequis: 'Les prérequis',
    memos: 'Les mémos métiers',
    notes: "Les notes d'informations"
  };

  // State for interactive tools inside documentation
  // 1. Plafonds calculator state
  const [householdSize, setHouseholdSize] = useState<number>(2);
  const [householdRegion, setHouseholdRegion] = useState<'idf' | 'autres'>('autres');
  const [householdRfr, setHouseholdRfr] = useState<string>('24500');

  // 2. Justificatif checklist state
  const [justifChecks, setJustifChecks] = useState({
    namesMatch: false,
    addressMatches: false,
    lessThan3Months: false,
    correctYear: false,
    noHandwritten: false
  });

  // 3. Deadline calculator state
  const [devisDate, setDevisDate] = useState<string>('2026-01-10');
  const [travauxDate, setTravauxDate] = useState<string>('2026-03-20');

  // Static threshold table for 2026 CEE incomes
  const incomeThresholds = {
    idf: [
      { size: 1, tresModeste: 24500, modeste: 29500, intermediaire: 42000 },
      { size: 2, tresModeste: 36000, modeste: 43200, intermediaire: 58000 },
      { size: 3, tresModeste: 43200, modeste: 51800, intermediaire: 71000 },
      { size: 4, tresModeste: 50400, modeste: 60400, intermediaire: 84000 },
      { size: 5, tresModeste: 57700, modeste: 69200, intermediaire: 97000 },
      { size: 6, tresModeste: 64900, modeste: 77900, intermediaire: 109000 },
    ],
    autres: [
      { size: 1, tresModeste: 18500, modeste: 22500, intermediaire: 31000 },
      { size: 2, tresModeste: 27100, modeste: 32500, intermediaire: 44000 },
      { size: 3, tresModeste: 32600, modeste: 39100, intermediaire: 53000 },
      { size: 4, tresModeste: 38100, modeste: 45700, intermediaire: 62000 },
      { size: 5, tresModeste: 43600, modeste: 52300, intermediaire: 71000 },
      { size: 6, tresModeste: 49100, modeste: 58900, intermediaire: 80000 },
    ]
  };

  // Helper to compute income category
  const calculatedIncomeCategory = useMemo(() => {
    const rfrVal = parseFloat(householdRfr) || 0;
    const regionList = incomeThresholds[householdRegion];
    const sizeIndex = Math.min(householdSize, 6) - 1;
    const thresh = regionList[sizeIndex];
    
    if (rfrVal <= thresh.tresModeste) {
      return { label: 'Bleu / Très Modeste', color: 'bg-blue-50 border-blue-200 text-blue-700', percent: 'Jusqu\'à 90% d\'aides' };
    } else if (rfrVal <= thresh.modeste) {
      return { label: 'Jaune / Modeste', color: 'bg-yellow-50 border-yellow-200 text-yellow-800', percent: 'Jusqu\'à 75% d\'aides' };
    } else if (rfrVal <= thresh.intermediaire) {
      return { label: 'Violet / Intermédiaire', color: 'bg-purple-50 border-purple-200 text-purple-700', percent: 'Jusqu\'à 50% d\'aides' };
    } else {
      return { label: 'Rose / Supérieur', color: 'bg-rose-50 border-rose-200 text-rose-700', percent: 'Prime CEE classique' };
    }
  }, [householdSize, householdRegion, householdRfr]);

  // Helper to compute deadlines
  const computedDeadlines = useMemo(() => {
    if (!devisDate || !travauxDate) return null;
    const d1 = new Date(devisDate);
    const d2 = new Date(travauxDate);
    
    // Difference in days
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Limits
    const isDevisBeforeTravaux = diffDays >= 0;
    // Deadline to declare: usually must declare BEFORE or within a reasonable frame.
    // Delay to submit files: typically must submit to CEE validator within 6 to 12 months after work invoice date.
    const maxSubmissionDate = new Date(d2);
    maxSubmissionDate.setMonth(maxSubmissionDate.getMonth() + 6); // standard 6 months limit

    return {
      isValidOrder: isDevisBeforeTravaux,
      daysBetween: diffDays,
      limitDateStr: maxSubmissionDate.toLocaleDateString('fr-FR', { dateStyle: 'long' }),
      status: isDevisBeforeTravaux ? 'Conforme' : 'Non-conforme (Devis signé après travaux)'
    };
  }, [devisDate, travauxDate]);

  // List of all documents
  const documents: DocItem[] = [
    // 1. LES PRÉREQUIS
    {
      id: 'plafonds-revenus',
      title: 'Plafonds de revenus au 01/01/2026',
      category: 'prerequis',
      downloadName: 'Plafonds_Revenus_CEE_2026.txt',
      keywords: ['plafond', 'revenu', 'bareme', 'menage', 'fiscal', 'rfr', 'bleu', 'jaune', 'violet', 'rose'],
      lastUpdated: '01/01/2026',
      renderContent: () => (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3.5">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Barème Réglementaire National CEE 2026</span>
              Les plafonds de ressources déterminent les bonus d'aides "Coup de Pouce" ainsi que l'éligibilité aux différents échelons. Le revenu pris en compte est le <strong>Revenu Fiscal de Référence (RFR)</strong> de l'avis d'imposition N-1 (sur les revenus de l'année précédente).
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">Grille des plafonds de ressources</h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-3">Nombre de personnes</th>
                    <th className="p-3 text-blue-700 bg-blue-50/50">Ménages Très Modestes (Bleu)</th>
                    <th className="p-3 text-yellow-800 bg-yellow-50/50">Ménages Modestes (Jaune)</th>
                    <th className="p-3 text-purple-700 bg-purple-50/50">Ménages Intermédiaires (Violet)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { size: '1 personne', idf: '24 500 € / 18 500 €', idfRaw: 24500, aut: 18500, mod: '29 500 € / 22 500 €', int: '42 000 € / 31 000 €' },
                    { size: '2 personnes', idf: '36 000 € / 27 100 €', idfRaw: 36000, aut: 27100, mod: '43 200 € / 32 500 €', int: '58 000 € / 44 000 €' },
                    { size: '3 personnes', idf: '43 200 € / 32 600 €', idfRaw: 43200, aut: 32600, mod: '51 800 € / 39 100 €', int: '71 000 € / 53 000 €' },
                    { size: '4 personnes', idf: '50 400 € / 38 100 €', idfRaw: 50400, aut: 38100, mod: '60 400 € / 45 700 €', int: '84 000 € / 62 000 €' },
                    { size: '5 personnes', idf: '57 700 € / 43 600 €', idfRaw: 57700, aut: 43600, mod: '69 200 € / 52 300 €', int: '97 000 € / 71 000 €' },
                    { size: 'Par personne sup.', idf: '+7 200 € / +5 500 €', idfRaw: 7200, aut: 5500, mod: '+8 800 € / +6 600 €', int: '+12 000 € / +9 000 €' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-semibold text-slate-700">{row.size}</td>
                      <td className="p-3 text-blue-700 bg-blue-50/20 font-mono">{row.idf}</td>
                      <td className="p-3 text-yellow-800 bg-yellow-50/20 font-mono">{row.mod}</td>
                      <td className="p-3 text-purple-700 bg-purple-50/20 font-mono">{row.int}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic font-medium">Format des données : Île-de-France / Autres régions</p>
          </div>

          {/* Interactive Calculator Block */}
          <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500 rounded-lg text-white">
                <CalcIcon className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wider">Simulateur de Catégorie Client</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Région du chantier</label>
                <select 
                  value={householdRegion} 
                  onChange={(e: any) => setHouseholdRegion(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2 font-semibold"
                >
                  <option value="autres">Autres Régions (Province)</option>
                  <option value="idf">Île-de-France (IDF)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Composition du foyer</label>
                <select 
                  value={householdSize} 
                  onChange={(e: any) => setHouseholdSize(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2 font-semibold"
                >
                  <option value={1}>1 personne (Célibataire)</option>
                  <option value={2}>2 personnes (Couple)</option>
                  <option value={3}>3 personnes</option>
                  <option value={4}>4 personnes</option>
                  <option value={5}>5 personnes</option>
                  <option value={6}>6 personnes et plus</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">RFR Cumulé (Avis 2025/2026)</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={householdRfr}
                    onChange={(e) => setHouseholdRfr(e.target.value)}
                    placeholder="Ex: 24500"
                    className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2 pr-6 font-semibold font-mono"
                  />
                  <span className="absolute right-2.5 top-2 text-slate-400 font-bold text-[11px]">€</span>
                </div>
              </div>
            </div>

            <div className="border-t border-emerald-100 pt-3.5 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs space-y-1 text-center sm:text-left">
                <span className="text-slate-500 font-medium">Catégorie calculée instantanément :</span>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className={`px-2.5 py-1 rounded-full border text-xs font-black uppercase tracking-wider ${calculatedIncomeCategory.color}`}>
                    {calculatedIncomeCategory.label}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-emerald-100 rounded-xl px-4 py-2.5 shadow-2xs text-center">
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">Taux de financement estimé</span>
                <span className="text-sm font-black text-slate-800">{calculatedIncomeCategory.percent}</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'guide-copropriete',
      title: 'Guide pour la déclaration d’un chantier de copropriété',
      category: 'prerequis',
      downloadName: 'Guide_Declaration_Copropriete_CEE.txt',
      keywords: ['copro', 'copropriete', 'syndic', 'conseil', 'pv', 'ag', 'lot', 'tantieme', 'syndicat'],
      lastUpdated: '12/11/2025',
      renderContent: () => (
        <div className="space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            La déclaration d'un chantier d'efficacité énergétique (CEE) en copropriété est assujettie à des règles strictes en raison du caractère collectif de la décision et de la ventilation des tantièmes de chauffage ou d'isolation.
          </p>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Pièces obligatoires au dossier Copropriété</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'PV d\'Assemblée Générale', desc: 'Validant les travaux, le devis retenu et la délégation de signature au syndic.' },
                { title: 'Fiche Synthèse Copropriété', desc: 'Établie par l\'ANAH ou le syndic avec le nombre de lots résidentiels.' },
                { title: 'Tableau des Tantièmes', desc: 'Signé par le syndic identifiant la répartition exacte des quotes-parts.' },
                { title: 'Attestation sur l\'Honneur', desc: 'Signée par le représentant légal (Syndic de copropriété en exercice).' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 hover:border-blue-200 transition-all">
                  <span className="text-xs font-bold text-slate-800 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-500 block leading-tight">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Point de vigilance réglementaire</span>
              Tous les devis et factures doivent être libellés au nom exact du <strong>Syndicat des Copropriétaires</strong> représenté par son Syndic en exercice, avec l'adresse physique du chantier. Les mentions raturées ou imprécises invalident immédiatement la prime.
            </div>
          </div>
        </div>
      )
    },
    // 2. LES MÉMOS MÉTIERS
    {
      id: 'controle-sur-site',
      title: 'Fiche mémo sur les conseils lors d’un contrôle sur site',
      category: 'memos',
      downloadName: 'Memo_Controle_Sur_Site.txt',
      keywords: ['controle', 'cofrac', 'audit', 'inspecteur', 'conformite', 'chantier', 'visite'],
      lastUpdated: '15/02/2026',
      renderContent: () => (
        <div className="space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            Les contrôles sur site COFRAC sont réalisés de façon aléatoire ou ciblée. Ils valident la réalité des travaux et le respect des critères de performances techniques exigés par les fiches d'opérations standardisées.
          </p>

          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Les 4 règles d'or pour réussir l'audit</h4>
            {[
              { label: "1. Accessibilité totale des équipements", text: "L'inspecteur doit pouvoir vérifier visuellement et mesurer les caractéristiques techniques. Assurez-vous que l'accès aux combles, aux sous-sols ou à la chaufferie est dégagé et sécurisé." },
              { label: "2. Plaque signalétique visible et lisible", text: "La plaque du fabricant (marque, modèle, puissance, numéro de série) de la pompe à chaleur ou de la chaudière doit être parfaitement accessible et correspondre à la facture." },
              { label: "3. Cohérence absolue des dimensions", text: "Les métrés réels d'isolation (m² posés) ou la puissance installée mesurés par l'auditeur ne doivent pas comporter un écart supérieur à la marge réglementaire par rapport aux documents." },
              { label: "4. Information préalable du bénéficiaire", text: "Le client final doit être informé du déroulement du contrôle et de la nécessité de sa présence. Un client mécontent ou non informé peut générer un refus de visite qualifié d'échec de contrôle." }
            ].map((rule, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 hover:bg-slate-50/50 transition-colors">
                <span className="text-xs font-bold text-slate-800 block">{rule.label}</span>
                <span className="text-[11px] text-slate-500 block leading-relaxed">{rule.text}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'delais-depot',
      title: 'Fiche mémo sur le délai pour déposer un dossier CEE',
      category: 'memos',
      downloadName: 'Memo_Delais_Depot_CEE.txt',
      keywords: ['delai', 'depot', 'calendrier', 'dossier', 'facture', 'signature', 'date', 'retroactif'],
      lastUpdated: '05/03/2026',
      renderContent: () => (
        <div className="space-y-6">
          <p className="text-xs text-slate-600 leading-relaxed">
            Le non-respect des échéances réglementaires de dépôt constitue le premier motif de rejet définitif des primes CEE par le Ministère. Suivez ce guide pour sécuriser votre calendrier.
          </p>

          {/* Interactive Calculator for deadlines */}
          <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-500 rounded-lg text-white">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-blue-800 uppercase tracking-wider">Calculateur d'Échéance Légale</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Date de signature du devis</label>
                <input 
                  type="date"
                  value={devisDate}
                  onChange={(e) => setDevisDate(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2 font-semibold font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Date d'achèvement / Facture</label>
                <input 
                  type="date"
                  value={travauxDate}
                  onChange={(e) => setTravauxDate(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2 font-semibold font-mono"
                />
              </div>
            </div>

            {computedDeadlines && (
              <div className="border-t border-blue-100 pt-3.5 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Durée estimée des travaux :</span>
                  <span className="font-bold font-mono text-slate-800">{computedDeadlines.daysBetween} jours</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Date limite réglementaire de dépôt :</span>
                  <span className="font-bold text-red-600 font-mono bg-red-50 px-2 py-0.5 rounded border border-red-100">{computedDeadlines.limitDateStr}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-500">Statut de la chronologie :</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${computedDeadlines.isValidOrder ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                    {computedDeadlines.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Chronologie standard Abokine</h4>
            <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-4">
              {[
                { step: "Étape 1 : Cadre de contribution (AVANT signature)", text: "Le devis ne doit en aucun cas être signé avant l'acceptation de notre offre de prime CEE par le client (date de preuve d'engagement)." },
                { step: "Étape 2 : Réalisation des travaux", text: "Les travaux doivent être réalisés par un professionnel certifié RGE à la date de signature et à la date d'achèvement." },
                { step: "Étape 3 : Signature de l'Attestation sur l'Honneur", text: "Elle doit être signée par le client et l'artisan au plus tard à la date d'émission de la facture de fin de travaux." },
                { step: "Étape 4 : Dépôt du dossier complet", text: "Vous disposez d'un délai maximum de 6 mois après la date de facturation pour déposer le dossier complet sur notre portail." }
              ].map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-xs" />
                  <span className="text-xs font-bold text-slate-800 block leading-tight">{item.step}</span>
                  <p className="text-[11px] text-slate-500 leading-normal mt-0.5">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'justificatif-domicile',
      title: 'Fiche mémo sur le justificatif de domicile',
      category: 'memos',
      downloadName: 'Memo_Justificatifs_Domicile_CEE.txt',
      keywords: ['justificatif', 'domicile', 'facture', 'edf', 'loyer', 'quittance', 'titre', 'adresse', 'validite'],
      lastUpdated: '18/01/2026',
      renderContent: () => (
        <div className="space-y-6">
          <p className="text-xs text-slate-600 leading-relaxed">
            La pièce de justificatif de domicile est le document le plus souvent rejeté pour cause de non-conformité administrative. Elle atteste du lien entre le bénéficiaire et l'adresse physique du chantier.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
              <span className="text-xs font-black text-emerald-800 uppercase tracking-wider block">Documents autorisés</span>
              <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-1">
                <li>Dernier avis d'imposition (impôt foncier)</li>
                <li>Facture d'électricité ou gaz (&lt; 3 mois)</li>
                <li>Facture de téléphone fixe ou internet (&lt; 3 mois)</li>
                <li>Quittance de loyer émise par un organisme officiel</li>
                <li>Attestation d'assurance habitation (&lt; 3 mois)</li>
              </ul>
            </div>

            <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl space-y-1">
              <span className="text-xs font-black text-rose-800 uppercase tracking-wider block">Documents interdits</span>
              <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-1">
                <li>Facture de téléphone mobile</li>
                <li>Facture d'eau non nominative</li>
                <li>Quittance de loyer manuscrite rédigée par un particulier</li>
                <li>Documents bancaires ou relevés de compte</li>
                <li>Déclaration de travaux simple</li>
              </ul>
            </div>
          </div>

          {/* Interactive Tool - Verification Checkbox */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-200 rounded-lg text-slate-700">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Outil d'Audit Express du Justificatif</h4>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Cochez les points ci-dessous pour confirmer que le justificatif de domicile de votre client est conforme :
            </p>

            <div className="space-y-2">
              {[
                { key: 'namesMatch', label: 'Les noms/prénoms correspondent exactement au Devis' },
                { key: 'addressMatches', label: 'L\'adresse postale du chantier correspond exactement à la ligne du Devis' },
                { key: 'lessThan3Months', label: 'Le document a moins de 3 mois (pour factures d\'énergie/téléphone)' },
                { key: 'correctYear', label: 'L\'avis d\'imposition concerne la bonne année fiscale réglementaire' },
                { key: 'noHandwritten', label: 'Le document ne comporte aucune rature, correction ou note manuscrite' }
              ].map((item) => (
                <label key={item.key} className="flex items-start gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={(justifChecks as any)[item.key]}
                    onChange={(e) => setJustifChecks({ ...justifChecks, [item.key]: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary w-3.5 h-3.5"
                  />
                  <span className="text-xs text-slate-600 font-medium leading-none">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Résultat du contrôle interne :</span>
              {Object.values(justifChecks).every(Boolean) ? (
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✔ Justificatif Éligible
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ⚠ Contrôle incomplet
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'multi-chantiers',
      title: 'Fiche mémo sur le multi-chantiers',
      category: 'memos',
      downloadName: 'Memo_Multi_Chantiers_CEE.txt',
      keywords: ['multi-chantiers', 'plusieurs', 'groupement', 'operation', 'adresse', 'artisan', 'lots'],
      lastUpdated: '08/11/2025',
      renderContent: () => (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            La gestion de chantiers multiples pour un même bénéficiaire (ou sur des adresses différentes) requiert de regrouper rigoureusement les pièces pour éviter les doublons ou rejets.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs text-slate-600">
            <span className="font-bold text-slate-800 block">Principes clés :</span>
            <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
              <li><strong>Une opération par fiche standardisée :</strong> Si le client effectue l'isolation et change de chaudière, ce sont deux dossiers distincts avec leurs propres attestations sur l'honneur.</li>
              <li><strong>Numérotation distincte :</strong> Chaque adresse physique doit faire l'objet d'un numéro d'affaire unique.</li>
              <li><strong>Facturation détaillée :</strong> La facture doit ventiler les coûts et les surfaces/puissances de chaque adresse de manière univoque.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'sous-traitance',
      title: 'Fiche mémo sur la sous-traitance dans le secteur résidentiel',
      category: 'memos',
      downloadName: 'Memo_Sous_Traitance_CEE.txt',
      keywords: ['sous-traitance', 'sous-traitant', 'rge', 'residentiel', 'contrat', 'responsabilite', 'assurance'],
      lastUpdated: '14/12/2025',
      renderContent: () => (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            La sous-traitance de la pose des travaux d'efficacité énergétique est encadrée par la loi du 31 décembre 1975 et fait l'objet de contrôles renforcés de l'administration.
          </p>

          <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl space-y-1">
            <span className="text-xs font-black text-red-800 uppercase tracking-wider block flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Interdiction de sous-traitance en cascade
            </span>
            <span className="text-[11px] text-slate-600 block leading-relaxed">
              Le sous-traitant de premier rang ne peut en aucun cas confier à son tour la pose des équipements à un autre artisan (sous-traitant de second rang). Cette pratique entraîne la nullité immédiate de la prime CEE et un signalement aux organismes de qualification RGE.
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-800 block">Les pièces requises en cas de sous-traitance :</span>
            <ul className="list-decimal list-inside space-y-1">
              <li>Le contrat de sous-traitance signé mentionnant expressément le recours aux CEE.</li>
              <li>Le certificat RGE du sous-traitant en cours de validité à la date des travaux.</li>
              <li>La mention claire sur l'attestation sur l'honneur de la raison sociale du sous-traitant.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'gestion-sav',
      title: 'Fiche mémo sur la gestion des SAV',
      category: 'memos',
      downloadName: 'Memo_Gestion_SAV_CEE.txt',
      keywords: ['sav', 'garantie', 'panne', 'maintenance', 'intervention', 'decennale', 'biennale', 'reclamation'],
      lastUpdated: '22/02/2026',
      renderContent: () => (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            La conformité post-travaux intègre la gestion des SAV (Services Après-Vente). Un suivi rigoureux permet de maintenir l'éligibilité aux aides dans le cadre du contrôle de la performance réelle des chantiers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { title: "Garantie Biennale", days: "2 ans", desc: "Concerne le bon fonctionnement des équipements mobiles installés (pompes, thermostats)." },
              { title: "Garantie Décennale", days: "10 ans", desc: "Concerne les dommages compromettant la solidité de l'ouvrage ou le rendant impropre à sa destination." },
              { title: "SLA d'Intervention", days: "48h max", desc: "Délai recommandé de prise en charge d'une panne critique de chauffage en période hivernale." }
            ].map((box, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{box.title}</span>
                <span className="text-base font-black text-primary block">{box.days}</span>
                <span className="text-[10px] text-slate-500 block leading-tight">{box.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    // 3. LES NOTES D'INFORMATIONS
    {
      id: 'note-mai-2024',
      title: 'Note d\'informations – Mai 2024',
      category: 'notes',
      downloadName: 'Note_Informations_Mai_2024.txt',
      keywords: ['note', 'mai', '2024', 'reglement', 'ministere', 'reforme'],
      lastUpdated: '15/05/2024',
      renderContent: () => (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
            <Calendar className="w-4 h-4" />
            <span>Publié le 15 Mai 2024</span>
          </div>

          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Mise en application du décret de simplification</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cette note précise les modalités d'application du décret n°2024-XXXX portant sur la simplification de l'accès à MaPrimeRénov' et aux aides de certificats d'économies d'énergie (CEE) pour le secteur résidentiel individuel.
          </p>

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 text-xs text-slate-600 space-y-1.5 leading-relaxed">
            <span className="font-bold text-slate-800">Modifications substantielles :</span>
            <ul className="list-disc list-inside space-y-1">
              <li>Assouplissement des critères d'éligibilité pour les monogestes d'isolation.</li>
              <li>Prolongation des barèmes Coup de Pouce Chauffage jusqu'au 31 décembre de l'année courante.</li>
              <li>Simplification des formulaires d'Attestation sur l'Honneur unifiée.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'note-janvier-2024',
      title: 'Note d\'informations – Janvier 2024',
      category: 'notes',
      downloadName: 'Note_Informations_Janvier_2024.txt',
      keywords: ['note', 'janvier', '2024', 'reforme', 'annee', 'maprimerenov', 'synergie'],
      lastUpdated: '02/01/2024',
      renderContent: () => (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
            <Calendar className="w-4 h-4" />
            <span>Publié le 2 Janvier 2024</span>
          </div>

          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Réforme globale MaPrimeRénov et CEE 2024</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Instructions cadres relatives à la mise en œuvre des règles de cumul entre le dispositif d'État MaPrimeRénov' et les Certificats d'Économies d'Énergie. Cette note définit le parcours d'accompagnement obligatoire (Mon Accompagnateur Rénov') pour les rénovations globales d'ampleur.
          </p>
        </div>
      )
    },
    {
      id: 'note-septembre-2023',
      title: 'Note d\'informations – Septembre 2023',
      category: 'notes',
      downloadName: 'Note_Informations_Septembre_2023.txt',
      keywords: ['note', 'septembre', '2023', 'precedent', 'ancien', 'historique'],
      lastUpdated: '10/09/2023',
      renderContent: () => (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
            <Calendar className="w-4 h-4" />
            <span>Publié le 10 Septembre 2023</span>
          </div>

          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Évolution de la fiche d'isolation de combles (BAR-EN-101)</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Note relative aux nouvelles exigences de résistance thermique minimale R &ge; 7 m².K/W pour l'isolation de combles perdus, et aux obligations de report photographique géolocalisé pour les chantiers d'isolation thermique par l'extérieur.
          </p>
        </div>
      )
    }
  ];

  // Search filter logic
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const query = searchQuery.toLowerCase().trim();
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(query) ||
      doc.keywords.some(kw => kw.includes(query))
    );
  }, [searchQuery]);

  // Expand categories that contain matching search results
  React.useEffect(() => {
    if (searchQuery.trim()) {
      const hasPrerequis = filteredDocuments.some(d => d.category === 'prerequis');
      const hasMemos = filteredDocuments.some(d => d.category === 'memos');
      const hasNotes = filteredDocuments.some(d => d.category === 'notes');
      
      setExpandedCategories({
        prerequis: hasPrerequis,
        memos: hasMemos,
        notes: hasNotes
      });
    }
  }, [filteredDocuments, searchQuery]);

  // Selected document content
  const selectedDoc = useMemo(() => {
    return documents.find(doc => doc.id === selectedDocId) || documents[0];
  }, [selectedDocId]);

  // Handle document download trigger
  const handleDownloadDoc = (doc: DocItem) => {
    const header = `=== ABOKINE ADEENA ===\nRAPPORT DOCUMENTATION OFFICIELLE CEE\nDocument : ${doc.title}\nCatégorie : ${categoryNames[doc.category]}\nMise à jour : ${doc.lastUpdated}\n\n`;
    
    let bodyText = '';
    if (doc.id === 'plafonds-revenus') {
      bodyText = `Plafonds de revenus 2026 - Certificats d'Économies d'Énergie\n\nÎle-de-France :\n- 1 pers : 24 500 €\n- 2 pers : 36 000 €\n- 3 pers : 43 200 €\n- 4 pers : 50 400 €\n- 5 pers : 57 700 €\n\nAutres départements :\n- 1 pers : 18 500 €\n- 2 pers : 27 100 €\n- 3 pers : 32 600 €\n- 4 pers : 38 100 €\n- 5 pers : 43 600 €\n`;
    } else if (doc.id === 'guide-copropriete') {
      bodyText = `Guide Déclaration Copropriété CEE\n\nPièces Obligatoires :\n1. PV d'Assemblée Générale\n2. Fiche de Synthèse\n3. Tableau des Tantièmes de Répartition\n4. Attestation sur l'Honneur signée par le Syndic.`;
    } else {
      bodyText = `Contenu détaillé disponible dans votre espace partenaire OdiCEE. Référence de la fiche : ${doc.id}.\nConsultez l'application en ligne pour utiliser les outils interactifs et les simulateurs intégrés.`;
    }

    const fullText = header + bodyText + `\n\nDocument généré de façon sécurisée le ${new Date().toLocaleDateString('fr-FR')}.`;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", doc.downloadName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintDoc = () => {
    window.print();
  };

  const toggleCategory = (cat: 'prerequis' | 'memos' | 'notes') => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Title Header Section */}
      <div className="bg-gradient-to-r from-primary to-slate-800 rounded-3xl p-6 text-white shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial-gradient flex items-center justify-center">
          <BookOpen className="w-40 h-40 text-white shrink-0" />
        </div>
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="bg-secondary/20 text-secondary border border-secondary/30 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
              Boîtes à outils
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-pulse" />
              Interactif
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Boîtes à outils : vous guider dans votre parcours et sécuriser le financement CEE
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Accédez à toutes les documentations officielles réglementaires de l'arborescence Abokine Adeena. Recherchez un document, utilisez les calculatrices de conformité en temps réel et téléchargez vos mémos.
          </p>
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Interactive Tree & Search (Cols 5) */}
        <div className="lg:col-span-5 bg-white border border-black/5 rounded-3xl p-5 shadow-xs space-y-4">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher un mémo, un barème..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-[10px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase"
              >
                Vider
              </button>
            )}
          </div>

          {/* Collapsible Tree wrapper styled like the PDF */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
            <div className="p-4 border-b border-slate-100 bg-white">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Arborescence Abokine / Adeena
              </span>
            </div>

            <div className="p-3.5 space-y-4">
              
              {/* Category Loop */}
              {(['prerequis', 'memos', 'notes'] as const).map((catKey) => {
                const catDocs = filteredDocuments.filter(d => d.category === catKey);
                const isExpanded = expandedCategories[catKey];
                
                if (searchQuery.trim() && catDocs.length === 0) return null;

                return (
                  <div key={catKey} className="space-y-1">
                    
                    {/* Category Header */}
                    <button 
                      onClick={() => toggleCategory(catKey)}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-100/80 transition-all cursor-pointer group"
                    >
                      <span className="text-xs font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-primary shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        {categoryNames[catKey]}
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full group-hover:bg-slate-200">
                        {catDocs.length}
                      </span>
                    </button>

                    {/* Category Items (collapsible) */}
                    {isExpanded && (
                      <div className="pl-3.5 border-l-2 border-slate-200 ml-3.5 space-y-1 pt-1">
                        {catDocs.map((doc) => {
                          const isSelected = selectedDocId === doc.id;
                          return (
                            <div key={doc.id} className="flex items-center justify-between group rounded-xl">
                              <button
                                onClick={() => setSelectedDocId(doc.id)}
                                className={`flex-1 text-left p-2 rounded-xl text-[11px] font-bold transition-all leading-normal flex items-start gap-2 cursor-pointer ${
                                  isSelected 
                                    ? 'bg-primary text-white shadow-xs' 
                                    : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
                                }`}
                              >
                                <FileText className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isSelected ? 'text-secondary' : 'text-slate-400'}`} />
                                <span className="flex-1">{doc.title}</span>
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadDoc(doc);
                                }}
                                title="Télécharger le document"
                                className={`p-1.5 rounded-lg shrink-0 ml-1 transition-all border border-transparent cursor-pointer ${
                                  isSelected 
                                    ? 'text-white hover:bg-white/10' 
                                    : 'text-slate-400 hover:text-emerald-600 hover:bg-white hover:border-slate-200'
                                }`}
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })}

              {filteredDocuments.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 font-bold space-y-1">
                  <AlertTriangle className="w-8 h-8 mx-auto text-slate-300" />
                  <span>Aucun document trouvé</span>
                  <p className="text-[10px] font-medium">Réessayez avec d'autres mots-clés.</p>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Right Side: Active Document Reader View (Cols 7) */}
        <div className="lg:col-span-7 bg-white border border-black/5 rounded-3xl p-6 shadow-xs space-y-6">
          
          {/* Reader Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">
                {categoryNames[selectedDoc.category]}
              </span>
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                {selectedDoc.title}
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <span>Dernière révision réglementaire :</span>
                <span className="font-mono text-slate-500">{selectedDoc.lastUpdated}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={handlePrintDoc}
                title="Imprimer cette page"
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center shadow-2xs"
              >
                <Printer className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => handleDownloadDoc(selectedDoc)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger (.TXT)</span>
              </button>
            </div>
          </div>

          {/* Reader Body Content (React Component) */}
          <div className="prose prose-sm max-w-none text-xs">
            {selectedDoc.renderContent()}
          </div>

          {/* Reader Footer Info Disclaimer */}
          <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-slate-400 shrink-0" />
            <p className="text-[10px] text-slate-400 leading-normal font-medium">
              Ce document est issu du corpus de règles techniques de la DGEC (Direction Générale de l'Énergie et du Climat) mis à jour régulièrement par Abokine Adeena pour garantir la parfaite conformité de vos dossiers de demande CEE.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
