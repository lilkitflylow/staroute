
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
  name: string;
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
    '2023': { min: number; max: number };
    '2024': { min: number; max: number };
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
  mbtiResult?: string;
}

export type TabType = 'Professions' | 'Map' | 'Favorites' | 'Plan';
