import { CustomerProfile, PoolProfile, JourneyStage } from "@/lib/types";

const firstNamesMale = [
  "Aarav", "Arjun", "Rohan", "Vikram", "Aditya", "Karan", "Siddharth", "Nikhil",
  "Rahul", "Amit", "Vivek", "Raj", "Deepak", "Suresh", "Anil", "Kunal",
  "Varun", "Pranav", "Manish", "Gaurav", "Abhishek", "Rishi", "Tanmay", "Harsh",
  "Dev", "Kartik", "Yash", "Dhruv", "Aryan", "Ishaan",
];

const firstNamesFemale = [
  "Ananya", "Priya", "Neha", "Shruti", "Kavya", "Divya", "Pooja", "Riya",
  "Aishwarya", "Deepika", "Sneha", "Meera", "Tanvi", "Ishita", "Nandini", "Aditi",
  "Ritika", "Swati", "Shreya", "Simran", "Pallavi", "Anjali", "Radhika", "Sanya",
  "Tanya", "Kiara", "Avni", "Jiya", "Navya", "Sakshi",
];

const lastNames = [
  "Sharma", "Verma", "Patel", "Reddy", "Kumar", "Singh", "Gupta", "Joshi",
  "Nair", "Menon", "Chopra", "Malhotra", "Kapoor", "Mehta", "Agarwal", "Bose",
  "Das", "Iyer", "Rao", "Desai", "Naidu", "Pillai", "Shetty", "Thakur",
  "Yadav", "Chauhan", "Saxena", "Srivastava", "Mishra", "Tiwari",
];

const cities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata",
  "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Indore", "Kochi", "Nagpur",
  "Surat", "Bhopal", "Vadodara", "Nashik", "Coimbatore", "Visakhapatnam",
];

const colleges = [
  "IIT Delhi", "IIT Bombay", "BITS Pilani", "NIT Trichy", "Delhi University",
  "Mumbai University", "Anna University", "IIIT Hyderabad", "VIT Vellore",
  "Manipal Institute", "SRM University", "Christ University", "Jadavpur University",
  "Fergusson College", "St. Xavier's Mumbai",
];

const degrees = ["B.Tech", "B.E.", "B.Sc", "B.Com", "BBA", "MBBS", "LLB", "CA", "MBA", "M.Tech"];

const companies = [
  "Google", "Microsoft", "Amazon", "Infosys", "TCS", "Wipro", "HCL", "Tech Mahindra",
  "Flipkart", "Swiggy", "Zomato", "Paytm", "Byju's", "Ola", "Cred", "Unacademy",
  "Deloitte", "EY", "KPMG", "PwC",
];

const designations = [
  "Software Engineer", "Product Manager", "Data Scientist", "Business Analyst",
  "Consultant", "Marketing Manager", "Finance Analyst", "UX Designer",
  "Senior Engineer", "Engineering Manager", "Operations Lead", "HR Manager",
  "Chartered Accountant", "Doctor", "Research Scientist", "Content Strategist",
];

const castes = [
  "Brahmin", "Rajput", "Maratha", "Kayastha", "Agarwal", "Jain", "Jat", "Patel",
  "Reddy", "Nair", "Sikh", "Khatri", "Arora", "Bania", "Kurmi", "Lohana",
];

const religions = ["Hindu", "Sikh", "Jain", "Buddhist", "Christian", "Muslim"];

const hobbiesList = [
  "Reading", "Traveling", "Cooking", "Photography", "Hiking", "Yoga",
  "Painting", "Dancing", "Singing", "Swimming", "Gym", "Running",
  "Trekking", "Cycling", "Movies", "Music", "Gardening", "Volunteering",
  "Cricket", "Badminton", "Chess", "Blogging", "Meditation", "Gaming",
];

const journeyStages: JourneyStage[] = [
  "New Lead", "Profile Created", "Verified", "Preferences Set",
  "Actively Matching", "First Meeting Scheduled", "In Discussion",
  "On Hold", "Matched",
];

