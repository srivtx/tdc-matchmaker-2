export type Gender = "Male" | "Female";
export type MaritalStatus = "Never Married" | "Divorced" | "Widowed";
export type Ternary = "Yes" | "No" | "Maybe";
export type JourneyStage =
  | "New Lead"
  | "Profile Created"
  | "Verification Pending"
  | "Verified"
  | "Preferences Set"
  | "Actively Matching"
  | "First Meeting Scheduled"
  | "In Discussion"
  | "On Hold"
  | "Matched";

export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  country: string;
  city: string;
  height: number;
  email: string;
  phone: string;
  undergradCollege: string;
  degree: string;
  income: number;
  currentCompany: string;
  designation: string;
  maritalStatus: MaritalStatus;
  languagesKnown: string[];
  siblings: number;
  caste: string;
  religion: string;
  wantKids: Ternary;
  openToRelocate: Ternary;
  openToPets: Ternary;
  diet: "Vegetarian" | "Non-Vegetarian" | "Eggetarian" | "Vegan" | "Jain";
  drink: "Yes" | "No" | "Occasionally";
  smoke: "Yes" | "No" | "Occasionally";
  familyType: "Nuclear" | "Joint";
  fatherOccupation: string;
  motherOccupation: string;
  hobbies: string[];
  about: string;
  avatar?: string;
  stage: JourneyStage;
  matchmakerId: string;
  notes: MatchmakerNote[];
}

export interface MatchmakerNote {
  id: string;
  text: string;
  timestamp: string;
}

export interface PoolProfile {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  country: string;
  city: string;
  height: number;
  email: string;
  phone: string;
  undergradCollege: string;
  degree: string;
  income: number;
  currentCompany: string;
  designation: string;
  maritalStatus: MaritalStatus;
  languagesKnown: string[];
  siblings: number;
  caste: string;
  religion: string;
  wantKids: Ternary;
  openToRelocate: Ternary;
  openToPets: Ternary;
  diet: string;
  drink: string;
  smoke: string;
  familyType: string;
  fatherOccupation: string;
  motherOccupation: string;
  hobbies: string[];
  about: string;
  avatar?: string;
}

export interface MatchmakerUser {
  id: string;
  username: string;
  password: string;
  name: string;
}

export interface MatchScore {
  profile: PoolProfile;
  totalScore: number;
  breakdown: MatchBreakdown;
  explanation: string;
  aiEnhanced?: boolean;
}

export interface MatchBreakdown {
  ageCompatibility: number;
  incomeCompatibility: number;
  heightCompatibility: number;
  educationCompatibility: number;
  valuesAlignment: number;
  lifestyleCompatibility: number;
  religionCasteBonus: number;
  languageOverlap: number;
  locationCompatibility: number;
  familyCompatibility: number;
}
