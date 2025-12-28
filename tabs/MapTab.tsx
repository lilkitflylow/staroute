
import React, { useState, useMemo } from 'react';
import { Major } from '../types';
import { MAJORS_DATA } from '../data';

interface MapTabProps {
  selectedMajor: Major | null;
  onClearSelection: () => void;
  onSelectMajorFromMap: (m: Major) => void;
}

const MapTab: React.FC<MapTabProps> = ({ selectedMajor, onClearSelection, onSelectMajorFromMap }) => {
  // Use all data to populate the map with 35 points
  const schoolGroups = useMemo(() => {
    const groups: Record<string, Major[]> = {};
    MAJORS_DATA.forEach(m => {
      const key = `${m.vocCoord.lat.toFixed(4)}-${m.vocCoord.lng.toFixed(4)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return groups;
  }, []);

  const project = (lat: number, lng: number) => {
    // slightly adjust projection to fit generated points
    const x = ((lng - 121.2) / (121.8 - 121.2)) * 100; 
    const y = 100 - ((lat - 31.0) / (31.4 - 31.0)) * 100;
    return { x: `${Math.max(5, Math.min(95, x))}%`, y: `${Math.max(5, Math.min(95, y))}%` };
  };

  const selectedGroup = useMemo(() => {
    if (!selectedMajor) return null;
    const key = `${selectedMajor.vocCoord.lat.toFixed(4)}-${selectedMajor.vocCoord.lng.toFixed(4)}`;
    return schoolGroups[key] || [selectedMajor];
  }, [selectedMajor, schoolGroups]);

  return (
    <div className="relative h-full w-full bg-[#F5F5F7] overflow-hidden">
      {/* SHANGHAI Map Base - Open Free Map Style (Simplified Abstract Representation) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40">
        <svg viewBox="0 0 100 100" className="w-[120%] h-[120%]">
           {/* Abstract Landmass/Districts - Made darker for visibility */}
           <path d="M 20 20 Q 50 10 80 30 T 90 80" fill="none" stroke="#A1A1AA" strokeWidth="1" strokeDasharray="4 2" />
           <path d="M 10 60 Q 40 50 90 55" fill="none" stroke="#A1A1AA" strokeWidth="1" />
           <path d="M 40 0 V 100" fill="none" stroke="#A1A1AA" strokeWidth="1" strokeDasharray="4 2" />
           <path d="M 0 40 H 100" fill="none" stroke="#A1A1AA" strokeWidth="1" />
           {/* Huangpu River approximation */}
           <path d="M 45 20 Q 55 40 50 60 T 60 90" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.6" />
           <text x="50" y="50" fontSize="8" className="fill-gray-400 font-bold opacity-50" textAnchor="middle">SHANGHAI</text>
        </svg>
      </div>

      {/* 35 Schools Markers */}
      <div className="absolute inset-0 z-10">
        {(Object.entries(schoolGroups) as [string, Major[]][]).map(([key, majors]) => {
          const first = majors[0];
          const pos = project(first.vocCoord.lat, first.vocCoord.lng);
          const isSelected = selectedMajor && `${selectedMajor.vocCoord.lat.toFixed(4)}-${selectedMajor.vocCoord.lng.toFixed(4)}` === key;
          
          return (
            <div key={key} className="absolute cursor-pointer transition-all duration-500"
              style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
              onClick={() => onSelectMajorFromMap(first)}>
              
              {/* Dot Marker */}
              <div className={`relative flex items-center justify-center`}>
                 <div className={`rounded-full shadow-sm transition-all duration-300 ${isSelected ? 'w-5 h-5 bg-black z-20 scale-125 ring-4 ring-black/10' : 'w-2.5 h-2.5 bg-gray-500 hover:bg-gray-700 hover:scale-150'}`} />
                 {isSelected && <div className="absolute w-10 h-10 bg-black/10 rounded-full animate-ping" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Info Drawer */}
      <div className="absolute bottom-5 left-4 right-4 z-20">
        {selectedGroup ? (
          <div className="bg-white p-4 rounded-[20px] shadow-xl border border-gray-100 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-base font-black text-black">{selectedGroup[0].vocationalSchool}</h2>
                <p className="text-[10px] text-gray-500 mt-0.5">{selectedGroup[0].address}</p>
              </div>
              <button onClick={onClearSelection} className="w-6 h-6 bg-gray-100 rounded-full text-xs text-gray-500">✕</button>
            </div>
            <div className="max-h-[200px] overflow-y-auto hide-scrollbar space-y-2 mt-3">
              {selectedGroup.map(m => (
                <div key={m.id} className="bg-gray-50 p-2.5 rounded-xl flex justify-between items-center">
                   <div>
                      <div className="text-xs font-extrabold text-[#1D1D1F]">{m.name}</div>
                      <div className="text-[9px] text-blue-500 font-bold mt-0.5">本科: {m.undergradSchool}</div>
                   </div>
                   <div className="text-right">
                      <span className="text-sm font-black text-[#1D1D1F]">{m.scores['2025']}</span>
                      <span className="text-[8px] text-gray-400 block scale-90 origin-right">25年</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <span className="bg-white/80 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold text-gray-500 shadow-sm border border-white/50">
              全上海 35 所中职校区分布
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapTab;
