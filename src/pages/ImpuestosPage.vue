<template>
  <q-page
    ><div class="page-shell">
      <div class="cabecera-periodo q-mb-lg">
        <div>
          <div class="page-title">Impuestos generados</div>
          <div class="page-subtitle">
            Control conforme al Régimen General del negocio.
          </div>
        </div>
        <div class="filtros-periodo">
          <q-select
            v-model="mes"
            :options="meses"
            emit-value
            map-options
            outlined
            dense
            label="Mes"
            @update:model-value="cargar"
          /><q-input
            v-model.number="gestion"
            type="number"
            outlined
            dense
            label="Gestión"
            @change="cargar"
          />
        </div>
      </div>
      <q-banner rounded class="bg-blue-1 text-blue-9 q-mb-lg"
        ><template #avatar><q-icon name="info" /></template>Este reporte es para
        control interno. Las declaraciones oficiales se realizan en el SIAT del
        SIN.</q-banner
      >

      <q-card class="surface-card q-mb-lg asistente-fiscal">
        <q-card-section>
          <div class="row items-center q-gutter-md">
            <q-avatar color="blue-1" text-color="primary" icon="fact_check" />
            <div>
              <div class="text-h6 text-weight-bold">Configuración tributaria</div>
              <div class="text-caption text-grey-7">
                Activa solamente las obligaciones que aparecen en tu NIT.
              </div>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="pasos-fiscales">
          <div class="paso-fiscal">
            <q-avatar color="primary" text-color="white" size="30px">1</q-avatar>
            <div class="paso-contenido">
              <div class="text-weight-bold">Régimen tributario</div>
              <q-card flat bordered class="regimen-seleccionado q-mt-sm">
                <q-card-section class="row items-center q-gutter-sm">
                  <q-icon name="verified" color="positive" size="24px" />
                  <div><strong>Régimen General</strong><div class="text-caption text-grey-7">Configuración utilizada por este sistema.</div></div>
                </q-card-section>
              </q-card>
            </div>
          </div>
          <div class="paso-fiscal">
            <q-avatar color="primary" text-color="white" size="30px">2</q-avatar>
            <div class="paso-contenido">
              <div class="text-weight-bold">Obligaciones de tu NIT</div>
              <div class="opciones-impuestos q-mt-sm">
                <q-toggle v-model="config.iva_habilitado" color="primary" :disable="!auth.can('impuestos.configurar')">
                  <div><strong>IVA (13 %)</strong><div class="text-caption text-grey-7">Compras y ventas con factura.</div></div>
                </q-toggle>
                <q-toggle v-model="config.it_habilitado" color="primary" :disable="!auth.can('impuestos.configurar')">
                  <div><strong>IT (3 %)</strong><div class="text-caption text-grey-7">Actívalo solo si figura en tu NIT.</div></div>
                </q-toggle>
                <q-toggle v-model="config.iue_habilitado" color="primary" :disable="!auth.can('impuestos.configurar')">
                  <div><strong>IUE (25 %)</strong><div class="text-caption text-grey-7">Estimación anual cuando corresponda.</div></div>
                </q-toggle>
              </div>
            </div>
          </div>
          <div v-if="auth.can('impuestos.configurar')" class="paso-fiscal">
            <q-avatar color="primary" text-color="white" size="30px">3</q-avatar>
            <div class="paso-contenido">
              <div class="text-weight-bold">Guardar y aplicar</div>
              <div class="text-caption text-grey-7 q-mb-sm">Los cálculos se actualizarán con las obligaciones seleccionadas.</div>
              <q-btn color="primary" icon="save" label="Guardar configuración" :loading="guardando" @click="guardarConfiguracion" />
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="text-caption text-grey-7">
          Si no conoces tus obligaciones, revisa tu NIT en el SIAT o consulta a un profesional contable.
        </q-card-section>
      </q-card>

      <div class="row q-col-gutter-lg">
        <div
          v-for="i in indicadores"
          :key="i.label"
          class="col-12 col-sm-6 col-lg-3"
        >
          <q-card class="surface-card indicador"
            ><q-card-section
              ><div class="text-caption text-grey-7">{{ i.label }}</div>
              <div class="text-h5 text-weight-bold q-mt-xs">
                Bs {{ moneda(i.valor) }}
              </div></q-card-section
            ></q-card
          >
        </div>
      </div>

      <q-card class="surface-card q-mt-lg liquidacion-iva"
        ><q-card-section
          ><div class="text-h6 text-weight-bold">
            Liquidación mensual del IVA
          </div>
          <div class="text-caption text-grey-7">
            El crédito de las facturas de compra se utiliza al presentar el
            periodo ante el SIN.
          </div></q-card-section
        ><q-separator /><q-card-section
          ><div class="fila-impuesto">
            <span>Débito fiscal de ventas con factura</span
            ><strong>Bs {{ moneda(datos.iva_debito_fiscal) }}</strong>
          </div>
          <div class="fila-impuesto resta">
            <span>(−) Crédito fiscal de compras con factura</span
            ><strong>Bs {{ moneda(datos.iva_credito_compras) }}</strong>
          </div>
          <div class="fila-impuesto resta">
            <span>(−) Crédito fiscal de gastos con factura</span
            ><strong>Bs {{ moneda(datos.iva_credito_gastos) }}</strong>
          </div>
          <div class="fila-impuesto resta">
            <span>(−) Saldo a favor anterior</span
            ><strong>Bs {{ moneda(datos.iva_saldo_anterior) }}</strong>
          </div>
          <q-separator class="q-my-sm" />
          <div class="fila-impuesto resultado">
            <span>IVA por pagar al SIN</span
            ><strong>Bs {{ moneda(datos.iva_determinado) }}</strong>
          </div>
          <div class="fila-impuesto saldo">
            <span>Saldo a favor para el siguiente periodo</span
            ><strong>Bs {{ moneda(datos.iva_saldo_favor) }}</strong>
          </div></q-card-section
        ></q-card
      >

      <q-card class="surface-card q-mt-lg"
        ><q-card-section
          ><div class="text-h6 text-weight-bold">Impuestos por producto</div>
          <div class="text-caption text-grey-7">
            Desglose de productos que generaron impuestos en el periodo.
          </div></q-card-section
        ><q-separator />
        <q-table
          flat
          :rows="impuestosProductos"
          :columns="columnasProductos"
          row-key="producto_id"
          :loading="cargando"
          :grid="$q.screen.lt.md"
        >
          <template #body-cell-acciones="p"
            ><q-td :props="p"
              ><q-btn
                flat
                round
                color="primary"
                icon="visibility"
                @click="verProducto(p.row)"
                ><q-tooltip>Ver impuestos</q-tooltip></q-btn
              ></q-td
            ></template
          >
          <template #body-cell-producto="p"
            ><q-td :props="p"
              ><strong>{{ p.row.nombre }}</strong>
              <div class="text-caption text-grey-7">
                {{ p.row.codigo }}
              </div></q-td
            ></template
          >
          <template #item="p"
            ><div class="col-12 q-pa-sm">
              <q-card flat bordered class="producto-movil"
                ><q-card-section
                  ><div class="row justify-between items-start">
                    <div>
                      <strong>{{ p.row.nombre }}</strong>
                      <div class="text-caption text-grey-7">
                        {{ p.row.codigo }}
                      </div>
                    </div>
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="visibility"
                      @click="verProducto(p.row)"
                    />
                  </div>
                  <q-separator class="q-my-md" />
                  <div class="row justify-between">
                    <span>Débito IVA</span
                    ><strong>Bs {{ moneda(p.row.debito_fiscal_iva) }}</strong>
                  </div>
                  <div class="row justify-between q-mt-sm">
                    <span>Crédito IVA</span
                    ><strong>Bs {{ moneda(p.row.credito_fiscal_iva) }}</strong>
                  </div></q-card-section
                ></q-card
              >
            </div></template
          >
          <template #no-data
            ><div class="full-width text-center text-grey-6 q-pa-xl">
              No existen impuestos por producto en este periodo.
            </div></template
          >
        </q-table>
      </q-card>

      <q-card class="surface-card q-mt-lg"
        ><q-card-section class="row items-center q-col-gutter-md"
          ><div class="col-12 col-md">
            <div class="text-subtitle1 text-weight-bold">
              Estado del periodo
            </div>
            <div class="text-caption text-grey-7">
              El crédito fiscal se acumula con las compras registradas con
              factura.
            </div>
          </div>
          <div class="col-12 col-md-auto">
            <q-badge
              :color="datos.periodo_cerrado ? 'positive' : 'warning'"
              class="q-pa-sm"
              >{{
                datos.periodo_cerrado ? 'Periodo cerrado' : 'Periodo abierto'
              }}</q-badge
            >
          </div>
          <div
            v-if="auth.can('impuestos.configurar') && !datos.periodo_cerrado"
            class="col-12 col-md-auto"
          >
            <q-btn
              outline
              color="primary"
              icon="lock"
              label="Cerrar periodo"
              :loading="cerrando"
              @click="cerrarPeriodo"
            /></div></q-card-section
      ></q-card>
      <q-card v-if="config.iue_habilitado" class="surface-card q-mt-lg"
        ><q-card-section
          ><div class="text-subtitle1 text-weight-bold">IUE anual estimado</div>
          <div class="text-h5 text-primary q-mt-sm">
            Bs {{ moneda(iue.iue_estimado) }}
          </div>
          <div class="text-caption text-grey-7">
            Base estimada: Bs {{ moneda(iue.base_estimada) }}. Requiere revisión
            profesional antes de declarar.
          </div></q-card-section
        ></q-card
      >

      <q-dialog v-model="dialogoProducto"
        ><q-card class="producto-dialog"
          ><q-card-section class="row items-center"
            ><q-avatar color="primary" text-color="white" icon="inventory_2" />
            <div class="q-ml-md">
              <div class="text-h6 text-weight-bold">
                {{ productoSeleccionado?.nombre }}
              </div>
              <div class="text-caption text-grey-7">
                {{ productoSeleccionado?.codigo }}
              </div>
            </div>
            <q-space /><q-btn
              flat
              round
              dense
              icon="close"
              v-close-popup /></q-card-section
          ><q-separator /><q-card-section v-if="productoSeleccionado"
            ><div class="detalle">
              <span>Ventas con factura</span
              ><strong>{{ productoSeleccionado.ventas_con_factura }}</strong>
            </div>
            <div class="detalle">
              <span>Base de ventas</span
              ><strong
                >Bs {{ moneda(productoSeleccionado.base_ventas) }}</strong
              >
            </div>
            <div class="detalle debito">
              <span>Débito fiscal IVA</span
              ><strong
                >Bs {{ moneda(productoSeleccionado.debito_fiscal_iva) }}</strong
              >
            </div>
            <q-separator class="q-my-md" />
            <div class="detalle">
              <span>Compras con factura</span
              ><strong>{{ productoSeleccionado.compras_con_factura }}</strong>
            </div>
            <div class="detalle">
              <span>Base de compras</span
              ><strong
                >Bs {{ moneda(productoSeleccionado.base_compras) }}</strong
              >
            </div>
            <div class="detalle credito">
              <span>Crédito fiscal IVA</span
              ><strong
                >Bs
                {{ moneda(productoSeleccionado.credito_fiscal_iva) }}</strong
              >
            </div>
            <div v-if="config.it_habilitado" class="detalle q-mt-md">
              <span>IT generado</span
              ><strong
                >Bs {{ moneda(productoSeleccionado.it_generado) }}</strong
              >
            </div></q-card-section
          ><q-card-actions align="right"
            ><q-btn
              color="primary"
              label="Cerrar"
              v-close-popup /></q-card-actions></q-card
      ></q-dialog></div
  ></q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { reportesApi } from 'src/services/sistemaApi'
