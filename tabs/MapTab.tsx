
import React, { useState, useMemo } from 'react';
import { Major } from '../types';
import { SHANGHAI_BOUNDS } from '../constants';
import { MAJORS_DATA } from '../data';

interface MapTabProps {
  selectedMajor: Major | null;
  onClearSelection: () => void;
  onSelectMajorFromMap: (m: Major) => void;
}

const MapTab: React.FC<MapTabProps> = ({ selectedMajor, onClearSelection, onSelectMajorFromMap }) => {
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
    const x = ((lng - SHANGHAI_BOUNDS.lngMin) / (SHANGHAI_BOUNDS.lngMax - SHANGHAI_BOUNDS.lngMin)) * 100;
    const y = 100 - ((lat - SHANGHAI_BOUNDS.latMin) / (SHANGHAI_BOUNDS.latMax - SHANGHAI_BOUNDS.latMin)) * 100;
    return { x: `${x}%`, y: `${y}%` };
  };

  const getScoreColor = (score: number) => {
    if (score >= 650) return '#FF0844'; // Hottest
    if (score >= 620) return '#FDA085'; // Hot
    if (score >= 590) return '#F6D365'; // Mid
    return '#38F9D7'; // Safe
  };

  const selectedGroup = useMemo(() => {
    if (!selectedMajor) return null;
    const key = `${selectedMajor.vocCoord.lat.toFixed(4)}-${selectedMajor.vocCoord.lng.toFixed(4)}`;
    return schoolGroups[key] || [selectedMajor];
  }, [selectedMajor, schoolGroups]);

  return (
    <div className="relative h-full w-full bg-[#F0F2F5] overflow-hidden">
      {/* SHANGHAI Map Base (Simplified) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-[90%] h-[90%] fill-white stroke-slate-200 stroke-[0.3]">
           <path d="M 30 10 Q 55 0 80 15 T 95 45 Q 98 75 75 95 T 25 85 Q 5 55 30 10 Z" />
           <text x="40" y="55" fontSize="6" className="fill-slate-100 font-black uppercase tracking-widest">Shanghai GIS</text>
        </svg>
      </div>

      {/* School Markers */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {(Object.entries(schoolGroups) as [string, Major[]][]).map(([key, majors]) => {
          const first = majors[0];
          const pos = project(first.vocCoord.lat, first.vocCoord.lng);
          const avgScore = majors.reduce((acc, curr) => acc + curr.scores[2024].min, 0) / majors.length;
          const color = getScoreColor(avgScore);
          const isSelected = selectedMajor && `${selectedMajor.vocCoord.lat.toFixed(4)}-${selectedMajor.vocCoord.lng.toFixed(4)}` === key;
          
          return (
            <div key={key} className="absolute pointer-events-auto cursor-pointer"
              style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
              onClick={() => onSelectMajorFromMap(first)}>
              <div 
                className={`w-4 h-4 rounded-full border-2 border-white shadow-xl transition-all ${isSelected ? 'scale-[2] ring-8 ring-black/5' : 'hover:scale-150'}`}
                style={{ background: color }} 
              />
              {isSelected && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-xl shadow-lg border border-slate-50 whitespace-nowrap animate-bounce">
                   <p className="text-[10px] font-black text-black">{first.vocationalSchool}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Detail Drawer */}
      <div className="absolute bottom-6 left-5 right-5 z-20">
        {selectedGroup ? (
          <div className="bg-white/95 backdrop-blur-xl p-6 rounded-[32px] shadow-2xl border border-white animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <p className="text-[9px] font-black text-slate-300 mb-1 tracking-widest uppercase">
                  招生代码 {selectedGroup[0].schoolCode} · {selectedGroup[0].district}区
                </p>
                <h2 className="text-xl font-black text-black leading-tight">{selectedGroup[0].vocationalSchool}</h2>
                <p className="text-[11px] font-bold text-slate-400 mt-1">{selectedGroup[0].address}</p>
              </div>
              <button onClick={onClearSelection} className="p-2.5 bg-slate-50 rounded-full text-slate-300">✕</button>
            </div>
            
            <div className="max-h-[35vh] overflow-y-auto hide-scrollbar space-y-2 mt-4">
              {selectedGroup.map(m => (
                <div key={m.id} className="bg-slate-50/50 p-4 rounded-2xl border border-white hover:bg-white hover:shadow-sm transition-all">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-black text-black">{m.name}</span>
                      <span className="text-sm font-black text-[#FF0844]">{m.scores[2024].min}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400">本科贯通：{m.undergradSchool}</p>
                      <span className="text-[9px] font-black px-2 py-0.5 bg-white rounded-full text-slate-300 shadow-sm">{m.subjectType}</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="bg-white glass px-8 py-3 rounded-full text-[10px] font-black text-slate-400 shadow-xl border border-white animate-float">
              点击地图标点探索 <span className="text-black">35 个上海中本贯通校区</span>
            </div>
          </div>
        )}
      </div>

      {/* Legend - Candy Style */}
      <div className="absolute top-5 right-5 flex flex-col gap-3 bg-white/70 backdrop-blur-md p-4 rounded-[28px] shadow-sm border border-white/50">
        <p className="text-[8px] font-black text-slate-300 tracking-widest uppercase mb-1">2025 热力建议</p>
        {[[650, '极热门', '#FF0844'], [620, '高竞争', '#FDA085'], [590, '适中', '#F6D365'], [0, '稳健', '#38F9D7']].map(([val, label, col]) => (
          <div key={label} className="flex items-center gap-2">
             <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: col as string }} />
             <span className="text-[9px] font-black text-black">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapTab;
