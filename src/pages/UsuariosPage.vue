<template>
  <q-page>
    <div class="page-shell">
      <div class="row justify-between items-center q-mb-lg">
        <div>
          <div class="page-title">Usuarios</div>
          <div class="page-subtitle">
            Administra quién puede ingresar y qué rol tendrá.
          </div>
        </div>
        <div class="q-gutter-sm">
          <q-btn
            v-if="auth.can('roles.ver')"
            outline
            color="primary"
            icon="admin_panel_settings"
            label="Roles y permisos"
            @click="rolesDialog = true"
          />
          <q-btn
            v-if="auth.can('usuarios.crear')"
            color="primary"
            icon="person_add"
            label="Nuevo usuario"
            @click="openDialog"
          />
        </div>
      </div>

      <q-card class="surface-card">
        <q-table
          :rows="users"
          :columns="columns"
          row-key="id"
          :loading="loading"
          flat
          :grid="$q.screen.lt.md"
        >
          <template #body-cell-roles="props">
            <q-td :props="props">
              <q-chip
                v-for="role in props.row.roles"
                :key="role.id"
                dense
                color="grey-3"
                text-color="primary"
              >
                {{ role.nombre }}
              </q-chip>
            </q-td>
          </template>
          <template #body-cell-activo="props">
            <q-td :props="props">
              <q-badge :color="props.row.activo ? 'positive' : 'grey'">
                {{ props.row.activo ? 'Activo' : 'Inactivo' }}
              </q-badge>
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props" class="q-gutter-xs">
              <q-btn
                flat
                round
                dense
                color="secondary"
                icon="visibility"
                aria-label="Ver usuario"
                @click="viewUser(props.row)"
              >
                <q-tooltip>Ver usuario</q-tooltip>
              </q-btn>
              <q-btn
                v-if="auth.can('usuarios.editar')"
                flat
                round
                dense
                color="primary"
                icon="edit"
                aria-label="Editar usuario"
                @click="openDialog(props.row)"
              >
                <q-tooltip>Editar usuario</q-tooltip>
              </q-btn>
              <q-btn
                v-if="auth.can('usuarios.desactivar') && props.row.activo"
                flat
                round
                dense
                color="negative"
                icon="person_off"
                aria-label="Desactivar usuario"
                @click="confirmDeactivate(props.row)"
              >
                <q-tooltip>Desactivar usuario</q-tooltip>
              </q-btn>
            </q-td>
          </template>
          <template #item="props">
            <div class="col-12 q-pa-sm">
              <q-card flat bordered class="responsive-data-card">
                <q-card-section>
                  <div class="row justify-between items-start no-wrap">
                    <div>
                      <div class="text-weight-bold">{{ props.row.nombre }}</div>
                      <div class="text-caption text-grey-7">{{ props.row.correo }}</div>
                    </div>
                    <q-badge :color="props.row.activo ? 'positive' : 'grey'">
                      {{ props.row.activo ? 'Activo' : 'Inactivo' }}
                    </q-badge>
                  </div>
                  <div class="q-mt-sm">
                    <q-chip v-for="role in props.row.roles" :key="role.id" dense color="grey-3" text-color="primary">{{ role.nombre }}</q-chip>
                  </div>
                </q-card-section>
                <q-separator />
                <q-card-actions align="right">
                  <q-btn flat round dense color="secondary" icon="visibility" @click="viewUser(props.row)" />
                  <q-btn v-if="auth.can('usuarios.editar')" flat round dense color="primary" icon="edit" @click="openDialog(props.row)" />
                  <q-btn v-if="auth.can('usuarios.desactivar') && props.row.activo" flat round dense color="negative" icon="person_off" @click="confirmDeactivate(props.row)" />
                </q-card-actions>
              </q-card>
            </div>
          </template>
        </q-table>
      </q-card>

      <q-dialog v-model="dialog">
        <q-card style="width: 520px; max-width: 95vw">
          <q-card-section>
            <div class="text-h6 text-weight-bold">
              {{ editingUserId ? 'Editar usuario' : 'Nuevo usuario' }}
            </div>
            <div class="text-caption text-grey-7">
              Selecciona uno o varios roles para el usuario.
            </div>
          </q-card-section>
          <q-card-section>
            <q-form ref="userForm" class="q-gutter-md" @submit="save">
              <q-input
                v-model="form.nombre"
                outlined
                label="Nombre completo"
                hint="Ingresa nombres y apellidos"
                autocomplete="name"
                maxlength="255"
                counter
                lazy-rules
                :rules="[required, fullNameRule]"
                @blur="normalizeFullName"
              />
              <q-input
                v-model="form.correo"
                outlined
                type="email"
                label="Correo electrónico"
                autocomplete="email"
                maxlength="255"
                lazy-rules
                :rules="[required]"
              />
              <q-input
                v-model="form.password"
                outlined
                :type="showPassword ? 'text' : 'password'"
                label="Contraseña"
                autocomplete="new-password"
                lazy-rules
                :hint="
                  editingUserId
                    ? 'Déjala vacía para conservar la contraseña actual'
                    : 'Mínimo 8 caracteres'
                "
                :rules="[
                  (value) =>
                    (editingUserId && !value) ||
                    value.length >= 8 ||
                    'La contraseña debe tener al menos 8 caracteres',
                ]"
              >
                <template #append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    :aria-label="
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    "
                    role="button"
                    tabindex="0"
                    @click="showPassword = !showPassword"
                    @keydown.enter="showPassword = !showPassword"
                    @keydown.space.prevent="showPassword = !showPassword"
                  >
                    <q-tooltip>
                      {{
                        showPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }}
                    </q-tooltip>
                  </q-icon>
                </template>
              </q-input>
              <q-select
                v-model="form.roles"
                outlined
                multiple
                use-input
                use-chips
                clearable
                input-debounce="0"
                emit-value
                map-options
                option-value="id"
                option-label="nombre"
                :options="filteredRoles"
                label="Roles"
                hint="Busca y selecciona uno o varios roles"
                lazy-rules
                :rules="[
                  (value) => value?.length > 0 || 'Selecciona al menos un rol',
                ]"
                @filter="filterRoles"
              >
                <template #no-option>
                  <q-item>
                    <q-item-section class="text-grey"
                      >No se encontraron roles</q-item-section
                    >
                  </q-item>
                </template>
              </q-select>
              <q-toggle
                v-if="editingUserId"
                v-model="form.activo"
                color="positive"
                label="Usuario activo"
              />
            </q-form>
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn
              color="primary"
              :label="editingUserId ? 'Guardar cambios' : 'Guardar usuario'"
              :loading="saving"
              @click="submitForm"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="viewDialog">
        <q-card style="width: 480px; max-width: 95vw">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-h6 text-weight-bold">Detalle del usuario</div>
              <div class="text-caption text-grey-7">
                Información registrada y roles asignados.
              </div>
            </div>
            <q-btn
              v-close-popup
              flat
              round
              dense
              icon="close"
              aria-label="Cerrar"
            />
          </q-card-section>
          <q-separator />
          <q-card-section v-if="selectedUser" class="q-gutter-md">
            <q-list separator>
              <q-item>
                <q-item-section avatar
                  ><q-icon name="person" color="primary"
                /></q-item-section>
                <q-item-section>
                  <q-item-label caption>Nombre completo</q-item-label>
                  <q-item-label>{{ selectedUser.nombre }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar
                  ><q-icon name="email" color="primary"
                /></q-item-section>
                <q-item-section>
                  <q-item-label caption>Correo electrónico</q-item-label>
                  <q-item-label>{{ selectedUser.correo }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="verified_user" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Roles</q-item-label>
                  <div class="q-gutter-xs q-mt-xs">
                    <q-chip
                      v-for="role in selectedUser.roles"
                      :key="role.id"
                      dense
                      color="grey-3"
                      text-color="primary"
                    >
                      {{ role.nombre }}
                    </q-chip>
                    <span v-if="!selectedUser.roles?.length" class="text-grey-7"
                      >Sin roles</span
                    >
                  </div>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section avatar>
                  <q-icon
                    :name="selectedUser.activo ? 'check_circle' : 'cancel'"
                    :color="selectedUser.activo ? 'positive' : 'grey'"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Estado</q-item-label>
                  <q-item-label>{{
                    selectedUser.activo ? 'Activo' : 'Inactivo'
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn v-close-popup flat label="Cerrar" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog ref="rolesDialogRef" v-model="rolesDialog">
        <q-card class="roles-permisos-dialog">
          <q-toolbar>
            <q-btn
              v-close-popup
              flat
              round
              dense
              icon="close"
              aria-label="Cerrar"
            />
            <q-toolbar-title
              >Administración de roles y permisos</q-toolbar-title
            >
            <q-btn
              flat
              icon="close"
              label="Cancelar"
              aria-label="Cancelar roles y permisos"
              @click="cerrarRolesPermisos"
            />
          </q-toolbar>
          <q-separator />
          <roles-permisos-page @guardado="cerrarRolesPermisos" />
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { administracionApi } from 'src/services/sistemaApi'
import { auth } from 'src/services/auth'
import RolesPermisosPage from 'src/pages/RolesPermisosPage.vue'

const $q = useQuasar()
const users = ref([])
const roles = ref([])
const filteredRoles = ref([])
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const viewDialog = ref(false)
const rolesDialog = ref(false)
const rolesDialogRef = ref(null)
const selectedUser = ref(null)
const showPassword = ref(false)
const editingUserId = ref(null)
const userForm = ref(null)
const form = reactive({
  nombre: '',
  correo: '',
  password: '',
  roles: [],
  activo: true,
})
const required = (value) =>
  Boolean(String(value ?? '').trim()) || 'Este campo es obligatorio'
const fullNameRule = (value) => {
  const normalized = String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
  if (normalized.length < 3) return 'El nombre completo es demasiado corto'
  if (!/^[\p{L}\p{M}]+(?:[- '][\p{L}\p{M}]+)+$/u.test(normalized)) {
    return 'Ingresa nombres y apellidos válidos'
  }
  return true
}
const columns = [
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'correo', label: 'Correo', field: 'correo', align: 'left' },
  { name: 'roles', label: 'Roles', field: 'roles', align: 'left' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
]

async function load() {
  loading.value = true
  try {
    const [usersResponse] = await Promise.all([
      administracionApi.listarUsuarios(),
      loadRoles(),
    ])
    users.value = usersResponse.data
  } finally {
    loading.value = false
  }
}

async function loadRoles() {
  const response = await administracionApi.listarRoles()
  roles.value = response.data.filter((role) => role.activo)
  filteredRoles.value = roles.value
}

async function openDialog(usuario = null) {
  try {
    await loadRoles()
    showPassword.value = false
    editingUserId.value = usuario?.id ?? null
    Object.assign(form, {
      nombre: usuario?.nombre ?? '',
      correo: usuario?.correo ?? '',
      password: '',
      roles: usuario?.roles?.map((role) => role.id) ?? [],
      activo: usuario?.activo ?? true,
    })
    dialog.value = true
  } catch (error) {
    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message || 'No se pudieron cargar los roles',
    })
  }
}

function filterRoles(value, update) {
  update(() => {
    const search = value.trim().toLocaleLowerCase('es')
    filteredRoles.value = search
      ? roles.value.filter((role) =>
          role.nombre.toLocaleLowerCase('es').includes(search),
        )
      : roles.value
  })
}

function submitForm() {
  userForm.value?.submit()
}

function normalizeFullName() {
  form.nombre = form.nombre
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('es')
    .replace(/(^|[\s'-])(\p{L})/gu, (_, separator, letter) => {
      return separator + letter.toLocaleUpperCase('es')
    })
}

function viewUser(usuario) {
  selectedUser.value = usuario
  viewDialog.value = true
}

function cerrarRolesPermisos(usuarioActualizado) {
  const indice = users.value.findIndex(
    (usuario) => usuario.id === usuarioActualizado?.id,
  )
  if (indice !== -1) {
    users.value.splice(indice, 1, {
      ...users.value[indice],
      ...usuarioActualizado,
    })
  }
  rolesDialog.value = false
  rolesDialogRef.value?.hide()
}

async function save() {
  saving.value = true
  try {
    normalizeFullName()
    const payload = { ...form }
    if (editingUserId.value && !payload.password) delete payload.password

    if (editingUserId.value) {
      await administracionApi.actualizarUsuario(editingUserId.value, payload)
    } else {
      await administracionApi.crearUsuario(payload)
    }
    dialog.value = false
    showPassword.value = false
    editingUserId.value = null
    Object.assign(form, {
      nombre: '',
      correo: '',
      password: '',
      roles: [],
      activo: true,
    })
    await load()
    $q.notify({ type: 'positive', message: 'Usuario guardado correctamente' })
  } catch (error) {
    const errors = error.response?.data?.errors
    const message = errors
      ? Object.values(errors).flat()[0]
      : error.response?.data?.message
    $q.notify({
      type: 'negative',
      message: message || 'No se pudo guardar el usuario',
    })
  } finally {
    saving.value = false
  }
}

function confirmDeactivate(usuario) {
  $q.dialog({
    title: 'Desactivar usuario',
    message: `¿Deseas desactivar a ${usuario.nombre}? Ya no podrá iniciar sesión.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await administracionApi.desactivarUsuario(usuario.id)
      await load()
      $q.notify({
        type: 'positive',
        message: 'Usuario desactivado correctamente',
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message:
          error.response?.data?.message || 'No se pudo desactivar el usuario',
      })
    }
  })
}

onMounted(load)
</script>

<style scoped>
.roles-permisos-dialog {
  width: 72vw;
  max-width: 780px;
  height: 70vh;
  max-height: 70vh;
  overflow-y: auto;
}

@media (max-width: 700px) {
  .roles-permisos-dialog {
    width: calc(100vw - 24px);
    max-width: calc(100vw - 24px);
    height: 86vh;
    max-height: 86vh;
  }
}

@media (min-width: 701px) and (max-width: 1023px) {
  .roles-permisos-dialog {
    width: 78vw;
    max-width: 720px;
    height: 74vh;
    max-height: 74vh;
  }
}
</style>
