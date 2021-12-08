import WindiCSS from 'vite-plugin-windicss'

export default {
  plugins: [
    WindiCSS(),
    {
        name: 'vue-mockup',
        enforce: 'pre',
        transform (src, id) {
            if (id.endsWith('vue')) {
                return { code: 'export default ' + JSON.stringify(src), map: null }
            }
        }
    }
  ],
}
