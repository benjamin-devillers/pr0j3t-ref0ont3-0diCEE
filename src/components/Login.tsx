import React, { useState } from 'react';
import { Mail, Building2, CheckCircle2, ArrowRight, ShieldCheck, FileText, X, UploadCloud } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (email: string, companyInfo?: any) => void;
  onNavigateToSimulator: () => void;
}

export default function Login({ onLoginSuccess, onNavigateToSimulator }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [simulatedLink, setSimulatedLink] = useState('');
  const [error, setError] = useState('');

  // Register state
  const [raisonSociale, setRaisonSociale] = useState('');
  const [siret, setSiret] = useState('');
  const [siretVerified, setSiretVerified] = useState(false);
  const [contactNom, setContactNom] = useState('');
  const [contactPrenom, setContactPrenom] = useState('');
  const [telephone, setTelephone] = useState('');

  // New States for Multi-Step Enrollment flow
  const [registrationStep, setRegistrationStep] = useState<'form' | 'convention' | 'uploads'>('form');
  const [secteurs, setSecteurs] = useState<string[]>([]);
  const [domaines, setDomaines] = useState<string[]>([]);
  const [typedSignature, setTypedSignature] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Upload status for each document
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { name: string; status: 'en_attente' | 'chargement' | 'valide' }>>({
    logo: { name: '', status: 'en_attente' },
    signature: { name: '', status: 'en_attente' },
    urssaf: { name: '', status: 'en_attente' },
    kbis: { name: '', status: 'en_attente' },
    rge: { name: '', status: 'en_attente' },
    rib: { name: '', status: 'en_attente' },
    identity: { name: '', status: 'en_attente' },
  });

  const handleVerifySiret = () => {
    if (siret.length < 14) {
      setError('Un SIRET valide comporte 14 chiffres.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSiretVerified(true);
      if (!raisonSociale) {
        setRaisonSociale('Rénovation Performance S.A.S.');
      }
    }, 800);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Veuillez saisir une adresse email.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setLoading(false);
      if (data.success) {
        setMagicLinkSent(true);
        // Create full URL
        const absoluteLink = `${window.location.origin}${data.magicLink}`;
        setSimulatedLink(absoluteLink);
      } else {
        setError(data.error || 'Une erreur est survenue.');
      }
    } catch (err) {
      setLoading(false);
      setError('Erreur de communication avec le serveur.');
    }
  };
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !raisonSociale || !siret || !contactNom || !contactPrenom || !telephone) {
      setError('Veuillez renseigner tous les champs obligatoires.');
      return;
    }
    if (secteurs.length === 0) {
      setError('Veuillez sélectionner au moins un secteur d\'activité.');
      return;
    }
    const showDomaines = secteurs.includes('Résidentiel') || secteurs.includes('Tertiaire');
    if (showDomaines && domaines.length === 0) {
      setError('Veuillez sélectionner au moins un domaine d\'opération.');
      return;
    }
    setError('');
    // Go to step 2: signature of partnership agreement
    setRegistrationStep('convention');
  };

  const handleSignConvention = () => {
    const fullName = `${contactPrenom} ${contactNom}`.trim().toLowerCase();
    if (!typedSignature.trim()) {
      setError('Veuillez renseigner votre signature en saisissant votre nom.');
      return;
    }
    if (typedSignature.trim().toLowerCase() !== fullName) {
      setError(`La signature doit correspondre exactement à votre nom : "${contactPrenom} ${contactNom}"`);
      return;
    }
    if (!agreeTerms) {
      setError('Veuillez cocher la case pour accepter les termes de la convention.');
      return;
    }
    setError('');
    // Go to step 3: file uploads
    setRegistrationStep('uploads');
  };

  const handleUploadSimulated = (key: string, fileObj?: File) => {
    const fileName = fileObj ? fileObj.name : `${key}_document.pdf`;
    
    // Set to loading
    setUploadedFiles(prev => ({
      ...prev,
      [key]: { name: fileName, status: 'chargement' }
    }));

    // After 1 second, mark as valid
    setTimeout(() => {
      setUploadedFiles(prev => ({
        ...prev,
        [key]: { name: fileName, status: 'valide' }
      }));
    }, 1000);
  };

  const handleRemoveFile = (key: string) => {
    setUploadedFiles(prev => ({
      ...prev,
      [key]: { name: '', status: 'en_attente' }
    }));
  };

  const handleCompleteOnboarding = () => {
    setError('');
    const filesArray = Object.values(uploadedFiles) as { name: string; status: string }[];
    const allFilesUploaded = filesArray.every(f => f.status === 'valide');
    if (!allFilesUploaded) {
      setError('Veuillez charger l’intégralité des 7 documents obligatoires.');
      return;
    }

    const companyInfo = {
      raisonSociale,
      siret,
      contactNom: `${contactPrenom} ${contactNom}`,
      contactEmail: email,
      telephone,
      signatureElectroniqueActive: true,
      secteurs,
      domaines,
      logoName: uploadedFiles.logo.name,
      signatureName: uploadedFiles.signature.name,
      urssafFileName: uploadedFiles.urssaf.name,
      kbisFileName: uploadedFiles.kbis.name,
      rgeFileName: uploadedFiles.rge.name,
      ribFileName: uploadedFiles.rib.name,
      identityFileName: uploadedFiles.identity.name,
    };

    onLoginSuccess(email, companyInfo);
  };;

  const handleUseMagicLink = () => {
    // Directly log in
    const companyInfo = activeTab === 'register' ? {
      raisonSociale,
      siret,
      contactNom: `${contactPrenom} ${contactNom}`,
      contactEmail: email,
      telephone,
      signatureElectroniqueActive: true
    } : {
      raisonSociale: 'Ouate Else',
      siret: '49201930100023',
      contactNom: 'Jean Rénovateur',
      contactEmail: email,
      telephone: '06 12 34 56 78',
      signatureElectroniqueActive: true
    };
    onLoginSuccess(email, companyInfo);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F1F3F5] p-4 md:p-8 gap-6">
      {/* Side Banner */}
      <div className="md:w-5/12 bg-primary text-white flex flex-col justify-between p-8 md:p-12 relative overflow-hidden rounded-3xl border border-black/10 shadow-sm min-h-[500px]">
        {/* Abstract shapes for branding prestige */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-secondary/10 -mr-20 -mt-20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-400/5 -ml-20 -mb-20 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-secondary text-3xl font-black tracking-tight"><span className="text-white">Odi</span>CEE</span>
            <span className="text-[10px] bg-secondary/20 text-secondary px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider">v27.01</span>
          </div>
          
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-400 block mb-3">Portail Partenaire</span>
          <h2 className="font-sans text-3xl md:text-4xl lg:text-5xl text-white font-black tracking-tight leading-tight mb-6">
            L'énergie d'un réseau,<br />la clarté du CEE.
          </h2>
          <p className="text-slate-300 text-sm max-w-sm leading-relaxed">
            Gérez vos dossiers de Certificats d'Économies d'Énergie en toute simplicité et maximisez les primes pour vos clients.
          </p>
        </div>

        <div className="mt-12 md:mt-0 space-y-6 relative z-10 border-l-2 border-secondary/40 pl-6">
          <div className="flex items-start gap-3">
            <div className="bg-secondary/20 p-1.5 rounded-lg text-secondary mt-1">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Simulations en accès libre</h4>
              <p className="text-xs text-slate-300">Simulez le montant des primes de vos chantiers instantanément avant même de créer un compte.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-slate-400 text-xs font-mono relative z-10">
          © {new Date().getFullYear()} ODICEE / ADEENA. All rights reserved.
        </div>
      </div>

      {/* Main Form container */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-white rounded-3xl border border-black/10 shadow-sm relative overflow-hidden">
        {/* Background glow behind login card */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-blue-50/40 -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-slate-50/40 -ml-16 -mb-16 blur-2xl"></div>

        <div className="w-full max-w-md bg-transparent relative z-10 fade-in">
          <div className="bg-slate-50/60 rounded-2xl border border-black/5 p-1.5 mb-6">
            {/* Top tabs */}
            {!magicLinkSent && (registrationStep === 'form' || activeTab === 'login') && (
              <div className="flex gap-1">
                <button
                  className={`flex-1 py-3 text-center font-bold text-xs uppercase tracking-wider rounded-xl transition-all ${
                    activeTab === 'login'
                      ? 'text-white bg-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  onClick={() => { setActiveTab('login'); setError(''); }}
                >
                  Se connecter
                </button>
                <button
                  className={`flex-1 py-3 text-center font-bold text-xs uppercase tracking-wider rounded-xl transition-all ${
                    activeTab === 'register'
                      ? 'text-white bg-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  onClick={() => { setActiveTab('register'); setError(''); }}
                >
                  Inscrire ma société
                </button>
              </div>
            )}
          </div>

          <div className="p-8">
            {activeTab === 'register' && !magicLinkSent && (
              <div className="mb-6 flex items-center justify-between text-xs font-mono font-bold text-slate-400">
                <div className={`flex items-center gap-1.5 ${registrationStep === 'form' ? 'text-secondary font-black' : 'text-primary'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${registrationStep === 'form' ? 'bg-secondary text-primary font-black' : 'bg-primary text-white font-black'}`}>1</span>
                  <span>Saisie</span>
                </div>
                <div className="flex-1 h-px bg-slate-200 mx-2"></div>
                <div className={`flex items-center gap-1.5 ${registrationStep === 'convention' ? 'text-secondary font-black' : registrationStep === 'uploads' ? 'text-primary font-black' : 'text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${registrationStep === 'convention' ? 'bg-secondary text-primary font-black' : registrationStep === 'uploads' ? 'bg-primary text-white font-black' : 'bg-slate-200 text-slate-500'}`}>2</span>
                  <span>Convention</span>
                </div>
                <div className="flex-1 h-px bg-slate-200 mx-2"></div>
                <div className={`flex items-center gap-1.5 ${registrationStep === 'uploads' ? 'text-secondary font-black' : 'text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${registrationStep === 'uploads' ? 'bg-secondary text-primary font-black' : 'bg-slate-200 text-slate-500'}`}>3</span>
                  <span>Pièces</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            {magicLinkSent ? (
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-secondary mb-2">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-black text-primary tracking-tight">Consultez votre messagerie !</h3>
                  <p className="text-slate-500 text-sm mt-2">
                    Nous venons de simuler l'envoi d'un Magic Link sécurisé à l'adresse <strong className="text-primary">{email}</strong>.
                  </p>
                </div>

                <div className="bg-slate-50 border border-black/5 rounded-2xl p-5 text-left space-y-3">
                  <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">Simulateur d'email (Mode Démo)</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Dans une boîte mail réelle, vous recevriez un mail contenant le lien ci-dessous. Pour accéder à votre espace partenaire :
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-black/5 text-xs font-mono break-all select-all text-blue-900 overflow-x-auto max-h-24">
                    {simulatedLink}
                  </div>
                  
                  <button
                    onClick={handleUseMagicLink}
                    className="w-full bg-secondary hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all mt-2 cursor-pointer"
                  >
                    S'authentifier directement <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => { setMagicLinkSent(false); setSimulatedLink(''); }}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Saisir une autre adresse email
                </button>
              </div>
            ) : activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Connexion</span>
                  <h3 className="text-xl font-black text-primary tracking-tight">Bon retour parmi nous</h3>
                  <p className="text-xs text-slate-500">Saisissez votre email professionnel pour recevoir votre lien magique de connexion.</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Adresse email professionnelle
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="nom@votre-entreprise.fr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent text-sm bg-slate-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? 'Génération du lien...' : 'Recevoir mon Magic Link'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="relative py-2 flex items-center justify-center">
                  <span className="absolute inset-x-0 h-px bg-slate-100"></span>
                  <span className="relative bg-white px-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider">Ou continuer sans compte</span>
                </div>

                <button
                  type="button"
                  onClick={onNavigateToSimulator}
                  className="w-full bg-slate-50 border border-black/10 hover:bg-slate-100 text-slate-700 font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  Simuler une prime gratuitement
                </button>
              </form>
            ) : registrationStep === 'form' ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Inscription - Étape 1/3</span>
                  <h3 className="text-xl font-black text-primary tracking-tight">Rejoignez OdiCEE</h3>
                  <p className="text-xs text-slate-500">Devenez partenaire et valorisez efficacement vos certificats d'économies d'énergie.</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="siret" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    N° SIRET de la société *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Building2 className="w-4 h-4" />
                      </span>
                      <input
                        id="siret"
                        type="text"
                        maxLength={14}
                        required
                        placeholder="14 chiffres sans espaces"
                        value={siret}
                        onChange={(e) => {
                          setSiret(e.target.value.replace(/\D/g, ''));
                          setSiretVerified(false);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent text-sm bg-slate-50"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifySiret}
                      className="bg-slate-100 hover:bg-slate-200 border border-black/5 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
                    >
                      Vérifier
                    </button>
                  </div>
                  {siretVerified && (
                    <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Entreprise trouvée et validée
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label htmlFor="raisonSociale" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Raison sociale *
                  </label>
                  <input
                    id="raisonSociale"
                    type="text"
                    required
                    placeholder="Nom officiel de votre entreprise"
                    value={raisonSociale}
                    onChange={(e) => setRaisonSociale(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent text-sm bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="contactPrenom" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Prénom contact *
                    </label>
                    <input
                      id="contactPrenom"
                      type="text"
                      required
                      placeholder="Prénom"
                      value={contactPrenom}
                      onChange={(e) => setContactPrenom(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent text-sm bg-slate-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="contactNom" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Nom contact *
                    </label>
                    <input
                      id="contactNom"
                      type="text"
                      required
                      placeholder="Nom"
                      value={contactNom}
                      onChange={(e) => setContactNom(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent text-sm bg-slate-50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="regEmail" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email de contact (Sert d'identifiant) *
                  </label>
                  <input
                    id="regEmail"
                    type="email"
                    required
                    placeholder="ex: jean.renov@votre-entreprise.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent text-sm bg-slate-50"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="telephone" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Téléphone de contact *
                  </label>
                  <input
                    id="telephone"
                    type="tel"
                    required
                    placeholder="Ex: 06 00 00 00 00"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent text-sm bg-slate-50"
                  />
                </div>

                {/* Secteurs section */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Ma société réalise des travaux dans le(s) secteur(s) *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Résidentiel', 'Tertiaire', 'Industrie', 'Réseau', 'Agriculture', 'Transport'].map((secteur) => {
                      const isSelected = secteurs.includes(secteur);
                      return (
                        <button
                          key={secteur}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSecteurs(prev => prev.filter(s => s !== secteur));
                            } else {
                              setSecteurs(prev => [...prev, secteur]);
                            }
                          }}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'bg-primary/5 border-primary text-primary font-black shadow-xs'
                              : 'bg-slate-50 border-black/10 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary border-primary text-white' : 'border-slate-300 bg-white'}`}>
                            {isSelected && <span className="text-[10px] leading-none font-bold">✓</span>}
                          </div>
                          <span>{secteur}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Domaines selection conditionalized */}
                {(secteurs.includes('Résidentiel') || secteurs.includes('Tertiaire')) && (
                  <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-fade-in">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Ma société réalise des opérations dans le(s) domaine(s) *
                    </label>
                    <div className="grid grid-cols-1 gap-1.5 max-h-52 overflow-y-auto p-1 bg-white rounded-xl border border-slate-100">
                      {[
                        "isolation de toits",
                        "isolation de plancher bas",
                        "isolation des murs par l'intérieur",
                        "isolation des murs par l'extérieur",
                        "fenêtres",
                        "chaudière HPE",
                        "Pompe à chaleur",
                        "Chaudières biomasse",
                        "Appareils indépendant de chauffage au bois",
                        "installation VMC",
                        "systèmes-solaires combinés",
                        "autres"
                      ].map((domaine) => {
                        const isSelected = domaines.includes(domaine);
                        return (
                          <button
                            key={domaine}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setDomaines(prev => prev.filter(d => d !== domaine));
                              } else {
                                setDomaines(prev => [...prev, domaine]);
                              }
                            }}
                            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer text-left leading-tight ${
                              isSelected
                                ? 'bg-secondary/10 border-secondary text-primary font-bold'
                                : 'bg-transparent border-slate-100 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-secondary border-secondary text-white' : 'border-slate-300 bg-white'}`}>
                              {isSelected && <span className="text-[8px] leading-none font-black">✓</span>}
                            </div>
                            <span>{domaine}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-secondary hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? 'Création...' : 'Inscrire ma société'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : registrationStep === 'convention' ? (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Inscription - Étape 2/3</span>
                  <h3 className="text-xl font-black text-primary tracking-tight">Convention de partenariat</h3>
                  <p className="text-xs text-slate-500">Veuillez lire et signer électroniquement la convention de partenariat pour poursuivre.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 h-64 overflow-y-auto text-xs text-slate-600 space-y-4 font-sans leading-relaxed shadow-inner">
                  <h4 className="font-extrabold text-slate-900 uppercase text-center border-b border-slate-200 pb-2 mb-2">
                    CONVENTION DE PARTENARIAT CEE - ODICEE
                  </h4>
                  <p>
                    <strong>ENTRE LES SOUSSIGNÉS :</strong>
                  </p>
                  <p>
                    La société <strong>Adeena</strong>, éditeur de la plateforme OdiCEE, d'une part,
                  </p>
                  <p>
                    Et la société <strong>{raisonSociale || 'Votre société'}</strong>, immatriculée sous le numéro SIRET <strong>{siret || 'Votre SIRET'}</strong>, représentée par M./Mme <strong>{contactPrenom} {contactNom}</strong> en sa qualité de mandataire/représentant légal, d'autre part.
                  </p>
                  <p>
                    <strong>Article 1 : Objet de la convention</strong>
                  </p>
                  <p>
                    La présente convention a pour objet de définir les conditions de collaboration entre les parties pour la valorisation des Certificats d’Économies d’Énergie (CEE). Le partenaire s'engage à soumettre des dossiers complets et conformes à la réglementation nationale en vigueur.
                  </p>
                  <p>
                    <strong>Article 2 : Engagements du Partenaire</strong>
                  </p>
                  <p>
                    Le Partenaire s’engage à réaliser des chantiers d'économie d'énergie éligibles aux CEE, à informer le bénéficiaire des primes associées, et à collecter l'ensemble des pièces requises (devis, factures, attestation sur l'honneur). Le Partenaire garantit la véracité des informations fournies.
                  </p>
                  <p>
                    <strong>Article 3 : Rémunération et paiement des primes</strong>
                  </p>
                  <p>
                    Adeena s'engage à instruire les dossiers de CEE déposés par le Partenaire. Après validation finale et dépôt auprès du Ministère, Adeena reversera les primes convenues selon la répartition définie pour chaque dossier.
                  </p>
                  <p>
                    <strong>Article 4 : Durée de la convention</strong>
                  </p>
                  <p>
                    La présente convention est conclue pour une durée indéterminée à compter de sa signature. Chaque partie peut y mettre fin à tout moment sous réserve d'un préavis de trente (30) jours.
                  </p>
                </div>

                <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Signature du représentant légal
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={`Saisissez "${contactPrenom} ${contactNom}" pour signer`}
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent text-sm bg-white font-mono"
                    />
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 rounded border-slate-300 text-secondary focus:ring-secondary/50 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 leading-tight">
                      Je certifie être habilité(e) à représenter la société <strong>{raisonSociale || 'votre société'}</strong> et accepte sans réserve les termes de cette convention de partenariat par signature électronique.
                    </span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleSignConvention}
                  className="w-full bg-secondary hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  Signer la convention de partenariat <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Inscription - Étape 3/3</span>
                  <h3 className="text-xl font-black text-primary tracking-tight">Documents de la société</h3>
                  <p className="text-xs text-slate-500">Veuillez charger les 7 pièces justificatives obligatoires pour finaliser votre accès.</p>
                </div>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {[
                    { key: 'logo', label: 'Logo de la société' },
                    { key: 'signature', label: 'Signature du représentant' },
                    { key: 'urssaf', label: 'Attestation URSSAF' },
                    { key: 'kbis', label: 'Extrait K-BIS' },
                    { key: 'rge', label: 'Certificat RGE' },
                    { key: 'rib', label: 'RIB (Relevé d’Identité Bancaire)' },
                    { key: 'identity', label: 'Pièce d’identité du représentant légal' }
                  ].map(({ key, label }) => {
                    const file = uploadedFiles[key];
                    return (
                      <div key={key} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-700">{label} <span className="text-rose-500">*</span></div>
                          {file.status === 'valide' ? (
                            <p className="text-[10px] text-green-600 font-semibold font-mono truncate mt-0.5">
                              ✓ {file.name}
                            </p>
                          ) : file.status === 'chargement' ? (
                            <div className="mt-1.5 w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                              <div className="bg-secondary h-full animate-pulse" style={{ width: '60%' }}></div>
                            </div>
                          ) : (
                            <p className="text-[10px] text-slate-400 mt-0.5">Aucun document chargé</p>
                          )}
                        </div>

                        <div>
                          {file.status === 'valide' ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full uppercase">Chargé</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(key)}
                                className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Supprimer le fichier"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : file.status === 'chargement' ? (
                            <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded-full animate-pulse">Envoi...</span>
                          ) : (
                            <label className="relative inline-flex items-center justify-center bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-[11px] cursor-pointer transition-colors whitespace-nowrap shadow-xs">
                              <span>Charger</span>
                              <input
                                type="file"
                                className="sr-only"
                                onChange={(e) => handleUploadSimulated(key, e.target.files?.[0])}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={!(Object.values(uploadedFiles) as { name: string; status: string }[]).every(f => f.status === 'valide')}
                  onClick={handleCompleteOnboarding}
                  className={`w-full font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    (Object.values(uploadedFiles) as { name: string; status: string }[]).every(f => f.status === 'valide')
                      ? 'bg-primary hover:bg-slate-800 text-white cursor-pointer shadow-sm'
                      : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Accéder à mon espace connecté <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
