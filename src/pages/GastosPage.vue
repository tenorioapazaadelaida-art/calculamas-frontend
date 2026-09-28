<template>
  <q-page
    ><div class="page-shell">
      <div class="row justify-between items-center q-mb-lg q-col-gutter-md">
        <div>
          <div class="page-title">Gastos</div>
          <div class="page-subtitle">
            Registra egresos para conocer tu utilidad real.
          </div>
        </div>
        <div class="q-gutter-sm">
          <q-btn
            v-if="auth.can('categorias_gastos.crear')"
            outline
            color="primary"
            icon="category"
            label="Nueva categoría"
            @click="abrirCategoria"
          /><q-btn
            v-if="auth.can('gastos.crear')"
            color="primary"
            icon="add"
            label="Registrar gasto"
            @click="abrirGasto"
          />
        </div>
      </div>

      <q-card class="surface-card"
        ><q-card-section
          ><div class="text-h6 text-weight-bold">
            Gastos registrados
          </div>
          <div class="text-caption text-grey-7">
            Filtra los gastos por la fecha de registro o por categoría.
          </div></q-card-section
        ><q-separator />
        <q-card-section class="filtros-gastos">
          <q-input
            :model-value="fechaFiltroVisible"
            outlined
            readonly
            label="Filtrar por fecha"
            class="filtro-fecha"
          >
            <template #prepend><q-icon name="calendar_month" color="primary" /></template>
            <template #append>
              <q-btn
                v-if="filtroFecha"
                flat round dense icon="close" color="grey-7"
                @click.stop="filtroFecha = null"
              />
              <q-icon name="arrow_drop_down" class="cursor-pointer" />
            </template>
            <q-popup-proxy
              anchor="bottom left"
              self="top left"
              :offset="[0, 8]"
              transition-show="scale"
              transition-hide="scale"
            >
              <q-card class="selector-fecha-card">
                <q-card-section class="q-pb-sm">
                  <div class="text-subtitle1 text-weight-bold">Buscar gastos por fecha</div>
                  <div class="text-caption text-grey-7">Selecciona el día que deseas consultar.</div>
                </q-card-section>
                <q-date
                  v-model="filtroFecha"
                  mask="YYYY-MM-DD"
                  color="primary"
                  :locale="calendarioEspanol"
                  minimal
                  today-btn
                />
                <q-card-actions align="right">
                  <q-btn flat label="Limpiar" color="grey-7" @click="filtroFecha = null" />
                  <q-btn flat label="Aplicar" color="primary" v-close-popup />
                </q-card-actions>
              </q-card>
            </q-popup-proxy>
          </q-input>
          <q-select
            v-model="filtroCategoria"
            :options="categorias"
            option-value="id"
            option-label="nombre"
            emit-value
            map-options
            outlined
            clearable
            label="Buscar por categoría"
          />
          <q-btn
            v-if="hayFiltros"
            flat
            color="primary"
            icon="filter_alt_off"
            label="Limpiar"
            @click="limpiarFiltros"
          />
          <div class="resultado-filtro text-caption text-grey-7">
            {{ gastosFiltrados.length }} gasto{{ gastosFiltrados.length === 1 ? '' : 's' }} encontrado{{ gastosFiltrados.length === 1 ? '' : 's' }}
          </div>
        </q-card-section
        ><q-separator />
        <q-table
          flat
          :rows="gastosFiltrados"
          :columns="columnas"
          row-key="id"
          :loading="cargando"
          :grid="$q.screen.lt.md"
        >
          <template #body-cell-acciones="p">
            <q-td :props="p" class="q-gutter-xs">
              <q-btn flat round color="primary" icon="visibility" @click="verGasto(p.row)">
                <q-tooltip>Ver gasto</q-tooltip>
              </q-btn>
              <q-btn
                v-if="auth.can('gastos.editar') && p.row.estado === 'registrado'"
                flat round color="primary" icon="edit" @click="editarGasto(p.row)"
              ><q-tooltip>Editar gasto</q-tooltip></q-btn>
              <q-btn
                v-if="auth.can('gastos.anular') && p.row.estado === 'registrado'"
                flat round color="negative" icon="cancel" @click="anularGasto(p.row)"
              ><q-tooltip>Anular gasto</q-tooltip></q-btn>
            </q-td>
          </template>
          <template #body-cell-estado="p"
            ><q-td :props="p"
              ><q-badge
                :color="p.row.estado === 'registrado' ? 'positive' : 'negative'"
                >{{
                  p.row.estado === 'registrado' ? 'Registrado' : 'Anulado'
                }}</q-badge
              ></q-td
            ></template
          >
          <template #item="p"
            ><div class="col-12 q-pa-sm">
              <q-card flat bordered class="gasto-movil"
                ><q-card-section
                  ><div class="row justify-between">
                    <strong>{{ p.row.concepto }}</strong
                    ><q-badge
                      :color="
                        p.row.estado === 'registrado' ? 'positive' : 'negative'
                      "
                      >{{ p.row.estado }}</q-badge
                    >
                  </div>
                  <div class="text-caption text-grey-7 q-mt-xs">
                    {{ p.row.categoria?.nombre || 'Sin categoría' }} ·
                    {{ fechaVisible(p.row.fecha) }}
                  </div>
                  <div class="periodo-badge q-mt-sm">
                    <q-icon name="event_repeat" /> {{ periodoVisible(p.row) }}
                  </div>
                  <div class="text-h6 text-primary q-mt-md">
                    Bs {{ moneda(p.row.monto) }}
                  </div>
                  <div class="row justify-end q-gutter-xs q-mt-sm">
                    <q-btn flat round color="primary" icon="visibility" @click="verGasto(p.row)" />
                    <q-btn
                      v-if="auth.can('gastos.editar') && p.row.estado === 'registrado'"
                      flat round color="primary" icon="edit" @click="editarGasto(p.row)"
                    />
                    <q-btn
                      v-if="auth.can('gastos.anular') && p.row.estado === 'registrado'"
                      flat round color="negative" icon="cancel" @click="anularGasto(p.row)"
                    />
                  </div></q-card-section
                ></q-card
              >
            </div></template
          >
          <template #no-data
            ><div class="full-width text-center q-pa-xl text-grey-6">
              {{ hayFiltros ? 'No existen gastos que coincidan con los filtros.' : 'Aún no registraste gastos.' }}
            </div></template
          >
        </q-table>
      </q-card>

      <q-card
        v-if="auth.can('categorias_gastos.ver')"
        class="surface-card q-mt-lg"
        ><q-card-section
          class="row items-center justify-between q-col-gutter-md"
          ><div>
            <div class="text-h6 text-weight-bold">Categorías de gastos</div>
            <div class="text-caption text-grey-7">
              Aquí aparecen las categorías que registraste.
            </div>
          </div>
          <q-badge color="primary" class="q-pa-sm"
            >{{ categorias.length }} registrada{{
              categorias.length === 1 ? '' : 's'
            }}</q-badge
          ></q-card-section
        ><q-separator />
        <q-table
          flat
          :rows="categorias"
          :columns="columnasCategorias"
          row-key="id"
          :loading="cargando"
          :pagination="{ rowsPerPage: 5 }"
          :grid="$q.screen.lt.md"
        >
          <template #body-cell-acciones="p">
            <q-td :props="p" class="q-gutter-xs">
              <q-btn
                v-if="auth.can('categorias_gastos.editar')"
                flat round color="primary" icon="edit" @click="editarCategoria(p.row)"
              ><q-tooltip>Editar categoría</q-tooltip></q-btn>
              <q-btn
                v-if="auth.can('categorias_gastos.desactivar')"
                flat round
                :color="p.row.activo !== false ? 'negative' : 'positive'"
                :icon="p.row.activo !== false ? 'toggle_off' : 'toggle_on'"
                @click="cambiarEstadoCategoria(p.row)"
              ><q-tooltip>{{ p.row.activo !== false ? 'Desactivar' : 'Activar' }}</q-tooltip></q-btn>
            </q-td>
          </template>
          <template #item="p">
            <div class="col-12 q-pa-sm">
              <q-card flat bordered class="responsive-data-card">
                <q-card-section>
                  <div class="row justify-between no-wrap">
                    <strong>{{ p.row.nombre }}</strong>
                    <q-badge :color="p.row.activo !== false ? 'positive' : 'grey'">{{ p.row.activo !== false ? 'Activa' : 'Inactiva' }}</q-badge>
                  </div>
                  <div class="text-caption text-grey-7 q-mt-sm">Deducible para IUE: {{ p.row.deducible_iue ? 'Sí' : 'No' }}</div>
                </q-card-section>
                <q-separator />
                <q-card-actions align="right">
                  <q-btn v-if="auth.can('categorias_gastos.editar')" flat round dense color="primary" icon="edit" @click="editarCategoria(p.row)" />
                  <q-btn v-if="auth.can('categorias_gastos.desactivar')" flat round dense :color="p.row.activo !== false ? 'negative' : 'positive'" :icon="p.row.activo !== false ? 'toggle_off' : 'toggle_on'" @click="cambiarEstadoCategoria(p.row)" />
                </q-card-actions>
              </q-card>
            </div>
          </template>
          <template #body-cell-deducible="p"
            ><q-td :props="p"
              ><q-badge :color="p.row.deducible_iue ? 'positive' : 'grey-6'">{{
                p.row.deducible_iue ? 'Sí' : 'No'
              }}</q-badge></q-td
            ></template
          >
          <template #body-cell-estado="p"
            ><q-td :props="p"
              ><q-badge
                :color="p.row.activo !== false ? 'positive' : 'negative'"
                >{{ p.row.activo !== false ? 'Activa' : 'Inactiva' }}</q-badge
              ></q-td
            ></template
          >
          <template #no-data
            ><div class="full-width text-center q-pa-lg text-grey-6">
              Todavía no registraste categorías de gastos.
            </div></template
          >
        </q-table>
      </q-card>

      <q-dialog v-model="dialogoCategoria"
        ><q-card class="categoria-dialog"
          ><q-card-section class="row items-center"
            ><div class="text-h6 text-weight-bold">
              {{ categoriaEditandoId ? 'Editar categoría de gasto' : 'Nueva categoría de gasto' }}
            </div>
            <q-space /><q-btn
              flat
              round
              dense
              icon="close"
              v-close-popup /></q-card-section
          ><q-separator /><q-card-section
            ><q-input
              v-model="categoria.nombre"
              outlined
              label="Nombre *"
              autofocus
              @update:model-value="
                (valor) => normalizarPrimera(categoria, 'nombre', valor)
              " /><q-toggle
              v-model="categoria.deducible_iue"
              label="Deducible para IUE"
              class="q-mt-md" /></q-card-section
          ><q-card-actions align="right"
            ><q-btn flat label="Cancelar" v-close-popup /><q-btn
              color="primary"
              icon="save"
              :label="categoriaEditandoId ? 'Guardar cambios' : 'Guardar'"
              :loading="guardandoCategoria"
              :disable="!categoria.nombre.trim()"
              @click="guardarCategoria" /></q-card-actions></q-card
      ></q-dialog>

      <q-dialog v-model="dialogo"
        ><q-card class="gasto-dialog">
          <q-card-section class="row items-center"
            ><div class="text-h6 text-weight-bold">{{ gastoEditandoId ? 'Editar gasto' : 'Registrar gasto' }}</div>
            <q-space /><q-btn
              flat
              round
              dense
              icon="close"
              v-close-popup /></q-card-section
          ><q-separator />
          <q-card-section class="row q-col-gutter-md">
            <q-input
              class="col-12 col-sm-6"
              v-model="form.fecha"
              type="date"
              outlined
              stack-label
              label="Fecha de pago *"
            />
            <q-select
              class="col-12 col-sm-6"
              v-model="form.categoria_gasto_id"
              :options="categoriasActivas"
              option-value="id"
              option-label="nombre"
              emit-value
              map-options
              outlined
              label="Categoría *"
            />
            <q-input
              class="col-12"
              v-model="form.concepto"
              outlined
              label="Concepto *"
              @update:model-value="
                (valor) => normalizarPrimera(form, 'concepto', valor)
              "
            />
            <div class="col-12 seccion-periodo">
              <div class="text-weight-bold">
                <q-icon name="event_repeat" color="primary" /> ¿A qué periodo
                corresponde este pago?
              </div>
              <div class="text-caption text-grey-7">
                Esto permite identificar si pagaste un día, un mes o una gestión
                completa.
              </div>
            </div>
            <q-select
              class="col-12 col-sm-6"
              v-model="form.periodicidad"
              :options="opcionesPeriodicidad"
              emit-value
              map-options
              outlined
              label="Tipo de periodo *"
            />
            <q-input
              v-if="form.periodicidad === 'diario'"
              class="col-12 col-sm-6"
              v-model="periodoDia"
              type="date"
              outlined
              stack-label
              label="Día que estás pagando *"
            />
            <q-input
              v-if="form.periodicidad === 'mensual'"
              class="col-12 col-sm-6"
              v-model="periodoMes"
              type="month"
              outlined
              stack-label
              label="Mes que estás pagando *"
            />
            <q-input
              v-if="form.periodicidad === 'anual'"
              class="col-12 col-sm-6"
              v-model.number="periodoGestion"
              type="number"
              min="2000"
              max="2100"
              outlined
              label="Gestión que estás pagando *"
            />
            <q-banner
              v-if="form.periodicidad !== 'unico'"
              rounded
              class="col-12 bg-blue-1 text-blue-9"
              ><template #avatar><q-icon name="calendar_month" /></template
              >{{ resumenPeriodoFormulario }}</q-banner
            >
            <q-input
              class="col-12 col-sm-6"
              v-model.number="form.monto"
              type="number"
              min="0.01"
              step="0.01"
              prefix="Bs"
              outlined
              label="Monto *"
            />
            <q-toggle
              class="col-12 col-sm-6"
              v-model="form.con_factura"
              label="Con factura"
            />
          </q-card-section>
          <q-card-actions align="right"
            ><q-btn flat label="Cancelar" v-close-popup /><q-btn
              color="primary"
              icon="save"
              :label="gastoEditandoId ? 'Guardar cambios' : 'Guardar gasto'"
              :loading="guardandoGasto"
              :disable="
                !form.categoria_gasto_id ||
                !form.concepto.trim() ||
                Number(form.monto) <= 0 ||
                !periodoCompleto
              "
              @click="guardar"
          /></q-card-actions> </q-card
      ></q-dialog>

      <q-dialog v-model="dialogoDetalle">
        <q-card class="categoria-dialog">
          <q-card-section class="row items-center">
            <div class="text-h6 text-weight-bold">Detalle del gasto</div>
            <q-space /><q-btn flat round dense icon="close" v-close-popup />
          </q-card-section>
          <q-separator />
          <q-card-section v-if="gastoSeleccionado" class="q-gutter-md">
            <div><strong>Concepto:</strong> {{ gastoSeleccionado.concepto }}</div>
            <div><strong>Categoría:</strong> {{ gastoSeleccionado.categoria?.nombre }}</div>
            <div><strong>Fecha:</strong> {{ fechaVisible(gastoSeleccionado.fecha) }}</div>
            <div><strong>Periodo pagado:</strong> {{ periodoVisible(gastoSeleccionado) }}</div>
            <div><strong>Monto:</strong> Bs {{ moneda(gastoSeleccionado.monto) }}</div>
            <div><strong>Factura:</strong> {{ gastoSeleccionado.con_factura ? 'Sí' : 'No' }}</div>
            <div><strong>Estado:</strong> {{ gastoSeleccionado.estado === 'registrado' ? 'Registrado' : 'Anulado' }}</div>
          </q-card-section>
          <q-card-actions align="right"><q-btn flat label="Cerrar" v-close-popup /></q-card-actions>
        </q-card>
      </q-dialog></div
  ></q-page>
