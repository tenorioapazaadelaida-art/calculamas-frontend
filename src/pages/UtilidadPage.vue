<template>
  <q-page>
    <div class="page-shell">
      <div class="utilidad-cabecera q-mb-lg">
        <div>
          <div class="page-title">Utilidad</div>
          <div class="page-subtitle">
            Conoce cuánto quedó de tus ventas después de restar el costo de los productos y los gastos.
          </div>
        </div>

        <div class="periodo-filtros">
          <q-select
            v-model="mes"
            :options="meses"
            emit-value
            map-options
            outlined
            dense
            clearable
            label="Mes"
            @update:model-value="cargar"
          />
          <q-input
            v-model.number="gestion"
            type="number"
            outlined
            dense
            label="Gestión"
            @change="cargar"
          />
        </div>
      </div>

      <q-card class="surface-card estado-card">
        <q-card-section class="estado-encabezado">
          <div>
            <div class="text-overline text-primary">Resumen del periodo</div>
            <div class="text-h5 text-weight-bold">Estado de resultados</div>
            <div class="text-grey-7">{{ periodoTexto }}</div>
          </div>
          <q-icon name="assessment" color="primary" size="42px" />
        </q-card-section>

        <q-separator />

        <q-card-section class="estado-contenido">
          <div class="estado-fila ingreso">
            <div class="operador">+</div>
            <div class="concepto">
              <strong>Ingresos por ventas</strong>
              <span>Todo lo vendido y confirmado durante el periodo.</span>
            </div>
            <div class="monto">Bs {{ moneda(reporte.ingresos) }}</div>
          </div>

          <div class="estado-fila">
            <div class="operador">−</div>
            <div class="concepto">
              <strong>Costo de mercadería vendida</strong>
              <span>Lo que costaron los productos que fueron vendidos.</span>
            </div>
            <div class="monto">Bs {{ moneda(reporte.costo_ventas) }}</div>
          </div>

          <div class="estado-fila">
            <div class="operador">−</div>
            <div class="concepto">
              <strong>Gastos</strong>
              <span>Pagos registrados, como servicios, alquileres o sueldos.</span>
            </div>
            <div class="monto">Bs {{ moneda(reporte.gastos) }}</div>
          </div>

          <div
            class="estado-fila resultado"
            :class="utilidadAntesImpuestos >= 0 ? 'positivo' : 'negativo'"
          >
            <div class="operador">=</div>
            <div class="concepto">
              <strong>{{ utilidadAntesImpuestos >= 0 ? 'Utilidad antes de impuestos' : 'Pérdida antes de impuestos' }}</strong>
              <span>Resultado obtenido antes de calcular los impuestos.</span>
            </div>
            <div class="monto">Bs {{ moneda(utilidadAntesImpuestos) }}</div>
          </div>
        </q-card-section>
      </q-card>

      <div class="graficos-titulo q-mt-xl q-mb-md">
        <div class="text-h5 text-weight-bold">Gráficos del resultado</div>
        <div class="text-grey-7">Una representación visual de los mismos importes del estado de resultados.</div>
      </div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-lg-7">
          <q-card class="surface-card grafico-card">
            <q-card-section>
              <div class="text-h6 text-weight-bold">Comparación de importes</div>
              <div class="text-grey-7 q-mb-lg">
                Mientras más larga sea la barra, mayor es el importe.
              </div>

              <div v-for="barra in barrasComparacion" :key="barra.nombre" class="barra-fila">
                <div class="barra-datos">
                  <span>{{ barra.nombre }}</span>
                  <strong>Bs {{ moneda(barra.valor) }}</strong>
                </div>
                <div class="barra-fondo">
                  <div
                    class="barra-valor"
                    :style="{ width: `${porcentajeBarra(barra.valor)}%`, backgroundColor: barra.color }"
                  />
                </div>
              </div>

              <div class="lectura-grafico">
                <q-icon name="info" color="primary" />
                <span>{{ explicacionComparacion }}</span>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-5">
          <q-card class="surface-card grafico-card">
            <q-card-section>
              <div class="text-h6 text-weight-bold">De cada Bs 100 vendidos</div>
              <div class="text-grey-7 q-mb-lg">
                Así se distribuyó aproximadamente el dinero de las ventas.
              </div>

              <div v-if="ingresos > 0" class="distribucion">
                <div class="barra-apilada" aria-label="Distribución del dinero vendido">
                  <div
                    v-for="parte in distribucionVenta"
                    :key="parte.nombre"
                    :style="{ width: `${parte.ancho}%`, backgroundColor: parte.color }"
                  />
                </div>

                <div class="leyenda-distribucion">
                  <div v-for="parte in distribucionVenta" :key="parte.nombre">
                    <span class="punto" :style="{ backgroundColor: parte.color }" />
                    <span>{{ parte.nombre }}</span>
                    <strong>{{ porcentaje(parte.porcentaje) }}%</strong>
                    <small>Bs {{ moneda(parte.valor) }}</small>
                  </div>
                </div>

                <q-banner v-if="utilidadAntesImpuestos < 0" rounded class="mensaje-negativo q-mt-md">
                  Los costos y gastos superaron el total vendido. Por eso existe una pérdida.
                </q-banner>
              </div>

              <div v-else class="sin-ventas">
                <q-icon name="bar_chart" size="46px" />
                <span>No existen ventas confirmadas en este periodo.</span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-lg q-mt-xs">
        <div class="col-12 col-md-7">
          <q-card class="surface-card explicacion-card">
            <q-card-section>
              <div class="text-h6 text-weight-bold">¿Cómo se obtiene?</div>
              <div class="formula-simple q-mt-md">
                <span>Ventas</span><q-icon name="remove" />
                <span>Costo de mercadería</span><q-icon name="remove" />
                <span>Gastos</span><q-icon name="drag_handle" />
                <strong>Utilidad antes de impuestos</strong>
              </div>
              <q-banner rounded class="q-mt-lg mensaje" :class="utilidadAntesImpuestos >= 0 ? 'mensaje-positivo' : 'mensaje-negativo'">
                <template #avatar>
                  <q-icon :name="utilidadAntesImpuestos >= 0 ? 'trending_up' : 'trending_down'" />
                </template>
                {{ mensajeResultado }}
              </q-banner>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-5">
          <q-card class="surface-card impuestos-card">
            <q-card-section>
              <div class="text-h6 text-weight-bold">Impuestos del periodo</div>
              <div class="text-grey-7 q-mb-md">
                Se muestran separados porque no forman parte de la utilidad antes de impuestos.
              </div>
              <div class="impuesto-total">
                <span>Impuestos registrados</span>
                <strong>Bs {{ moneda(reporte.impuestos_generados) }}</strong>
              </div>
              <div class="text-caption text-grey-7 q-mt-md">
                Consulta el detalle y la configuración tributaria en el módulo Impuestos.
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-inner-loading :showing="cargando">
        <q-spinner color="primary" size="45px" />
      </q-inner-loading>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { reportesApi } from 'src/services/sistemaApi'
