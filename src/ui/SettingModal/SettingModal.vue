<template>
    <div class="vuepress-setting-container">
        <div class="vuepress-setting-header">
            <div class="vuepress-setting-header-item" 
                v-for="(settingItem, index) in settingItems" 
                :key="settingItem" 
                :class="{active: activeClass === index ? true : false}" 
                @click="handleActive(index)">
                {{(t(settingItem) as string)}}
            </div>
        </div>
        <div class="vuepress-setting-main">
            <!-- General settings -->
            <div class="vuepress-setting-general" v-if="activeClass === 0">
                <SettingItem :setting-name="(t('publishFolder') as string)" :setting-desc="(t('publishFolderDesc') as string)">
                    <input type="text" :value="settings['publishFolder']" @change="handleSaveSettings($event, 'publishFolder')">
                </SettingItem>
                <SettingItem :setting-name="(t('publishKey') as string)" :setting-desc="(t('publishKeyDesc') as string)">
                    <input type="text" placeholder="publish" :value="settings['publishKey']" @change="handleSaveSettings($event, 'publishKey')">
                </SettingItem>
                <!-- <SettingItem :setting-name="(t('assetsFolder') as string)" :setting-desc="(t('assetsFolderDesc') as string)">
                    <input type="text" placeholder="docs/images" :value="settings['assetsFolder']" @change="handleSaveSettings($event, 'assetsFolder')">
                </SettingItem> -->
                <SettingItem :setting-name="(t('strictLineBreak') as string)" :setting-desc="(t('strictLineBreakDesc') as string)">
                    <div class="checkbox-container" :class="{'is-enabled': settings.strictLineBreak}" @click='handleSaveBooleanSettings("strictLineBreak")'>
                        <input type="checkbox" v-model="settings.strictLineBreak"/>
                    </div>
                </SettingItem>
                <SettingItem :setting-name="(t('excludeFolder') as string)" :setting-desc="(t('excludeFolderDesc') as string)">
                    <textarea  placeholder="folder1,folder2" :value="settings['excludeFolder']" @change="handleSaveSettings($event, 'excludeFolder')"/>
                </SettingItem>
            </div>

            <!-- Github settings -->
            <div class="vuepress-setting-blog" v-if="activeClass === 1">
                <h3>{{t("basicSetting")}}</h3>
                <SettingItem :setting-name="(t('githubRepo') as string)" :setting-desc="(t('githubRepoDesc') as string)">
                    <input type="text" :value="settings['githubRepo']" @change="handleSaveSettings($event, 'githubRepo')">
                </SettingItem>
                <SettingItem :setting-name="(t('githubSSHKey') as string)" :setting-desc="(t('githubSSHKeyDesc') as string)">
                    <input type="text" :value="settings['githubSSHKey']" @change="handleSaveSettings($event, 'githubSSHKey')">
                </SettingItem>
                <h3>{{t("blogSetting")}}</h3>
                <SettingItem :setting-name="(t('vuepressConfigFile') as string)" :setting-desc="(t('vuepressConfigFileDesc') as string)">
                    <button :aria-label="(t('newConfigTip') as string)" v-if="!settings['githubVuepressConfigFile']" @click="handleCreateDefaultVuepressConfigFile('github')">+</button>
                    <input type="text" v-model="settings['githubVuepressConfigFile']" @change="handleSaveSettings($event, 'githubVuepressConfigFile')">
                    <button v-if="settings['githubVuepressConfigFile']" @click="handleOpenSettingFile(settings['githubVuepressConfigFile'] as string)">open</button>
                </SettingItem>
                <SettingItem :setting-name="(t('githubHomepageFile') as string)" :setting-desc="(t('githubHomepageFileDesc') as string)">
                    <button :aria-label="(t('newConfigTip') as string)" v-if="!settings['githubHomepageFile']" @click="handleCreateDefaultHomepageFile('github')">+</button>
                    <input type="text" v-model="settings['githubHomepageFile']" @change="handleSaveSettings($event, 'githubHomepageFile')">
                    <button v-if="settings['githubHomepageFile']" @click="handleOpenSettingFile(settings['githubHomepageFile'] as string)">open</button>
                </SettingItem>
            </div>

            <!-- Gitee settings -->
            <div class="vuepress-setting-theme" v-if="activeClass === 2">
                <h3>{{t("basicSetting")}}</h3>
                <SettingItem :setting-name="(t('giteeRepo') as string)" :setting-desc="(t('giteeRepoDesc') as string)">
                    <input type="text" :value="settings['giteeRepo']" @change="handleSaveSettings($event, 'giteeRepo')">
                </SettingItem>
                <SettingItem :setting-name="(t('giteeSSHKey') as string)" :setting-desc="(t('giteeSSHKeyDesc') as string)">
                    <input type="text" :value="settings['giteeSSHKey']" @change="handleSaveSettings($event, 'giteeSSHKey')">
                </SettingItem>
                <h3>{{t("blogSetting")}}</h3>
                <SettingItem :setting-name="(t('vuepressConfigFile') as string)" :setting-desc="(t('vuepressConfigFileDesc') as string)">
                    <button :aria-label="(t('newConfigTip') as string)" v-if="!settings.giteeVuepressConfigFile" @click="handleCreateDefaultVuepressConfigFile('gitee')">+</button>
                    <input type="text" v-model="settings.giteeVuepressConfigFile" @change="handleSaveSettings($event, 'giteeVuepressConfigFile')">
                    <button v-if="settings.giteeVuepressConfigFile" @click="handleOpenSettingFile(settings['giteeVuepressConfigFile'] as string)">open</button>
                </SettingItem>
                <SettingItem :setting-name="(t('giteeHomepageFile') as string)" :setting-desc="(t('giteeHomepageFileDesc') as string)">
                    <button :aria-label="(t('newConfigTip') as string)" v-if="!settings['giteeHomepageFile']" @click="handleCreateDefaultHomepageFile('gitee')">+</button>
                    <input type="text" v-model="settings['giteeHomepageFile']" @change="handleSaveSettings($event, 'giteeHomepageFile')">
                    <button v-if="settings['giteeHomepageFile']" @click="handleOpenSettingFile(settings['giteeHomepageFile'] as string)">open</button>
                </SettingItem>
            </div>
        </div>
    </div>
