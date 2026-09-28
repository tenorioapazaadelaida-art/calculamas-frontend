<template>
  <q-page
    ><div class="page-shell">
      <div class="hero row items-center justify-between q-mb-lg">
        <div>
          <div class="eyebrow">RESUMEN DEL NEGOCIO</div>
          <div class="page-title">Hola, {{ primerNombre }} 👋</div>
          <div class="page-subtitle">
            Aquí tienes una vista rápida de
            {{ auth.usuario?.negocio?.nombre }}.
          </div>
        </div>
        <div class="today gt-sm">
          <q-icon name="calendar_today" /> {{ fecha }}
        </div>
      </div>
      <div class="row q-col-gutter-lg">
        <div
          v-for="item in indicadores"
          :key="item.label"
          class="col-12 col-sm-6 col-lg-3"
        >
          <q-card
            class="metric-card surface-card"
            :class="{ 'metric-card--clickable': item.to }"
            @click="item.to && $router.push(item.to)"
            ><q-card-section class="row no-wrap items-center"
              ><div
                class="metric-icon"
                :style="{ background: item.soft, color: item.color }"
              >
                <q-icon :name="item.icon" size="25px" />
              </div>
              <div class="q-ml-md">
                <div class="metric-label">{{ item.label }}</div>
                <div class="metric-value">{{ item.value }}</div>
                <div class="metric-note" :class="item.noteClass">
                  {{ item.note }}
                </div>
              </div></q-card-section
            ></q-card
          >
        </div>
      </div>
      <div class="row q-col-gutter-lg q-mt-xs">
        <div class="col-12 col-lg-8">
          <q-card class="surface-card quick-card"
            ><q-card-section
              ><div class="section-title">Accesos rápidos</div>
              <div class="section-copy">
                Las tareas más frecuentes, a un clic.
              </div></q-card-section
            ><q-card-section class="row q-col-gutter-md q-pt-sm"
              ><div
                v-for="a in accionesPermitidas"
                :key="a.label"
                class="col-6 col-sm-3"
              >
                <div class="quick-action" @click="$router.push(a.to)">
                  <q-icon :name="a.icon" :color="a.color" size="27px" />
                  <div class="text-weight-bold q-mt-sm">{{ a.label }}</div>
                  <div class="quick-copy">{{ a.copy }}</div>
                </div>
              </div></q-card-section
            ></q-card
          >
        </div>
        <div class="col-12 col-lg-4">
          <q-card class="surface-card guide-card"
            ><q-card-section
              ><div class="row items-center">
                <q-avatar
                  color="amber-2"
                  text-color="orange-9"
                  icon="lightbulb"
                />
                <div class="q-ml-sm">
                  <div class="section-title">Tu siguiente paso</div>
                  <div class="section-copy">{{ siguientePaso }}</div>
                </div>
              </div>
              <q-linear-progress
                rounded
                size="8px"
                :value="progresoInicial"
                color="primary"
                track-color="grey-3"
                class="q-mt-lg" />
              <div class="row justify-between q-mt-xs">
                <span class="text-caption text-grey-7">Progreso inicial</span
                ><span class="text-caption text-weight-bold text-primary"
                  >{{ porcentajeInicial }}%</span
                >
              </div>
              <q-list class="step-list q-mt-md"
                ><q-item
                  ><q-item-section avatar
                    ><q-icon
                      name="check_circle"
                      color="positive" /></q-item-section
                  ><q-item-section>Negocio registrado</q-item-section></q-item
                ><q-item
                  :clickable="!tieneProductos && auth.can('productos.crear')"
                  :to="!tieneProductos && auth.can('productos.crear') ? '/productos' : undefined"
                  ><q-item-section avatar
                    ><q-icon
                      :name="tieneProductos ? 'check_circle' : 'radio_button_unchecked'"
                      :color="tieneProductos ? 'positive' : 'grey-5'" /></q-item-section
                  ><q-item-section>{{ tieneProductos ? 'Productos registrados' : 'Agrega tu primer producto' }}</q-item-section
                  ><q-item-section v-if="!tieneProductos && auth.can('productos.crear')" side
                    ><q-icon
                      name="chevron_right" /></q-item-section></q-item
                ><q-item
                  :clickable="tieneProductos && !tieneCompras && auth.can('compras.crear')"
                  :to="tieneProductos && !tieneCompras && auth.can('compras.crear') ? '/compras' : undefined"
                  ><q-item-section avatar
                    ><q-icon
                      :name="tieneCompras ? 'check_circle' : 'radio_button_unchecked'"
                      :color="tieneCompras ? 'positive' : 'grey-5'" /></q-item-section
                  ><q-item-section>{{ tieneCompras ? 'Primera compra registrada' : 'Registra tu primera compra' }}</q-item-section
                  ><q-item-section v-if="tieneProductos && !tieneCompras && auth.can('compras.crear')" side
                    ><q-icon name="chevron_right" /></q-item-section></q-item
                ><q-item
                  :clickable="tieneCompras && !tieneVentas && auth.can('ventas.crear')"
                  :to="tieneCompras && !tieneVentas && auth.can('ventas.crear') ? '/ventas' : undefined"
                  ><q-item-section avatar
                    ><q-icon
                      :name="tieneVentas ? 'check_circle' : 'radio_button_unchecked'"
                      :color="tieneVentas ? 'positive' : 'grey-5'" /></q-item-section
                  ><q-item-section>{{ tieneVentas ? 'Primera venta registrada' : 'Registra tu primera venta' }}</q-item-section
                  ><q-item-section v-if="tieneCompras && !tieneVentas && auth.can('ventas.crear')" side
                    ><q-icon name="chevron_right" /></q-item-section></q-item></q-list></q-card-section
          ></q-card>
        </div>
      </div></div
  ></q-page>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import { auth } from 'src/services/auth'