import { gestionActualBolivia } from 'src/utils/fechaBolivia'

const $q = useQuasar()
const gestion = ref(gestionActualBolivia())
const mes = ref(null)
const reporte = ref({})
const cargando = ref(false)

const meses = Array.from({ length: 12 }, (_, indice) => ({
  label: new Intl.DateTimeFormat('es', { month: 'long' }).format(new Date(2020, indice)),
  value: indice + 1,
}))

const utilidadAntesImpuestos = computed(() =>
  Number(
    reporte.value.utilidad_antes_impuestos ??
      Number(reporte.value.ingresos || 0) -
        Number(reporte.value.costo_ventas || 0) -
        Number(reporte.value.gastos || 0),
  ),
)

const ingresos = computed(() => Number(reporte.value.ingresos || 0))
const costoMercaderia = computed(() => Number(reporte.value.costo_ventas || 0))
const gastos = computed(() => Number(reporte.value.gastos || 0))
const barrasComparacion = computed(() => [
  { nombre: 'Ingresos por ventas', valor: ingresos.value, color: '#4f9298' },
  { nombre: 'Costo de mercadería', valor: costoMercaderia.value, color: '#778b8f' },
  { nombre: 'Gastos', valor: gastos.value, color: '#d69b52' },
  {
    nombre: utilidadAntesImpuestos.value >= 0 ? 'Utilidad antes de impuestos' : 'Pérdida antes de impuestos',
    valor: Math.abs(utilidadAntesImpuestos.value),
    color: utilidadAntesImpuestos.value >= 0 ? '#4f9a72' : '#c16a73',
  },
])
const maximoComparacion = computed(() =>
  Math.max(1, ...barrasComparacion.value.map((barra) => barra.valor)),
)
const porcentajeBarra = (valor) =>
  Math.max(valor > 0 ? 2 : 0, (Number(valor || 0) / maximoComparacion.value) * 100)
