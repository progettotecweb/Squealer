<script setup lang="ts">
import { ref } from 'vue'
import { getMyData } from './fetch';
import squeal_box from './squeal_box.vue';
import Geolocation from './Geolocation.vue';

const user = ref<any>(null);
const id = defineProps(['id']);
const user_squeals = ref<any>(null);
const waiting = ref(true);

const new_squeal = ref(false);
const new_squeal_content = ref<any>(null);
const new_squeal_type = ref("");

const insert_new_text = ref(true);
const insert_new_img = ref(false);
const insert_new_pos = ref(false);

const new_characters = ref(false);

let daily_quota = 0;
let weekly_quota = 0;
let monthly_quota = 0;



const update_user_value = () => {

    waiting.value = true;
    user.value = getMyData(id.id)
    user.value.then((data: any) => {
        user.value = data
        user_squeals.value = user.value.squeals
        daily_quota = user.value.msg_quota.daily;
        weekly_quota = user.value.msg_quota.weekly;
        monthly_quota = user.value.msg_quota.monthly;
        waiting.value = false
    })
    
}


update_user_value();

//add caracters and update user
const add_characters = async () => {

    let data = {
        msg_quota: {
            daily: user.value.msg_quota.daily + 140,
            weekly: user.value.msg_quota.weekly + 140,
            monthly: user.value.msg_quota.monthly + 140
        }
    }

    await fetch("/api/users/"+id.id, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(res => {
            if (res.ok) {
                update_user_value();
            } else {
                console.log("Error while updating data!");
            }
        })
        .catch(err => {
            console.log(err);
        });
}


const formatImg = (img: string | null) => {
    if (!img) {
        console.log("no img");
        return null;
    }
    let myImg = { mimetype: "", blob: "" };
    const imgSplit = img.split(",");
    const imgType = imgSplit[0].split(";")[0].split(":")[1];
    const imgBlob = imgSplit[1];
    myImg = { mimetype: imgType, blob: imgBlob };
    console.log(myImg);
    return myImg;
}

const handleImg = (file: any, setContentToUpdate = false) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const imgDataUrl = reader.result as string;
            if (setContentToUpdate) {

                new_squeal_content.value = {
                    text: null,
                    img: formatImg(imgDataUrl),
                    geolocation: null,
                    video: null
                };
            }

            resolve(imgDataUrl); // resolve promise
        };

        reader.onerror = (error) => {
            reject(error); // reject promise if something goes wrong
        };

        reader.readAsDataURL(file.files[0]);
    });
}





const Handlecontent = async (e: any) => {

    if (!e.target.files[0]) return;

    if (!e.target.files[0].type.startsWith('image')) {
        console.log("file not supported");
        return;
    } else {
        await handleImg(e.target, true);
    }
}


const create_new_squeal = async () => {
    //check if quota is enough to post the squeal
    const MEDIA_LENGTH = 125
    switch (new_squeal_type.value) {
        case "text":
            if (new_squeal_content.value.text.length > user.value.msg_quota.daily || new_squeal_content.value.text.length > user.value.msg_quota.weekly || new_squeal_content.value.text.length > user.value.msg_quota.monthly) {
                alert("Not enough quota")
                return;
            }
            break;
        case "image":
        case "geolocation":
        case "video":
            if (MEDIA_LENGTH > user.value.msg_quota.daily || MEDIA_LENGTH > user.value.msg_quota.weekly || MEDIA_LENGTH > user.value.msg_quota.monthly) {
                alert("Not enough quota")
                return;
            }
        break;
    }

    let content = {
        ownerID: user.value._id,
        type: new_squeal_type.value,
        content: new_squeal_content.value,
        recipients: [] // passare type e id
    }

    console.log(new_squeal_content)

    await fetch("/api/squeals/post", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(content)

    })
        .then(res => {
            if (res.ok) {

            } else {
                console.log("Error while updating data!");
            }
        })


    update_user_value();
}


const markerPosition = ref({ lat: 0, lng: 0 });

function updateMarkerPosition(newPosition: { lat: number; lng: number }) {
    markerPosition.value = newPosition;
}

</script>


