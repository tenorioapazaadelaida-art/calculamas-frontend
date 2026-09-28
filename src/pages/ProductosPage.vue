<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row justify-between items-center q-mb-lg q-gutter-y-sm">
      <div>
        <div class="text-h4 text-weight-bold">Productos</div>
        <div class="text-grey-7">
          Organiza tu catálogo y controla precios y existencias.
        </div>
      </div>
      <q-btn
        v-if="auth.can('productos.crear')"
        color="primary"
        icon="add"
        label="Nuevo producto"
        unelevated
        @click="abrirRegistro"
      />
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-card flat bordered
          ><q-card-section
            ><div class="text-caption text-grey-7">Productos activos</div>
            <div class="text-h4 text-primary">
              {{ activos }}
            </div></q-card-section
          ></q-card
        >
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered
          ><q-card-section
            ><div class="text-caption text-grey-7">Stock bajo</div>
            <div class="text-h4 text-orange">
              {{ stockBajo }}
            </div></q-card-section
          ></q-card
        >
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered class="stock-productos-card">
          <q-card-section>
            <div class="text-caption text-grey-7 q-mb-sm">
              Stock disponible por producto
            </div>
            <div v-if="stockPorProducto.length" class="stock-productos-lista">
              <div
                v-for="producto in stockPorProducto"
                :key="producto.id"
                class="stock-producto"
              >
                <span class="text-weight-medium">{{ producto.nombre }}</span>
                <q-badge color="primary" outline>
                  {{ Number(producto.stock_actual).toString() }}
                  {{ Number(producto.stock_actual) === 1 ? 'unidad' : 'unidades' }}
                </q-badge>
              </div>
            </div>
            <div v-else class="text-grey-6">No hay productos activos.</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle1 text-weight-medium q-mb-md">
          <q-icon name="filter_alt" color="primary" /> Filtrar productos
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-lg-3">
            <q-input
              v-model="filtroProducto"
              outlined
              dense
              clearable
              label="Producto"
              placeholder="Buscar por nombre"
              ><template #prepend><q-icon name="search" /></template
            ></q-input>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <q-input
              v-model="filtroCodigo"
              outlined
              dense
              clearable
              label="Código"
              placeholder="Buscar por código"
              ><template #prepend><q-icon name="qr_code" /></template
            ></q-input>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <q-select
              v-model="filtroCategoria"
              outlined
              dense
              clearable
              emit-value
              map-options
              option-value="id"
              option-label="nombre"
              :options="categoriasFiltro"
              label="Categoría"
              ><template #prepend><q-icon name="category" /></template
            ></q-select>
          </div>
          <div class="col-12 col-sm-6 col-lg-3">
            <q-select
              v-model="filtroSubcategoria"
              outlined
              dense
              clearable
              use-input
              input-debounce="0"
              :options="subcategoriasVisibles"
              label="Subcategoría"
              @filter="filtrarSubcategorias"
              ><template #prepend><q-icon name="account_tree" /></template
            ></q-select>
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-table
        :rows="filtrados"
        :columns="columnas"
        row-key="id"
        flat
        :loading="cargando"
        :grid="$q.screen.lt.md"
      >
        <template #body-cell-imagen="p"
          ><q-td :props="p"
            ><q-avatar rounded size="42px" color="grey-2"
              ><q-img
                v-if="p.row.imagen_url"
                :src="p.row.imagen_url"
                fit="cover" /><q-icon
                v-else
                name="inventory_2"
                color="grey-6" /></q-avatar></q-td
        ></template>
        <template #body-cell-color="p"
          ><q-td :props="p"
            ><span
              v-if="p.value"
              class="color-dot"
              :style="{ backgroundColor: colorVisual(p.value) }"
            />{{ p.value || 'Sin color' }}</q-td
          ></template
        >
        <template #body-cell-activo="p"
          ><q-td :props="p"
            ><q-badge :color="p.value ? 'positive' : 'grey'">{{
              p.value ? 'Activo' : 'Inactivo'
            }}</q-badge></q-td
          ></template
        >
        <template #body-cell-acciones="p">
          <q-td :props="p">
            <q-btn
              v-if="auth.can('productos.editar')"
              flat
              round
              dense
              color="primary"
              icon="edit"
              class="accion-producto"
              aria-label="Editar producto"
              @click="abrirEdicion(p.row)"
            ><q-tooltip>Editar producto</q-tooltip></q-btn>
            <q-btn
              v-if="p.row.activo && auth.can('productos.desactivar')"
              flat
              round
              dense
              color="negative"
              icon="toggle_off"
              class="accion-producto q-ml-xs"
              aria-label="Desactivar producto"
              @click="confirmarDesactivacion(p.row)"
            ><q-tooltip>Desactivar producto</q-tooltip></q-btn>
          </q-td>
        </template>
        <template #item="p">
          <div class="col-12 q-pa-sm">
            <q-card flat bordered class="responsive-data-card">
              <q-card-section class="row no-wrap items-start">
                <q-avatar rounded size="54px" color="grey-2">
                  <q-img v-if="p.row.imagen_url" :src="p.row.imagen_url" fit="cover" />
                  <q-icon v-else name="inventory_2" color="grey-6" />
                </q-avatar>
                <div class="q-ml-md col">
                  <div class="text-weight-bold">{{ p.row.nombre }}</div>
                  <div class="text-caption text-grey-7">{{ p.row.codigo }}</div>
                  <div class="text-caption q-mt-xs">
                    {{ p.row.categoria?.nombre || 'Sin categoría' }} ·
                    {{ p.row.subcategoria || 'Sin subcategoría' }}
                  </div>
                </div>
                <q-badge :color="p.row.activo ? 'positive' : 'grey'">
                  {{ p.row.activo ? 'Activo' : 'Inactivo' }}
                </q-badge>
              </q-card-section>
              <q-separator />
              <q-card-section class="row items-center justify-between q-py-sm">
                <div><span class="text-grey-7">Stock:</span> <strong>{{ Number(p.row.stock_actual) }}</strong></div>
                <div class="row q-gutter-xs">
                  <q-btn v-if="auth.can('productos.editar')" flat round dense color="primary" icon="edit" @click="abrirEdicion(p.row)" />
                  <q-btn v-if="p.row.activo && auth.can('productos.desactivar')" flat round dense color="negative" icon="toggle_off" @click="confirmarDesactivacion(p.row)" />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialogo">
      <q-card class="producto-dialog">
        <q-card-section class="dialog-header row items-center no-wrap">
          <q-avatar
            color="primary"
            text-color="white"
            :icon="editandoId ? 'edit' : 'add_box'"
          />
          <div class="q-ml-md">
            <div class="text-h6">
              {{ editandoId ? 'Editar producto' : 'Registrar producto' }}
            </div>
            <div class="text-caption text-grey-7">
              {{ editandoId
                ? 'Actualiza la información sin alterar el stock.'
                : 'Completa la información del nuevo producto.' }}
            </div>
          </div>
          <q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="row q-col-gutter-md scroll producto-form">
          <q-input
            class="col-12 col-sm-4 codigo-mayuscula"
            v-model="form.codigo"
            outlined
            label="Código *"
            maxlength="60"
            @update:model-value="normalizarCodigoProducto"
          />
          <q-input
            class="col-12 col-sm-8"
            v-model="form.nombre"
            outlined
            label="Nombre del producto *"
            @update:model-value="
              (valor) => normalizarTextoProducto('nombre', valor)
            "
          />
          <q-select
            class="col-12 col-sm-6"
            v-model="form.categoria_id"
            outlined
            emit-value
            map-options
            clearable
            option-value="id"
            option-label="nombre"
            :options="categoriasActivas"
            label="Categoría"
            @update:model-value="actualizarSubcategoriasRegistro"
          />
          <q-select
            class="col-12 col-sm-6"
            v-model="form.subcategoria"
            outlined
            clearable
            use-input
            input-debounce="0"
            :disable="!form.categoria_id"
            :options="subcategoriasRegistroVisibles"
            label="Subcategoría"
            hint="Selecciona una subcategoría ya registrada"
            @filter="filtrarSubcategoriasRegistro"
            ><template #prepend><q-icon name="account_tree" /></template
            ><template #no-option
              ><q-item
                ><q-item-section class="text-grey"
                  >Esta categoría no tiene subcategorías
                  registradas</q-item-section
                ></q-item
              ></template
            ></q-select
          >
          <div class="col-12 col-sm-7">
            <q-file
              v-model="form.imagen"
              outlined
              clearable
              accept=".jpg,.jpeg,.png,.webp,image/*"
              max-file-size="3145728"
              label="Imagen del producto"
              @rejected="imagenRechazada"
              ><template #prepend
                ><q-icon name="add_photo_alternate" /></template
            ></q-file>
          </div>
          <div class="col-12 col-sm-5">
            <q-input
              v-model="form.color"
              outlined
              clearable
              maxlength="40"
              label="Color del producto"
              hint="Escribe el nombre, por ejemplo: Negro"
              @update:model-value="
                (valor) => normalizarTextoProducto('color', valor)
              "
              ><template #prepend><q-icon name="palette" /></template
            ></q-input>
          </div>
          <div v-if="imagenPrevia || imagenActualUrl" class="col-12">
            <div class="image-preview">
              <q-img :src="imagenPrevia || imagenActualUrl" fit="contain" />
              <div class="text-caption text-grey-7 q-mt-sm">
                {{ imagenPrevia
                  ? 'Vista previa de la nueva imagen'
                  : 'Imagen guardada actualmente' }}
              </div>
            </div>
          </div>
          <q-input
            class="col-12"
            v-model="form.descripcion"
            outlined
            type="textarea"
            autogrow
            label="Descripción"
            @update:model-value="
              (valor) => normalizarTextoProducto('descripcion', valor)
            "
          />
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md"
          ><q-btn flat label="Cancelar" v-close-popup /><q-btn
            color="primary"
            icon="save"
            :label="editandoId ? 'Guardar cambios' : 'Guardar producto'"
            :loading="guardando"
            @click="guardar"
        /></q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { auth } from 'src/services/auth'
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { catalogoApi } from 'src/services/sistemaApi'

