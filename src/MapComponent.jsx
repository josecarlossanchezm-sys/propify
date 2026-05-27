import { useEffect, useRef } from "react";
export default function MapComponent({ location, lat = 19.432, lng = -99.133 }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  useEffect(() => {
    if (!window.google || mapInstance.current) return;
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng }, zoom: 15,
    });
    new window.google.maps.Marker({
      position: { lat, lng }, map: mapInstance.current, title: location,
    });
  }, [lat, lng]);
  return <div ref={mapRef} style={{ width:"100%", height:240, borderRadius:14, border:"1px solid #ddd" }} />;
}
