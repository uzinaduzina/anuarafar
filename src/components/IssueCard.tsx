import { Link } from 'react-router-dom';
import { Issue, SeriesId } from '@/data/types';
import { SeriesBadge } from './SeriesBadge';

interface IssueCardProps {
  issue: Issue;
}

const seriesBg: Record<SeriesId, string> = {
  'seria-1': 'bg-series-1-bg border-series-1-border hover:border-series-1 hover:shadow-lg',
  'seria-2': 'bg-series-2-bg border-series-2-border hover:border-series-2 hover:shadow-lg',
  'seria-3': 'bg-series-3-bg border-series-3-border hover:border-series-3 hover:shadow-lg',
};

const seriesText: Record<SeriesId, string> = {
  'seria-1': 'text-series-1-foreground',
  'seria-2': 'text-series-2-foreground',
  'seria-3': 'text-series-3-foreground',
};

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <Link
      to={`/archive/${issue.slug}`}
      className={`group flex flex-col rounded-lg border p-5 transition-all duration-200 hover:-translate-y-0.5 ${seriesBg[issue.series]}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[0.7rem] uppercase tracking-[0.08em] font-semibold ${seriesText[issue.series]} opacity-80`}>
          Vol. {issue.volume} · {issue.year}
        </span>
        <SeriesBadge series={issue.series} />
      </div>
      <h3 className={`font-serif text-base font-bold leading-snug mb-3 line-clamp-2 min-h-[2.7em] ${seriesText[issue.series]}`}>
        {issue.title}
      </h3>
      <div className={`mt-auto text-sm ${seriesText[issue.series]} opacity-70`}>
        {issue.article_count > 0 && <span>{issue.article_count} articole</span>}
        {issue.article_count > 0 && issue.pages ? <span> · {issue.pages} pag.</span> : null}
        {issue.article_count === 0 && <span className="italic">Doar PDF integral</span>}
      </div>
    </Link>
  );
}
