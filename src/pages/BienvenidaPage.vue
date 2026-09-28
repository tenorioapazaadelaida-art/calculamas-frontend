<template>
  <main class="landing-page">
    <header class="landing-header">
      <router-link class="landing-brand" to="/bienvenida" aria-label="Calcula+">
        <CalculaLogo :size="46" />
        <strong>Calcula+</strong>
      </router-link>

      <nav class="landing-actions" aria-label="Acceso al sistema">
        <q-btn class="functions-link" flat no-caps label="Cómo funciona" href="#proceso" />
        <q-btn flat no-caps label="Iniciar sesión" color="primary" to="/login" />
        <q-btn unelevated no-caps label="Crear cuenta" color="primary" to="/registro" />
      </nav>
    </header>

    <section class="hero-section">
      <div class="hero-copy">
        <div class="hero-kicker">BIENVENIDO A CALCULA+</div>
        <h1>
          Tu negocio, <strong>más claro cada día.</strong>
        </h1>
        <p>
          Ventas, compras, inventario y resultados en un solo lugar.
        </p>
        <div class="hero-actions">
          <q-btn unelevated no-caps color="primary" label="Crear cuenta" to="/registro" />
          <q-btn outline no-caps color="primary" label="Iniciar sesión" to="/login" />
        </div>
      </div>

      <div class="hero-preview" aria-label="Cómo ayuda Calcula+">
        <q-card class="preview-card" flat>
          <div class="preview-header">
            <span>GESTIÓN VISUAL CON CALCULA+</span>
            <q-icon name="verified" />
          </div>

          <div class="workflow-visual">
            <img
              :src="calculaFlujo"
              alt="Productos, inventario y resultados conectados en Calcula+"
            />
          </div>

          <div class="preview-footer">
            <q-icon name="admin_panel_settings" />
            Cada usuario accede según su rol
          </div>
        </q-card>
      </div>
    </section>

    <section id="proceso" class="workflow-section">
      <div class="workflow-copy">
        <span>ASÍ FUNCIONA</span>
        <h2>Todo conectado</h2>
        <p>Registra una vez. Consulta lo que necesitas cuando lo necesites.</p>
      </div>

      <ol class="workflow-list">
        <li v-for="(paso, indice) in pasos" :key="paso.titulo">
          <span>{{ indice + 1 }}</span>
          <div>
            <strong>{{ paso.titulo }}</strong>
            <p>{{ paso.descripcion }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="bottom-actions" aria-label="Acceder o registrarse en Calcula+">
      <h2>¿Listo para organizar tu negocio?</h2>
      <div>
        <q-btn unelevated no-caps color="primary" label="Crear cuenta" to="/registro" />
        <q-btn outline no-caps color="primary" label="Iniciar sesión" to="/login" />
      </div>
    </section>

    <footer class="landing-footer">
      <router-link class="landing-brand" to="/bienvenida" aria-label="Calcula+">
        <CalculaLogo :size="36" />
        <strong>Calcula+</strong>
      </router-link>
      <span>Gestión simple para emprendedores</span>
    </footer>
  </main>
</template>

<script setup>
import CalculaLogo from 'src/components/CalculaLogo.vue'
import calculaFlujo from 'src/assets/calcula-flujo.png'

const pasos = [
  {
    titulo: 'Configura tu negocio',
    descripcion: 'Agrega productos y organiza tu equipo.',
  },
  {
    titulo: 'Registra las operaciones',
    descripcion: 'Registra compras, ventas y gastos.',
  },
  {
    titulo: 'Consulta los resultados',
    descripcion: 'Consulta inventario, Kardex y utilidad.',
  },
]
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  overflow-x: hidden;
  background: #f8faf9;
}

.landing-header {
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(100% - 64px, 1440px);
  min-height: 84px;
  margin-inline: auto;
  border-bottom: 1px solid rgba(95, 143, 148, 0.14);
}

.functions-link {
  color: #667477;
}

.landing-brand {
  display: flex;
  align-items: center;
  gap: 11px;
  color: #354144;
  font-size: 21px;
  text-decoration: none;
}

.landing-brand strong {
  font-weight: 800;
}

.landing-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.landing-actions .q-btn:last-child {
  min-height: 44px;
  padding-inline: 22px;
  border-radius: 13px;
}

.hero-section {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(500px, 1.05fr);
  align-items: center;
  width: min(100% - 80px, 1360px);
  min-height: min(760px, calc(100vh - 84px));
  margin-inline: auto;
  padding: clamp(56px, 7vh, 88px) 0;
  gap: clamp(42px, 6vw, 90px);
}

.hero-copy {
  position: relative;
  z-index: 2;
}

.hero-kicker {
  margin-bottom: 22px;
  color: #5f8f94;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.7px;
}

.hero-copy h1 {
  max-width: 720px;
  margin: 0;
  color: #263437;
  font-size: clamp(42px, 4.3vw, 62px);
  font-weight: 600;
  line-height: 1.12;
  letter-spacing: -2.5px;
}

.hero-copy h1 strong {
  display: block;
  color: #4e797e;
  font-weight: 700;
}

.hero-copy > p {
  max-width: 630px;
  margin: 24px 0 0;
  color: #677578;
  font-size: clamp(16px, 1.2vw, 19px);
  line-height: 1.65;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}

