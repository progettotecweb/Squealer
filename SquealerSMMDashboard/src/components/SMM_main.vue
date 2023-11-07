<script setup lang="ts">

import { ref } from 'vue'
import user_box from './user_box.vue'
// const count = ref(0)


defineProps(['controlled'])

const newSearch = ref()
function search() { }



</script>

<template>
    <div>
        <div>
            <h1>{{ controlled }}</h1>
            <form @submit.prevent="search">
                <input v-model="newSearch">
                <button>Search</button>
            </form>
        </div>
        <div class="d-flex justify-content-around flex-wrap " >
            <user_box 
                v-for="account in controlled.user_id"  
                :id="account"></user_box>
        </div>
    </div>
</template>


<style ></style>
