<script setup lang="ts">
import { ref } from 'vue'
import { getSquealData } from './fetch';
import GeolocationSqueal from './GeolocationSqueal.vue';

const squeal = ref<any>(null)
const id = defineProps(['id'])
const waiting = ref(true);



squeal.value = getSquealData(id.id)
squeal.value.then((data: any) => {
    squeal.value = data
    waiting.value = false

})

function pad(number: any) {
    return (number < 10 ? '0' : '') + number;
}

function formatDate(date: any) {
    const d = new Date(date);
    const month = pad(d.getMonth() + 1); // Aggiungo 1 al mese perché i mesi in JavaScript partono da 0
    const day = pad(d.getDate());
    const year = d.getFullYear();
    const hour = pad(d.getHours());
    const minutes = pad(d.getMinutes());

    return day + "/" + month + "/" + year + " " + hour + ":" + minutes;
}

</script>


<template>
    <div v-if="waiting == false" class="squeal-box rounded-3 container w-auto text-start">
        <div class="row">
            <div class="col-1 p-0">
                <img :src="`data:${squeal.ownerID.img.mimetype};base64,${squeal.ownerID.img.blob}`" alt="user-img"
                    class="img-fluid img-thumbnail" />
            </div>
            <div class="col-11">
                <div class="row"> <!-- riga con nome e data-->
                    <div class="col-6">
                        <h6> @{{ squeal.ownerID.name }} </h6>
                    </div>
                    <div class="col-6 text-end">
                        <h6> {{ formatDate(squeal.datetime) }} </h6>
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
                    <div v-if="squeal.type === 'text'" class="squealText" >
                        <h6> {{ squeal.content.text }} </h6>
                    </div>
                    <div v-if="squeal.type === 'image'">
                        <img :src="`data:${squeal.content.img.mimetype};base64,${squeal.content.img.blob}`" alt="user-img"
                            class="img-fluid img-thumbnail" />
                    </div>
                    <div v-if="squeal.type === 'video'">
                    </div>
                    <div v-if="squeal.type === 'geolocation'">
                        <GeolocationSqueal  :geolocation="squeal.content.geolocation"></GeolocationSqueal> 

                    </div>       
                </div>
                <div> <!--riga delle reazioni (TODO)-->

                </div>
                <div>

                </div>
            </div>
        </div>
    </div>
</template>

<style>
.squeal-box {
    background-color: #1f2937;
    color: aliceblue;
}

.squealText{
    overflow-y: auto;
    word-break: break-all;
}
</style>



