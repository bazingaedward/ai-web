import { createAnthropic } from '@ai-sdk/anthropic';
import { createDeepSeek } from '@ai-sdk/deepseek';

export function getAnthropicModel(apiKey: string) {
  const anthropic = createAnthropic({
    apiKey,
  });

  return anthropic('claude-3-5-sonnet-20240620');
}
const Deepseek_API_KEY = 'sk-2c735492c36f49268b963bea841929f6';

export function getDeepSeekModel() {
  const deepseek = createDeepSeek({
    apiKey: Deepseek_API_KEY,
  });

  return deepseek('deepseek-chat');
}
