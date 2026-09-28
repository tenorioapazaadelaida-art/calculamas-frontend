<template>
  <q-page>
    <div class="page-shell">
      <div class="page-title">Auditoría</div>
      <div class="page-subtitle q-mb-lg">
        Historial de quién creó, editó o anuló información del negocio.
      </div>
      <q-card class="surface-card">
        <q-card-section class="filtros">
          <q-select v-model="filtroEntidad" :options="entidades" clearable outlined label="Filtrar por módulo" />
          <q-select v-model="filtroAccion" :options="acciones" clearable outlined label="Filtrar por acción" />
        </q-card-section>
        <q-separator />
        <q-table flat :rows="filas" :columns="columnas" row-key="id" :loading="cargando" :grid="$q.screen.lt.md">
          <template #body-cell-acciones="p">
            <q-td :props="p"><q-btn flat round color="primary" icon="visibility" @click="ver(p.row)"><q-tooltip>Ver cambios</q-tooltip></q-btn></q-td>
          </template>
          <template #body-cell-accion="p">
            <q-td :props="p"><q-badge :color="colorAccion(p.row.accion)">{{ nombreAccion(p.row.accion) }}</q-badge></q-td>
          </template>
          <template #item="p">
            <div class="col-12 q-pa-sm">
              <q-card flat bordered class="tarjeta">
                <q-card-section>
                  <div class="row justify-between"><strong>{{ nombreEntidad(p.row.entidad) }}</strong><q-badge :color="colorAccion(p.row.accion)">{{ nombreAccion(p.row.accion) }}</q-badge></div>
                  <div class="q-mt-sm">{{ p.row.usuario?.nombre || 'Sistema' }}</div>
                  <div class="text-caption text-grey-7">{{ fechaSolo(p.row.created_at) }}</div>
                  <q-btn flat color="primary" icon="visibility" label="Ver cambios" class="q-mt-sm" @click="ver(p.row)" />
                </q-card-section>
              </q-card>
            </div>
          </template>
          <template #no-data><div class="full-width text-center text-grey-6 q-pa-xl">No existen registros de auditoría.</div></template>
        </q-table>
      </q-card>
      <q-dialog v-model="dialogo">
        <q-card class="detalle-dialog">
          <q-card-section class="row items-center"><div class="text-h6 text-weight-bold">Detalle de auditoría</div><q-space /><q-btn flat round dense icon="close" v-close-popup /></q-card-section>
          <q-separator />
          <q-card-section v-if="seleccionado" class="q-gutter-md">
            <div><strong>Usuario:</strong> {{ seleccionado.usuario?.nombre || 'Sistema' }}</div>
            <div><strong>Fecha y hora:</strong> {{ fechaHora(seleccionado.created_at) }}</div>
            <div><strong>Módulo:</strong> {{ nombreEntidad(seleccionado.entidad) }}</div>
            <div><strong>Acción:</strong> {{ nombreAccion(seleccionado.accion) }}</div>
            <div v-if="cambiosComparados.length">
              <div class="text-subtitle1 text-weight-bold q-mb-sm">Cambios realizados</div>
              <div class="tabla-cambios">
                <div class="tabla-cambios__encabezado">
                  <span>Información</span><span>Antes</span><span>Después</span>
                </div>
                <div v-for="cambio in cambiosComparados" :key="cambio.campo" class="tabla-cambios__fila">
                  <strong>{{ nombreCampo(cambio.campo) }}</strong>
                  <span>{{ valorVisible(cambio.campo, cambio.antes) }}</span>
                  <span class="valor-nuevo">{{ valorVisible(cambio.campo, cambio.despues) }}</span>
                </div>
              </div>
            </div>
            <div v-else-if="informacionNueva.length">
              <div class="text-subtitle1 text-weight-bold q-mb-sm">Información registrada</div>
              <div class="informacion-grid">
                <div v-for="dato in informacionNueva" :key="dato.campo" class="informacion-item">
                  <span>{{ nombreCampo(dato.campo) }}</span>
                  <strong>{{ valorVisible(dato.campo, dato.valor) }}</strong>
                </div>
              </div>
            </div>
            <q-banner v-else rounded class="bg-blue-grey-1 text-blue-grey-8">
              Esta acción no contiene información adicional para mostrar.
            </q-banner>
          </q-card-section>
          <q-card-actions align="right"><q-btn flat label="Cerrar" v-close-popup /></q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { administracionApi } from 'src/services/sistemaApi'
