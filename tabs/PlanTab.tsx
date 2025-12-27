
import React, { useState } from 'react';
import { UserProfile, Major } from '../types';
import { generateRecommendation } from '../services/gemini';
import { SCORE_LIMITS } from '../constants';

interface PlanTabProps {
  userProfile: UserProfile;
  setUserProfile: (u: UserProfile) => void;
  favorites: Major[];
  setFavorites: (f: Major[]) => void;
}

const QUESTIONS = [
  // 7 MBTI-related questions suitable for Junior High
  { q: "周末如果你有空闲时间，你更倾向于？", a: "和一群朋友出去玩 (E)", b: "自己在房间看书或玩游戏 (I)" },
  { q: "在学习新知识时，你更喜欢？", a: "通过动手实验来理解 (S)", b: "通过概念和理论来思考 (N)" },
  { q: "做决定时，你通常看重？", a: "逻辑和公平 (T)", b: "他人的感受和和谐 (F)" },
  { q: "假期旅行时，你的习惯是？", a: "提前做好详细攻略 (J)", b: "到了地方看心情决定 (P)" },
  { q: "在课堂讨论中，你通常是？", a: "积极发言，甚至抢答 (E)", b: "先听别人说，想好了再说 (I)" },
  { q: "你更擅长记忆？", a: "具体的数字和事实 (S)", b: "故事的整体含义 (N)" },
  { q: "朋友遇到困难找你，你会？", a: "帮他分析问题给建议 (T)", b: "安慰他，给他情感支持 (F)" },
  
  // 3 Career Direction questions
  { q: "未来的工作场景，你更向往？", a: "充满科技感的实验室或机房 (理工技术)", b: "与人打交道的办公室或商务中心 (人文社科)" },
  { q: "你更希望你的工作成果是？", a: "看得见摸得着的产品或工程 (制造/设计)", b: "一份完美的方案或服务体验 (经管/服务)" },
  { q: "对于复杂的机械或代码，你的感觉是？", a: "很有趣，想拆开看看原理 (适合工科)", b: "太枯燥了，不如读小说有趣 (适合文科)" }
];

