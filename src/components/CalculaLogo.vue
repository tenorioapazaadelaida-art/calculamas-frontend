<template>
  <span
    class="calcula-logo"
    :class="{ 'calcula-logo--inverse': inverse }"
    :style="{ width: `${size}px`, height: `${size}px` }"
    role="img"
    aria-label="Logo de Calcula+"
  >
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="calcula-gradient" x1="8" y1="56" x2="55" y2="7">
          <stop offset="0" stop-color="#5F8F94" />
          <stop offset="1" stop-color="#A9D3D6" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" class="logo-base" />
      <path d="M43 12a22 22 0 1 0 7 35" class="logo-ring" />
      <path d="M13 34 23 44 31 34 37 40 51 21" class="logo-pulse" />
      <circle cx="51" cy="21" r="3" class="logo-dot" />
      <path d="M39 48h13M42 43h10M46 38h6" class="logo-bars" />
    </svg>
  </span>
</template>

<script setup>
defineProps({
  size: { type: Number, default: 42 },
  inverse: { type: Boolean, default: false },
})
</script>

<style scoped>
.calcula-logo {
  display: inline-flex;
  flex: 0 0 auto;
  filter: drop-shadow(0 9px 16px rgba(51, 38, 153, 0.2));
}
.calcula-logo svg {
  width: 100%;
  height: 100%;
}
.logo-base {
  fill: #fff;
}
.logo-ring {
  fill: none;
  stroke: #596568;
  stroke-width: 5.5;
  stroke-linecap: round;
}
.logo-pulse,
.logo-bars {
  fill: none;
  stroke: url(#calcula-gradient);
  stroke-width: 4.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.logo-bars {
  stroke-width: 3;
  opacity: 0.9;
}
.logo-dot {
  fill: #5f8f94;
}
.calcula-logo--inverse .logo-base {
  fill: url(#calcula-gradient);
}
.calcula-logo--inverse .logo-dot {
  fill: #fff;
}
.calcula-logo--inverse .logo-ring,
.calcula-logo--inverse .logo-pulse,
.calcula-logo--inverse .logo-bars {
  stroke: #fff;
}
.calcula-logo--inverse .logo-dot {
  fill: #fff;
}
</style>