const porcentaje = (valor) =>
  Number(valor || 0).toLocaleString('es-BO', { maximumFractionDigits: 1 })

const distribucionVenta = computed(() => {
  if (ingresos.value <= 0) return []
  const costoVisible = Math.min(costoMercaderia.value, ingresos.value)
  const disponibleDespuesCosto = Math.max(0, ingresos.value - costoVisible)
  const gastoVisible = Math.min(gastos.value, disponibleDespuesCosto)
  const utilidadVisible = Math.max(0, ingresos.value - costoVisible - gastoVisible)
  return [
    {
      nombre: 'Costo de mercadería',
      valor: costoMercaderia.value,
      porcentaje: (costoMercaderia.value / ingresos.value) * 100,
      ancho: (costoVisible / ingresos.value) * 100,
      color: '#778b8f',
    },
    {
      nombre: 'Gastos',
      valor: gastos.value,
      porcentaje: (gastos.value / ingresos.value) * 100,
      ancho: (gastoVisible / ingresos.value) * 100,
      color: '#d69b52',
    },
    {
      nombre: utilidadAntesImpuestos.value >= 0 ? 'Utilidad' : 'Pérdida',
      valor: Math.abs(utilidadAntesImpuestos.value),
      porcentaje: (Math.abs(utilidadAntesImpuestos.value) / ingresos.value) * 100,
      ancho: utilidadAntesImpuestos.value >= 0 ? (utilidadVisible / ingresos.value) * 100 : 0,
      color: utilidadAntesImpuestos.value >= 0 ? '#4f9a72' : '#c16a73',
    },
  ]
})

const explicacionComparacion = computed(() =>
  utilidadAntesImpuestos.value >= 0
    ? 'Las ventas alcanzaron para cubrir el costo de mercadería y los gastos, dejando una utilidad.'
    : 'El costo de mercadería y los gastos fueron mayores que los ingresos por ventas.',
)

const periodoTexto = computed(() => {
  if (!mes.value) return `Gestión ${gestion.value}`
  const nombre = meses.find((item) => item.value === mes.value)?.label
  return `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} de ${gestion.value}`
})

const mensajeResultado = computed(() =>
  utilidadAntesImpuestos.value >= 0
    ? `Después de restar el costo de mercadería y los gastos, quedaron Bs ${moneda(utilidadAntesImpuestos.value)} antes de impuestos.`
    : `El costo de mercadería y los gastos superaron las ventas por Bs ${moneda(Math.abs(utilidadAntesImpuestos.value))}.`,
)

