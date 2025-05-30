import 'virtual:svg-icons-register'

import WattEditor from './index.vue'
import UmoMenuButton from './menus/button.vue'
import UmoDialog from './modal.vue'
import UmoTooltip from './tooltip.vue'

const useWattEditor = {
    install: (app: any, options: any) => {
        app.provide('defaultOptions', options)
        app.component(WattEditor.name ?? 'WattEditor', WattEditor)
    },
}

export {
    WattEditor as default,
    UmoDialog,
    WattEditor,
    UmoMenuButton,
    UmoTooltip,
    useWattEditor,
}
