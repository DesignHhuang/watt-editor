import { Blockquote } from '@tiptap/extension-blockquote'

export const ReadOnlyBlockquote = Blockquote.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            readonly: {
                default: true,
                renderHTML: () => ({ 'contenteditable': 'false' }),
                parseHTML: element => ({
                    readonly: element.getAttribute('contenteditable') === 'false'
                })
            }
        }
    },

    // 禁止删除只读引用
    addKeyboardShortcuts() {
        return {
            Backspace: () => this.editor.isActive('blockquote') &&
                this.editor.getAttributes('blockquote').readonly,
            Delete: () => this.editor.isActive('blockquote') &&
                this.editor.getAttributes('blockquote').readonly
        }
    }
})