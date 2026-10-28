import type {SaveSlotData} from '../App';

export function sameMissionVersion(current:SaveSlotData,reviewed:SaveSlotData) {
  return JSON.stringify(current)===JSON.stringify(reviewed);
}

export function copyMissionSlot(source:SaveSlotData,destination:SaveSlotData['slot']):SaveSlotData {
  if(source.empty||!source.snapshot) throw new Error('Only an existing playable mission can be copied.');
  if(source.slot===destination) throw new Error('Choose a different destination slot.');
  return {...structuredClone(source),slot:destination};
}
