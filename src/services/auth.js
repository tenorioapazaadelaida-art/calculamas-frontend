import { reactive } from 'vue'
import { api } from 'boot/axios'

const usuarioGuardado =
  localStorage.getItem('usuario_autenticado') || localStorage.getItem('auth_user')
const permisosGuardados =
  localStorage.getItem('permisos_autenticacion') || localStorage.getItem('auth_permissions')
const leerJsonSeguro = (valor, predeterminado) => {
  try {
    return valor ? JSON.parse(valor) : predeterminado
  } catch {
    return predeterminado
  }
}
let actualizacionEnCurso = null
const normalizarUsuario = (usuario) => {
  if (!usuario) return null

  return {
    ...usuario,
    nombre: usuario.nombre ?? usuario.name,
    correo: usuario.correo ?? usuario.email,
    activo: usuario.activo ?? usuario.active,
    roles: (usuario.roles || []).map((rol) => ({
      ...rol,
      nombre: rol.nombre ?? rol.name,
      activo: rol.activo ?? rol.active,
    })),
    negocio: usuario.negocio
      ? {
          ...usuario.negocio,
          nombre: usuario.negocio.nombre ?? usuario.negocio.name,
          activo: usuario.negocio.activo ?? usuario.negocio.active,
        }
      : usuario.negocio,
  }
}

export const auth = reactive({
  usuario: normalizarUsuario(leerJsonSeguro(usuarioGuardado, null)),
  permisos: leerJsonSeguro(permisosGuardados, []),
  get loggedIn() {
    return Boolean(localStorage.getItem('auth_token'))
  },
  can(permission) {
    return this.permisos.includes(permission)
  },
  save(session) {
    localStorage.setItem('auth_token', session.token)
    localStorage.setItem('usuario_autenticado', JSON.stringify(session.usuario))
    localStorage.setItem('permisos_autenticacion', JSON.stringify(session.permisos))
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_permissions')
    this.usuario = normalizarUsuario(session.usuario)
    this.permisos = session.permisos
  },
  clear() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('usuario_autenticado')
    localStorage.removeItem('permisos_autenticacion')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_permissions')
    this.usuario = null
    this.permisos = []
  },
  async login(credentials) {
    const { data } = await api.post('/auth/login', credentials)
    this.save(data)
  },
  async register(data) {
    const { data: session } = await api.post('/auth/register', data)
    this.save(session)
  },
  async refresh() {
    if (!this.loggedIn) return
    if (actualizacionEnCurso) return actualizacionEnCurso
    actualizacionEnCurso = api
      .get('/auth/me')
      .then(({ data }) => {
        localStorage.setItem('usuario_autenticado', JSON.stringify(data.usuario))
        localStorage.setItem('permisos_autenticacion', JSON.stringify(data.permisos))
        this.usuario = normalizarUsuario(data.usuario)
        this.permisos = data.permisos
      })
      .catch((error) => {
        if (error.response?.status === 401) this.clear()
        else throw error
      })
      .finally(() => {
        actualizacionEnCurso = null
      })
    return actualizacionEnCurso
  },
  async logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      if (error.response?.status !== 401) {
        throw error
      }
    } finally {
      this.clear()
    }
  },
})
