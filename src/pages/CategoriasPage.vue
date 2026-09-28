<template>
  <q-page>
    <div class="page-shell">
      <div class="row justify-between items-center q-mb-lg">
        <div>
          <div class="page-title">Categorías de productos</div>
          <div class="page-subtitle">
            Agrupa tus productos para encontrarlos fácilmente.
          </div>
        </div>
        <q-btn
          v-if="auth.can('categorias.crear')"
          color="primary"
          icon="add"
          label="Nueva categoría"
          @click="abrirFormulario()"
        />
      </div>

      <q-card class="surface-card">
        <q-table
          flat
          :rows="categorias"
          :columns="columnas"
          row-key="id"
          :loading="cargando"
          :grid="$q.screen.lt.md"
        >
          <template #body-cell-acciones="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                color="info"
                icon="visibility"
                aria-label="Ver categoría"
                @click="verCategoria(props.row)"
                ><q-tooltip>Ver</q-tooltip></q-btn
              >
              <q-btn
                v-if="auth.can('categorias.editar')"
                flat
                round
                dense
                color="primary"
                icon="edit"
                aria-label="Editar categoría"
                @click="abrirFormulario(props.row)"
                ><q-tooltip>Editar</q-tooltip></q-btn
              >
              <q-btn
                v-if="auth.can('categorias.desactivar')"
                flat
                round
                dense
                :color="props.row.activo ? 'negative' : 'positive'"
                :icon="props.row.activo ? 'toggle_off' : 'toggle_on'"
                :disable="props.row.activo && props.row.productos_count > 0"
                :aria-label="
                  props.row.activo
                    ? 'Desactivar categoría'
                    : 'Activar categoría'
                "
                @click="confirmarCambioEstado(props.row)"
              >
                <q-tooltip>{{
                  props.row.activo && props.row.productos_count > 0
                    ? 'No se puede desactivar: tiene productos registrados'
                    : props.row.activo ? 'Desactivar' : 'Activar'
                }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
          <template #body-cell-icono="props">
            <q-td :props="props">
              <CategoriaIcono
                :nombre="props.row.icono"
                size="24px"
                class="text-primary"
              />
            </q-td>
          </template>
          <template #item="props">
            <div class="col-12 q-pa-sm">
              <q-card flat bordered class="responsive-data-card">
                <q-card-section class="row no-wrap items-start">
                  <CategoriaIcono :nombre="props.row.icono" size="32px" class="text-primary q-mr-md" />
                  <div class="col">
                    <div class="text-weight-bold">{{ props.row.nombre }}</div>
                    <div class="text-caption text-grey-7">{{ props.row.codigo_corto || 'Sin código' }} · {{ props.row.subcategoria || 'Sin subcategoría' }}</div>
                  </div>
                  <q-badge :color="props.row.activo ? 'positive' : 'grey'">{{ props.row.activo ? 'Activa' : 'Inactiva' }}</q-badge>
                </q-card-section>
                <q-separator />
                <q-card-actions align="right">
                  <q-btn flat round dense color="info" icon="visibility" @click="verCategoria(props.row)" />
                  <q-btn v-if="auth.can('categorias.editar')" flat round dense color="primary" icon="edit" @click="abrirFormulario(props.row)" />
                  <q-btn v-if="auth.can('categorias.desactivar')" flat round dense :color="props.row.activo ? 'negative' : 'positive'" :icon="props.row.activo ? 'toggle_off' : 'toggle_on'" :disable="props.row.activo && props.row.productos_count > 0" @click="confirmarCambioEstado(props.row)" />
                </q-card-actions>
              </q-card>
            </div>
          </template>
          <template #no-data>
            <div class="full-width text-center q-pa-xl text-grey-6">
              Aún no creaste categorías.
            </div>
          </template>
        </q-table>
      </q-card>

      <q-dialog v-model="dialogo" persistent>
        <q-card class="categoria-dialog">
          <q-toolbar class="q-px-lg q-pt-md">
            <q-toolbar-title class="text-h5 text-weight-bold">{{
              tituloFormulario
            }}</q-toolbar-title>
            <q-btn
              flat
              round
              dense
              icon="close"
              aria-label="Cerrar"
              @click="cancelar"
            />
          </q-toolbar>

          <q-form ref="formularioRef" @submit="guardar">
            <q-card-section class="row q-col-gutter-lg q-pa-lg">
              <q-input
                v-model="form.codigo_corto"
                class="col-12 col-sm-6"
                outlined
                label="Código corto (opcional)"
                input-class="text-uppercase"
                maxlength="20"
                @update:model-value="normalizarCodigo"
              />
              <q-input
                v-model="form.nombre"
                class="col-12 col-sm-6"
                outlined
                label="Nombre"
                @update:model-value="
                  (valor) => normalizarTexto('nombre', valor)
                "
                maxlength="120"
                :rules="[
                  (valor) => Boolean(valor?.trim()) || 'Ingresa el nombre',
                ]"
              />
              <q-input
                v-model="form.subcategoria"
                class="col-12 col-sm-6"
                outlined
                label="Subcategoría (opcional)"
                @update:model-value="
                  (valor) => normalizarTexto('subcategoria', valor)
                "
                maxlength="120"
              />
              <q-input
                v-model="form.descripcion"
                class="col-12 col-sm-6"
                outlined
                type="textarea"
                autogrow
                label="Descripción"
                @update:model-value="
                  (valor) => normalizarTexto('descripcion', valor)
                "
                maxlength="1000"
              />

              <div class="col-12"><q-separator /></div>
              <div class="col-12 text-h6 text-weight-bold">
                Identificación visual
              </div>

              <q-select
                v-model="form.icono"
                class="col-12"
                outlined
                use-input
                emit-value
                map-options
                input-debounce="0"
                option-value="valor"
                option-label="nombre"
                :options="opcionesIconos"
                label="Buscar y seleccionar icono"
                :rules="[(valor) => Boolean(valor) || 'Selecciona un icono']"
                @filter="filtrarIconos"
              >
                <template #prepend
                  ><CategoriaIcono :nombre="form.icono || 'search'" size="24px"
                /></template>
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <CategoriaIcono
                        :nombre="scope.opt.valor"
                        size="24px"
                        class="text-primary"
                      />
                    </q-item-section>
                    <q-item-section>{{ scope.opt.nombre }}</q-item-section>
                  </q-item>
                </template>
              </q-select>
            </q-card-section>

            <q-separator />
            <q-card-actions align="right" class="q-pa-lg">
              <q-btn
                flat
                label="Cancelar"
                :disable="guardando"
                @click="cancelar"
              />
              <q-btn
                color="primary"
                icon="save"
                :label="editandoId ? 'Guardar cambios' : 'Guardar categoría'"
                type="submit"
                :loading="guardando"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-dialog>

      <q-dialog v-model="dialogoVer">
        <q-card class="categoria-ver-dialog">
          <q-toolbar class="detalle-toolbar">
            <q-toolbar-title class="text-subtitle1 text-weight-bold"
              >Detalle de categoría</q-toolbar-title
            >
            <q-btn
              v-close-popup
              flat
              round
              dense
              icon="close"
              aria-label="Cerrar"
            />
          </q-toolbar>
          <q-card-section
            v-if="categoriaSeleccionada"
            class="detalle-contenido"
          >
            <div class="detalle-encabezado">
              <div class="detalle-icono">
                <CategoriaIcono
                  :nombre="categoriaSeleccionada.icono"
                  size="48px"
                />
              </div>
              <div class="col">
                <div class="text-h5 text-weight-bold">
                  {{ categoriaSeleccionada.nombre }}
                </div>
                <q-badge v-if="categoriaSeleccionada.codigo_corto" outline color="primary" class="q-mt-xs">
                  {{ categoriaSeleccionada.codigo_corto }}
                </q-badge>
              </div>
              <q-badge
                rounded
                :color="categoriaSeleccionada.activo ? 'positive' : 'grey-6'"
                :label="categoriaSeleccionada.activo ? 'Activa' : 'Inactiva'"
              />
            </div>

            <div class="detalle-datos">
              <div class="detalle-campo">
                <q-icon name="account_tree" />
                <div>
                  <div class="detalle-etiqueta">Subcategoría</div>
                  <div>
                    {{
                      categoriaSeleccionada.subcategoria || 'Sin subcategoría'
                    }}
                  </div>
                </div>
              </div>
              <div class="detalle-campo detalle-campo--descripcion">
                <q-icon name="description" />
                <div>
                  <div class="detalle-etiqueta">Descripción</div>
                  <div>
                    {{ categoriaSeleccionada.descripcion || 'Sin descripción' }}
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="q-pa-md">
            <q-btn v-close-popup color="primary" unelevated label="Cerrar" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { auth } from 'src/services/auth'
