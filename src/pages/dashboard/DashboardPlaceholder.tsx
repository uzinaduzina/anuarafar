import { Construction } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
}

export default function DashboardPlaceholder({ title, description }: Props) {
  return (
    <div className="py-16 text-center">
      <Construction className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h1 className="font-serif text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground">{description || 'Această secțiune va fi implementată în curând.'}</p>
    </div>
  );
}
