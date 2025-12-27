
import React from 'react';
import { Major } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface FavoritesTabProps {
  favorites: Major[];
  setFavorites: (f: Major[]) => void;
  userScore: number;
}

const FavoritesTab: React.FC<FavoritesTabProps> = ({ favorites, setFavorites, userScore }) => {
  const sortedFavs = [...favorites].sort((a, b) => b.scores[2024].min - a.scores[2024].min);

  return (
    <div className="h-full flex flex-col p-5 overflow-hidden bg-[#F8F9FB]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-black tracking-tight">志愿收藏夹</h1>
        <div className="bg-white glass border border-white px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 shadow-sm">
          项目容量 {favorites.length}/10
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4 pb-24">
        {favorites.length === 0 ? (
          <div className="py-28 text-center space-y-6">
            <div className="w-24 h-24 bg-white glass rounded-full flex items-center justify-center mx-auto text-4xl shadow-sm">⭐</div>
            <p className="text-sm font-black text-slate-300 leading-relaxed uppercase tracking-widest">
              您的星航图尚未标定<br/>请在百科库中点亮收藏
            </p>
          </div>
        ) : (
          sortedFavs.map((m, index) => {
            const score2024 = m.scores[2024].min;
            const gap = userScore > 0 ? userScore - score2024 : null;
            
            return (
              <div key={m.id} className="bg-white glass rounded-[32px] p-6 relative overflow-hidden card-shadow group border border-white/60">
                <div className="absolute top-0 left-0 w-2 h-full" style={{ background: CATEGORY_COLORS[m.category] }} />
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">意向 #0{index + 1}</span>
                    <h2 className="text-lg font-black text-black leading-tight mt-1">{m.name}</h2>
                    <p className="text-[11px] font-bold text-slate-400 mt-1">{m.vocationalSchool}</p>
                  </div>
                  <button 
                    onClick={() => setFavorites(favorites.filter(f => f.id !== m.id))}
                    className="p-3 bg-slate-50 rounded-full text-slate-200 hover:text-red-400 hover:bg-red-50 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/50 border border-white p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-300 mb-1 uppercase tracking-tighter">贯通基准线</p>
                    <p className="text-2xl font-black text-black">{score2024}</p>
                  </div>
                  <div className="bg-slate-50/50 border border-white p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-300 mb-1 uppercase tracking-tighter">预测安全度</p>
                    {gap !== null ? (
                      <p className={`text-2xl font-black ${gap >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {gap >= 0 ? `+${gap.toFixed(1)}` : gap.toFixed(1)}
                      </p>
                    ) : (
                      <p className="text-[10px] font-black text-slate-200 italic mt-1">分数待补充</p>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400">{m.district}区</span>
                  <span className="px-3 py-1 bg-indigo-50/50 rounded-lg text-[9px] font-black text-indigo-400">贯通: {m.undergradSchool}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {favorites.length > 0 && (
        <div className="absolute bottom-8 left-6 right-6">
          <button className="w-full py-5 bg-black text-white rounded-[28px] text-sm font-black shadow-xl active:scale-95 transition-all candy-shadow">
            导出 2025 志愿建议 PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default FavoritesTab;
