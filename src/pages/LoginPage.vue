<template>
  <main class="login-page">
    <section class="login-visual gt-sm" aria-label="Presentación de Calcula+">
      <div class="visual-orb orb-one" aria-hidden="true" />
      <div class="visual-orb orb-two" aria-hidden="true" />

      <div class="visual-content">
        <div class="login-brand">
          <CalculaLogo :size="58" />
          <span class="brand-word">Calcula+</span>
        </div>

        <div class="visual-label">GESTIÓN SIMPLE PARA TU NEGOCIO</div>
        <h1 class="visual-copy">
          Tu negocio, claro
          <strong>y bajo control.</strong>
        </h1>
        <p class="visual-sub">
          Administra productos, compras, ventas e inventario desde un solo lugar.
        </p>

        <div class="feature-list" aria-label="Beneficios del sistema">
          <div>
            <q-icon name="task_alt" />
            <span>Información ordenada</span>
          </div>
          <div>
            <q-icon name="shield" />
            <span>Acceso seguro</span>
          </div>
          <div>
            <q-icon name="insights" />
            <span>Control por negocio</span>
          </div>
        </div>
      </div>
    </section>

    <section class="login-form-wrap" aria-label="Inicio de sesión">
      <router-link class="back-home" to="/bienvenida">
        <q-icon name="arrow_back" />
        Volver al inicio
      </router-link>
      <q-card class="login-card" flat>
        <q-card-section class="login-card__content">
          <div class="mobile-brand lt-md">
            <CalculaLogo :size="50" />
            <span class="brand-word">Calcula+</span>
          </div>

          <div class="welcome-kicker">BIENVENIDO A CALCULA+</div>
          <h2 class="welcome">Inicia sesión</h2>
          <p class="welcome-copy">Ingresa los datos con los que registraste tu negocio.</p>

          <div class="access-guide" aria-label="Datos necesarios para iniciar sesión">
            <q-icon name="info_outline" />
            <span>Necesitas el nombre del negocio, tu correo y contraseña.</span>
          </div>

          <q-form class="login-form" autocomplete="on" @submit="submit">
            <q-input
              v-model.trim="form.nombre_negocio"
              outlined
              name="organization"
              label="Nombre del negocio"
              hint="Escríbelo tal como fue registrado"
              autocomplete="organization"
              lazy-rules
              :disable="loading"
              :rules="[(value) => !!value || 'Ingresa el nombre del negocio']"
            >
              <template #prepend>
                <q-icon name="storefront" />
              </template>
            </q-input>

            <q-input
              v-model.trim="form.correo"
              outlined
              name="email"
              type="email"
              label="Correo electrónico"
              autocomplete="email"
              inputmode="email"
              lazy-rules
              :disable="loading"
              :rules="[
                (value) => !!value || 'Ingresa tu correo electrónico',
                (value) => /.+@.+\..+/.test(value) || 'Ingresa un correo válido',
              ]"
            >
              <template #prepend>
                <q-icon name="alternate_email" />
              </template>
            </q-input>

            <q-input
              v-model="form.password"
              outlined
              name="password"
              :type="showPassword ? 'text' : 'password'"
              label="Contraseña"
              autocomplete="current-password"
              lazy-rules
              :disable="loading"
              :rules="[(value) => !!value || 'Ingresa tu contraseña']"
            >
              <template #prepend>
                <q-icon name="lock_outline" />
              </template>
              <template #append>
                <q-btn
                  flat
                  round
                  dense
                  type="button"
                  :icon="showPassword ? 'visibility_off' : 'visibility'"
                  :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  @click="showPassword = !showPassword"
                >
                  <q-tooltip>
                    {{ showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña' }}
                  </q-tooltip>
                </q-btn>
              </template>
            </q-input>

            <q-checkbox
              v-model="recordarAcceso"
              class="remember-access"
              label="Recordar mis datos"
              color="primary"
              :disable="loading"
            >
              <q-tooltip>
                Calcula+ recordará tu correo y el navegador podrá guardar tu contraseña de forma
                segura.
              </q-tooltip>
            </q-checkbox>

            <q-banner v-if="error" rounded class="login-error bg-red-1 text-negative">
              <template #avatar>
                <q-icon name="error_outline" />
              </template>
              {{ error }}
            </q-banner>

            <q-btn
              class="full-width login-btn"
              color="primary"
              label="Entrar a Calcula+"
              type="submit"
              unelevated
              no-caps
              :loading="loading"
            />
          </q-form>

          <p class="create-account">
            ¿Tu negocio aún no está registrado?
            <router-link to="/registro">Crear una cuenta</router-link>
          </p>
        </q-card-section>
      </q-card>

      <p class="login-footer">Calcula+ · Gestión simple para emprendedores</p>
    </section>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CalculaLogo from 'src/components/CalculaLogo.vue'
import { auth } from 'src/services/auth'

const router = useRouter()
const route = useRoute()
const form = reactive({
  nombre_negocio: '',
  correo: '',
  password: '',
})
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const recordarAcceso = ref(false)
const NEGOCIO_RECORDADO = 'negocio_recordado'
const CORREO_RECORDADO = 'correo_recordado'

onMounted(() => {
  const negocioRecordado = localStorage.getItem(NEGOCIO_RECORDADO)
  const correoRecordado = localStorage.getItem(CORREO_RECORDADO)

  if (negocioRecordado) {
    form.nombre_negocio = negocioRecordado
  }

  if (correoRecordado) {
    form.correo = correoRecordado
  }

  recordarAcceso.value = Boolean(negocioRecordado || correoRecordado)

  if (route.query.acceso === 'expirado') {
    error.value = 'Tu sesión ha vencido. Inicia sesión nuevamente para continuar.'
  } else if (route.query.acceso === 'conexion') {
    error.value = 'No se pudo verificar tu sesión. Inicia sesión nuevamente.'
  }
})

async function submit() {
  loading.value = true
  error.value = ''

  try {
    await auth.login(form)

    if (recordarAcceso.value) {
      localStorage.setItem(NEGOCIO_RECORDADO, form.nombre_negocio)
      localStorage.setItem(CORREO_RECORDADO, form.correo)
      await guardarCredencialesEnNavegador()
    } else {
      localStorage.removeItem(NEGOCIO_RECORDADO)
      localStorage.removeItem(CORREO_RECORDADO)
    }

    await router.push('/')
  } catch (exception) {
    error.value =
      exception.response?.data?.message ||
      'No se pudo iniciar sesión. Verifica tus datos e inténtalo nuevamente.'
  } finally {
    loading.value = false
  }
}

async function guardarCredencialesEnNavegador() {
  if (!window.PasswordCredential || !navigator.credentials?.store) {
    return
  }

  try {
    const credencial = new window.PasswordCredential({
      id: form.correo,
      name: form.correo,
      password: form.password,
    })

    await navigator.credentials.store(credencial)
  } catch {
    // Algunos navegadores administran el guardado mediante su aviso nativo.
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(520px, 1.05fr) minmax(470px, 0.95fr);
  background: #f5f8f7;
}

.login-visual {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  align-items: center;
  color: #fff;
  padding: clamp(52px, 7vw, 108px);
  background: linear-gradient(145deg, #315f64 0%, #51858a 58%, #6b9da1 100%);
}

.login-visual::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0.2;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(135deg, #000 0%, transparent 70%);
}

.visual-content {
  position: relative;
  z-index: 2;
  width: min(100%, 600px);
  margin-inline: auto;
}

.login-brand,
.mobile-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  font-weight: 800;
}

.login-brand {
  margin-bottom: clamp(72px, 11vh, 118px);
  font-size: 27px;
}

.visual-label,
.welcome-kicker {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.7px;
}

.visual-label {
  margin-bottom: 18px;
  color: #d8f0f1;
}

.visual-copy {
  max-width: 570px;
  margin: 0;
  font-size: clamp(44px, 4.5vw, 68px);
  font-weight: 500;
  line-height: 1.08;
  letter-spacing: -2.5px;
}

.visual-copy strong {
  display: block;
  font-weight: 800;
}

.visual-sub {
  max-width: 510px;
  margin: 26px 0 0;
  color: rgba(255, 255, 255, 0.86);
  font-size: 16px;
  line-height: 1.75;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 28px;
  margin-top: 44px;
}

.feature-list > div {
  display: flex;
  align-items: center;
  gap: 7px;
  color: rgba(255, 255, 255, 0.92);
  font-size: 13px;
  font-weight: 700;
  padding: 9px 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.feature-list .q-icon {
  color: #d8f0f1;
  font-size: 18px;
}

.visual-orb {
  position: absolute;
  z-index: -1;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.055);
}

.orb-one {
  width: 500px;
  height: 500px;
  top: -180px;
  right: -190px;
}

.orb-two {
  width: 300px;
  height: 300px;
  bottom: -170px;
  left: -120px;
}

.login-form-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: clamp(36px, 6vw, 88px);
  background:
    radial-gradient(circle at 95% 5%, rgba(201, 229, 229, 0.58), transparent 32%),
    #f5f8f7;
}

.back-home {
  position: absolute;
  top: 28px;
  left: clamp(28px, 4vw, 58px);
  display: flex;
  align-items: center;
  gap: 7px;
  color: #657477;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.login-card {
  width: min(100%, 480px);
  border: 1px solid rgba(95, 143, 148, 0.16);
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 24px 64px rgba(50, 83, 86, 0.13);
}

.login-card__content {
  padding: clamp(38px, 4.5vw, 58px);
}

.welcome-kicker {
  margin-bottom: 12px;
  color: #5f8f94;
}

.welcome {
  margin: 0;
  color: #354144;
  font-size: clamp(32px, 3vw, 42px);
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: -1.2px;
}

.welcome-copy {
  margin: 10px 0 0;
  color: #7b8588;
  font-size: 14px;
  line-height: 1.6;
}

.access-guide {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 22px;
  padding: 12px 14px;
  border-radius: 12px;
  color: #52696c;
  background: #edf5f4;
  font-size: 12px;
  line-height: 1.45;
}

.access-guide .q-icon {
  flex: 0 0 auto;
  margin-top: 1px;
  color: #5f8f94;
  font-size: 18px;
}

.login-form {
  display: grid;
  gap: 5px;
  margin-top: 24px;
}

.login-form :deep(.q-field__control) {
  min-height: 58px;
  border-radius: 15px;
  background: #fff;
}

.login-form :deep(.q-field--outlined .q-field__control::before) {
  border-color: #ced8d9;
}

.login-form :deep(.q-field--outlined.q-field--focused .q-field__control::after) {
  border-width: 1.5px;
}

.login-form :deep(.q-field__prepend) {
  color: #718084;
}

.login-error {
  margin: 2px 0 12px;
  font-size: 13px;
}

.login-btn {
  min-height: 56px;
  margin-top: 5px;
  border-radius: 15px;
  font-size: 16px;
  box-shadow: 0 13px 30px rgba(95, 143, 148, 0.26);
}

.create-account {
  margin: 24px 0 0;
  color: #7f898c;
  font-size: 12px;
  text-align: center;
}

.create-account a {
  color: #5f8f94;
  font-weight: 800;
  text-decoration: none;
}

.login-footer {
  margin: 22px 0 0;
  color: #839093;
  font-size: 11px;
  text-align: center;
}

.mobile-brand {
  margin-bottom: 42px;
  color: #354144;
  font-size: 20px;
}

@media (max-width: 1023px) {
  .login-page {
    display: block;
  }

  .login-form-wrap {
    min-height: 100vh;
    padding: 32px;
  }

  .login-card {
    max-width: 520px;
  }
}

@media (max-width: 600px) {
  .login-form-wrap {
    justify-content: flex-start;
    padding: 66px 14px 18px;
  }

  .back-home {
    top: 21px;
    left: 20px;
  }

  .login-card {
    margin-top: max(10px, env(safe-area-inset-top));
    border-radius: 24px;
  }

  .login-card__content {
    padding: 30px 24px;
  }

  .mobile-brand {
    margin-bottom: 34px;
  }

  .welcome {
    font-size: 30px;
  }

  .login-form {
    margin-top: 28px;
  }
}

@media (max-width: 380px) {
  .login-card__content {
    padding: 26px 18px;
  }

  .welcome {
    font-size: 27px;
  }
}
</style>
