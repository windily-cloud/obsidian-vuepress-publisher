<template>
    <div class="setting-item">
      <div class="setting-item-info">
        <div class="setting-item-name">{{props.settingName}}</div>
        <div class="setting-item-description">{{props.settingDesc}}</div>
      </div>
      <div class="setting-item-control">
        <slot></slot>
      </div>
    </div>
</template>
  
<script setup lang='ts'>
const props = defineProps<{
  settingName?: string
  settingDesc?: string
}>()
</script>
  
<style>
  
</style>