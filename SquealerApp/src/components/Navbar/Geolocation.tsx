"use client"
import { useRef, useEffect, useState } from "react";

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import "leaflet/dist/leaflet.css";

interface GeolocationProps {
    onLocation: (lat: number, lng: number) => void;
}

const Geolocation: React.FC<GeolocationProps> = ({
    onLocation
}) => {
    const [geolocation, setGeolocation] = useState<[number, number] | any>([null, null]);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);

    //TODO: change marker location and set the new location with onLocation
    useEffect(() => {
        // Get user's geolocation when the component mounts
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setGeolocation([latitude, longitude]);
                    onLocation(latitude, longitude);
                },
                (error) => {
                    console.error('Error getting geolocation:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }, []); // Empty dependency array ensures useEffect runs only once on mount

    const [map, setMap] = useState<L.Map | null>(null);
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (mapRef.current) { return }
        const mapElement = document.getElementById('map');
        if (!mapElement) return; // Map container not found

        import("leaflet").then(L => {
            // Fix the bug where the images for the marker are not found
            L.Icon.Default.mergeOptions({
                iconUrl: markerIcon.src,
                iconRetinaUrl: markerIcon2x.src,
                shadowUrl: markerShadow.src,
            });

            if (!mapRef.current) {
                // If map is not initialized, create a new one
                mapRef.current = L.map('map', {
                    center: geolocation,
                    zoom: 13,
                    layers: [
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; OpenStreetMap contributors'
                        })
                    ]

                });
                console.log("mapRef.current", mapRef.current);
                console.log("geo", geolocation);

                //add marker
                L.marker(geolocation)
                    .bindPopup("You are here")
                    .openPopup()
                    .addTo(mapRef.current);

                // onckick event listener
                mapRef.current.on('click', function (e) {
                    const { lat, lng } = e.latlng;
                    if (mapRef.current) {
                        //remove previous marker
                        mapRef.current.eachLayer(function (layer) {
                            if (layer instanceof L.Marker && mapRef.current) {
                                mapRef.current.removeLayer(layer);
                            }
                        });
                    }

                    if (mapRef.current) {
                        // Add new marker
                        const newMarker = L.marker([lat, lng])
                            .bindPopup("Your position")
                            .openPopup()
                            .addTo(mapRef.current);

                        //update new location
                        onLocation(lat, lng);
                    }
                });

                setMap(mapRef.current);
            } else {
                // If map is already initialized, update its properties
                mapRef.current.setView(geolocation, 13);
            }



        });
    }, geolocation);

    return (
        <div>
            {geolocation[0] !== null && geolocation[1] !== null ? (
                <div>
                    <div id="map" style={{ height: "400px", width: "100%" }} className="mapSqueal"></div>
                    <p>Your current latitude is: {geolocation[0]}</p>
                    <p>Your current longitude is: {geolocation[1]}</p>
                </div>
            ) : (
                <p>Loading geolocation...</p>
            )}
        </div>
    );
};

export default Geolocation;