interface RawProfile {
  firstName: string;
  lastName: string;
  gender: "Male" | "Female";
  age: number;
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
  maritalStatus: "Never Married" | "Divorced" | "Widowed";
  languages: string[];
  siblings: number;
  caste: string;
  religion: string;
  wantKids: "Yes" | "No" | "Maybe";
  openToRelocate: "Yes" | "No" | "Maybe";
  openToPets: "Yes" | "No" | "Maybe";
  diet: string;
  drink: string;
  smoke: string;
  familyType: string;
  fatherOccupation: string;
  motherOccupation: string;
  hobbies: string[];
  about: string;
  stage?: JourneyStage;
  matchmakerId?: string;
}

// Deterministic random number generator
let seed = 12345;
function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => random() - 0.5);
  return shuffled.slice(0, n);
}

function genDOB(age: number): string {
  const y = 2026 - age;
  const m = String(Math.floor(random() * 12) + 1).padStart(2, "0");
  const d = String(Math.floor(random() * 28) + 1).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function genPhone(): string {
  return `+91-${Math.floor(random() * 9000000000) + 1000000000}`;
}

function genEmail(fn: string, ln: string): string {
  return `${fn.toLowerCase()}.${ln.toLowerCase()}${Math.floor(random() * 99)}@email.com`;
}

function aboutText(gender: string, fn: string, hobbies: string[]): string {
  const templates = [
    `${fn} is a warm and ambitious individual who values family traditions. Enjoys ${hobbies.slice(0, 2).join(" and ")} in free time. Looking for a compatible life partner who shares similar values.`,
    `A grounded ${gender === "Male" ? "man" : "woman"} with a modern outlook and deep respect for culture. ${fn} loves ${hobbies.slice(0, 2).join(" and ")} and believes in building a strong partnership.`,
    `${fn} comes from a well-educated family and has built a successful career. Passionate about ${hobbies[0]}, and seeks a partner who is equally driven yet family-oriented.`,
  ];
  return pick(templates);
}

function generateProfile(gender: "Male" | "Female", index: number, isCustomer: boolean): RawProfile {
  // reset seed for determinism based on index
  seed = 12345 + index * 999;
  
  const firstNames = gender === "Male" ? firstNamesMale : firstNamesFemale;
  const fn = firstNames[index % firstNames.length];
  const ln = pick(lastNames);
  const age = gender === "Male"
    ? Math.floor(random() * 13) + 24
    : Math.floor(random() * 13) + 22;
  const dietOptions = ["Vegetarian", "Non-Vegetarian", "Eggetarian", "Vegan", "Jain"];
  const drinkOptions = ["Yes", "No", "Occasionally"];
  const smokeOptions = ["No", "No", "No", "Occasionally", "Yes"];
  const familyOptions = ["Nuclear", "Joint"];
  const fatherOccs = ["Businessman", "Government Officer", "Doctor", "Engineer", "Professor", "Army Officer", "Lawyer"];
  const motherOccs = ["Homemaker", "Teacher", "Doctor", "Government Officer", "Homemaker", "Homemaker"];

  const hobbies = pickN(hobbiesList, 2 + Math.floor(random() * 3));

  const base: RawProfile = {
    firstName: fn,
    lastName: ln,
    gender,
    age,
    country: "India",
    city: pick(cities),
    height: gender === "Male"
      ? Math.floor(random() * 25) + 163
      : Math.floor(random() * 20) + 150,
    email: genEmail(fn, ln),
    phone: genPhone(),
    undergradCollege: pick(colleges),
    degree: pick(degrees),
    income: gender === "Male"
      ? [6, 8, 10, 12, 15, 18, 22, 25, 30, 35, 40, 50, 60][Math.floor(random() * 13)]
      : [4, 5, 6, 8, 10, 12, 15, 18, 22, 25, 30][Math.floor(random() * 11)],
    currentCompany: pick(companies),
    designation: pick(designations),
    maritalStatus: random() > 0.8 ? "Divorced" : "Never Married",
    languages: (() => {
      const langs: string[] = [];
      const tries = 2;
      for (let i = 0; i < tries; i++) {
        const l = pick(["Hindi", "English", "Tamil", "Telugu", "Marathi", "Bengali", "Gujarati", "Punjabi", "Malayalam", "Kannada"]);
        if (!langs.includes(l)) langs.push(l);
      }
      // Ensure English is present (but only once) since this is an India-focused app
      if (!langs.includes("English")) langs.push("English");
      return langs;
    })(),
    siblings: Math.floor(random() * 3) + 1,
    caste: pick(castes),
    religion: pick(religions),
    wantKids: pick(["Yes", "Yes", "Maybe", "No"]),
    openToRelocate: pick(["Yes", "Maybe", "Yes", "No"]),
    openToPets: pick(["Yes", "Maybe", "No"]),
    diet: pick(dietOptions),
    drink: pick(drinkOptions),
    smoke: pick(smokeOptions),
    familyType: pick(familyOptions),
    fatherOccupation: pick(fatherOccs),
    motherOccupation: pick(motherOccs),
    hobbies,
    about: aboutText(gender, fn, hobbies),
  };

  if (isCustomer) {
    base.stage = pick(journeyStages);
    base.matchmakerId = "mm-1";
  }

  return base;
}


const maleAvatars = ["/avatars/image1.jpg", "/avatars/image2.jpg", "/avatars/image5.jpg", "/avatars/image6.jpg"];
const femaleAvatars = ["/avatars/image3.jpg", "/avatars/image4.jpg", "/avatars/image7.jpg"];

function toCustomer(raw: RawProfile, id: number): CustomerProfile {
  return {
    id: `cust-${id}`,
    firstName: raw.firstName,
    lastName: raw.lastName,
    gender: raw.gender,
    dateOfBirth: genDOB(raw.age),
    country: raw.country,
    city: raw.city,
    height: raw.height,
    email: raw.email,
    phone: raw.phone,
    undergradCollege: raw.undergradCollege,
    degree: raw.degree,
    income: raw.income * 100000,
    currentCompany: raw.currentCompany,
    designation: raw.designation,
    maritalStatus: raw.maritalStatus,
    languagesKnown: raw.languages,
    siblings: raw.siblings,
    caste: raw.caste,
    religion: raw.religion,
    wantKids: raw.wantKids,
    openToRelocate: raw.openToRelocate,
    openToPets: raw.openToPets,
    diet: raw.diet as CustomerProfile["diet"],
    drink: raw.drink as CustomerProfile["drink"],
    smoke: raw.smoke as CustomerProfile["smoke"],
    familyType: raw.familyType as CustomerProfile["familyType"],
    fatherOccupation: raw.fatherOccupation,
    motherOccupation: raw.motherOccupation,
    hobbies: raw.hobbies,
    about: raw.about,
    avatar: raw.gender === "Male" ? maleAvatars[id % maleAvatars.length] : femaleAvatars[id % femaleAvatars.length],
    stage: raw.stage!,
    matchmakerId: raw.matchmakerId!,
    notes: [],
  };
}

function toPool(raw: RawProfile, id: number): PoolProfile {
  return {
    id: `pool-${id}`,
    firstName: raw.firstName,
    lastName: raw.lastName,
    gender: raw.gender,
    dateOfBirth: genDOB(raw.age),
    country: raw.country,
    city: raw.city,
    height: raw.height,
    email: raw.email,
    phone: raw.phone,
    undergradCollege: raw.undergradCollege,
    degree: raw.degree,
    income: raw.income * 100000,
    currentCompany: raw.currentCompany,
    designation: raw.designation,
    maritalStatus: raw.maritalStatus,
    languagesKnown: raw.languages,
    siblings: raw.siblings,
    caste: raw.caste,
    religion: raw.religion,
    wantKids: raw.wantKids,
    openToRelocate: raw.openToRelocate,
    openToPets: raw.openToPets,
    diet: raw.diet,
    drink: raw.drink,
    smoke: raw.smoke,
    familyType: raw.familyType,
    fatherOccupation: raw.fatherOccupation,
    motherOccupation: raw.motherOccupation,
    hobbies: raw.hobbies,
    about: raw.about,
    avatar: raw.gender === "Male" ? maleAvatars[id % maleAvatars.length] : femaleAvatars[id % femaleAvatars.length],
  };
}

export const customers: CustomerProfile[] = Array.from({ length: 15 }, (_, i) => {
  const gender = i < 8 ? "Male" : "Female";
  return toCustomer(generateProfile(gender, i, true), i + 1);
});

export const malePool: PoolProfile[] = Array.from({ length: 60 }, (_, i) =>
  toPool(generateProfile("Male", i, false), i + 1)
);

export const femalePool: PoolProfile[] = Array.from({ length: 60 }, (_, i) =>
  toPool(generateProfile("Female", i, false), i + 1)
);
