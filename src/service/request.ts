import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import VuepressPublisher from "../main"

type PublisherType = "github" | "gitee"

class Request {
  private baseUrl: string
  private token: string
  instance: AxiosInstance
  constructor(public type: PublisherType, public plugin: VuepressPublisher) {
    if (type === "github") {
      this.baseUrl = "https://api.github.com/"
      this.token = this.plugin.settings && this.plugin.settings.github.token ? this.plugin.settings.github.token : ''
    } else if (type === "gitee") {
      this.baseUrl = "https://gitee.com/api/v5/"
      this.token = this.plugin.settings && this.plugin.settings.github.token ? this.plugin.settings.github.token : ''
    } else {
      this.baseUrl = ""
      this.token = ""
    }

    this.instance = axios.create({
      baseURL: this.baseUrl,
      withCredentials: false,
      timeout: 3000
    })
  }

  interceptor() {
    this.instance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers["Authorization"] = this.token
        }
        return config
      },
      (err) => {
        console.log("request interceptors", err)
        return Promise.reject(err)
      }
    )

    this.instance.interceptors.response.use(
      (res) => {
        if (res.status != 200) {
          console.log("response interceptors:", res)
        }
        return res
      },
      (err) => {
        console.log("reponse interceptors", err)
        Promise.reject(err)
      }
    )
  }

  request(options: AxiosRequestConfig) {
    this.interceptor()
    return this.instance(options)
  }
}

export default Request