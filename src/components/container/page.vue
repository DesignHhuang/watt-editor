<template>
  <div
    class="umo-page-container"
    :style="{ backgroundColor: pageOptions.background }"
  >
    <div
      class="umo-zoomable-container umo-scrollbar"
      :style="{ padding: pageOptions.padding }"
    >
      <div class="umo-page-content">
        <div class="umo-page-node-content">
          <editor>
            <template #bubble_menu="props">
              <slot name="bubble_menu" v-bind="props" />
            </template>
          </editor>
        </div>
      </div>
    </div>
    <t-image-viewer
      v-model:visible="imageViewer.visible"
      v-model:index="currentImageIndex"
      :images="previewImages"
      @close="imageViewer.visible = false"
    />
  </div>
</template>

<script setup lang="ts">
const container = inject('container')
const imageViewer = inject('imageViewer')
const pageOptions = inject('page')

// 图片预览
let previewImages = $ref<string[]>([])
let currentImageIndex = $ref<number>(0)

watch(
  () => imageViewer.value.visible,
  async (visible: boolean) => {
    if (!visible) {
      previewImages = []
      currentImageIndex = 0
      return
    }
    await nextTick()
    const images = document.querySelectorAll(
      `${container} .umo-page-node-content img[src]:not(.umo-icon)`,
    )
    Array.from(images).forEach((image, index) => {
      const src = image.getAttribute('src')
      const nodeId = image.getAttribute('data-id')
      previewImages.push(src)
      if (nodeId === imageViewer.value.current) {
        currentImageIndex = index
      }
    })
  },
)
</script>

<style lang="less" scoped>
.umo-page-container {
  height: 100%;
  display: flex;
  position: relative;
}

.umo-zoomable-container {
  flex: 1;
  scroll-behavior: smooth;
  .umo-page-content {
    flex: 1;
    transform-origin: 0 0;
    box-sizing: border-box;
    display: flex;
    position: relative;
    box-sizing: border-box;
    overflow: visible !important;
    display: flex;
    flex-direction: column;
    word-break: break-all;
    max-width: 100%;

    [contenteditable] {
      outline: none;
    }
  }
}

.umo-page-content > * {
  max-width: 100%;
}

.umo-page-node-content {
  position: relative;
  box-sizing: border-box;
  flex-shrink: 1;
  height: 100%;
}
</style>
