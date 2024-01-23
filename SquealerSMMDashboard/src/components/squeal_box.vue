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
   
})

</script>


<template>
    <div v-if="waiting == false" class="squeal-box container w-auto text-start">
        <div class="row">
            <div class="col-1">
                <img :src="`data:${squeal.ownerID.img.mimetype};base64,${squeal.ownerID.img.blob}`" alt="user-img" class="img-fluid img-thumbnail"/>
            </div>
            <div class="col-11">
                <div class="row"> <!-- riga con nome e data-->
                    <div class="col-6">
                        <h6> @{{ squeal.ownerID.name }} </h6>
                    </div>
                    <div class="col-6 text-end">
                        <h6> {{ squeal.datetime }} </h6>
                    </div>
                </div>
                <div class="row"> <!-- riga con le citazioni-->
                    <div v-if="squeal.mentions.length != 0" class="col-12">
                        <h6>mentions: </h6>
                        <div class="row">
                            <div v-for="mention in squeal.mentions" class="col-auto">
                                <h6> {{ mention.name }} </h6>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row"> <!-- riga con il testo-->
                    <div class="col-12">
                        <h6 v-if="squeal.content.text != null"> {{ squeal.content.text }} </h6>
                        <div v-if="squeal.content.img.mimetype != null">
                            <img  :src="`data:${squeal.content.img.mimetype};base64,${squeal.content.img.blob}`" alt="user-img" class="img-fluid img-thumbnail"/>
                        </div>
                        <h6 v-if="squeal.content.geolocation.latitude != null">Posizione (TODO) : {{ squeal.content.geolocation.latitude }},{{ squeal.content.geolocation.longitude }}</h6>
                    </div>
                </div>

            </div>
        </div>
    </div>

    
</template>

<style>
    
        .squeal-box{
            background-color: #3e5870;
            color: aliceblue;
        }
    
       

</style>



