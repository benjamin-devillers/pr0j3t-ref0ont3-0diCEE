import { CeeSheet } from '../types';

export const CLIMATE_ZONES = ['H1', 'H2', 'H3'] as const;

export const BRANDS = {
  'Atlantic': ['Alféa Extensa A.I.', 'Loria Duo', 'Aéromax 5 (Thermodynamique)', 'Shogun Connect'],
  'Daikin': ['Altherma 3 H HT', 'Altherma 3 R', 'Daikin Perfera', 'Ururu Sarara'],
  'Bosch': ['Compress 3400i AWS', 'Compress 7000i AW', 'Bosch Condens 8000i F', 'Bosch Climate 5000'],
  'Frisquet': ['Hydroconfort Condensation', 'Prestige Evolution', 'Visio Condens', 'Murales Frisquet'],
  'Nibe': ['Nibe F2120', 'Nibe S2125', 'Nibe F1245 (Géothermie)', 'Nibe S1155']
};

export const CEE_SHEETS_MAP: Record<string, CeeSheet> = {
  'BAR-EN-101': {
    code: 'BAR-EN-101',
    title: 'Isolation de combles ou de toitures',
    description: 'Isolation thermique performante des combles perdus ou des rampants de toiture pour réduire les déperditions thermiques du logement.',
    shortDescription: 'Isolation de combles perdus ou aménagés',
    rules: [
      'La résistance thermique R de l\'isolant installé doit être supérieure ou égale à 7 m².K/W.',
      'L\'opération doit être réalisée par un professionnel qualifié "RGE" (Reconnu Garant de l\'Environnement) à la date d\'engagement des travaux.',
      'L\'isolant mis en place doit être certifié ACERMI ou posséder un avis technique équivalent.'
    ],
    properties: [
      {
        key: 'surface',
        label: 'Surface isolée (m²)',
        type: 'number',
        required: true,
        placeholder: 'Ex: 120'
      },
      {
        key: 'resistance',
        label: 'Résistance thermique R installée (m².K/W)',
        type: 'number',
        required: true,
        placeholder: 'Doit être >= 7'
      },
      {
        key: 'climateZone',
        label: 'Zone climatique',
        type: 'select',
        options: ['H1', 'H2', 'H3'],
        required: true
      },
      {
        key: 'batimentType',
        label: 'Type de bâtiment',
        type: 'select',
        options: ['Maison', 'Appartement'],
        required: true
      }
    ],
    calculateCumac: (props) => {
      const surface = parseFloat(props.surface) || 0;
      const resistance = parseFloat(props.resistance) || 0;
      const climateZone = props.climateZone || 'H1';
      const batimentType = props.batimentType || 'Maison';

      if (resistance < 7) return 0;

      // Factors in MWh cumac per m2
      const factors: Record<string, Record<string, number>> = {
        'Maison': { 'H1': 0.18, 'H2': 0.15, 'H3': 0.09 },
        'Appartement': { 'H1': 0.11, 'H2': 0.09, 'H3': 0.05 }
      };

      const factor = factors[batimentType]?.[climateZone] || 0.15;
      return parseFloat((surface * factor).toFixed(2));
    }
  },
  'BAR-EN-102': {
    code: 'BAR-EN-102',
    title: 'Isolation de murs par l\'extérieur ou l\'intérieur',
    description: 'Isolation thermique des murs de façade ou de pignon par l\'intérieur ou l\'extérieur pour optimiser le confort thermique.',
    shortDescription: 'Isolation de murs (ITE ou ITI)',
    rules: [
      'La résistance thermique R de l\'isolant installé doit être supérieure ou égale à 3.7 m².K/W.',
      'Réalisation par un professionnel titulaire d\'une qualification RGE dans le domaine de l\'isolation des murs.',
      'Les parements de finition doivent respecter la réglementation thermique locale.'
    ],
    properties: [
      {
        key: 'surface',
        label: 'Surface isolée (m²)',
        type: 'number',
        required: true,
        placeholder: 'Ex: 85'
      },
      {
        key: 'resistance',
        label: 'Résistance thermique R installée (m².K/W)',
        type: 'number',
        required: true,
        placeholder: 'Doit être >= 3.7'
      },
      {
        key: 'climateZone',
        label: 'Zone climatique',
        type: 'select',
        options: ['H1', 'H2', 'H3'],
        required: true
      },
      {
        key: 'chauffageType',
        label: 'Type de chauffage principal',
        type: 'select',
        options: ['Électrique', 'Combustible (Gaz/Fioul/Bois)'],
        required: true
      }
    ],
    calculateCumac: (props) => {
      const surface = parseFloat(props.surface) || 0;
      const resistance = parseFloat(props.resistance) || 0;
      const climateZone = props.climateZone || 'H1';
      const chauffageType = props.chauffageType || 'Électrique';

      if (resistance < 3.7) return 0;

      const isElectric = chauffageType.includes('Électrique');
      
      const factors: Record<string, Record<string, number>> = {
        'electric': { 'H1': 0.28, 'H2': 0.23, 'H3': 0.14 },
        'combustible': { 'H1': 0.19, 'H2': 0.16, 'H3': 0.10 }
      };

      const key = isElectric ? 'electric' : 'combustible';
      const factor = factors[key]?.[climateZone] || 0.19;
      return parseFloat((surface * factor).toFixed(2));
    }
  },
  'BAR-TH-104': {
    code: 'BAR-TH-104',
    title: 'Pompe à chaleur air/eau',
    description: 'Installation d\'une pompe à chaleur air/eau performante assurant le chauffage ou le chauffage et l\'eau chaude sanitaire.',
    shortDescription: 'Pompe à chaleur air/eau (PAC)',
    rules: [
      'L\'efficacité énergétique saisonnière (ηs) doit être supérieure ou égale à 111% pour les PAC à moyenne/haute température, ou 126% pour les PAC basse température.',
      'Un régulateur de classe IV au minimum doit être installé en option.',
      'Le professionnel réalisant la pose doit être qualifié RGE Pompe à chaleur.'
    ],
    properties: [
      {
        key: 'climateZone',
        label: 'Zone climatique',
        type: 'select',
        options: ['H1', 'H2', 'H3'],
        required: true
      },
      {
        key: 'batimentType',
        label: 'Type de bâtiment',
        type: 'select',
        options: ['Maison', 'Appartement'],
        required: true
      },
      {
        key: 'temperatureRegime',
        label: 'Régime de température',
        type: 'select',
        options: ['Basse température (Régulateur dédié)', 'Moyenne/Haute température (Standard)'],
        required: true
      },
      {
        key: 'efficaciteSaisonniere',
        label: 'Efficacité énergétique saisonnière ηs (%)',
        type: 'number',
        required: true,
        placeholder: 'Ex: 125'
      }
    ],
    calculateCumac: (props) => {
      const etaS = parseFloat(props.efficaciteSaisonniere) || 0;
      const climateZone = props.climateZone || 'H1';
      const batimentType = props.batimentType || 'Maison';
      const regime = props.temperatureRegime || 'Standard';

      const limit = regime.includes('Basse') ? 126 : 111;
      if (etaS < limit) return 0;

      // Flat values in MWh cumac
      const values: Record<string, Record<string, number>> = {
        'Maison': { 'H1': 145, 'H2': 120, 'H3': 80 },
        'Appartement': { 'H1': 90, 'H2': 75, 'H3': 50 }
      };

      const baseValue = values[batimentType]?.[climateZone] || 120;
      return baseValue;
    }
  },
  'BAR-TH-113': {
    code: 'BAR-TH-113',
    title: 'Chaudière biomasse individuelle',
    description: 'Pose d\'une chaudière à alimentation automatique ou manuelle fonctionnant au bois (granulés, briquettes, bûches) pour un confort durable.',
    shortDescription: 'Chaudière biomasse individuelle',
    rules: [
      'Le rendement utile doit être supérieur ou égal à 85% pour les chargements automatiques, ou 80% pour les chargements manuels.',
      'La chaudière doit posséder le label Flamme Verte 7 étoiles ou des caractéristiques techniques équivalentes.',
      'Installation impérative par un professionnel qualifié RGE Qualibois.'
    ],
    properties: [
      {
        key: 'climateZone',
        label: 'Zone climatique',
        type: 'select',
        options: ['H1', 'H2', 'H3'],
        required: true
      },
      {
        key: 'batimentType',
        label: 'Type de bâtiment',
        type: 'select',
        options: ['Maison', 'Appartement'],
        required: true
      },
      {
        key: 'alimentationType',
        label: 'Type d\'alimentation',
        type: 'select',
        options: ['Automatique (Granulés/Pellets)', 'Manuel (Bûches/Plaquettes)'],
        required: true
      },
      {
        key: 'rendement',
        label: 'Rendement de la chaudière (%)',
        type: 'number',
        required: true,
        placeholder: 'Ex: 88'
      }
    ],
    calculateCumac: (props) => {
      const rendement = parseFloat(props.rendement) || 0;
      const climateZone = props.climateZone || 'H1';
      const batimentType = props.batimentType || 'Maison';
      const alimentation = props.alimentationType || 'Automatique';

      const limit = alimentation.includes('Automatique') ? 85 : 80;
      if (rendement < limit) return 0;

      // Flat values in MWh cumac
      const values: Record<string, Record<string, number>> = {
        'Maison': { 'H1': 110, 'H2': 92, 'H3': 60 },
        'Appartement': { 'H1': 65, 'H2': 55, 'H3': 35 }
      };

      const baseValue = values[batimentType]?.[climateZone] || 92;
      return baseValue;
    }
  }
};

