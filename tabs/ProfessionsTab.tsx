
import React, { useState, useMemo } from 'react';
import { Major, Category } from '../types';
import { MAJORS_DATA } from '../data';
import { CATEGORY_COLORS } from '../constants';

interface ProfessionsTabProps {
  onSelectMajor: (major: Major) => void;
  favorites: Major[];
  toggleFavorite: (major: Major) => void;
}

const PAGE_SIZE = 10;
type ScoreRange = '全部' | '640分以上' | '600-640分' | '600分以下';

const ProfessionsTab: React.FC<ProfessionsTabProps> = ({ onSelectMajor, favorites, toggleFavorite }) => {
  const [activeCategory, setActiveCategory] = useState<Category | '全部'>('全部');
  const [scoreFilter, setScoreFilter] = useState<ScoreRange>('全部');
  const [subjectType, setSubjectType] = useState<'全部' | '理科' | '文科' | '综合'>('全部');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return MAJORS_DATA.filter(m => {
      // Category Filter
      const matchCat = activeCategory === '全部' || m.category === activeCategory;
      
      // Subject Filter
      const matchSub = subjectType === '全部' || m.subjectType === subjectType;
      
      // Score Filter
      const score = m.scores[2024].min;
      let matchScore = true;
      if (scoreFilter === '640分以上') matchScore = score >= 640;
      else if (scoreFilter === '600-640分') matchScore = score >= 600 && score < 640;
      else if (scoreFilter === '600分以下') matchScore = score < 600;

      return matchCat && matchSub && matchScore;
    });
  }, [activeCategory, subjectType, scoreFilter]);

  const displayed = filtered.slice(0, page * PAGE_SIZE);

  return (
    <div className="flex flex-col h-full bg-[#F2F2F7]">
      {/* Apple-style Header */}
      <div className="px-5 pt-4 pb-2 z-20 sticky top-0 bg-[#F2F2F7]/90 backdrop-blur-xl">
        <h1 className="text-2xl font-bold text-black mb-3">专业库</h1>

        {/* Filter Scroll Container */}
        <div className="flex flex-col gap-3">
          
          {/* Row 1: Category Pills */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            <button onClick={() => { setActiveCategory('全部'); setPage(1); }} className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${activeCategory === '全部' ? 'bg-[#1D1D1F] text-white shadow-md' : 'bg-white text-gray-500 shadow-sm'}`}>全部</button>
            {Object.values(Category).map(cat => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setPage(1); }} 
                className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all shadow-sm`}
                style={{ background: activeCategory === cat ? CATEGORY_COLORS[cat] : '#FFFFFF', color: activeCategory === cat ? 'black' : '#6E6E73' }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Row 2: Functional Filters (Subject & Score) */}
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
             {/* Subject Switch */}
             <div className="flex bg-white rounded-full p-1 shadow-sm shrink-0">
               {['全部', '理科', '文科', '综合'].map(t => (
                 <button key={t} onClick={() => setSubjectType(t as any)} 
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${subjectType === t ? 'bg-[#F2F2F7] text-black shadow-sm' : 'text-gray-400'}`}>
                   {t}
                 </button>
               ))}
             </div>

             {/* Score Dropdown Simulation */}
             <div className="flex bg-white rounded-full p-1 shadow-sm shrink-0">
               {['全部', '640分以上', '600-640分', '600分以下'].map(s => (
                  <button key={s} onClick={() => setScoreFilter(s as any)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap ${scoreFilter === s ? 'bg-[#007AFF] text-white shadow-sm' : 'text-gray-400'}`}>
                    {s}
                  </button>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-32 pt-2 space-y-3">
        {displayed.map(major => {
          const score2025 = major.scores[2024].min; // Using 2024 data as placeholder for 2025 as per current data structure
          const isExpanded = expandedId === major.id;

          return (
            <div key={major.id} className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-300">
              <div className="p-5 cursor-pointer flex items-start justify-between active:bg-gray-50" onClick={() => setExpandedId(isExpanded ? null : major.id)}>
                
                {/* Left: Info */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-gray-100 rounded-md text-[10px] font-bold text-gray-500">代码 {major.schoolCode}</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded-md text-[10px] font-bold text-gray-500">{major.subjectType}</span>
                    <div className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[major.category] }} />
                  </div>
                  <h3 className="text-[17px] font-bold text-[#1D1D1F] leading-tight">{major.name}</h3>
                  <p className="text-[13px] font-medium text-[#86868B]">{major.vocationalSchool}</p>
                </div>

                {/* Right: Score */}
                <div className="flex flex-col items-end">
                   <p className="text-[10px] font-bold text-[#86868B] mb-0.5">25分数线</p>
                   <p className="text-[22px] font-bold text-[#1D1D1F] tracking-tight">{score2025}</p>
                </div>
              </div>

              {/* Expanded Detail View */}
              {isExpanded && (
                <div className="px-5 pb-5 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="h-px w-full bg-gray-100 mb-4" />
                  
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-3 bg-[#F2F2F7] rounded-xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">贯通本科</p>
                      <p className="text-[13px] font-bold text-[#1D1D1F]">{major.undergradSchool}</p>
                    </div>
                    <div className="p-3 bg-[#F2F2F7] rounded-xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">学费标准</p>
                      <p className="text-[13px] font-bold text-[#1D1D1F]">{major.tuition === '0' ? '免学费' : `${major.tuition}元/年`}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(major); }} 
                      className={`flex-1 h-11 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all ${favorites.find(f => f.id === major.id) ? 'bg-[#FF2D55] text-white shadow-lg shadow-red-200' : 'bg-white border border-gray-200 text-gray-600'}`}>
                      {favorites.find(f => f.id === major.id) ? (
                        <><span>✓</span> 已收藏</>
                      ) : (
                        <><span>+</span> 加入收藏</>
                      )}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSelectMajor(major); }} 
                      className="flex-1 h-11 bg-[#007AFF] text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-200 flex items-center justify-center">
                      地图定位
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length > displayed.length && (
          <button onClick={() => setPage(p => p + 1)} className="w-full py-4 text-[13px] font-bold text-gray-400 bg-white rounded-2xl shadow-sm hover:bg-gray-50 transition-all">
            加载更多专业...
          </button>
        )}
        
        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-sm font-medium">没有找到符合条件的专业</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionsTab;
