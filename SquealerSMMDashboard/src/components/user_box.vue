<script setup lang="ts">
import { ref } from 'vue'
import { getMyData } from './fetch';
// import { useFetch } from '/js/fetch.js'

const user = ref<any>(null)
const id = defineProps(['id'])


user.value = getMyData(id.id)
user.value.then((data: any) => {
    user.value = data
})


</script>


<template>
    <div class="user_box">
        <img :src=user.img.blob alt="pic" class="modal-img" />
        
        <h1>{{ user.name }}</h1>
        <h1>----------</h1>
    </div>
</template>

<style>
    .user_box {
        background-color: #4c6ae1;
        border-radius: 10px;
        padding: 10px;
        margin: 10px;
        width: 200px;
        height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

    }
</style>



