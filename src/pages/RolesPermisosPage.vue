<template>
  <div>
    <div class="page-shell">
      <div class="q-mb-lg">
        <div class="page-title">Usuarios, roles y permisos</div>
        <div class="page-subtitle">
          Administra permisos heredados por rol y excepciones específicas por
          usuario.
        </div>
      </div>

      <q-tabs
        v-model="modo"
        dense
        align="left"
        active-color="primary"
        class="q-mb-md"
      >
        <q-tab name="usuario" icon="person" label="Permisos por usuario" />
        <q-tab name="rol" icon="badge" label="Permisos por rol" />
      </q-tabs>

      <q-card v-if="modo === 'usuario'" class="surface-card">
        <q-card-section>
          <q-select
            v-model="usuarioSeleccionadoId"
            outlined
            use-input
            emit-value
            map-options
            option-value="id"
            option-label="nombre"
            :options="usuariosFiltrados"
            label="Buscar y seleccionar usuario"
            :loading="cargando"
            @filter="filtrarUsuarios"
            @update:model-value="cargarPermisosUsuario"
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.nombre }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.correo }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>

        <template v-if="usuarioSeleccionado">
          <q-separator />
          <q-card-section>
            <div class="row items-center justify-between q-col-gutter-md">
              <div class="col-12 col-md">
                <div class="text-h6 text-weight-bold">
                  {{ usuarioSeleccionado.nombre }}
                </div>
                <div class="text-caption text-grey-7">
                  {{ usuarioSeleccionado.correo }}
                </div>
              </div>
              <div class="col-12 col-md-auto">
                <div class="text-caption text-grey-7 q-mb-xs">
                  Roles asignados
                </div>
                <q-chip
                  v-for="rol in usuarioSeleccionado.roles"
                  :key="rol.id"
                  dense
                  color="grey-3"
                  text-color="primary"
                >
                  {{ rol.nombre }}
                </q-chip>
                <span
                  v-if="!usuarioSeleccionado.roles?.length"
                  class="text-grey-7"
                >
                  Sin roles
                </span>
              </div>
            </div>
          </q-card-section>

          <q-separator />
          <q-card-section>
            <q-banner rounded class="bg-blue-1 text-primary q-mb-lg">
              Los permisos marcados son el resultado de sus roles más sus
              permisos personales. Puedes marcar o quitar permisos
              específicamente para este usuario.
            </q-banner>

            <div class="row q-col-gutter-lg">
              <div
                v-for="grupo in gruposPermisos"
                :key="grupo.modulo"
                class="col-12 col-md-6 col-lg-4"
              >
                <div class="text-subtitle1 text-weight-bold q-mb-sm">
                  {{ nombreModulo(grupo.modulo) }}
                </div>
                <q-list bordered separator>
                  <q-item
                    v-for="permiso in grupo.permisos"
                    :key="permiso.id"
                    tag="label"
                  >
                    <q-item-section avatar>
                      <q-checkbox
                        v-model="permisosSeleccionados"
                        :val="permiso.identificador"
                        :disable="!puedeAsignar"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ permiso.nombre }}</q-item-label>
                      <q-item-label caption>{{
                        permiso.identificador
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-card-section>

          <q-separator />
          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              flat
              color="grey-8"
              icon="close"
              label="Cancelar"
              :disable="guardando"
              @click="cancelarEdicion"
            />
            <q-btn
              color="primary"
              icon="save"
              label="Guardar permisos del usuario"
              :disable="!puedeAsignar"
              :loading="guardando"
              @click="guardar"
            />
          </q-card-actions>
        </template>

        <q-card-section v-else class="text-center text-grey-7 q-py-xl">
          Selecciona un usuario para consultar sus roles y permisos.
        </q-card-section>
      </q-card>

      <q-card v-else class="surface-card">
        <q-card-section>
          <q-select
            v-model="rolSeleccionadoId"
            outlined
            emit-value
            map-options
            option-value="id"
            option-label="nombre"
            :options="roles"
            label="Seleccionar rol"
            :loading="cargando"
            @update:model-value="cargarPermisosRol"
          />
        </q-card-section>

        <template v-if="rolSeleccionado">
          <q-separator />
          <q-card-section>
            <div class="text-h6 text-weight-bold">
              {{ rolSeleccionado.nombre }}
            </div>
            <div class="text-caption text-grey-7">
              Estos permisos serán heredados por todos los usuarios que tengan
              este rol.
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="row q-col-gutter-lg">
              <div
                v-for="grupo in gruposPermisos"
                :key="grupo.modulo"
                class="col-12 col-md-6 col-lg-4"
              >
                <div class="text-subtitle1 text-weight-bold q-mb-sm">
                  {{ nombreModulo(grupo.modulo) }}
                </div>
                <q-list bordered separator>
                  <q-item
                    v-for="permiso in grupo.permisos"
                    :key="permiso.id"
                    tag="label"
                  >
                    <q-item-section avatar>
                      <q-checkbox
                        v-model="permisosRolSeleccionados"
                        :val="permiso.identificador"
                        :disable="!puedeAsignar"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ permiso.nombre }}</q-item-label>
                      <q-item-label caption>{{
                        permiso.identificador
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              flat
              color="grey-8"
              icon="close"
              label="Cancelar"
              :disable="guardando"
              @click="cancelarEdicion"
            />
            <q-btn
              color="primary"
              icon="save"
              label="Guardar permisos del rol"
              :disable="!puedeAsignar"
              :loading="guardando"
              @click="guardarRol"
            />
          </q-card-actions>
        </template>

        <q-card-section v-else class="text-center text-grey-7 q-py-xl">
          Selecciona un rol para consultar y administrar sus permisos.
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { administracionApi } from 'src/services/sistemaApi'
import { auth } from 'src/services/auth'

const emit = defineEmits(['guardado'])
const $q = useQuasar()
const modo = ref('usuario')
const usuarios = ref([])
const usuariosFiltrados = ref([])
const roles = ref([])
const permisosPorModulo = ref({})
const usuarioSeleccionadoId = ref(null)
const usuarioSeleccionado = ref(null)
const permisosSeleccionados = ref([])
const rolSeleccionadoId = ref(null)
const permisosRolSeleccionados = ref([])
const cargando = ref(false)
const guardando = ref(false)
const puedeAsignar = computed(() => auth.can('roles.asignar_permisos'))
const rolSeleccionado = computed(() =>
  roles.value.find((rol) => rol.id === rolSeleccionadoId.value),
)
const gruposPermisos = computed(() =>
  Object.entries(permisosPorModulo.value).map(([modulo, permisos]) => ({
    modulo,
    permisos,
  })),
)

const etiquetasModulos = {
  dashboard: 'Inicio',
  usuarios: 'Usuarios',
  roles: 'Roles',
  categorias: 'Categorías',
  productos: 'Productos',
  compras: 'Compras',
  inventario: 'Inventario',
  kardex: 'Kardex',
  ventas: 'Ventas',
  utilidades: 'Utilidades',
  categorias_gastos: 'Categorías de gastos',
  gastos: 'Gastos',
  impuestos: 'Impuestos',
  reportes: 'Reportes',
  configuracion: 'Configuración',
}

function nombreModulo(modulo) {
  return etiquetasModulos[modulo] || modulo
}

function cancelarEdicion() {
  if (guardando.value) return

  if (modo.value === 'usuario') {
    usuarioSeleccionadoId.value = null
    usuarioSeleccionado.value = null
    permisosSeleccionados.value = []
    return
  }

  rolSeleccionadoId.value = null
  permisosRolSeleccionados.value = []
}

function confirmarGuardado(mensaje) {
  return new Promise((resolve) => {
    $q.dialog({
      title: 'Guardado correctamente',
      message: mensaje,
      ok: { label: 'Volver a Usuarios', color: 'primary' },
      persistent: true,
    }).onOk(resolve)
  })
}

function filtrarUsuarios(valor, actualizar) {
  actualizar(() => {
    const busqueda = valor.trim().toLocaleLowerCase('es')
    usuariosFiltrados.value = busqueda
      ? usuarios.value.filter((usuario) =>
          `${usuario.nombre} ${usuario.correo}`
            .toLocaleLowerCase('es')
            .includes(busqueda),
        )
      : usuarios.value
  })
}

function cargarPermisosRol() {
  permisosRolSeleccionados.value =
    rolSeleccionado.value?.permisos?.map((permiso) => permiso.identificador) ||
    []
}

async function cargarPermisosUsuario() {
  if (!usuarioSeleccionadoId.value) {
    usuarioSeleccionado.value = null
    permisosSeleccionados.value = []
    return
  }

  const respuesta = await administracionApi.obtenerPermisosUsuario(
    usuarioSeleccionadoId.value,
  )
  usuarioSeleccionado.value = respuesta.data.usuario
  permisosSeleccionados.value = respuesta.data.permisos
}

async function cargar() {
  cargando.value = true
  try {
    const [respuestaUsuarios, respuestaRoles, respuestaPermisos] =
      await Promise.all([
        administracionApi.listarUsuarios(),
        administracionApi.listarRoles(),
        administracionApi.listarPermisos(),
      ])
    usuarios.value = respuestaUsuarios.data
    usuariosFiltrados.value = usuarios.value
    roles.value = respuestaRoles.data
    permisosPorModulo.value = respuestaPermisos.data
  } catch (error) {
    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        'No se pudieron cargar los usuarios y permisos',
    })
  } finally {
    cargando.value = false
  }
}

