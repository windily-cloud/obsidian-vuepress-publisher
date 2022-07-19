import Publisher from '../processor/publisher';

const settings = {
    publishFolder: 'Vocabulary',
    publishKey: 'publish',
    githubRepo: 'jerrywcy/jerrywcy.github.io',
    githubSSHKey: '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',
    githubVuepressConfigFile: '',
    giteeVuepressConfigFile: '',
};

const publisher = new Publisher(settings, 'github');

test('Validate github repo', async () => {
    expect(await publisher.validateGitHubRepo()).toBe(true);
});

// test("Github file exist", async ()=>{
//   expect(await publisher.isGithubFileExist("no-exists.md")).toBe(false)
//   expect(await publisher.isGithubFileExist("README.md")).toBe(true)
// })

// test("Create update and delete github file", async ()=>{
//   expect(await publisher.createGithubFile("This is a test file", "test.md")).toBe("Created test.md")
//   expect(await publisher.updateGithubFile("This is new content", "test.md")).toBe("Updated test.md")
//   expect(await publisher.deleteGithubFile( "test.md")).toBe("Deleted test.md")
// })
