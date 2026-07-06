import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  Upload, 
  FileText, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Edit, 
  Plus, 
  Mail, 
  Phone, 
  Check, 
  Info, 
  X, 
  Eye,
  FileCheck,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface CompanyProfileProps {
  companyInfo: {
    raisonSociale: string;
    siret: string;
    adresse: string;
    codePostal: string;
    ville: string;
    representantLegal: string;
    fonctionRepresentant: string;
    formeJuridique: string;
    urssafIssueDate: string; // YYYY-MM-DD
    urssafFileName: string;
  };
  onUpdateCompany: (updatedInfo: any) => void;
  onBack: () => void;
}

interface CompanyUser {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  profil: 'Administrateur espace partenaire' | 'Gestionnaire espace partenaire' | 'Commercial';
  telFixe: string;
  telPortable: string;
  newsletter: boolean;
}

const PARTNERSHIP_AGREEMENTS = [
  {
    id: 'conv_cee_2026',
    title: 'Convention P6',
    date: '12 Janvier 2026',
    status: 'Signée',
    content: `CONVENTION DE PARTENARIAT ET D'AFFILIATION CEE - EXERCICE 2026
------------------------------------------------------------------
Entre les soussignés :
La société ODICEE SAS, agissant en tant que délégataire de l'obligation de Certificats d'Économies d'Énergie (CEE).
Et le Partenaire RGE affilié désigné dans les informations de la société.

IL A ÉTÉ CONVENU CE QUI SUIT :
1. Objet du contrat : Le présent contrat a pour objet de définir les conditions dans lesquelles le Partenaire confie à ODICEE la valorisation exclusive des Certificats d'Économies d'Énergie (CEE) générés par les travaux de rénovation énergétique qu'il réalise.
2. Engagements du Partenaire : Le partenaire s'engage à respecter scrupuleusement les fiches d'opérations standardisées (ex: BAR-EN-101, BAR-TH-113), à collecter les pièces justificatives réglementaires, et à faire signer le Cadre de Contribution avant tout engagement de travaux.
3. Rémunération : ODICEE reversera la prime CEE selon la répartition convenue lors du montage du dossier (minimum légal de 50% de la part client respecté).
4. Clause d'audit : Le Partenaire accepte de soumettre ses chantiers à des contrôles COFRAC aléatoires requis par le PNCEE. Tout manquement entraînera le rejet du dossier.`
  },
  {
    id: 'charte_qualite_rge',
    title: 'Convention P5',
    date: '28 Mars 2026',
    status: 'Signée',
    content: `CHARTE D'ENGAGEMENT QUALITÉ ET CONTRÔLE RGE
--------------------------------------------------
Le Partenaire s'engage sur l'honneur à maintenir ses qualifications RGE actives pendant toute la durée de réalisation des chantiers.

ENGAGEMENTS CLÉS :
1. Devoir de conseil : Évaluer de manière neutre et objective les besoins thermiques globaux du bâtiment.
2. Conformité technique : Mettre en œuvre des isolants et équipements thermiques certifiés (ACERMI, NF, CSTB) respectant les résistances thermiques (R) minimales ou efficacités énergétiques saisonnières requises.
3. Transparence : Fournir les fiches techniques des matériaux et autoriser l'organisme de contrôle tiers à inspecter les chantiers achevés ou en cours.
4. Tolérance Zéro : Toute fausse déclaration ou falsification de document entraînera la résiliation immédiate du partenariat.`
  },
  {
    id: 'mandat_signature',
    title: 'Convention P4',
    date: '15 Mai 2026',
    status: 'Active',
    content: `MANDAT DE DELEGATION DE SIGNATURE ELECTRONIQUE
--------------------------------------------------
Le bénéficiaire des travaux peut mandater le Partenaire RGE pour initier le processus de signature électronique du Cadre de Contribution CEE.

CONDITIONS D'APPLICATION :
1. Consentement préalable : Le bénéficiaire doit explicitement accepter de recevoir le lien de signature par email.
2. Traçabilité des adresses IP : Le système enregistrera l'adresse IP, la date, l'heure et l'empreinte cryptographique de chaque validation d'accord.
3. Archivage probatoire : Les preuves d'accord de signature seront archivées pendant une durée légale de 10 ans.`
  }
];

