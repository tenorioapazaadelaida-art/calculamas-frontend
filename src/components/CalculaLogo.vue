<template>
  <span class="calcula-logo" :class="{ 'calcula-logo--inverse': inverse }" :style="{ width: `${size}px`, height: `${size}px` }" role="img" aria-label="Logo de Calcula+">
    <img src="/logo-comercial.png" alt="" width="1254" height="1254" />
  </span>
</template>
<script setup>
defineProps({ size: { type: Number, default: 42 }, inverse: { type: Boolean, default: false } })
</script>
<style scoped>
.calcula-logo { display: inline-flex; flex: 0 0 auto; overflow: hidden; border-radius: 28% 8% 28% 8%; }
.calcula-logo img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.13); }
</style>
