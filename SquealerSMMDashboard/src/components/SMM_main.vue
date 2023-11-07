<script setup lang="ts">

import { ref } from 'vue'
import user_box from './user_box.vue'
// const count = ref(0)



const newSearch = ref('')
function search() { }



const data = ref<any>(null); // specificare il tipo di dato



</script>

<template>
    <div>
        <div>
            <h1>{{ data.name }}</h1>
            <form @submit.prevent="search">
                <input v-model="newSearch">
                <button>Search</button>
            </form>
        </div>
        <div>
            <user_box v-for="account in data.controls" :key="account.index" :id="account.id"></user_box>
        </div>


        <div class="d-flex justify-content-around flex-wrap ">
            <div v-for="account in data.controls" style="width: 10vh;height: 5vh;" class="card bg-success m-5 mb-5">
                <p>{{ account.name }}</p>
            </div>
        </div>

        
    </div>
</template>


<style ></style>