</template>

<script setup>
import { auth } from 'src/services/auth'
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { operacionesApi } from 'src/services/sistemaApi'
import { fechaHoyBolivia, gestionActualBolivia } from 'src/utils/fechaBolivia'

const $q = useQuasar()
const gastos = ref([]),
  categorias = ref([]),
  dialogo = ref(false),
  dialogoCategoria = ref(false),
  dialogoDetalle = ref(false),
  gastoSeleccionado = ref(null),
  gastoEditandoId = ref(null),
  categoriaEditandoId = ref(null),
  cargando = ref(false),
  guardandoCategoria = ref(false),
  guardandoGasto = ref(false)
const filtroFecha = ref(null),
  filtroCategoria = ref(null)
const categoria = reactive({ nombre: '', deducible_iue: true })
const hoy = fechaHoyBolivia()
const form = reactive({
  fecha: hoy,
  categoria_gasto_id: null,
  concepto: '',
  periodicidad: 'mensual',
  monto: 0,
  con_factura: false,
})
const periodoDia = ref(hoy),
  periodoMes = ref(hoy.slice(0, 7)),
  periodoGestion = ref(gestionActualBolivia())
const opcionesPeriodicidad = [
  { label: 'Pago de un mes', value: 'mensual' },
  { label: 'Pago de un día', value: 'diario' },
  { label: 'Pago anual', value: 'anual' },
  { label: 'Pago único (sin periodo)', value: 'unico' },
]
const calendarioEspanol = {
  days: [
    'domingo',
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
  ],
  daysShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  months: [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ],
  monthsShort: [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ],
  firstDayOfWeek: 1,
  format24h: true,
  pluralDay: 'días',
}
const categoriasActivas = computed(() =>
  categorias.value.filter((item) => item.activo !== false),
)
const hayFiltros = computed(
  () =>
    Boolean(filtroFecha.value) ||
    Boolean(filtroCategoria.value),
)
const fechaFiltroVisible = computed(() => {
  if (!filtroFecha.value) return ''
  return fechaVisible(filtroFecha.value)
})
const gastosFiltrados = computed(() =>
  gastos.value.filter((gasto) => {
    const fecha = String(gasto.fecha || '').slice(0, 10)
    if (filtroFecha.value && fecha !== filtroFecha.value) return false
    if (
      filtroCategoria.value &&
      Number(gasto.categoria_gasto_id) !== Number(filtroCategoria.value)
    )
      return false
    return true
  }),
)
const periodoCompleto = computed(
  () =>
    form.periodicidad === 'unico' ||
    (form.periodicidad === 'diario' && periodoDia.value) ||
    (form.periodicidad === 'mensual' && periodoMes.value) ||
    (form.periodicidad === 'anual' && Number(periodoGestion.value) >= 2000),
)
const resumenPeriodoFormulario = computed(() =>
  form.periodicidad === 'diario'
    ? `Registrarás este gasto para el día ${fechaVisible(periodoDia.value)}.`
    : form.periodicidad === 'mensual'
      ? `Registrarás este gasto para el mes de ${mesVisible(periodoMes.value)}.`
      : `Registrarás este gasto para la gestión ${periodoGestion.value}.`,
)
const columnas = [
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'left' },
  {
    name: 'fecha',
    label: 'Fecha',
    field: (r) => fechaVisible(r.fecha),
    align: 'left',
  },
  {
    name: 'categoria',
    label: 'Categoría',
    field: (r) => r.categoria?.nombre || 'Sin categoría',
    align: 'left',
  },
  {
    name: 'periodo',
    label: 'Periodo pagado',
    field: (r) => periodoVisible(r),
    align: 'left',
  },
  { name: 'concepto', label: 'Concepto', field: 'concepto', align: 'left' },
  {
    name: 'monto',
    label: 'Monto',
    field: (r) => `Bs ${moneda(r.monto)}`,
    align: 'right',
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
]
const columnasCategorias = [
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  {
    name: 'deducible',
    label: 'Deducible para IUE',
    field: 'deducible_iue',
    align: 'center',
  },
  { name: 'estado', label: 'Estado', field: 'activo', align: 'center' },
]
const moneda = (valor) =>
  Number(valor || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
const fechaVisible = (fecha) =>
  fecha
    ? new Intl.DateTimeFormat('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(fecha))
    : ''
const mesVisible = (mes) =>
  mes
    ? new Intl.DateTimeFormat('es-BO', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(`${mes}-01T00:00:00Z`))
    : ''
function periodoVisible(gasto) {
  if (gasto.periodicidad === 'mensual')
    return new Intl.DateTimeFormat('es-BO', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(gasto.periodo_desde))
  if (gasto.periodicidad === 'anual')
    return `Gestión ${String(gasto.periodo_desde || '').slice(0, 4)}`
  if (gasto.periodicidad === 'diario')
    return `Día ${fechaVisible(gasto.periodo_desde)}`
  return 'Pago único'
}
function referenciaPeriodo() {
  if (form.periodicidad === 'diario') return periodoDia.value
  if (form.periodicidad === 'mensual') return `${periodoMes.value}-01`
  if (form.periodicidad === 'anual') return `${periodoGestion.value}-01-01`
  return null
}
function limpiarFiltros() {
  filtroFecha.value = null
  filtroCategoria.value = null
}
function normalizarPrimera(objeto, campo, valor) {
  const texto = String(valor || '')
  objeto[campo] = texto
    ? texto.charAt(0).toLocaleUpperCase('es') + texto.slice(1)
    : ''
}
function abrirCategoria() {
  categoriaEditandoId.value = null
  categoria.nombre = ''
  categoria.deducible_iue = true
  dialogoCategoria.value = true
}
function editarCategoria(item) {
  categoriaEditandoId.value = item.id
  categoria.nombre = item.nombre
  categoria.deducible_iue = Boolean(item.deducible_iue)
  dialogoCategoria.value = true
}
function abrirGasto() {
  gastoEditandoId.value = null
  reiniciarFormularioGasto()
  dialogo.value = true
}
function editarGasto(gasto) {
  gastoEditandoId.value = gasto.id
  Object.assign(form, {
    fecha: String(gasto.fecha).slice(0, 10),
    categoria_gasto_id: gasto.categoria_gasto_id,
    concepto: gasto.concepto,
    periodicidad: gasto.periodicidad,
    monto: Number(gasto.monto),
    con_factura: Boolean(gasto.con_factura),
  })
  const referencia = String(gasto.periodo_desde || gasto.fecha).slice(0, 10)
  periodoDia.value = referencia
  periodoMes.value = referencia.slice(0, 7)
  periodoGestion.value = Number(referencia.slice(0, 4))
  dialogo.value = true
}
async function verGasto(gasto) {
  try {
    gastoSeleccionado.value = (await operacionesApi.obtenerGasto(gasto.id)).data
    dialogoDetalle.value = true
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: e.response?.data?.message || 'No se pudo cargar el gasto.',
    })
  }
}
function reiniciarFormularioGasto() {
  Object.assign(form, {
    fecha: hoy,
    categoria_gasto_id: null,
    concepto: '',
    periodicidad: 'mensual',
    monto: 0,
    con_factura: false,
  })
  periodoDia.value = hoy
  periodoMes.value = hoy.slice(0, 7)
  periodoGestion.value = gestionActualBolivia()
}
async function cargar() {
  cargando.value = true
  try {
    const [g, c] = await Promise.all([
      operacionesApi.listarGastos(),
      operacionesApi.listarCategoriasGastos(),
    ])
    gastos.value = g.data
    categorias.value = c.data
  } catch (e) {
    $q.notify({
      type: 'negative',
      message:
        e.response?.data?.message ||
        'No se pudieron cargar los gastos y categorías.',
    })
  } finally {
    cargando.value = false
  }
}
async function guardarCategoria() {
  guardandoCategoria.value = true
  try {
    const { data } = categoriaEditandoId.value
      ? await operacionesApi.actualizarCategoriaGasto(categoriaEditandoId.value, categoria)
      : await operacionesApi.crearCategoriaGasto(categoria)
    const indice = categorias.value.findIndex((item) => item.id === data.id)
    if (indice >= 0) categorias.value.splice(indice, 1, data)
    else categorias.value.push(data)
    categorias.value.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    form.categoria_gasto_id = data.id
    dialogoCategoria.value = false
    $q.notify({
      type: 'positive',
      message: categoriaEditandoId.value
        ? 'Categoría actualizada correctamente.'
        : 'Categoría creada y visible en la lista.',
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message:
        e.response?.data?.message ||
        Object.values(e.response?.data?.errors || {})[0]?.[0] ||
        'No se pudo crear la categoría.',
    })
  } finally {
    guardandoCategoria.value = false
  }
}
async function guardar() {
  guardandoGasto.value = true
  try {
    const datos = {
      ...form,
      periodo_referencia: referenciaPeriodo(),
    }
    if (gastoEditandoId.value)
      await operacionesApi.actualizarGasto(gastoEditandoId.value, datos)
    else await operacionesApi.crearGasto(datos)
    dialogo.value = false
    const fueEdicion = Boolean(gastoEditandoId.value)
    gastoEditandoId.value = null
    reiniciarFormularioGasto()
    await cargar()
    $q.notify({
      type: 'positive',
      message: fueEdicion
        ? 'Gasto actualizado correctamente.'
        : 'Gasto registrado con su periodo de pago.',
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message:
        e.response?.data?.message ||
        Object.values(e.response?.data?.errors || {})[0]?.[0] ||
        'No se pudo registrar el gasto.',
    })
  } finally {
    guardandoGasto.value = false
  }
}
function anularGasto(gasto) {
  $q.dialog({
    title: 'Anular gasto',
    message: `¿Deseas anular el gasto "${gasto.concepto}"? El registro se conservará para control.`,
    cancel: { flat: true, label: 'Cancelar' },
    ok: { color: 'negative', label: 'Anular gasto' },
  }).onOk(async () => {
    try {
      await operacionesApi.anularGasto(gasto.id)
      await cargar()
      $q.notify({ type: 'positive', message: 'Gasto anulado correctamente.' })
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: e.response?.data?.message || 'No se pudo anular el gasto.',
      })
    }
  })
}
function cambiarEstadoCategoria(item) {
  const accion = item.activo !== false ? 'desactivar' : 'activar'
  $q.dialog({
    title: `${accion.charAt(0).toUpperCase()}${accion.slice(1)} categoría`,
    message: `¿Deseas ${accion} la categoría "${item.nombre}"?`,
    cancel: { flat: true, label: 'Cancelar' },
    ok: { color: item.activo !== false ? 'negative' : 'positive', label: accion },
  }).onOk(async () => {
    try {
      await operacionesApi.cambiarEstadoCategoriaGasto(item.id)
      await cargar()
      $q.notify({ type: 'positive', message: `Categoría ${accion === 'activar' ? 'activada' : 'desactivada'}.` })
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: e.response?.data?.message || `No se pudo ${accion} la categoría.`,
      })
    }
  })
}
onMounted(cargar)
</script>

