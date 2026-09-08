import {
  BadgeDollarSign, Bug, Clock, FileCheck, MessageCircle, PawPrint, ShieldCheck,
  SprayCan, Star, Users, Worm, Rat, MapPin, Phone, Mail, Menu,
  Award, Home, Shield, Navigation, Facebook, Instagram, Zap, AlertTriangle,
  CheckCircle2, Building2, HeartHandshake, BadgeCheck
} from "lucide-react";

const icons = {
  BadgeDollarSign,
  Bug,
  Clock,
  FileCheck,
  MessageCircle,
  PawPrint,
  ShieldCheck,
  Spray: SprayCan,
  SprayCan,
  Star,
  Users,
  Worm,
  Rat,
  Ants: Bug,
  Spider: Bug,
  Mosquito: Bug,
  MapPin,
  Phone,
  Mail,
  Menu,
  Award,
  Home,
  Shield,
  Navigation,
  Facebook,
  Instagram,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Building2,
  HeartHandshake,
  BadgeCheck,
} as const;

export type IconName = keyof typeof icons;

export function Icon({ name, className, "aria-hidden": ariaHidden = true }: { name: string; className?: string; "aria-hidden"?: boolean }) {
  const LucideIcon = icons[name as IconName] || Bug;
  return <LucideIcon className={className} aria-hidden={ariaHidden} />;
}