import { createApp } from 'vue'
import App from './App.vue'
import { store, key } from './store'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'

loadFonts()

createApp(App)
    .use(store, key)
    .use(vuetify)
    .mount('#app')
