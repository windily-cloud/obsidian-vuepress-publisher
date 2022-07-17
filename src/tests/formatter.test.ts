import Formatter from "../processor/formatter";

const settings = {
  publishFolder: "docs",
  publishKey: "publish",
  githubRepo: "",
  githubSSHKey: "",
  githubVuepressConfigFile: "",
  giteeVuepressConfigFile: ""
};

const formatter = new Formatter(settings)


//wiki links
//也有两种方式，一种是文件与文件间的相对路径，另一种是从docs出发的路径。我觉得第二种方式更好一点，ob能直接返回根路径，处理下就能用

test("formatter assets links", ()=>{
  const getFirstLinkpathDest = ()=>"obsidian/docs/fileFolder/file.md"

  expect(formatter.replaceWikiLinks("[[file]]", getFirstLinkpathDest)).toBe("[file](docs/fileFolder/file.md)")
  expect(formatter.replaceWikiLinks("#fewfwe\n- [[file]]\nfewf", getFirstLinkpathDest)).toBe("#fewfwe\n- [file](docs/fileFolder/file.md)fewf")
})
//assets links
//vuepress图片路径和config里的base,dirFolder有关，如docs/assets/image.png, 如果base为/obsidian, 则路径为[image](/base/dirFolder/assets/image.png),
//我们默认为最短路径,所以图片默认都传到.vuepress/public路径下，暂时不支持自定义

test("formatter assets links", ()=>{

  expect(formatter.replaceAssetsLinks(`![[test.png]]`)).toBe(`[test](/test.png)`)
  expect(formatter.replaceAssetsLinks(`![[../../assets/test.png]]`)).toBe(`[test](/test.png)`)
  expect(formatter.replaceAssetsLinks(`![](assets/test.png)`)).toBe(`[test](/test.png)`)
})


//admonition
//两种类型，一种有标题，一种没标题
test("formatter admonition", () => {
  const admonitionInfo = `\`\`\`ad-info
  title: testTitle
  test
  \`\`\``

  const admonitionTip = `\`\`\`ad-tip
  test
  \`\`\``

  expect(formatter.replaceAdmonition(admonitionInfo)).toBe(`::: info testTitle
  test
  :::
  `)

  expect(formatter.replaceAdmonition(admonitionTip)).toBe(`::: tip
  test
  :::
  `)
})

//chart