import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  // baseURL: 'http://172.20.10.3:1235',
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
  // withCredentials: true
})

// 添加请求拦截器
service.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么

    return config
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  },
)

// 添加响应拦截器
service.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。

    return response.data
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    ElMessage.error('请求出错')
    return Promise.reject(error)
  },
)

export const getBaseURL = () => import.meta.env.VITE_API_BASE_URL

export default service

// export default service
