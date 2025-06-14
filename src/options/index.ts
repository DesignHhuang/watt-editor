import { ObjectSchema } from '@eslint/object-schema'
import {
    type AsyncFunction,
    isAsyncFunction,
    isFunction,
    isNumber,
    isRecord,
    isString,
} from '@tool-belt/type-predicates'

import type {
    LineHeight,
    LocaleLabel,
    WattEditorOptions,
} from '@/types'

import { defaultDicts } from './dicts'

// 默认配置
const defaultOptions: WattEditorOptions = {
    editorKey: 'default',
    locale: 'zh-CN',
    theme: 'light',
    height: '100%',
    dicts: defaultDicts,
    toolbar: {
        defaultMode: 'classic',
        menus: ['insert', 'base'],
        disableMenuItems: [],
    },
    page: {
        defaultPadding: '16px',
        defaultOrientation: 'portrait',
        defaultBackground: '#fff',
    },
    document: {
        title: '',
        content: '',
        placeholder: {
            en_US: 'Please enter the content...',
            zh_CN: '请输入内容...',
            ru_RU: 'Пожалуйста, введите документа...',
        },
        enableSpellcheck: true,
        enableMarkdown: true,
        enableBubbleMenu: true,
        enableBlockMenu: true,
        readOnly: false,
        autofocus: true,
        characterLimit: 0,
        typographyRules: {},
        // https://prosemirror.net/docs/ref/#view.EditorProps
        editorProps: {},
        // https://prosemirror.net/docs/ref/#model.ParseOptions
        parseOptions: {
            preserveWhitespace: 'full',
        },
    },
    cdnUrl: 'https://oss.wattsonic.com/wattteam/svgs',
    file: {
        allowedMimeTypes: [],
        maxSize: 1024 * 1024 * 100, // 100M
        preview: [
            { extensions: ['pdf'], url: '{url}' },
            {
                extensions: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
                url: 'https://view.officeapps.live.com/op/embed.aspx?src={{url}}&amp;wdStartOn=1&amp;wdPrint=0&amp;wdEmbedCode=0',
            },
        ],
    },
    user: {},
    users: [],
    mentionComp: null,
    extensions: [],
    translations: {
        en_US: {},
        zh_CN: {},
        ru_RU: {},
    },
    async onFileUpload(file: File) {
        return await new Promise((_, reject) => {
            if (!file) {
                reject(new Error('File not found'))
                return
            }
            reject(new Error('Key "onFileUpload": Please set the upload method'))
        })
    },
    onFileDelete() {
        console.error(
            'The file has been deleted. Please configure the onFileDelete to completely delete the file from the server.',
        )
    },
}

// 组件 props 所需格式
const propsOptions = Object.keys(defaultOptions)

const isLocale = (value: unknown) => {
    if (isString(value) && value.length > 0) {
        return true
    }
    if (isRecord(value)) {
        for (const key of Object.keys(value)) {
            if (!['en_US', 'zh_CN', 'ru_RU'].includes(key)) {
                return false
            }
        }
        return true
    }
    return false
}

