interface DatedNotice {id:number;date:string;read:boolean}

/** Release newly dated notices once; retain read flags and earned milestone memos. */
export function releaseNotices<T extends DatedNotice>(existing:T[],catalog:Omit<T,'read'>[],absoluteDay:number):T[] {
  const known=new Set(existing.map(notice=>notice.id));
  const arrivals:T[]=[];
  for(const notice of catalog) {
    const [day,month,year]=notice.date.split('-').map(Number);
    const releaseDay=(year-4620)*300+(month-1)*30+day-1;
    if(!known.has(notice.id) && releaseDay<=absoluteDay) {
      arrivals.push({...notice,read:false} as T);
      known.add(notice.id);
    }
  }
  return arrivals.length ? [...existing,...arrivals] : existing;
}
