export interface BoardMember {
  name: string;
  title?: string;
  affiliation: string;
  orcid?: string;
  scholar?: string;
}

function getInitials(name: string) {
  return name.split(/\s+/).map(w => w.charAt(0).toUpperCase()).filter(c => c.match(/[A-ZÀ-Ž]/i)).join('');
}

function normalizeOrcidUrl(orcid: string) {
  const trimmed = orcid.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const compact = trimmed.replace(/[^0-9X-]/gi, '');
  return `https://orcid.org/${compact}`;
}

export function MemberCard({ member }: { member: BoardMember }) {
  const orcidUrl = member.orcid ? normalizeOrcidUrl(member.orcid) : '';
  const scholarUrl = member.scholar?.trim() || '';

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
      <span className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
        {getInitials(member.name)}
      </span>
      <div className="min-w-0">
        <div className="font-medium text-sm">
          {member.title && <span className="text-muted-foreground">{member.title} </span>}
          {member.name}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{member.affiliation}</div>
        {(orcidUrl || scholarUrl) && (
          <div className="mt-1.5 flex flex-wrap gap-3 text-xs">
            {orcidUrl && (
              <a
                href={orcidUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
                aria-label={`ORCID profile of ${member.name}`}
              >
                <span aria-hidden="true" className="font-bold">iD</span>
                ORCID
              </a>
            )}
            {scholarUrl && (
              <a
                href={scholarUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
                aria-label={`Google Scholar profile of ${member.name}`}
              >
                Google Scholar
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
