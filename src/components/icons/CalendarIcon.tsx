import { Calendar } from 'lucide-react';

interface Props {
  className?: string;
  size?: number;
}

export default function CalendarIcon({ className = '', size = 18 }: Props) {
  return <Calendar className={className} size={size} aria-hidden />;
}
