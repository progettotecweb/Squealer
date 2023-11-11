<script setup lang="ts">
import {  ref } from 'vue'
import user_box from './components/user_box.vue'
import { getUserData } from './components/fetch.ts'


const user = ref<any>(null); 
const controlled_user = ref<any>(null);


user.value = getUserData()
user.value.then((data: any) => {
  user.value = data
  controlled_user.value = user.value.controls.user_id
  
})


</script>

<template >
  <header class="navbar navbar-expand navbar-dark sticky-top">
    <div class="container-fluid row justify-content-around"><!--mid or more navbar-->
      <h2 class="col navbar-brand">SMM Dashboard</h2>
      <div class="col" style="height: 30pt; width: 30pt;">
        <img src="/public/squealer.png" alt="squealer-logo" class="img-fluid" style="width: 30pt; height: 30pt;"/>
      </div>
      <a class="col btn" href="/logout">Logout</a>
    </div>

  </header>
  <div class="container-fluid ">
    <div class="row flex-xl-nowrap">
      
      <div class="col-12 col-md-3 col-xl-2 sidebar">
        <img :src="`data:${user.img.mimetype};base64,${user.img.blob}`" alt="user-img" style="width: 120px; height: 120px;"/> 
        <p>@{{ user.name }}</p>
        <a class="btn" href="/">Home</a>
      </div>

      <main 
      class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5
             bg-secondary flex flex-col justify-center items-center text-center text-w undefined text-slate-50"
      role="main">
        <h1 class="bd-title" id="content">Dashboard</h1>
        <div>
          <div class="d-flex justify-content-around flex-wrap " >
              <user_box 
                  v-for="account in controlled_user"  
                  :id="account"></user_box>
          </div>
        </div>
      </main>

      <div class="col d-none d-xl-block col-xl-2 sidebar"></div>

    </div>
  </div>
  <footer class="py-4 py-md-4 bg-dark">
    <div class="container py-4 py-md-4 px-4 px-md-3">
    </div>
  </footer>
</template>

<style >

header{
  background-color: #374e64;
  color: aliceblue;
}


</style>
