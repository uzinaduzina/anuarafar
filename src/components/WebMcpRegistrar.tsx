import { useEffect } from 'react';
import { useJournalData } from '@/data/JournalDataProvider';
import { registerWebMcpTools } from '@/lib/webmcp';

export function WebMcpRegistrar() {
  const { articles, issues, loading } = useJournalData();

  useEffect(() => {
    if (loading) return;
    registerWebMcpTools(articles, issues);
  }, [articles, issues, loading]);

  return null;
}
