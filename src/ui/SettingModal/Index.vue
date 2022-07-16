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
            <div class="vuepress-setting-general" v-if="activeClass === 0">
                <SettingItem :setting-name="(t('publishFolder') as string)" setting-desc="">
                    <input type="text" :value="plugin.settings['publishFolder']" @change="handleSaveSettings($event, 'publishFolder')">
                </SettingItem>
                <SettingItem :setting-name="(t('publishKey') as string)" setting-desc="">
                    <input type="text" placeholder="publish" :value="plugin.settings['publishKey']" @change="handleSaveSettings($event, 'publishKey')">
                </SettingItem>
                <SettingItem :setting-name="(t('excludeFolder') as string)" setting-desc="">
                    <textarea  placeholder="folder1,folder2" :value="plugin.settings['excludeFolder']" @change="handleSaveSettings($event, 'excludeFolder')"/>
                </SettingItem>
                <SettingItem :setting-name="(t('excludeFile') as string)" setting-desc="">
                    <textarea type="text" placeholder="file1,file2" :value="plugin.settings['excludeFile']" @change="handleSaveSettings($event, 'excludeFile')"/>
                </SettingItem>
            </div>

            <div class="vuepress-setting-blog" v-if="activeClass === 1">
                <h3>{{t("basicSetting")}}</h3>
                <SettingItem :setting-name="(t('githubRepo') as string)" setting-desc="">
                    <input type="text" :value="plugin.settings['githubRepo']" @change="handleSaveSettings($event, 'githubRepo')">
                </SettingItem>
                <SettingItem :setting-name="(t('githubSSHKey') as string)" setting-desc="">
                    <input type="text" :value="plugin.settings['githubSSHKey']" @change="handleSaveSettings($event, 'githubSSHKey')">
                </SettingItem>
                <h3>{{t("blogSetting")}}</h3>
                <SettingItem :setting-name="(t('vuepressConfigFile') as string)" setting-desc="">
                    <button :aria-label="(t('newConfigTip') as string)" v-if="!plugin.settings['githubVuepressConfigFile']" @click="handleCreateDefaultVuepressConfigFile('github')">+</button>
                    <input type="text" :value="plugin.settings['githubVuepressConfigFile']" @change="handleSaveSettings($event, 'githubVuepressConfigFile')">
                    <button v-if="plugin.settings['githubVuepressConfigFile']" @click="handleOpenSettingFile(plugin.settings['githubVuepressConfigFile'])">open</button>
                </SettingItem>
            </div>

            <div class="vuepress-setting-theme" v-if="activeClass === 2">
                <h3>{{t("basicSetting")}}</h3>
                <SettingItem :setting-name="(t('giteeRepo') as string)" setting-desc="">
                    <input type="text" :value="plugin.settings['giteeRepo']" @change="handleSaveSettings($event, 'giteeRepo')">
                </SettingItem>
                <SettingItem :setting-name="(t('giteeSSHKey') as string)" setting-desc="">
                    <input type="text" :value="plugin.settings['giteeSSHKey']" @change="handleSaveSettings($event, 'giteeSSHKey')">
                </SettingItem>
                <h3>{{t("blogSetting")}}</h3>
                <SettingItem :setting-name="(t('vuepressConfigFile') as string)" setting-desc="">
                    <button :aria-label="(t('newConfigTip') as string)" v-if="!plugin.settings['giteeVuepressConfigFile']" @click="handleCreateDefaultVuepressConfigFile('gitee')">+</button>
                    <input type="text" :value="plugin.settings['giteeVuepressConfigFile']" @change="handleSaveSettings($event, 'giteeVuepressConfigFile')">
                    <button v-if="plugin.settings['giteeVuepressConfigFile']" @click="handleOpenSettingFile(plugin.settings['giteeVuepressConfigFile'])">open</button>
                </SettingItem>
            </div>
        </div>
    </div>
</template>
  
<script setup lang='ts'>
import {ref, getCurrentInstance, reactive, computed} from 'vue'
import t from '../../i18n'
import {DefaultVuepressConfigContent} from '../../config/DefaultVuepressConfig'
import SettingItem from './SettingItem.vue'
import type VuepressPublisher from '../../main';
//init
const plugin = getCurrentInstance()?.appContext.config.globalProperties.plugin as VuepressPublisher
if(!plugin){
    new Error("Vue app can't get plugin instance!")
}

//variable
const settingItems:Array<string> = ["generalSetting", "githubSetting", "giteeSetting"]
const activeClass  = ref(0)


//method
function handleActive(index){
    activeClass.value = index
}

async function handleSaveSettings(event, setting){
    plugin.settings[setting] = event.target.value
    await plugin.saveSettings()
}

async function handleOpenSettingFile(fileName){
   const tfile =  app.metadataCache.getFirstLinkpathDest(fileName, "")
   if(!tfile){return}
   await app.workspace.getLeaf(false).openFile(tfile)
   //@ts-ignore
   app.workspace.closeables[0].close()
}

async function handleCreateDefaultVuepressConfigFile(blog: "github" | "gitee"){
    //@ts-ignore
    await app.fileManager.createNewMarkdownFile('', `vuepress-${blog}-config`, DefaultVuepressConfigContent)
    plugin.settings[`${blog}VuepressConfigFile`] = `vuepress-${blog}-config`
    await plugin.saveSettings()
    handleOpenSettingFile(plugin.settings[`${blog}VuepressConfigFile`])
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