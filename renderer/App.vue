<script setup lang="ts">
import { NConfigProvider } from "naive-ui";
import TitleBar from "./components/TitleBar.vue";
import DragRegion from "./components/DragRegion.vue";

import { onMounted, nextTick } from "vue";

onMounted(async () => {
  console.log("App mounted");
  await nextTick();
  throw new Error("Test error on mount");
});
</script>

<template>
  <n-config-provider class="h-[100vh] w-[100vw] flex">
    <aside class="h-full flex flex-shrink-0 flex-col bg-amber-600 w-[200px]">
      Aside
    </aside>
    <div class="flex-auto">
      <title-bar>
        <drag-region class="w-full"> </drag-region>
      </title-bar>
      main
    </div>
  </n-config-provider>
</template>

<style scoped></style>
