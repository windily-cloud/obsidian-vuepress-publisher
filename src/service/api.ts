import Request from './request'
import VuepressPublisher from 'main'
import { Notice } from 'obsidian'
import t from '../i18n'

export function getGithubRepoInfo(plugin: VuepressPublisher) {
  const service = new Request("github", plugin)

  if (!plugin.settings.github.repoName) {
    new Notice(t("notFoundRepoName") as string)
    return Promise.reject("notFoundRepoName")
  }

  return service.request({
    url: `/repos/${plugin.settings.github.repoName}`,
    method: "get"
  })
}
