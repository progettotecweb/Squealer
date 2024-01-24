<template>
  <div style="height: 75vh; width: 50vw;">
    <l-map :zoom="zoom" :center="mapCenter">
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"></l-tile-layer>
      <l-control-layers />


      <l-marker :lat-lng="markerPosition" draggable>
      </l-marker>
    </l-map>
  </div>
</template>

<script setup lang="ts">
//import { ref } from 'vue' 
import { PointExpression, LatLng } from "leaflet";
import { defineProps, onMounted } from "vue";
import {
  LMap,
  LTileLayer,
  LMarker,
  LControlLayers
} from "@vue-leaflet/vue-leaflet";
import "leaflet/dist/leaflet.css";

const geolocation = defineProps(['geolocation'])
console.log("sono stato eeseguito")
console.log(geolocation)
let zoom = 2
//let iconWidth = 25
//let iconHeight = 40
let mapCenter: PointExpression = [0, 0]  // Set the initial center to (0, 0)
let markerPosition = new LatLng(0, 0)// Set the initial marker position to (0, 0)

onMounted(() => {
  console.log(geolocation)
  

  mapCenter = [geolocation.geolocation.latitude, geolocation.geolocation.longitude] as PointExpression;
  markerPosition = new LatLng(geolocation.geolocation.latitude, geolocation.geolocation.longitude);

})


</script>