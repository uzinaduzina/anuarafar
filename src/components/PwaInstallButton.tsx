import { CheckCircle2, Download } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { usePwa } from '@/contexts/PwaContext';

interface PwaInstallButtonProps extends ButtonProps {
  label?: string;
  installedLabel?: string;
  showLabel?: boolean;
}

export default function PwaInstallButton({
  label = 'Instalează aplicația',
  installedLabel = 'Aplicație instalată',
  showLabel = true,
  className,
  onClick,
  ...props
}: PwaInstallButtonProps) {
  const { toast } = useToast();
  const { canInstall, canInstallManually, isInstalled, promptInstall } = usePwa();

  if (!isInstalled && !canInstall && !canInstallManually) {
    return null;
  }

  const handleClick: ButtonProps['onClick'] = async (event) => {
    onClick?.(event);
    if (event?.defaultPrevented) return;

    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      toast({
        title: isInstalled ? 'Aplicație deja instalată' : 'Instalare pornită',
        description: isInstalled
          ? 'Aplicația este deja disponibilă pe dispozitiv.'
          : 'Confirmă instalarea din fereastra browserului.',
      });
      return;
    }

    if (outcome === 'manual') {
      toast({
        title: 'Instalare din browser',
        description: 'Pe iPhone/iPad folosește Share -> Add to Home Screen pentru a instala aplicația.',
      });
      return;
    }

    if (outcome === 'dismissed') {
      toast({
        title: 'Instalare anulată',
        description: 'Poți relua instalarea oricând din meniu.',
      });
    }
  };

  return (
    <Button
      type="button"
      variant={isInstalled ? 'outline' : (props.variant || 'outline')}
      className={className}
      onClick={handleClick}
      disabled={props.disabled || isInstalled}
      {...props}
    >
      {isInstalled ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
      {showLabel && <span>{isInstalled ? installedLabel : label}</span>}
    </Button>
  );
}
