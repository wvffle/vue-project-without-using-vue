<template>
  <div class="grid grid-cols-2">
    <div>
      <div class="max-w-2xl px-4 mx-auto">
        <div class="text-3xl text-center pb-8">
          Paragon {{ today }}/001
        </div>

        <div class="rounded-md overflow-hidden shadow">
          <table class="w-full text-left">
            <thead>
            <tr class="uppercase bg-gray-100 text-gray-400 font-semibold">
              <td v-if="items.length > 1" class="p-4 border-b"></td>
              <td class="p-4 border-b">LP</td>
              <td class="p-4 border-b">Nazwa</td>
              <td class="p-4 border-b">Ilość</td>
              <td class="p-4 border-b text-right">Cena</td>
              <td class="p-4 border-b text-right">Suma</td>
            </tr>
            </thead>
            <tbody>
            <tr v-if="items.length === 0">
              <td class="p-4 text-center text-gray-400" colspan="6">Brak produktów na paragonie</td>
            </tr>
            <tr v-else v-for="(item, i) in items" class="divide-y odd:bg-gray-50">
              <td v-if="items.length > 1" class="p-4 w-5" style="cursor: grab">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 13a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                </svg>
              </td>
              <td  class="p-4">{{ i + 1 }}</td>
              <td class="p-4">{{ item.name }}</td>
              <td class="p-4">{{ item.quantity }}</td>
              <td class="p-4 text-right">{{ item.price.toFixed(2) }} zł</td>
              <td class="p-4 text-right">{{ (item.quantity * item.price).toFixed(2) }} zł</td>
            </tr>
            </tbody>
            <tfoot>
            <tr class="bg-gray-100 text-gray-400 font-semibold">
              <td v-if="items.length > 1"></td>
              <td colspan="4" class="p-4 border-t text-right uppercase">Razem</td>
              <td class="px-4 border-t text-right">
                <div class="flex">
                  <div class="bg-green-400 text-white rounded py-1 px-2 text-lg ml-auto">
                    {{ sum.toFixed(2) }} zł
                  </div>
                </div>
              </td>
            </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <div>
      <div class="max-w-sm px-4 mx-auto">
        <div class="text-3xl text-center pb-8">
          Dodaj produkt
        </div>
        <label class="pb-4 block">
          <div class="text-gray-500 uppercase text-xs pb-2">Nazwa</div>
          <input type="text" :value="product.name" class="border-1 px-2 py-1 rounded-full text-lg block w-full">
        </label>
        <label class="pb-4 block">
          <div class="text-gray-500 uppercase text-xs pb-2">Cena</div>
          <input type="number" step="0.01" :value="product.price" class="border-1 px-2 py-1 rounded-full text-lg block w-full">
        </label>
        <label class="pb-4 block">
          <div class="text-gray-500 uppercase text-xs pb-2">Ilość</div>
          <input type="number" :value="product.quantity" class="border-1 px-2 py-1 rounded-full text-lg block w-full">
        </label>

        <button @click="add" class="bg-blue-400 hover:bg-blue-300 text-white uppercase text-lg block rounded shadow p-2 w-full">
          Dodaj
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, toRaw, watchEffect } from '../reactivity'

const today = new Date().toISOString().split('T')[0]

const items = reactive(JSON.parse(localStorage.list ?? '[]'))
watchEffect(() => {
  localStorage.list = JSON.stringify([...items].map(item => ({ ...item })))
})

const sum = computed(() => items.reduce((a, b) => a + b.price * b.quantity, 0))

const product = reactive({
  name: 'aasd',
  quantity: 1,
  price: 6.99
})

const add = () => {
  const item = items.find(item => {
    return item.name === product.name && item.price === product.price
  })

  if (item) {
    item.quantity += product.quantity
  } else {
    items.push({ ...toRaw(product) })
  }

  product.name = ''
  product.price = 6.99
  product.quantity = 1
}

</script>