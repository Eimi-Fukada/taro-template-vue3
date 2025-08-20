export interface CodeInputProps {
  // 手机号
  phone: string

  // 倒计时时间（秒）
  countdownTime?: number
}

export type CodeInputEmits = {
  // 发送验证码时触发
  'on-send-code': []

  // 倒计时结束时触发
  'on-countdown-finish': []
}
