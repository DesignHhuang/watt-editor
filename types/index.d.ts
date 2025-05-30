import type { Extension } from '@tiptap/core'
import type { AsyncFunction } from '@tool-belt/type-predicates'

export type SupportedLocale = 'en-US' | 'zh-CN' | 'ru-RU'
export interface MarginOption {
    left: number
    right: number
    top: number
    bottom: number
}
export interface WatermarkOption {
    type: string
    alpha: number
    fontColor: string
    fontSize: number
    fontFamily: string
    fontWeight: string
    text: string
}
export interface PageOption {
    defaultMargin?: MarginOption
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
    defaultMode: 'classic' | 'ribbon'
    menus: ToolbarMenu[]
    disableMenuItems: string[]
    importWord: {
        enabled: boolean
        maxSize: number
        options: unknown
        useCustomMethod?: boolean
        onCustomImportMethod?: (file: File) => Promise<{
            id: string
            url: string
            value: string
            messages: { type: string; message: string }
        }>
    }
}

export interface AutoSaveOptions {
    enabled: boolean
    interval: number
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
    autoSave?: AutoSaveOptions
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

export interface UmoEditorOptions {
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
    extensions?: Extension[]
    translations?: Record<string, unknown>
    onSave?: AsyncFunction
    onFileUpload?: (file: File) => Promise<{ id: string; url: string }>
    onFileDelete?: CallableFunction
}
