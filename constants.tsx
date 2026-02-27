import React from 'react';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Users, 
  Settings, 
  LayoutDashboard,
  Calendar,
  Award,
  BarChart3
} from 'lucide-react';

export const COLORS = {
  primary: '#0ea5e9',
  secondary: '#0d9488',
  accent: '#fbbf24',
  background: '#f8fafc',
};

export const COUNTRY_LIST = [
  "Nigeria", "United Kingdom", "United States", "Canada", "Ireland", "Ghana", "South Africa", "Kenya", "India", "Philippines", "Australia", "United Arab Emirates", "Saudi Arabia", "Jamaica", "Trinidad and Tobago", "Other"
];

export const COURSES = [
  {
    id: 'intensive-nclex',
    title: 'Intensive NCLEX Review Program',
    description: 'Our most comprehensive program designed for complete NCLEX preparation. Includes daily live lectures, full content review, pharmacology, maternity, mental health, and more.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
    price: 499,
    instructor: 'Dr. Sarah Grace',
    duration: 'Full Access',
    tags: ['First-time', 'Repeat', 'International'],
    included: [
      "Daily live lectures",
      "Full NCLEX content review",
      "Access to recorded classes",
      "Weekly assessments and evaluations",
      "Live Virtual simplified lectures",
      "Pharmacology, Maternity, Mental Health, EKG & more"
    ]
  },
  {
    id: 'subject-focused',
    title: 'Subject-Focused Classes',
    description: 'Strengthen weak areas with targeted instruction in Pharmacology, Maternity, Mental Health, EKG, and Med-Surg.',
    image: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800',
    price: 149,
    instructor: 'Dr. Sarah Grace',
    duration: 'Targeted',
    tags: ['Pharmacology', 'Maternity', 'Med-Surg']
  },
  {
    id: 'private-tutoring',
    title: 'Private Tutoring',
    description: 'Personalized one-on-one NCLEX coaching with an individual study plan and flexible scheduling.',
    image: 'https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?auto=format&fit=crop&q=80&w=800',
    price: 75,
    instructor: 'Expert Tutors',
    duration: 'Hourly',
    tags: ['1-on-1', 'Personalized']
  }
];

export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Our Services', path: '/services' },
  { label: 'Courses', path: '/courses' },
  { label: 'About', path: '/about' },
  { label: 'Resources', path: '/resources' },
  { label: 'Review', path: '/reviews' },
  { label: 'Chat Us', path: 'whatsapp', isExternal: true },
];

export const DASHBOARD_LINKS = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'My Courses', path: '/dashboard/courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Live Classes', path: '/dashboard/live', icon: <Video className="w-5 h-5" /> },
  { label: 'Practice Tests', path: '/dashboard/tests', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Materials', path: '/dashboard/notes', icon: <FileText className="w-5 h-5" /> },
  { label: 'Calendar', path: '/dashboard/calendar', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Certificates', path: '/dashboard/certs', icon: <Award className="w-5 h-5" /> },
];

export const ADMIN_LINKS = [
  { label: 'Overview', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Students', path: '/admin/students', icon: <Users className="w-5 h-5" /> },
  { label: 'Content', path: '/admin/content', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];