const ojbectSchema = new ObjectSchema({
    editorKey: {
        merge: 'replace',
        validate: 'string!',
        required: false,
    },
    locale: {
        merge: 'replace',
        validate(value) {
            if (value && !['en-US', 'zh-CN', 'ru-RU'].includes(value)) {
                throw new Error(
                    'Key "locale": must be one of "en-US", "zh-CN" or "ru-RU".',
                )
            }
        },
        required: false,
    },
    theme: {
        merge: 'replace',
        validate(value) {
            if (value && !['dark', 'light', 'auto'].includes(value)) {
                throw new Error(
                    'Key "theme": must be one of "dark", "light" or "auto".',
                )
            }
        },
        required: false,
    },
    height: {
        merge: 'replace',
        validate: 'string!',
        required: false,
    },
    dicts: {
        required: false,
        merge: 'replace',
        validate: 'object',
        schema: {
            fonts: {
                merge: 'replace',
                validate(value) {
                    if (value && !Array.isArray(value)) {
                        throw new Error('Key "dicts": Key "fonts" must be a array.')
                    }
                    for (const item of value) {
                        if (!item.label || (!item.value && item.value !== null)) {
                            throw new Error(
                                'Key "dicts": Key "fonts" must be a array of objects with "label" and "value" properties.',
                            )
                        }
                    }
                },
                required: false,
            },
            colors: {
                merge: 'replace',
                validate: 'array',
                required: false,
            },
            lineHeights: {
                merge: 'replace',
                validate(value: LineHeight[]) {
                    if (!Array.isArray(value)) {
                        throw new Error('Key "dicts": Key "lineHeights": must be a array.')
                    }
                    if (!value.find((item) => item.default)) {
                        throw new Error(
                            'Key "dicts": Key "lineHeights": please set a default value.',
                        )
                    }
                    value.forEach((item, index) => {
                        if (!item.label || (!item.value && item.value !== null)) {
                            throw new Error(
                                `Key "dicts": Key "lineHeights[${index}]": must be a array of objects with "label" and "value" properties.`,
                            )
                        }
                        if (!isLocale(item.label)) {
                            throw new Error(
                                `Key "dicts": Key "lineHeights[${index}]": Key "label" must be string, or a object with "en_US" and "zh_CN" properties.`,
                            )
                        }
                    })
                },
                required: false,
            },
        },
    },
    toolbar: {
        required: false,
        merge: 'replace',
        validate: 'object',
        schema: {
            defaultMode: {
                merge: 'replace',
                validate(value: 'classic' | 'ribbon' | 'hidden') {
                    if (value && !['classic', 'ribbon', 'hidden'].includes(value)) {
                        throw new Error(
                            'Key "toolbar": Key "defaultMode" must be one of "classic" or "ribbon".',
                        )
                    }
                },
                required: false,
            },
            menus: {
                merge: 'replace',
                validate(value: 'base' | 'advanced' | 'custom') {
                    const defaultMenus = defaultOptions?.toolbar?.menus
                    if (value && !Array.isArray(value)) {
                        throw new Error('Key "toolbar": Key "menus" must be a array.')
                    }
                    if (!value.includes('base')) {
                        throw new Error(
                            'Key "toolbar": Key "menus" should at least contain "base".',
                        )
                    }
                    if (!value.every((item) => defaultMenus?.includes(item))) {
                        throw new Error(
                            `Key "toolbar": Key "menus" the array items of toolbar.menus must contain only one or multiple of ${JSON.stringify(defaultMenus)}.`,
                        )
                    }
                },
                required: false,
            },
            disableMenuItems: {
                merge: 'replace',
                validate(value: string[]) {
                    if (value && !Array.isArray(value)) {
                        throw new Error(
                            'Key "toolbar": Key "disableMenuItems" must be a array.',
                        )
                    }
                },
                required: false,
            },
            importWord: {
                merge: 'replace',
                validate: 'object',
                required: false,
            },
        },
    },
    page: {
        merge: 'replace',
        validate: 'object',
        required: false,
        schema: {
            defaultPadding: {
                merge: 'replace',
                validate: 'string',
                required: false,
            },
            defaultOrientation: {
                merge: 'replace',
                validate(value: 'portrait' | 'landscape') {
                    if (value && !['portrait', 'landscape'].includes(value)) {
                        throw new Error(
                            'Key "page": Key "defaultOrientation" must be one of "portrait" or "landscape".',
                        )
                    }
                },
                required: false,
            },
            defaultBackground: {
                merge: 'replace',
                validate: 'string',
                required: false,
            },
            size: {
                required: false,
                merge: 'replace',
                validate: 'object',
                schema: {
                    width: {
                        merge: 'replace',
                        validate: 'number',
                        required: false,
                    },
                    height: {
                        merge: 'replace',
                        validate: 'number',
                        required: false,
                    },
                    label: {
                        merge: 'replace',
                        validate: 'string',
                        required: false,
                    },
                },
            },
        },
    },
    document: {
        merge: 'replace',
        validate: 'object',
        required: false,
        schema: {
            title: {
                merge: 'replace',
                validate: 'string',
                required: false,
            },
            content: {
                merge: 'replace',
                validate() { },
                required: false,
            },
            placeholder: {
                merge: 'replace',
                validate(value: LocaleLabel) {
                    if (!isLocale(value)) {
                        throw new Error(
                            `Key "document": Key "title": Key "label" must be string, or a object with "en_US" and "zh_CN" properties.`,
                        )
                    }
                },
                required: false,
            },
            enableSpellcheck: {
                merge: 'replace',
                validate: 'boolean',
                required: false,
            },
            enableMarkdown: {
                merge: 'replace',
                validate: 'boolean',
                required: false,
            },
            enableBubbleMenu: {
                merge: 'replace',
                validate: 'boolean',
                required: false,
            },
            enableBlockMenu: {
                merge: 'replace',
                validate: 'boolean',
                required: false,
            },
            readOnly: {
                merge: 'replace',
                validate: 'boolean',
                required: false,
            },
            autofocus: {
                merge: 'replace',
                validate(value: 'start' | 'end' | 'all' | number | boolean | null) {
                    if (
                        !['start', 'end', 'all', true, false, null].includes(
                            value as unknown as string,
                        ) &&
                        !isNumber(value)
                    ) {
                        throw new Error(
                            'Key "document": Key "autofocus" must be one of "start", "end", "all", Number, true, false, null.',
                        )
                    }
                },
                required: false,
            },
            characterLimit: {
                merge: 'replace',
                validate: 'number',
                required: false,
            },
            typographyRules: {
                merge: 'replace',
                validate: 'object',
                required: false,
            },
            editorProps: {
                merge: 'replace',
                validate: 'object',
                required: false,
            },
            parseOptions: {
                merge: 'replace',
                validate: 'object',
                required: false,
            },
        },
    },
    cdnUrl: {
        merge: 'replace',
        validate: 'string',
        required: false,
    },
    file: {
        required: false,
        merge: 'replace',
        validate: 'object',
        schema: {
            allowedMimeTypes: {
                merge: 'replace',
                validate: 'array',
                required: false,
            },
            maxSize: {
                merge: 'replace',
                validate: 'number',
                required: false,
            },
            preview: {
                merge: 'replace',
                validate(value) {
                    value.forEach((item: { extensions: [any]; url: string }) => {
                        if (typeof item !== 'object') {
                            throw new Error(
                                'Key "file": Key "preview" must be an array of objects.',
                            )
                        }
                        if (!Array.isArray(item.extensions)) {
                            throw new Error(
                                'Key "file": Key "preview": Key "extensions" must be an array of strings.',
                            )
                        }
                        if (!item.url?.includes('{url}')) {
                            throw new Error(
                                'Key "file": Key "preview": Key "url" must include "{url}".',
                            )
                        }
                    })
                },
                required: false,
            },
        },
    },
    user: {
        merge: 'assign',
        validate: 'object',
        required: false,
    },
    users: {
        merge: 'replace',
        validate(value) {
            value.forEach((item: { id: [any]; label: string }) => {
                if (typeof item !== 'object') {
                    throw new Error(
                        'Key "users": Key "item" must be an array of objects.',
                    )
                }
                if (!item.id) {
                    throw new Error('Key "users": Key "item": Key "id" cannot be empty.')
                }
                if (!item.label) {
                    throw new Error(
                        'Key "users": Key "item": Key "label" cannot be empty.',
                    )
                }
            })
        },
        required: false,
    },
    mentionComp: {
        merge: 'replace',
        validate() { },
        required: false,
    },
    extensions: {
        merge: 'replace',
        validate: 'array',
        required: false,
    },
    translations: {
        merge: 'replace',
        validate: 'object',
        required: false,
    },
    onFileUpload: {
        merge: 'replace',
        validate(value: AsyncFunction) {
            if (!isAsyncFunction(value)) {
                throw new Error('Key "onFileUpload" must be a async function.')
            }
        },
        required: false,
    },
    onFileDelete: {
        merge: 'replace',
        validate(value: any) {
            if (!isFunction(value)) {
                throw new Error('Key "onFileDelete" must be a function.')
            }
        },
        required: false,
    },
})

export { defaultOptions, ojbectSchema, propsOptions }
