"use client"
import { useRef, useEffect, useState } from "react";

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import "leaflet/dist/leaflet.css";


const Map: React.FunctionComponent<
    {
        geolocation: [number, number];
        squealID: string;
    }
> = ({ geolocation, squealID }) => {
    const [map, setMap] = useState<L.Map | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const [mapId, setMapId] = useState<string>(squealID);

    useEffect(() => {
        import("leaflet").then(L => {
            // Fix the bug where the images for the marker are not found
            L.Icon.Default.mergeOptions({
                iconUrl: markerIcon.src,
                iconRetinaUrl: markerIcon2x.src,
                shadowUrl: markerShadow.src,
            });

            if (!mapRef.current) {
                // If map is not initialized, create a new one
                mapRef.current = L.map(mapId, {
                    center: geolocation,
                    zoom: 13,
                    layers: [
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; OpenStreetMap contributors'
                        })
                    ]
                });

                //add marker
                L.marker(geolocation)
                    .bindPopup("Position")
                    .openPopup()
                    .addTo(mapRef.current);

                setMap(mapRef.current);
            } else {
                // If map is already initialized, update its properties
                mapRef.current.setView(geolocation, 13);
            }


        });
    }, [geolocation]);
    return (
        <div className="rounded-md">
            <div id={mapId} className="w-full h-[30vh] mapSqueal rounded-md"></div>
        </div>
    );
}


export default Map;