import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { generateSonarTargets, SonarTarget } from './lib/sonar';

// Cervo coordinates
const CERVO_CENTER: [number, number] = [43.9261, 8.1136];
// Root of radar in the sea closer to Cervo coast
const RADAR_ROOT: [number, number] = [43.9200, 8.1180];

const RadarSweep = ({ isActive }: { isActive: boolean }) => {
  const map = useMap();
  
  const sweepIcon = useMemo(() => {
    return L.divIcon({
      className: '', 
      html: `
        <div class="radar-sweep-container ${isActive ? '' : 'hidden'}">
          <div class="radar-sweep ${isActive ? 'radar-sweep-animate' : ''}"></div>
        </div>
      `,
      iconSize: [0, 0], 
      iconAnchor: [0, 0]
    });
  }, [isActive]);

  return <Marker position={RADAR_ROOT} icon={sweepIcon} interactive={false} zIndexOffset={400} />;
};

export default function App() {
  const [isActive, setIsActive] = useState(false);
  const targets = useMemo(() => generateSonarTargets(RADAR_ROOT[0], RADAR_ROOT[1], 2000, 45), []);

  const handleToggleRadar = () => {
    setIsActive(!isActive);
  };

  return (
    <div className="w-full h-screen bg-[#050505] text-[#d1d1d1] font-mono flex flex-col p-4 gap-4 overflow-hidden">
      
      {/* Header Section */}
      <div className="flex justify-between items-center bg-[#0a0a0a] border border-[#222] p-4 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] shrink-0 z-10 relative">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#ff3b3b] tracking-[0.2em] font-bold">PROGETTO: SONAR-X // ISTITUTO NAUTICO ANDREA DORIA (IM)</span>
          <h1 className="text-2xl font-black text-white tracking-tighter">RADAR_NODE_SEC-12</h1>
        </div>
        <div className="flex gap-6 items-center">
          <div className="text-right hidden sm:block">
            <span className="block text-[9px] opacity-40 uppercase">Status Collegamento</span>
            <span className="text-[#ff3b3b] text-xs">● SISTEMA ATTIVO</span>
          </div>
          <div className="h-8 w-[1px] bg-[#222] hidden sm:block"></div>
          <div className="text-right">
            <span className="block text-[9px] opacity-40 uppercase">Coordinate Radar</span>
            <span className="text-white text-xs">43.9200° N / 8.1180° E</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 md:grid-rows-6 gap-4 min-h-0 relative z-0">
        
        {/* Left Control Column */}
        <div className="flex flex-col col-span-1 md:col-span-3 md:row-span-6 gap-4 relative z-10 pointer-events-auto">
          
          {/* Status/Activation UI */}
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-6 flex flex-col shrink-0 shadow-[0_0_20px_rgba(0,0,0,0.8)] h-full">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[12px] font-bold uppercase text-[#fff] tracking-wide">Controllo Radar</span>
              <div className={`w-4 h-4 rounded-full transition-colors ${isActive ? 'bg-[#ff3b3b] shadow-[0_0_10px_rgba(255,59,59,0.8)]' : 'bg-[#ff3b3b] opacity-50'}`}></div>
            </div>
            
            <div className="flex flex-col gap-4">
              <button 
                 onClick={handleToggleRadar}
                 className={`flex-1 py-6 text-center font-black text-[16px] uppercase tracking-widest rounded border transition-all active:scale-95 ${
                 isActive 
                   ? 'text-black border-[#ff3b3b] bg-[#ff3b3b] shadow-[0_0_20px_rgba(255,59,59,0.5)]' 
                   : 'text-[#ff3b3b] border-[#ff3b3b] hover:bg-[#ff3b3b] hover:text-black shadow-[0_0_15px_rgba(255,59,59,0.2)] hover:shadow-[0_0_30px_rgba(255,59,59,0.6)]'
              }`}>
                {isActive ? 'DISATTIVA SCANSIONE' : 'AVVIA RADAR'}
              </button>
            </div>

            {isActive && (
              <div className="mt-6 flex gap-4 text-[10px] text-[#ff3b3b] animate-pulse">
                <span>SCANSIONE IN CORSO...</span>
                <span>RILEVAMENTI: {targets.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Central Map Area */}
        <div className="col-span-1 md:col-span-9 md:row-span-6 bg-[#000] border border-[#222] rounded-lg relative overflow-hidden h-[40vh] md:h-auto z-0 flex flex-col">
          {/* Custom Map Grid Overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none z-[400]" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          {/* Coastal Outline Label Overlay */}
          <div className="absolute top-6 left-6 text-[10px] border border-[#ff3b3b]/30 px-2 py-1 bg-black/80 text-[#ff3b3b] z-[400] pointer-events-none shadow-[0_0_10px_rgba(255,59,59,0.2)] rounded backdrop-blur-md">
            SETTORE: GOLFO DI CERVO
          </div>
          
          <MapContainer 
            center={CERVO_CENTER} 
            zoom={14} 
            zoomControl={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            className="w-full h-full z-0 relative focus:outline-none"
            attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
            
            <RadarSweep isActive={isActive} />

            {/* Render Targets */}
            {targets.map((pt) => {
              // The sweep takes 4s to rotate. We use animation-delay based on the target's angle
              const delay = (pt.angle / 360) * 4;
              const uniqueClass = `ping-${pt.id}`;
              const isMajor = pt.type === 'major_anomaly';
              
              if (isMajor) {
                const majorIcon = L.divIcon({
                  className: '',
                  html: `
                    <div class="major-anomaly-dot ${isActive ? 'ping-active-major' : ''}" style="animation-delay: ${delay}s !important"></div>
                  `,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                });
                return <Marker key={pt.id} position={[pt.lat, pt.lng]} icon={majorIcon} interactive={false} zIndexOffset={500} />;
              }

              const color = '#ff3b3b';
              const radius = pt.radius * 2;
              const pingAnimClass = isActive ? 'ping-active' : '';

              return (
                <Circle 
                  key={pt.id}
                  center={[pt.lat, pt.lng]}
                  radius={radius}
                  pathOptions={{ 
                      color: color, 
                      fillColor: color, 
                      fillOpacity: 1, // CSS handles visibility
                      stroke: false,
                      className: `sonar-ping ${uniqueClass} ${pingAnimClass}`
                  }}
                >
                  <style>
                    {`
                      .${uniqueClass} {
                        /* Force specific delay for this ping so it aligns with rotation */
                        animation-delay: ${delay}s !important;
                        visibility: ${isActive ? 'visible' : 'hidden'};
                      }
                    `}
                  </style>
                </Circle>
              );
            })}
          </MapContainer>
        </div>

      </div>
    </div>
  );
}
