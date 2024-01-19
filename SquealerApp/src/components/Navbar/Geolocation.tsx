"use client"
import { useRef, useEffect, useState } from "react";

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import "leaflet/dist/leaflet.css";
import { init } from "next/dist/compiled/webpack/webpack";

interface GeolocationProps {
    onLocation: (lat: number, lng: number) => void;
}

const Geolocation: React.FC<GeolocationProps> = ({
    onLocation
}) => {
    const [geolocation, setGeolocation] = useState<[number, number] | any>([null, null]);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const [userPosition, setUserPosition] = useState<[number, number] | any>([null, null]);

    function initGeolocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setGeolocation([latitude, longitude]);
                    setUserPosition([latitude, longitude]);
                    onLocation(latitude, longitude);
                },
                (error) => {
                    if (error.code === 1) {
                        // Permission denied
                        console.log('Geolocation permission denied.');
                    } else {
                        console.error('Error getting geolocation:', error.message);
                    }
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }

    useEffect(() => {
        // Get user's geolocation when the component mounts
        initGeolocation();
    }, []); // Empty dependency array ensures useEffect runs only once on mount

    const [map, setMap] = useState<L.Map | null>(null);
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (mapRef.current) { return }
        const mapElement = document.getElementById('map');
        if (!mapElement) return; // Map container not found

        initMap();

    }, geolocation);

    function initMap() {
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

                // Add marker
                L.marker(geolocation)
                    .bindPopup("You are here")
                    .openPopup()
                    .addTo(mapRef.current);

                // onclick event listener
                mapRef.current.on('click', function (e) {
                    const { lat, lng } = e.latlng;
                    if (mapRef.current) {
                        // Remove previous marker
                        mapRef.current.eachLayer(function (layer) {
                            if (layer instanceof L.Marker && mapRef.current) {
                                mapRef.current.removeLayer(layer);
                            }
                        });
                    }

                    // Add new marker
                    changeMarkerPosition(L, lat, lng);

                });

                setMap(mapRef.current);
            } else {
                // If map is already initialized, update its properties
                mapRef.current.setView(geolocation, 13);

                // Move the existing marker to the new position
                const existingMarker = mapRef.current.eachLayer(function (layer) {
                    if (layer instanceof L.Marker) {
                        layer.setLatLng(geolocation);
                    }
                });

                // If the marker doesn't exist, add a new one
                if (!existingMarker) {
                    L.marker(geolocation)
                        .bindPopup("You are here")
                        .openPopup()
                        .addTo(mapRef.current);
                }
            }
        });
    }

    function changeMarkerPosition(L, lat, lng) {
        if (mapRef.current) {
            // Add new marker
            const newMarker = L.marker([lat, lng])
                .bindPopup("Your position")
                .openPopup()
                .addTo(mapRef.current);

            //update new location
            onLocation(lat, lng);
        }
    }

    return (
        <div>
            {geolocation[0] !== null && geolocation[1] !== null ? (
                <div>
                    <button
                        onClick={() => {
                            initGeolocation();
                            initMap();
                        }}
                        className="bg-green-700 hover:bg-green-900 text-white py-2 px-4 rounded mb-2">
                        Reset position
                    </button>
                    <div id="map" style={{ height: "400px", width: "100%" }} className="mapSqueal"></div>
                </div>
            ) : (
                <p>Loading geolocation...</p>
            )}
        </div>
    );
};

export default Geolocation;