const $q = useQuasar()
const productos = ref([]),
  categorias = ref([]),
  filtroProducto = ref(''),
  filtroCodigo = ref(''),
  filtroCategoria = ref(null),
  filtroSubcategoria = ref(null),
  subcategoriasVisibles = ref([]),
  subcategoriasRegistroVisibles = ref([]),
  cargando = ref(false),
  guardando = ref(false),
  dialogo = ref(false),
  editandoId = ref(null),
  imagenActualUrl = ref('')
const form = reactive({
  codigo: '',
  nombre: '',
  categoria_id: null,
  subcategoria: '',
  precio_venta: 0,
  stock_minimo: 0,
  imagen: null,
  color: '',
  descripcion: '',
})

const columnas = [
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
  { name: 'imagen', label: 'Imagen', field: 'imagen_url', align: 'center' },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' },
  { name: 'nombre', label: 'Producto', field: 'nombre', align: 'left' },
  {
    name: 'categoria',
    label: 'Categoría',
    field: (r) => r.categoria?.nombre || 'Sin categoría',
    align: 'left',
  },
  {
    name: 'subcategoria',
    label: 'Subcategoría',
    field: 'subcategoria',
    format: (v) => v || 'Sin subcategoría',
    align: 'left',
  },
  { name: 'color', label: 'Color', field: 'color', align: 'left' },
  {
    name: 'stock_actual',
    label: 'Stock',
    field: 'stock_actual',
    format: (v) => Number(v).toString(),
    align: 'right',
  },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
]
const categoriasActivas = computed(() =>
  categorias.value.filter((c) => c.activo),
)
const categoriasFiltro = computed(() =>
  categorias.value.map(({ id, nombre }) => ({ id, nombre })),
)
const subcategoriasDisponibles = computed(() =>
  [
    ...new Set(
      productos.value
        .filter(
          (p) =>
            !filtroCategoria.value || p.categoria_id === filtroCategoria.value,
        )
        .map((p) => p.subcategoria?.trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, 'es')),
)
const subcategoriasRegistro = computed(() =>
  [
    ...new Set(
      categorias.value
        .filter((c) => c.activo && c.id === form.categoria_id)
        .map((c) => c.subcategoria?.trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b, 'es')),
)
const filtrados = computed(() => {
  const producto = filtroProducto.value?.trim().toLowerCase() || '',
    codigo = filtroCodigo.value?.trim().toLowerCase() || ''
  return productos.value.filter(
    (p) =>
      (!producto || p.nombre.toLowerCase().includes(producto)) &&
      (!codigo ||
        String(p.codigo || '')
          .toLowerCase()
          .includes(codigo)) &&
      (!filtroCategoria.value || p.categoria_id === filtroCategoria.value) &&
      (!filtroSubcategoria.value ||
        p.subcategoria === filtroSubcategoria.value),
  )
})
const activos = computed(() => productos.value.filter((p) => p.activo).length)
const stockBajo = computed(
  () =>
    productos.value.filter(
      (p) => Number(p.stock_actual) <= Number(p.stock_minimo),
    ).length,
)
const stockPorProducto = computed(() =>
  productos.value
    .filter((producto) => producto.activo)
    .slice()
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
)
const imagenPrevia = computed(() =>
  form.imagen ? URL.createObjectURL(form.imagen) : null,
)

function filtrarSubcategorias(valor, actualizar) {
  actualizar(() => {
    const texto = valor.toLowerCase()
    subcategoriasVisibles.value = subcategoriasDisponibles.value.filter((s) =>
      s.toLowerCase().includes(texto),
    )
  })
}
function normalizarCodigoProducto(valor) {
  form.codigo = String(valor || '').toLocaleUpperCase('es')
}
function normalizarTextoProducto(campo, valor) {
  const texto = String(valor || '')
  form[campo] = texto
    ? texto.charAt(0).toLocaleUpperCase('es') + texto.slice(1)
    : ''
}
const coloresVisuales = {
  blanco: '#ffffff',
  negro: '#212121',
  azul: '#2196f3',
  celeste: '#29b6f6',
  rojo: '#e53935',
  verde: '#43a047',
  amarillo: '#fdd835',
  naranja: '#fb8c00',
  morado: '#8e24aa',
  violeta: '#7e57c2',
  rosado: '#ec407a',
  rosa: '#ec407a',
  gris: '#757575',
  marron: '#795548',
  cafe: '#795548',
  beige: '#d7ccc8',
  dorado: '#d4af37',
  plateado: '#b0bec5',
}
function colorVisual(valor) {
  const texto = String(valor || '').trim()
  if (/^#[0-9a-f]{3,8}$/i.test(texto)) return texto
  const clave = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  return coloresVisuales[clave] || '#90a4ae'
}
function filtrarSubcategoriasRegistro(valor, actualizar) {
  actualizar(() => {
    const texto = valor.toLowerCase()
    subcategoriasRegistroVisibles.value = subcategoriasRegistro.value.filter(
      (s) => s.toLowerCase().includes(texto),
    )
  })
}
function actualizarSubcategoriasRegistro() {
  form.subcategoria = ''
  subcategoriasRegistroVisibles.value = subcategoriasRegistro.value
}
function abrirRegistro() {
  limpiar()
  dialogo.value = true
}
function abrirEdicion(producto) {
  limpiar()
  editandoId.value = producto.id
  imagenActualUrl.value = producto.imagen_url || ''
  Object.assign(form, {
    codigo: producto.codigo || '',
    nombre: producto.nombre || '',
    categoria_id: producto.categoria_id || null,
    subcategoria: producto.subcategoria || '',
    precio_venta: Number(producto.precio_venta || 0),
    stock_minimo: Number(producto.stock_minimo || 0),
    imagen: null,
    color: producto.color || '',
    descripcion: producto.descripcion || '',
  })
  subcategoriasRegistroVisibles.value = subcategoriasRegistro.value
  dialogo.value = true
}
function limpiar() {
  editandoId.value = null
  imagenActualUrl.value = ''
  Object.assign(form, {
    codigo: '',
    nombre: '',
    categoria_id: null,
    subcategoria: '',
    precio_venta: 0,
    stock_minimo: 0,
    imagen: null,
    color: '',
    descripcion: '',
  })
}
function imagenRechazada() {
  $q.notify({
    type: 'negative',
    message: 'La imagen debe ser JPG, PNG o WebP y pesar máximo 3 MB.',
  })
}
async function cargar() {
  cargando.value = true
  try {
    const [p, c] = await Promise.all([
      catalogoApi.listarProductos(),
      catalogoApi.listarCategorias(),
    ])
    productos.value = p.data
    categorias.value = c.data
    subcategoriasVisibles.value = subcategoriasDisponibles.value
  } finally {
    cargando.value = false
  }
}
async function guardar() {
  guardando.value = true
  try {
    const estabaEditando = Boolean(editandoId.value)
    const datos = new FormData()
    Object.entries(form).forEach(([clave, valor]) => {
      if (valor !== null && valor !== '') datos.append(clave, valor)
    })
    if (editandoId.value) {
      await catalogoApi.actualizarProducto(editandoId.value, datos)
    } else {
      await catalogoApi.crearProducto(datos)
    }
    dialogo.value = false
    limpiar()
    await cargar()
    $q.notify({
      type: 'positive',
      message: estabaEditando
        ? 'Producto actualizado correctamente'
        : 'Producto registrado correctamente',
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message:
        e.response?.data?.message ||
        Object.values(e.response?.data?.errors || {})[0]?.[0] ||
        'Revisa los datos ingresados',
    })
  } finally {
    guardando.value = false
  }
}
function confirmarDesactivacion(producto) {
  $q.dialog({
    title: 'Desactivar producto',
    message: `¿Deseas desactivar “${producto.nombre}”? Sus operaciones anteriores se conservarán.`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Desactivar', color: 'negative', unelevated: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await catalogoApi.desactivarProducto(producto.id)
      await cargar()
      $q.notify({ type: 'positive', message: 'Producto desactivado correctamente' })
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: e.response?.data?.message || 'No se pudo desactivar el producto.',
      })
    }
  })
}
onMounted(cargar)
</script>

