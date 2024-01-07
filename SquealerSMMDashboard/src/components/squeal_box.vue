<script setup lang="ts">
import { ref } from 'vue'
import { getSquealData } from './fetch';


const squeal = ref<any>(null)
const id = defineProps(['id'])
const waiting = ref(true);


squeal.value = getSquealData(id.id)
squeal.value.then((data: any) => {
    squeal.value = data
    waiting.value = false
    console.log(squeal.value)
})

</script>


<template>
    <div class="squeal-box container">
        <div class="row">
            <div class="col-1" id="squeal-user-img">
                    <img v-if="waiting == false"   :src="`data:${squeal.ownerID.img.mimetype};base64,${squeal.ownerID.img.blob}`" alt="user-img" class="img-fluid img-thumbnail"/> 
            </div>
            <div class="col-11">
                <p v-if="waiting == false"> {{ squeal.ownerID.name }} </p>
                <p v-if="waiting == false"> {{ squeal.date }} </p>
            </div>

        </div>
        <div class="row">
            <div class="col-12">
                <p v-if="waiting == false && squeal.content.text != null"> post text: {{ squeal.content.text}}</p>
                <p v-if="waiting == false && squeal.content.img.mimetype != null" > post img: <img   :src="`data:${squeal.content.img.mimetype};base64,${squeal.content.img.blob}`" alt="user-img" class="img-fluid img-thumbnail"/> </p>  
            </div>
        </div>
    </div>




</template>

<style>
    
        .squeal-box{
            background-color: #3e5870;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: aliceblue;
        }
    
        #squeal-user-img{
            width: 60px;
            height: 60px;
        }

</style>



