<template>
  <div style="height: 25vh; width: 100%;">
    <l-map :zoom="zoom" :center="mapCenter" @ready="initMap()">
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"></l-tile-layer>
      <l-control-layers />


      <l-marker :lat-lng="markerPosition">
      </l-marker>
    </l-map>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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

let zoom = 13
const mapCenter = ref<PointExpression>([0, 0]); // Set the initial center to (0, 0)
const markerPosition = ref<LatLng>(new LatLng(0, 0)); // Set the initial marker position to (0, 0)


onMounted(() => {
  console.log(geolocation.geolocation)

})

function initMap() {
  mapCenter.value = [geolocation.geolocation.latitude, geolocation.geolocation.longitude] as PointExpression;
  markerPosition.value = new LatLng(geolocation.geolocation.latitude, geolocation.geolocation.longitude);
}


</script>