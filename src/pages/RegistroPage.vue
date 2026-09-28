<template>
  <main class="register-page">
    <router-link class="register-brand" to="/bienvenida">
      <CalculaLogo :size="46" />
      <strong>Calcula+</strong>
    </router-link>

    <q-card class="register-card" flat>
      <q-card-section class="register-content">
        <div class="register-kicker">CREA TU ESPACIO DE TRABAJO</div>
        <h1>Comienza con Calcula+</h1>
        <p>Registra tu negocio y crea el acceso de su administrador.</p>

        <q-form class="register-form" @submit="submit">
          <div class="section-title">
            <span>1</span>
            <div>
              <strong>Tu negocio</strong>
              <small>Información principal de tu emprendimiento</small>
            </div>
          </div>

          <div class="form-grid">
            <q-input
              v-model.trim="form.nombre_negocio"
              outlined
              label="Nombre del negocio *"
              autocomplete="organization"
              :disable="loading"
              :rules="[(value) => !!value || 'Ingresa el nombre del negocio']"
            />
            <q-input
              v-model.trim="form.tipo_negocio"
              outlined
              label="Actividad del negocio *"
              :disable="loading"
              maxlength="100"
              hint="Por ejemplo: venta de ropa, accesorios o alimentos"
              :rules="[(value) => !!value?.trim() || 'Ingresa la actividad del negocio']"
            />
            <q-input
              v-model.trim="form.telefono"
              outlined
              label="Teléfono (opcional)"
              autocomplete="tel"
              :disable="loading"
            />
            <q-input
              v-model.trim="form.direccion"
              outlined
              label="Dirección (opcional)"
              autocomplete="street-address"
              :disable="loading"
            />
          </div>

          <div class="section-title">
            <span>2</span>
            <div>
              <strong>Cuenta del administrador</strong>
              <small>Será el acceso principal para gestionar el negocio</small>
            </div>
          </div>

          <div class="form-grid">
            <q-input
              v-model.trim="form.nombre"
              outlined
              label="Nombre completo *"
              autocomplete="name"
              :disable="loading"
              :rules="[(value) => !!value || 'Ingresa tu nombre completo']"
            />
            <q-input
              v-model.trim="form.correo"
              outlined
              type="email"
              label="Correo electrónico *"
              autocomplete="email"
              :disable="loading"
              :rules="[
                (value) => !!value || 'Ingresa tu correo electrónico',
                (value) => /.+@.+\..+/.test(value) || 'Ingresa un correo válido',
              ]"
            />
            <q-input
              v-model="form.password"
              outlined
              :type="showPassword ? 'text' : 'password'"
              label="Contraseña *"
              autocomplete="new-password"
              :disable="loading"
              hint="Utiliza al menos 8 caracteres"
              :rules="[
                (value) => !!value || 'Crea una contraseña',
                (value) => value.length >= 8 || 'Utiliza al menos 8 caracteres',
              ]"
            >
              <template #append>
                <q-btn
                  flat
                  round
                  dense
                  type="button"
                  :icon="showPassword ? 'visibility_off' : 'visibility'"
                  :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
            <q-input
              v-model="form.password_confirmation"
              outlined
              :type="showPassword ? 'text' : 'password'"
              label="Confirmar contraseña *"
              autocomplete="new-password"
              :disable="loading"
              :rules="[
                (value) => !!value || 'Confirma tu contraseña',
                (value) => value === form.password || 'Las contraseñas no coinciden',
              ]"
            />
          </div>

          <q-banner v-if="error" rounded class="register-error bg-red-1 text-negative">
            <template #avatar><q-icon name="error_outline" /></template>
            {{ error }}
          </q-banner>

          <div class="register-actions">
            <q-btn flat no-caps label="Volver" to="/bienvenida" :disable="loading" />
            <q-btn
              unelevated
              no-caps
              color="primary"
              label="Crear mi cuenta"
              type="submit"
              :loading="loading"
            />
          </div>
        </q-form>

        <p class="login-link">
          ¿Ya tienes una cuenta?
          <router-link to="/login">Inicia sesión</router-link>
        </p>
      </q-card-section>
    </q-card>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import CalculaLogo from 'src/components/CalculaLogo.vue'
import { auth } from 'src/services/auth'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const form = reactive({
  nombre_negocio: '',
  tipo_negocio: '',
  telefono: '',
  direccion: '',
  nombre: '',
  correo: '',
  password: '',
  password_confirmation: '',
})

function firstValidationError(exception) {
  const errors = exception.response?.data?.errors
  if (errors) return Object.values(errors).flat()[0]

  return exception.response?.data?.message
}

async function submit() {
  loading.value = true
  error.value = ''

  try {
    await auth.register(form)
    await router.push('/')
  } catch (exception) {
    error.value =
      firstValidationError(exception) ||
      'No se pudo crear la cuenta. Revisa los datos e inténtalo nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 94px 24px 46px;
  background:
    radial-gradient(circle at 5% 5%, rgba(183, 221, 224, 0.75), transparent 28%),
    linear-gradient(145deg, #f9fcfc, #edf5f5);
}

.register-brand {
  position: absolute;
  top: 24px;
  left: clamp(24px, 5vw, 72px);
  display: flex;
  align-items: center;
  gap: 11px;
  color: #354144;
  font-size: 20px;
  text-decoration: none;
}

.register-brand strong {
  font-weight: 800;
}

.register-card {
  width: min(100%, 860px);
  border: 1px solid rgba(95, 143, 148, 0.16);
  border-radius: 28px;
  box-shadow: 0 28px 80px rgba(50, 83, 86, 0.13);
}

.register-content {
  padding: clamp(30px, 5vw, 56px);
}

.register-kicker {
  margin-bottom: 9px;
  color: #5f8f94;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.register-content h1 {
  margin: 0;
  color: #354144;
  font-size: clamp(30px, 4vw, 42px);
  font-weight: 800;
  letter-spacing: -1.1px;
}

.register-content > p {
  margin: 9px 0 0;
  color: #7b8588;
}

.register-form {
  margin-top: 34px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 29px 0 18px;
}

.section-title:first-child {
  margin-top: 0;
}

.section-title > span {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #5f8f94;
  color: #fff;
  font-weight: 800;
}

.section-title div {
  display: grid;
  gap: 2px;
}

.section-title strong {
  color: #405053;
  font-size: 14px;
}

.section-title small {
  color: #879194;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px 16px;
}

.register-form :deep(.q-field__control) {
  border-radius: 14px;
}

.register-error {
  margin-top: 12px;
}

.register-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 26px;
}

.register-actions .q-btn {
  min-height: 48px;
  padding-inline: 22px;
  border-radius: 13px;
}

.login-link {
  margin-top: 25px !important;
  font-size: 13px;
  text-align: center;
}

.login-link a {
  color: #5f8f94;
  font-weight: 800;
  text-decoration: none;
}

@media (max-width: 650px) {
  .register-page {
    display: block;
    padding: 86px 12px 24px;
  }

  .register-brand {
    top: 18px;
    left: 18px;
  }

  .register-card {
    border-radius: 22px;
  }

  .register-content {
    padding: 28px 20px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .register-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .register-actions .q-btn:last-child {
    grid-row: 1;
  }
}
</style>
