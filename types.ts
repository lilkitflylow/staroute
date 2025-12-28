
export enum Category {
  ECONOMICS = '经贸财会',
  ELECTRONICS = '电子信息',
  MANUFACTURING = '智能制造',
  ARTS = '艺术设计',
  SERVICES = '现代服务',
  HUMANITIES = '人文外语',
  MEDICAL = '医药护理'
}

export interface Major {
  id: string;
  name: string; // Volunteer Name (e.g. 商会会计)
  professionalName: string; // Professional Name (e.g. 会计学)
  category: Category;
  schoolCode: string;
  vocationalSchool: string;
  undergradSchool: string;
  subjectType: '理科' | '文科' | '综合';
  personalityMatch: string[];
  jobOutlook: string;
  curriculum: string[];
  district: string;
  address: string;
  tuition: string;
  isInterviewRequired: boolean;
  vocCoord: { lat: number; lng: number };
  undergradCoord: { lat: number; lng: number };
  scores: {
    '2023': number;
    '2024': number;
    '2025': number;
  };
}

export interface UserProfile {
  name: string;
  gender: '男' | '女' | '';
  school: string;
  subjectPreference: '偏理科' | '偏文科' | '均衡' | '';
  scores: {
    chinese: number;
    math: number;
    english: number;
    physics: number;
    chemistry: number;
    history: number;
    politics: number;
    comprehensive: number;
    physical: number;
    total: number;
  };
  subjectLikes: Record<string, 'like' | 'dislike' | null>;
  mbtiResult?: string;
}

export type TabType = 'Professions' | 'Map' | 'Favorites' | 'Plan';
