import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Settings from '@/lib/models/Settings';
import Project from '@/lib/models/Project';
import Corpus from '@/lib/models/Corpus';

export async function POST(req: Request) {
  await connectToDatabase();
  const body = await req.json();
  const { texts, targetLang, sourceLang, projectId, corpusEnabled } = body;

  if (!texts || !Array.isArray(texts) || texts.length === 0) {
    return NextResponse.json({ error: '文本列表不能为空' }, { status: 400 });
  }
  if (!targetLang) {
    return NextResponse.json({ error: '目标语言不能为空' }, { status: 400 });
  }

  // 1. Get Configuration
  const globalSettings = await Settings.findOne();
  let apiKey = globalSettings?.apiKey;
  const prompt = globalSettings?.prompt || "You are a professional translator. Translate the following text to {targetLang}. Only return the translated text.";

  if (projectId) {
    const project = await Project.findById(projectId);
    if (project && project.apiKey) {
      apiKey = project.apiKey;
    }
  }

  if (!apiKey) {
    return NextResponse.json({ error: '未配置 API Key' }, { status: 500 });
  }

  const results: Record<string, string> = {};
  const textsToTranslate: string[] = [];

  // 2. Check Corpus
  if (corpusEnabled && projectId) {
    for (const text of texts) {
       // Use lean() to get POJO
       const corpusItem = await Corpus.findOne({ projectId, key: text }).lean() as unknown as { data?: Record<string, string> };
       if (corpusItem && corpusItem.data && corpusItem.data[targetLang]) {
           results[text] = corpusItem.data[targetLang];
       } else {
           textsToTranslate.push(text);
       }
    }
  } else {
      textsToTranslate.push(...texts);
  }

  // 3. Call DeepSeek API for remaining texts
  if (textsToTranslate.length > 0) {
    try {
      // We can translate one by one or batch. DeepSeek/OpenAI usually handles batch via prompt, but structured output is harder.
      // For reliability, let's do one by one or small batches, or use a structured prompt.
      // Let's try a simple loop for now to ensure accuracy, parallelized.
      
      const translateOne = async (text: string) => {
          const systemPrompt = prompt.replace('{targetLang}', targetLang).replace('{sourceLang}', sourceLang || 'auto');
          
          const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: "deepseek-chat", // Verify model name
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: text }
              ],
              stream: false
            })
          });

          if (!response.ok) {
             const err = await response.text();
             console.error("DeepSeek API Error:", err);
             return null;
          }
          
          const json = await response.json();
          return json.choices[0].message.content;
      };

      // Limit concurrency if needed, but for now Promise.all
      const apiResults = await Promise.all(textsToTranslate.map(async (text) => {
          const translation = await translateOne(text);
          return { text, translation };
      }));

      apiResults.forEach(item => {
          if (item.translation) {
              results[item.text] = item.translation;
          }
      });

    } catch (error) {
      console.error("Translation error:", error);
      return NextResponse.json({ error: '翻译失败' }, { status: 500 });
    }
  }

  return NextResponse.json({ results });
}