export const CEE_SHEETS_LIST = Object.values(CEE_SHEETS_MAP);

export const MOCK_CLIENTS = [
  {
    type: 'personne_physique' as const,
    civility: 'M.',
    prenom: 'Jean-Pierre',
    nom: 'Martin',
    adresse: '14 Rue de la République',
    codePostal: '69002',
    ville: 'Lyon',
    email: 'jp.martin@gmail.com',
    telephone: '06 12 34 56 78',
    situationFiscaleConnue: true,
    nombrePersonnesFoyer: 3,
    trancheRevenus: 'modeste' as const,
    nombreAvisImposition: 1
  },
  {
    type: 'personne_physique' as const,
    civility: 'Mme',
    prenom: 'Sophie',
    nom: 'Dubois',
    adresse: '82 Avenue des Champs-Élysées',
    codePostal: '75008',
    ville: 'Paris',
    email: 'sophie.dubois@outlook.fr',
    telephone: '06 98 76 54 32',
    situationFiscaleConnue: false
  },
  {
    type: 'personne_morale' as const,
    raisonSociale: 'SCI du Château',
    siret: '83920194000012',
    typePersonneMorale: 'sci' as const,
    civility: 'M.',
    prenom: 'Marc',
    nom: 'Lefebvre',
    adresse: '5 Allée des Marronniers',
    codePostal: '33000',
    ville: 'Bordeaux',
    email: 'contact@sciduchateau.fr',
    telephone: '05 56 12 34 56'
  },
  {
    type: 'personne_morale' as const,
    raisonSociale: 'Habitat Solidaire Ouest',
    siret: '49201930200021',
    typePersonneMorale: 'bailleur_social' as const,
    civility: 'Mme',
    prenom: 'Isabelle',
    nom: 'Moreau',
    adresse: '4 Place du Commerce',
    codePostal: '44000',
    ville: 'Nantes',
    email: 'isabelle.moreau@habitatsolidaire.org',
    telephone: '02 40 50 60 70'
  }
];

