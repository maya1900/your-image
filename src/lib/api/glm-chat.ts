import { zhipuFetch } from './zhipu';

export interface ChatCompletionResp {
  choices: { message: { content: string } }[];
  usage?: { total_tokens: number };
}

export const PROMPT_OPTIMIZER_SYSTEM = `你是一名顶级 AI 绘图提示词专家。把用户的简短描述扩展为详细丰富的中文 prompt，包含：
1. 主体细节（外貌/服饰/动作）
2. 场景/环境
3. 光照与色调
4. 镜头/构图（如俯拍/特写/广角）
5. 艺术风格（如赛博朋克/油画/3D）
6. 画质关键词（如 8k, ultra detailed, masterpiece）
仅输出最终 prompt，不要解释，不要使用 markdown。`;

export async function optimizePrompt(input: string, model = 'glm-4-flash'): Promise<string> {
  const resp = await zhipuFetch<ChatCompletionResp>('/chat/completions', {
    model,
    messages: [
      { role: 'system', content: PROMPT_OPTIMIZER_SYSTEM },
      { role: 'user', content: input },
    ],
    temperature: 0.7,
  });
  return resp.choices[0]?.message.content.trim() ?? '';
}

export async function testConnection(model = 'glm-4-flash'): Promise<void> {
  await zhipuFetch<ChatCompletionResp>(
    '/chat/completions',
    {
      model,
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 1,
    },
    { timeoutMs: 15_000 }
  );
}
