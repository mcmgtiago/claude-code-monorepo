export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  href: string;
  cta: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatar: string;
  company: string;
  rating: number;
}

export interface Metric {
  label: string;
  value: string;
  suffix?: string;
}

export interface CaseStudy {
  id: string;
  client: string;
  challenge: string;
  solution: string;
  results: string[];
  image: string;
  industry: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  duration: string;
  description: string;
  deliverables: string[];
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  readTime: string;
  date: string;
}

export interface ProblemCard {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface Differentiator {
  id: string;
  icon: string;
  title: string;
  description: string;
}