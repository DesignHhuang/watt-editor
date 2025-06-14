<template>
  <toolbar-scrollable ref="scrollableRef" class="umo-scrollable-container">
    <div class="umo-classic-menu">
      <div v-if="menus.length > 1" class="umo-virtual-group">
        <t-select
          v-if="selectVisible"
          v-model="currentMenu"
          :popup-props="{
            destroyOnClose: true,
            attach: container,
          }"
          size="small"
          auto-width
          borderless
          @change="toggoleMenu"
        >
          <template #prefixIcon>
            <icon name="menu" />
          </template>
          <t-option
            v-for="item in menus"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </t-select>
      </div>
      <template v-if="currentMenu === 'base'">
        <div class="umo-virtual-group">
          <menus-toolbar-base-undo />
          <menus-toolbar-base-redo />
        </div>
        <div class="umo-virtual-group">
          <menus-toolbar-base-bold />
          <menus-toolbar-base-italic />
          <menus-toolbar-base-underline />
          <menus-toolbar-base-strike />
        </div>
        <div class="umo-virtual-group">
          <menus-toolbar-base-ordered-list
            v-if="!disableItem('ordered-list')"
          />
          <menus-toolbar-base-bullet-list v-if="!disableItem('bullet-list')" />
          <menus-toolbar-base-task-list v-if="!disableItem('task-list')" />
          <menus-toolbar-base-align-dropdown />
          <menus-toolbar-base-quote v-if="!disableItem('quote')" />
          <menus-toolbar-base-code v-if="!disableItem('code')" />
        </div>
        <div class="virtual-group is-slot">
          <slot name="toolbar_base" toolbar-mode="classic" />
        </div>
      </template>
      <template v-if="currentMenu === 'insert'">
        <div class="umo-virtual-group">
          <menus-toolbar-insert-image v-if="!disableItem('image')" />
          <menus-toolbar-insert-video v-if="!disableItem('video')" />
          <menus-toolbar-insert-file v-if="!disableItem('file')" />
          <menus-toolbar-insert-code-block v-if="!disableItem('code-block')" />
          <menus-toolbar-insert-columns v-if="!disableItem('columns')" />
          <menus-toolbar-insert-mention v-if="!disableItem('mention')" />
        </div>
        <div class="virtual-group is-slot">
          <slot name="toolbar_insert" toolbar-mode="classic" />
        </div>
      </template>
    </div>
  </toolbar-scrollable>
</template>

<script setup lang="ts">
import { withSuppress } from '@/utils/functional'

const props = defineProps<{
  menus: {
    value: string
    label: string
  }[]
  currentMenu: string
}>()

const { selectVisible } = useSelect()

const emits = defineEmits(['menu-change'])

const container = inject('container')
const options = inject('options')
const disableItem = (name: string) => {
  return options.value.toolbar?.disableMenuItems.includes(name)
}

// eslint-disable-next-line vue/no-dupe-keys
let currentMenu = $ref('')
watch(
  () => props.currentMenu,
  withSuppress(async (val) => {
    currentMenu = val
    await nextTick()
    scrollableRef?.update()
  }),
  { immediate: true },
)
const scrollableRef = $ref<{ update: () => void }>()
const toggoleMenu = async (menu: string) => {
  emits('menu-change', menu)
  await nextTick()
  scrollableRef?.update()
}
</script>

<style lang="less" scoped>
.umo-scrollable-container {
  padding: 4px 10px;
}
.umo-classic-menu {
  display: flex;
  align-items: center;
  flex: 1;
  .umo-virtual-group {
    display: flex;
    align-items: center;
    &:empty {
      display: none;
    }
    &:not(:last-child),
    &.is-slot {
      &::before {
        content: '';
        display: block;
        height: 18px;
        width: 1px;
        background-color: var(--umo-border-color-light);
        margin: 0 10px;
      }
    }
    &:first-child::before {
      display: none;
    }
    :deep(.umo-menu-button .umo-button--shape-square) {
      .umo-icon {
        font-size: 14px;
      }
    }
    &-row {
      display: flex;
    }
  }
}
</style>
