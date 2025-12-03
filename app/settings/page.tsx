'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState(''); // Although not strictly needed if using just key, keeping as per requirement "secret"
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey || '');
        setApiSecret(data.apiSecret || '');
        setPrompt(data.prompt || '');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, apiSecret, prompt }),
      });
      if (res.ok) {
        alert('设置保存成功');
      } else {
        alert('保存设置失败');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight mb-6">全局设置</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>DeepSeek 模型配置</CardTitle>
          <CardDescription>配置用于翻译的全局 API 设置。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input 
                id="apiKey" 
                type="password"
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                placeholder="sk-..."
            />
          </div>
          
          {/* If DeepSeek uses a secret separately, otherwise this might be redundant but requested */}
          <div className="space-y-2">
            <Label htmlFor="apiSecret">API Secret (可选)</Label>
            <Input 
                id="apiSecret" 
                type="password"
                value={apiSecret} 
                onChange={(e) => setApiSecret(e.target.value)} 
            />
          </div>

           <div className="space-y-2">
            <Label htmlFor="prompt">默认系统提示词 (System Prompt)</Label>
            <Textarea 
                id="prompt" 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                placeholder="You are a professional translator..."
                rows={5}
            />
             <p className="text-xs text-muted-foreground">
              此提示词将作为翻译模型的系统指令。
            </p>
          </div>

          <Button onClick={handleSave} className="mt-4">保存配置</Button>
        </CardContent>
      </Card>
    </div>
  );
}
