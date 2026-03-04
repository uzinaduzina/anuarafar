import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useJournalData } from '@/data/JournalDataProvider';
import { SERIES_CONFIG, SeriesId } from '@/data/types';
import { IssueCard } from '@/components/IssueCard';

const SERIES_ORDER: SeriesId[] = ['seria-3', 'seria-1', 'seria-2'];

export default function ArchivePage() {
  const { issues, loading } = useJournalData();
  const [filter, setFilter] = useState<SeriesId | 'all'>('all');

  const published = issues.filter(i => i.status === 'published');
  
  const grouped: Record<string, typeof issues> = {};
  for (const issue of published) {
    if (!grouped[issue.series]) grouped[issue.series] = [];
    grouped[issue.series].push(issue);
  }
  for (const key in grouped) {
    grouped[key].sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
  }

  const filteredSeries = filter === 'all' ? SERIES_ORDER : [filter];

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold mb-2">Arhiva completă</h1>
        <p className="text-muted-foreground">{published.length} numere publicate în 3 serii editoriale</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'
          }`}
        >
          Toate ({published.length})
        </button>
        {SERIES_ORDER.map(sid => {
          const config = SERIES_CONFIG[sid];
          const count = (grouped[sid] || []).length;
          return (
            <button
              key={sid}
              onClick={() => setFilter(sid)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === sid ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        filteredSeries.map(sid => {
          const seriesIssues = grouped[sid] || [];
          if (seriesIssues.length === 0) return null;
          const config = SERIES_CONFIG[sid];
          return (
            <div key={sid} className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-2 h-2 rounded-full ${
                  sid === 'seria-1' ? 'bg-series-1' : sid === 'seria-2' ? 'bg-series-2' : 'bg-series-3'
                }`} />
                <h2 className="font-serif text-xl font-bold">{config.label}</h2>
                <span className="text-sm text-muted-foreground">({config.years} · {seriesIssues.length} numere)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {seriesIssues.map(issue => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
