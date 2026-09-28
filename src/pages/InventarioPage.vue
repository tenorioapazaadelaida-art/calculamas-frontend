<template>
  <q-page
    ><div class="page-shell">
      <div class="page-title">Inventario y Kardex</div>
      <div class="page-subtitle q-mb-lg">
        Control físico y valorizado mediante costo promedio ponderado.
      </div>

      <q-card class="surface-card"
        ><q-card-section>
          <div class="row items-center justify-between q-col-gutter-md">
            <div class="col-12 col-md">
              <div class="text-h6 text-weight-bold">Kardex general</div>
              <div class="text-grey-7">
                Todas las entradas, salidas, costos y saldos del negocio en un
                solo lugar.
              </div>
            </div>
            <div class="col-12 col-md-auto row q-gutter-sm kardex-acciones">
              <q-btn
                v-if="auth.can('kardex.ver')"
                color="primary"
                icon="history"
                label="Ver Kardex general"
                unelevated
                @click="verKardexGeneral"
              />
              <q-btn
                v-if="auth.can('kardex.ver')"
                outline
                color="primary"
                icon="picture_as_pdf"
                label="Descargar PDF"
                :loading="descargandoPdf"
                @click="descargarPdf"
              />
            </div>
          </div> </q-card-section
      ></q-card>

      <q-card
        v-if="auth.can('kardex.ver')"
        class="surface-card q-mt-lg movimientos-card"
      >
        <q-card-section>
          <div class="text-h6 text-weight-bold">Movimientos de inventario</div>
          <div class="text-grey-7">
            Compras y ventas que modificaron las existencias del inventario.
          </div>
        </q-card-section>
        <q-separator />
        <q-table
          flat
          :rows="movimientos"
          :columns="columnasMovimientos"
          row-key="id"
          :loading="cargando"
          :grid="$q.screen.lt.md"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-producto="p"
            ><q-td :props="p"
              ><strong>{{ p.row.producto?.nombre }}</strong>
              <div class="text-caption text-grey-7">
                {{ p.row.producto?.codigo }}
              </div></q-td
            ></template
          >
          <template #item="p"
            ><div class="col-12 q-pa-sm">
              <q-card flat bordered class="movimiento-movil"
                ><q-card-section
                  ><div class="row justify-between items-start q-col-gutter-md">
                    <div class="movimiento-producto">
                      <div class="text-subtitle1 text-weight-bold">
                        {{ p.row.producto?.nombre }}
                      </div>
                      <div class="text-caption text-grey-7">
                        {{ p.row.producto?.codigo }}
                      </div>
                      <q-badge
                        class="q-mt-sm"
                        :color="p.row.entrada_cantidad ? 'positive' : 'negative'"
                        :label="nombres[p.row.tipo] || p.row.tipo"
                      />
                      <div class="text-body2 q-mt-sm">
                        {{ resumenCantidad(p.row) }}
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-weight-medium">
                        {{ fechaVisible(p.row.fecha_operacion || p.row.fecha) }}
                      </div>
                      <div class="text-caption text-grey-7">
                        Hora de registro: {{ p.row.hora_registro || 'No disponible' }}
                      </div>
                    </div>
                  </div></q-card-section
                ></q-card
              >
            </div></template
          >
          <template #no-data
            ><div class="full-width text-center text-grey-6 q-pa-xl">
              <q-icon name="inventory_2" size="40px" />
              <div class="q-mt-sm">Todavía no existen entradas ni salidas.</div>
            </div></template
          >
        </q-table>
      </q-card>

      <q-dialog v-model="dialogo" maximized
        ><q-card class="kardex-dialog">
          <q-toolbar class="kardex-toolbar">
            <q-btn flat round dense icon="close" v-close-popup />
            <q-toolbar-title><strong>Kardex general</strong></q-toolbar-title>
            <q-btn
              color="primary"
              icon="picture_as_pdf"
              label="Descargar PDF"
              unelevated
              :loading="descargandoPdf"
              @click="descargarPdf"
            />
          </q-toolbar>
          <q-card-section
            ><div class="kardex-scroll">
              <table class="kardex-table">
                <thead>
                  <tr>
                    <th rowspan="2">Fecha</th>
                    <th rowspan="2" class="detalle-col">Detalle</th>
                    <th colspan="3">Control físico</th>
                    <th>Costo unitario</th>
                    <th colspan="3">Costo</th>
                  </tr>
                  <tr>
                    <th>Entrada</th>
                    <th>Salida</th>
                    <th>Saldo</th>
                    <th>Promedio</th>
                    <th>Débito</th>
                    <th>Crédito</th>
                    <th>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="m in movimientos" :key="m.id">
                    <td>{{ fechaVisible(m.fecha) }}</td>
                    <td class="detalle-col">
                      <div class="text-weight-bold">
                        {{ m.producto?.nombre }}
                        <span class="text-caption text-grey-7">{{
                          m.producto?.codigo
                        }}</span>
                      </div>
                      <div class="text-weight-medium">
                        {{ detalleMovimiento(m) }}
                      </div>
                      <div
                        v-if="m.observacion"
                        class="text-caption text-grey-7"
                      >
                        {{ m.observacion }}
                      </div>
                    </td>
                    <td class="entrada">{{ cantidad(m.entrada_cantidad) }}</td>
                    <td class="salida">{{ cantidad(m.salida_cantidad) }}</td>
                    <td class="saldo-fisico">{{ numero(m.saldo_cantidad) }}</td>
                    <td>Bs {{ moneda(m.saldo_costo_promedio, 4) }}</td>
                    <td class="entrada">{{ valor(m.entrada_total) }}</td>
                    <td class="salida">{{ valor(m.salida_total) }}</td>
                    <td class="saldo-valor">Bs {{ moneda(m.saldo_total) }}</td>
                  </tr>
                  <tr v-if="!movimientos.length">
                    <td colspan="9" class="text-center text-grey-6 q-pa-xl">
                      Todavía no existen movimientos de inventario.
                    </td>
                  </tr>
                </tbody>
                <tfoot v-if="movimientos.length">
                  <tr class="fila-total">
                    <td colspan="2">TOTAL GENERAL</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td class="entrada">Bs {{ moneda(totalesKardex.entradaTotal) }}</td>
                    <td class="salida">Bs {{ moneda(totalesKardex.salidaTotal) }}</td>
                    <td class="saldo-valor">Bs {{ moneda(totalesKardex.saldoTotal) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div></q-card-section
          >
          <q-card-section class="nota-kardex"
            ><q-icon name="verified_user" color="primary" /> El Kardex muestra
            únicamente las compras, ventas y devoluciones vigentes. Las
            ediciones y anulaciones se consultan únicamente en Auditoría.</q-card-section
          >
        </q-card></q-dialog
      >
    </div></q-page
  >
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { auth } from 'src/services/auth'
import { operacionesApi } from 'src/services/sistemaApi'
import { fechaHoyBolivia } from 'src/utils/fechaBolivia'

const $q = useQuasar()
const movimientos = ref([]),
  dialogo = ref(false),
  descargandoPdf = ref(false),
  cargando = ref(false)
const nombres = {
  entrada_compra: 'Compra',
  salida_venta: 'Venta',
  devolucion_cliente: 'Devolución del cliente',
  devolucion_proveedor: 'Devolución al proveedor',
  salida_devolucion_compra: 'Devolución al proveedor',
}
const moneda = (v, d = 2) =>
  Number(v || 0).toLocaleString('es-BO', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  })
const numero = (v) =>
  Number(v || 0).toLocaleString('es-BO', { maximumFractionDigits: 4 })
const cantidad = (v) => (Number(v || 0) > 0 ? numero(v) : '—')
const valor = (v) => (Number(v || 0) > 0 ? `Bs ${moneda(v)}` : '—')
const fechaVisible = (f) => {
  if (!f) return ''
  const coincidencia = String(f).match(/^(\d{4})-(\d{2})-(\d{2})/)
  return coincidencia
    ? `${coincidencia[3]}/${coincidencia[2]}/${coincidencia[1]}`
    : String(f)
}
const resumenCantidad = (m) =>
  Number(m.entrada_cantidad || 0) > 0
    ? `Entrada: ${numero(m.entrada_cantidad)} unidades`
    : `Salida: ${numero(m.salida_cantidad)} unidades`
const detalleMovimiento = (m) =>
  `${nombres[m.tipo] || m.tipo} · ${m.referencia_tipo || 'Movimiento'} ${m.referencia_id || ''}`
const columnasMovimientos = [
  {
    name: 'fecha',
    label: 'Fecha',
    field: (m) => fechaVisible(m.fecha_operacion || m.fecha),
    align: 'left',
  },
  {
    name: 'hora',
    label: 'Hora',
    field: (m) => m.hora_registro || 'No disponible',
    align: 'left',
  },
  {
    name: 'movimiento',
    label: 'Movimiento',
    field: (m) => nombres[m.tipo] || m.tipo,
    align: 'left',
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    field: resumenCantidad,
    align: 'left',
  },
  {
    name: 'producto',
    label: 'Producto',
    field: (m) => m.producto?.nombre || '',
    align: 'left',
  },
]
const totalesKardex = computed(() => {
  const ultimosPorProducto = new Map()
  let entradaCantidad = 0
  let salidaCantidad = 0
  let entradaTotal = 0
  let salidaTotal = 0

  movimientos.value.forEach((movimiento) => {
    entradaCantidad += Number(movimiento.entrada_cantidad || 0)
    salidaCantidad += Number(movimiento.salida_cantidad || 0)
    entradaTotal += Number(movimiento.entrada_total || 0)
    salidaTotal += Number(movimiento.salida_total || 0)
    ultimosPorProducto.set(movimiento.producto_id, movimiento)
  })

  const saldosFinales = [...ultimosPorProducto.values()]
  return {
    entradaCantidad,
    salidaCantidad,
    entradaTotal,
    salidaTotal,
    saldoCantidad: saldosFinales.reduce(
      (total, movimiento) => total + Number(movimiento.saldo_cantidad || 0),
      0,
    ),
    saldoTotal: saldosFinales.reduce(
      (total, movimiento) => total + Number(movimiento.saldo_total || 0),
      0,
    ),
  }
})

async function cargar() {
  cargando.value = true
  try {
    if (auth.can('kardex.ver'))
      movimientos.value = (await operacionesApi.obtenerKardexGeneral()).data
  } finally {
    cargando.value = false
  }
}
async function verKardexGeneral() {
  if (!movimientos.value.length)
    movimientos.value = (await operacionesApi.obtenerKardexGeneral()).data
  dialogo.value = true
}
async function descargarPdf() {
  descargandoPdf.value = true
  try {
    const { data } = await operacionesApi.descargarKardexPdf()
    const url = URL.createObjectURL(
      new Blob([data], { type: 'application/pdf' }),
    )
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `kardex-general-${fechaHoyBolivia()}.pdf`
    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()
    URL.revokeObjectURL(url)
    $q.notify({ type: 'positive', message: 'Kardex descargado en PDF.' })
  } catch {
    $q.notify({ type: 'negative', message: 'No se pudo descargar el Kardex.' })
  } finally {
    descargandoPdf.value = false
  }
}
onMounted(cargar)
</script>

<style scoped>
.resumen-card {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 100%;
  min-height: 112px;
  padding: 18px;
  border-radius: 14px;
  background: #f2f8f8;
  color: #28555b;
}
.resumen-card .q-icon {
  font-size: 30px;
  flex: 0 0 auto;
}
.resumen-card > div {
  min-width: 0;
}
.resumen-valor {
  font-size: 1.25rem;
  font-weight: 800;
  white-space: nowrap;
}
.resumen-label {
  font-size: 0.82rem;
  color: #6c7c7f;
  overflow-wrap: normal;
}
.kardex-acciones {
  align-items: center;
}
.movimiento-movil {
  height: 100%;
  border-radius: 14px;
  background: #fcfefe;
}
.movimiento-producto {
  min-width: 0;
  overflow-wrap: anywhere;
}
.kardex-toolbar {
  background: linear-gradient(135deg, #eef8f8, #fff);
  border-bottom: 1px solid #d4e2e3;
}
.kardex-scroll {
  overflow-x: auto;
  border: 1px solid #bfd3d5;
  border-radius: 14px;
}
.kardex-table {
  width: 100%;
  min-width: 1180px;
  border-collapse: collapse;
  background: #fff;
}
.kardex-table th {
  padding: 12px 10px;
  border: 1px solid #aac5c8;
  background: #e9f4f4;
  color: #294f54;
  text-transform: uppercase;
  font-size: 0.76rem;
}
.kardex-table thead tr:nth-child(2) th {
  background: #f3f8f8;
}
.kardex-table td {
  padding: 11px 10px;
  border: 1px solid #d3dfe0;
  text-align: right;
  white-space: nowrap;
}
.kardex-table tfoot td {
  border-top: 2px solid #6d9ea3;
  background: #e8f3f3;
  color: #244f55;
  font-weight: 800;
}
.kardex-table tfoot td:first-child { text-align: left; }
.kardex-table td:nth-child(-n + 2),
.detalle-col {
  text-align: left;
}
.detalle-col {
  min-width: 280px;
}
.entrada {
  color: #287266;
}
.salida {
  color: #a04e55;
}
.saldo-fisico,
.saldo-valor {
  color: #214f55;
  font-weight: 700;
  background: #f7fbfb;
}
.nota-kardex {
  margin: 0 16px 16px;
  border-radius: 12px;
  background: #f2f8f8;
  color: #52666a;
}
.kardex-dialog {
  background: #f8fbfb;
}
@media (max-width: 1023px) {
  .kardex-acciones {
    margin-left: 0;
  }
  .resumen-card {
    min-height: 96px;
  }
}
@media (max-width: 599px) {
  .q-page {
    padding: 0;
  }
  .kardex-acciones {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .kardex-acciones .q-btn {
    width: 100%;
    margin: 0;
  }
  .resumen-card {
    padding: 14px;
    min-height: 82px;
  }
  .nota-kardex {
    margin: 0 8px 8px;
  }
  .kardex-toolbar .q-btn:last-child {
    font-size: 0;
  }
  .kardex-toolbar .q-btn:last-child :deep(.q-icon) {
    font-size: 24px;
  }
}
</style>