import { gestionActualBolivia, mesActualBolivia } from 'src/utils/fechaBolivia'
import { auth } from 'src/services/auth'
const $q = useQuasar()
const gestion = ref(gestionActualBolivia()),
  mes = ref(mesActualBolivia()),
  datos = ref({}),
  iue = ref({}),
  impuestosProductos = ref([]),
  guardando = ref(false),
  cerrando = ref(false),
  cargando = ref(false),
  dialogoProducto = ref(false),
  productoSeleccionado = ref(null)
const config = reactive({
  regimen_tributario: 'general',
  iva_habilitado: false,
  it_habilitado: false,
  iue_habilitado: false,
})
const meses = Array.from({ length: 12 }, (_, i) => ({
  label: new Intl.DateTimeFormat('es', { month: 'long' }).format(
    new Date(2020, i),
  ),
  value: i + 1,
}))
const indicadores = computed(() => [
  { label: 'Débito fiscal IVA', valor: datos.value.iva_debito_fiscal },
  { label: 'Crédito fiscal IVA', valor: datos.value.iva_credito_fiscal },
  { label: 'IVA por pagar', valor: datos.value.iva_determinado },
  ...(config.it_habilitado
    ? [{ label: 'IT determinado', valor: datos.value.it_determinado }]
    : []),
])
const columnasProductos = [
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'left' },
  { name: 'producto', label: 'Producto', field: 'nombre', align: 'left' },
  {
    name: 'debito',
    label: 'Débito fiscal IVA',
    field: (r) => `Bs ${moneda(r.debito_fiscal_iva)}`,
    align: 'right',
  },
  {
    name: 'credito',
    label: 'Crédito fiscal IVA',
    field: (r) => `Bs ${moneda(r.credito_fiscal_iva)}`,
    align: 'right',
  },
  {
    name: 'it',
    label: 'IT generado',
    field: (r) => `Bs ${moneda(r.it_generado)}`,
    align: 'right',
  },
]
const moneda = (valor) =>
  Number(valor || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
async function cargar() {
  cargando.value = true
  try {
    const periodo = { gestion: gestion.value, mes: mes.value }
    const solicitudes = [
      reportesApi.impuestos(periodo),
      reportesApi.impuestosPorProducto(periodo),
    ]
    if (config.iue_habilitado)
      solicitudes.push(reportesApi.iueEstimado(gestion.value))
    const respuestas = await Promise.all(solicitudes)
    datos.value = respuestas[0].data
    impuestosProductos.value = respuestas[1].data
    if (respuestas[2]) iue.value = respuestas[2].data
  } catch (e) {
    $q.notify({
      type: 'negative',
      message:
        e.response?.data?.message || 'No se pudieron cargar los impuestos.',
    })
  } finally {
    cargando.value = false
  }
}
async function cargarConfiguracion() {
  Object.assign(config, (await reportesApi.configuracionImpuestos()).data)
}
async function guardarConfiguracion() {
  guardando.value = true
  try {
    await reportesApi.guardarConfiguracionImpuestos(config)
    await cargar()
    $q.notify({
      type: 'positive',
      message: 'Configuración del Régimen General guardada.',
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message:
        e.response?.data?.message || 'No se pudo guardar la configuración.',
    })
  } finally {
    guardando.value = false
  }
}
function verProducto(producto) {
  productoSeleccionado.value = producto
  dialogoProducto.value = true
}
function cerrarPeriodo() {
  const nombreMes = meses.find((item) => item.value === mes.value)?.label
  $q.dialog({
    title: 'Cerrar periodo',
    message: `Después de cerrar ${nombreMes} de ${gestion.value}, no podrás registrar movimientos en ese mes. ¿Deseas continuar?`,
    cancel: { flat: true, label: 'Cancelar' },
    ok: { color: 'primary', label: 'Sí, cerrar periodo' },
    persistent: true,
  }).onOk(async () => {
    cerrando.value = true
    try {
      datos.value = (
        await reportesApi.cerrarPeriodoImpuestos({
          gestion: gestion.value,
          mes: mes.value,
        })
      ).data
      $q.notify({
        type: 'positive',
        message: 'Periodo tributario cerrado correctamente.',
      })
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: e.response?.data?.message || 'No se pudo cerrar el periodo.',
      })
    } finally {
      cerrando.value = false
    }
  })
}
onMounted(async () => {
  await cargarConfiguracion()
  await cargar()
})
</script>

