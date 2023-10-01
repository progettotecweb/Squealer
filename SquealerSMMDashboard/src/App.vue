<script setup lang="ts">
import SMM_main from './components/SMM_main.vue'

</script>

<template >
  <header class="navbar navbar-expand navbar-dark flex-column flex-md-row bd-navbar">
    <a class="btn btn-bd-download d-none d-lg-inline-block mb-3 mb-md-0 ml-md-3" href="/">Home</a>
  </header>
  <div class="container-fluid ">
    <div class="row flex-xl-nowrap">
      <div class="col-12 col-md-3 col-xl-2 bd-sidebar">
        colonnna sinistra 
      </div>
      <main class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content bg-secondary flex flex-col justify-center items-center text-center text-w undefined text-slate-50" role="main">
        <h1 class="bd-title" id="content">Dashboard</h1>
        <div>
          <SMM_main />
        </div>
        fine main
      </main>
    </div>
  </div>
  
</template>

<style >

</style>
