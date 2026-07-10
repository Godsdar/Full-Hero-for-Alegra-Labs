<script setup lang="ts">
import { TresCanvas } from '@tresjs/core';
</script>

<template>
  <TresPerspectiveCamera :position="[7, 7, 7]" :look-at="[0, 0, 0]" />
  <TresCanvas clear-color="#fff" window-size>
    <TresPerspectiveCamera :position="[0, 2, 10]" />
    <TresMesh>
      <TresBoxGeometry />
      <TresMeshBasicMaterial :color="0x00ff00" />
    </TresMesh>
  </TresCanvas>
</template>
