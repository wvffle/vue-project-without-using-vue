import { q } from './waff-query'

import './style.css'
import 'virtual:windi.css'
import 'virtual:windi-devtools'

import './components/component'
import { components } from './components/component'

const app = q('#app')
app.append(await components.Test())