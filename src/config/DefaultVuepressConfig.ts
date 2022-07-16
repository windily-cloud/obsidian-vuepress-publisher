export const DefaultVuepressConfigContent = `
# 博客配置/Blog Setting

懂的人请任意修改，自定义侧边栏和导航栏。不懂的人最好对照着文档弄懂了每个参数的含义再修改。

\`\`\`js
import { defineUserConfig } from "vuepress";
import { hopeTheme } from "vuepress-theme-hope";
import type { HopeThemeSidebarConfig } from "vuepress-theme-hope";
import fs from 'fs'
import path from 'path'

function generateSidebar(docAbsolutePath: string): any{
  let result: HopeThemeSidebarConfig = []
  const files = fs.readdirSync(docAbsolutePath)
  for(let filePath of files){
    const absolutePath = path.join(docAbsolutePath, filePath)
    const stat = fs.statSync(absolutePath)
    if(stat.isDirectory()){
      const prefixList = path.relative(__dirname,absolutePath).split(path.sep)
      prefixList.shift()
      prefixList.shift()
      const prefix = prefixList.join("/")
      result.push({
        text: filePath,
        prefix: prefix,
        collapsable: true,
        icon: "folder",
        children: generateSidebar(absolutePath)
      })
    }else if(stat.isFile() && path.extname(filePath) === ".md"){
      result.push(filePath)
    }
  }
  return result
}

const sidebar = [{
  text: "obsidian vault",
  prefix: "/docs",
  collapse: false,
  icon: "folder",
  children: generateSidebar(path.join(__dirname, \`../docs\`))
}]

// Reference: https://vuepress-theme-hope.github.io/v2/zh/guide/
export default defineUserConfig({
  lang: "zh-CN",
  title: "Windily Cloud",
  description: "Windily Cloud的博客",

  base: "/obsidian-publish/",
  theme: hopeTheme({
    hostname: "https://vuepress-theme-hope-v2-demo.mrhope.site",

    author: {
      name: "Mr.Hope",
      url: "https://mrhope.site",
    },

    iconAssets: "iconfont",

    logo: "/logo.svg",

    repo: "windily-cloud/obsidian-publish",

    docsDir: "/docs/",

    // navbar
    //navbar: navbar,

    // sidebar
    sidebar: sidebar,

    // sidebar: sidebar,

    footer: "默认页脚",

    displayFooter: true,

    pageInfo: ["Author", "Original", "Date", "Category", "Tag", "ReadingTime"],

    blog: {
      description: "前轱辘不转后轱辘转！",
      intro: "/intro.html",
      medias: {
        Email: "https://example.com",
        Gitee: "https://example.com",
        GitHub: "https://example.com",
        QQ: "https://example.com",
        Rss: "https://example.com",
        Steam: "https://example.com",
      },
    },

    plugins: {
      blog: {
        autoExcerpt: true,
      },

      mdEnhance: {
        enableAll: false,
        presentation: {
          plugins: ["highlight", "math", "search", "notes", "zoom"],
        },
      },
    },
  })
});
\`\`\`
`