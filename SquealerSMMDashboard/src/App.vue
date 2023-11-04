<script setup lang="ts">
import SMM_main from './components/SMM_main.vue'

import { onBeforeMount, ref } from 'vue'
import { useFetch, idFetch } from './components/fetch.ts'


const userid = ref(''); // '651fde888a066ec0334dabb3' 
// const url = ref("/api/searchUserById?id=" + userid.value)
const data = ref<any>(null); // specificare il tipo di dato
const error = ref<Error | null>(null); // specificare il tipo di errore
const data2 = ref<any>(null);


async function getUserData() {
  await fetch("/Home/api/user")
    .then((res) => res.json())
    .then((json) => {
      userid.value = json.id;
      console.log(userid.value)
    })
    .catch((err) => {
      console.log(err)
      userid.value = err;
    })
}

async function fetchUser() {
  await fetch("/api/searchUserById?id=" + userid.value)
    .then((res) => res.json())// parsing json
    .then((json) => {     // f(json){data.value = json }
      data.value = json;
      console.log(json)
    })
    .catch((err) => {
      error.value = err;
      console.log(err)
    })
}


async function async() {
  await getUserData()
  await fetchUser()

  data2.value = useFetch('/api/searchUserById?id=' + idFetch('/Home/api/user'))

}

onBeforeMount(() => {
  async()
})




</script>

<template >
  <header class="navbar navbar-expand navbar-dark flex-column flex-md-row bd-navbar">
    <a class="btn btn-bd-download d-none d-lg-inline-block mb-3 mb-md-0 ml-md-3" href="/">Home</a>
  </header>
  <div class="container-fluid ">
    <div class="row flex-xl-nowrap">
      <div class="col-12 col-md-3 col-xl-2 bd-sidebar">
        <p>colonnna sinistra</p>
        <p>{{ data.nome }}</p>
      </div>
      <main
        class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content bg-secondary flex flex-col justify-center items-center text-center text-w undefined text-slate-50"
        role="main">
        <h1 class="bd-title" id="content">Dashboard</h1>
        <div>
          <p>prima di SMM</p>
          <SMM_main data: data />
          <p>dopo di SMM</p>
        </div>
      </main>
      <div class="d-none d-xl-block col-xl-2 bd-toc">
        <p>colonnna destra</p>
      </div>
    </div>
  </div>
  <footer class="bd-footer py-4 py-md-4 bg-dark">
    <div class="container py-4 py-md-4 px-4 px-md-3">

    </div>
  </footer>
</template>

<style ></style>
