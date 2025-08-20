import Taro from '@tarojs/taro'

/**
 * 生成唯一标识符
 *
 * @export
 * @returns
 */
function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}

export function guid() {
  return (
    S4() +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    S4() +
    S4()
  )
}

/**
 * 复制文本
 * @param {string} text 复制的文本（同步数据，iOS上只要是异步数据怎么调用都是false）
 */
function fallbackCopyTextToClipboard(text: string) {
  const input = document.createElement('input')
  document.body.appendChild(input)
  input.setAttribute('readonly', 'readonly')
  input.setAttribute('value', text)
  input.select()
  input.setSelectionRange(0, text.length)
  console.log('copy', document.execCommand('copy'))
  try {
    document.execCommand('copy')
  } catch (err) {
    console.log(err)
  }
  document.body.removeChild(input)
}
export const CopyText = (text: string) => {
  /**
   * @abstract ios 上document.execCommand("copy")只要异步必然false
   * @abstract navigator.clipboard只能在安全环境下使用，window.isSecureContext,localhost或者https下才存在这个对象
   * @abstract 构建input如果遇到\n 这样的特殊字符是会自动忽略的
   */
  if (!navigator.clipboard) {
    return fallbackCopyTextToClipboard(text)
  }
  const selection = document.createElement('input')
  document.body.appendChild(selection)
  selection.setAttribute('readonly', 'readonly')
  selection.setAttribute('value', text)
  selection.select()
  selection.setSelectionRange(0, text.length)
  return navigator.clipboard
    .writeText(text)
    .then(
      () =>
        function () {
          document.body.removeChild(selection)
        }
    )
    .catch(
      (error) =>
        function () {
          document.body.removeChild(selection)
          console.log('error', error)
        }
    )
}

/**
 ** 判断是否是有刘海屏的iPhone
 *
 * @export
 * @param {string} info 设备型号信息，Taro.getSystemInfoSync() | DeviceInfo.getDeviceId()(react-native-device-info库)
 * @returns
 */
export function judgmentNewPhone() {
  const device = navigator.userAgent
  const isNewPhone = !!device.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
  return isNewPhone
}

/**
 * 判断是否是新iphone
 *
 * @export
 * @returns
 */
export function getisNewIphone() {
  const { model, screenWidth, screenHeight } = Taro.getSystemInfoSync()

  let isNewPhone = /(iPhone (X|11|12|13|14|15|16))|(unknown.*iPhone)/.test(
    model
  )

  if (isNewPhone) {
    // 判断是否为iphone SE,1334 x 750 像素分辨率
    isNewPhone = !(screenWidth === 375 && screenHeight === 667)
  }
  return isNewPhone
}

/**
 *  手机号校验
 * @param {*} str 手机号
 */
export function isPhone(str: string) {
  const reg = /^[1][2, 3,4,5, 6 ,7,8, 9][0-9]{9}$/
  return reg.test(str)
}

/**
 * 手机号加密显示
 * @param phone 手机号
 */
export function encryptPhone(phone: string) {
  return phone.substr(0, 4) + '****' + phone.substr(7)
}
