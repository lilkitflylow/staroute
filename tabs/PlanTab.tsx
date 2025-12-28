
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Major } from '../types';
import { generateRecommendation } from '../services/gemini';
import { SCORE_LIMITS } from '../constants';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface PlanTabProps {
  userProfile: UserProfile;
  setUserProfile: (u: UserProfile) => void;
  favorites: Major[];
  setFavorites: (f: Major[]) => void;
}

// 20 Questions: 1-8 MBTI Step II style, 9-20 Holland Code (RIASEC) style
const QUESTIONS = [
  // --- MBTI / Personality (1-8) ---
  { q: "1. 周末好不容易有空，你更倾向于？", a: "约朋友出门逛街/聚餐，热闹一下", b: "在房间打游戏/看书，享受独处时光" },
  { q: "2. 在课堂小组讨论中，你通常？", a: "主动发言，甚至抢着表达观点", b: "先听别人说，最后补充关键点或总结" },
  { q: "3. 遇到不懂的新知识，你习惯？", a: "先上手试一试，搞坏了再说", b: "先看说明书或原理，搞懂再动手" },
  { q: "4. 背诵课文或概念时，你觉得？", a: "记具体的词句和细节更容易", b: "理解了中心思想和逻辑就很容易背" },
  { q: "5. 朋友心情不好来找你，你第一反应？", a: "帮他分析问题在哪里，怎么解决", b: "陪他一起吐槽，安慰他的情绪" },
  { q: "6. 做决定时（比如选课），你更看重？", a: "利弊分析，哪个更有用/分更高", b: "个人喜好，哪个让我更开心/感兴趣" },
  { q: "7. 关于未来的假期旅行，你倾向？", a: "做好详细攻略，按计划走", b: "到了目的地看心情，走到哪算哪" },
  { q: "8. 面对作业截止日期，你通常？", a: "提前做完，心里踏实", b: "拖到最后时刻，靠爆发力完成" },

  // --- Holland Code / Vocational Interest (9-20) ---
  // R (Realistic)
  { q: "9. 你对以下哪种活动更感兴趣？", a: "组装模型、修理电器或做手工", b: "阅读小说或写日记" },
  { q: "10. 如果让你去工厂参观，你更想看？", a: "自动化流水线和机械手臂如何运作", b: "工人的管理制度和企业文化介绍" },
  // I (Investigative)
  { q: "11. 面对一道很难的数学题，你会？", a: "兴奋，想挑战解出来", b: "头疼，希望能直接看答案" },
  { q: "12. 你更喜欢看哪类视频？", a: "科普解密、实验记录、科技评测", b: "搞笑段子、生活Vlog、娱乐八卦" },
  // A (Artistic)
  { q: "13. 完成作业时，你更在意？", a: "排版是否美观，字体是否好看", b: "内容是否准确，逻辑是否通顺" },
  { q: "14. 给你一个自由发挥的机会，你会选？", a: "画一幅画或设计一个海报", b: "整理一份数据报表" },
  // S (Social)
  { q: "15. 学校组织志愿者活动，你倾向？", a: "去敬老院陪老人聊天或教小朋友", b: "负责在后台整理物资或搬运东西" },
  { q: "16. 未来的工作环境，你更希望？", a: "能经常和人打交道，帮助别人", b: "能独立完成任务，不用应付复杂人际" },
  // E (Enterprising)
  { q: "17. 竞选班干部或社团负责人，你会？", a: "积极参与，想锻炼领导力", b: "默默支持，不想抛头露面" },
  { q: "18. 你觉得自己更擅长？", a: "说服别人接受你的观点", b: "倾听并理解别人的观点" },
  // C (Conventional)
  { q: "19. 整理书桌或电脑文件时，你？", a: "分类明确，井井有条，有强迫症", b: "比较随意，只要能找到就行" },
  { q: "20. 做实验或统计数据时，你？", a: "严格按步骤，追求数据精确", b: "差不多就行，更关注结果趋势" }
];

const SUBJECTS = [
  { k: 'chinese', l: '语文', m: 150 }, { k: 'math', l: '数学', m: 150 }, 
  { k: 'english', l: '英语', m: 150 }, { k: 'physics', l: '物理', m: 70 }, 
  { k: 'chemistry', l: '化学', m: 50 }, { k: 'history', l: '历史', m: 60 },
  { k: 'politics', l: '道法', m: 60 }, { k: 'physical', l: '体育', m: 30 }
];

