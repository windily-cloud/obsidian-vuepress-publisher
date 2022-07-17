import Request from './request'
import VuepressPublisher from 'main'
import { Notice} from 'obsidian'
import t from '../i18n'

type PublisherType = "github" | "gitee"

export class HTMLError extends Error {
  code: number;
  text: string;
  constructor(code: number, text: string) {
    super(`Error Code ${code}. ${text}`);
    this.name = `HTML Error`;
    this.code = code;
    this.text = text;
  }
}

export function getGithubRepoInfo(plugin: VuepressPublisher) {
  const service = new Request("github", plugin)

  if (!plugin.settings.githubRepo) {
    new Notice(t("notFoundRepoName") as string)
    return Promise.reject("notFoundRepoName")
  }

  return service.request({
    url: `/repos/${plugin.settings.giteeRepo}`,
    method: "get"
  })
}

export class CloudHandler {
  plugin: VuepressPublisher;
  constructor(plugin: VuepressPublisher) {
    this.plugin = plugin;
  }

  async validateGitHubRepo(repo: string) {
    const github = new Request("github", this.plugin);
    const res = await github.request({
      url: `/repos/${repo}`,
      method: "get"
    })
    if (res.status === 301) { console.log(`Error Code 301. Repository ${repo} is permanently moved.`); }
    if (res.status === 403) { console.log(`Error Code 403. Repository ${repo} belongs to others.`); }
    if (res.status === 404) { console.log(`Error Code 404. Repository ${repo} is not found on GitHub.`); }
    return res.status === 200;
  }

  async validateGiteeRepo(repo: string) {
    const gitee = new Request("gitee", this.plugin);
    const res = await gitee.request({
      url: `/repos/${repo}`,
      method: "get"
    })
    if (res.status === 301) { console.log(`Error Code 301. Repository ${repo} is permanently moved.`); }
    if (res.status === 403) { console.log(`Error Code 403. Repository ${repo} belongs to others.`); }
    if (res.status === 404) { console.log(`Error Code 404. Repository ${repo} is not found on GitHub.`); }
    return res.status === 200;
  }

  async getPublisher(): Promise<PublisherType> {
    const { githubRepo, giteeRepo } = this.plugin.settings;
    if (githubRepo && await this.validateGitHubRepo(githubRepo)) {
      return "github";
    }
    else if (giteeRepo && await this.validateGiteeRepo(githubRepo)) {
      return "gitee";
    }
    return Promise.reject("No publisher available");
  }
  async updateFile(content: string, targetPath: string): Promise<void> {
    const publisher = await this.getPublisher();
    if (publisher === "github") {
      await this.updateGitHubFile(content, targetPath);
    }
    else if (publisher === "gitee") {
      await this.updateGiteeFile(content, targetPath);
    }
  }

  async updateGitHubFile(content: string, targetPath: string) {
    const github = new Request("github", this.plugin);
    const { githubRepo: repo } = this.plugin.settings;
    const getContentResult = await github.request({
      url: `/repos/${repo}/contents/${targetPath}`,
      method: "get"
    });
    if (getContentResult.status === 200) {
      const { sha, type } = getContentResult.data;
      if (type !== "file") {
        return Promise.reject("Content already exist and is not a file.");
      }
      const updateContentResult = await github.request({
        url: `/repos/${repo}/contents/${targetPath}`,
        method: "put",
        data: {
          message: `Update ${targetPath}.`,
          content,
          sha
        }
      });
      if (updateContentResult.status !== 201) {
        return Promise.reject(`Error Code ${updateContentResult.status}. ${updateContentResult.statusText}`);
      }
      return;
    }
    else {
      const createContentResult = await github.request({
        url: `/repos/${repo}/contents/${targetPath}`,
        method: "put",
        data: {
          message: `Create ${targetPath}.`,
          content
        }
      });
      if (createContentResult.status !== 201) {
        return Promise.reject(`Error Code ${createContentResult.status}. ${createContentResult.statusText}`);
      }
      return;
    }
  }

  async updateGiteeFile(content: string, targetPath: string) {
    const gitee = new Request("gitee", this.plugin);
    const { giteeRepo: repo } = this.plugin.settings;
    const getContentResult = await gitee.request({
      url: `/repos/${repo}/contents/${targetPath}`,
      method: "get"
    });
    if (getContentResult.status === 200) {
      const { sha, type } = getContentResult.data;
      if (type !== "file") {
        return Promise.reject("Content already exist and is not a file.");
      }
      const updateContentResult = await gitee.request({
        url: `/repos/${repo}/contents/${targetPath}`,
        method: "put",
        data: {
          message: `Update ${targetPath}.`,
          content,
          sha
        }
      });
      if (updateContentResult.status !== 201) {
        return Promise.reject(`Error Code ${updateContentResult.status}. ${updateContentResult.statusText}`);
      }
      return;
    }
    else {
      const createContentResult = await gitee.request({
        url: `/repos/${repo}/contents/${targetPath}`,
        method: "post",
        data: {
          message: `Create ${targetPath}.`,
          content
        }
      });
      if (createContentResult.status !== 201) {
        return Promise.reject(`Error Code ${createContentResult.status}. ${createContentResult.statusText}`);
      }
      return;
    }
  }
  async deleteFile(targetPath: string) {
    const publisher = await this.getPublisher();
    if (publisher === "github") {
      await this.deleteGitHubFile(targetPath);
    }
    else if (publisher === "gitee") {
      await this.deleteGiteeFile(targetPath);
    }
  }

  async deleteGitHubFile(targetPath: string) {
    const github = new Request("github", this.plugin);
    const { githubRepo: repo } = this.plugin.settings;
    const getContentResult = await github.request({
      url: `/repos/${repo}/contents/${targetPath}`,
      method: "get"
    });
    if (getContentResult.status === 200) {
      const { sha, type } = getContentResult.data;
      if (type !== "file") {
        return Promise.reject(`${targetPath}: Content already exist and is not a file.`);
      }
      const updateContentResult = await github.request({
        url: `/repos/${repo}/contents/${targetPath}`,
        method: "delete",
        data: {
          message: `Delete ${targetPath}.`,
          sha
        }
      });
      if (updateContentResult.status !== 201) {
        return Promise.reject(`Error Code ${updateContentResult.status}. ${updateContentResult.statusText}`);
      }
      return;
    }
    else {
      return Promise.reject(`${targetPath}: No such file in GitHub repository!`)
    }
  }

  async deleteGiteeFile(targetPath: string) {
    const gitee = new Request("gitee", this.plugin);
    const { giteeRepo: repo } = this.plugin.settings;
    const getContentResult = await gitee.request({
      url: `/repos/${repo}/contents/${targetPath}`,
      method: "delete"
    });
    if (getContentResult.status === 200) {
      const { sha, type } = getContentResult.data;
      if (type !== "file") {
        return Promise.reject(`${targetPath}: Content already exist and is not a file.`);
      }
      const updateContentResult = await gitee.request({
        url: `/repos/${repo}/contents/${targetPath}`,
        method: "delete",
        data: {
          message: `Delete ${targetPath}.`,
          sha
        }
      });
      if (updateContentResult.status !== 201) {
        return Promise.reject(`Error Code ${updateContentResult.status}. ${updateContentResult.statusText}`);
      }
      return;
    }
    else {
      return Promise.reject(`${targetPath}: No such file in Gitee Repository!`);
    }
  }
}