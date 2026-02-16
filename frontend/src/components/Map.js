import React, { useEffect, useRef, useState } from 'react';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import * as tt from '@tomtom-international/web-sdk-maps';
import * as ttServices from '@tomtom-international/web-sdk-services';

const TOMTOM_API_KEY = 'G66jjsZWdScxvz01UtgCDMwVSqj7cIEp';

const Map = ({ 
  pickup = null, 
  dropoff = null, 
  driverLocation = null,
  showRoute = false,
  height = '400px',
  interactive = true 
}) => {
  const mapElement = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [routeLayer, setRouteLayer] = useState(null);

  // Initialize map
  useEffect(() => {
    if (!mapElement.current || map) return;

    const mapInstance = tt.map({
      key: TOMTOM_API_KEY,
      container: mapElement.current,
      center: driverLocation || pickup || { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
      zoom: 14,
      stylesVisibility: {
        trafficIncidents: true,
        trafficFlow: true,
      }
    });

    mapInstance.addControl(new tt.FullscreenControl());
    mapInstance.addControl(new tt.NavigationControl());
    
    setMap(mapInstance);

    return () => {
      markers.forEach(marker => marker.remove());
      if (routeLayer) routeLayer.remove();
      mapInstance.remove();
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.remove());
    const newMarkers = [];

    // Add pickup marker
    if (pickup) {
      const pickupMarker = new tt.Marker({
        color: '#10b981',
        draggable: false
      })
        .setLngLat([pickup.lng, pickup.lat])
        .setPopup(new tt.Popup().setHTML('<b>Pickup Location</b>'))
        .addTo(map);
      newMarkers.push(pickupMarker);
    }

    // Add dropoff marker
    if (dropoff) {
      const dropoffMarker = new tt.Marker({
        color: '#ef4444',
        draggable: false
      })
        .setLngLat([dropoff.lng, dropoff.lat])
        .setPopup(new tt.Popup().setHTML('<b>Destination</b>'))
        .addTo(map);
      newMarkers.push(dropoffMarker);
    }

    // Add driver marker (if different from pickup)
    if (driverLocation && 
        (!pickup || (driverLocation.lat !== pickup.lat || driverLocation.lng !== pickup.lng))) {
      const driverMarker = new tt.Marker({
        color: '#3b82f6',
        draggable: false
      })
        .setLngLat([driverLocation.lng, driverLocation.lat])
        .setPopup(new tt.Popup().setHTML('<b>Driver</b>'))
        .addTo(map);
      newMarkers.push(driverMarker);
    }

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new tt.LngLatBounds();
      newMarkers.forEach(marker => {
        bounds.extend(marker.getLngLat());
      });
      map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    }
  }, [map, pickup, dropoff, driverLocation]);

  // Draw route between pickup and dropoff
  useEffect(() => {
    if (!map || !pickup || !dropoff || !showRoute) return;

    const drawRoute = async () => {
      // Remove existing route
      if (routeLayer) routeLayer.remove();

      try {
        const response = await ttServices.services.calculateRoute({
          key: TOMTOM_API_KEY,
          locations: [
            [pickup.lng, pickup.lat],
            [dropoff.lng, dropoff.lat]
          ],
          travelMode: 'car'
        });

        if (response && response.routes && response.routes[0]) {
          const geometry = response.routes[0].geometry;
          
          const routeGeoJSON = {
            type: 'Feature',
            geometry: geometry,
            properties: {}
          };

          const newRouteLayer = tt.Layer.geojson({
            data: routeGeoJSON,
            layerOptions: {
              stroke: true,
              color: '#667eea',
              width: 6,
              opacity: 0.8
            }
          });

          map.addLayer(newRouteLayer);
          setRouteLayer(newRouteLayer);
        }
      } catch (error) {
        console.error('Route calculation error:', error);
      }
    };

    drawRoute();
  }, [map, pickup, dropoff, showRoute]);

  return <div ref={mapElement} style={{ height, width: '100%' }} />;
};

export default Map;