export default function CompanyProfile({ companyInfo, onUpdateCompany, onBack }: CompanyProfileProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'users' | 'documents'>('info');
  const [selectedDocId, setSelectedDocId] = useState<string>('urssaf');
  
  // Tab 1 States
  const [editedCompany, setEditedCompany] = useState({ ...companyInfo });
  const [selectedAgreement, setSelectedAgreement] = useState<string>('conv_cee_2026');
  
  // Modal state for company info changes
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmPhraseInput, setConfirmPhraseInput] = useState('');
  const [appDate, setAppDate] = useState('');
  const [modalError, setModalError] = useState('');

  // URSSAF file upload state
  const [urssafFile, setUrssafFile] = useState<string | null>(companyInfo.urssafFileName);
  const [urssafIssueDate, setUrssafIssueDate] = useState<string>(companyInfo.urssafIssueDate);
  const [isUrssafDragging, setIsUrssafDragging] = useState(false);

  // Tab 2 States (Users list)
  const [users, setUsers] = useState<CompanyUser[]>([
    {
      id: 'usr-1',
      prenom: 'Camille',
      nom: 'HONNETTE',
      email: 'camille.honnette@ouatelse.fr',
      profil: 'Gestionnaire espace partenaire',
      telFixe: '01 45 67 89 10',
      telPortable: '06 12 34 56 78',
      newsletter: true
    },
    {
      id: 'usr-2',
      prenom: 'Gérard',
      nom: 'MENVUCA',
      email: 'gerard.menvuca@ouatelse.fr',
      profil: 'Commercial',
      telFixe: '01 23 45 67 89',
      telPortable: '06 98 76 54 32',
      newsletter: false
    },
    {
      id: 'usr-3',
      prenom: 'Jean',
      nom: 'Rénovateur',
      email: 'jean.renovateur@ouatelse.fr',
      profil: 'Administrateur espace partenaire',
      telFixe: '01 02 03 04 05',
      telPortable: '06 00 00 00 00',
      newsletter: true
    }
  ]);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<Omit<CompanyUser, 'id'>>({
    prenom: '',
    nom: '',
    email: '',
    profil: 'Commercial',
    telFixe: '',
    telPortable: '',
    newsletter: false
  });

  // Current date defined in system metadata
  const TODAY_STR = '2026-07-04';

  // Check if anything has been modified in the company form compared to parent props
  const isCompanyModified = 
    editedCompany.raisonSociale !== companyInfo.raisonSociale ||
    editedCompany.siret !== companyInfo.siret ||
    editedCompany.adresse !== companyInfo.adresse ||
    editedCompany.codePostal !== companyInfo.codePostal ||
    editedCompany.ville !== companyInfo.ville ||
    editedCompany.representantLegal !== companyInfo.representantLegal ||
    editedCompany.fonctionRepresentant !== companyInfo.fonctionRepresentant ||
    editedCompany.formeJuridique !== companyInfo.formeJuridique ||
    urssafIssueDate !== companyInfo.urssafIssueDate ||
    urssafFile !== companyInfo.urssafFileName;

  // Filter users having the profile "administrateur espace partenaire"
  const adminUsers = users.filter(u => u.profil === 'Administrateur espace partenaire');

  // Compute URSSAF Expiration status
  const getUrssafStatus = () => {
    if (!urssafIssueDate) return { label: 'Inconnu', color: 'text-slate-400', bg: 'bg-slate-100', daysLeft: 0, alert: false, expired: false };
    
    // Valid for 6 months (approx 183 days)
    const issue = new Date(urssafIssueDate);
    const expiry = new Date(issue.getTime());
    expiry.setMonth(expiry.getMonth() + 6);
    
    const today = new Date(TODAY_STR);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    const expired = daysLeft <= 0;
    const alert = daysLeft > 0 && daysLeft <= 15;
    
    let label = 'Valide';
    let color = 'text-emerald-700 bg-emerald-100 border-emerald-200';
    if (expired) {
      label = 'Expiré';
      color = 'text-rose-700 bg-rose-100 border-rose-200';
    } else if (alert) {
      label = 'Expire bientôt';
      color = 'text-amber-700 bg-amber-100 border-amber-200 animate-pulse';
    }
    
    return {
      label,
      color,
      daysLeft,
      alert,
      expired,
      expiryDate: expiry.toISOString().split('T')[0]
    };
  };

  const urssafStatus = getUrssafStatus();

  // Save company changes triggered
  const handleSaveCompanyClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCompanyModified) return;

    // Validate inputs
    if (!editedCompany.raisonSociale || !editedCompany.siret || !editedCompany.adresse || !editedCompany.codePostal || !editedCompany.ville) {
      alert("Veuillez renseigner tous les champs obligatoires.");
      return;
    }

    // Default application date to today
    setAppDate(TODAY_STR);
    setConfirmPhraseInput('');
    setModalError('');
    setShowConfirmModal(true);
  };

  // Confirm new company version
  const handleConfirmCompanySave = () => {
    setModalError('');

    // Date check: cannot be in the past (before TODAY_STR)
    if (!appDate) {
      setModalError("La date d'application est obligatoire.");
      return;
    }

    const appDateTime = new Date(appDate).getTime();
    const todayTime = new Date(TODAY_STR).getTime();

    if (appDateTime < todayTime) {
      setModalError("La date d'application ne peut pas être une date passée.");
      return;
    }

    // Phrase match check
    const requiredPhrase = "je confirme la création d'une nouvelle version des informations de ma société";
    if (confirmPhraseInput.trim().toLowerCase() !== requiredPhrase.toLowerCase()) {
      setModalError("La phrase de confirmation saisie ne correspond pas exactement.");
      return;
    }

    // Success! Update parent
    onUpdateCompany({
      ...editedCompany,
      urssafIssueDate,
      urssafFileName: urssafFile || 'attestation_urssaf.pdf',
      versionDate: appDate
    });

    setShowConfirmModal(false);
    alert("Une nouvelle version des informations de votre société a été enregistrée avec succès.");
  };

  // Drag and drop handlers for URSSAF
  const handleUrssafDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsUrssafDragging(true);
    } else if (e.type === "dragleave") {
      setIsUrssafDragging(false);
    }
  };

  const handleUrssafDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUrssafDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUrssafFile(file.name);
      setUrssafIssueDate(TODAY_STR); // Set upload/issue date to today
    }
  };

  const handleUrssafFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUrssafFile(e.target.files[0].name);
      setUrssafIssueDate(TODAY_STR); // Set upload/issue date to today
    }
  };

  // User tab actions
  const getNomCompletValue = () => {
    if (!userForm.prenom && !userForm.nom) return '';
    return `${userForm.prenom} ${userForm.nom}`.trim();
  };

  const handleNomCompletChange = (val: string) => {
    const trimmed = val;
    const spaceIndex = trimmed.indexOf(' ');
    let prenom = '';
    let nom = '';
    if (spaceIndex !== -1) {
      prenom = trimmed.substring(0, spaceIndex);
      nom = trimmed.substring(spaceIndex + 1);
    } else {
      prenom = trimmed;
      nom = '';
    }
    setUserForm(prev => ({
      ...prev,
      prenom,
      nom
    }));
  };

  const handleEditUser = (u: CompanyUser) => {
    setEditingUserId(u.id);
    setUserForm({
      prenom: u.prenom,
      nom: u.nom,
      email: u.email,
      profil: u.profil,
      telFixe: u.telFixe,
      telPortable: u.telPortable,
      newsletter: u.newsletter
    });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setUserForm({
      prenom: '',
      nom: '',
      email: '',
      profil: 'Commercial',
      telFixe: '',
      telPortable: '',
      newsletter: false
    });
  };

  const handleFormSubmitInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.prenom && !userForm.nom) {
      alert("Le nom complet est obligatoire.");
      return;
    }
    if (!userForm.email) {
      alert("L'identifiant (Login) est obligatoire.");
      return;
    }

    if (editingUserId) {
      // Editing
      setUsers(prev => prev.map(u => u.id === editingUserId ? { ...u, ...userForm } : u));
      setEditingUserId(null);
    } else {
      // Adding
      const newUser: CompanyUser = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        ...userForm
      };
      setUsers(prev => [...prev, newUser]);
    }

    // Reset form
    setUserForm({
      prenom: '',
      nom: '',
      email: '',
      profil: 'Commercial',
      telFixe: '',
      telPortable: '',
      newsletter: false
    });
  };

  const activeAgreement = PARTNERSHIP_AGREEMENTS.find(a => a.id === selectedAgreement);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 fade-in space-y-6">
      
      {/* Back & Breadcrumbs */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all cursor-pointer flex items-center justify-center"
            title="Retour au tableau de bord"
          >
            <X className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Ma boîte à outils</span>
            <h1 className="font-sans text-xl md:text-2xl text-primary font-black tracking-tight leading-none mt-1">
              Ma société
            </h1>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-black uppercase font-mono">
            {editedCompany.raisonSociale}
          </span>
        </div>
      </div>

      {/* Tabs Selector Navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 rounded-2xl border">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black rounded-xl transition-all cursor-pointer ${
            activeTab === 'info' 
              ? 'bg-secondary text-primary shadow-md' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
          }`}
          id="tab-info-societe"
        >
          <Building className="w-4.5 h-4.5" />
          Informations Société
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black rounded-xl transition-all cursor-pointer ${
            activeTab === 'users' 
              ? 'bg-secondary text-primary shadow-md' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
          }`}
          id="tab-utilisateurs-societe"
        >
          <Users className="w-4.5 h-4.5" />
          Utilisateurs de la Société ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black rounded-xl transition-all cursor-pointer ${
            activeTab === 'documents' 
              ? 'bg-secondary text-primary shadow-md' 
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
          }`}
          id="tab-documents-societe"
        >
          <FileText className="w-4.5 h-4.5" />
          Mes documents
        </button>
      </div>

      {/* TAB 1: INFORMATIONS SOCIETE */}
      {activeTab === 'info' && (
        <div className="max-w-4xl mx-auto w-full">
          
          {/* Main Info Form */}
          <form onSubmit={handleSaveCompanyClick} className="w-full bg-white rounded-3xl border border-black/10 shadow-xs p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-base font-black text-primary uppercase tracking-wider mb-1 flex items-center gap-2">
                <Building className="w-5 h-5 text-secondary" />
                Fiche d'identité réglementaire
              </h3>
              <p className="text-xs text-slate-400 font-medium">Visualisez ou préparez une modification des informations légales de l'entreprise.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Raison Sociale *</label>
                <input
                  type="text"
                  required
                  value={editedCompany.raisonSociale}
                  onChange={(e) => setEditedCompany({ ...editedCompany, raisonSociale: e.target.value })}
                  className="block w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-lg focus:ring-secondary focus:border-secondary text-primary"
                  id="input-company-raison-sociale"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">SIRET (14 chiffres) *</label>
                <input
                  type="text"
                  required
                  maxLength={14}
                  value={editedCompany.siret}
                  onChange={(e) => setEditedCompany({ ...editedCompany, siret: e.target.value.replace(/\D/g, '') })}
                  className="block w-full px-3.5 py-2 text-xs font-bold font-mono border border-slate-200 rounded-lg focus:ring-secondary focus:border-secondary text-primary"
                  id="input-company-siret"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Adresse *</label>
                <input
                  type="text"
                  required
                  value={editedCompany.adresse}
                  onChange={(e) => setEditedCompany({ ...editedCompany, adresse: e.target.value })}
                  className="block w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-lg focus:ring-secondary focus:border-secondary text-primary"
                  id="input-company-adresse"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Code Postal *</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={editedCompany.codePostal}
                  onChange={(e) => setEditedCompany({ ...editedCompany, codePostal: e.target.value.replace(/\D/g, '') })}
                  className="block w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-lg focus:ring-secondary focus:border-secondary text-primary"
                  id="input-company-code-postal"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Ville *</label>
                <input
                  type="text"
                  required
                  value={editedCompany.ville}
                  onChange={(e) => setEditedCompany({ ...editedCompany, ville: e.target.value })}
                  className="block w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-lg focus:ring-secondary focus:border-secondary text-primary"
                  id="input-company-ville"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Forme Juridique *</label>
                <select
                  required
                  value={editedCompany.formeJuridique || 'SAS'}
                  onChange={(e) => setEditedCompany({ ...editedCompany, formeJuridique: e.target.value })}
                  className="block w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-lg focus:ring-secondary focus:border-secondary text-primary bg-white"
                  id="select-company-forme-juridique"
                >
                  <option value="SAS">SAS (Société par Actions Simplifiée)</option>
                  <option value="SARL">SARL (Société à Responsabilité Limitée)</option>
                  <option value="SA">SA (Société Anonyme)</option>
                  <option value="EURL">EURL (Entreprise Unipersonnelle à Responsabilité Limitée)</option>
                  <option value="SNC">SNC (Société en Nom Collectif)</option>
                  <option value="SCI">SCI (Société Civile Immobilière)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Représentant Légal *</label>
                <select
                  required
                  value={editedCompany.representantLegal}
                  onChange={(e) => setEditedCompany({ ...editedCompany, representantLegal: e.target.value })}
                  className="block w-full px-3.5 py-2 text-xs font-bold border border-slate-200 rounded-lg focus:ring-secondary focus:border-secondary text-primary bg-white"
                  id="select-company-representant-legal"
                >
                  <option value="">-- Sélectionner un administrateur --</option>
                  {adminUsers.map(user => (
                    <option key={user.id} value={`${user.prenom} ${user.nom}`}>
                      {user.prenom} {user.nom} ({user.email})
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-slate-400 font-bold">
                  * Uniquement sélectionnable parmi les utilisateurs ayant le profil "Administrateur Espace Partenaire"
                </p>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Fonction du représentant légal *</label>
                <input
                  type="text"
                  required
                  value={editedCompany.fonctionRepresentant || 'Gérant'}
                  onChange={(e) => setEditedCompany({ ...editedCompany, fonctionRepresentant: e.target.value })}
                  className="block w-full px-3.5 py-2 text-xs font-semibold border border-slate-200 rounded-lg focus:ring-secondary focus:border-secondary text-primary"
                  id="input-company-fonction-representant"
                />
              </div>

            </div>

            {/* URSSAF Section */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h4 className="text-xs font-extrabold text-primary uppercase tracking-wide flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-secondary" />
                    Attestation de vigilance URSSAF
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold">
                    Obligation légale de vigilance tous les 6 mois pour l'octroi des primes de CEE.
                  </p>
                </div>

                <div className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${urssafStatus.color}`} id="urssaf-status-badge">
                  {urssafStatus.label}
                </div>
              </div>

              {/* Warning Notice Banner */}
              {urssafStatus.alert && (
                <div className="p-4 bg-[#FFFBEB] border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800 text-xs leading-relaxed" id="urssaf-warning-alert">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Alerte Renouvellement :</strong> Votre attestation URSSAF expire le <strong>{urssafStatus.expiryDate}</strong> (dans <strong>{urssafStatus.daysLeft} jours</strong>). 
                    Veuillez charger une nouvelle attestation pour éviter la suspension de la signature de vos dossiers.
                  </div>
                </div>
              )}

              {urssafStatus.expired && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs leading-relaxed" id="urssaf-expired-alert">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Attestation Expirée !</strong> Votre attestation URSSAF a expiré le <strong>{urssafStatus.expiryDate}</strong>. 
                    Vous devez obligatoirement charger une attestation de moins de 6 mois pour pouvoir continuer à valider de nouveaux dossiers.
                  </div>
                </div>
              )}

              {!urssafStatus.alert && !urssafStatus.expired && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-slate-600 text-xs" id="urssaf-valid-info">
                  <Info className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                  <span>
                    Votre attestation URSSAF est valide jusqu'au <strong>{urssafStatus.expiryDate}</strong> (valable 6 mois après émission).
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* File Uploader */}
                <div className="md:col-span-2">
                  <div
                    onDragEnter={handleUrssafDrag}
                    onDragOver={handleUrssafDrag}
                    onDragLeave={handleUrssafDrag}
                    onDrop={handleUrssafDrop}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all relative ${
                      isUrssafDragging 
                        ? 'border-secondary bg-secondary/5' 
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleUrssafFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="input-file-urssaf"
                    />
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">Déposer ou cliquer pour charger l'attestation</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-bold">PDF, PNG ou JPG (Max 5Mo)</p>
                  </div>
                </div>

                {/* Simulated file state & date modifier to test expiration warning */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Fichier actuel</span>
                    <span className="text-xs font-bold text-primary truncate block font-mono flex items-center gap-1.5 mt-0.5" title={urssafFile || ''}>
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {urssafFile || 'Aucun fichier'}
                    </span>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase block">Date d'émission (Test)</label>
                    <input
                      type="date"
                      value={urssafIssueDate}
                      onChange={(e) => setUrssafIssueDate(e.target.value)}
                      className="block w-full mt-1 px-2.5 py-1 text-xs font-bold font-mono border border-slate-200 rounded-lg text-primary bg-white"
                      id="input-urssaf-issue-date"
                    />
                    <span className="text-[9px] text-slate-400 block mt-1 leading-tight font-semibold">
                      * Ajustez cette date pour simuler et tester le comportement de l'alerte d'expiration (valable 6 mois).
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!isCompanyModified}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                  isCompanyModified 
                    ? 'bg-secondary text-white hover:bg-opacity-95' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
                id="btn-save-company-info"
              >
                <Check className="w-4 h-4" /> Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: UTILISATEURS DE LA SOCIETE */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header row in line with screenshot */}
          <div className="bg-white rounded-2xl border border-slate-150 p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-none">Gestion des utilisateurs</h3>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold">Gérez et habilitez les collaborateurs de votre espace partenaire CEE.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Panel: Table of Users */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 space-y-6">
              <div>
                <div className="w-fit border-b-[3px] border-[#96c11f] pb-2">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                    Utilisateurs enregistrés
                  </h4>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      <th scope="col" className="px-4 py-3.5 text-left font-black">Utilisateur</th>
                      <th scope="col" className="px-4 py-3.5 text-left font-black">Login</th>
                      <th scope="col" className="px-4 py-3.5 text-left font-black">Rôle</th>
                      <th scope="col" className="px-4 py-3.5 text-center font-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {users.map(user => {
                      // Initials
                      const initials = `${user.prenom ? user.prenom.charAt(0) : ''}${user.nom ? user.nom.charAt(0) : ''}`.toUpperCase();
                      
                      // Role display and colors
                      let roleLabel = 'Opérateur';
                      let roleClass = 'bg-[#eff6ff] text-[#2563eb]'; // default blue
                      
                      if (user.profil === 'Administrateur espace partenaire') {
                        roleLabel = 'Administrateur';
                        roleClass = 'bg-amber-50 text-amber-700 border-amber-100';
                      } else if (user.profil === 'Gestionnaire espace partenaire') {
                        roleLabel = 'Gestionnaire';
                        roleClass = 'bg-[#f3e8ff] text-[#9333ea] border-purple-100'; // Lavender
                      } else {
                        roleLabel = 'Commercial';
                        roleClass = 'bg-[#eff6ff] text-[#2563eb] border-blue-100'; // Blue
                      }

                      // Login display - just show email as lowercase or its prefix
                      const loginDisplay = user.email ? user.email.split('@')[0].toLowerCase() : '';

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {/* Avatar circle */}
                              <div className="w-10 h-10 rounded-full bg-[#96c11f] text-white flex items-center justify-center font-black text-xs border border-[#96c11f]/20">
                                {initials}
                              </div>
                              <div>
                                <span className="font-black text-slate-900 block text-sm">
                                  {user.prenom} {user.nom}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap font-semibold text-slate-500">
                            {loginDisplay}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-md text-[11px] font-bold ${roleClass}`}>
                              {roleLabel}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <button
                              type="button"
                              onClick={() => handleEditUser(user)}
                              className="w-10 h-10 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 flex items-center justify-center transition-all cursor-pointer inline-flex shadow-xs"
                              title="Modifier cet utilisateur"
                              id={`btn-edit-user-inline-${user.id}`}
                            >
                              <Edit className="w-4 h-4 text-slate-800" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Panel: Add/Edit User Form Box */}
            <div className="lg:col-span-5">
              <form 
                onSubmit={handleFormSubmitInline}
                className="bg-white border border-slate-900 rounded-[24px] p-6 space-y-5 shadow-xs"
              >
                <div>
                  <div className="w-fit border-b-[3px] border-[#96c11f] pb-1.5">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                      {editingUserId ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
                    </h4>
                  </div>
                </div>

                {/* Nom complet field */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-900 block">Nom complet</label>
                  <input
                    type="text"
                    required
                    value={getNomCompletValue()}
                    onChange={(e) => handleNomCompletChange(e.target.value)}
                    placeholder="ex: Camille HONNETTE"
                    className="block w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-[10px] focus:outline-none focus:border-[#96c11f] focus:ring-1 focus:ring-[#96c11f] text-slate-900"
                    id="input-inline-nom-complet"
                  />
                </div>

                {/* Identifiant (Login) field */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-900 block">Identifiant (Login)</label>
                  <input
                    type="text"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="ex: admin"
                    className="block w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-[10px] focus:outline-none focus:border-[#96c11f] focus:ring-1 focus:ring-[#96c11f] text-slate-900"
                    id="input-inline-login"
                  />
                </div>

                {/* Rôle field */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-900 block">Rôle</label>
                  <select
                    required
                    value={userForm.profil}
                    onChange={(e) => setUserForm({ ...userForm, profil: e.target.value as any })}
                    className="block w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-[10px] focus:outline-none focus:border-[#96c11f] focus:ring-1 focus:ring-[#96c11f] text-slate-900 bg-white"
                    id="select-inline-role"
                  >
                    <option value="Commercial">Commercial</option>
                    <option value="Gestionnaire espace partenaire">Gestionnaire</option>
                    <option value="Administrateur espace partenaire">Administrateur</option>
                  </select>
                </div>

                {/* Additional Details to preserve required features without cluttering */}
                <div className="border-t border-slate-100 pt-3 space-y-3.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Détails complémentaires</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block">Téléphone Portable</label>
                      <input
                        type="tel"
                        value={userForm.telPortable}
                        onChange={(e) => setUserForm({ ...userForm, telPortable: e.target.value })}
                        placeholder="ex: 0612345678"
                        className="block w-full px-2.5 py-2 text-[11px] font-semibold border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#96c11f]"
                        id="input-inline-portable"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block">Téléphone Fixe</label>
                      <input
                        type="tel"
                        value={userForm.telFixe}
                        onChange={(e) => setUserForm({ ...userForm, telFixe: e.target.value })}
                        placeholder="ex: 0145678910"
                        className="block w-full px-2.5 py-2 text-[11px] font-semibold border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#96c11f]"
                        id="input-inline-fixe"
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userForm.newsletter}
                        onChange={(e) => setUserForm({ ...userForm, newsletter: e.target.checked })}
                        className="w-3.5 h-3.5 rounded text-[#96c11f] border-slate-300 focus:ring-[#96c11f] cursor-pointer"
                        id="checkbox-inline-newsletter"
                      />
                      <div className="leading-tight">
                        <span className="text-[11px] font-bold text-slate-700 block">S'inscrire à la newsletter</span>
                        <span className="text-[9px] text-slate-400 block font-semibold">Recevez nos veilles CEE hebdomadaires.</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-[#96c11f] hover:bg-opacity-95 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all w-full flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                    id="btn-inline-submit"
                  >
                    {editingUserId ? "✓ Enregistrer" : "+ Ajouter"}
                  </button>
                  
                  {editingUserId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-[11px] text-slate-500 hover:text-slate-800 block text-center w-full mt-2 font-semibold underline cursor-pointer"
                    >
                      Annuler et repasser en création
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MES DOCUMENTS (Attestation URSSAF & Conventions) */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start animate-fade-in">
          {/* Documents list - takes 1/5 (col-span-1) on medium+ screens */}
          <div className="md:col-span-1 bg-white rounded-3xl border border-black/10 shadow-xs p-4 space-y-4">
            <div>
              <h3 className="text-xs font-black text-primary uppercase tracking-wider mb-1">
                Mes documents
              </h3>
              <p className="text-[10px] text-slate-400 font-bold">Sélectionnez un document à afficher.</p>
            </div>
            
            <div className="space-y-2">
              {[
                {
                  id: 'urssaf',
                  title: 'Attestation URSSAF',
                  type: 'PDF',
                  date: urssafIssueDate || companyInfo.urssafIssueDate || '2026-03-12',
                  content: `ATTESTATION DE VIGILANCE URSSAF - COMPTE VIGILANCE N° ${companyInfo.siret || '49201930100023'}
------------------------------------------------------------------
Date d'émission : ${urssafIssueDate || companyInfo.urssafIssueDate || '2026-03-12'}
Fichier d'origine : ${urssafFile || companyInfo.urssafFileName || 'attestation_urssaf.pdf'}
Statut de conformité : Validé réglementairement

La Direction Régionale de l'URSSAF atteste par la présente que :
La société : ${companyInfo.raisonSociale || 'Ouate Else'}
SIRET : ${companyInfo.siret || '492 019 301 00023'}
Adresse enregistrée : ${companyInfo.adresse || '12 RUE DE LA PAIX'}, ${companyInfo.codePostal || '75002'} ${companyInfo.ville || 'PARIS'}

Est à jour de ses obligations de déclaration et de paiement des cotisations de sécurité sociale à la date mentionnée ci-dessus.
Nombre de salariés déclarés : 14
Masse salariale brute cumulée : 412 500 €

Cette attestation est délivrée pour valoir ce que de droit dans le cadre de l'obligation de vigilance (Article L. 8222-1 du Code du travail).
Clé de vérification : URSSAF-89F72D-91823B`
                },
                ...PARTNERSHIP_AGREEMENTS.map(agreement => ({
                  id: agreement.id,
                  title: agreement.title,
                  type: 'Convention',
                  date: agreement.date,
                  content: agreement.content
                }))
              ].map((doc) => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                      isSelected
                        ? 'border-secondary bg-secondary/5 shadow-inner'
                        : 'border-slate-150 hover:border-slate-200 bg-slate-50/50'
                    }`}
                    id={`btn-select-doc-${doc.id}`}
                  >
                    <span className="text-xs font-bold text-slate-700 truncate block w-full" title={doc.title}>
                      {doc.title}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold block">
                      {doc.date}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Viewer - takes 4/5 (col-span-4) on medium+ screens */}
          <div className="md:col-span-4 bg-white rounded-3xl border border-black/10 shadow-xs p-6">
            {(() => {
              const documentsList = [
                {
                  id: 'urssaf',
                  title: 'Attestation URSSAF',
                  type: 'PDF',
                  date: urssafIssueDate || companyInfo.urssafIssueDate || '2026-03-12',
                  content: `ATTESTATION DE VIGILANCE URSSAF - COMPTE VIGILANCE N° ${companyInfo.siret || '49201930100023'}
------------------------------------------------------------------
Date d'émission : ${urssafIssueDate || companyInfo.urssafIssueDate || '2026-03-12'}
Fichier d'origine : ${urssafFile || companyInfo.urssafFileName || 'attestation_urssaf.pdf'}
Statut de conformité : Validé réglementairement

La Direction Régionale de l'URSSAF atteste par la présente que :
La société : ${companyInfo.raisonSociale || 'Ouate Else'}
SIRET : ${companyInfo.siret || '492 019 301 00023'}
Adresse enregistrée : ${companyInfo.adresse || '12 RUE DE LA PAIX'}, ${companyInfo.codePostal || '75002'} ${companyInfo.ville || 'PARIS'}

Est à jour de ses obligations de déclaration et de paiement des cotisations de sécurité sociale à la date mentionnée ci-dessus.
Nombre de salariés déclarés : 14
Masse salariale brute cumulée : 412 500 €

Cette attestation est délivrée pour valoir ce que de droit dans le cadre de l'obligation de vigilance (Article L. 8222-1 du Code du travail).
Clé de vérification : URSSAF-89F72D-91823B`
                },
                ...PARTNERSHIP_AGREEMENTS.map(agreement => ({
                  id: agreement.id,
                  title: agreement.title,
                  type: 'Convention',
                  date: agreement.date,
                  content: agreement.content
                }))
              ];
              const activeDoc = documentsList.find(d => d.id === selectedDocId) || documentsList[0];
              return (
                <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-xs flex flex-col h-[550px]" id="documents-tab-viewer">
                  {/* Header of Viewer */}
                  <div className="bg-slate-900 text-white p-4 flex items-center justify-between text-xs font-bold border-b border-black">
                    <div className="flex items-center gap-1.5 truncate">
                      <FileText className="w-4 h-4 text-secondary shrink-0" />
                      <span className="truncate">{activeDoc.title}</span>
                    </div>
                    <span className="bg-white/10 text-[9px] font-mono px-2.5 py-1 rounded text-slate-300 uppercase tracking-wider">
                      Visionneuse Document ({activeDoc.type})
                    </span>
                  </div>

                  {/* Content Body of Viewer */}
                  <div className="flex-1 bg-slate-50 p-6 font-mono text-xs text-slate-700 leading-relaxed overflow-y-auto whitespace-pre-wrap select-text border-b border-slate-150">
                    {activeDoc.content}
                  </div>

                  {/* Footer status / Action */}
                  <div className="p-4 bg-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>Document de référence légal</span>
                    <span className="text-emerald-600 flex items-center gap-1 font-bold">
                      <CheckCircle className="w-4.5 h-4.5" /> Conforme
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR COMPANY SAVES (NEW VERSION GENERATION) */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="company-confirm-modal">
          <div className="bg-white rounded-3xl border border-black/10 shadow-2xl max-w-xl w-full p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-sans text-xl font-black text-primary tracking-tight">
                Génération d'une nouvelle version des informations société
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Vous êtes sur le point de modifier des éléments sensibles de la fiche réglementaire de votre société. 
                Ces modifications entraîneront la création d'une nouvelle version d'historique de vos données de facturation et de certification.
              </p>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-bold flex items-center gap-2" id="modal-error-alert">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Date selection (future or today) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Date d'application de la nouvelle version *</label>
                <input
                  type="date"
                  required
                  min={TODAY_STR}
                  value={appDate}
                  onChange={(e) => setAppDate(e.target.value)}
                  className="block w-full px-3.5 py-2.5 text-xs font-bold font-mono border border-slate-200 rounded-lg focus:ring-secondary focus:border-secondary text-primary"
                  id="input-modal-app-date"
                />
                <p className="text-[9px] text-slate-400 font-bold leading-tight">
                  * La date d'entrée en vigueur de ces modifications ne peut être antérieure à aujourd'hui ({TODAY_STR}).
                </p>
              </div>

              {/* Exact confirm phrase sentence copy-paste or write */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Phrase de confirmation requise *</label>
                <p className="text-[10px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-150 font-medium select-all">
                  je confirme la création d'une nouvelle version des informations de ma société
                </p>
                <input
                  type="text"
                  required
                  placeholder="Saisissez la phrase ci-dessus exactement"
                  value={confirmPhraseInput}
                  onChange={(e) => setConfirmPhraseInput(e.target.value)}
                  className="block w-full mt-2 px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-lg focus:ring-secondary focus:border-secondary text-primary"
                  id="input-modal-phrase"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmCompanySave}
                className="bg-secondary hover:bg-opacity-95 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                id="btn-modal-confirm-submit"
              >
                <Check className="w-4 h-4" /> Confirmer la nouvelle version
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER CREATION/EDIT MODAL REMOVED - INLINE FORM PREFERRED */}

    </div>
  );
}
