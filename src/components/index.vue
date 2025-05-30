<template>
  <t-config-provider
    :key="options.editorKey"
    :global-config="{
      ...localeConfig[locale],
      classPrefix: 'umo',
    }"
  >
    <div
      :id="container.substr(1)"
      class="umo-editor-container"
      :class="{
        'toolbar-classic': isRecord($toolbar) && $toolbar.mode === 'classic',
      }"
      :style="{
        height: options.height,
        zIndex: 'unset',
      }"
    >
      <header class="umo-toolbar">
        <toolbar
          :key="toolbarKey"
          @menu-change="(event: any) => emits('menuChange', event)"
        >
          <template
            v-for="item in options.toolbar?.menus"
            :key="item"
            #[`toolbar_${item}`]="slotProps"
          >
            <slot :name="`toolbar_${item}`" v-bind="slotProps" />
          </template>
        </toolbar>
      </header>
      <main class="umo-main">
        <container-page>
          <template #bubble_menu="slotProps">
            <slot name="bubble_menu" v-bind="slotProps" />
          </template>
        </container-page>
      </main>
    </div>
  </t-config-provider>
</template>

<script setup lang="ts">
import type { FocusPosition } from '@tiptap/core'
import {
  isBoolean,
  isNumber,
  isRecord,
  isString,
} from '@tool-belt/type-predicates'
import domToImage from 'dom-to-image-more'
import type {
  DialogOptions,
  GlobalConfigProvider,
  MessageOptions,
} from 'tdesign-vue-next'
import enConfig from 'tdesign-vue-next/esm/locale/en_US'
import cnConfig from 'tdesign-vue-next/esm/locale/zh_CN'

import { getSelectionNode, getSelectionText } from '@/extensions/selection'
import { i18n } from '@/i18n'
import { propsOptions } from '@/options'
import type { PageOption, UmoEditorOptions } from '@/types'
import type { DocumentOptions, SupportedLocale } from '@/types'
import { contentTransform } from '@/utils/content-transform'
import { getOpitons } from '@/utils/options'
import { shortId } from '@/utils/short-id'

import ruConfig from '../locales/tdesign/ru-RU'

const { toBlob, toJpeg, toPng } = domToImage

defineOptions({ name: 'UmoEditor' })

// Props and Emits
const props = defineProps(propsOptions)
const emits = defineEmits([
  'beforeCreate',
  'created',
  'changed',
  'changed:selection',
  'changed:transaction',
  'changed:menu',
  'changed:toolbar',
  'changed:pageSize',
  'changed:pageOrientation',
  'changed:pageMargin',
  'changed:pageBackground',
  'changed:pageShowToc',
  'changed:pagePreview',
  'changed:pageZoom',
  'changed:pageWatermark',
  'changed:locale',
  'changed:theme',
  'contentError',
  'focus',
  'blur',
  'saved',
  'destroy',
  'menuChange',
])

// state Setup
const container = $ref(`#umo-editor-${shortId(4)}`)
const defaultOptions = inject('defaultOptions', {})
const options = ref(getOpitons(props, defaultOptions))
const editor = ref(null)
const savedAt = ref(null)
const page = ref({})
const blockMenu = ref(false)
const imageViewer = ref({ visible: false, current: null })
const exportFile = ref({ pdf: false, image: false })
const uploadFileMap = ref(new Map())
const destroyed = ref(false)
provide('container', container)
provide('options', options)
provide('editor', editor)
provide('savedAt', savedAt)
provide('page', page)
provide('blockMenu', blockMenu)
provide('imageViewer', imageViewer)
provide('exportFile', exportFile)
provide('uploadFileMap', uploadFileMap)
provide('destroyed', destroyed)

watch(
  () => options.value.page,
  ({ defaultBackground, defaultMargin, defaultOrientation }: PageOption) => {
    page.value = {
      margin: defaultMargin,
      background: defaultBackground,
      orientation: defaultOrientation,
      zoomLevel: 100,
      autoWidth: false,
      preview: {
        enabled: false,
        scale: 1,
        zoom: 100,
      },
    }
    editor.value?.commands.hideInvisibleCharacters()
  },
  { immediate: true, deep: true },
)
watch(
  () => options.value.document?.readOnly,
  (val: boolean) => {
    editor.value?.setEditable(!val)
  },
)

const $toolbar = useState('toolbar', options)
const $document = useState('document', options)

let toolbarKey = $ref(shortId())
watch(
  () => [options.value.document?.readOnly, editor.value?.isEditable],
  () => {
    toolbarKey = shortId()
  },
)

// Lifecycle Hooks
onMounted(() => {
  setTheme(options.value.theme)
})
onBeforeUnmount(() => {
  destroy()
})

// Watchers
watch(
  () => props,
  () => setOptions(props),
  { deep: true },
)

