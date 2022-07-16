import { ComponentOptions } from 'vue'
import { App } from 'obsidian'
declare module '*.vue' {
  const componentOptions: ComponentOptions
  export default componentOptions
}

declare const app: App
