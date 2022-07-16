import Request from './request'
import VuepressPublisher from 'main'
import { Notice, TFile } from 'obsidian'
import t from '../i18n'

type PublisherType = "github" | "gitee"

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

  async getPublisher(): Promise<PublisherType> {
    return Promise.resolve("github");
  }
  async updateFile(file: TFile, targetPath: string) {

  }
  async deleteFile(targetPath: string) {

  }
}