import { catalogoApi } from 'src/services/sistemaApi'
import CategoriaIcono from 'src/components/CategoriaIcono.vue'

const $q = useQuasar()
const categorias = ref([])
const dialogo = ref(false)
const dialogoVer = ref(false)
const cargando = ref(false)
const guardando = ref(false)
const formularioRef = ref(null)
const editandoId = ref(null)
const categoriaSeleccionada = ref(null)
const formularioInicial = () => ({
  codigo_corto: '',
  nombre: '',
  subcategoria: '',
  descripcion: '',
  icono: '',
})
const form = reactive(formularioInicial())

const iconosGenerales = [
  { nombre: 'Categoría', valor: 'category' },
  { nombre: 'Accesorios', valor: 'devices_other' },
  { nombre: 'Alimentos', valor: 'restaurant' },
  { nombre: 'Bebidas', valor: 'local_cafe' },
  { nombre: 'Belleza', valor: 'spa' },
  { nombre: 'Calzado', valor: 'hiking' },
  { nombre: 'Celulares', valor: 'smartphone' },
  { nombre: 'Computación', valor: 'computer' },
  { nombre: 'Construcción', valor: 'construction' },
  { nombre: 'Deportes', valor: 'sports_soccer' },
  { nombre: 'Electrónica', valor: 'memory' },
  { nombre: 'Herramientas', valor: 'handyman' },
  { nombre: 'Hogar', valor: 'home' },
  { nombre: 'Jardinería', valor: 'yard' },
  { nombre: 'Juguetes', valor: 'toys' },
  { nombre: 'Libros', valor: 'menu_book' },
  { nombre: 'Mascotas', valor: 'pets' },
  { nombre: 'Muebles', valor: 'chair' },
  { nombre: 'Oficina', valor: 'business_center' },
  { nombre: 'Productos', valor: 'inventory_2' },
  { nombre: 'Regalos', valor: 'redeem' },
  { nombre: 'Ropa', valor: 'checkroom' },
  { nombre: 'Salud', valor: 'medical_services' },
  { nombre: 'Tecnología', valor: 'devices' },
  { nombre: 'Vehículos', valor: 'directions_car' },
]
const iconosAccesoriosMoviles = [
  { nombre: 'Fundas', valor: 'phone_case' },
  { nombre: 'Vidrios templados', valor: 'screen_lock_portrait' },
  { nombre: 'Cargadores', valor: 'battery_charging_full' },
  { nombre: 'Cables USB', valor: 'usb' },
  { nombre: 'Audífonos', valor: 'headphones' },
  { nombre: 'Parlantes', valor: 'speaker' },
  { nombre: 'Memorias microSD', valor: 'sd_card' },
  { nombre: 'Audiculares', valor: 'headset_mic' },
]
const catalogoIconos = computed(() => {
  const negocio = auth.usuario?.negocio?.nombre?.toLocaleLowerCase('es') || ''
  return /(funda|celular|móvil|movil|telefon|accesorio)/.test(negocio)
    ? iconosAccesoriosMoviles
    : iconosGenerales
})
const opcionesIconos = ref([...catalogoIconos.value])
const tituloFormulario = computed(() =>
  editandoId.value ? 'Editar categoría' : 'Nueva categoría',
)

