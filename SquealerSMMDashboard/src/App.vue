<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'


// import SMM_main from './components/SMM_main.vue'
import { getUserData } from './components/fetch.ts'


const user = ref('');


onBeforeMount(() => {
  getUserData()
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
        <p>{{ user }}</p>
      </div>
      <main
        class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content bg-secondary flex flex-col justify-center items-center text-center text-w undefined text-slate-50"
        role="main">
        <h1 class="bd-title" id="content">Dashboard</h1>
        <div>
          <p>prima di SMM</p>
          <SMM_main data: data />
          <p>dopo SMM</p>
        </div>
      </main>SquealerSMMDashboard/src/App.vue
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
