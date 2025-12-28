
import React from 'react';
import { Major } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface FavoritesTabProps {
  favorites: Major[];
  setFavorites: (f: Major[]) => void;
  userScore: number;
}

const Sparkline: React.FC<{ scores: { '2023': number; '2024': number; '2025': number } }> = ({ scores }) => {
    const data = [scores['2023'], scores['2024'], scores['2025']];
    const validData = data.filter(s => s > 0);
    if (validData.length < 2) return null;
  
    const min = Math.min(...validData) - 5;
    const max = Math.max(...validData) + 5;
    const height = 20;
    const width = 40;
    
    const points = data.map((val, idx) => {
      if (val === 0) return null;
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / (max - min)) * height;
      return `${x},${y}`;
    }).filter(p => p).join(' ');
  
    const lastVal = data[2];
    const prevVal = data[1] || data[0];
    const color = lastVal >= prevVal ? '#10B981' : '#EF4444'; // Green for up/flat, Red for down
  
    return (
      <svg width={width} height={height} className="overflow-visible opacity-80">
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={width} cy={height - ((lastVal - min) / (max - min)) * height} r="2" fill={color} />
      </svg>
    );
  };

const FavoritesTab: React.FC<FavoritesTabProps> = ({ favorites, setFavorites, userScore }) => {
  const sortedFavs = [...favorites].sort((a, b) => b.scores['2025'] - a.scores['2025']);

  return (
    <div className="flex flex-col h-full bg-[#F2F2F7]">
      {/* Compressed Header */}
      <div className="bg-white px-4 py-3 shadow-sm z-20 flex justify-between items-center h-[10%] max-h-16">
        <h1 className="text-lg font-bold text-black tracking-tight">志愿收藏夹</h1>
        <div className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-bold text-gray-500">
          已选 {favorites.length}/10
        </div>
      </div>

      {/* List Content (90%) */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-2 py-2 space-y-2 h-[90%]">
        {favorites.length === 0 ? (
          <div className="py-28 text-center space-y-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-2xl shadow-sm grayscale opacity-50">⭐</div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              暂无收藏专业
            </p>
          </div>
        ) : (
          sortedFavs.map((major) => {
            const score2025 = major.scores['2025'];
            // If userScore is 0 (unfilled), we might show a placeholder or nothing. 
            // Assuming 0 means 'not filled yet', but previous logic handles 0 as 650 only in report.
            // Here, if 0, we can just hide the trend or assume 650 if consistent.
            // Let's assume userScore is real input. If 0, don't show trend.
            const gap = userScore > 0 ? userScore - score2025 : null;
            
            return (
              <div key={major.id} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between">
                 <div className="flex-1 min-w-0 pr-2">
                   <div className="flex items-center gap-2 mb-0.5">
                     <span className="text-[13px] font-extrabold text-[#1D1D1F] truncate">{major.name}</span>
                     <span className="text-[9px] px-1 rounded text-white font-bold" style={{ background: CATEGORY_COLORS[major.category] }}>
                       {major.category.charAt(0)}
                     </span>
                   </div>
                   <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                      <span className="truncate max-w-[100px]">{major.vocationalSchool}</span>
                      <span>•</span>
                      <span className="truncate max-w-[80px] text-blue-500">{major.undergradSchool}</span>
                   </div>
                   <div className="flex items-center gap-2 mt-1">
                      <Sparkline scores={major.scores} />
                      {gap !== null && (
                          <span className={`text-[10px] font-bold ${gap >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {gap >= 0 ? `稳 +${gap}` : `冲 ${gap}`}
                          </span>
                      )}
                   </div>
                 </div>
     
                 <div className="flex items-center gap-3">
                   <div className="text-right">
                     <div className="text-[15px] font-black text-[#1D1D1F] leading-none">{score2025}</div>
                     <div className="flex flex-col text-[8px] text-gray-400 mt-0.5 text-right">
                        <span>25年分数线</span>
                        <span className="scale-90 origin-right opacity-60">24:{major.scores['2024'] || '-'} / 23:{major.scores['2023'] || '-'}</span>
                     </div>
                   </div>
                   
                   <button 
                     onClick={() => setFavorites(favorites.filter(f => f.id !== major.id))}
                     className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-500"
                   >
                      <span className="text-lg leading-none">♥</span>
                   </button>
                 </div>
               </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FavoritesTab;
