<template>
    <div style="height: 25vh; width: 100%;">
        <l-map :zoom="zoom" :center="mapCenter" @click="changeMarkerPosition" @ready="initMap()">
            <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"></l-tile-layer>


            <l-marker :lat-lng="markerPosition">
            </l-marker>
        </l-map>
    </div>
</template>
  
<script setup lang="ts">
import { ref } from 'vue'
import { PointExpression, LatLng } from "leaflet";

import {
    LMap,
    LTileLayer,
    LMarker
} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";


let zoom = 13
const mapCenter = ref<PointExpression>([0, 0]); // Set the initial center to (0, 0)
const markerPosition = ref<LatLng>(new LatLng(0, 0)); // Set the initial marker position to (0, 0)

const emits = defineEmits();



function initMap() {
    // Get current geolocation from navigator
    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Update map center and marker position with geolocation coordinates
        mapCenter.value = [latitude, longitude] as PointExpression;
        markerPosition.value = new LatLng(latitude, longitude);
        changeMarkerPositionManual(latitude, longitude)
    });
}

function changeMarkerPosition(event: any) {
    // Update marker position with the clicked coordinates
    const { lat, lng } = event.latlng;
    markerPosition.value = new LatLng(lat, lng);
    emits('markerPositionChanged', { lat, lng });
}

function changeMarkerPositionManual(lat: any, lng: any) {
    // Update marker position with the clicked coordinates
    markerPosition.value = new LatLng(lat, lng);
    emits('markerPositionChanged', { lat, lng });
}


</script>