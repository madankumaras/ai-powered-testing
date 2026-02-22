import axios from 'axios';

export async function callOllama(
  prompt: string,
): Promise<string> {
  try {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/generate';
    const ollamaModel = process.env.OLLAMA_MODEL || 'qwen3:8b';

    const response = await axios.post(ollamaUrl, {
      model: ollamaModel,
      prompt: prompt,
      stream: false,
    });

    return response.data?.response || 'Failed to generate AI analysis.';
  } catch (error: any) {
    console.error('⚠️ [Ollama API Error]:', error.message);
    return 'AI Analysis could not be generated due to an API error.';
  }
}
