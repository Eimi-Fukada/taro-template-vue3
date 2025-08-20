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
