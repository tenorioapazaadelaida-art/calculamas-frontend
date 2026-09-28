<template>
  <span
    v-if="nombre === 'phone_case'"
    class="categoria-icono"
    :style="{ width: size, height: size }"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="2.5" width="14" height="19" rx="3.2" />
      <rect x="7.5" y="5" width="5.2" height="5.2" rx="1.4" />
      <circle cx="9.2" cy="6.7" r="0.75" />
      <circle cx="11.1" cy="8.6" r="0.75" />
      <path d="M9.5 19h5" />
    </svg>
  </span>
  <q-icon v-else :name="nombre || 'category'" :size="size" />
</template>

<script setup>
defineProps({
  nombre: { type: String, default: 'category' },
  size: { type: String, default: '24px' },
})
</script>

<style scoped>
.categoria-icono {
  display: inline-flex;
  color: currentColor;
  vertical-align: middle;
}
.categoria-icono svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.categoria-icono circle {
  fill: currentColor;
  stroke: none;
}
</style>
