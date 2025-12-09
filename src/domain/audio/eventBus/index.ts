// src/domain/audio/eventBus/index.ts
import { AudioEventBus } from './AudioEventBus'

export const audioEventBus = new AudioEventBus()

export * from './AudioEventTypes'
