import { ref, computed, reactive, watchEffect, asyncComputed } from './src/reactivity'
import { c, q } from './src/waff-query'

import './style.css'

const counter = ref(1)
const res = reactive({ counter: 1 })

const app = q('#app')
app.append(...[
  c(['reactive counter: ', () => res.counter]),
  c('button', { onclick: () => res.counter++ }, ['add']),
  c('button', { onclick: () => res.counter-- }, ['remove']),
  c('br'),
  c('br'),
])

app.append(...[
  c(['ref counter: ', counter]),
  c('button', { onclick: () => counter.value++ }, ['add']),
  c('button', { onclick: () => counter.value-- }, ['remove']),
  c('br'),
  c('br'),
])

const test = computed(() => counter.value * res.counter)
app.append(...[
  c(['computed: ', () => res.counter, ' * ', counter, ' = ', test]),
])

const test2 = computed(() => test.value * 10)
app.append(...[
  c('br'),
  c('br'),
  c(['nested computed: ', test2]),
])

watchEffect(() => {
  if (test.value > 60) {
    console.log('oops...')
  }
})

watchEffect(() => {
  if (test2.value > 600) {
    console.log('yay...')
  }
})

watchEffect(() => {
  if (test.value > 3) {
    console.log('double oops...')
  }

  if (test2.value > 30) {
    console.log('double yay...')
  }
})

const test3 = asyncComputed(async () => new Promise(resolve => {
  setTimeout(() => resolve('yaaay ' + Math.random()), 3000)
}), '__DEFAULT__')

app.append(...[
  c('br'),
  c('br'),
  c(['async computed: ', test3, ' ', test3.isLoading]),
  c('button', { onclick: test3.update }, ['update'])
])
