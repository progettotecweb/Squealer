<script setup lang="ts">
import { ref } from 'vue'
import { getSquealData } from './fetch';
import GeolocationSqueal from './GeolocationSqueal.vue';

const squeal = ref<any>(null)
const id = defineProps(['squeal', 'owner'])
const waiting = ref(true);

const emits = defineEmits();

squeal.value = getSquealData(id.squeal)
squeal.value.then((data: any) => {
    squeal.value = data
    waiting.value = false
    emitsData()
})

function emitsData() {
    let { datetime } = squeal.value
    const { impressions, replies, reactions } = squeal.value
    datetime = formatDate(datetime)
    emits('squealData', { datetime, impressions, replies, reactions });
}

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
    <div v-if="waiting == false">
        <div v-if="id.owner == squeal.ownerID._id">
            <div class="squeal-box rounded-3 container w-auto text-start">
                <div class="row">
                    <div class="col-1 p-0 mt-2">
                        <img :src="`/api/media/${squeal.ownerID.img}`" alt="user-img" class="img-fluid img-thumbnail" />
                    </div>
                    <div class="col-11">
                        <div class="row mt-2 mb-2"> <!-- riga con nome e data-->
                            <div class="col-6">
                                <h6> @{{ squeal.ownerID.name }} </h6>
                            </div>
                            <div class="col-6 text-end">
                                <h6> {{ formatDate(squeal.datetime) }} </h6>
                            </div>
                        </div>

                        <div class="row"> <!-- riga con il testo-->
                            <div v-if="squeal.type === 'text'" class="squealText">
                                <h6> {{ squeal.content.text }} </h6>
                                <hr class="m-0 mt-2" />
                            </div>
                            <div v-if="squeal.type === 'image'">
                                <img :src="`/api/media/${squeal.content.img}`" alt="user-img"
                                    class="img-fluid img-thumbnail" />
                            </div>
                            <div v-if="squeal.type === 'video'">
                                <video controls :src="`/api/media/${squeal.content.video}`"
                                    class="img-fluid img-thumbnail"></video>
                            </div>
                            <div v-if="squeal.type === 'geolocation'">
                                <GeolocationSqueal :geolocation="squeal.content.geolocation"></GeolocationSqueal>

                            </div>
                        </div>

                        <div class="d-flex w-100">
                            <div class="d-flex justify-content-start w-50"> <!--riga delle reazioni (TODO)-->
                                <i class=" pt-2 pb-2 text-capitalize">{{ squeal.cm.label }} </i>
                            </div>

                            <div class="d-flex justify-content-end w-50"> <!--riga delle reazioni (TODO)-->
                                <div class="fs-4 p-2">😡{{ squeal.reactions.m2 }} </div>
                                <div class="fs-4 p-2">😒{{ squeal.reactions.m1 }} </div>
                                <div class="fs-4 p-2">😄{{ squeal.reactions.p1 }} </div>
                                <div class="fs-4 p-2">😝{{ squeal.reactions.p2 }} </div>
                            </div>
                        </div>
                    </div>
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

.squealText {
    overflow-y: auto;
    word-break: break-all;
}
</style>