watch(
  () => options.value.theme,
  (theme: 'light' | 'dark' | 'auto') => {
    setTheme(theme)
  },
)

watch(
  () => options.value.document,
  (val: any) => {
    $document.value = val
  },
)

watch(
  () => editor.value,
  () => {
    if (!editor.value) {
      return
    }
    editor.value.on('create', ({ editor }: any) => {
      destroyed.value = false
      emits('created', { editor })
    })
    editor.value.on('update', ({ editor }: any) => {
      emits('changed', { editor })
    })
    editor.value.on('selectionUpdate', ({ editor }: any) => {
      emits('changed:selection', { editor })
    })
    editor.value.on('transaction', ({ editor, transaction }: any) => {
      emits('changed:transaction', { editor, transaction })
    })
    editor.value.on('focus', ({ editor, event }: any) => {
      emits('focus', { editor, event })
    })
    editor.value.on(
      'contentError',
      ({ editor, error, disableCollaboration }: any) => {
        emits('contentError', { editor, error, disableCollaboration })
      },
    )
    editor.value.on('blur', ({ editor, event }: any) => {
      emits('blur', { editor, event })
    })
    editor.value.on('destroy', () => {
      emits('destroy')
    })
  },
)

watch(
  () => $toolbar.value,
  (toolbar: any, oldToolbar: any) => {
    emits('changed:toolbar', { toolbar, oldToolbar })
  },
  { deep: true },
)

// i18n Setup
// @ts-ignore
const { t, locale, mergeLocaleMessage } = useI18n()
const $locale = useStorage('umo-editor:locale', options.value.locale)
locale.value = $locale.value
const getLocaleMessage = (lang: SupportedLocale) => {
  const translations = options.value.translations?.[lang.replaceAll('-', '_')]
  if (isRecord(translations)) {
    return translations
  }
  return {}
}
mergeLocaleMessage(locale.value, getLocaleMessage(locale.value))
const { appContext } = getCurrentInstance() ?? {}
if (appContext) {
  appContext.config.globalProperties.t = t
  appContext.config.globalProperties.l = l
}
watch(
  () => locale.value,
  (locale: any, oldLocale: any) => {
    emits('changed:locale', { locale, oldLocale })
  },
)

// Global Locale Config
const localeConfig = $ref<Record<string, GlobalConfigProvider>>({
  'zh-CN': cnConfig as unknown as GlobalConfigProvider,
  'en-US': enConfig as unknown as GlobalConfigProvider,
  'ru-RU': ruConfig as unknown as GlobalConfigProvider,
})

// Options Setup
const setOptions = (value: UmoEditorOptions) => {
  options.value = getOpitons(value)
  const $locale = useStorage('umo-editor:locale', options.value.locale)
  if (!$locale.value) {
    $locale.value = options.value.locale
  }
  return options.value
}

// Theme Setup
const setTheme = (theme: 'light' | 'dark' | 'auto') => {
  if (!isString(theme) || !['light', 'dark', 'auto'].includes(theme)) {
    throw new Error('"theme" must be one of "light", "dark" or "auto".')
  }
  if (theme !== 'auto') {
    document.querySelector('html')?.setAttribute('theme-mode', theme)
    emits('changed:theme', theme)
    return
  }
  const darkScheme = '(prefers-color-scheme: dark)'
  const prefersDarkScheme = window.matchMedia(darkScheme).matches
  setTheme(prefersDarkScheme ? 'dark' : 'light')
  window.matchMedia(darkScheme).addEventListener('change', (e) => {
    setTheme(e.matches ? 'dark' : 'light')
  })
}

// Toolbar and Page Setup Methods
const setToolbar = (params: { mode: 'classic' | 'ribbon'; show: boolean }) => {
  if (!isRecord(params)) {
    throw new Error('params must be an object.')
  }
  if (params.mode) {
    if (!isString(params.mode)) {
      throw new Error('"params.mode" must be a string.')
    }
    if (!['classic', 'ribbon'].includes(params.mode)) {
      throw new Error('"params.mode" must be one of "classic" or "ribbon".')
    }
    $toolbar.value.mode = params.mode
  }
  if (isDefined(params.show)) {
    if (!isBoolean(params.show)) {
      throw new Error('"params.show" must be a boolean.')
    }
    $toolbar.value.show = params.show
  }
}

const setPage = (params: {
  size: string
  orientation: string
  background: string
}) => {
  if (!isRecord(params)) {
    throw new Error('params must be an object.')
  }
  if (params.size) {
    if (!isString(params.size)) {
      throw new Error('"params.size" must be a string.')
    }
  }
  if (params.orientation) {
    if (!isString(params.orientation)) {
      throw new Error('"params.orientation" must be a string.')
    }
    if (!['portrait', 'landscape'].includes(params.orientation)) {
      throw new Error(
        '"params.orientation" must be one of "portrait" or "landscape".',
      )
    }
    page.value.orientation = params.orientation
  }

  if (params.background) {
    if (!isString(params.background)) {
      throw new Error('"params.background" must be a string.')
    }
    page.value.background = params.background
  }
}