<style scoped>
.cabecera-periodo {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}
.filtros-periodo,
.configuraciones {
  display: flex;
  gap: 12px;
}
.filtros-periodo .q-select {
  width: 160px;
}
.filtros-periodo .q-input {
  width: 120px;
}
.indicador {
  height: 100%;
}
.pasos-fiscales {
  display: grid;
  gap: 20px;
}
.paso-fiscal {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.paso-contenido {
  flex: 1;
  min-width: 0;
}
.regimen-seleccionado {
  max-width: 430px;
  border-radius: 13px;
  background: #f5fafa;
}
.opciones-impuestos {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 12px;
}
.opciones-impuestos .q-toggle {
  padding: 12px;
  border: 1px solid #dbe5e6;
  border-radius: 13px;
}
.liquidacion-iva {
  border-left: 4px solid #5f9ca1;
}
.fila-impuesto,
.detalle {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 7px 0;
}
.resta {
  color: #765321;
}
.resultado {
  color: #174f55;
  font-size: 1.15rem;
}
.saldo,
.credito {
  color: #28734f;
}
.debito {
  color: #9a5d20;
}
.producto-movil {
  height: 100%;
  border-radius: 14px;
}
.producto-dialog {
  width: 580px;
  max-width: 94vw;
  border-radius: 18px;
}
@media (max-width: 700px) {
  .cabecera-periodo {
    align-items: stretch;
    flex-direction: column;
  }
  .filtros-periodo {
    width: 100%;
  }
  .filtros-periodo .q-select,
  .filtros-periodo .q-input {
    width: auto;
    flex: 1;
  }
  .configuraciones {
    flex-direction: column;
    gap: 0;
  }
  .opciones-impuestos {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 420px) {
  .filtros-periodo {
    flex-direction: column;
  }
  .filtros-periodo .q-select,
  .filtros-periodo .q-input {
    width: 100%;
  }
  .fila-impuesto span,
  .detalle span {
    max-width: 62%;
  }
}
</style>