async function guardarRol() {
  guardando.value = true
  try {
    const permisosEsperados = [...permisosRolSeleccionados.value].sort()
    await administracionApi.asignarPermisos(
      rolSeleccionadoId.value,
      permisosRolSeleccionados.value,
    )
    const verificacion = await administracionApi.listarRoles()
    roles.value = verificacion.data
    const rolGuardado = roles.value.find(
      (rol) => rol.id === rolSeleccionadoId.value,
    )
    const permisosGuardados =
      rolGuardado?.permisos?.map((permiso) => permiso.identificador).sort() ||
      []

    if (
      JSON.stringify(permisosGuardados) !== JSON.stringify(permisosEsperados)
    ) {
      throw new Error(
        'No se pudo confirmar la actualización de los permisos del rol',
      )
    }

    permisosRolSeleccionados.value = permisosGuardados
    await confirmarGuardado(
      'Los permisos del rol se guardaron y verificaron correctamente.',
    )
    emit('guardado')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        error.message ||
        'No se pudieron guardar los permisos del rol',
    })
  } finally {
    guardando.value = false
  }
}

async function guardar() {
  guardando.value = true
  try {
    const permisosEsperados = [...permisosSeleccionados.value].sort()
    await administracionApi.actualizarPermisosUsuario(
      usuarioSeleccionadoId.value,
      permisosSeleccionados.value,
    )
    const verificacion = await administracionApi.obtenerPermisosUsuario(
      usuarioSeleccionadoId.value,
    )
    const permisosGuardados = [...verificacion.data.permisos].sort()

    if (
      JSON.stringify(permisosGuardados) !== JSON.stringify(permisosEsperados)
    ) {
      throw new Error(
        'No se pudo confirmar la actualización de todos los permisos',
      )
    }

    usuarioSeleccionado.value = verificacion.data.usuario
    permisosSeleccionados.value = verificacion.data.permisos
    await confirmarGuardado(
      'Los permisos del usuario se guardaron y verificaron correctamente.',
    )
    emit('guardado', verificacion.data.usuario)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message ||
        error.message ||
        'No se pudieron guardar los permisos del usuario',
    })
  } finally {
    guardando.value = false
  }
}

onMounted(cargar)
</script>