import { ZONA_HORARIA_BOLIVIA } from 'src/utils/fechaBolivia'

const $q = useQuasar()
const registros = ref([]), cargando = ref(false), dialogo = ref(false), seleccionado = ref(null)
const filtroEntidad = ref(null), filtroAccion = ref(null)
const entidades = computed(() => [...new Set(registros.value.map((r) => r.entidad))].map((value) => ({ label: nombreEntidad(value), value })))
const acciones = computed(() => [...new Set(registros.value.map((r) => r.accion))].map((value) => ({ label: nombreAccion(value), value })))
const filas = computed(() => registros.value.filter((r) => (!filtroEntidad.value || r.entidad === filtroEntidad.value.value) && (!filtroAccion.value || r.accion === filtroAccion.value.value)))
const columnas = [
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: (r) => fechaSolo(r.created_at), align: 'left' },
  { name: 'usuario', label: 'Usuario', field: (r) => r.usuario?.nombre || 'Sistema', align: 'left' },
  { name: 'entidad', label: 'Módulo', field: (r) => nombreEntidad(r.entidad), align: 'left' },
  { name: 'accion', label: 'Acción', field: 'accion', align: 'center' },
  { name: 'registro', label: 'Registro', field: 'entidad_id', align: 'center' },
]
const nombresEntidades = {
  compras: 'Compras',
  ventas: 'Ventas',
  devoluciones_venta: 'Devoluciones de ventas',
  devoluciones_compra: 'Devoluciones a proveedores',
  gastos: 'Gastos',
  categorias: 'Categorías de productos',
  categorias_gasto: 'Categorías de gastos',
  productos: 'Productos',
  configuraciones_impuestos: 'Configuración de impuestos',
  impuestos_generados: 'Impuestos',
  roles: 'Roles y permisos',
  usuarios: 'Usuarios y permisos',
  tipos_utilidad: 'Utilidad por producto',
}
const nombresAcciones = {
  crear: 'Creación',
  editar: 'Edición',
  anular: 'Anulación',
  activar: 'Activación',
  desactivar: 'Desactivación',
  asignar_permisos: 'Asignación de permisos',
}
const nombreEntidad = (v) => nombresEntidades[v] || v
const nombreAccion = (v) => nombresAcciones[v] || v
const colorAccion = (v) => ({ crear: 'positive', editar: 'primary', anular: 'negative', activar: 'positive', desactivar: 'negative', asignar_permisos: 'orange' }[v] || 'grey')
const fechaSolo = (valor) => {
  if (String(valor || '').includes('T')) {
    const fecha = new Date(valor)
    if (!Number.isNaN(fecha.getTime()))
      return new Intl.DateTimeFormat('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: ZONA_HORARIA_BOLIVIA,
      }).format(fecha)
  }
  const partes = String(valor || '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : 'Sin fecha'
}
const fechaHora = (valor) => {
  const fecha = valor instanceof Date ? valor : new Date(valor)
  return !Number.isNaN(fecha.getTime())
    ? new Intl.DateTimeFormat('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: ZONA_HORARIA_BOLIVIA,
      }).format(fecha)
    : 'Sin fecha'
}
const camposOcultos = new Set([
  'id',
  'negocio_id',
  'usuario_id',
  'usuario_registro_id',
  'created_at',
  'updated_at',
  'creado_en',
  'actualizado_en',
  'password',
  'contraseña',
  'remember_token',
  'token',
])
const nombresCampos = {
  numero: 'Número',
  numero_registro: 'Número de registro',
  numero_factura: 'Número de factura',
  numero_nota_credito_debito: 'Número de nota de crédito/débito',
  fecha: 'Fecha',
  proveedor_nombre: 'Proveedor',
  proveedor_nit: 'NIT del proveedor',
  cliente_nombre: 'Cliente',
  cliente_nit: 'NIT del cliente',
  subtotal: 'Subtotal',
  descuento: 'Descuento',
  total: 'Total',
  con_factura: 'Con factura',
  observacion: 'Observación',
  estado: 'Estado',
  metodo_pago: 'Forma de pago',
  metodo_reembolso: 'Medio de reembolso',
  motivo: 'Motivo de la devolución',
  con_nota_credito_debito: 'Con nota de crédito/débito',
  ajuste_debito_fiscal_iva: 'Ajuste del débito fiscal IVA',
  ajuste_credito_fiscal_iva: 'Reversión del crédito fiscal IVA',
  solucion: 'Solución del proveedor',
  medio_reembolso: 'Medio de reembolso',
  credito_fiscal_iva: 'Crédito fiscal IVA',
  debito_fiscal_iva: 'Débito fiscal IVA',
  impuesto_transacciones: 'Impuesto a las transacciones',
  base_credito_fiscal: 'Base para crédito fiscal',
  importe_no_sujeto_iva: 'Importe no sujeto a IVA',
  cuf_autorizacion: 'CUF o autorización',
  nombre: 'Nombre',
  correo: 'Correo electrónico',
  activo: 'Estado activo',
  concepto: 'Concepto',
  monto: 'Monto',
  periodo_referencia: 'Periodo pagado',
  categoria_gasto_id: 'Categoría de gasto',
  rol_id: 'Rol',
  roles: 'Roles',
  permisos: 'Permisos',
  regimen_tributario: 'Régimen tributario',
  iva_habilitado: 'IVA habilitado',
  it_habilitado: 'IT habilitado',
  iue_habilitado: 'IUE habilitado',
  porcentaje_general: 'Utilidad general',
  porcentaje: 'Utilidad específica',
  predeterminada: 'Configuración predeterminada',
  producto: 'Producto',
  codigo: 'Código',
  productos: 'Productos configurados',
}
const camposMonetarios = new Set([
  'subtotal',
  'descuento',
  'total',
  'monto',
  'credito_fiscal_iva',
  'debito_fiscal_iva',
  'impuesto_transacciones',
  'base_credito_fiscal',
  'importe_no_sujeto_iva',
])
const datosComoObjeto = (valor) =>
  valor && typeof valor === 'object' && !Array.isArray(valor) ? valor : {}