const columnas = [
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
  {
    name: 'codigo_corto',
    label: 'Código',
    field: (fila) => fila.codigo_corto || '—',
    align: 'left',
  },
  { name: 'nombre', label: 'Categoría', field: 'nombre', align: 'left' },
  {
    name: 'subcategoria',
    label: 'Subcategoría',
    field: (fila) => fila.subcategoria || '—',
    align: 'left',
  },
  { name: 'icono', label: 'Icono', field: 'icono', align: 'center' },
  {
    name: 'activo',
    label: 'Estado',
    field: (fila) => (fila.activo ? 'Activa' : 'Inactiva'),
  },
]

async function cargar() {
  cargando.value = true
  try {
    categorias.value = (await catalogoApi.listarCategorias()).data
  } finally {
    cargando.value = false
  }
}

function abrirFormulario(categoria = null) {
  editandoId.value = categoria?.id ?? null
  Object.assign(
    form,
    categoria
      ? {
          codigo_corto: categoria.codigo_corto || '',
          nombre: categoria.nombre || '',
          subcategoria: categoria.subcategoria || '',
          descripcion: categoria.descripcion || '',
          icono: categoria.icono || '',
        }
      : formularioInicial(),
  )
  dialogo.value = true
}

function verCategoria(categoria) {
  categoriaSeleccionada.value = categoria
  dialogoVer.value = true
}

