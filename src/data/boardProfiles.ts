export interface BoardProfile {
  orcid?: string;
  scholar?: string;
  academia?: string;
}

export const EDITORIAL_BOARD_PROFILES = {
  'mihai-barbulescu': {
    scholar: 'https://scholar.google.com/citations?user=WjMalKgAAAAJ&hl=en',
  },
  'ileana-benga': {
    scholar: 'https://scholar.google.com/citations?user=B62d_UoAAAAJ&hl=en',
  },
  'liviu-ovidiu-pop': {
    scholar: 'https://scholar.google.com/citations?user=nq-BVycAAAAJ&hl=en',
  },
  'theodor-constantiniu': {
    scholar: 'https://scholar.google.com/citations?user=XS-_Mh8AAAAJ&hl=en',
  },
  'anamaria-lisovschi': {
    scholar: 'https://scholar.google.com/citations?user=khlTb_cAAAAJ&hl=en',
  },
  'elena-barbulescu': {
    academia: 'https://apubb.academia.edu/ElenaBarbulescu',
  },
} as const satisfies Record<string, BoardProfile>;

export const SCIENTIFIC_BOARD_PROFILES: Record<string, BoardProfile> = {
  // Populate as ORCID iDs / Scholar / Academia profiles are collected.
};

export type EditorialKey = keyof typeof EDITORIAL_BOARD_PROFILES;
