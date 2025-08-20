export const isWeapp = process.env.TARO_ENV === 'weapp' // 是不是小程序环境
export const isH5 = process.env.TARO_ENV === 'h5' // 是不是h5

/**
 * 后端域名
 */
const DEV_ENV = '' //dev 环境
const TEST_ENV = 'https://test.com' //test环境
const PRE_ENV = 'https://pre.com' //pre 环境
const PROD_ENV = 'https://prod.com' //生产环境

/** 后端apiUrl */
export const apiUrl = {
  dev: DEV_ENV,
  test: TEST_ENV,
  pre: PRE_ENV,
  prod: PROD_ENV,
}[VUE_APP_ENV || 'dev']

// 没有token时候跳转的页面。如果开启了静默授权不会跳转
export const loginUrl = '/login'
