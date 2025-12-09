// src/domain/audio/eventBus/AudioEventTypes.ts

export const AudioEvent = {
  PLAY: 'audio:play',
  PAUSE: 'audio:pause',
  SEEK_START: 'audio:seek_start',
  SEEK_END: 'audio:seek_end',
  TIME_UPDATE: 'audio:timeupdate',
  META_UPDATE: 'audio:meta_update',
  ERROR: 'audio:error',
  NEXT: 'audio:next',
  PREV: 'audio:prev',
} as const
