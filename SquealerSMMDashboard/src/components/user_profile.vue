<script setup lang="ts">
import { ref } from 'vue'
import { getMyData } from './fetch';
import squeal_box from './squeal_box.vue';


const user = ref<any>(null)
const id = defineProps(['id'])
const user_squeals = ref<any>(null);
const waiting = ref(true);




user.value = getMyData(id.id)
user.value.then((data: any) => {
    user.value = data
    user_squeals.value = user.value.squeals
    waiting.value = false

})




</script>


<template>
    <div class="w-100 container" >
        <div class="row">
            <img class="col-2" v-if="waiting == false" :src="`data:${user.img.mimetype};base64,${user.img.blob}`" alt="user-img" style="width: 80px; height: 80px;"/>
            <p class="col-2">{{ user.name }}</p>
            <h3 class="col-12">new post: </h3>
        </div>
        
        <squeal_box class="row" v-for="squeal in user_squeals"  
                    :id="squeal">
        </squeal_box>
        <!--squils fatti -->
        <!--clicca uno squils per vedere le statistiche --> 
        <!-- acuista caratteri-->  
    </div>
</template>

<style>


</style>



