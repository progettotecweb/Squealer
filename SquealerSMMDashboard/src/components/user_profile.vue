<script setup lang="ts">
import { ref } from 'vue'
import { getMyDataAndPopulate } from './fetch';
import squeal_box from './squeal_box.vue';


const user = ref<any>(null)
const id = defineProps(['id'])
const user_squeals = ref<any>(null);
const waiting = ref(true);



user.value = getMyDataAndPopulate(id.id)
user.value.then((data: any) => {
    user.value = data
    user_squeals.value = user.value.squeals
    //console.log(data)
    waiting.value = false
})




</script>


<template>
    <div class="user_profile">
        <p>{{ user.name }}</p>
        <img v-if="waiting == false" :src="`data:${user.img.mimetype};base64,${user.img.blob}`" alt="user-img" style="width: 200px; height: 200px;"/>
        <h3>new post: </h3>
        <squeal_box v-for="squeal in user_squeals"  
                      :id="squeal" >
        </squeal_box>
        <!--squils fatti -->
        <!--clicca uno squils per vedere le statistiche --> 
        <!-- acuista caratteri-->  
    </div>
</template>

<style>
.user_box {
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

</style>



