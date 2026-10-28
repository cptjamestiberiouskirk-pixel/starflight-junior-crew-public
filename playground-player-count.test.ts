import assert from 'node:assert/strict';
import {requestedPlayersCount,MAX_LOCAL_PLAYERS} from './utils/playground-player-count';
export function runPlaygroundPlayerCountTests(){
 let passed=0;const check=(ok:boolean,label:string)=>{assert(ok,label);passed++;};
 for(const search of ['', '?players=', '?players=0','?players=-1','?players=NaN','?players=Infinity','?players=1.5','?players=1e999','?players=%3Cscript%3E'])check(requestedPlayersCount(search)===1,'Invalid or absent query uses one local player');
 for(let n=1;n<=4;n++)check(requestedPlayersCount('?players='+n)===n,'Supported player counts retain their value');
 for(const search of ['?players=5','?players=1000000000','?players=1e100','?players=9007199254740991'])check(requestedPlayersCount(search)===MAX_LOCAL_PLAYERS,'Large positive counts cannot allocate unbounded iframes');
 check(requestedPlayersCount('?other=5&players=3')===3,'Unrelated parameters do not alter the player count');
 return {passed,failed:0,results:[] as string[]};
}
