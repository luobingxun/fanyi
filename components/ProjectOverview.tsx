'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  languages: string[];
  apiKey?: string;
}

export default function ProjectOverview({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLang, setNewLang] = useState('');

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
        setName(data.name);
        setApiKey(data.apiKey || '');
        setLanguages(data.languages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, apiKey, languages }),
      });
      if (res.ok) {
        alert('项目更新成功');
        fetchProject();
      } else {
          alert('更新失败');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addLanguage = () => {
    if (newLang && !languages.includes(newLang)) {
      setLanguages([...languages, newLang]);
      setNewLang('');
    }
  };

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  if (loading) return <div>加载中...</div>;
  if (!project) return <div>项目未找到</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">项目概览</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>项目信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="name">项目名称</Label>
            <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
            />
          </div>
          
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="apiKey">项目 API Key (可选)</Label>
            <Input 
                id="apiKey" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)} 
                placeholder="覆盖全局 API Key"
            />
          </div>

           <div className="space-y-2">
            <Label>语言列表</Label>
            <div className="flex flex-wrap gap-2 mb-2">
                {languages.map(lang => (
                    <div key={lang} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2">
                        {lang}
                        <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeLanguage(lang)} />
                    </div>
                ))}
            </div>
            <div className="flex gap-2 max-w-sm">
                <Input 
                    value={newLang} 
                    onChange={(e) => setNewLang(e.target.value)} 
                    placeholder="添加语言 (例如: fr, de)"
                    onKeyDown={(e) => e.key === 'Enter' && addLanguage()}
                />
                <Button onClick={addLanguage} size="icon"><Plus className="w-4 h-4" /></Button>
            </div>
          </div>

          <Button onClick={handleSave} className="mt-4">保存更改</Button>
        </CardContent>
      </Card>
    </div>
  );
}