import { reportesApi } from 'src/services/sistemaApi'
import { ZONA_HORARIA_BOLIVIA } from 'src/utils/fechaBolivia'
const resumen = ref({
  productos: 0,
  compras: 0,
  ventas: 0,
  stock_total: 0,
  stock_bajo: 0,
  ventas_total: 0,
  ventas_mes: 0,
  utilidad_mes: 0,
})
const tieneProductos = computed(() => Number(resumen.value.productos) > 0)
const tieneCompras = computed(() => Number(resumen.value.compras) > 0)
const tieneVentas = computed(() => Number(resumen.value.ventas) > 0)
const progresoInicial = computed(
  () =>
    (1 +
      Number(tieneProductos.value) +
      Number(tieneCompras.value) +
      Number(tieneVentas.value)) /
    4,
)
const porcentajeInicial = computed(() =>
  Math.round(progresoInicial.value * 100),
)
const siguientePaso = computed(() => {
  if (!tieneProductos.value) return 'Agrega los productos de tu negocio'
  if (!tieneCompras.value) return 'Registra una compra para actualizar el stock'
  if (!tieneVentas.value) return 'Registra tu primera venta'
  return 'Configuración inicial completada'
})
const primerNombre = computed(
  () => auth.usuario?.nombre?.split(' ')[0] || 'Emprendedor',
)
const fecha = new Intl.DateTimeFormat('es-BO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: ZONA_HORARIA_BOLIVIA,
}).format(new Date())
const mesActual = new Intl.DateTimeFormat('es-BO', {
  month: 'long',
  timeZone: ZONA_HORARIA_BOLIVIA,
}).format(new Date())
const indicadores = computed(() => [
  {
    label: 'Productos',
    value: String(resumen.value.productos),
    note: 'En tu catálogo',
    icon: 'inventory_2',
    color: '#5f8f94',
    soft: '#e2f0f1',
  },
  {
    label: 'Ventas registradas',
    value: `Bs ${Number(resumen.value.ventas_total).toFixed(2)}`,
    note: `Este mes: Bs ${Number(resumen.value.ventas_mes).toFixed(2)}`,
    icon: 'point_of_sale',
    color: '#16a66a',
    soft: '#e9f9f1',
  },
  {
    label: 'Stock disponible',
    value: `${Number(resumen.value.stock_total).toLocaleString('es-BO', { maximumFractionDigits: 4 })} unidades`,
    note: `${resumen.value.stock_bajo} productos con stock bajo`,
    icon: 'inventory',
    color: '#f59e0b',
    soft: '#fff6df',
  },
  {
    label: `Resultado de ${mesActual}`,
    value: `Bs ${Number(resumen.value.utilidad_mes).toFixed(2)}`,
    note:
      Number(resumen.value.utilidad_mes) >= 0
        ? 'Utilidad neta del mes'
        : 'Pérdida neta del mes',
    icon: 'trending_up',
    color: '#3b82f6',
    soft: '#eaf3ff',
    to: '/utilidad',
  },
])
const acciones = [
  {
    label: 'Nuevo producto',
    copy: 'Amplía tu catálogo',
    icon: 'add_box',
    color: 'primary',
    to: '/productos',
    permiso: 'productos.crear',
  },
  {
    label: 'Registrar compra',
    copy: 'Actualiza tu stock',
    icon: 'shopping_bag',
    color: 'teal',
    to: '/compras',
    permiso: 'compras.crear',
  },
  {
    label: 'Nueva venta',
    copy: 'Registra un ingreso',
    icon: 'receipt_long',
    color: 'orange',
    to: '/ventas',
    permiso: 'ventas.crear',
  },
  {
    label: 'Ver reportes',
    copy: 'Conoce tu utilidad',
    icon: 'bar_chart',
    color: 'blue',
    to: '/utilidad',
    permiso: 'reportes.ver',
  },
]
const accionesPermitidas = computed(() =>
  acciones.filter((accion) => auth.can(accion.permiso)),
)
onMounted(async () => {
  resumen.value = (await reportesApi.dashboard()).data
})
</script>
<style scoped>
.eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.3px;
  color: #7669de;
  margin-bottom: 6px;
}
.today {
  padding: 10px 15px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: #fff;
  color: #747b8d;
  font-size: 12px;
  text-transform: capitalize;
}
.metric-card {
  transition: 0.2s;
}
.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow);
}
.metric-card--clickable {
  cursor: pointer;
}
.metric-icon {
  width: 52px;
  height: 52px;
  border-radius: 15px;
  display: grid;
  place-items: center;
}
.metric-label {
  font-size: 12px;
  color: #7b8294;
  font-weight: 600;
}
.metric-value {
  font-size: 23px;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.metric-note {
  font-size: 10px;
  color: #9aa0af;
}
.section-title {
  font-size: 16px;
  font-weight: 800;
}
.section-copy {
  font-size: 12px;
  color: #8b91a1;
}
.quick-card,
.guide-card {
  min-height: 290px;
}
.quick-action {
  height: 150px;
  padding: 22px 12px;
  border: 1px solid var(--line);
  border-radius: 16px;
  text-align: center;
  cursor: pointer;
  transition: 0.2s;
}
.quick-action:hover {
  border-color: #c8c2f7;
  background: #faf9ff;
  transform: translateY(-2px);
}
.quick-copy {
  font-size: 10px;
  color: #969baa;
  margin-top: 3px;
}
.step-list .q-item {
  border-radius: 11px;
  min-height: 45px;
}
.step-list .q-item__section--avatar {
  min-width: 34px;
}
@media (max-width: 700px) {
  .hero {
    align-items: flex-start;
  }
  .metric-card .q-card__section {
    padding: 14px;
  }
  .quick-card,
  .guide-card {
    min-height: auto;
  }
  .quick-action {
    height: 125px;
    padding: 16px 8px;
  }
}
@media (max-width: 420px) {
  .quick-action {
    height: 112px;
  }
  .quick-copy {
    display: none;
  }
}
</style>
