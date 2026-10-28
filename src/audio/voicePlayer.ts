// tslint:disable
/* eslint-disable */
/**
 * Starflight Voice Player facade.
 * Exports queue and playback methods as specified in Game Design Spec.
 */

import {
  voiceEngine,
  alienVoice,
  playAlienVoice,
  playVoiceLine,
  stopAlienVoice,
  stopVoice,
  stopAllVoices,
  playCrewVoice,
  playCrewBanter,
  playCrewBanterVoice,
  stopCrewVoice,
  AlienVoiceEngine,
  CommQueueItem,
} from '../../voice';

export {
  voiceEngine,
  alienVoice,
  playAlienVoice,
  playVoiceLine,
  stopAlienVoice,
  stopVoice,
  stopAllVoices,
  playCrewVoice,
  playCrewBanter,
  playCrewBanterVoice,
  stopCrewVoice,
  AlienVoiceEngine,
  type CommQueueItem,
};

export const voicePlayer = voiceEngine;