const PlanTab: React.FC<PlanTabProps> = ({ userProfile, setUserProfile, favorites, setFavorites }) => {
  const [step, setStep] = useState<'profile' | 'quiz' | 'report'>('profile');
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScoreChange = (key: keyof UserProfile['scores'], val: string) => {
    const limit = (SCORE_LIMITS as any)[key] || 750;
    let num = parseInt(val) || 0;
    if (num > limit) num = limit;
    if (num < 0) num = 0;
    
    const newScores = { ...userProfile.scores, [key]: num };
    const total = Object.entries(newScores)
      .filter(([k]) => k !== 'total')
      .reduce((acc, [_, v]) => acc + (v as number), 0);
    
    setUserProfile({ ...userProfile, scores: { ...newScores, total } });
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setStep('report');

    // Synthesize Quiz Result for AI
    let mbtiTraits = "";
    if (quizAnswers[0] === 1) mbtiTraits += "E (外向) "; else mbtiTraits += "I (内向) ";
    if (quizAnswers[1] === 1) mbtiTraits += "S (实感) "; else mbtiTraits += "N (直觉) ";
    if (quizAnswers[2] === 1) mbtiTraits += "T (思考) "; else mbtiTraits += "F (情感) ";
    if (quizAnswers[3] === 1) mbtiTraits += "J (判断) "; else mbtiTraits += "P (感知) ";

    let careerPref = "";
    if (quizAnswers[7] === 1) careerPref += "偏向理工技术环境，"; else careerPref += "偏向人文社科环境，";
    if (quizAnswers[8] === 1) careerPref += "喜欢具体产出，"; else careerPref += "喜欢服务与方案，";
    if (quizAnswers[9] === 1) careerPref += "对机械/代码有兴趣。"; else careerPref += "对文学/艺术有兴趣。";

    const synthesisProfile = {
      ...userProfile,
      mbtiResult: `MBTI倾向: ${mbtiTraits}。职业倾向: ${careerPref}`
    };

    const result = await generateRecommendation(synthesisProfile, favorites);
    setAiReport(result || null);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col p-5 bg-[#F2F2F7] overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-black">星计划</h1>
        <div className="px-3 py-1 bg-white rounded-full text-[11px] font-bold text-gray-500 shadow-sm border border-gray-100">
          已收藏: {favorites.length}/10
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4 pb-24">
        {step === 'profile' && (
          <div className="space-y-4">
            {/* Basic Info Card */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm">
              <h2 className="text-[11px] font-bold text-gray-400 uppercase mb-4 tracking-wider">基础档案</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input type="text" placeholder="姓名" value={userProfile.name} onChange={e => setUserProfile({...userProfile, name: e.target.value})}
                  className="w-full p-4 bg-[#F2F2F7] rounded-xl text-sm font-bold text-black focus:outline-none focus:bg-gray-100 transition-all placeholder:text-gray-400" />
                <select value={userProfile.gender} onChange={e => setUserProfile({...userProfile, gender: e.target.value as any})}
                  className="w-full p-4 bg-[#F2F2F7] rounded-xl text-sm font-bold text-black focus:outline-none appearance-none">
                  <option value="">性别</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
              <select value={userProfile.subjectPreference} onChange={e => setUserProfile({...userProfile, subjectPreference: e.target.value as any})}
                  className="w-full p-4 bg-[#F2F2F7] rounded-xl text-sm font-bold text-black focus:outline-none appearance-none">
                  <option value="">文理倾向选择</option>
                  <option value="偏理科">偏向理科 (工程/IT/智能)</option>
                  <option value="偏文科">偏向文科 (经贸/人文/艺术)</option>
                  <option value="均衡">文理均衡发展</option>
              </select>
            </div>

            {/* Scores Card */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">分数录入</h2>
                <div className="text-sm font-bold text-blue-600">总分 {userProfile.scores.total}</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { k: 'chinese', l: '语文', m: 150 }, { k: 'math', l: '数学', m: 150 }, { k: 'english', l: '英语', m: 150 },
                  { k: 'physics', l: '物理', m: 70 }, { k: 'chemistry', l: '化学', m: 50 }, { k: 'history', l: '历史', m: 60 },
                  { k: 'politics', l: '道法', m: 60 }, { k: 'comprehensive', l: '跨学科', m: 30 }, { k: 'physical', l: '体育', m: 30 }
                ].map(s => (
                  <div key={s.k} className="bg-[#F2F2F7] p-3 rounded-xl">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                      <span>{s.l}</span>
                      <span>/{s.m}</span>
                    </div>
                    <input type="number" value={userProfile.scores[s.k as keyof typeof userProfile.scores] || ''} 
                      placeholder="0" onChange={e => handleScoreChange(s.k as any, e.target.value)}
                      className="w-full bg-transparent text-base font-bold text-black focus:outline-none placeholder:text-gray-300" />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setStep('quiz')} disabled={!userProfile.name} 
              className="w-full py-4 bg-[#1D1D1F] text-white rounded-[20px] font-bold shadow-lg active:scale-95 transition-all disabled:opacity-30 disabled:shadow-none">
              下一步：性格与职业测评 ➔
            </button>
          </div>
        )}

        {step === 'quiz' && (
          <div className="space-y-4">
            <div className="text-center mb-6 pt-4">
               <h2 className="text-xl font-bold text-black">性格潜力测试</h2>
               <p className="text-xs text-gray-400 mt-1">前7题分析性格 (MBTI)，后3题探索职业方向</p>
            </div>
            {QUESTIONS.map((q, i) => (
              <div key={i} className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-50">
                 <div className="flex items-start gap-3">
                    <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">{i + 1}</span>
                    <p className="text-sm font-bold text-black mb-3 leading-relaxed">{q.q}</p>
                 </div>
                 <div className="flex flex-col gap-2 pl-9">
                    <button onClick={() => {const na = [...quizAnswers]; na[i]=1; setQuizAnswers(na)}} className={`w-full py-3 px-4 rounded-xl text-[12px] font-bold text-left transition-all ${quizAnswers[i]===1 ? 'bg-[#007AFF] text-white shadow-md' : 'bg-[#F2F2F7] text-gray-600'}`}>A. {q.a}</button>
                    <button onClick={() => {const na = [...quizAnswers]; na[i]=2; setQuizAnswers(na)}} className={`w-full py-3 px-4 rounded-xl text-[12px] font-bold text-left transition-all ${quizAnswers[i]===2 ? 'bg-[#007AFF] text-white shadow-md' : 'bg-[#F2F2F7] text-gray-600'}`}>B. {q.b}</button>
                 </div>
              </div>
            ))}
            {quizAnswers.filter(a => a).length === 10 && (
              <button onClick={handleGenerateReport} className="w-full py-4 bg-[#007AFF] text-white rounded-[20px] font-bold shadow-xl shadow-blue-200 animate-pulse">
                生成 AI 星航报告 ✨
              </button>
            )}
          </div>
        )}

        {step === 'report' && (loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#007AFF] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-gray-500">正在分析 2025 数据模型...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-[32px] shadow-xl">
              <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                AI 诊断结果
              </h2>
              <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-gray-700">{aiReport}</div>
            </div>
            <button onClick={() => setStep('profile')} className="w-full py-4 bg-gray-100 text-gray-500 rounded-[20px] font-bold">
              重新填写
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanTab;
