export interface TimeData {
  readonly days: number
  readonly hours: number
  readonly minutes: number
  readonly seconds: number
  readonly milliseconds: number
  readonly totalSeconds: number // 总秒数，用于纯秒数显示
}

export interface CountDownProps {
  // 倒计时时间（秒）或结束时间戳（毫秒）
  time?: number

  // 结束时间戳（毫秒），优先级高于 time
  endTime?: number

  // 是否自动开始
  autoStart?: boolean

  // 格式化模板 (支持 DD天HH时mm分ss秒SSS毫秒)
  format?: string

  // 是否暂停
  paused?: boolean

  // 是否显示毫秒
  millisecond?: boolean
}

export type CountDownEmits = {
  // 倒计时结束时触发
  'on-finish': []

  // 倒计时变化时触发
  'on-change': [timeData: TimeData]

  // 暂停时触发
  'on-pause': []

  // 重启时触发
  'on-restart': []
}
