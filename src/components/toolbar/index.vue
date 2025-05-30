<template>
  <div v-if="$toolbar.show" class="umo-toolbar-container">
    <toolbar-classic
      v-if="$toolbar.mode === 'classic'"
      :menus="toolbarMenus"
      :current-menu="currentMenu"
      @menu-change="menuChange"
    >
      <template
        v-for="item in options.toolbar?.menus"
        :key="item"
        #[`toolbar_${item}`]="props"
      >
        <slot :name="`toolbar_${item}`" v-bind="props" />
      </template>
    </toolbar-classic>
  </div>
</template>

<script setup lang="ts">
const emits = defineEmits(['menu-change'])

const options = inject('options')
const $toolbar = useState('toolbar', options)

// 工具栏菜单
const defaultToolbarMenus = [
  { label: t('toolbar.base'), value: 'base' },
  { label: t('toolbar.insert'), value: 'insert' },
  { label: t('toolbar.tools'), value: 'tools' },
  { label: t('toolbar.export'), value: 'export' },
]
let toolbarMenus = defaultToolbarMenus
if (options.value.toolbar?.menus) {
  toolbarMenus = options.value.toolbar?.menus.map(
    (item: any) => defaultToolbarMenus.filter((menu) => menu.value === item)[0],
  )
}
let currentMenu = $ref(toolbarMenus[0].value)
const menuChange = (menu: string) => {
  currentMenu = menu
  emits('menu-change', menu)
}
</script>

<style lang="less" scoped>
.umo-toolbar-container {
  display: flex;
  justify-content: space-between;
  user-select: none;
  border-bottom: solid 1px var(--umo-border-color);
  position: relative;
}
</style>
