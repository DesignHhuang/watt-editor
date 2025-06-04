<template>
  <div class="examples">
    <div class="box">
      <watt-editor ref="editorRef" v-bind="options" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { shortId } from '@/utils/short-id'
import Mentions from './mentions.vue'

const editorRef = $ref(null)
const options = $ref({
  locale: 'en-US',
  toolbar: {
    defaultMode: 'classic',
  },
  page: {
    defaultPadding: '10px',
  },
  document: {
    title: 'text',
    content: '',
    characterLimit: 10000,
  },
  cdnUrl: 'https://oss.wattsonic.com/wattteam/svgs',
  file: {},
  users: [
    {
      id: 'umodoc',
      label: 'Umo Team',
      position: 'developer',
      avatar: '',
    },
    { id: 'Cassielxd', label: 'Cassielxd', position: 'developer', avatar: '' },
    {
      id: 'Goldziher',
      label: "Na'aman Hirschfeld",
      position: 'developer',
      avatar: '',
    },
    { id: 'SerRashin', label: 'SerRashin', position: 'developer', avatar: '' },
    { id: 'ChenErik', label: 'ChenErik', position: 'developer', avatar: '' },
    {
      id: 'china-wangxu',
      label: 'china-wangxu',
      position: 'developer',
      avatar: '',
    },
    {
      id: 'Sherman Xu',
      label: 'xuzhenjun130',
      position: 'developer',
      avatar: '',
    },
  ],
  mentionComp: markRaw(Mentions),
  async onFileUpload(file: File & { url?: string }) {
    if (!file) {
      throw new Error('没有找到要上传的文件')
    }
    console.log('onUpload', file)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return {
      id: shortId(),
      url: file.url ?? URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size,
    }
  },
  onFileDelete(id: string, url: string) {
    console.log(id, url)
  },
})
</script>

<style>
html,
body {
  padding: 0;
  margin: 0;
}
.examples {
  margin: 20px;
  display: flex;
  height: calc(100vh - 40px);
}
.box {
  border: solid 1px #ddd;
  box-sizing: border-box;
  position: relative;
  width: 100%;
  max-height: 200px;
  border-radius: 12px;
  overflow: hidden;
}

html,
body {
  height: 100vh;
  overflow: hidden;
}
</style>
