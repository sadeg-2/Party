import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjUxNDViOGNjN2RiZTQwNzM5NGQwODY5MGZiNTNlODUyIiwiaCI6Im11cm11cjY0In0=';
const PARTY_LAT = 31.433592;
const PARTY_LNG = 34.370518;
const DEFAULT_START_LAT = 31.514547;
const DEFAULT_START_LNG = 34.450894;

const partyIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:44px;height:44px;border-radius:50%;
    background:linear-gradient(135deg,#d4af37,#f3d498);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 20px rgba(212,175,55,.6),0 4px 16px rgba(0,0,0,.4);
    font-size:22px;animation:pinPulse 2s infinite;
  ">🎉</div>
  <style>@keyframes pinPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}</style>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -26],
});

const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;border-radius:50%;
    background:#3b82f6;border:3px solid #fff;
    box-shadow:0 0 12px rgba(59,130,246,.7);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [status, setStatus] = useState<'loading' | 'route' | 'error' | 'ready'>('loading');
  const [isDefault, setIsDefault] = useState(false);

  const fetchRoute = async (map: L.Map, startLat: number, startLng: number, isFallback = false) => {
    setStatus('route');
    setIsDefault(isFallback);

    // Add marker for start
    L.marker([startLat, startLng], { icon: userIcon })
      .addTo(map)
      .bindPopup(isFallback ? '📍 نقطة انطلاق مقترحة' : '📍 موقعك الحالي');

    try {
      const res = await fetch(
        `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${startLng},${startLat}&end=${PARTY_LNG},${PARTY_LAT}`
      );
      const data = await res.json();

      if (data.features && data.features.length > 0) {
        const coords: [number, number][] = data.features[0].geometry.coordinates.map(
          (c: number[]) => [c[1], c[0]] as [number, number]
        );

        // Glow line
        L.polyline(coords, {
          color: '#d4af37',
          weight: 8,
          opacity: 0.25,
          lineCap: 'round',
        }).addTo(map);

        // Main route line
        const routeLine = L.polyline(coords, {
          color: '#d4af37',
          weight: 4,
          opacity: 0.9,
          lineCap: 'round',
          dashArray: '12 8',
        }).addTo(map);

        map.fitBounds(routeLine.getBounds(), { padding: [60, 60] });

        let offset = 0;
        const el = (routeLine as any)._path;
        if (el) {
          const animate = () => {
            offset -= 1;
            el.style.strokeDashoffset = String(offset);
            requestAnimationFrame(animate);
          };
          animate();
        }

        const summary = data.features[0].properties?.summary;
        if (summary) {
          const km = (summary.distance / 1000).toFixed(1);

          const infoDiv = L.DomUtil.create('div');
          infoDiv.innerHTML = `
            <div style="
              position:absolute;top:16px;right:16px;z-index:1000;
              background:rgba(6,10,20,.85);backdrop-filter:blur(10px);
              border:1px solid rgba(212,175,55,.3);border-radius:1rem;
              padding:12px 20px;color:#f3d498;font-family:Cairo,sans-serif;
              direction:rtl;font-size:.9rem;
              box-shadow:0 8px 24px rgba(0,0,0,.4);
            ">
              <div style="font-weight:700;margin-bottom:4px">🚗 المسافة: ${km} كم</div>
              ${isFallback ? '<div style="font-size:.7rem;margin-top:4px;color:#8b9cc0">*(من موقع افتراضي)</div>' : ''}
            </div>`;

          mapRef.current?.appendChild(infoDiv.firstElementChild as HTMLElement);
        }
      }
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [PARTY_LAT, PARTY_LNG],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });
    mapInstance.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const partyMarker = L.marker([PARTY_LAT, PARTY_LNG], { icon: partyIcon }).addTo(map);
    partyMarker.bindPopup(`
      <div style="font-family:Cairo,sans-serif;text-align:center;direction:rtl;padding:4px 0">
        <h3 style="margin:0 0 6px;font-size:1.1rem;color:#3b82f6">سهرة الشباب 🎵</h3>
        <p style="margin:4px 0;color:#333;font-size:.9rem"><b>ليلة الطرب والسمر</b></p>
        <p style="margin:4px 0;color:#555;font-size:.85rem">📅 الخميس 09/04/2026</p>
        <p style="margin:4px 0;color:#555;font-size:.85rem">🕐 8:00 مساءً</p>
        <p style="margin:4px 0;color:#555;font-size:.85rem">📍 الزوايدة - ترنس البابا - مقابل مصنع فنونة</p>
      </div>
    `).openPopup();

    if (!navigator.geolocation) {
      fetchRoute(map, DEFAULT_START_LAT, DEFAULT_START_LNG, true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => fetchRoute(map, pos.coords.latitude, pos.coords.longitude),
      () => fetchRoute(map, DEFAULT_START_LAT, DEFAULT_START_LNG, true),
      { enableHighAccuracy: true, timeout: 8000 }
    );

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <div className="map-wrapper">
      <div
        ref={mapRef}
        className="map-container"
      />
      {(status === 'loading' || status === 'route') && (
        <div className="map-status-overlay">
          {status === 'loading' ? '📍 جارٍ تحديد موقعك...' : '🗺️ جارٍ رسم أفضل مسار...'}
        </div>
      )}
      {isDefault && status === 'ready' && (
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
          background: 'rgba(6,10,20,.85)', border: '1px solid rgba(212,175,55,.3)',
          borderRadius: '1rem', padding: '10px 20px',
          color: '#f3d498', fontFamily: 'Cairo', fontSize: '.85rem', whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,.5)',
        }}>
          💡 يظهر المسار من نقطة مقترحة (لعدم مشاركة الموقع)
        </div>
      )}
    </div>
  );
}

export default React.memo(InteractiveMap);

