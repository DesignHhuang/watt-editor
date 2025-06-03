import { VueRenderer } from '@tiptap/vue-3'
import tippy from 'tippy.js'

import type { UserItem } from '@/types'

export default (users: UserItem[], mentionComp: Component, container: string) => {
    return {
        items: ({ query }: { query: string }) =>
            users.filter((user: UserItem) => user.label.toLowerCase().includes(query.toLowerCase())),

        command: ({ editor, range, props }: any) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .insertContent({
                    type: 'mention',
                    attrs: {
                        id: props.id,
                        label: props.label,
                        position: props.position,
                        avatar: props.avatar,
                    },
                })
                .run()
        },

        render: () => {
            let component: any
            let popup: any

            return {
                onStart: (props: any) => {
                    component = new VueRenderer(mentionComp, {
                        props,
                        editor: props.editor,
                    })

                    if (!props.clientRect) {
                        return
                    }

                    const node = document.querySelector(
                        `${container} .umo-page-content`,
                    ) as HTMLElement

                    popup = tippy(container, {
                        getReferenceClientRect: props.clientRect,
                        appendTo: node,
                        content: component.element,
                        showOnCreate: true,
                        interactive: true,
                        trigger: 'manual',
                        placement: 'bottom-start',
                    })
                },
                onUpdate(props: any) {
                    component.updateProps(props)
                    if (!props.clientRect) {
                        return
                    }
                    popup[0].setProps({
                        getReferenceClientRect: props.clientRect,
                    })
                },
                onKeyDown(props: any) {
                    if (props.event.key === 'Escape') {
                        popup[0].hide()
                        return true
                    }
                    return component.ref?.onKeyDown(props)
                },
                onExit() {
                    popup[0].destroy()
                    component.destroy()
                },
            }
        },
    }
}
