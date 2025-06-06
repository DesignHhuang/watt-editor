import type { Extension } from '@tiptap/core'
import type { AsyncFunction } from '@tool-belt/type-predicates'

export type SupportedLocale = 'en-US' | 'zh-CN' | 'ru-RU'
export interface PageOption {
    defaultPadding?: string
    defaultOrientation?: string
    defaultBackground?: string
    size?: {
        width: number
        height: number
        label?: LocaleLabel
    }
    margin?: {
        right: number
        left: number
        bottom: number
        top: number
        layout?: 'narrow' | 'moderate' | 'wide' | 'custom'
    }
    orientation?: string
    background?: string
    header?: boolean
    zoomLevel?: number
    bodyHeight?: number
    autoWidth?: boolean
}

export type ToolbarMenu =
    | 'base'
    | 'insert'
    | 'tools'
    | 'page'
    | 'export'
    | 'advanced'
    | 'custom'

export interface ToolbarOptions {
    defaultMode: 'classic' | 'ribbon' | 'hidden'
    menus: ToolbarMenu[]
    disableMenuItems: string[]
}

export interface DocumentOptions {
    id?: string
    title: string
    content: string
    placeholder?: Record<string, string>
    enableSpellcheck?: boolean
    enableMarkdown?: boolean
    enableBubbleMenu?: boolean
    enableBlockMenu?: boolean
    // enableComment?: boolean
    readOnly?: boolean
    autofocus?: 'start' | 'end' | 'all' | number | boolean | null
    characterLimit?: number
    typographyRules?: Record<string, unknown>
    editorProps?: Record<string, unknown>
    parseOptions?: Record<string, unknown>
}

export type LocaleLabel =
    | string
    | { en_US: string; zh_CN: string; ru_RU: string }

export interface Font {
    label: LocaleLabel
    value: string | null
}

export interface LineHeight {
    label: LocaleLabel
    value: number
    default?: boolean
}

export interface UserItem {
    id: string
    label: string
    avatar?: string
}

export interface CommandItem {
    label: LocaleLabel
    value: LocaleLabel
    autoSend?: boolean
}

export interface FileOptions {
    allowedMimeTypes: string[]
    maxSize: number
    preview: {
        extensions?: string[]
        url: string
    }[]
}

export interface WattEditorOptions {
    editorKey: string
    locale: SupportedLocale
    theme: 'light' | 'dark'
    height: string
    dicts?: {
        fonts: Font[]
        colors: string[]
        lineHeights: LineHeight[]
    }
    toolbar?: ToolbarOptions
    page: PageOption
    document?: DocumentOptions
    cdnUrl?: string
    file?: FileOptions
    user?: Record<string, unknown>
    users?: UserItem[]
    mentionComp?: Component,
    extensions?: Extension[]
    translations?: Record<string, unknown>
    onFileUpload?: (file: File) => Promise<{ id: string; url: string }>
    onFileDelete?: CallableFunction
}

export * from '../dist/watt-editor'