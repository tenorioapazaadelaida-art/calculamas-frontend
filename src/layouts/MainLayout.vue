<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="app-header" height-hint="76">
      <q-toolbar class="q-px-lg" style="height: 76px">
        <q-btn
          flat
          round
          icon="menu"
          aria-label="Menú"
          class="lt-md"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <div class="row items-center no-wrap">
          <CalculaLogo :size="42" inverse />
          <div class="q-ml-sm">
            <div class="brand-name">Calcula+</div>
            <div class="business-name">
              {{ auth.usuario?.negocio?.nombre }}
            </div>
          </div>
        </div>
        <q-space />
        <q-btn
          v-if="puedeVerNotificaciones"
          flat
          round
          icon="notifications_none"
          class="header-icon"
          aria-label="Notificaciones del sistema"
        >
          <q-badge
            v-if="totalNotificaciones"
            floating
            rounded
            color="negative"
            :label="totalNotificaciones > 99 ? '99+' : totalNotificaciones"
          />
          <q-menu
            v-model="menuNotificaciones"
            anchor="bottom right"
            self="top right"
            class="notificaciones-menu"
            @show="cargarNotificaciones"
          >
            <q-card flat class="notificaciones-panel">
              <q-card-section class="row items-center no-wrap q-pb-sm">
                <div>
                  <div class="text-subtitle1 text-weight-bold">
                    Notificaciones
                  </div>
                  <div class="text-caption text-grey-7">
                    Actividad reciente y alertas
                  </div>
                </div>
                <q-space />
                <q-btn
                  v-if="notificaciones.some((item) => item.persistente && !item.leida)"
                  flat dense no-caps color="primary" label="Leer todas"
                  @click="marcarTodasLeidas"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="refresh"
                  aria-label="Actualizar notificaciones"
                  :loading="cargandoNotificaciones"
                  @click="cargarNotificaciones"
                />
              </q-card-section>
              <q-separator />
              <q-list v-if="notificaciones.length" separator>
                <q-item
                  v-for="notificacion in notificaciones"
                  :key="notificacion.idVista"
                  clickable
                  v-close-popup
                  :class="{ 'bg-blue-grey-1': !notificacion.leida }"
                  @click="abrirNotificacion(notificacion)"
                >
                  <q-item-section avatar>
                    <q-avatar
                      :color="notificacion.colorSuave"
                      :text-color="notificacion.color"
                      :icon="notificacion.icono"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">
                      {{ notificacion.titulo }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ notificacion.mensaje }}
                    </q-item-label>
                    <q-item-label v-if="notificacion.tipo === 'stock'" caption>
                      Disponible: {{ notificacion.stock }} · Mínimo:
                      {{ notificacion.minimo }}
                    </q-item-label>
                    <q-item-label v-else caption>{{ fechaNotificacion(notificacion.created_at) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-card-section v-else class="text-center q-py-xl">
                <q-icon name="check_circle" color="positive" size="40px" />
                <div class="text-weight-bold q-mt-sm">Sin novedades</div>
                <div class="text-caption text-grey-7">
                  No hay actividad ni alertas pendientes.
                </div>
              </q-card-section>
            </q-card>
          </q-menu>
        </q-btn>
        <q-separator vertical inset class="q-mx-md" />
        <div class="row items-center no-wrap">
          <q-avatar
            size="38px"
            color="grey-3"
            text-color="primary"
          >
            {{ iniciales }}
          </q-avatar>
          <div class="q-ml-sm gt-sm user-summary">
            <div class="text-weight-bold text-caption">
              {{ auth.usuario?.nombre }}
            </div>
            <div class="role-label">
              {{ rolesUsuario }}
            </div>
          </div>
          <q-btn flat round dense icon="expand_more">
            <q-menu>
              <q-list style="min-width: 190px">
                <q-item clickable v-close-popup @click="perfilAbierto = true">
                  <q-item-section avatar>
                    <q-icon name="person_outline" />
                  </q-item-section>
                  <q-item-section>
                    Mi perfil
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item
                  clickable
                  v-close-popup
                  @click="logout"
                >
                  <q-item-section avatar>
                    <q-icon
                      name="logout"
                      color="negative"
                    />
                  </q-item-section>
                  <q-item-section
                    class="text-negative"
                  >
                    Cerrar sesión
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="252"
      class="app-drawer"
    >
      <q-scroll-area class="fit">
        <div class="drawer-content">
          <div class="menu-caption">Navegación</div>
          <q-list class="menu-list">
            <q-item clickable v-ripple to="/" exact>
              <q-item-section avatar>
                <q-icon name="space_dashboard" />
              </q-item-section>
              <q-item-section>Inicio</q-item-section>
            </q-item>
            <q-item
              v-if="auth.can('categorias.ver')"
              clickable
              v-ripple
              to="/categorias"
            >
              <q-item-section avatar>
                <q-icon name="category" />
              </q-item-section>
              <q-item-section>
                Categoría productos
              </q-item-section>
            </q-item>
            <q-item
              v-if="auth.can('productos.ver')"
              clickable
              v-ripple
              to="/productos"
            >
              <q-item-section avatar>
                <q-icon name="inventory_2" />
              </q-item-section>
              <q-item-section>
                Productos
              </q-item-section>
            </q-item>
            <q-item
              v-if="auth.can('usuarios.ver')"
              clickable
              v-ripple
              to="/usuarios"
            >
              <q-item-section avatar>
                <q-icon name="group" />
              </q-item-section>
              <q-item-section>Usuarios</q-item-section>
            </q-item>
            <q-item
              v-if="auth.can('compras.ver')"
              clickable
              v-ripple
              to="/compras"
            >
              <q-item-section avatar>
                <q-icon name="shopping_bag" />
              </q-item-section>
              <q-item-section>Compras</q-item-section>
            </q-item>
            <q-item
              v-if="auth.can('ventas.ver')"
              clickable
              v-ripple
              to="/ventas"
            >
              <q-item-section avatar>
                <q-icon name="point_of_sale" />
              </q-item-section>
              <q-item-section>Ventas</q-item-section>
            </q-item>
            <q-item
              v-if="auth.can('inventario.ver')"
              clickable
              v-ripple
              to="/inventario"
            >
              <q-item-section avatar>
                <q-icon name="warehouse" />
              </q-item-section>
              <q-item-section>
                Inventario y Kardex
              </q-item-section>
            </q-item>
            <q-item
              v-if="auth.can('gastos.ver')"
              clickable
              v-ripple
              to="/gastos"
            >
              <q-item-section avatar>
                <q-icon name="payments" />
              </q-item-section>
              <q-item-section>Gastos</q-item-section>
            </q-item>
            <!--<q-item
              v-if="auth.can('impuestos.ver')"
              clickable
              v-ripple
              to="/impuestos"
              ><q-item-section avatar
                ><q-icon name="account_balance" /></q-item-section
              ><q-item-section>Impuestos</q-item-section></q-item
            >-->
            <q-item
              v-if="auth.can('reportes.ver')"
              clickable
              v-ripple
              to="/utilidad"
            >
              <q-item-section avatar>
                <q-icon name="trending_up" />
              </q-item-section>
              <q-item-section>Utilidad</q-item-section>
            </q-item>
            <q-item
              v-if="esAdministrador"
              clickable
              v-ripple
              to="/auditoria"
            >
              <q-item-section avatar>
                <q-icon name="manage_history" />
              </q-item-section>
              <q-item-section>
                Auditoría
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-scroll-area>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>

    <q-dialog v-model="perfilAbierto">
      <q-card class="perfil-dialog">
        <q-card-section class="row items-center no-wrap q-pb-sm">
          <q-avatar color="primary" text-color="white" size="48px">
            {{ iniciales }}
          </q-avatar>
          <div class="q-ml-md">
            <div class="text-h6 text-weight-bold">Mi perfil</div>
            <div class="text-caption text-grey-7">
              Información de tu cuenta y negocio
            </div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" aria-label="Cerrar" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-list class="q-py-sm">
          <q-item>
            <q-item-section avatar><q-icon name="person_outline" color="primary" /></q-item-section>
            <q-item-section>
              <q-item-label caption>Nombre completo</q-item-label>
              <q-item-label>{{ auth.usuario?.nombre || 'No registrado' }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar><q-icon name="mail_outline" color="primary" /></q-item-section>
            <q-item-section>
              <q-item-label caption>Correo electrónico</q-item-label>
              <q-item-label>{{ auth.usuario?.correo || 'No registrado' }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar><q-icon name="storefront" color="primary" /></q-item-section>
            <q-item-section>
              <q-item-label caption>Negocio</q-item-label>
              <q-item-label>{{ auth.usuario?.negocio?.nombre || 'No registrado' }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar><q-icon name="admin_panel_settings" color="primary" /></q-item-section>
            <q-item-section>
              <q-item-label caption>Rol asignado</q-item-label>
              <q-item-label>{{ rolesUsuario }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar>
              <q-icon
                :name="cuentaActiva ? 'check_circle_outline' : 'cancel'"
                :color="cuentaActiva ? 'positive' : 'negative'"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>Estado de la cuenta</q-item-label>
              <q-item-label>{{ cuentaActiva ? 'Activo' : 'Inactivo' }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat color="primary" label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>
<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth } from 'src/services/auth'
import { operacionesApi } from 'src/services/sistemaApi'
import CalculaLogo from 'src/components/CalculaLogo.vue'

const leftDrawerOpen = ref(false)
const perfilAbierto = ref(false)
const notificaciones = ref([])
const cargandoNotificaciones = ref(false)
const menuNotificaciones = ref(false)
const router = useRouter()
const route = useRoute()
let temporizadorNotificaciones

const iniciales = computed(
  () =>
    auth.usuario?.nombre
      ?.split(' ')
      .slice(0, 2)
      .map((x) => x[0])
      .join('')
      .toUpperCase() || 'U',
)

const rolesUsuario = computed(() => {
  const nombres = (auth.usuario?.roles || [])
    .filter((rol) => rol.activo !== false)
    .map((rol) => rol.nombre ?? rol.name)
    .filter(Boolean)

  return nombres.length
    ? nombres.join(', ')
    : 'Sin rol asignado'
})

const esAdministrador = computed(() =>
  (auth.usuario?.roles || []).some(
    (rol) => rol.activo !== false && rol.identificador === 'administrador',
  ),
)

const puedeVerNotificaciones = computed(() => Boolean(auth.usuario))
const totalNotificaciones = computed(
  () => notificaciones.value.filter((item) => !item.leida).length,
)
const cuentaActiva = computed(
  () =>
    auth.usuario?.activo !== false && auth.usuario?.negocio?.activo !== false,
)

const numero = (valor) =>
  Number(valor || 0).toLocaleString('es-BO', { maximumFractionDigits: 4 })

async function cargarNotificaciones() {
  if (!puedeVerNotificaciones.value || cargandoNotificaciones.value) return

  cargandoNotificaciones.value = true
  try {
    const [respuestaActividad, respuestaInventario] = await Promise.all([
      operacionesApi.listarNotificaciones(),
      auth.can('inventario.ver')
        ? operacionesApi.listarInventario()
        : Promise.resolve({ data: [] }),
    ])
    const actividad = (respuestaActividad.data || []).map((item) => ({
      ...item,
      idVista: `actividad-${item.id}`,
      persistente: true,
      tipo: 'actividad',
      icono: iconoNotificacion(item.modulo, item.accion),
      color: item.leida ? 'grey-7' : 'primary',
      colorSuave: item.leida ? 'grey-2' : 'blue-grey-1',
    }))
    const alertas = (respuestaInventario.data || [])
      .filter((producto) => producto.activo !== false)
      .filter(
        (producto) =>
          Number(producto.stock_actual) <= Number(producto.stock_minimo),
      )
      .map((producto) => {
        const agotado = Number(producto.stock_actual) <= 0
        return {
          idVista: `stock-${producto.id}`,
          persistente: false,
          tipo: 'stock',
          leida: false,
          titulo: agotado ? 'Producto agotado' : 'Stock bajo',
          mensaje: `${producto.nombre} · ${producto.codigo}`,
          codigo: producto.codigo,
          stock: numero(producto.stock_actual),
          minimo: numero(producto.stock_minimo),
          icono: agotado ? 'error_outline' : 'inventory_2',
          color: agotado ? 'negative' : 'orange-9',
          colorSuave: agotado ? 'red-1' : 'orange-1',
        }
      })
      .sort((a, b) => a.titulo.localeCompare(b.titulo))
    notificaciones.value = [...alertas, ...actividad]
  } catch {
    notificaciones.value = []
  } finally {
    cargandoNotificaciones.value = false
  }
}

async function abrirNotificacion(notificacion) {
  if (notificacion.persistente && !notificacion.leida) {
    await operacionesApi.leerNotificacion(notificacion.id)
    notificacion.leida = true
  }
  const destino = notificacion.tipo === 'stock' ? '/productos' : notificacion.ruta
  if (destino && route.path !== destino) await router.push(destino)
}

async function marcarTodasLeidas() {
  await operacionesApi.leerTodasNotificaciones()
  notificaciones.value.forEach((item) => {
    if (item.persistente) item.leida = true
  })
}

function iconoNotificacion(modulo, accion) {
  if (accion === 'anular' || accion === 'desactivar') return 'cancel'
  return ({ compras: 'shopping_bag', ventas: 'point_of_sale', gastos: 'payments',
    productos: 'inventory_2', categorias: 'category', usuarios: 'group', roles: 'shield',
    utilidades: 'trending_up', impuestos: 'receipt_long' })[modulo] || 'notifications'
}

function fechaNotificacion(fecha) {
  if (!fecha) return ''
  return new Intl.DateTimeFormat('es-BO', {
    timeZone: 'America/La_Paz', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(new Date(fecha))
}

function actualizarAlRecuperarFoco() {
  if (document.visibilityState === 'visible') cargarNotificaciones()
}

onMounted(() => {
  cargarNotificaciones()
  temporizadorNotificaciones = window.setInterval(cargarNotificaciones, 30000)
  document.addEventListener('visibilitychange', actualizarAlRecuperarFoco)
})

onBeforeUnmount(() => {
  window.clearInterval(temporizadorNotificaciones)
  document.removeEventListener('visibilitychange', actualizarAlRecuperarFoco)
})

watch(
  () => route.fullPath,
  () => cargarNotificaciones(),
)

async function logout() {
  try {
    await auth.logout()
  } finally {
    await router.push('/login')
  }
}
</script>
<style scoped>
.app-header {
  background: #fff;
  color: var(--ink);
  border-bottom: 1px solid var(--line);
  box-shadow: none;
}
.brand-name {
  color: #515b5e;
  font-weight: 800;
  font-size: 17px;
  line-height: 18px;
  letter-spacing: -0.35px;
}
.business-name {
  font-size: 11px;
  color: #81889b;
}
.header-icon {
  color: #72798d;
}
.notificaciones-panel {
  width: 390px;
  max-width: calc(100vw - 24px);
  max-height: min(560px, calc(100vh - 100px));
  overflow-y: auto;
}
.perfil-dialog {
  width: 520px;
  max-width: calc(100vw - 24px);
  border-radius: 18px;
}
.role-label {
  font-size: 10px;
  color: #8a90a2;
}
.app-drawer {
  background: #fff;
  border-right: 1px solid var(--line);
}
.drawer-content {
  padding: 25px 15px;
}
.menu-caption {
  padding: 0 13px 10px;
  color: #939392;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 10px;
  font-weight: 800;
}
.menu-list .q-item {
  min-height: 48px;
  border-radius: 12px;
  margin: 4px 0;
  color: #626a7d;
  font-weight: 600;
}
.menu-list .q-item__section--avatar {
  min-width: 38px;
}
.menu-list .q-item.q-router-link--active {
  background: var(--primary-soft);
  color: #5f8f94;
}
.muted-menu {
  opacity: 0.58;
}
@media (max-width: 1023px) {
  .app-header :deep(.q-toolbar) {
    padding-left: 10px !important;
    padding-right: 10px !important;
  }
  .app-header .q-separator {
    margin-left: 8px;
    margin-right: 8px;
  }
  .header-icon {
    margin-left: auto;
  }
}
@media (max-width: 599px) {
  .brand-name {
    font-size: 15px;
  }
  .business-name {
    max-width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .app-header .q-separator {
    display: none;
  }
  .notificaciones-panel {
    width: calc(100vw - 24px);
  }
}
</style>
