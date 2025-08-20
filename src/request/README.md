# 针对 Taro.request 进行的二次封装

## 1.支持智能推导 params

## 2.统一进行了异常处理，不需要额外再包裹 try catch

## 3.支持路径参数替换

## 4.暴露参数多样，如可以自定义修改 Content-Type，timeout 等

## 5.处理了后端返回的响应对象，异常返回 data,err,response，err 里处理 code 和 msg，正常返回业务数据 data.data，兼容了老板本 request 无法处理后端 code status 错误及 data.code 错误的问题

## 6.支持对单个接口单独设置 config 内的内容，比如 headers:content-type

### 使用示例

```js
// 第一个参数为Payload，用于定义响应结果的数据类型，可不传，值为null或者undefined
// 第二个参数data：用于定义data的数据类型
// 第三个参数params：用于定义parmas的数据类型
// 第四个参数args：用于定义存放路径参数的属性args的数据类型
1. '/url/{username}': makeRequest<undefined, { id: number }, undefined, { username: string }>({
    url: '/url/{username}',
    method,
  }),
//   调用
apis.post['/url/{username}']({
  data: {
    id: -1,
  },
  args: {
    username: '1',
  },
})

2.  '/password': makeRequest<undefined, { password: string }, { username: string }，undefined>({
    url: '/password',
    method,
  }),
  //   调用
apis.put['/password']({
  data: {
    password: '123',
  },
  params: {
    username: '123',
  },
})

3.  '/admins': makeRequest<{ admins: string[] }>({
    url: '/admins',
    method
  }),
  //   调用
apis.get['/admins']()
```
