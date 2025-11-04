/**
 * 全局自定义指令统一出口
 * 所有指令需在此文件中集中导出，便于维护和注册
 */
import { vDebounce } from './debounce'
import { vTrack } from './track'
import { vSafeArea } from './safeArea'
import { vImgFallback } from './imgFallback'
import { vScrollLock } from './scrollLock'
import { AppDirective } from './types'

/**
 * 全局指令注册表
 * 键：指令名（不带 'v-' 前缀）
 * 值：指令对象
 */
export const directiveMap: Record<string, AppDirective> = {
  debounce: vDebounce,
  track: vTrack,
  safeArea: vSafeArea,
  imgFallback: vImgFallback,
  scrollLock: vScrollLock,
}
