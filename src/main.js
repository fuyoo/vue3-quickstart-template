import { createApp } from 'vue'
import router from ':/router'
import Layout from ':/layout'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElIcon from '@element-plus/icons'
import a from ":/asserts/a.png"
console.log(a)
const vueApp = createApp(Layout)
Object.keys(ElIcon).forEach(item => {
  vueApp.component(item, ElIcon[ item ])
})
vueApp.use(router)
vueApp.use(ElementPlus, { size: 'small' })
vueApp.mount('#app')

