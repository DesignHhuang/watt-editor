<template>
  <t-dropdown
    :attach="`${container} .umo-page-container`"
    placement="bottom-right"
    overlay-class-name="umo-block-menu-dropdown"
    :max-height="320"
    trigger="click"
    :destroy-on-close="false"
    :popup-props="popupProps"
  >
    <menus-button
      class="umo-block-menu-button"
      :menu-active="menuActive"
      ico="block-add"
      hide-text
    />
    <t-dropdown-menu>
      <t-dropdown-item class="umo-block-menu-group-name" disabled>
        {{ t('blockMenu.insert') }}
      </t-dropdown-item>
      <t-dropdown-item v-if="!disableItem('image')">
        <menus-toolbar-insert-image :huge="false" :tooltip="false" />
      </t-dropdown-item>
      <t-dropdown-item v-if="!disableItem('video')">
        <menus-toolbar-insert-video :huge="false" :tooltip="false" />
      </t-dropdown-item>
      <t-dropdown-item v-if="!disableItem('file')">
        <menus-toolbar-insert-file :huge="false" :tooltip="false" />
      </t-dropdown-item>
      <t-dropdown-item v-if="!disableItem('code-block')">
        <menus-toolbar-insert-code-block
          :huge="false"
          shortcut-text="Ctrl+Alt+C"
          :tooltip="false"
        />
      </t-dropdown-item>
      <t-dropdown-item v-if="!disableItem('callout')">
        <menus-toolbar-insert-callout :huge="false" :tooltip="false" />
      </t-dropdown-item>
      <t-dropdown-item v-if="!disableItem('qrcode')">
        <menus-toolbar-tools-qrcode :huge="false" :tooltip="false" />
      </t-dropdown-item>
      <t-dropdown-item v-if="!disableItem('barcode')">
        <menus-toolbar-tools-barcode :huge="false" :tooltip="false" />
      </t-dropdown-item>
      <t-dropdown-item v-if="!disableItem('signature')">
        <menus-toolbar-tools-signature :huge="false" :tooltip="false" />
      </t-dropdown-item>
    </t-dropdown-menu>
  </t-dropdown>
</template>

<script setup lang="ts">
const emits = defineEmits<{
  dropdownVisible: (visible: boolean) => void
}>()

const container = inject('container')
const editor = inject('editor')
const blockMenu = inject('blockMenu')
const options = inject('options')

let menuActive = $ref(false)
const popupProps = {
  onVisibleChange(visible: boolean) {
    editor.value.commands.focus()
    blockMenu.value = visible
    menuActive = visible
    emits('dropdownVisible', visible)
  },
}

const disableItem = (name: string) => {
  return options.value.toolbar?.disableMenuItems.includes(name)
}
</script>

<style lang="less"></style>
