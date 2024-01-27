<script setup lang="ts">
import {  ref } from 'vue'
import user_boxs from './components/user_boxs.vue'
import { getUserData } from './components/fetch.ts'
import user_profile from './components/user_profile.vue';

const active_name = ref<any>(null);

const user = ref<any>(null); 
const controlled_user = ref<any>(null);
const waiting = ref(true);



user.value = getUserData()
user.value.then((data: any) => {
  user.value = data
  controlled_user.value = user.value.controls.user_id
  waiting.value = false
})


</script>

<template >
  <header class="navbar navbar-expand navbar-dark sticky-top ">
    <div class="d-flex flex-row justify-content-between align-items-center w-100">
      <div class="d-none d-lg-block w-25">
        <p class="title"> SMM Dashboard</p>
      </div>

      <div class="logo d-flex justify-content-center w-25">
          <img src="/public/squealer.png" alt="squealer-logo" class="img-fluid logo" />
        <p class="title d-none d-lg-block">
          Squealer
        </p>
      </div>

      <div class="w-25 d-flex justify-content-end" v-if="active_name == null">
        
          <a href="/home"><button class="btn btn-outline-info ">Back</button></a>
        
      </div>
      <div class="w-25 d-flex justify-content-end" v-if="active_name != null">
            
              <button class="btn btn-outline-info " @click="active_name = null">Back</button>
            
      </div>
      
    </div>

  </header>
  <div class="container-fluid ">
    <div class="row ">
      
      <div class="col-md-3 col-xl-2 sidebar d-none d-lg-block  text-center"> <!--sidebar sinistra-->
        <div class="row justify-content-center p-0">
          <img class="p-0" v-if="waiting == false" :src="`/api/media/${user.img}`" alt="user-img" style="width: 120px; height: 120px;"/> 
        </div>
        <div class="row">
          <p>@{{ user.name }}</p>
        </div>
        <div class="row">
          <a href="/home"><button class="btn btn-outline-info ">Home</button></a>
        </div>
      </div>

      <main 
      class="col-12 col-md-12 col-lg-9 col-xl-8"
      role="main">  <!--main-->
        <div>
          
          <div v-if="active_name == null" class="d-flex justify-content-around flex-wrap " > <!-- si vede se variabile Name == NULL-->
              <user_boxs
                  v-for="account in controlled_user"  
                  :id="account"
                  @click="active_name = account"></user_boxs>
          </div>
          <div v-if="active_name != null" class="d-flex justify-content-around flex-wrap "><!--componente con info degli account, si vede se variabile name == nome utente-->
            <user_profile :id="active_name"></user_profile> 
            <!--https://vuejs.org/api/sfc-script-setup.html-->
          </div>

        </div>
      </main>

      
      <div class="col d-none d-xl-block col-xl-2 sidebar"></div>

    </div>
  </div>
</template>

<style>
header{
    background-color: #1f2937;
    color: aliceblue;
}

.logo {
    width: 30pt;
    height: 30pt;
}
.title {
    font-size: 20pt;
    font-weight: bold;
}

</style>
