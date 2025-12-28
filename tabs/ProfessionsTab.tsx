
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
type ScoreRange = '全部' | '>640' | '620-640' | '600-620' | '<600';

const Sparkline: React.FC<{ scores: { '2023': number; '2024': number; '2025': number } }> = ({ scores }) => {
  const data = [scores['2023'], scores['2024'], scores['2025']];
  const validData = data.filter(s => s > 0);
  if (validData.length < 2) return null;

  const min = Math.min(...validData) - 5;
  const max = Math.max(...validData) + 5;
  const height = 24;
  const width = 60;
  
  const points = data.map((val, idx) => {
    if (val === 0) return null;
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / (max - min)) * height;
    return `${x},${y}`;
  }).filter(p => p).join(' ');

  const lastVal = data[2];
  const prevVal = data[1] || data[0];
  const color = lastVal >= prevVal ? '#10B981' : '#EF4444';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={height - ((lastVal - min) / (max - min)) * height} r="2.5" fill={color} />
    </svg>
  );
};

const ProfessionsTab: React.FC<ProfessionsTabProps> = ({ onSelectMajor, favorites, toggleFavorite }) => {
  const [activeCategory, setActiveCategory] = useState<Category | '全'>('全');
  const [scoreFilter, setScoreFilter] = useState<ScoreRange>('全部');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = Object.values(Category);

  const filtered = useMemo(() => {
    return MAJORS_DATA.filter(m => {
      const matchCat = activeCategory === '全' || m.category === activeCategory;
      const score = m.scores['2025'];
      let matchScore = true;
      if (scoreFilter === '>640') matchScore = score > 640;
      else if (scoreFilter === '620-640') matchScore = score >= 620 && score <= 640;
      else if (scoreFilter === '600-620') matchScore = score >= 600 && score < 620;
      else if (scoreFilter === '<600') matchScore = score < 600;
      return matchCat && matchScore;
    });
  }, [activeCategory, scoreFilter]);

  const displayed = filtered.slice(0, page * PAGE_SIZE);

  return (
    <div className="flex flex-col h-full bg-[#F2F2F7]">
      {/* 1. Compact Category Filter */}
      <div className="bg-white pb-2 shadow-sm z-20">
        <div className="flex w-full h-16 px-1 pt-2 gap-1 overflow-x-auto hide-scrollbar">
          {/* 'All' Tab */}
          <button 
            onClick={() => { setActiveCategory('全'); setPage(1); }}
            className={`shrink-0 w-10 h-14 rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm ${activeCategory === '全' ? 'bg-black text-white' : 'bg-gray-50 text-gray-400'}`}
          >
             <span className="text-sm font-black">全</span>
          </button>
          
          {/* Categories Tabs */}
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setPage(1); }}
                className={`flex-1 min-w-[3rem] h-14 rounded-xl transition-all duration-300 flex flex-col items-center justify-center shadow-sm ${isActive ? 'scale-105 z-10' : 'opacity-70 grayscale'}`}
                style={{ background: isActive ? CATEGORY_COLORS[cat] : '#F9F9FB' }}
              >
                <div className={`text-[11px] font-bold text-center ${isActive ? 'text-white' : 'text-gray-500'}`}>
                   {cat.substring(0,2)}<br/>{cat.substring(2)}
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Toolbar */}
        <div className="flex justify-between items-center px-4 mt-1">
          <span className="text-[10px] font-bold text-gray-400">共 {filtered.length} 个专业</span>
          <select 
             value={scoreFilter} 
             onChange={(e) => setScoreFilter(e.target.value as ScoreRange)}
             className="bg-gray-100 rounded-md text-[10px] font-bold px-2 py-1 border-none focus:ring-0 text-blue-600"
          >
            <option value="全部">分数不限</option>
            <option value=">640">640分以上</option>
            <option value="620-640">620-640分</option>
            <option value="600-620">600-620分</option>
            <option value="<600">600分以下</option>
          </select>
        </div>
      </div>

      {/* 2. Compressed One-Line List Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-3 py-3 space-y-2.5">
        {displayed.map(major => {
          const isFav = !!favorites.find(f => f.id === major.id);
          const isExpanded = expandedId === major.id;

          return (
            <div key={major.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
                {/* Main Row */}
                <div 
                    onClick={() => setExpandedId(isExpanded ? null : major.id)}
                    className="px-4 py-3.5 flex items-center justify-between active:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center flex-1 min-w-0 gap-3">
                    {/* Name */}
                    <div className="w-[4.5rem] shrink-0">
                        <span className="text-[13px] font-extrabold text-[#1D1D1F] block truncate">{major.name}</span>
                    </div>

                    {/* Schools (Combined) */}
                    <div className="flex-1 min-w-0 flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                       <span className="truncate max-w-[6rem]">{major.vocationalSchool}</span>
                       <span className="text-gray-300">/</span>
                       <span className="truncate max-w-[6rem] text-blue-600">{major.undergradSchool}</span>
                    </div>
                  </div>

                  {/* Score & Star */}
                  <div className="shrink-0 flex items-center gap-3 pl-2 border-l border-gray-100 ml-2">
                      <div className="text-right">
                        <span className="text-[15px] font-black text-[#1D1D1F] block leading-none">{major.scores['2025']}</span>
                        <span className="text-[8px] text-gray-400 block mt-0.5">25年</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(major); }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${isFav ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-300 hover:bg-gray-100'}`}
                      >
                         <span className="text-base leading-none">{isFav ? '♥' : '♡'}</span>
                      </button>
                  </div>
                </div>

                {/* Inline Expanded Dropdown Card */}
                {isExpanded && (
                    <div className="bg-gray-50/50 border-t border-gray-100 px-5 py-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <span className="text-[10px] text-gray-400 block mb-0.5">专业名称</span>
                                <span className="text-sm font-bold text-black">{major.professionalName}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 block mb-0.5">志愿名称</span>
                                <span className="text-sm font-bold text-black">{major.name}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 block mb-0.5">招生代码</span>
                                <span className="text-sm font-mono font-bold text-gray-600 tracking-wider">{major.id}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-gray-400 block mb-0.5">中职/本科院校</span>
                                <span className="text-xs font-bold text-gray-700">{major.vocationalSchool} <span className="text-gray-300 mx-1">➔</span> {major.undergradSchool}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 mb-3">
                             <div className="space-y-1">
                                <span className="text-[10px] font-bold text-gray-400">分数趋势 (23-25)</span>
                                <div className="text-[10px] font-medium text-gray-500 space-x-2">
                                    <span>23: {major.scores['2023'] || '-'}</span>
                                    <span>24: {major.scores['2024'] || '-'}</span>
                                    <span className="text-black font-bold">25: {major.scores['2025']}</span>
                                </div>
                             </div>
                             <Sparkline scores={major.scores} />
                        </div>

                        <div className="flex justify-end gap-2">
                             <button className="px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 shadow-sm"
                                onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                             >
                                收起
                             </button>
                        </div>
                    </div>
                )}
            </div>
          );
        })}

        {filtered.length > displayed.length && (
          <button onClick={() => setPage(p => p + 1)} className="w-full py-3 text-[11px] font-bold text-gray-400 bg-gray-50 rounded-xl">
            加载更多...
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfessionsTab;
