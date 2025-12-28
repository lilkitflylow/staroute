
import React from 'react';
import { TabType } from '../types';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { type: TabType; icon: string; label: string }[] = [
    { type: 'Professions', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', label: '专业库' },
    { type: 'Map', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', label: '星航图' },
    { type: 'Favorites', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', label: '收藏夹' },
    { type: 'Plan', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', label: '星计划' },
  ];

  return (
    <nav className="shrink-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 pb-safe pt-2 px-6 flex justify-between items-center z-50 rounded-t-[20px] shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.type;
        return (
          <button
            key={tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isActive ? 'translate-y-0' : 'translate-y-1'}`}
          >
            <div className={`transition-all duration-300 ${isActive ? 'text-[#007AFF] scale-110' : 'text-[#8E8E93] scale-100'}`}>
              <svg className="w-6 h-6" fill={isActive ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
            </div>
            <span className={`text-[10px] font-medium tracking-tight ${isActive ? 'text-[#007AFF]' : 'text-[#8E8E93]'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
