export interface SectionsAnalysis {
  contactInfo: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
}

export interface CVEvaluationResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  grammarAndStyle: string;
  sectionsAnalysis: SectionsAnalysis;
  atsRecommendations: string[];
}

export interface CVTailorResult {
  tailoredCvData: {
    fullName: string;
    professionalTitle: string;
    email: string;
    phone: string;
    location: string;
    links: string[];
    summary: string;
    workExperience: {
      role: string;
      company: string;
      period: string;
      bullets: string[];
    }[];
    education: {
      degree: string;
      institution: string;
      period: string;
      details?: string;
    }[];
    skills: {
      category: string;
      items: string[];
    }[];
    projects?: {
      title: string;
      period: string;
      bullets: string[];
      technologies: string[];
    }[];
    languages?: string[];
  };
  changesMade: string[];
  alignmentScore: number;
  matchingAnalysis: string;
}

export interface InterviewQuestion {
  id: string;
  category: string;
  topic?: string;
  question: string;
  whyAsked: string;
  answerStrategy: string;
  modelAnswer: string;
}

export interface InterviewQuestionsResult {
  detectedRole: string;
  technicalRoadmap: InterviewQuestion[];
  experienceBased: InterviewQuestion[];
}

export interface FileData {
  name: string;
  base64: string;
  mimeType: string;
  size: number;
}
