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
    
    <div class="card m-5" style="width: 10rem">
        <img v-if="waiting == false"   :src="`/api/media/${user.img}`" alt="user-img" class="card-img-top"/>
        <div class="card-body">
            <p class="card-text text-center fs-3">{{ user.name }}</p>
        </div>
    </div>

</template>

<style>


</style>