</template>
  
<script setup lang='ts'>
import {ref, getCurrentInstance, reactive} from 'vue'
import t from '../../i18n'
import {DefaultVuepressConfigContent} from '../../config/DefaultVuepressConfig'
import SettingItem from './SettingItem.vue'
import type VuepressPublisher from '../../main';
import { Notice } from 'obsidian';
//init
const plugin = getCurrentInstance()?.appContext.config.globalProperties.plugin as VuepressPublisher
if(!plugin){
    new Error("Vue app can't get plugin instance!")
}

//variable
const settingItems:Array<string> = ["generalSetting", "githubSetting", "giteeSetting"]
const activeClass  = ref(0)
const settings = reactive(plugin.settings)


//method
function handleActive(index:number){
    activeClass.value = index
}

async function handleSaveSettings(event: Event, setting:string){
    plugin.settings[setting] = (event.target as HTMLInputElement).value
    settings[setting] = (event.target as HTMLInputElement).value
    await plugin.saveSettings()
}

async function handleSaveBooleanSettings(setting:string){
    settings[setting] = !settings[setting]
    plugin.settings[setting] = settings[setting]
    await plugin.saveSettings()
}

async function handleOpenSettingFile(fileName:string){
   const tfile =  app.metadataCache.getFirstLinkpathDest(fileName, "")
   if(!tfile){
        new Notice(t("cannotFindSettingFile") as string)
        return
    }
   await app.workspace.getLeaf(false).openFile(tfile)
   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
   //@ts-ignore
   app.workspace.closeables[0].close()
}

async function handleCreateDefaultVuepressConfigFile(blog: "github" | "gitee"){
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    await app.fileManager.createNewMarkdownFile('', `vuepress-${blog}-config`, DefaultVuepressConfigContent)
    plugin.settings[`${blog}VuepressConfigFile`] = `vuepress-${blog}-config`
    await plugin.saveSettings()
    handleOpenSettingFile(plugin.settings[`${blog}VuepressConfigFile`] as string)
}

async function handleCreateDefaultHomepageFile(blog: "github" | "gitee"){
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    await app.fileManager.createNewMarkdownFile('', `vuepress-${blog}-homepage`, DefaultVuepressConfigContent)
    plugin.settings[`${blog}HomepageFile`] = `vuepress-${blog}-homepage`
    await plugin.saveSettings()
    handleOpenSettingFile(plugin.settings[`${blog}HomepageFile`] as string)
}

</script>
  
<style>
.vuepress-setting-header{
    display: flex;
    flex-direction: row;
}
.vuepress-setting-header .vuepress-setting-header-item{
    padding: 0.5em 1em;
}

.vuepress-setting-header .vuepress-setting-header-item:hover{
    border-bottom: 1px solid var(--interactive-accent);
}

.vuepress-setting-header .vuepress-setting-header-item.active{
    background-color: var(--background-primary);
    color: var(--text-normal);
}
</style>