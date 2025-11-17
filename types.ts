
export interface Site {
  id: string;
  url: string;
  name: string;
}

export interface User {
  email: string;
  group: number;
}

export interface VotingConfig {
  sites: Site[];
  endTime: string;
}

export interface VoteCounts {
  [siteId: string]: number;
}

export interface Voter {
  email: string;
  votedFor: string;
}

export interface GroupVotes {
    [group: number]: number;
}

export type AppPhase = 'setup' | 'voting' | 'results';