const PlanTab: React.FC<PlanTabProps> = ({ userProfile, setUserProfile, favorites, setFavorites }) => {
  const [currentView, setCurrentView] = useState<'scores' | 'quiz' | 'report'>('scores');
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]); // Array of 1 (A) or 2 (B)
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const quizEndRef = useRef<HTMLDivElement>(null);

  const handleTotalScoreChange = (val: string) => {
    let total = parseInt(val);
    if (isNaN(total)) total = 0;
    if (total > 720) total = 720; 

    const ratio = total / 720;
    const newScores = { ...userProfile.scores, total };
    
    SUBJECTS.forEach(s => {
        newScores[s.k as keyof typeof userProfile.scores] = Math.round(s.m * ratio);
    });

    setUserProfile({ ...userProfile, scores: newScores });
  };

  const handleScoreChange = (key: string, val: string) => {
    const limit = (SCORE_LIMITS as any)[key] || 150;
    let num = parseInt(val);
    if (isNaN(num)) num = 0;
    if (num > limit) num = limit;
    
    const newScores = { ...userProfile.scores, [key]: num };
    const total = Object.entries(newScores)
      .filter(([k]) => k !== 'total' && k !== 'comprehensive')
      .reduce((acc, [_, v]) => acc + (v as number), 0) + 30; 
    
    setUserProfile({ ...userProfile, scores: { ...newScores, total } });
  };

  const toggleLike = (key: string, type: 'like' | 'dislike') => {
    const current = userProfile.subjectLikes?.[key];
    const newVal = current === type ? null : type;
    setUserProfile({
      ...userProfile,
      subjectLikes: { ...userProfile.subjectLikes, [key]: newVal }
    });
  };

  const handleAnswer = (index: number, val: number) => {
      const newAnswers = [...quizAnswers];
      newAnswers[index] = val;
      setQuizAnswers(newAnswers);
      // Optional: auto-scroll to next could be annoying in long lists, but maybe subtle scroll
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setCurrentView('report');
    
    // Map answers to text for AI
    const answerTexts = QUESTIONS.map((q, i) => {
        const val = quizAnswers[i];
        if (!val) return "Skipped";
        return val === 1 ? `A: ${q.a}` : `B: ${q.b}`;
    });

    const jsonStr = await generateRecommendation(userProfile, favorites, answerTexts);
    
    try {
        if (jsonStr) {
            const data = JSON.parse(jsonStr);
            setReportData(data);
        }
    } catch (e) {
        console.error("Failed to parse report", e);
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-[#F8F9FB] p-5 overflow-hidden">
      <div className="mb-4 shrink-0">
         <h1 className="text-2xl font-bold text-black tracking-tight">星计划</h1>
         <p className="text-xs text-gray-500 font-medium mt-1">
            {currentView === 'scores' && 'Step 1: 成绩与偏好'}
            {currentView === 'quiz' && 'Step 2: 职业兴趣与潜能 (共20题)'}
            {currentView === 'report' && 'AI 智能升学报告'}
         </p>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24 space-y-4">
        
        {/* VIEW 1: COMPRESSED SCORES GRID */}
        {currentView === 'scores' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="bg-white p-5 rounded-[24px] shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-500">预估总分 (输入自动分配)</h2>
                  <div className="flex items-baseline">
                      <input 
                        type="number" 
                        className="text-3xl font-black text-blue-600 w-24 text-right bg-transparent outline-none focus:border-b-2 border-blue-500 transition-all"
                        value={userProfile.scores.total || ''}
                        placeholder="0"
                        onChange={(e) => handleTotalScoreChange(e.target.value)}
                      />
                      <span className="text-sm font-bold text-gray-400 ml-1">分</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 opacity-90">
                  {SUBJECTS.map(s => {
                    const likeState = userProfile.subjectLikes?.[s.k];
                    return (
                      <div key={s.k} className="bg-gray-50 rounded-xl p-2.5 flex items-center gap-2">
                        <div className="flex-1">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-xs font-bold text-gray-400">{s.l}</span>
                                <span className="text-[9px] text-gray-300">/{s.m}</span>
                            </div>
                            <input 
                              type="number" 
                              placeholder="-"
                              className="w-full bg-transparent text-lg font-bold text-black outline-none placeholder:text-gray-200"
                              value={userProfile.scores[s.k as keyof typeof userProfile.scores] || ''}
                              onChange={(e) => handleScoreChange(s.k, e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                          <button 
                            onClick={() => toggleLike(s.k, 'like')}
                            className={`p-1 rounded-md transition-all ${likeState === 'like' ? 'bg-green-500 text-white shadow-sm' : 'bg-white text-gray-300'}`}
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
                          </button>
                          <button 
                            onClick={() => toggleLike(s.k, 'dislike')}
                            className={`p-1 rounded-md transition-all ${likeState === 'dislike' ? 'bg-red-500 text-white shadow-sm' : 'bg-white text-gray-300'}`}
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" /></svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
             </div>

             <button 
               onClick={() => setCurrentView('quiz')}
               className="w-full py-4 bg-black text-white rounded-[20px] font-bold text-base shadow-xl active:scale-95 transition-all"
             >
               下一步：性格测试 ➔
             </button>
          </div>
        )}

        {/* VIEW 2: QUIZ */}
        {currentView === 'quiz' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="bg-blue-600 p-4 rounded-[20px] text-white shadow-lg">
                <h3 className="text-base font-bold mb-1">职业倾向测评 (20题)</h3>
                <p className="opacity-80 text-xs">涵盖 MBTI 潜能与 Holland 职业兴趣。</p>
             </div>

             <div className="space-y-4 pb-4">
               {QUESTIONS.map((q, i) => (
                 <div key={i} className="bg-white p-4 rounded-[20px] shadow-sm">
                    <p className="text-sm font-bold text-black mb-3 text-pretty">{q.q}</p>
                    <div className="flex flex-col gap-2">
                       <button onClick={() => handleAnswer(i, 1)} 
                         className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-left transition-all ${quizAnswers[i]===1 ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                         A. {q.a}
                       </button>
                       <button onClick={() => handleAnswer(i, 2)} 
                         className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-left transition-all ${quizAnswers[i]===2 ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                         B. {q.b}
                       </button>
                    </div>
                 </div>
               ))}
               <div ref={quizEndRef} />
             </div>

             <div className="flex gap-3 pt-2 bg-[#F8F9FB] sticky bottom-0 pb-4 z-10">
                <button 
                  onClick={() => setCurrentView('scores')}
                  className="flex-1 py-3 bg-white text-gray-500 border border-gray-200 rounded-[18px] font-bold text-sm"
                >
                  上一步
                </button>
                <button 
                  onClick={handleGenerateReport} 
                  disabled={quizAnswers.filter(a => a).length < 20}
                  className="flex-[2] py-3 bg-black text-white rounded-[18px] font-bold text-sm shadow-xl disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  {quizAnswers.filter(a => a).length < 20 ? `还差 ${20 - quizAnswers.filter(a => a).length} 题` : '✨ 生成报告'}
                </button>
             </div>
          </div>
        )}

        {/* VIEW 3: REPORT */}
        {currentView === 'report' && (
           <div className="bg-white p-6 rounded-[32px] shadow-xl min-h-[70vh] animate-in zoom-in-95 duration-300">
             {loading ? (
               <div className="flex flex-col items-center justify-center h-full py-20">
                 <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                 <p className="text-xs font-bold text-gray-400 animate-pulse">AI 正在分析您的 Holland 职业代码...</p>
               </div>
             ) : reportData ? (
               <div className="space-y-6">
                 <h2 className="text-xl font-black text-black text-center">星航分析报告</h2>
                 
                 {/* Personality Summary */}
                 <div className="bg-blue-50 p-4 rounded-2xl">
                    <h3 className="text-sm font-bold text-blue-800 mb-2">💡 性格与潜能</h3>
                    <p className="text-xs text-blue-700 leading-relaxed">{reportData.personalitySummary}</p>
                 </div>

                 {/* Radar Chart Visualization (RIASEC) */}
                 <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={reportData.radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#666' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                        <Radar name="Match" dataKey="A" stroke="#2563EB" fill="#3B82F6" fillOpacity={0.6} />
                        </RadarChart>
                    </ResponsiveContainer>
                    <div className="absolute top-0 right-0 bg-white/80 px-2 py-1 rounded text-[9px] text-gray-400 shadow-sm border">
                        职业兴趣雷达 (RIASEC)
                    </div>
                 </div>

                 {/* Career Planning */}
                 <div>
                    <h3 className="text-sm font-bold text-black mb-2">🚀 职业与升学规划</h3>
                    <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {reportData.careerPlanning}
                    </div>
                 </div>

                 {/* Recommendations */}
                 <div>
                    <h3 className="text-sm font-bold text-black mb-2">🌟 推荐志愿方向</h3>
                    <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        {reportData.recommendations}
                    </div>
                 </div>

                 <button onClick={() => setCurrentView('scores')} className="w-full mt-8 py-3 bg-gray-100 text-gray-500 rounded-[18px] font-bold text-sm">
                   重新测评
                 </button>
               </div>
             ) : (
               <div className="text-center py-20">
                   <p className="text-gray-400 text-sm">报告生成失败，请重试</p>
                   <button onClick={() => setCurrentView('scores')} className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-xs font-bold">返回</button>
               </div>
             )}
           </div>
        )}

      </div>
    </div>
  );
};

export default PlanTab;
