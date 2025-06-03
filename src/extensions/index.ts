import Bold from '@tiptap/extension-bold'
import Dropcursor from '@tiptap/extension-dropcursor'
import Focus from '@tiptap/extension-focus'
import Placeholder from '@tiptap/extension-placeholder'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Typography from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import type { Editor, Extension } from '@tiptap/vue-3'
import { ColumnsExtension as Columns } from '@tiptap-extend/columns'
import NodeRange from '@tiptap-pro/extension-node-range'

import type { WattEditorOptions } from '@/types'

import BulletList from './bullet-list'
import CodeBlock from './code-block'
import File from './file'
import FileHandler from './file-handler'
import Image from './image'
import LineHeight from './line-height'
import Mention from './mention'
import getUsersSuggestion from './mention/suggestion'
import NodeAlign from './node-align'
import OrderedList from './ordered-list'
import Selection from './selection'
import Tag from './tag'
import TextAlign from './text-align'
import typeWriter from './type-writer'
import Video from './video'

export const getDefaultExtensions = ({
    container,
    options,
    uploadFileMap,
}: {
    container: string
    options: { value: WattEditorOptions }
    uploadFileMap: { value: any }
}) => {
    const { dicts, document: doc, users, file, mentionComp } = options.value

    const extensions = [
        StarterKit.configure({
            bold: false,
            bulletList: false,
            orderedList: false,
            codeBlock: false,
            horizontalRule: false,
            dropcursor: false,
        }),
        Placeholder.configure({
            placeholder: () => String(l(doc?.placeholder ?? '')),
        }),
        Focus.configure({
            className: 'umo-node-focused',
            mode: 'all',
        }),
        Bold.extend({
            renderHTML: ({ HTMLAttributes }) => ['b', HTMLAttributes, 0],
        }),
        Underline,
        BulletList,
        OrderedList,
        TextAlign,
        NodeAlign,
        TaskItem.configure({ nested: true }),
        TaskList.configure({
            HTMLAttributes: {
                class: 'umo-task-list',
            },
        }),
        LineHeight.configure({
            types: ['heading', 'paragraph'],
            defaultLineHeight:
                dicts?.lineHeights?.find((item: any) => item.default)?.value ??
                undefined,
        }),
        Image,
        Video,
        File,
        CodeBlock,
        Tag,
        Columns,

        // 其他
        Mention.configure({
            suggestion: getUsersSuggestion(users ?? [], mentionComp, container),
        }),
        Selection,
        NodeRange,
        Typography.configure(doc?.typographyRules),
        FileHandler.configure({
            allowedMimeTypes: file?.allowedMimeTypes,
            onPaste(editor: Editor, files: any) {
                // 记录 已有位置
                const pageContainer = document.querySelector(
                    `${container} .umo-zoomable-container`,
                ) as HTMLElement
                const scrollTop = pageContainer?.scrollTop || 0
                for (const file of files) {
                    editor.commands.insertFile({
                        file,
                        uploadFileMap: uploadFileMap.value,
                        autoType: true,
                    })
                }
                // 恢复滚动位置
                if (pageContainer) {
                    // 使用 setTimeout 确保 DOM 更新完成后再恢复滚动位置
                    setTimeout(() => {
                        pageContainer.scrollTop = scrollTop
                    }, 0)
                }
            },
            onDrop: (editor: Editor, files: any, pos: number) => {
                for (const file of files) {
                    editor.commands.insertFile({
                        file,
                        uploadFileMap: uploadFileMap.value,
                        autoType: true,
                        pos,
                    })
                }
            },
        }),
        Dropcursor.configure({
            color: 'var(--umo-primary-color)',
        }),
        typeWriter,
    ]

    return extensions
}

export const inputAndPasteRules = (options: any) => {
    let enableRules: boolean | Extension[] = true
    const $document = useState('document', options)
    if (
        !options.value.document?.enableMarkdown ||
        !$document.value?.enableMarkdown
    ) {
        enableRules = [Typography, Image as Extension]
    }
    return enableRules
}
