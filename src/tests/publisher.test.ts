import Publisher from "../processor/publisher";

const settings = {
  publishFolder: "docs",
  publishKey: "publish",
  githubRepo: "windily-cloud/obsidian-publish",
  githubSSHKey: "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",
  githubVuepressConfigFile: "",
  giteeVuepressConfigFile: ""
};

const publisher = new Publisher(settings, "github")

test("Validate github repo", async () => {
  expect(await publisher.validateGitHubRepo()).toBe(true)
})

// test("Github file exist", async ()=>{
//   expect(await publisher.isGithubFileExist("no-exists.md")).toBe(false)
//   expect(await publisher.isGithubFileExist("README.md")).toBe(true)
// })

// test("Create update and delete github file", async ()=>{
//   expect(await publisher.createGithubFile("This is a test file", "test.md")).toBe("Created test.md")
//   expect(await publisher.updateGithubFile("This is new content", "test.md")).toBe("Updated test.md")
//   expect(await publisher.deleteGithubFile( "test.md")).toBe("Deleted test.md")
// })

