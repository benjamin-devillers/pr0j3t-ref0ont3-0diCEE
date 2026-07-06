import React, { useState } from 'react';
import { Mail, Building2, CheckCircle2, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

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
    setError('');
    setLoading(true);

    const registrationInfo = {
      raisonSociale,
      siret,
      contactNom: `${contactPrenom} ${contactNom}`,
      contactEmail: email,
      telephone,
      signatureElectroniqueActive: true
    };

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, registrationInfo }),
      });
      const data = await response.json();
      setLoading(false);
      if (data.success) {
        setMagicLinkSent(true);
        const absoluteLink = `${window.location.origin}${data.magicLink}`;
        setSimulatedLink(absoluteLink);
      } else {
        setError(data.error || 'Une erreur est survenue.');
      }
    } catch (err) {
      setLoading(false);
      setError('Erreur de communication.');
    }
  };

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
            <span className="text-secondary text-3xl font-black tracking-tight">Odi<span className="text-white">CEE</span></span>
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
            {!magicLinkSent && (
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
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Inscription</span>
                  <h3 className="text-xl font-black text-primary tracking-tight">Rejoignez OdiCEE</h3>
                  <p className="text-xs text-slate-500">Devenez partenaire et valorisez efficacement vos certificats d'économies d'énergie.</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="siret" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    N° SIRET de la société
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
                    Raison sociale
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
                      Prénom contact
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
                      Nom contact
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
                    Email de contact (Sert d'identifiant)
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
                    Téléphone de contact
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-secondary hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? 'Création...' : 'Inscrire ma société'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