const setDocument = (params: DocumentOptions) => {
  if (!isRecord(params)) {
    throw new Error('params must be an object.')
  }
  if (!options.value.document) {
    options.value.document = {} as DocumentOptions
  }
  if (params.title) {
    if (!isString(params.title)) {
      throw new Error('"params.title" must be a string.')
    }
    const title = params.title !== '' ? params.title : t('document.untitled')
    $document.value.title = title
    options.value.document.title = title
  }
  if (isDefined(params.enableBubbleMenu)) {
    if (!isBoolean(params.enableBubbleMenu)) {
      throw new Error('"params.enableBubbleMenu" must be a boolean.')
    }
    options.value.document.enableBubbleMenu = params.enableBubbleMenu
  }
  if (isDefined(params.enableBlockMenu)) {
    if (!isBoolean(params.enableBlockMenu)) {
      throw new Error('"params.enableBlockMenu" must be a boolean.')
    }
    options.value.document.enableBlockMenu = params.enableBlockMenu
  }
  if (isDefined(params.enableMarkdown)) {
    if (!isBoolean(params.enableMarkdown)) {
      throw new Error('"params.enableMarkdown" must be a boolean.')
    }
    $document.value.enableMarkdown = params.enableMarkdown
  }
  if (isDefined(params.enableSpellcheck)) {
    if (!isBoolean(params.enableSpellcheck)) {
      throw new Error('"params.spellcheck" must be a boolean.')
    }
    $document.value.enableSpellcheck = params.enableSpellcheck
  }
}

// Content Methods
const setContent = (
  content: string,
  options = {
    emitUpdate: true,
    focusPosition: 'start',
    focusOptions: { scrollIntoView: true },
  },
) => {
  if (!editor.value) {
    throw new Error('editor is not ready!')
  }
  const doc = contentTransform(content)
  editor.value
    .chain()
    .setContent(doc, options.emitUpdate)
    .focus(options.focusPosition as FocusPosition, options.focusOptions)
    .run()
}

// Content Methods
const insertContent = (
  content: string,
  options = {
    updateSelection: true,
    focusPosition: 'start',
    focusOptions: { scrollIntoView: true },
  },
) => {
  if (!editor.value) {
    throw new Error('editor is not ready!')
  }
  const doc = contentTransform(content)
  editor.value
    .chain()
    .insertContent(doc, { updateSelection: options.updateSelection })
    .focus(options.focusPosition as FocusPosition, options.focusOptions)
    .run()
}

const startTypewriter = (content: object, options: any) => {
  if (!editor.value) {
    throw new Error('editor is not ready!')
  }
  if (typeof content !== 'object') {
    throw new Error('content is not object!')
  }
  setTimeout(() => {
    editor?.value?.commands.focus('end')
    editor?.value?.commands.startTypewriter(content, options)
  }, 100)
}

const stopTypewriter = () => {
  editor?.value?.commands.stopTypewriter()
}

const getTypewriterState = () => {
  editor?.value?.commands.getTypewriterState()
}

const getContent = (format = 'html') => {
  if (!editor.value) {
    throw new Error('editor is not ready!')
  }
  if (format === 'html') {
    return editor.value.getHTML()
  }
  if (format === 'text') {
    return editor.value.getText()
  }
  if (format === 'json') {
    return editor.value.getJSON()
  }
  throw new Error('format must be html, text or json')
}

// Locale Methods
const setLocale = (params: SupportedLocale) => {
  if (!['zh-CN', 'en-US', 'ru-RU'].includes(params)) {
    throw new Error('"params" must be one of "zh-CN", "en-US" or "ru-RU".')
  }
  if (locale.value === params) {
    return
  }
  $locale.value = params
  location.reload()
}

const getLocale = () => locale.value
const getI18n = () => i18n

// Export Methods
const getImage = async (format: 'blob' | 'jpeg' | 'png' = 'blob') => {
  const { zoomLevel } = page.value
  try {
    page.value.zoomLevel = 100
    const node = document.querySelector(
      `${container} .umo-page-content`,
    ) as HTMLElement
    if (format === 'blob') {
      return await toBlob(node)
    }
    if (format === 'jpeg') {
      return await toJpeg(node)
    }
    if (format === 'png') {
      return await toPng(node)
    }
  } catch {
    throw new Error(t('export.image.error.message'))
  } finally {
    page.value.zoomLevel = zoomLevel
  }
}

// Editor Interaction Methods
const getText = () => getContent('text')
const getHTML = () => getContent('html')
const getJSON = () => getContent('json')