<style scoped>
.producto-dialog {
  width: 820px;
  max-width: 94vw;
  border-radius: 20px;
}
.stock-productos-card {
  height: 100%;
}
.stock-productos-lista {
  display: grid;
  gap: 7px;
  max-height: 92px;
  overflow-y: auto;
  padding-right: 4px;
}
.stock-producto {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.dialog-header {
  background: linear-gradient(135deg, #f5fbfb, #eef5f5);
}
.producto-form {
  max-height: 68vh;
}
.image-preview {
  width: 180px;
  padding: 12px;
  text-align: center;
  border: 1px dashed #9eb8ba;
  border-radius: 14px;
  background: #f7fafa;
}
.image-preview .q-img {
  height: 120px;
  border-radius: 9px;
}
.color-dot {
  display: inline-block;
  border: 1px solid #aeb8b9;
  border-radius: 50%;
}
.color-dot {
  width: 14px;
  height: 14px;
  margin-right: 7px;
  vertical-align: middle;
}
:deep(.codigo-mayuscula input) {
  text-transform: uppercase;
}
@media (max-width: 599px) {
  .q-page {
    padding: 14px;
  }
  .producto-dialog {
    width: 96vw;
    max-width: 96vw;
    border-radius: 14px;
  }
  .producto-form {
    max-height: 65vh;
  }
  .q-card__actions .q-btn {
    flex: 1 1 auto;
  }
}
</style>
