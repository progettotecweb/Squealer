<script setup lang="ts">
import { ref } from 'vue'
import { getMyData } from './fetch';


const user = ref<any>(null)
const id = defineProps(['id'])
const waiting = ref(true);
//define user_id, it will be shared with the father



    user.value = getMyData(id.id)
    user.value.then((data: any) => {
        user.value = data
        waiting.value = false
    })
    
    
</script>


<template>
    <div class="user-box">
        <div class="user-img-box">
            <img v-if="waiting == false"   :src="`data:${user.img.mimetype};base64,${user.img.blob}`" alt="user-img" class="img-fluid img-thumbnail"/> 
        </div>
        <h1>{{ user.name}}</h1>
       
    </div>
</template>

<style>

    .user-box{
        background-color: #3e5870;
        border-radius: 10px;
        padding: 10px;
        margin: 10px;
        width: 200px;
        height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: aliceblue;
    }

    .user-img-box{
        width: 60%;
        height: 60%;
    }

</style>



