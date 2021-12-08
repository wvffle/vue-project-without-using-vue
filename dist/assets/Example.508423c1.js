var e=`<template>
  <div class="flex flex-col items-center">
    <div class="pb-4">counter: {{ counter }}</div>
    <div v-if="counter < 0" class="text-red-400">negative</div>
    <div v-else-if="counter === 0">zero</div>
    <div v-else-if="counter === 1">one</div>
    <div v-else class="text-green-400">positive</div>

    <div v-for="i in arr" class="flex items-center">
      <div class="text-gray-400 text-sm font-mono mr-2">{{ i.date }}</div>
      <div @click="counter = i.value" class="cursor-pointer hover:text-blue-300">value: {{ i.value }}</div>
    </div>

    <div class="flex pt-4">
      <div @click="increment" class="px-4 py-2 rounded bg-blue-400 text-white cursor-pointer hover:bg-blue-300 select-none mr-2">add</div>
      <div @click="counter--" class="px-4 py-2 rounded bg-blue-400 text-white cursor-pointer hover:bg-blue-300 select-none">remove</div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watchEffect } from '../reactivity'

const counter = ref(0)
const increment = () => {
  counter.value++
}

const arr = reactive([])

watchEffect(() => {
  counter.value

  arr.push({
    date: new Date().toISOString(),
    value: counter.value
  })
})
<\/script>`;export{e as default};