export const MOCK_INTERVENANTS = [
  {
    id: 'int-1',
    raisonSociale: 'Thermique & Chauffage RGE',
    siret: '38291039200012',
    representantNom: 'Dupond',
    representantPrenom: 'Alain',
    fonction: 'Directeur Technique',
    email: 'contact@thermique-rge.fr',
    telephone: '06 43 21 09 87',
    documents: { kbis: 'kbis.pdf', urssaf: 'urssaf.pdf', rge: ['rge_pac.pdf', 'rge_isolation.pdf'] }
  },
  {
    id: 'int-2',
    raisonSociale: 'Éco-Isolateurs Associés',
    siret: '59201930100034',
    representantNom: 'Garner',
    representantPrenom: 'Lucas',
    fonction: 'Gérant',
    email: 'lucas.garner@ecoisolateurs.com',
    telephone: '06 87 65 43 21',
    documents: { kbis: 'kbis_eco.pdf', urssaf: 'urssaf_eco.pdf', rge: ['rge_isolation_combles.pdf'] }
  }
];

export const MOCK_DOSSIERS: any[] = [
  {
    id: 'dos-1',
    reference: 'CEE-2026-00349',
    status: 'Déclaré',
    dateCreation: '2026-06-15',
    beneficiary: MOCK_CLIENTS[0],
    contact: {
      type: 'beneficiaire',
      nom: MOCK_CLIENTS[0].nom,
      prenom: MOCK_CLIENTS[0].prenom,
      email: MOCK_CLIENTS[0].email,
      telephone: MOCK_CLIENTS[0].telephone
    },
    objet: { type: 'renovation_batiment' },
    batiment: {
      type: 'maison',
      memeAdresseBeneficiaire: true
    },
    travaux: {
      referenceDevis: 'DEV-2026-904',
      dateDevis: '2026-06-10',
      dateRealisationPrevue: '2026-08-15',
      chantiers: [
        {
          id: 'ch-1',
          ficheCode: 'BAR-EN-101',
          ficheTitle: 'Isolation de combles ou de toitures',
          properties: {
            surface: 140,
            resistance: 7.5,
            climateZone: 'H1',
            batimentType: 'Maison'
          },
          volumeCumac: 25.2, // 140 * 0.18
          prime: 151.2, // 25.2 * 6
          intervenantType: 'societe',
          marque: 'Atlantic',
          referenceProduit: 'Aéromax 5 (Thermodynamique)'
        }
      ]
    },
    repartitionMode: 'global',
    repartitionGlobalPct: 80,
    primeTotale: 151.2,
    partProfessionnelle: 30.24,
    partBeneficiaire: 120.96,
    typeDossier: 'declaration',
    documentsCharges: {
      devisSigne: true,
      cadreContribution: true,
      facture: false,
      attestationHonneurSignee: false
    }
  },
  {
    id: 'dos-2',
    reference: 'CEE-2026-00412',
    status: 'Simulé',
    dateCreation: '2026-06-28',
    beneficiary: MOCK_CLIENTS[1],
    contact: {
      type: 'beneficiaire',
      nom: MOCK_CLIENTS[1].nom,
      prenom: MOCK_CLIENTS[1].prenom,
      email: MOCK_CLIENTS[1].email,
      telephone: MOCK_CLIENTS[1].telephone
    },
    objet: { type: 'renovation_batiment' },
    batiment: {
      type: 'appartement',
      memeAdresseBeneficiaire: true
    },
    travaux: {
      referenceDevis: 'DEV-PROP-002',
      dateDevis: '2026-06-25',
      dateRealisationPrevue: '09/2026',
      chantiers: [
        {
          id: 'ch-2',
          ficheCode: 'BAR-TH-104',
          ficheTitle: 'Pompe à chaleur air/eau',
          properties: {
            climateZone: 'H2',
            batimentType: 'Appartement',
            temperatureRegime: 'Moyenne/Haute température (Standard)',
            efficaciteSaisonniere: 120
          },
          volumeCumac: 75,
          prime: 450,
          intervenantType: 'autre',
          intervenantId: 'int-1',
          marque: 'Atlantic',
          referenceProduit: 'Alféa Extensa A.I.'
        }
      ]
    },
    repartitionMode: 'global',
    repartitionGlobalPct: 100,
    primeTotale: 450,
    partProfessionnelle: 0,
    partBeneficiaire: 450
  },
  {
    id: 'dos-3',
    reference: 'CEE-2026-00105',
    status: 'Confirmé',
    dateCreation: '2026-05-02',
    beneficiary: MOCK_CLIENTS[2],
    contact: {
      type: 'autre',
      nom: 'Sartre',
      prenom: 'Jean',
      email: 'jean.sartre@gamil.com',
      telephone: '06 11 22 33 44',
      role: 'Gestionnaire de Copropriété'
    },
    objet: { type: 'renovation_batiment' },
    batiment: {
      type: 'batiment_tertiaire',
      nomBatiment: 'Immeuble Le Royal',
      memeAdresseBeneficiaire: false,
      adresseTravaux: '12 Boulevard Michelet',
      codePostalTravaux: '33000',
      villeTravaux: 'Bordeaux'
    },
    travaux: {
      referenceDevis: 'QT-2026-88',
      dateDevis: '2026-04-20',
      dateRealisationPrevue: '2026-07-10',
      chantiers: [
        {
          id: 'ch-3',
          ficheCode: 'BAR-EN-102',
          ficheTitle: 'Isolation de murs par l\'extérieur ou l\'intérieur',
          properties: {
            surface: 320,
            resistance: 4.2,
            climateZone: 'H2',
            chauffageType: 'Combustible (Gaz/Fioul/Bois)'
          },
          volumeCumac: 51.2, // 320 * 0.16
          prime: 307.2, // 51.2 * 6
          intervenantType: 'societe',
          marque: 'Bosch',
          referenceProduit: 'Bosch Condens 8000i F'
        }
      ]
    },
    repartitionMode: 'global',
    repartitionGlobalPct: 60,
    primeTotale: 307.2,
    partProfessionnelle: 122.88,
    partBeneficiaire: 184.32,
    chronologie: {
      visitePrealable: '2026-04-15',
      acceptationDevis: '2026-04-25',
      debutTravaux: '2026-06-01',
      factureDate: '2026-06-30'
    },
    documentsCharges: {
      devisSigne: true,
      cadreContribution: true,
      facture: true,
      attestationHonneurSignee: true
    }
  }
];
