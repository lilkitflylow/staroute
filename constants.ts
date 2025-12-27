
import { Category } from './types';

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.ECONOMICS]: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)', // 糖果粉
  [Category.ELECTRONICS]: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', // 梦幻紫
  [Category.MANUFACTURING]: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', // 薄荷蓝
  [Category.ARTS]: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', // 蜜桃
  [Category.SERVICES]: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', // 晚霞
  [Category.HUMANITIES]: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', // 绣球紫
  [Category.MEDICAL]: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', // 珊瑚红
};

export const THEME = {
  bg: '#F2F2F7', // iOS System Gray 6
  card: '#FFFFFF',
  cardBorder: 'rgba(0, 0, 0, 0.04)',
  textPrimary: '#1D1D1F', // Apple Black
  textSecondary: '#86868B', // Apple Gray
  accent: '#007AFF', // Apple Blue
};

export const SCORE_LIMITS = {
  chinese: 150,
  math: 150,
  english: 150,
  physics: 70,
  chemistry: 50,
  history: 60,
  politics: 60,
  comprehensive: 30,
  physical: 30
};

export const SHANGHAI_BOUNDS = {
  latMin: 30.7,
  latMax: 31.7,
  lngMin: 121.0,
  lngMax: 122.0
};