const focus = (position = 'start', options = { scrollIntoView: true }) =>
  editor.value?.commands.focus(position as FocusPosition, options)

const blur = () => editor.value?.chain().blur().run()

const reset = (silent: boolean) => {
  const resetFn = () => {
    localStorage.clear()
    location.reload()
  }
  if (silent) {
    resetFn()
    return
  }
  const dialog = useConfirm({
    attach: container,
    theme: 'warning',
    header: t('resetAll.title'),
    body: t('resetAll.message'),
    confirmBtn: {
      theme: 'warning',
      content: t('resetAll.reset'),
    },
    onConfirm() {
      dialog.destroy()
      resetFn()
    },
  })
}

const destroy = () => {
  editor.value?.destroy()
  removeAllHotkeys()
  destroyed.value = true
}

// Content Saving Methods
const saveContent = async (showMessage = true) => {
  if (options.value.document?.readOnly) {
    return
  }
  try {
    useMessage('loading', {
      attach: container,
      content: t('save.saving'),
      placement: 'bottom',
      closeBtn: true,
      offset: [0, -20],
    })
    const success = await options.value?.onSave?.(
      {
        html: editor.value?.getHTML(),
        json: editor.value?.getJSON(),
        text: editor.value?.getText(),
      },
      page.value,
      $document.value,
    )
    if (!success) {
      MessagePlugin.closeAll()
      useMessage('error', {
        attach: container,
        content: t('save.failed'),
        placement: 'bottom',
        offset: [0, -20],
      })
      return
    }
    emits('saved')
    if (showMessage) {
      MessagePlugin.closeAll()
      useMessage('success', {
        attach: container,
        content:
          success === false || success === true ? t('save.success') : success,
        placement: 'bottom',
        offset: [0, -20],
      })
    }
    const time = useTimestamp({ offset: 0 })
    savedAt.value = time.value
  } catch (e: unknown) {
    const error = e as Error
    useMessage('error', {
      attach: container,
      content: error?.message ? error.message : t('save.error'),
      placement: 'bottom',
      offset: [0, -20],
    })
    console.error((e as Error).message)
  }
}
// Content Excerpt Methods
const getContentExcerpt = (charLimit = 100, more = ' ...') => {
  const text = editor.value?.getText()
  if (text?.length === 0) {
    return ''
  }
  return text?.substring(0, charLimit) + more
}

// Hotkeys Setup
watch(
  () => editor.value,
  () => {
    editor.value?.on('blur', () => {
      removeAllHotkeys()
    })
  },
)

// Methods Exposed to Descendants
provide('setLocale', setLocale)
provide('reset', reset)

// Exposing Methods
defineExpose({
  getOptions: () => options.value,
  setOptions,
  setToolbar,
  setPage,
  setDocument,
  setContent,
  insertContent,
  startTypewriter,
  stopTypewriter,
  getTypewriterState,
  setLocale,
  setTheme,
  getPage: () => page.value,
  getContent,
  getImage,
  getText,
  getHTML,
  getJSON,
  saveContent,
  getContentExcerpt,
  getEditor: () => editor,
  useEditor: () => editor.value,
  getTableOfContents: () => editor.value?.storage.tableOfContents.content,
  getSelectionText: () => (editor.value ? getSelectionText(editor.value) : ''),
  getSelectionNode: () =>
    editor.value ? getSelectionNode(editor.value) : null,
  deleteSelectionNode: () => editor.value?.commands.deleteSelectionNode(),
  setCurrentNodeSelection: () =>
    editor.value?.commands.setCurrentNodeSelection(),
  getLocale,
  getI18n,
  setReadOnly(readOnly = true) {
    if (options.value.document) {
      options.value.document.readOnly = readOnly
    }
  },
  focus,
  blur,
  reset,
  destroy,
  useAlert(pramas: DialogOptions) {
    return useAlert({ attach: container, ...pramas })
  },
  useConfirm(pramas: DialogOptions) {
    return useConfirm({ attach: container, ...pramas })
  },
  useMessage(type: string, pramas: MessageOptions) {
    return useMessage(type, { attach: container, ...pramas })
  },
})
</script>

<style lang="less">
@import '@/assets/styles/index.less';

.umo-editor-container {
  --td-brand-color: var(--umo-primary-color);
  --td-warning-color: var(--umo-warning-color);
  --td-error-color: var(--umo-error-color);
  --td-text-color-primary: var(--umo-text-color);
  --td-text-color-disabled: var(--umo-text-color-disabled);
  width: 100%;
  height: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  color: var(--umo-text-color);
  position: relative !important;
  .umo-toolbar {
    background-color: var(--umo-color-white);
  }
  .umo-main {
    flex: 1;
    background-color: #fff;
    overflow: hidden;
  }
}
</style>
