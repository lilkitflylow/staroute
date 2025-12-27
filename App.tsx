
import React, { useState } from 'react';
import { TabType, Major, UserProfile } from './types';
import Navigation from './components/Navigation';
import ProfessionsTab from './tabs/ProfessionsTab';
import MapTab from './tabs/MapTab';
import FavoritesTab from './tabs/FavoritesTab';
import PlanTab from './tabs/PlanTab';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Professions');
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [favorites, setFavorites] = useState<Major[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    gender: '',
    school: '',
    subjectPreference: '',
    scores: { 
      chinese: 0, 
      math: 0, 
      english: 0, 
      physics: 0, 
      chemistry: 0, 
      history: 0, 
      politics: 0, 
      comprehensive: 0, 
      physical: 0, 
      total: 0 
    },
    mbtiResult: ''
  });

  const toggleFavorite = (major: Major) => {
    setFavorites(prev => {
      const isFav = prev.find(m => m.id === major.id);
      if (isFav) return prev.filter(m => m.id !== major.id);
      if (prev.length >= 10) return prev;
      return [...prev, major];
    });
  };

  const handleMajorSelect = (major: Major) => {
    setSelectedMajor(major);
    setActiveTab('Map');
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8F9FB] overflow-hidden select-none">
      <div className="h-10 shrink-0" />
      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'Professions' && (
          <ProfessionsTab 
            onSelectMajor={handleMajorSelect} 
            favorites={favorites} 
            toggleFavorite={toggleFavorite} 
          />
        )}
        {activeTab === 'Map' && (
          <MapTab 
            selectedMajor={selectedMajor} 
            onClearSelection={() => setSelectedMajor(null)}
            onSelectMajorFromMap={(m) => setSelectedMajor(m)}
          />
        )}
        {activeTab === 'Favorites' && (
          <FavoritesTab 
            favorites={favorites}
            setFavorites={setFavorites}
            userScore={userProfile.scores.total}
          />
        )}
        {activeTab === 'Plan' && (
          <PlanTab 
            userProfile={userProfile} 
            setUserProfile={setUserProfile} 
            favorites={favorites}
            setFavorites={setFavorites}
          />
        )}
      </main>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
