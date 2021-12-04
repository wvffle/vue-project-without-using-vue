<template>
  <div class="flex flex-col items-center">
    <div class="pb-4">counter: {{ counter }}</div>
    <div class="flex">
      <div @click="increment" class="px-4 py-2 rounded bg-blue-400 text-white cursor-pointer hover:bg-blue-300 select-none mr-2">add</div>
      <div @click="counter.value--" class="px-4 py-2 rounded bg-blue-400 text-white cursor-pointer hover:bg-blue-300 select-none">remove</div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from '../reactivity'

  const counter = ref(0)
  const increment = () => counter.value++
</script>