<template>
    <div class="w-100 container  text-start">
        <div class="row">

            <div class="col-3 ">
                <img v-if="waiting == false" :src="`/api/media/${user.img}`" alt="user-img"
                    style="width: 80px; height: 80px;" />
            </div>

            <div class="col-4">
                <h6>@{{ user.name }}</h6>
                <h6>popularity: {{ user.popularity }}</h6>
                <h6 v-if="waiting == false">posts: {{ user.squeals.length }}</h6>
            </div>

            <div class="col-1">

            </div>

            <div v-if="waiting == false" class="col-4">
                <h6>remaining characters</h6>
                <h6>daily:{{ user.msg_quota.daily }} </h6>
                <h6>weekly:{{ user.msg_quota.weekly }} </h6>
                <h6>monthly:{{ user.msg_quota.monthly }} </h6>
            </div>

        </div>

        <div class="row">
            <button class="btn btn-outline-info col-auto" 
                @click="new_squeal = !new_squeal, new_characters = false">
                create new post
            </button>
            <button class="btn btn-outline-info col-auto" 
                @click="new_characters = !new_characters, new_squeal = false">
                buy characters
            </button>
        </div>


        <div v-if="new_squeal" class="row"> <!--inserimento nuovo squeal-->
            <div class="col-12">
                <div class="row">
                    <button class="btn btn-outline-info col-auto"
                        @click="insert_new_text = true, insert_new_img = false, insert_new_pos = false">text</button>
                    <button class="btn btn-outline-info col-auto"
                        @click="insert_new_text = false, insert_new_img = true, insert_new_pos = false">image</button>
                    <button class="btn btn-outline-info col-auto"
                        @click="insert_new_text = false, insert_new_img = false, insert_new_pos = true">geolocation</button>
                </div>
                <div class="row">
                    <div v-if="insert_new_text == true"> <!--inserimento testo-->
                        <div>
                            <textarea class="form-control" 
                                v-model="new_squeal_content" 
                                @input="user.msg_quota.daily = daily_quota-new_squeal_content.length, user.msg_quota.weekly = weekly_quota-new_squeal_content.length, user.msg_quota.monthly = monthly_quota-new_squeal_content.length" 
                                placeholder="What's happening?"
                                id="new_squeal_text_input" 
                                rows="4">
                            </textarea>
                        </div>
                        <div class="col-auto">

                            <button class="btn btn-outline-info" @click="
                                new_squeal_type = 'text',
                                new_squeal_content = {
                                    text: new_squeal_content,
                                    img: null,
                                    geolocation: null,
                                    video: null
                                },
                                create_new_squeal(),
                                new_squeal_content = null">post
                            </button>
                        </div>
                    </div>
                    <div v-if="insert_new_img == true"> <!--inserimento immagine-->
                        <label for="formFile1" class="form-label">select an image to squeal</label>
                        <input class="form-control" id="formFile1" @change="Handlecontent" accept="image/*" type="file" />
                        <div class="col-auto">
                            <button class="btn btn-outline-info"
                                @click=" new_squeal_type = 'image', 
                                create_new_squeal(),
                                new_squeal_content = null">post</button>
                        </div>
                    </div>
                    <div v-if="insert_new_pos == true"> <!--inserimento posizione-->
                        <div class="col-auto">
                        <Geolocation  @markerPositionChanged="updateMarkerPosition"></Geolocation>
                            <button class="btn btn-outline-info" @click="
                                new_squeal_type = 'geolocation',
                                new_squeal_content = {
                                    text: null,
                                    img: null,
                                    geolocation: { latitude: markerPosition.lat, longitude: markerPosition.lng },
                                    video: null
                                },
                                create_new_squeal(),
                                new_squeal_content = null">post</button>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>

        <div v-if="new_characters"><!--buy new caracters-->

            <button class="btn btn-outline-info" @click="add_characters()" > aggiungi 140 caratteri</button>
            

        </div>



        <div class="container d-flex flex-column-reverse ">
            <squeal_box class="m-3" v-for="squeal in user_squeals" :id="squeal">
            </squeal_box>
            <!--clicca uno squils per vedere le statistiche -->
            <!-- acuista caratteri-->
        </div>
    </div>
</template>

<style></style>



