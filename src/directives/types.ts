import type { Directive } from 'vue'

/**
 * 全局指令类型模板
 * @template T 指令绑定值的类型
 * @template E 指令作用的元素类型（默认为 HTMLElement）
 */
export type AppDirective<
  T = unknown,
  E extends HTMLElement = HTMLElement,
> = Directive<E, T>
