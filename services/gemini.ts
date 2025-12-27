
import { GoogleGenAI } from "@google/genai";
import { UserProfile, Major, Category } from "../types";

// Fixed: Correct initialization using named parameter and process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateRecommendation(user: UserProfile, favorites: Major[]) {
  const prompt = `
    你是一名上海中考升学专家。请基于以下学生数据生成一份“中本星航”AI 分析报告。
    
    学生档案：
    - 姓名：${user.name} (${user.gender})
    - 中考总分预估：${user.scores.total}/750 (语${user.scores.chinese} 数${user.scores.math} 英${user.scores.english} 物${user.scores.physics} 化${user.scores.chemistry} 史${user.scores.history} 政${user.scores.politics} 综${user.scores.comprehensive} 体${user.scores.physical})
    - 性格测评代码：${user.mbtiResult || '未测试'}
    - 目标收藏：${favorites.map(m => m.name).join(', ')}

    请严格按照以下4个部分输出（使用中文，语气专业且亲切）：
    
    1. 【核心性格画像】：基于 MBTI 对该少年的性格进行深度解读及未来本科适应性建议。
    2. 【学科优劣势诊断】：结合分值，分析学生在理科工程或人文社科上的潜力，并指出具体的补强方向。
    3. 【七大板块契合度看板】：列出该学生与经贸、电子、智造、艺术、服务、外语、医药这七类的匹配百分比（例如：智能制造 95%）。
    4. 【2025 目标推荐】：综合分数竞争力和性格，从收藏夹或上海中本贯通库中推荐 Top 3 志愿，并给出具体的填报理由（冲/稳/保）。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });
    // Fixed: response.text is a property, already used correctly here.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "抱歉，由于星际风暴干扰，AI 报告生成失败。请确保已设置有效的 API KEY 并检查网络。";
  }
}
