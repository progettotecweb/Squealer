<script setup lang="ts">
import {  ref } from 'vue'
import user_box from './components/user_box.vue'
import { getUserData } from './components/fetch.ts'
import user_profile from './components/user_profile.vue';


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
    <div class="d-flex justify-content-between w-100">
      <h4 class="navbar-brand">SMM Dashboard</h4>
      <div class="logo">
        <img src="/public/squealer.png" alt="squealer-logo" class="img-fluid logo" />
      </div>
      <div class="d-none d-lg-block">
        <a class="AppBtn" href="">Bottone</a>
      </div>
    </div>

  </header>
  <div class="container-fluid ">
    <div class="row flex-xl-nowrap">
      
      <div class="col-12 col-md-3 col-xl-2 sidebar d-none d-lg-block">
        <img :src="`data:${user.img.mimetype};base64,${user.img.blob}`" alt="user-img" style="width: 120px; height: 120px;"/> 
        <p>@{{ user.name }}</p>
        <a class="AppBtn" href="/"><h4>Home</h4></a>
      </div>

      <main 
      class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5
            flex flex-col justify-center items-center text-center text-w undefined text-slate-50"
      role="main">
        <h1>Dashboard</h1>
        <div>
          <div class="d-flex justify-content-around flex-wrap " > <!-- si vede se variabile x True-->
              <user_box
                  v-for="account in controlled_user"  
                  :id="account"></user_box>
          </div>
          <div><!--componente con info degli account, si vede se variabile x False -->
            <user_profile></user_profile>
          </div>

        </div>
      </main>

      <div class="col d-none d-xl-block col-xl-2 sidebar"></div>

    </div>
  </div>
  <footer class="py-4 py-md-4 bg-dark fixed-bottom d-none d-lg-block">
    <div class="container py-4 py-md-4 px-4 px-md-3">
    </div>
  </footer>
</template>

<style >

header{
  background-color: #374e64;
  color: aliceblue;
}
.logo{
  width: 30pt;
  height: 30pt;
}
.AppBtn{
  background-color: #374e64;
  color: aliceblue;
  border: 1px solid aliceblue;
  border-radius: 5px;
  padding: 5px;
}

</style>      
