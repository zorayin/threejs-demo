import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import "./assets/font.css"

createApp(App)
  .use(store)
  .use(ElementPlus, { size: "small", zIndex: 3000 })
  .use(router)
  .mount("#app");