const datoMostrable = ([campo, valor]) =>
  !camposOcultos.has(campo) && valor !== null && valor !== undefined && valor !== ''
const nombreCampo = (campo) =>
  nombresCampos[campo] ||
  campo
    .replaceAll('_', ' ')
    .replace(/^./, (letra) => letra.toLocaleUpperCase('es'))
const moneda = (valor) =>
  `Bs ${Number(valor || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const valorObjeto = (valor) =>
  Object.entries(valor)
    .filter(datoMostrable)
    .map(([campo, contenido]) => `${nombreCampo(campo)}: ${valorVisible(campo, contenido)}`)
    .join(' · ')
const valorVisible = (campo, valor) => {
  if (valor === null || valor === undefined || valor === '') return 'Sin información'
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No'
  if (camposMonetarios.has(campo) && !Number.isNaN(Number(valor))) return moneda(valor)
  if (campo === 'fecha') {
    const partes = String(valor).slice(0, 10).split('-')
    if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`
  }
  if (campo.includes('fecha') || campo.endsWith('_en')) {
    const fecha = new Date(valor)
    if (!Number.isNaN(fecha.getTime())) return fechaHora(fecha)
  }
  if (Array.isArray(valor)) {
    if (!valor.length) return 'Ninguno'
    return valor
      .map((item) => (item && typeof item === 'object' ? valorObjeto(item) : String(item)))
      .join(', ')
  }
  if (typeof valor === 'object') return valorObjeto(valor) || 'Sin información'
  if (campo === 'metodo_pago') return String(valor).toLocaleUpperCase('es')
  return String(valor)
}
const informacionNueva = computed(() =>
  Object.entries(datosComoObjeto(seleccionado.value?.datos_nuevos))
    .filter(datoMostrable)
    .map(([campo, valor]) => ({ campo, valor })),
)
const cambiosComparados = computed(() => {
  const anteriores = datosComoObjeto(seleccionado.value?.datos_anteriores)
  const nuevos = datosComoObjeto(seleccionado.value?.datos_nuevos)
  if (!Object.keys(anteriores).length) return []

  return [...new Set([...Object.keys(anteriores), ...Object.keys(nuevos)])]
    .filter((campo) => !camposOcultos.has(campo))
    .filter((campo) => JSON.stringify(anteriores[campo]) !== JSON.stringify(nuevos[campo]))
    .map((campo) => ({
      campo,
      antes: anteriores[campo],
      despues: nuevos[campo],
    }))
})
function ver(fila) { seleccionado.value = fila; dialogo.value = true }
async function cargar() {
  cargando.value = true
  try { registros.value = (await administracionApi.listarAuditorias()).data }
  catch (e) { $q.notify({ type: 'negative', message: e.response?.data?.message || 'No se pudo cargar la auditoría.' }) }
  finally { cargando.value = false }
}
onMounted(cargar)
</script>