<style scoped>
.categoria-dialog {
  width: 430px;
  max-width: 94vw;
  border-radius: 18px;
}
.gasto-dialog {
  width: 680px;
  max-width: 94vw;
  border-radius: 18px;
}
.gasto-movil {
  height: 100%;
  border-radius: 14px;
}
.filtros-gastos {
  display: grid;
  grid-template-columns: minmax(260px, 1.35fr) minmax(220px, 1fr) auto;
  gap: 12px;
  align-items: center;
}
.selector-fecha-card {
  width: 286px;
  max-width: 90vw;
  border-radius: 14px;
}
.selector-fecha-card .q-date {
  width: 100%;
  min-width: 0;
  font-size: 0.88rem;
}
.selector-fecha-card .q-card__section {
  padding: 14px 16px 6px;
}
.selector-fecha-card .q-card__actions {
  padding: 4px 10px 10px;
}
.selector-fecha-card :deep(.q-date__calendar-weekdays > div),
.selector-fecha-card :deep(.q-date__calendar-item) {
  font-size: 0.78rem;
}
.resultado-filtro {
  grid-column: 1 / -1;
}
.seccion-periodo {
  padding-top: 18px;
}
.periodo-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: 9px;
  background: #eef6f6;
  color: #35646a;
  font-size: 0.78rem;
}
@media (max-width: 599px) {
  .filtros-gastos {
    grid-template-columns: 1fr;
  }
  .resultado-filtro {
    grid-column: auto;
  }
  .categoria-dialog,
  .gasto-dialog {
    width: 96vw;
    max-width: 96vw;
    border-radius: 14px;
  }
  .q-card__actions .q-btn {
    flex: 1 1 auto;
  }
}
@media (min-width: 600px) and (max-width: 1100px) {
  .filtros-gastos {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }
}
</style>
