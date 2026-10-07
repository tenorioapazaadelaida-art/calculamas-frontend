<template>
  <q-btn flat no-caps icon="apps" label="Áreas" aria-label="Abrir selector de áreas">
    <q-menu anchor="bottom left" self="top left">
      <q-list style="width: 320px; max-width: 90vw" padding>
        <q-item-label header>Selecciona un área</q-item-label>
        <q-item v-for="area in areas" :key="area.nombre" clickable :href="area.url">
          <q-item-section avatar><q-icon :name="area.icono" color="primary" /></q-item-section>
          <q-item-section>
            <q-item-label>{{ area.nombre }}</q-item-label>
            <q-item-label caption>{{ area.descripcion }}</q-item-label>
          </q-item-section>
          <q-item-section side><q-icon name="arrow_forward" /></q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item clickable :href="bienvenida">
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>Bienvenida de Calcula+</q-item-section>
        </q-item>
        <q-item-label caption class="q-px-md q-pb-sm">Cada área tiene su propio acceso.</q-item-label>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup>
const bienvenida = import.meta.env.VITE_PORTAL_URL || 'http://localhost/calculamas/bienvenida/'
const areas = [
  { nombre: 'Comercial', descripcion: 'Compras, ventas e inventario', icono: 'storefront', url: import.meta.env.VITE_COMERCIAL_URL || 'http://localhost:9000/#/login' },
  { nombre: 'Producción', descripcion: 'Insumos, recetas y costos', icono: 'precision_manufacturing', url: import.meta.env.VITE_PRODUCCION_URL || 'http://localhost:9002/#/login' },
]
</script>
