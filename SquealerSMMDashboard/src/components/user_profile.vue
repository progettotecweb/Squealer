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
    <div class="w-100 container  text-start" >
        <div class="row">

            <div class="col-3">
                <img v-if="waiting == false" :src="`data:${user.img.mimetype};base64,${user.img.blob}`" alt="user-img" style="width: 80px; height: 80px;"/>
            </div>

            <div class="col-3">
                <h6>@{{ user.name }}</h6>
                <h6>popularity: {{ user.popularity }}</h6>
                <h6>followers (TODO)</h6>
                

            </div>

            <div class="col-3">
                <h6 v-if="waiting == false">posts: {{ user.squeals.length }}</h6>
                
            </div>

            <div class="col-3">
                <h6>remaining characters</h6>
                <h6>daily:{{ user.msg_quota.daily }} </h6>
                <h6>weekly:{{ user.msg_quota.weekly }} </h6>
                <h6>monthly:{{ user.msg_quota.monthly }} </h6>     
            </div>

        </div>

        <div class="row">
            <button class="AppBtn col-auto" @click="">
                create new post
            </button>
            <button class="AppBtn col-auto" @click="">
                buy characters
            </button>
        </div >
        <div class="container ">
            <squeal_box class="m-3" v-for="squeal in user_squeals"  
                        :id="squeal">
            </squeal_box>
            <!--clicca uno squils per vedere le statistiche --> 
            <!-- acuista caratteri-->  
        </div>
    </div>
</template>

<style>

.squeal-box{
    margin: auto;
}

</style>



