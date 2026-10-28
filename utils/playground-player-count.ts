export const MAX_LOCAL_PLAYERS=4;

/** The development split-screen SDK allocates one iframe per requested player.
 * URL parameters must respect the same four-player limit as its Add Guest UI. */
export function requestedPlayersCount(search:string):number {
 const value=Number(new URLSearchParams(search).get('players')??'1');
 return Number.isInteger(value)&&value>0?Math.min(MAX_LOCAL_PLAYERS,value):1;
}
