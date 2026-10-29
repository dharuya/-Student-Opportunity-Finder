/**
 * Seed script for OpportunityHub.
 * Run with: bun prisma/seed.ts
 * Creates demo accounts and a realistic starter catalogue of opportunities.
 * NOTE: listings are SAMPLE data for the prototype. Deadlines are relative to Oct 2026.
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const db = new PrismaClient();

type SeedListing = {
  title: string;
  category: string;
  provider: string;
  sourceType: string;
  description: string;
  eligibility: string;
  benefits: string;
  requiredDocuments: string;
  location: string;
  costType: string;
  minEducation: string;
  fields: string;
  skillsRequired: string;
  deadline: string | null;
  officialUrl: string;
  verificationStatus: string;
  lastVerifiedAt: string;
};

const D = (docs: string) => docs.join("\n");

const listings: SeedListing[] = [
  // ---------------- SCHOLARSHIPS ----------------
  {
    title: "National Means-cum-Merit Scholarship Scheme",
    category: "SCHOLARSHIP", provider: "Ministry of Education, Government of India", sourceType: "GOVERNMENT",
    description: "Central sector scholarship for meritorious students of Class 9 to 12 from families with annual income below ₹3.5 lakh. Awards ₹12,000 per annum for Class 9-10 and ₹18,000 per annum for Class 11-12 to reduce dropout after Class 8. Applications are submitted through the National Scholarship Portal.",
    eligibility: "Students of Class 9-12 in government, local body or government-aided schools; at least 55% marks in the previous exam (50% for SC/ST); family income below ₹3.5 lakh per year.",
    benefits: "₹12,000 per year (Class 9-10) / ₹18,000 per year (Class 11-12), paid directly to the student's bank account.",
    requiredDocuments: D(["Income certificate", "Previous exam mark sheet", "Aadhaar card", "Bank passbook copy", "Bonafide / school certificate"]),
    location: "All India", costType: "NOT_APPLICABLE", minEducation: "CLASS_9_10",
    fields: "Any Field", skillsRequired: "None (Beginner Friendly)",
    deadline: "2026-11-30T23:59:00+05:30", officialUrl: "https://scholarships.gov.in",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-21T10:00:00+05:30",
  },
  {
    title: "INSPIRE Scholarship – SHE (Scholarship for Higher Education)",
    category: "SCHOLARSHIP", provider: "Department of Science & Technology", sourceType: "GOVERNMENT",
    description: "The flagship scholarship of DST to attract talented students to basic sciences. Offers ₹80,000 per year plus mentorship support for BSc and BS courses in natural and basic sciences. Selection is based on board exam performance within the top 1% cut-off of each board.",
    eligibility: "Students aged 17-22 enrolled in BSc/BS in natural or basic sciences; top 1% in Class 12 board exams or clearances of JEE/NEET (top 10,000 ranks); must study one of the recognised science subjects.",
    benefits: "₹80,000 per year for up to 5 years, summer research internship support in recognised research labs.",
    requiredDocuments: D(["Class 10 & 12 mark sheets", "Proof of admission to BSc/BS course", "Endorsement form from institute", "Bank details", "Caste certificate (if applicable)"]),
    location: "All India", costType: "NOT_APPLICABLE", minEducation: "UNDERGRADUATE",
    fields: "Science, Research", skillsRequired: "Mathematics, Research",
    deadline: "2026-12-15T23:59:00+05:30", officialUrl: "https://online-inspire.gov.in",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-19T10:00:00+05:30",
  },
  {
    title: "Central Sector Scheme of Scholarships for College Students (CSSS)",
    category: "SCHOLARSHIP", provider: "Ministry of Education, Government of India", sourceType: "GOVERNMENT",
    description: "Merit-based scholarship for students above the 80th percentile in Class 12 who pursue full-time undergraduate or postgraduate courses in recognised institutions. Family income ceiling is ₹4.5 lakh per annum. Renewal depends on maintaining 60% marks and required attendance.",
    eligibility: "Class 12 pass in the current or previous year with above-80th-percentile score; enrolled in a regular UG/PG degree; family income up to ₹4.5 lakh; not receiving any other central scholarship.",
    benefits: "₹12,500 per year (UG first three years), ₹20,000 per year (PG / UG 4th-5th year).",
    requiredDocuments: D(["Class 12 mark sheet", "Income certificate", "Institute bonafide certificate", "Aadhaar card", "Bank account details"]),
    location: "All India", costType: "NOT_APPLICABLE", minEducation: "UNDERGRADUATE",
    fields: "Any Field", skillsRequired: "None (Beginner Friendly)",
    deadline: "2026-11-10T23:59:00+05:30", officialUrl: "https://scholarships.gov.in",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-22T09:30:00+05:30",
  },
  {
    title: "AICTE Pragati Scholarship for Girl Students",
    category: "SCHOLARSHIP", provider: "All India Council for Technical Education", sourceType: "GOVERNMENT",
    description: "Scholarship of ₹50,000 per year for girl students admitted to the first year of a diploma or degree programme in AICTE-approved technical institutions. Two girls per family are eligible. Aimed at supporting technical education for young women across India.",
    eligibility: "Girl students admitted to 1st year of diploma/degree in AICTE-approved institution; maximum two sisters per family; annual family income up to ₹8 lakh.",
    benefits: "₹50,000 per year covering tuition, books, equipment and other academic expenses.",
    requiredDocuments: D(["Admission proof", "Income certificate", "Class 12 / 10 mark sheet", "Aadhaar card", "Bank passbook"]),
    location: "All India", costType: "NOT_APPLICABLE", minEducation: "UNDERGRADUATE",
    fields: "Engineering, Technology", skillsRequired: "None (Beginner Friendly)",
    deadline: "2026-11-20T23:59:00+05:30", officialUrl: "https://www.aicte-india.org/schemes/students-development-schemes",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-20T14:00:00+05:30",
  },
  {
    title: "Prime Minister's Research Fellowship (PMRF)",
    category: "SCHOLARSHIP", provider: "Ministry of Education, Government of India", sourceType: "GOVERNMENT",
    description: "Direct PhD fellowship for the brightest students to pursue doctoral research in IITs, IISc, IISERs and NITs in technology-focused domains. Fellows receive one of the highest research stipends in the country along with a travel grant for international conferences.",
    eligibility: "Graduates or postgraduates from recognised institutions with strong academic records (CGPA cut-offs apply, e.g. 8.0+ in degree); admission through the PMRF selection process at participating institutions.",
    benefits: "₹70,000-₹80,000 per month for up to 5 years, ₹2 lakh annual research grant, international conference travel support.",
    requiredDocuments: D(["Academic transcripts", "Research proposal", "Two recommendation letters", "Degree certificates", "GATE score (if applicable)"]),
    location: "All India", costType: "NOT_APPLICABLE", minEducation: "POSTGRADUATE",
    fields: "Engineering, Science, Research, Technology", skillsRequired: "Research, Mathematics",
    deadline: "2027-01-31T23:59:00+05:30", officialUrl: "https://pmrf.in",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-18T11:00:00+05:30",
  },
  {
    title: "Sitaram Jindal Foundation Scholarship",
    category: "SCHOLARSHIP", provider: "Sitaram Jindal Foundation", sourceType: "PROVIDER",
    description: "Private philanthropic scholarship for students from Class 11 up to postgraduate level across general, technical and professional courses. Awards vary by course level, with separate quotas for girls, differently-abled students and candidates from North-East states.",
    eligibility: "Students from Class 11 to PG level with at least 50-60% in the previous exam; specific income and course-wise criteria listed in the foundation's scheme table.",
    benefits: "₹750 to ₹3,000 per month depending on the course and level of study.",
    requiredDocuments: D(["Filled application form", "Mark sheets", "Income certificate", "Passport photo", "Institute recommendation"]),
    location: "All India", costType: "NOT_APPLICABLE", minEducation: "CLASS_11_12",
    fields: "Any Field", skillsRequired: "None (Beginner Friendly)",
    deadline: "2026-12-05T23:59:00+05:30", officialUrl: "https://www.sitaramjindalfoundation.org",
    verificationStatus: "UNVERIFIED", lastVerifiedAt: "2026-09-08T10:00:00+05:30",
  },
  {
    title: "Reliance Foundation Undergraduate Scholarships",
    category: "SCHOLARSHIP", provider: "Reliance Foundation", sourceType: "PROVIDER",
    description: "Merit-cum-means scholarship supporting up to 5,000 undergraduates every year with up to ₹2 lakh over the course of the degree. Open to first-year UG students from any stream, with a focus on household income up to ₹15 lakh and aptitude assessed through an online test.",
    eligibility: "First-year undergraduate students in India with 60%+ in Class 12; household income up to ₹15 lakh; Indian citizens only.",
    benefits: "Up to ₹2 lakh total grant across the degree, plus mentoring and skilling workshops.",
    requiredDocuments: D(["Class 12 mark sheet", "Aadhaar card", "Income proof", "Photo", "College admission proof"]),
    location: "All India", costType: "NOT_APPLICABLE", minEducation: "UNDERGRADUATE",
    fields: "Any Field", skillsRequired: "None (Beginner Friendly)",
    deadline: "2026-11-25T23:59:00+05:30", officialUrl: "https://www.reliancefoundation.org/education/scholarship",
    verificationStatus: "UNVERIFIED", lastVerifiedAt: "2026-09-20T10:00:00+05:30",
  },
  {
    title: "ONGC Foundation Scholarship for SC/ST Students",
    category: "SCHOLARSHIP", provider: "ONGC Foundation", sourceType: "PROVIDER",
    description: "Scholarship programme for SC/ST students pursuing first-year professional courses in engineering, medicine, MBBS and MBA at recognised institutions. The previous cycle closed earlier this month and is listed here so students can watch for the next cycle.",
    eligibility: "SC/ST students in the first year of engineering, medical or MBA programmes with 60%+ in the qualifying exam; family income up to ₹4.5 lakh.",
    benefits: "₹48,000 per year for the duration of the professional course.",
    requiredDocuments: D(["Caste certificate", "Income certificate", "Admission proof", "Mark sheets", "Bank details"]),
    location: "All India", costType: "NOT_APPLICABLE", minEducation: "UNDERGRADUATE",
    fields: "Engineering, Medicine, Management", skillsRequired: "None (Beginner Friendly)",
    deadline: "2026-10-12T23:59:00+05:30", officialUrl: "https://ongcscholar.org",
    verificationStatus: "EXPIRED", lastVerifiedAt: "2026-10-10T09:00:00+05:30",
  },

  // ---------------- INTERNSHIPS ----------------
  {
    title: "NITI Aayog Internship Programme",
    category: "INTERNSHIP", provider: "NITI Aayog, Government of India", sourceType: "GOVERNMENT",
    description: "Prestigious short-term internship with India's apex policy think tank. Interns work with NITI Aayog divisions on policy research, data analysis and report writing. Applications open on the 1st-10th of every month for internships starting the following month.",
    eligibility: "Bonafide students of UG/PG/research programmes who have secured 85%+ in Class 12 (UG) or 60%+ in graduation (PG); gap between application and start of internship must not exceed 6 months of course completion.",
    benefits: "Hands-on policy research experience, certificate of completion from NITI Aayog. Unpaid internship.",
    requiredDocuments: D(["No-objection certificate from college", "Mark sheets", "Letter of recommendation from faculty", "CV / resume"]),
    location: "Delhi", costType: "NOT_APPLICABLE", minEducation: "UNDERGRADUATE",
    fields: "Economics, Public Policy, Computer Science, Law, Management", skillsRequired: "Research, Data Analysis, Communication",
    deadline: "2026-11-15T23:59:00+05:30", officialUrl: "https://www.niti.gov.in/internship",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-18T12:00:00+05:30",
  },
  {
    title: "Digital India Internship Scheme (MeitY)",
    category: "INTERNSHIP", provider: "Ministry of Electronics & IT", sourceType: "GOVERNMENT",
    description: "Government internship for students from premier institutions to work on live digital-governance and technology projects at MeitY and its attached offices. Selected interns receive a monthly stipend and a certificate jointly issued by MeitY and NASSCOM.",
    eligibility: "Indian citizens enrolled in B.Tech/BE/M.Tech/ME/MSc/MCA/LLB or MBA from institutions listed in the scheme (NIRF top-ranked, IIITs, NITs, IITs); relevant academic year criteria apply.",
    benefits: "₹10,000 monthly stipend, 2-3 month project experience, joint MeitY-NASSCOM certificate.",
    requiredDocuments: D(["College NOC", "Resume", "Statement of purpose", "Mark sheets", "ID proof"]),
    location: "Delhi", costType: "STIPENDED", minEducation: "UNDERGRADUATE",
    fields: "Computer Science, Engineering, Law, Management", skillsRequired: "Programming, Web Development, Data Analysis, Communication",
    deadline: "2026-11-25T23:59:00+05:30", officialUrl: "https://www.meity.gov.in/digital-india-internship-scheme",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-21T16:00:00+05:30",
  },
  {
    title: "Google Summer of Code 2027",
    category: "INTERNSHIP", provider: "Google Open Source", sourceType: "PROVIDER",
    description: "Global, fully-remote paid open-source internship where contributors work with mentoring organisations like Linux Foundation, Mozilla and Blender on real software projects. Contributors submit project proposals during the application window; coding runs over 12 weeks.",
    eligibility: "Anyone aged 18+ who is a new or returning contributor to open source (students and beginners welcome); must be eligible to work in their country of residence during the programme.",
    benefits: "Stipend of USD 750-6,600 depending on project size and country, mentorship from senior open-source developers, global community exposure.",
    requiredDocuments: D(["GitHub profile with contributions", "Project proposal", "Proof of identity/eligibility"]),
    location: "Remote", costType: "STIPENDED", minEducation: "UNDERGRADUATE",
    fields: "Computer Science, Engineering", skillsRequired: "Programming, Web Development, Git, AI/ML",
    deadline: "2027-03-31T23:59:00+05:30", officialUrl: "https://summerofcode.withgoogle.com",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-17T10:00:00+05:30",
  },
  {
    title: "IISc Summer Research Fellowship Programme",
    category: "INTERNSHIP", provider: "Indian Institute of Science, Bengaluru", sourceType: "UNIVERSITY",
    description: "Eight-week residential summer fellowship allowing students to work on cutting-edge research projects under IISc faculty in science and engineering departments. Highly competitive; strong academic records and a clear research interest are essential.",
    eligibility: "Students in the 2nd year of UG or 1st year of PG (or equivalent) in science/engineering with first-class academic record; selection by faculty review of application and CV.",
    benefits: "Free boarding and lodging on campus, travel allowance, research mentorship from IISc faculty. Unpaid stipend-wise.",
    requiredDocuments: D(["CV", "Statement of purpose", "Two faculty recommendation letters", "Mark sheets", "Project preferences"]),
    location: "Bengaluru", costType: "NOT_APPLICABLE", minEducation: "UNDERGRADUATE",
    fields: "Science, Engineering, Research", skillsRequired: "Research, Mathematics, Data Analysis",
    deadline: "2027-01-31T23:59:00+05:30", officialUrl: "https://www.iisc.ac.in",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-15T10:00:00+05:30",
  },
  {
    title: "UNICEF India Volunteer & Internship Opportunities",
    category: "INTERNSHIP", provider: "UNICEF India", sourceType: "PROVIDER",
    description: "Internships with UNICEF India country offices in programme areas such as education, health, WASH and child protection. Interns support research, field coordination, content development and data work for child-rights programmes.",
    eligibility: "Enrolled UG (final year), PG or recent graduates (within 2 years) in relevant fields; strong written English; commitment of at least 6-12 weeks.",
    benefits: "United Nations system exposure, mentorship, completion certificate. Generally unpaid; some placements may cover local travel.",
    requiredDocuments: D(["CV", "Cover letter", "Enrolment or degree proof", "Reference contact"]),
    location: "Multiple Cities", costType: "NOT_APPLICABLE", minEducation: "UNDERGRADUATE",
    fields: "Social Work, Public Health, Management, Arts & Humanities", skillsRequired: "Communication, Research, Data Analysis",
    deadline: "2026-12-20T23:59:00+05:30", officialUrl: "https://www.unicef.org/india/what-we-do/internships-and-volunteering",
    verificationStatus: "UNVERIFIED", lastVerifiedAt: "2026-09-25T10:00:00+05:30",
  },
  {
    title: "AICTE Virtual Internship in Emerging Technologies (AI/ML)",
    category: "INTERNSHIP", provider: "AICTE + Partner Industry Bodies", sourceType: "GOVERNMENT",
    description: "Self-paced virtual internship on AI, machine learning and emerging technologies delivered with industry partners. Includes guided modules, a capstone mini-project and an auto-issued certificate on completion. Fully remote and free of cost.",
    eligibility: "Open to diploma, UG and PG students from any AICTE-recognised institution; basic programming knowledge helpful but not mandatory.",
    benefits: "Industry-recognised certificate, capstone project portfolio, 4-8 weeks structured learning. Unpaid.",
    requiredDocuments: D(["Student ID / enrolment number", "AICTE internship portal registration"]),
    location: "Remote", costType: "FREE", minEducation: "CLASS_11_12",
    fields: "Computer Science, Engineering, Technology", skillsRequired: "AI/ML, Programming, None (Beginner Friendly)",
    deadline: "2026-11-08T23:59:00+05:30", officialUrl: "https://internship.aicte-india.org",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-23T09:00:00+05:30",
  },
  {
    title: "RBI Research Internship Scheme",
    category: "INTERNSHIP", provider: "Reserve Bank of India", sourceType: "GOVERNMENT",
    description: "Research internship with the Reserve Bank of India for postgraduate and research students in economics, finance, banking and statistics. Interns work with RBI departments on policy-relevant research and data analysis under senior economists.",
    eligibility: "PG students or research scholars in economics, finance, banking, statistics or related fields from UGC-recognised institutions; strong quantitative background expected.",
    benefits: "₹20,000 per month stipend for up to 6 months, access to RBI research infrastructure, certificate from RBI.",
    requiredDocuments: D(["CV", "Research proposal outline", "PG mark sheets", "Faculty recommendation", "Institute NOC"]),
    location: "Mumbai", costType: "STIPENDED", minEducation: "POSTGRADUATE",
    fields: "Commerce & Finance, Economics, Data Science", skillsRequired: "Research, Data Analysis, Finance, Mathematics",
    deadline: "2026-12-10T23:59:00+05:30", officialUrl: "https://www.rbi.org.in",
    verificationStatus: "UNVERIFIED", lastVerifiedAt: "2026-09-12T10:00:00+05:30",
  },

  // ---------------- FREE COURSES ----------------
  {
    title: "NPTEL: Programming in Java (SWAYAM)",
    category: "FREE_COURSE", provider: "IIT Kharagpur via NPTEL", sourceType: "UNIVERSITY",
    description: "Flagship 12-week IIT course teaching object-oriented programming in Java from basics to collections, generics and multithreading. Weekly assignments and a final certification exam; certificate carries IIT/NPTEL branding valued by recruiters.",
    eligibility: "Open to everyone; best suited for 1st-3rd year undergraduates with basic programming exposure.",
    benefits: "Free access to all lectures and assignments; optional proctored exam (approx. ₹1,000) for an e-verifiable certificate.",
    requiredDocuments: D(["SWAYAM/NPTEL account", "Aadhaar-linked photo ID for exam (optional, only for certificate)"]),
    location: "Remote", costType: "FREE", minEducation: "CLASS_11_12",
    fields: "Computer Science, Engineering", skillsRequired: "Programming, None (Beginner Friendly)",
    deadline: "2027-01-26T23:59:00+05:30", officialUrl: "https://nptel.ac.in/courses/106105267",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-22T11:30:00+05:30",
  },
  {
    title: "Google Digital Marketing Fundamentals",
    category: "FREE_COURSE", provider: "Google Skillshop", sourceType: "PROVIDER",
    description: "Accredited 26-module interactive course covering digital marketing strategy, SEO, SEM, social media, analytics and e-commerce. Includes unlimited attempts on the final assessment with a shareable certificate accepted by employers.",
    eligibility: "Open to all learners; no prerequisites.",
    benefits: "Free certificate of completion from Google, practical tool walkthroughs (Google Ads, Analytics, Search Console).",
    requiredDocuments: D(["Google account"]),
    location: "Remote", costType: "FREE", minEducation: "ANY",
    fields: "Management, Marketing, Any Field", skillsRequired: "Digital Marketing, Communication, None (Beginner Friendly)",
    deadline: null, officialUrl: "https://learndigital.withgoogle.com/digitalgarage/course/digital-marketing",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-24T10:00:00+05:30",
  },
  {
    title: "Microsoft AI Skills Navigator – AI Fundamentals Track",
    category: "FREE_COURSE", provider: "Microsoft", sourceType: "PROVIDER",
    description: "Curated learning path on AI concepts, responsible AI, machine learning basics and Azure AI services. Combines short videos, hands-on labs and knowledge checks; maps to the AI-900 fundamentals certification for those who want to go further.",
    eligibility: "Open to students and professionals; beginner friendly.",
    benefits: "Free learning path with badges, discount vouchers occasionally offered for the AI-900 certification exam.",
    requiredDocuments: D(["Microsoft / LinkedIn account"]),
    location: "Remote", costType: "FREE", minEducation: "ANY",
    fields: "Computer Science, Technology, Any Field", skillsRequired: "AI/ML, Cloud, None (Beginner Friendly)",
    deadline: null, officialUrl: "https://aiskillsnavigator.microsoft.com",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-24T12:00:00+05:30",
  },
  {
    title: "AWS Educate – Cloud Computing Foundations",
    category: "FREE_COURSE", provider: "Amazon Web Services", sourceType: "PROVIDER",
    description: "Self-paced cloud fundamentals programme with hands-on AWS console labs, covering compute, storage, networking, security and cloud careers. Learners receive a badge per completed course and can explore 100+ hours of free labs without a credit card.",
    eligibility: "Students aged 13+ and educators; no prior cloud knowledge required.",
    benefits: "Free AWS hands-on labs, digital badges, career pathway guidance in cloud roles.",
    requiredDocuments: D(["Email sign-up (AWS Educate account)"]),
    location: "Remote", costType: "FREE", minEducation: "ANY",
    fields: "Computer Science, Engineering, Technology", skillsRequired: "Cloud, Programming, None (Beginner Friendly)",
    deadline: null, officialUrl: "https://aws.amazon.com/education/awseducate",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-24T15:00:00+05:30",
  },
  {
    title: "Google IT Support Professional Certificate (Coursera – Audit)",
    category: "FREE_COURSE", provider: "Google via Coursera", sourceType: "PROVIDER",
    description: "Job-ready IT support curriculum: troubleshooting, networking, operating systems, system administration and security. Can be audited free of charge (course content only); the full certificate with graded assessments requires payment or financial aid approval.",
    eligibility: "Open to all learners; financial aid available on application for the certified track.",
    benefits: "Industry-recognised credential (paid track), free full audit access to all video content and readings.",
    requiredDocuments: D(["Coursera account", "Financial aid application (optional, for certificate)"]),
    location: "Remote", costType: "FREE", minEducation: "ANY",
    fields: "Computer Science, Information Technology, Any Field", skillsRequired: "Cybersecurity, Programming, None (Beginner Friendly)",
    deadline: null, officialUrl: "https://www.coursera.org/professional-certificates/google-it-support",
    verificationStatus: "UNVERIFIED", lastVerifiedAt: "2026-08-30T10:00:00+05:30",
  },
  {
    title: "SWAYAM: Data Structures and Algorithms",
    category: "FREE_COURSE", provider: "IIT Delhi via SWAYAM", sourceType: "UNIVERSITY",
    description: "Semester-aligned course on arrays, linked lists, trees, graphs, hashing and algorithm design with weekly graded assignments. Widely recommended for placement preparation and higher-studies entrance fundamentals.",
    eligibility: "Open to all; designed for 2nd-3rd year UG students in CS/IT and related branches.",
    benefits: "Free course access; optional certification exam (nominal fee) recognised for credit transfer in many universities.",
    requiredDocuments: D(["SWAYAM account", "Photo ID for exam (optional)"]),
    location: "Remote", costType: "FREE", minEducation: "CLASS_11_12",
    fields: "Computer Science, Engineering", skillsRequired: "Programming, Mathematics, Data Analysis",
    deadline: "2027-01-20T23:59:00+05:30", officialUrl: "https://swayam.gov.in",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-20T10:00:00+05:30",
  },
  {
    title: "IBM SkillsBuild – Data Fundamentals",
    category: "FREE_COURSE", provider: "IBM SkillsBuild", sourceType: "PROVIDER",
    description: "Free digital platform with structured tracks in data science, AI, cybersecurity and professional skills. The Data Fundamentals track introduces data analysis, visualisation and introductory statistics with IBM digital badges on completion.",
    eligibility: "Open to students, job seekers and educators; registration required.",
    benefits: "IBM-issued digital badges, project-based learning, career coaching resources.",
    requiredDocuments: D(["Email registration on IBM SkillsBuild"]),
    location: "Remote", costType: "FREE", minEducation: "ANY",
    fields: "Computer Science, Data Science, Any Field", skillsRequired: "Data Analysis, AI/ML, None (Beginner Friendly)",
    deadline: null, officialUrl: "https://skillsbuild.org",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-23T14:00:00+05:30",
  },

  // ---------------- SKILL PROGRAMS ----------------
  {
    title: "PMKVY 4.0 – Short-Term Skill Training",
    category: "SKILL_PROGRAM", provider: "Ministry of Skill Development & Entrepreneurship", sourceType: "GOVERNMENT",
    description: "Flagship skilling scheme offering free short-duration industry-aligned training in sectors like retail, healthcare, logistics, electronics and IT-ITES. Training is delivered through empanelled Skill India centres with placement linkage and certification by NSDC.",
    eligibility: "Indian citizens aged 15-45; school dropouts and unemployed youth prioritised; sector-specific minimum education criteria vary by job role.",
    benefits: "Free training, NSQF-aligned government certification, assessment and placement support.",
    requiredDocuments: D(["Aadhaar card", "Education proof", "Bank account details", "Passport photo"]),
    location: "All India", costType: "FREE", minEducation: "ANY",
    fields: "Any Field", skillsRequired: "None (Beginner Friendly), Communication",
    deadline: "2026-12-31T23:59:00+05:30", officialUrl: "https://www.pmkvyofficial.org",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-19T15:00:00+05:30",
  },
  {
    title: "FutureSkills Prime – NASSCOM Digital Skilling",
    category: "SKILL_PROGRAM", provider: "NASSCOM + MeitY", sourceType: "PROVIDER",
    description: "Government-subsidised digital skilling platform offering courses in AI, blockchain, cloud, cybersecurity, data engineering and web development, curated with industry. Learners get deep discounts (up to 70-100% for eligible students) on certified courses.",
    eligibility: "Students and professionals; fee waivers/subsidies for eligible learners under the SSCT programme.",
    benefits: "NASSCOM-certified course completion, industry-recognised skill badges, subsidised course fees.",
    requiredDocuments: D(["Registration on FutureSkills Prime", "Student ID for subsidy eligibility"]),
    location: "Remote", costType: "FREE", minEducation: "CLASS_11_12",
    fields: "Computer Science, Engineering, Technology", skillsRequired: "AI/ML, Cybersecurity, Cloud, Web Development, Data Analysis",
    deadline: "2027-01-15T23:59:00+05:30", officialUrl: "https://futureskillsprime.in",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-18T09:00:00+05:30",
  },
  {
    title: "Skill India Digital Hub – Data Analytics Career Track",
    category: "SKILL_PROGRAM", provider: "National Skill Development Corporation", sourceType: "GOVERNMENT",
    description: "Government-backed free learning track on the Skill India Digital Hub covering spreadsheets, SQL, Python basics, dashboards and business analytics. Includes skill assessments and links learners to apprenticeship and job openings on the portal.",
    eligibility: "Open to all Indian users aged 14+; beginner friendly.",
    benefits: "Free courses with government-recognised certificates, apprenticeship linkage, job-matching on the platform.",
    requiredDocuments: D(["Aadhaar-linked mobile number", "Skill India Digital registration"]),
    location: "Remote", costType: "FREE", minEducation: "ANY",
    fields: "Commerce & Finance, Computer Science, Any Field", skillsRequired: "Data Analysis, Programming, None (Beginner Friendly)",
    deadline: null, officialUrl: "https://www.skillindiadigital.gov.in",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-22T13:00:00+05:30",
  },
  {
    title: "TCS iON Career Edge – Young Professional",
    category: "SKILL_PROGRAM", provider: "TCS iON", sourceType: "PROVIDER",
    description: "Free 15-day employability programme covering soft skills, business communication, resume writing, Excel, accounting basics and IT fundamentals. Frequently used by freshers to strengthen placement-readiness; includes an end-of-course certificate.",
    eligibility: "Final-year students and fresh graduates; open to all disciplines.",
    benefits: "Free certificate from TCS iON, structured 15-day plan, interview and workplace readiness training.",
    requiredDocuments: D(["TCS iON account registration"]),
    location: "Remote", costType: "FREE", minEducation: "UNDERGRADUATE",
    fields: "Any Field", skillsRequired: "Communication, None (Beginner Friendly)",
    deadline: null, officialUrl: "https://learning.tcsionhub.in/courses/career-edge-young-professional",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-21T17:00:00+05:30",
  },

  // ---------------- GOVERNMENT EXAMS ----------------
  {
    title: "SSC CHSL 2026 Examination – Application Window",
    category: "GOVT_EXAM", provider: "Staff Selection Commission", sourceType: "GOVERNMENT",
    description: "Combined Higher Secondary Level examination for recruitment to LDC, JSA, DEO and postal assistant posts in central government ministries. Computer-based Tier-1 exam followed by typing/skill test; notification and application are handled online on the SSC portal.",
    eligibility: "Class 12 (10+2) pass from a recognised board; age 18-27 with standard category-wise relaxations; Indian citizen.",
    benefits: "Central government posts with pay matrix Level 2-4 (approx. ₹19,900-₹81,100), job security and career progression.",
    requiredDocuments: D(["Aadhaar card", "Class 12 certificate", "Passport photo", "Signature scan", "Category certificate (if applicable)"]),
    location: "All India", costType: "NOT_APPLICABLE", minEducation: "CLASS_11_12",
    fields: "Any Field", skillsRequired: "None (Beginner Friendly)",
    deadline: "2026-11-12T23:59:00+05:30", officialUrl: "https://ssc.gov.in",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-25T10:00:00+05:30",
  },
  {
    title: "UPSC Civil Services (Preliminary) Examination 2027",
    category: "GOVT_EXAM", provider: "Union Public Service Commission", sourceType: "GOVERNMENT",
    description: "Entry examination for the Indian Administrative Service (IAS), Indian Police Service (IPS), Indian Foreign Service (IFS) and 20+ other Group A and B central services. Three-stage process: Prelims (objective), Mains (written) and Personality Test (interview).",
    eligibility: "Bachelor's degree from any recognised university; final-year students may apply; age 21-32 with relaxations; number of attempts limited per category.",
    benefits: "India's most prestigious civil service careers (IAS/IPS/IFS), pay matrix Level 10+, policy implementation roles.",
    requiredDocuments: D(["Aadhaar / photo ID", "Degree certificate or final-year proof", "Passport photo", "Signature scan", "Category / PwBD certificates (if applicable)"]),
    location: "All India", costType: "NOT_APPLICABLE", minEducation: "UNDERGRADUATE",
    fields: "Any Field", skillsRequired: "Communication, Research, None (Beginner Friendly)",
    deadline: "2027-02-24T23:59:00+05:30", officialUrl: "https://upsc.gov.in",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-26T09:30:00+05:30",
  },
  {
    title: "IBPS Clerk (CRP CSA-XVI) 2026",
    category: "GOVT_EXAM", provider: "Institute of Banking Personnel Selection", sourceType: "GOVERNMENT",
    description: "Common recruitment process for clerical cadre posts in 11 participating public sector banks. Two-tier computer-based exam (Prelims + Mains) followed by provisional allotment; state-wise vacancies are published with the notification.",
    eligibility: "Bachelor's degree in any discipline; age 20-28 with relaxations; computer literacy and proficiency in the official language of the applied state required.",
    benefits: "Clerical cadre bank jobs with pay scale approx. ₹19,900-₹47,920 plus allowances.",
    requiredDocuments: D(["Degree certificate / final-year proof", "Photo & signature scan", "Category certificate", "State language proof"]),
    location: "All India", costType: "NOT_APPLICABLE", minEducation: "UNDERGRADUATE",
    fields: "Commerce & Finance, Any Field", skillsRequired: "None (Beginner Friendly)",
    deadline: "2026-11-02T23:59:00+05:30", officialUrl: "https://www.ibps.in",
    verificationStatus: "UNVERIFIED", lastVerifiedAt: "2026-09-28T10:00:00+05:30",
  },
  {
    title: "NEET UG 2027 – National Eligibility cum Entrance Test",
    category: "GOVT_EXAM", provider: "National Testing Agency", sourceType: "GOVERNMENT",
    description: "Single national entrance examination for admission to MBBS, BDS, AYUSH and nursing courses across government and private medical colleges in India. Registration typically opens in the first quarter of the year for the May exam.",
    eligibility: "Class 12 pass/appearing with Physics, Chemistry, Biology/Biotechnology and English; minimum 50% aggregate in PCB (40% for reserved categories); age 17+ on 31st December of admission year.",
    benefits: "Gateway to ~1 lakh medical seats across India including AIIMS and JIPMER programmes.",
    requiredDocuments: D(["Class 10 & 12 certificates", "Passport photo", "Aadhaar card", "Category certificate (if applicable)"]),
    location: "All India", costType: "NOT_APPLICABLE", minEducation: "CLASS_11_12",
    fields: "Medicine, Science", skillsRequired: "None (Beginner Friendly)",
    deadline: "2027-02-10T23:59:00+05:30", officialUrl: "https://neet.nta.nic.in",
    verificationStatus: "VERIFIED", lastVerifiedAt: "2026-10-25T12:00:00+05:30",
  },
  {
    title: "GATE 2027 – Graduate Aptitude Test in Engineering",
    category: "GOVT_EXAM", provider: "IISc & IITs (Organising Institute)", sourceType: "GOVERNMENT",
    description: "National-level examination for admission to M.Tech/MS/PhD programmes at IITs, IISc and NITs, and recruitment by PSUs like IOCL, BHEL and GAIL. The application window for the 2027 cycle has just closed; the exam is scheduled for February 2027.",
    eligibility: "Bachelor's degree holders in engineering/technology/architecture or master's in relevant science streams; students in the 3rd year or higher of UG are also eligible.",
    benefits: "M.Tech/PhD admissions with monthly stipend, PSU recruitment pipeline, fellowships in top institutes.",
    requiredDocuments: D(["Photo & signature scan", "Degree/enrolment certificate", "Category certificate (if applicable)"]),
    location: "All India", costType: "NOT_APPLICABLE", minEducation: "UNDERGRADUATE",
    fields: "Engineering, Science, Technology", skillsRequired: "Mathematics, Research",
    deadline: "2026-10-14T23:59:00+05:30", officialUrl: "https://gate.iitk.ac.in",
    verificationStatus: "EXPIRED", lastVerifiedAt: "2026-10-13T10:00:00+05:30",
  },
  {
    title: "CAT 2026 – Common Admission Test",
    category: "GOVT_EXAM", provider: "Indian Institutes of Management", sourceType: "UNIVERSITY",
    description: "National MBA entrance test conducted by the IIMs for admission to MBA/PGP programmes at IIMs and 1,200+ B-schools. The 2026 registration window has closed; the exam is being held in November 2026. Watch for the next cycle if you missed it.",
    eligibility: "Bachelor's degree with at least 50% marks (45% for reserved categories); final-year students may apply.",
    benefits: "Admission to IIMs and leading B-schools, strong placement outcomes in management careers.",
    requiredDocuments: D(["Degree certificate or final-year proof", "Photo & signature scan", "Category certificate (if applicable)"]),
    location: "All India", costType: "NOT_APPLICABLE", minEducation: "UNDERGRADUATE",
    fields: "Management, Commerce & Finance, Any Field", skillsRequired: "Mathematics, Communication",
    deadline: "2026-09-30T23:59:00+05:30", officialUrl: "https://iimcat.ac.in",
    verificationStatus: "EXPIRED", lastVerifiedAt: "2026-09-29T10:00:00+05:30",
  },
];

async function main() {
  console.log("Seeding OpportunityHub database...");

  // --- Accounts ---
  const adminEmail = "admin@opportunityhub.in";
  const studentEmail = "student@demo.in";
  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Platform Admin",
      passwordHash: hashPassword("Admin@1234"),
      role: "ADMIN",
    },
  });
  const student = await db.user.upsert({
    where: { email: studentEmail },
    update: {},
    create: {
      email: studentEmail,
      name: "Ananya Sharma",
      passwordHash: hashPassword("Student@1234"),
      role: "STUDENT",
    },
  });
  await db.studentProfile.upsert({
    where: { userId: student.id },
    update: {
      educationLevel: "UNDERGRADUATE",
      fieldOfStudy: "Computer Science",
      location: "Delhi",
      skills: "Programming, Web Development",
      interests: "AI/ML, Government exams, Free courses",
      careerGoal: "Become a software engineer in a public sector or product company",
    },
    create: {
      userId: student.id,
      educationLevel: "UNDERGRADUATE",
      fieldOfStudy: "Computer Science",
      location: "Delhi",
      skills: "Programming, Web Development",
      interests: "AI/ML, Government exams, Free courses",
      careerGoal: "Become a software engineer in a public sector or product company",
    },
  });
  console.log(`Accounts ready: admin=${admin.email} student=${student.email}`);

  // --- Listings ---
  const existing = await db.opportunity.count();
  if (existing > 0) {
    console.log(`Opportunities already present (${existing}). Re-seeding catalogue...`);
    await db.savedOpportunity.deleteMany();
    await db.opportunity.deleteMany();
  }

  for (const l of listings) {
    await db.opportunity.create({
      data: {
        ...l,
        deadline: l.deadline ? new Date(l.deadline) : null,
        lastVerifiedAt: new Date(l.lastVerifiedAt),
      },
    });
  }
  console.log(`Seeded ${listings.length} opportunities.`);

  // Demo saved items for the demo student
  const savedTitles = ["Google Digital Marketing Fundamentals", "SSC CHSL 2026 Examination – Application Window"];
  for (const t of savedTitles) {
    const opp = await db.opportunity.findFirst({ where: { title: t } });
    if (opp) {
      await db.savedOpportunity.upsert({
        where: { userId_opportunityId: { userId: student.id, opportunityId: opp.id } },
        update: {},
        create: { userId: student.id, opportunityId: opp.id },
      });
    }
  }
  console.log("Demo saved items created.");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
