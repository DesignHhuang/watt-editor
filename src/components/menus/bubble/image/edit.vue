<template>
  <menus-toolbar-tools-qrcode v-if="type === 'qrcode'" :content="content" />
  <menus-toolbar-tools-barcode v-if="type === 'barcode'" :content="content" />
</template>

<script setup lang="ts">
const editor = inject('editor')
const type = computed(() => {
  return editor.value?.getAttributes('image').type
})
const content = computed(() => {
  return editor.value?.getAttributes('image').content
})
</script>