const moneda = (valor) =>
  Number(valor || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

async function cargar() {
  cargando.value = true
  try {
    reporte.value = (
      await reportesApi.utilidad({ gestion: gestion.value, mes: mes.value })
    ).data
  } catch {
    $q.notify({
      type: 'negative',
      message: 'No se pudo cargar el estado de resultados.',
    })
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
</script>

<style scoped>
.utilidad-cabecera {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
}
.periodo-filtros {
  display: flex;
  gap: 10px;
}
.periodo-filtros .q-select { width: 170px; }
.periodo-filtros .q-input { width: 120px; }
.estado-card { overflow: hidden; }
.estado-encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  background: linear-gradient(135deg, #f5fafa, #fff);
}
.estado-contenido { padding: 8px 28px 24px; }
.estado-fila {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-height: 78px;
  padding: 14px 12px;
  border-bottom: 1px solid #dce5e6;
}
.estado-fila .operador {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #edf3f3;
  color: #52676b;
  font-size: 1.25rem;
  font-weight: 800;
}
.estado-fila.ingreso .operador { background: #e5f4ee; color: #28745b; }
.concepto { display: flex; flex-direction: column; gap: 3px; }
.concepto strong { font-size: 1.05rem; color: #2d4145; }
.concepto span { color: #748286; font-size: .85rem; }
.monto { min-width: 150px; text-align: right; font-size: 1.15rem; font-weight: 700; }
.estado-fila.resultado {
  margin-top: 12px;
  border: 0;
  border-radius: 14px;
}
.estado-fila.resultado.positivo { background: #e8f6ee; color: #226849; }
.estado-fila.resultado.negativo { background: #faeaec; color: #a34450; }
.estado-fila.resultado .operador { background: rgba(255, 255, 255, .75); color: inherit; }
.estado-fila.resultado .concepto strong,
.estado-fila.resultado .concepto span { color: inherit; }
.estado-fila.resultado .monto { font-size: 1.45rem; }
.graficos-titulo { padding-left: 2px; }
.grafico-card { height: 100%; }
.barra-fila { margin: 18px 0; }
.barra-datos {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 7px;
}
.barra-datos strong { white-space: nowrap; }
.barra-fondo {
  height: 15px;
  overflow: hidden;
  border-radius: 20px;
  background: #edf2f2;
}
.barra-valor {
  height: 100%;
  border-radius: 20px;
  transition: width .35s ease;
}
.lectura-grafico {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 22px;
  padding: 12px;
  border-radius: 10px;
  background: #f2f8f8;
  color: #53696d;
}
.barra-apilada {
  display: flex;
  width: 100%;
  height: 34px;
  overflow: hidden;
  border-radius: 10px;
  background: #edf2f2;
}
.barra-apilada > div { height: 100%; }
.leyenda-distribucion { display: grid; gap: 13px; margin-top: 22px; }
.leyenda-distribucion > div {
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr) auto;
  align-items: center;
  gap: 7px;
}
.leyenda-distribucion small {
  grid-column: 2 / 4;
  color: #778589;
}
.punto { width: 11px; height: 11px; border-radius: 50%; }
.sin-ventas {
  min-height: 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #7b898c;
  text-align: center;
}
.explicacion-card,
.impuestos-card { height: 100%; }
.formula-simple {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px;
  border-radius: 12px;
  background: #f4f8f8;
}
.formula-simple span,
.formula-simple strong { padding: 8px 10px; }
.formula-simple strong { color: #28646a; }
.mensaje-positivo { background: #edf7f1; color: #286b52; }
.mensaje-negativo { background: #faedef; color: #9b4652; }
.impuesto-total {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  border-radius: 12px;
  background: #f4f8f8;
}
.impuesto-total strong { color: #2d6970; font-size: 1.1rem; white-space: nowrap; }
@media (max-width: 700px) {
  .utilidad-cabecera { align-items: stretch; flex-direction: column; }
  .periodo-filtros { width: 100%; }
  .periodo-filtros .q-select,
  .periodo-filtros .q-input { width: auto; flex: 1; }
  .estado-encabezado,
  .estado-contenido { padding-left: 16px; padding-right: 16px; }
  .estado-fila {
    grid-template-columns: 30px minmax(0, 1fr);
    gap: 8px 10px;
  }
  .estado-fila .monto {
    grid-column: 2;
    min-width: 0;
    text-align: left;
  }
}
@media (max-width: 420px) {
  .periodo-filtros { flex-direction: column; }
  .periodo-filtros .q-select,
  .periodo-filtros .q-input { width: 100%; }
  .formula-simple { flex-direction: column; align-items: stretch; text-align: center; }
  .formula-simple .q-icon { align-self: center; transform: rotate(90deg); }
  .impuesto-total { flex-direction: column; }
}
</style>