.hero-actions .q-btn {
  min-height: 48px;
  padding-inline: 22px;
  border-radius: 13px;
}

.hero-preview {
  position: relative;
  display: grid;
  place-items: center;
  min-width: 0;
}

.preview-card {
  position: relative;
  width: min(100%, 650px);
  padding: clamp(25px, 2.6vw, 36px);
  border: 1px solid rgba(95, 143, 148, 0.17);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 16px 42px rgba(54, 89, 92, 0.08);
  transform: none;
}

.preview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 19px;
  border-bottom: 1px solid #e2e9ea;
}

.preview-header span {
  color: #7b888b;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}

.preview-header > .q-icon {
  color: #5f8f94;
  font-size: 31px;
}

.workflow-visual {
  display: grid;
  place-items: center;
  min-height: 300px;
  padding: 24px 0 14px;
}

.workflow-visual img {
  display: block;
  width: min(100%, 500px);
  height: auto;
  max-height: 300px;
  object-fit: contain;
}

.preview-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718083;
  font-size: 12px;
}

.preview-footer .q-icon {
  color: #5f8f94;
  font-size: 21px;
}

.workflow-section,
.bottom-actions,
.landing-footer {
  width: min(100% - 80px, 1120px);
  margin-inline: auto;
}

.bottom-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  padding: 76px 0;
}

.bottom-actions h2 {
  max-width: 600px;
  margin: 0;
  color: #29383b;
  font-size: clamp(28px, 3.4vw, 44px);
  line-height: 1.12;
  letter-spacing: -1.5px;
}

.bottom-actions > div {
  display: flex;
  flex: 0 0 auto;
  gap: 12px;
}

.bottom-actions .q-btn {
  min-height: 50px;
  padding-inline: 23px;
  border-radius: 13px;
}

.workflow-copy > span {
  color: #5f8f94;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.6px;
}

.workflow-copy h2 {
  margin: 13px 0 0;
  color: #29383b;
  font-size: clamp(32px, 4vw, 52px);
  line-height: 1.1;
  letter-spacing: -1.8px;
}

.workflow-copy > p {
  margin: 18px 0 0;
  color: #6d7b7e;
  font-size: 15px;
  line-height: 1.7;
}

.workflow-section {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(480px, 1.15fr);
  align-items: center;
  gap: clamp(50px, 8vw, 110px);
  padding: clamp(36px, 5vw, 64px);
  border-radius: 34px;
  color: #29383b;
  background: #eaf2f1;
  margin-top: 48px;
  scroll-margin-top: 30px;
}

.workflow-copy > span,
.workflow-copy h2,
.workflow-copy > p {
  color: inherit;
}

.workflow-copy > span,
.workflow-copy > p {
  color: #586d70;
}

.workflow-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.workflow-list li {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 15px;
  padding: 19px;
  border: 1px solid rgba(95, 143, 148, 0.16);
  border-radius: 17px;
  background: rgba(255, 255, 255, 0.78);
}

.workflow-list li > span {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  color: #fff;
  background: #5f8f94;
  font-weight: 800;
}

.workflow-list strong {
  font-size: 15px;
}

.workflow-list p {
  margin: 5px 0 0;
  color: #637477;
  font-size: 12px;
  line-height: 1.55;
}

.landing-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100px;
  border-top: 1px solid rgba(95, 143, 148, 0.17);
  color: #788689;
  font-size: 12px;
}

@media (max-width: 1100px) {
  .hero-section {
    grid-template-columns: 1fr;
    padding: 60px 0 80px;
  }

  .hero-copy {
    text-align: center;
  }

  .hero-copy h1,
  .hero-copy > p {
    margin-inline: auto;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-preview {
    width: min(100%, 700px);
    margin-inline: auto;
  }

  .workflow-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 650px) {
  .landing-header,
  .hero-section {
    width: min(100% - 28px, 1440px);
  }

  .landing-header {
    min-height: 72px;
  }

  .landing-brand {
    font-size: 17px;
  }

  .landing-brand :deep(.calcula-logo) {
    width: 38px !important;
    height: 38px !important;
  }

  .landing-actions .q-btn:first-child {
    display: none;
  }

  .landing-actions .q-btn:nth-child(2) {
    display: none;
  }

  .landing-actions .q-btn:last-child {
    min-height: 40px;
    padding-inline: 15px;
  }

  .hero-section {
    min-height: auto;
    padding: 52px 0 64px;
  }

  .hero-kicker {
    font-size: 9px;
  }

  .hero-copy h1 {
    font-size: clamp(39px, 12vw, 53px);
    letter-spacing: -2.2px;
  }

  .hero-copy > p {
    font-size: 16px;
  }

  .hero-actions {
    display: grid;
  }

  .preview-card {
    padding: 20px;
    border-radius: 23px;
    transform: none;
  }

  .workflow-visual {
    min-height: 230px;
    padding-top: 18px;
  }

  .workflow-visual img {
    max-height: 230px;
  }

  .workflow-section,
  .bottom-actions,
  .landing-footer {
    width: min(100% - 28px, 1220px);
  }

  .workflow-section {
    padding: 32px 22px;
    border-radius: 25px;
  }

  .bottom-actions {
    display: grid;
    padding: 76px 0;
  }

  .bottom-actions > div {
    display: grid;
  }

  .landing-footer {
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
  }
}
</style>
