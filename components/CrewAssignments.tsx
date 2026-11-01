import type {CrewMember, CrewPost} from '../App';
import {CrewPortrait} from '../App';
import {CREW_ROLES, crewAssignmentAllowed, type CrewAssignments as Assignments} from '../utils/crew-assignments';

/** Shared assignment controls at Starport and in the paused mission. */
export default function CrewAssignments({roster, posts, hullCritical, onAssign}: {
  roster: CrewMember[]; posts: Assignments; hullCritical: boolean;
  onAssign: (post: CrewPost, id: string | null) => void;
}) {
  return <div className="space-y-4 text-xs">
    <p className="text-slate-300">Each bridge role requires a different crew member. Vacate an officer's current role before moving them to another. Launch requires six living officers in six distinct roles.</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {CREW_ROLES.map(post => {
        const officer = roster.find(member => member.id === posts[post]);
        return <div key={post} className="bg-slate-950/90 p-3.5 rounded-2xl border border-purple-900/80 flex flex-col gap-2 shadow-inner">
          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
            <strong className="text-purple-300 font-extrabold text-sm">{post}</strong>
            <span className={officer && !officer.alive ? 'text-red-400 font-bold' : officer ? 'text-cyan-300 font-semibold' : 'text-slate-500'}>{officer ? officer.alive ? officer.race : 'DECEASED' : 'VACANT'}</span>
          </div>
          <div className="flex items-center gap-2.5">
            {officer ? <CrewPortrait member={officer} size="sm" inCombat={false} hullCritical={hullCritical}/> : <div className="w-9 h-9 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500">🪑</div>}
            <div className="flex-1 min-w-0"><strong className="text-white text-xs block truncate">{officer ? officer.name : 'No Officer Assigned'}</strong><span className="text-[10px] text-slate-400">{officer ? `Vitality: ${Math.round(officer.vitality)}%` : 'Select replacement from roster'}</span></div>
          </div>
          <select aria-label={`${post} assignment`} value={posts[post] || ''} onChange={event => {
            const id = event.target.value || null;
            if (crewAssignmentAllowed(roster,posts,post,id)) onAssign(post,id);
          }} className="bg-slate-900 border border-purple-700/60 text-white rounded-xl p-2 text-xs font-bold w-full min-w-0">
            <option value="">-- Vacant --</option>
            {officer && !officer.alive && <option value={officer.id} disabled>{officer.name} (Deceased - replace)</option>}
            {roster.filter(member => member.alive).map(member => {
              const occupied = CREW_ROLES.find(other => other !== post && posts[other] === member.id);
              return <option key={member.id} value={member.id} disabled={!!occupied}>{member.name} ({member.race}) - Vit: {Math.round(member.vitality)}%{occupied ? ` — assigned: ${occupied}` : ''}</option>;
            })}
          </select>
        </div>;
      })}
    </div>
  </div>;
}
