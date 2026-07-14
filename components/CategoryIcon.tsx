import {
  AlertCircle,
  Bus,
  Coffee,
  Flame,
  Gift,
  HeartPulse,
  LucideIcon,
  Pill,
  Shirt,
  ShoppingCart,
  Sparkles,
  Users,
  Wheat,
  Wifi,
  Wrench,
  Zap,
} from 'lucide-react-native';
import { StyleProp, ViewStyle } from 'react-native';

const ICONS: Record<string, LucideIcon> = {
  ShoppingCart,
  Coffee,
  Wifi,
  Zap,
  Flame,
  Users,
  Bus,
  Shirt,
  Sparkles,
  Pill,
  Wheat,
  HeartPulse,
  Wrench,
  Gift,
  AlertCircle,
};

type CategoryIconProps = {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function CategoryIcon({ name, size = 24, color = '#1f2937', style }: CategoryIconProps) {
  const Icon = ICONS[name] || AlertCircle;
  return <Icon size={size} color={color} style={style} />;
}
