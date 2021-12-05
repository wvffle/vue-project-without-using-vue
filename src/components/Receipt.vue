<template>
  <div class="grid grid-cols-2">
    <div>
      <div class="max-w-2xl px-4 mx-auto">
        <div class="text-3xl text-center pb-8">
          Paragon {{ today }}/001
        </div>

        <div class="rounded-md overflow-hidden shadow">
          <table class="w-full text-left select-none">
            <thead>
            <tr class="uppercase bg-gray-100 text-gray-400 font-semibold">
              <td v-if="items.length > 1" class="p-4 border-b"></td>
              <td class="p-4 border-b">LP</td>
              <td class="p-4 border-b">Nazwa</td>
              <td class="p-4 border-b">Ilość</td>
              <td class="p-4 border-b text-right">Cena</td>
              <td class="p-4 border-b text-right">Suma</td>
              <td class="p-4 border-b"></td>
            </tr>
            </thead>
            <tbody class="divide-y relative">
            <tr v-if="items.length === 0">
              <td class="p-4 text-center text-gray-400" colspan="6">Brak produktów na paragonie</td>
            </tr>
            <tr v-else v-for="(item, i) in items" class="odd:bg-gray-50">
              <td v-if="items.length > 1" class="p-4 w-5">
                <div class="flex flex-col">
                  <div @click="up(i)" class="cursor-pointer hover:text-blue-400" :class="{ 'pointer-events-none text-gray-400': i === 0 }">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div @click="down(i)" class="cursor-pointer hover:text-blue-400" :class="{ 'pointer-events-none text-gray-400': i === items.length - 1 }">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </div>

                </div>
              </td>
              <td class="p-4">{{ i + 1 }}</td>
              <td class="p-4">{{ item.name }}</td>
              <td class="p-4">{{ item.quantity }}</td>
              <td class="p-4 text-right">{{ item.price.toFixed(2) }} zł</td>
              <td class="p-4 text-right">{{ (item.quantity * item.price).toFixed(2) }} zł</td>
              <td class="p-4 w-5">
                <div @click="active = item" class="rounded-full cursor-pointer hover:bg-gray-200 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </td>
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
              <td></td>
            </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <div>
      <div v-if="active" class="max-w-sm px-4 mx-auto">
        <div class="text-3xl text-center pb-8 flex justify-center items-center relative">
          <button @click="active = null" class="hover:text-blue-400 absolute left-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          Edytuj produkt
        </div>
        <label class="pb-4 block">
          <div class="text-gray-500 uppercase text-xs pb-2">Nazwa</div>
          <input type="text" :value="edit.name" class="border-1 px-2 py-1 rounded-full text-lg block w-full outline-none">
        </label>
        <label class="pb-4 block">
          <div class="text-gray-500 uppercase text-xs pb-2">Cena</div>
          <input type="number" step="0.01" :value="edit.price" class="border-1 px-2 py-1 rounded-full text-lg block w-full outline-none">
        </label>
        <label class="pb-4 block">
          <div class="text-gray-500 uppercase text-xs pb-2">Ilość</div>
          <input type="number" :value="edit.quantity" class="border-1 px-2 py-1 rounded-full text-lg block w-full outline-none">
        </label>

        <div class="flex">
          <button :class="{ 'pointer-events-none opacity-30': !isEditValid }" @click="save" class="bg-blue-400 hover:bg-blue-300 text-white uppercase text-lg block rounded shadow p-2 w-full mx-2">
            Zapisz
          </button>
          <button @click="remove" class="bg-red-400 hover:bg-red-300 text-white uppercase text-lg block rounded shadow p-2 w-12 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <div v-else class="max-w-sm px-4 mx-auto">
        <div class="text-3xl text-center pb-8">
          Dodaj produkt
        </div>
        <label class="pb-4 block">
          <div class="text-gray-500 uppercase text-xs pb-2">Nazwa</div>
          <input type="text" :value="product.name" class="border-1 px-2 py-1 rounded-full text-lg block w-full outline-none">
        </label>
        <label class="pb-4 block">
          <div class="text-gray-500 uppercase text-xs pb-2">Cena</div>
          <input type="number" step="0.01" :value="product.price" class="border-1 px-2 py-1 rounded-full text-lg block w-full outline-none">
        </label>
        <label class="pb-4 block">
          <div class="text-gray-500 uppercase text-xs pb-2">Ilość</div>
          <input type="number" :value="product.quantity" class="border-1 px-2 py-1 rounded-full text-lg block w-full outline-none">
        </label>

        <button @click="add" :class="{ 'pointer-events-none opacity-30': !isValid }" class="bg-blue-400 hover:bg-blue-300 text-white uppercase text-lg block rounded shadow p-2 w-full outline-none">
          Dodaj
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, toRaw, watchEffect } from '../reactivity'

const today = new Date().toISOString().split('T')[0]
const items = reactive(JSON.parse(localStorage.list ?? '[]'))
const sum = computed(() => items.reduce((a, b) => a + b.price * b.quantity, 0))

/**
 * Saving elements
 */
watchEffect(() => {
  localStorage.list = JSON.stringify([...items].map(item => ({ ...item })))
})

/**
 * Adding elements
 */
const product = reactive({
  name: '',
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

/**
 * Editing elements
 */
const active = ref(null)
const edit = reactive({ name: '', price: '', quantity: 1 })

watchEffect(() => {
  if (active.value !== null) {
    edit.name = active.value.name
    edit.price = active.value.price
    edit.quantity = active.value.quantity
  }
})

const save = () => {
  active.value.name = edit.name
  active.value.price = +edit.price
  active.value.quantity = +edit.quantity

  edit.name = ''
  edit.price = ''
  edit.quantity = 1

  active.value = null
}

/**
 * Removing elements
 */
const remove = () => {
  if (confirm('Czy na pewno chcesz usunąć?')) {
    const item = active.value
    save()

    items.splice(items.indexOf(item), 1)
  }
}

/**
 * Moving elements
 */
const up = i => {
  active.value = null
  const item = items[i]
  items[i] = items[i - 1]
  items[i - 1] = item
}

const down = i => {
  active.value = null
  const item = items[i]
  items[i] = items[i + 1]
  items[i + 1] = item
}

/**
 * Validate
 */
const validate = (reactive, key) => {
  switch (key) {
    case 'price':
      return !isNaN(+reactive[key]) && reactive[key] !== ''

    case 'quantity':
      return !isNaN(+reactive[key]) && +(+reactive[key]).toFixed(0) === +reactive[key] && reactive[key] !== ''

    case 'name':
      return reactive[key].trim() !== ''
  }

  return true
}

const isEditValid = computed(() => Object.keys(edit).reduce((isValid, key) => isValid && validate(edit, key) , true))
const isValid = computed(() => Object.keys(product).reduce((isValid, key) => isValid && validate(product, key) , true))
</script>