import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { auth } from 'src/services/auth'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach(async (to) => {
    if (!to.meta.public && !auth.loggedIn) return '/bienvenida'
    if (to.meta.guestOnly && auth.loggedIn) return '/'
    if (!to.meta.public && auth.loggedIn) {
      try {
        await auth.refresh()
      } catch {
        auth.clear()
        return { path: '/login', query: { acceso: 'conexion' } }
      }
      if (!auth.loggedIn) {
        return { path: '/login', query: { acceso: 'expirado' } }
      }
    }
    if (to.meta.permission && !auth.can(to.meta.permission)) return '/'
  })

  return Router
})
