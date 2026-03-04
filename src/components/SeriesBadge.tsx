import { SeriesId, SERIES_CONFIG } from '@/data/types';

interface SeriesBadgeProps {
  series: SeriesId;
  className?: string;
}

export function SeriesBadge({ series, className = '' }: SeriesBadgeProps) {
  const config = SERIES_CONFIG[series];
  
  const colorMap: Record<SeriesId, string> = {
    'seria-1': 'bg-series-1-bg text-series-1-foreground border-series-1-border',
    'seria-2': 'bg-series-2-bg text-series-2-foreground border-series-2-border',
    'seria-3': 'bg-series-3-bg text-series-3-foreground border-series-3-border',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] uppercase tracking-[0.08em] font-semibold border ${colorMap[series]} ${className}`}>
      {config.label}
    </span>
  );
}
