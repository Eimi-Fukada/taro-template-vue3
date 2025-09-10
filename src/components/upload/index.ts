import { apiUrl } from '~/config'
import Taro from '@tarojs/taro'

export async function uploadAliyun(fileList: File[]) {
  const uploadTasks = fileList.map((file) => {
    const form = new FormData()
    form.append('file', file)

    return fetch(apiUrl + '/clientUploadService/pubUploadFile', {
      method: 'post',
      body: form,
      mode: 'cors',
      headers: {
        'x-token': Taro.getStorageSync('x-token'),
        'x-tenant-code':
          Taro.getStorageSync(`x-tenant-code`) || '788a35e64092b5fb',
        'x-system-code': 'cus_font',
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json()
        }
      })
      .then((data) => {
        return data.data.path
      })
      .catch((e) => {
        return Promise.reject(e)
      })
  })

  return Promise.all(uploadTasks)
}

/**
 *
 * @param fileList
 * @returns
 * 微信小程序环境中没有 FormData 对象。FormData 是浏览器 Web API 的一部分
 */
export async function uploadMiniAliyun(fileList: string[]) {
  const uploadTasks = fileList.map((file) => {
    return Taro.uploadFile({
      url: apiUrl + '/resource/oss/upload',
      filePath: file,
      name: 'file',
      /** HTTP 请求中其他额外的 form data */
      // formData: {
      //   user: 'test',
      // },
      header: {
        Authorization: 'Bearer ' + Taro.getStorageSync('Authorization'),
        clientId: '428a8310cd442757ae699df5d894f052',
      },
      success: (res) => {
        const data = res.data
        return data
      },
      fail: (err) => {
        return Promise.reject(err)
      },
    })
  })

  return Promise.all(uploadTasks)
}
