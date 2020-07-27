// 路由全局守卫
// 权限控制逻辑
import router from './router'
import store from './store'
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth'

const whiteList = ['/login'] // 无需令牌的白名单

router.beforeEach(async (to, from, next) => {
  // 获取令牌判断用户是否登录
  const hasToken = getToken()
  if (hasToken) {
    console.log('hasToken', hasToken)
    if (to.path === '/login') {
      console.log('/login')
      // 若已登录定向至首页
      next({ path: '/' })
    } else {
      console.log('not /login')
      // 若用户角色已附加则说明动态路由已添加
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        console.log('hasRoles', hasRoles)
        console.log('router', router.options.routes)
        next() // 继续即可
      } else {
        console.log('no hasRoles')
        try {
          // 先获取用户信息
          const { roles } = await store.dispatch('user/getInfo')
          // 根据当前用户角色动态生成路由
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
          // 添加这些路由至路由器
          router.addRoutes(accessRoutes)
          // 继续路由切换，确保addRoutes完成
          console.log('router', router.options.routes)
          next({ ...to, replace: true })
        } catch (error) {
          console.log('error', error)
          // 出错需重置令牌并重新登陆
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
        }
      }
    }
  } else {
    console.log('no hasToken')
    //  用户无令牌
    if (whiteList.indexOf(to.path) !== -1) {
      console.log('whiteList')
      // 白名单路由通过
      next()
    } else {
      console.log('no whiteList')
      // 重定向至登录页
      next(`/login?redirect=${to.path}`)
    }
  }
})
