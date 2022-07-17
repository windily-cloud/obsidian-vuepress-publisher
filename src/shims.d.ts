import { App } from 'obsidian'
import { ComponentOptions } from 'vue'
declare module '*.vue' {
  const componentOptions: ComponentOptions
  export default componentOptions
}

declare const app: App
