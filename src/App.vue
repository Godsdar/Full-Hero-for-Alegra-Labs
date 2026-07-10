<script setup lang="ts">
// import { ref } from 'vue'
// import Preloader from './sections/Preloader.vue'
import HeroSection from './sections/HeroSection.vue';
import DentalSection from './sections/DentalSection.vue';
import SmokeParticles from './components/SmokeParticles.vue';
</script>

<template>
  <div
    class="min-h-screen bg-slate-950 text-slate-50 font-sans antialiased selection:bg-emerald-500 selection:text-slate-900"
  >
    <!-- Плавный переход для прелоадера -->
    <!-- <Transition
      leave-active-class="transition duration-1000 ease-in-out"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 pointer-events-none"
    >
      <Preloader v-if="isLoading" @loaded="handleLoaded" /> -->
    <!-- </Transition> -->

    <!-- Основной контент сайта -->
    <!-- Используем v-if или рендерим сразу под прелоадером, так как прелоадер закроет экран за счет fixed -->
    <main>
      <HeroSection />
      <!-- <SmokeParticles /> -->
      <DentalSection />
    </main>
  </div>
</template>

<style scoped></style>