<style scoped>
.filtros { display: grid; grid-template-columns: repeat(2, minmax(220px, 1fr)); gap: 12px; }
.detalle-dialog { width: 680px; max-width: 94vw; border-radius: 18px; }
.tarjeta { height: 100%; border-radius: 14px; }
.informacion-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.informacion-item { padding: 12px; border: 1px solid #dbe6e7; border-radius: 12px; background: #f8fbfb; }
.informacion-item span { display: block; margin-bottom: 4px; color: #6f7e81; font-size: .78rem; }
.informacion-item strong { color: #294b50; overflow-wrap: anywhere; }
.tabla-cambios { overflow: hidden; border: 1px solid #dbe6e7; border-radius: 12px; }
.tabla-cambios__encabezado, .tabla-cambios__fila { display: grid; grid-template-columns: minmax(130px, .8fr) repeat(2, minmax(150px, 1fr)); }
.tabla-cambios__encabezado { background: #eaf3f3; color: #365a5f; font-weight: 700; }
.tabla-cambios__encabezado span, .tabla-cambios__fila > * { padding: 10px 12px; border-right: 1px solid #dbe6e7; }
.tabla-cambios__encabezado span:last-child, .tabla-cambios__fila > *:last-child { border-right: 0; }
.tabla-cambios__fila { border-top: 1px solid #dbe6e7; background: #fff; }
.tabla-cambios__fila span { overflow-wrap: anywhere; }
.valor-nuevo { background: #f1f8f6; color: #27675d; font-weight: 600; }
@media (max-width: 599px) { .filtros { grid-template-columns: 1fr; } }
@media (max-width: 599px) {
  .informacion-grid { grid-template-columns: 1fr; }
  .tabla-cambios__encabezado { display: none; }
  .tabla-cambios__fila { grid-template-columns: 1fr; }
  .tabla-cambios__fila > * { border-right: 0; border-bottom: 1px solid #e5eeee; }
  .tabla-cambios__fila > *:last-child { border-bottom: 0; }
  .tabla-cambios__fila span::before { display: block; margin-bottom: 3px; color: #78878a; font-size: .72rem; }
  .tabla-cambios__fila span:nth-child(2)::before { content: 'Antes'; }
  .tabla-cambios__fila span:nth-child(3)::before { content: 'Después'; }
}
</style>
