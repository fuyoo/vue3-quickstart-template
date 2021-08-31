import { createRouter, createWebHashHistory } from 'vue-router'
import routes from './routes.js'
import storage from ':/tools/storage'

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
const whiteNameList = ['/login']
router.beforeEach(async (to, from, next) => {
  // 在白名单直接放行
  if (whiteNameList.includes(to.path)) {
    next()
  }
  // 判断是否login
  const token = await storage.session.getItem('token') || await storage.getItem('token')
  if (!token) {
    next("/login")
  }
  next()
})
export default router
