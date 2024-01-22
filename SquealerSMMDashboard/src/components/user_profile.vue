<script setup lang="ts">
import { ref } from 'vue'
import { getMyData } from './fetch';
import squeal_box from './squeal_box.vue';


const user = ref<any>(null)
const id = defineProps(['id'])
const user_squeals = ref<any>(null);
const waiting = ref(true);

const new_squeal = ref(false);
const new_squeal_text = ref("")


const new_characters = ref(false);


user.value = getMyData(id.id)
user.value.then((data: any) => {
    user.value = data
    user_squeals.value = user.value.squeals
    waiting.value = false

})


async function create_new_squeal(){
    let content = {
        ownerID: user.value._id,
        type: "text",
        content: { text: new_squeal_text.value , image: null, geolocation: null },
        recipients: []
    }

    await fetch("/api/squeals/post",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(content),
        
    })
        .then(res =>{
            if(res.ok){
                
            } else {
                console.log("Error while updating data!");
            }
        })
     
    user.value = getMyData(id.id)
    user.value.then((data: any) => {
        user.value = data
        user_squeals.value = user.value.squeals
    })
}



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

            <div v-if="waiting == false" class="col-3">
                <h6>remaining characters</h6>
                <h6>daily:{{ user.msg_quota.daily }} </h6>
                <h6>weekly:{{ user.msg_quota.weekly }} </h6>
                <h6>monthly:{{ user.msg_quota.monthly }} </h6>     
            </div>

        </div>

        <div  class="row">
            <button class="AppBtn col-auto" v-if="new_characters == false" @click="new_squeal = !new_squeal">
                create new post
            </button>
            <button class="AppBtn col-auto" v-if="new_squeal == false" @click="new_characters = !new_characters">
                buy characters
            </button>
        </div >

        <div v-if="new_squeal" class="row">
            <div class="col-12">
                <input v-model="new_squeal_text" placeholder="tell me the news" id="new_squeal_text_input" />
                <button class="AppBtn" @click="create_new_squeal()" >post</button>
            </div>
        </div>


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



