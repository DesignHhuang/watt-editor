import type { WattEditorOptions } from '@/types'

import App from './app.vue'
import { useWattEditor } from './components'
const app = createApp(App)

const options = {}

app.use(useWattEditor, options as unknown as WattEditorOptions)

app.mount('#app')
