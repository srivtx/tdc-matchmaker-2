import { CustomerProfile, PoolProfile, MatchScore, MatchBreakdown } from "./types";

export function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date("2026-06-01");
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

function scoreAgeCompatibility(customerAge: number, poolAge: number, customerGender: string): number {
  const diff = customerGender === "Male" ? customerAge - poolAge : poolAge - customerAge;
  if (diff < 0) return Math.max(0, 40 + diff * 5);
  if (diff <= 3) return 100;
  if (diff <= 5) return 90;
  if (diff <= 7) return 70;
  if (diff <= 10) return 40;
  return 10;
}

function scoreIncomeCompatibility(customerIncome: number, poolIncome: number, customerGender: string): number {
  const ratio = customerGender === "Male"
    ? customerIncome / Math.max(poolIncome, 1)
    : poolIncome / Math.max(customerIncome, 1);
  if (ratio >= 0.6 && ratio <= 2.5) return 95;
  if (ratio >= 0.4 && ratio <= 4) return 75;
  if (ratio >= 0.25 && ratio <= 6) return 50;
  return 20;
}

function scoreHeightCompatibility(customerHeight: number, poolHeight: number, customerGender: string): number {
  const diff = customerGender === "Male" ? customerHeight - poolHeight : poolHeight - customerHeight;
  if (diff >= 5 && diff <= 15) return 100;
  if (diff >= 2 && diff <= 20) return 85;
  if (diff >= 0 && diff <= 25) return 60;
  if (diff > 25) return 30;
  return 20;
}

function scoreEducationCompatibility(customer: CustomerProfile, pool: PoolProfile): number {
  let score = 50;
  const tier1 = ["B.Tech", "M.Tech", "MBBS", "CA", "MBA"];
  const tier2 = ["B.E.", "B.Sc", "BBA", "LLB"];
  const cuTier = tier1.includes(customer.degree) ? 1 : tier2.includes(customer.degree) ? 2 : 3;
  const puTier = tier1.includes(pool.degree) ? 1 : tier2.includes(pool.degree) ? 2 : 3;
  if (cuTier === puTier) score = 100;
  else if (Math.abs(cuTier - puTier) === 1) score = 75;
  if (customer.undergradCollege === pool.undergradCollege) score = Math.min(100, score + 20);
  return score;
}

function scoreValuesAlignment(customer: CustomerProfile, pool: PoolProfile): number {
  let score = 50;
  if (customer.wantKids === pool.wantKids) score += 25;
  else if (customer.wantKids === "Maybe" || pool.wantKids === "Maybe") score += 10;
  if (customer.diet === pool.diet) score += 15;
  else if (
    (customer.diet === "Vegetarian" && pool.diet === "Eggetarian") ||
    (customer.diet === "Eggetarian" && pool.diet === "Vegetarian")
  ) score += 10;
  if (customer.drink === pool.drink) score += 5;
  if (customer.smoke === pool.smoke) score += 5;
  return Math.min(100, score);
}

function scoreLifestyleCompatibility(customer: CustomerProfile, pool: PoolProfile): number {
  let score = 40;
  if (customer.openToPets === pool.openToPets) score += 20;
  else if (customer.openToPets === "Maybe" || pool.openToPets === "Maybe") score += 10;
  if (customer.openToRelocate === pool.openToRelocate) score += 15;
  else if (customer.openToRelocate === "Maybe" || pool.openToRelocate === "Maybe") score += 8;
  if (customer.diet === pool.diet) score += 15;
  const sharedHobbies = customer.hobbies.filter(h => pool.hobbies.includes(h)).length;
  score += sharedHobbies * 5;
  return Math.min(100, score);
}

function scoreReligionCaste(customer: CustomerProfile, pool: PoolProfile): number {
  let score = 20;
  if (customer.religion === pool.religion) score += 50;
  if (customer.caste === pool.caste) score += 30;
  return score;
}

function scoreLanguageOverlap(customer: CustomerProfile, pool: PoolProfile): number {
  const shared = customer.languagesKnown.filter(l => pool.languagesKnown.includes(l)).length;
  const total = Math.max(customer.languagesKnown.length, pool.languagesKnown.length);
  return Math.round((shared / total) * 100);
}

function scoreLocationCompatibility(customer: CustomerProfile, pool: PoolProfile): number {
  if (customer.city === pool.city) return 100;
  if (customer.openToRelocate === "Yes" || pool.openToRelocate === "Yes") return 70;
  if (customer.openToRelocate === "Maybe" && pool.openToRelocate === "Maybe") return 50;
  return 20;
}

function scoreFamilyCompatibility(customer: CustomerProfile, pool: PoolProfile): number {
  let score = 40;
  if (customer.familyType === pool.familyType) score += 30;
  if (customer.maritalStatus === pool.maritalStatus) score += 15;
  const sibDiff = Math.abs(customer.siblings - pool.siblings);
  if (sibDiff === 0) score += 10;
  else if (sibDiff === 1) score += 5;
  return Math.min(100, score);
}

