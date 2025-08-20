import deleteApis from './apis/delete'
import get from './apis/get'
import post from './apis/post'
import put from './apis/put'

// 每一个属性中会包含同名的请求方法下所有接口的请求函数
const apis = {
  get,
  post,
  put,
  delete: deleteApis,
}

export default apis
