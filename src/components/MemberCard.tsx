export interface BoardMember {
  name: string;
  title?: string;
  affiliation: string;
}

function getInitials(name: string) {
  return name.split(/\s+/).map(w => w.charAt(0).toUpperCase()).filter(c => c.match(/[A-ZÀ-Ž]/i)).join('');
}

export function MemberCard({ member }: { member: BoardMember }) {
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
      </div>
    </div>
  );
}
