
export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  password?: string;
  role: UserRole;
  progress: number;
  avatar?: string;
  enrolledDate?: string;
  hasPaidLive?: boolean;
  isApproved?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  price: number;
  image: string;
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'quiz' | 'pdf';
  completed: boolean;
  contentUrl?: string;
  assetData?: string; // For base64 files
  duration?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface PracticeTest {
  id: string;
  title: string;
  duration: string;
  questions: QuizQuestion[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface Review {
  id: string;
  name: string;
  avatar?: string;
  text: string;
  rating: number;
  role: string;
  likes: number;
  replies: ReviewReply[];
  createdAt: Date;
}

export interface ReviewReply {
  id: string;
  name: string;
  avatar?: string;
  text: string;
  createdAt: Date;
}

export interface BrandingAssets {
  founderImage: string;
  tutorImage: string;
  heroImage: string;
  spotlightImage: string;
  aboutImage: string;
}