function cancelar() {
  if (guardando.value) return
  dialogo.value = false
  editandoId.value = null
  Object.assign(form, formularioInicial())
  formularioRef.value?.resetValidation()
}

function normalizarCodigo(valor) {
  form.codigo_corto = String(valor || '')
    .toLocaleUpperCase('es')
    .replace(/[^A-Z0-9_-]/g, '')
}

function normalizarTexto(campo, valor) {
  const texto = String(valor || '')
  form[campo] = texto
    ? texto.charAt(0).toLocaleUpperCase('es') + texto.slice(1)
    : ''
}

function filtrarIconos(valor, actualizar) {
  actualizar(() => {
    const busqueda = valor.trim().toLocaleLowerCase('es')
    opcionesIconos.value = busqueda
      ? catalogoIconos.value.filter((icono) =>
          icono.nombre.toLocaleLowerCase('es').includes(busqueda),
        )
      : [...catalogoIconos.value]
  })
}

async function guardar() {
  guardando.value = true
  try {
    const datos = {
      codigo_corto: form.codigo_corto.trim() || null,
      nombre: form.nombre.trim(),
      subcategoria: form.subcategoria?.trim() || null,
      descripcion: form.descripcion?.trim() || null,
      icono: form.icono,
    }

    if (editandoId.value) {
      await catalogoApi.actualizarCategoria(editandoId.value, datos)
    } else {
      await catalogoApi.crearCategoria(datos)
    }
    dialogo.value = false
    editandoId.value = null
    Object.assign(form, formularioInicial())
    await cargar()
    $q.notify({ type: 'positive', message: 'Categoría guardada correctamente' })
  } catch (error) {
    const errores = error.response?.data?.errors
    const mensaje = errores
      ? Object.values(errores).flat()[0]
      : error.response?.data?.message
    $q.notify({
      type: 'negative',
      message: mensaje || 'No se pudo guardar la categoría',
    })
  } finally {
    guardando.value = false
  }
}

function confirmarCambioEstado(categoria) {
  const activar = !categoria.activo
  $q.dialog({
    title: activar ? 'Activar categoría' : 'Desactivar categoría',
    message: `¿Deseas ${activar ? 'activar' : 'desactivar'} la categoría ${categoria.nombre}?`,
    cancel: { label: 'Cancelar', flat: true },
    ok: {
      label: activar ? 'Activar' : 'Desactivar',
      color: activar ? 'positive' : 'negative',
    },
    persistent: true,
  }).onOk(async () => {
    try {
      await catalogoApi.cambiarEstadoCategoria(categoria.id, activar)
      await cargar()
      $q.notify({
        type: 'positive',
        message: `Categoría ${activar ? 'activada' : 'desactivada'} correctamente`,
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message:
          error.response?.data?.message ||
          'No se pudo cambiar el estado de la categoría',
      })
    }
  })
}

onMounted(cargar)
</script>

<style scoped>
.categoria-dialog {
  width: 88vw;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
}
.categoria-ver-dialog {
  width: 92vw;
  max-width: 560px;
  overflow: hidden;
}
.detalle-toolbar {
  padding: 14px 18px;
  color: var(--ink);
  background: var(--primary-soft);
}
.detalle-contenido {
  padding: 24px;
}
.detalle-encabezado {
  display: flex;
  align-items: center;
  gap: 16px;
}
.detalle-icono {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  flex: 0 0 auto;
  border-radius: 20px;
  color: var(--q-primary);
  background: var(--primary-soft);
}
.detalle-datos {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}
.detalle-campo {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: #fafcfc;
}
.detalle-campo .q-icon {
  margin-top: 2px;
  color: var(--q-primary);
  font-size: 22px;
}
.detalle-etiqueta {
  margin-bottom: 3px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
}
@media (max-width: 700px) {
  .categoria-dialog {
    width: calc(100vw - 24px);
    max-height: 92vh;
  }
  .detalle-contenido {
    padding: 18px;
  }
  .detalle-encabezado {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .detalle-icono {
    width: 60px;
    height: 60px;
  }
}
</style>
