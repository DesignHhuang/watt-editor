<template>
  <div class="examples">
    <div class="box">
      <watt-editor ref="editorRef" v-bind="options" />
    </div>
    <div>不可编辑数据</div>
    <div class="box">
      <watt-editor ref="editorRef" v-bind="readOlnyEditorOptions(content2)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { shortId } from '@/utils/short-id'
import Mentions from './mentions.vue'

//const content1 = ref('111111')
const content2 = ref(
  '<p>试一下新增一些东西，比如下面的</p><span><img vnode="true" type="image/png" name="plant-pic.png" id="4mh4z0f9" src="https://oss.wattsonic.com/wattteam_test/2025-06-04/cb02024e-c999-c334-c136-9532f99eff65/plant-pic.png" width="160" height="100" left="0" top="0" draggable="false" rotatable="false" equalproportion="true" flipx="false" flipy="false" uploaded="true" error="false" previewtype="image"></span><span><img vnode="true" type="image/jpeg" name="售后。3.jpg" id="nawc8y67" src="https://oss.wattsonic.com/wattteam_test/2025-06-06/55655ea3-6d39-b3ee-df16-88f9ce94622a/售后。3.jpg" width="160" height="100" left="0" top="0" draggable="false" rotatable="false" equalproportion="true" flipx="false" flipy="false" uploaded="true" error="false" previewtype="image"></span><file vnode="true" id="vknlf56y" url="https://oss.wattsonic.com/wattteam_test/2025-06-06/9f04f142-510a-10aa-0f34-877b9361c1c3/工单模板.xlsx" name="工单模板.xlsx" type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" uploaded="true" previewtype="file" height="200"></file><file vnode="true" id="xl32yidg" url="https://oss.wattsonic.com/wattteam_test/2025-06-06/82099b4d-8fec-ac1d-9948-31ab74c99ef6/最大视在功率测试用例.docx" name="最大视在功率测试用例.docx" type="application/vnd.openxmlformats-officedocument.wordprocessingml.document" uploaded="true" previewtype="file" height="200"></file>',
)

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