export function calculateTotalScore(breakdown: MatchBreakdown): number {
  const weights = {
    ageCompatibility: 0.12,
    incomeCompatibility: 0.10,
    heightCompatibility: 0.06,
    educationCompatibility: 0.12,
    valuesAlignment: 0.18,
    lifestyleCompatibility: 0.14,
    religionCasteBonus: 0.10,
    languageOverlap: 0.06,
    locationCompatibility: 0.06,
    familyCompatibility: 0.06,
  };
  return Math.round(
    breakdown.ageCompatibility * weights.ageCompatibility +
    breakdown.incomeCompatibility * weights.incomeCompatibility +
    breakdown.heightCompatibility * weights.heightCompatibility +
    breakdown.educationCompatibility * weights.educationCompatibility +
    breakdown.valuesAlignment * weights.valuesAlignment +
    breakdown.lifestyleCompatibility * weights.lifestyleCompatibility +
    breakdown.religionCasteBonus * weights.religionCasteBonus +
    breakdown.languageOverlap * weights.languageOverlap +
    breakdown.locationCompatibility * weights.locationCompatibility +
    breakdown.familyCompatibility * weights.familyCompatibility
  );
}

function generateExplanation(score: number, breakdown: MatchBreakdown, customer: CustomerProfile, pool: PoolProfile): string {
  const customerAge = calculateAge(customer.dateOfBirth);
  const poolAge = calculateAge(pool.dateOfBirth);
  const highlights: string[] = [];
  if (breakdown.valuesAlignment >= 80) highlights.push("strong values alignment");
  if (breakdown.educationCompatibility >= 80) highlights.push("compatible educational backgrounds");
  if (breakdown.lifestyleCompatibility >= 80) highlights.push("compatible lifestyle preferences");
  if (breakdown.religionCasteBonus >= 80) highlights.push("shared religious and community background");
  if (breakdown.ageCompatibility >= 90) highlights.push("ideal age gap");
  if (breakdown.incomeCompatibility >= 80) highlights.push("compatible income brackets");
  if (customer.city === pool.city) highlights.push("same city");
  if (breakdown.languageOverlap >= 80) highlights.push("shared languages");

  const tier = score >= 85 ? "Excellent" : score >= 70 ? "High" : score >= 50 ? "Good" : "Okay";

  if (highlights.length >= 3) {
    return `${tier} match — ${highlights.slice(0, 3).join(", ")}. ${pool.firstName} (${poolAge}, ${pool.city}) shares key compatibility factors with ${customer.firstName}.`;
  }
  if (highlights.length > 0) {
    return `${tier} potential — ${highlights.join(" and ")}. Worth exploring further.`;
  }
  return `${tier} compatibility. Some differences in preferences may require discussion.`;
}

export function scoreMatch(customer: CustomerProfile, poolProfile: PoolProfile): MatchScore {
  const customerAge = calculateAge(customer.dateOfBirth);
  const poolAge = calculateAge(poolProfile.dateOfBirth);

  const breakdown: MatchBreakdown = {
    ageCompatibility: scoreAgeCompatibility(customerAge, poolAge, customer.gender),
    incomeCompatibility: scoreIncomeCompatibility(customer.income, poolProfile.income, customer.gender),
    heightCompatibility: scoreHeightCompatibility(customer.height, poolProfile.height, customer.gender),
    educationCompatibility: scoreEducationCompatibility(customer, poolProfile),
    valuesAlignment: scoreValuesAlignment(customer, poolProfile),
    lifestyleCompatibility: scoreLifestyleCompatibility(customer, poolProfile),
    religionCasteBonus: scoreReligionCaste(customer, poolProfile),
    languageOverlap: scoreLanguageOverlap(customer, poolProfile),
    locationCompatibility: scoreLocationCompatibility(customer, poolProfile),
    familyCompatibility: scoreFamilyCompatibility(customer, poolProfile),
  };

  const totalScore = calculateTotalScore(breakdown);
  const explanation = generateExplanation(totalScore, breakdown, customer, poolProfile);

  return {
    profile: poolProfile,
    totalScore,
    breakdown,
    explanation,
  };
}

export function getMatchesForCustomer(
  customer: CustomerProfile,
  pool: PoolProfile[],
  limit = 15
): MatchScore[] {
  const oppositeGender = customer.gender === "Male" ? "Female" : "Male";
  const eligiblePool = pool.filter(p => p.gender === oppositeGender);

  const scored = eligiblePool.map(p => scoreMatch(customer, p));
  scored.sort((a, b) => b.totalScore - a.totalScore);

  return scored.slice(0, limit);
}
