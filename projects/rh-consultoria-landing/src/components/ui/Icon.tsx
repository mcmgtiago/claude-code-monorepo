import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  GraduationCap,
  Handshake,
  Lightbulb,
  Mail,
  Menu,
  Play,
  Quote,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  Zap,
  Linkedin,
  Instagram,
} from "lucide-react";

export const icons = {
  ArrowRight,
  BarChart3,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  GraduationCap,
  Handshake,
  Lightbulb,
  Mail,
  Menu,
  Play,
  Quote,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  Zap,
  Linkedin,
  Instagram,
};

export type IconName = keyof typeof icons;

interface IconProps {
  name: IconName | string;
  className?: string;
  strokeWidth?: number;
  "aria-hidden"?: boolean;
}

export function Icon({ name, className, strokeWidth = 2, ...rest }: IconProps) {
  const Component = icons[name as IconName] ?? Sparkles;
  return <Component className={className} strokeWidth={strokeWidth} {...rest} />;
}