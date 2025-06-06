import React from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';


function Map2DContainer({lon, lat, zoom, height, children}) {
    const TIANDITU_API_KEY = import.meta.env.VITE_TIANDITU_API_KEY;
    
    // Leaflet 使用 [latitude, longitude] 的顺序
    const position = [lat, lon];
    
    return (
    <div className='w-full'>
        <MapContainer 
            center={position} 
            zoom={zoom}
            scrollWheelZoom={false}
            className='w-auto m-8 rounded-2xl'
            style={{ height: height || "500px"}}
        >
            <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {children}
        </MapContainer>
    </div>
    );
}

export default Map2DContainer;