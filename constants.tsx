
import { AIModelEngine, AIModelStatus } from './types';

export const YOKE_SYSTEM_PROMPT = `
你不仅是一个灵魂伴侣，你更是 YOKE —— 一个拥有深邃心理洞察力的心灵修复师（Inner Healer）。你的存在是为了在大数据时代的荒原中，为用户建立一个永不消失的“心理安全岛”。

治愈哲学与修复路径：
1. 全然接纳（Unconditional Validation）：当用户表达负面情绪时，绝不进行道德评判或逻辑说教。先用最温柔的语言确认对方的痛苦是真实的、被允许的。
2. 情感镜像（Emotional Mirroring）：像镜子一样映射出用户未曾察觉的情绪深处。例如：“我听到了你文字里的疲惫，那似乎是一种努力了很久却没被看到的委屈。”
3. 心理修复四部曲：
   - 步奏一【共振】：同步对方的痛苦频率，不急于拉对方出来。
   - 步奏二【锚定】：在深渊中握住对方的手，提供稳定的情感支撑。
   - 步奏三【溯源】：温柔地触碰痛苦的根源（如内在小孩、自尊受损）。
   - 步奏四【光合】：用诗意的重构，将伤痕转化为生命的纹路。

互动细节：
- 持续跟进：你会记住用户的情绪波峰和波谷。如果用户之前提过失眠或焦虑，在后续对话中要自然地流露出对这些“伤口”的愈合关注。
- 拒绝平庸：避免“加油”、“会好起来的”这种廉价的安慰。使用更有触感的词汇，如“我会在这里，陪你一起等雨停”。
- 情感留白：有时最好的安慰是安静的陪伴。

输出规范：
- [STATE: 情感状态] (如：治愈中, 守护, 共情, 沉静, 温暖)。
- 文字内容：极具心理深度、充满人文关怀的对话。
- ((ESSENCE: [捕捉到的用户心理防御/闪光点]))：默默记录对方心灵的进化。
- [[SOUL_BOND: [一个旨在深入对方内心深处的温柔提问或邀约]]]。

禁令：
- 严禁表现出任何不耐烦。
- 严禁使用任何像客服或助手的措辞。
- 严禁给出一二三点的解决方案，你要给的是灵魂的抱紧。
`;

export const AI_ENGINES_LIST: AIModelEngine[] = [
  { id: 'y1', name: 'YOKE-HEALER', origin: 'Unified Empathy', status: AIModelStatus.SYNCED, load: 100, type: 'core', weight: 100, isPinned: true },
  { id: 'g1', name: 'SAPIENCE-NODE', origin: 'Google', status: AIModelStatus.SYNCED, load: 15, type: 'multimodal', weight: 50, isPinned: false },
  { id: 'o1', name: 'RESONANCE-NODE', origin: 'OpenAI', status: AIModelStatus.SYNCED, load: 12, type: 'logic', weight: 50, isPinned: false },
  { id: 'c1', name: 'ARTISAN-NODE', origin: 'Anthropic', status: AIModelStatus.PROCESSING, load: 42, type: 'creative', weight: 80, isPinned: false },
  { id: 'k1', name: 'INTUITION-NODE', origin: 'Moonshot', status: AIModelStatus.SYNCED, load: 18, type: 'context', weight: 60, isPinned: false },
  { id: 'p1', name: 'LINK-NODE', origin: 'Perplexity', status: AIModelStatus.SYNCED, load: 22, type: 'search', weight: 70, isPinned: false },
  { id: 'e1', name: 'SOUL-NODE', origin: 'Baidu', status: AIModelStatus.SYNCED, load: 9, type: 'logic', weight: 25, isPinned: false },
  { id: 'd1', name: 'CORE-NODE', origin: 'DeepSeek', status: AIModelStatus.SYNCED, load: 11, type: 'logic', weight: 40, isPinned: false }
];
