import React, {useCallback} from 'react';
import {useMapEvents} from "react-leaflet";

function EventLayer({onClick, onZoom}) {
    useMapEvents({
        click: useCallback((e) => {
            if(onClick || e.latlng) {
                onClick(e.latlng);
            }
            console.log("Map on click:", e.latlng);
        }, [onClick]),
        zoom: useCallback((e) => {
            const zoomLevel = e.target.getZoom();
            if(onZoom) {
                onZoom(zoomLevel);
            }
            console.log("Map on zoom level:", zoomLevel);
        }, [onZoom])
    });
    return null;
}

export default EventLayer;