import { defineConfig } from 'vite'
import WindiCSS from 'vite-plugin-windicss'

export default defineConfig(({ command }) => ({
  base: '',
  plugins: [
    WindiCSS(),
    {
        name: 'vue-mockup',
        enforce: 'pre',
        transform (src, id) {
            if (id.endsWith('vue')) {
                if (command === 'build') {
                    const importMap = {}
                    const exported = src.replace(/(import .+ from )['"](..?\/.+?)['"]/g, (_, $1, $2) => {
                        importMap[$2] = $1
                        return ''
                    })

                    const imports = Object.entries(importMap)
                        .map(([file, i]) => `${i}'${file}'`)
                        .join('\n')

                    return { 
                        code: `${imports};export default ${JSON.stringify(exported)}`,
                        map: null 
                    }
                }

                return { 
                    code: `export default ${JSON.stringify(src)}`,
                    map: null 
                }
            }
        }
    }
  ],
}))
