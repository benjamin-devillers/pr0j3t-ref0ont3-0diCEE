export type UserRole = 'partenaire' | 'invite';

export interface Company {
  id: string;
  raisonSociale: string;
  siret: string;
  contactNom: string;
  contactEmail: string;
  telephone: string;
  signatureElectroniqueActive: boolean;
}

export type BeneficiaryType = 'personne_physique' | 'personne_morale';

export type PersonneMoraleType = 'collectivite' | 'bailleur_social' | 'entreprise' | 'copropriete' | 'sci' | 'association';

export interface Beneficiary {
  type: BeneficiaryType;
  civility: string; // 'M.' | 'Mme' | 'Autre'
  nom: string;
  prenom: string;
  raisonSociale?: string;
  siret?: string;
  typePersonneMorale?: PersonneMoraleType;
  adresse: string;
  codePostal: string;
  ville: string;
  email: string;
  telephone: string;
  telephonePortable?: string;
  telephoneFixe?: string;
  
  // Fiscal info
  situationFiscaleConnue?: boolean;
  nombrePersonnesFoyer?: number; // 1 to 10
  trancheRevenus?: 'tres_modeste' | 'modeste' | 'autres';
  nombreAvisImposition?: number;
  titulairesSupplementaires?: { nom: string; prenom: string }[];
}

export interface Contact {
  type: 'beneficiaire' | 'signataire' | 'autre';
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role?: string; // Role / link to client (if 'autre')
}

export interface ObjetDossier {
  type: 'renovation_batiment' | 'transport';
}

export type BatimentType = 'maison' | 'appartement' | 'batiment_tertiaire' | 'batiment_agricole' | 'batiment_industriel' | 'batiment_residentiel_collectif';

export interface BatimentInfo {
  type: BatimentType;
  nomBatiment?: string; // Mandatory if not maison or appartement
  nombreLogementsConcerne?: number; // Mandatory if residentiel collectif + bailleur social
  nombreLogementsConventionnesBailleur?: number; // Mandatory if residentiel collectif + bailleur social
  memeAdresseBeneficiaire: boolean;
  adresseTravaux?: string;
  codePostalTravaux?: string;
  villeTravaux?: string;
  residenceSecondaire?: boolean;
  locataireNomPrenom?: string; // Mandatory if not secondary residence & locataire exists
}

export interface ChantierPropertyDef {
  key: string;
  label: string;
  type: 'number' | 'text' | 'select';
  options?: string[];
  unit?: string;
  required?: boolean;
  placeholder?: string;
}

export interface CeeSheet {
  code: string;
  title: string;
  description: string;
  shortDescription: string;
  rules: string[];
  properties: ChantierPropertyDef[];
  calculateCumac: (props: Record<string, any>) => number;
}

export interface ChantierItem {
  id: string;
  ficheCode: string;
  ficheTitle: string;
  properties: Record<string, any>;
  volumeCumac: number;
  prime: number;
  intervenantType: 'societe' | 'autre';
  intervenantSubsType?: 'installateur' | 'sous_traitant';
  intervenantId?: string;
  marque: string;
  referenceProduit: string;
}

export interface Intervenant {
  id: string;
  raisonSociale: string;
  siret: string;
  representantNom: string;
  representantPrenom: string;
  fonction: string;
  email: string;
  telephone: string;
  documents: {
    kbis?: string;
    urssaf?: string;
    rge?: string[];
  };
}

export interface ChronologieDossier {
  visitePrealable?: string;
  acceptationDevis?: string;
  debutTravaux?: string;
  factureDate?: string;
}

export interface DocumentsCharges {
  devisSigne?: boolean;
  cadreContribution?: boolean;
  facture?: boolean;
  attestationHonneurSignee?: boolean;
  avisImposition?: boolean;
  justificatifDomicile?: boolean;
  cadastre?: boolean;
}

export type DossierStatus =
  | 'Simulé'
  | 'À engager'
  | 'Pré déclaré'
  | 'Déclaré'
  | 'Confirmé'
  | 'Traitement en cours'
  | 'Incomplet'
  | 'Complet'
  | 'Refusé';

export interface TravauxInfo {
  referenceDevis: string;
  dateDevis: string;
  dateRealisationPrevue: string; // format JJ/MM/AAAA or MM/AAAA
  chantiers: ChantierItem[];
}

export interface Dossier {
  id: string;
  reference: string;
  status: DossierStatus;
  dateCreation: string;
  beneficiaire: Beneficiary;
  contact: Contact;
  objet: ObjetDossier;
  batiment?: BatimentInfo;
  travaux: TravauxInfo;
  repartitionMode: 'global' | 'independant';
  repartitionGlobalPct: number; // Percentage to client (min 50)
  repartitionChantiersPct?: Record<string, number>; // key: chantierItem.id, value: percentage to client (min 50)
  primeTotale: number;
  partProfessionnelle: number;
  partBeneficiaire: number;
  typeDossier?: 'pre_declaration' | 'declaration';
  chronologie?: ChronologieDossier;
  documentsCharges?: DocumentsCharges;
}
