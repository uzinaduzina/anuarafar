import { useEffect } from 'react';
import { type AnalyticsEntityType, trackAnalyticsView } from '@/lib/analytics';

interface UseTrackAnalyticsViewInput {
  entityType: AnalyticsEntityType;
  entityId: string;
  label: string;
  path: string;
  enabled?: boolean;
}

export function useTrackAnalyticsView({
  entityType,
  entityId,
  label,
  path,
  enabled = true,
}: UseTrackAnalyticsViewInput) {
  useEffect(() => {
    if (!enabled || !entityId.trim()) return;

    void trackAnalyticsView({
      entityType,
      entityId,
      label,
      path,
    });
  }, [enabled, entityId, entityType, label, path]);
}
