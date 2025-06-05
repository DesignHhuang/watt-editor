<template>
  <div class="examples">
    <div class="box">
      <watt-editor ref="editorRef" v-bind="options" />
    </div>
    <div @click="clear">clear</div>
    <div @click="selectFile">select file</div>

    <!-- <div class="box">
      <watt-editor ref="editorRef" v-bind="readOlnyEditorOptions(content2)" />
    </div>
    <div @click="clear">clear</div> -->
  </div>
</template>

<script setup lang="ts">
import { shortId } from '@/utils/short-id'
import Mentions from './mentions.vue'

/* const content1 = ref('111111')
const content2 = ref('222222') */

const readOlnyEditorOptions: any = (content: string) => ({
  locale: 'en-US',
  page: { defaultPadding: '10px' },
  toolbar: {
    defaultMode: 'hidden',
  },
  document: {
    title: 'document',
    content: content,
    characterLimit: 12000,
    readOnly: true,
  },
  cdnUrl: 'https://oss.wattsonic.com/wattteam/svgs',
  file: {},
  users: [],
})

const editorRef = $ref(null)
const options = ref({
  locale: 'en-US',
  toolbar: {
    defaultMode: 'classic',
  },
  page: {
    defaultPadding: '10px',
    defaultBackground: 'transparent',
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
  ],
  mentionComp: markRaw(Mentions),
  async onFileUpload(file: File & { url?: string }) {
    if (!file) {
      throw new Error('没有找到要上传的文件')
    }
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return {
      id: shortId(),
      url: file.url ?? URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size,
    }
  },
  onFileDelete(id: string, url: string) {},
})

const clear = () => {
  //editorRef.clearContent()
  //console.log(editorRef.getHTML())
  /* editorRef.insertBlockquoteWithText(
    '<blockquote contenteditable="false" class="readonly-blockquote"><p>test mention someone on reply text </p><p><span class="umo-node-mention" data-type="mention" id="1717435295271038978" label="Dr. Hannes F.  Jakob" position="CEO">@Dr. Hannes F.  Jakob</span></p></blockquote><p><span class="umo-node-mention" data-type="mention" id="1717435295271038978" label="Dr. Hannes F.  Jakob" position="CEO">@Dr. Hannes F.  Jakob</span></p>',
  ) */
  console.log(options.value)
}

const selectFile = () => {
  editorRef.selectFile()
}
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
  flex-direction: column;
}
.box {
  border: solid 1px #ddd;
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
}

html,
body {
  height: 100vh;
  overflow: hidden;
}
</style>
