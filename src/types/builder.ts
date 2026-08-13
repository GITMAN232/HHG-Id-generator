export interface BuilderData {
  id: string;
  name: string;
  role: string;
  stack: string;
  tagline: string;
  xHandle: string;
  photoUrl: string | null;
  teamName?: string;
  passportNumber: string;
  issueDate: string;
  loadout: string[];
  dnaStats: {
    build: number;
    hack: number;
    ship: number;
    create: number;
  };
}

export interface TeamMember extends BuilderData {
  addedAt: number;
}
