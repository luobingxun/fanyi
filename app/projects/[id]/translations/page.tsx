'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Check, Loader2, Upload, Search, Trash2, Languages, Plus, Save, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Translation {
  _id: string;
  key: string;
  data: Record<string, string>;
}

export default function TranslationsPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [projectLanguages, setProjectLanguages] = useState<string[]>([]);
  
  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Translate State
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [targetLang, setTargetLang] = useState('');
  const [sourceLang, setSourceLang] = useState(''); // Optional, mostly for deepseek prompt
  const [useCorpus, setUseCorpus] = useState(true);
  const [translating, setTranslating] = useState(false);

  // Manual Add State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newData, setNewData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProjectInfo();
    fetchTranslations();
  }, [projectId]);

  const fetchProjectInfo = async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
          const data = await res.json();
          setProjectLanguages(data.languages || []);
      }
  };

  const fetchTranslations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/translations?search=${search}`);
      if (res.ok) {
        const data = await res.json();
        setTranslations(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      fetchTranslations();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
          const res = await fetch(`/api/projects/${projectId}/translations/upload`, {
              method: 'POST',
              body: formData
          });
          if (res.ok) {
              const result = await res.json();
              alert(`上传完成。新增: ${result.added}, 更新: ${result.updated}`);
              fetchTranslations();
          } else {
              alert('上传失败');
          }
      } catch (error) {
          console.error(error);
          alert('上传出错');
      } finally {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const handleDelete = async () => {
      if (selectedIds.size === 0) return;
      if (!confirm(`确定删除 ${selectedIds.size} 项吗？`)) return;

      try {
          const res = await fetch(`/api/projects/${projectId}/translations`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: Array.from(selectedIds) })
          });
          if (res.ok) {
              setSelectedIds(new Set());
              fetchTranslations();
          }
      } catch (error) {
          console.error(error);
      }
  };

  const handleTranslate = async () => {
      if (!targetLang) {
          alert('请选择目标语言');
          return;
      }

      setTranslating(true);
      
      const itemsToProcess = selectedIds.size > 0 
        ? translations.filter(t => selectedIds.has(t._id))
        : translations;
        
      const texts = itemsToProcess.map(t => {
          if (sourceLang && t.data[sourceLang]) return t.data[sourceLang];
          return t.key;
      });

      // 1. Create Task
      let taskId = '';
      try {
          const taskRes = await fetch(`/api/projects/${projectId}/tasks`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ totalCount: texts.length })
          });
          if (taskRes.ok) {
              const task = await taskRes.json();
              taskId = task._id;
          }
      } catch (e) {
          console.error("Failed to create task", e);
          // Continue anyway? Or stop? Let's continue but warn.
      }

      try {
          // Update task status to processing
          if (taskId) {
             // We need a PUT endpoint for tasks to update status/progress.
             // But we only implemented GET/POST.
             // Let's assume we can add PUT to the same route or a new one.
             // For now, let's just proceed. We'll add the PUT handler next.
          }

          const res = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  texts,
                  targetLang,
                  sourceLang,
                  projectId,
                  corpusEnabled: useCorpus
              })
          });

          if (res.ok) {
              const { results } = await res.json();
              
              const updatedTranslations = [...translations];
              const updates = [];
              let successCount = 0;
              let failCount = 0;

              for (const t of updatedTranslations) {
                  const sourceText = sourceLang && t.data[sourceLang] ? t.data[sourceLang] : t.key;
                  if (results[sourceText]) {
                      if (!t.data) t.data = {};
                      t.data[targetLang] = results[sourceText];
                      successCount++;
                      
                      updates.push({
                          _id: t._id,
                          key: t.key,
                          data: t.data
                      });
                  } else {
                      // If text was in the list but no result, it failed?
                      // Or maybe it was skipped.
                      // DeepSeek might return partial results.
                  }
              }
              failCount = texts.length - successCount;
              
              setTranslations(updatedTranslations); 

              // Save translations
              await Promise.all(updates.map(u => 
                 fetch(`/api/projects/${projectId}/translations`, {
                     method: 'PUT',
                     body: JSON.stringify(u)
                 })
              ));
              
              // Update Task Status
              if (taskId) {
                  await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                          status: 'completed',
                          successCount,
                          failCount
                      })
                  });
              }

              setIsTranslateOpen(false);
              alert('翻译完成');
              fetchTranslations(); 
          } else {
              if (taskId) {
                  await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: 'failed', failCount: texts.length })
                  });
              }
              alert('翻译失败');
          }
      } catch (error) {
          console.error(error);
          if (taskId) {
              await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: 'failed', failCount: texts.length })
              });
          }
          alert('翻译过程中出错');
      } finally {
          setTranslating(false);
      }
  };
  
  const handleExport = () => {
      const data = translations.map(t => ({
          key: t.key,
          ...t.data
      }));
      
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Translations");
      XLSX.writeFile(wb, `project_${projectId}_translations.xlsx`);
  };

  const handleAdd = async () => {
      if (!newKey) return;
      
      try {
          const res = await fetch(`/api/projects/${projectId}/translations`, {
              method: 'POST',
              body: JSON.stringify({ key: newKey, data: newData })
          });
          if (res.ok) {
              setNewKey('');
              setNewData({});
              setIsAddOpen(false);
              fetchTranslations();
          } else {
              const err = await res.json();
              alert(err.error);
          }
      } catch (error) {
          console.error(error);
      }
  };

  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const toggleAll = () => {
      if (selectedIds.size === translations.length) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(translations.map(t => t._id)));
      }
  };

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 border-b border-gray-100 gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索键名..."
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch(e)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
           <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              导入 Excel
           </Button>
           <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".xlsx, .xls" 
                onChange={handleFileUpload} 
           />
           
           <Button variant="outline" size="sm" onClick={handleExport}>
               <Download className="mr-2 h-4 w-4" /> 导出
           </Button>

           <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
               <DialogTrigger asChild>
                   <Button variant="outline" size="sm">
                       <Plus className="mr-2 h-4 w-4" /> 手动添加
                   </Button>
               </DialogTrigger>
               <DialogContent>
                   <DialogHeader><DialogTitle>添加翻译</DialogTitle></DialogHeader>
                   <div className="grid gap-4 py-4">
                       <div className="grid grid-cols-4 items-center gap-4">
                           <Label className="text-right">键名 (Key)</Label>
                           <Input value={newKey} onChange={e => setNewKey(e.target.value)} className="col-span-3" />
                       </div>
                       {projectLanguages.map(lang => (
                           <div key={lang} className="grid grid-cols-4 items-center gap-4">
                               <Label className="text-right">{lang}</Label>
                               <Input 
                                    value={newData[lang] || ''} 
                                    onChange={e => setNewData({...newData, [lang]: e.target.value})} 
                                    className="col-span-3" 
                               />
                           </div>
                       ))}
                   </div>
                   <DialogFooter><Button onClick={handleAdd}>保存</Button></DialogFooter>
               </DialogContent>
           </Dialog>

           <Dialog open={isTranslateOpen} onOpenChange={setIsTranslateOpen}>
               <DialogTrigger asChild>
                   <Button size="sm" disabled={selectedIds.size === 0 && translations.length === 0}>
                       <Languages className="mr-2 h-4 w-4" /> AI 翻译
                   </Button>
               </DialogTrigger>
               <DialogContent>
                   <DialogHeader>
                       <DialogTitle>AI 翻译</DialogTitle>
                       <DialogDescription>
                           使用 DeepSeek 翻译 {selectedIds.size > 0 ? `${selectedIds.size} 个选定项` : '所有项'}。
                       </DialogDescription>
                   </DialogHeader>
                   <div className="grid gap-4 py-4">
                       <div className="space-y-2">
                           <Label>源语言 (可选)</Label>
                           <select 
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={sourceLang}
                                onChange={e => setSourceLang(e.target.value)}
                           >
                               <option value="">键名 (默认)</option>
                               {projectLanguages.map(lang => (
                                   <option key={lang} value={lang}>{lang}</option>
                               ))}
                           </select>
                       </div>
                       <div className="space-y-2">
                           <Label>目标语言</Label>
                           <select 
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={targetLang}
                                onChange={e => setTargetLang(e.target.value)}
                           >
                               <option value="">选择语言...</option>
                               {projectLanguages.map(lang => (
                                   <option key={lang} value={lang}>{lang}</option>
                               ))}
                           </select>
                       </div>
                       <div className="flex items-center space-x-2">
                           <input 
                                type="checkbox" 
                                id="corpus" 
                                checked={useCorpus} 
                                onChange={e => setUseCorpus(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                           />
                           <Label htmlFor="corpus">启用语料库 (优先匹配)</Label>
                       </div>
                   </div>
                   <DialogFooter>
                       <Button onClick={handleTranslate} disabled={translating}>
                           {translating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                           开始翻译
                       </Button>
                   </DialogFooter>
               </DialogContent>
           </Dialog>

           {selectedIds.size > 0 && (
               <Button variant="destructive" size="sm" onClick={handleDelete}>
                   <Trash2 className="mr-2 h-4 w-4" /> 删除 ({selectedIds.size})
               </Button>
           )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-500 uppercase font-medium border-b border-gray-100">
                <tr>
                    <th className="p-4 w-12 pl-6">
                        <input type="checkbox" 
                            checked={selectedIds.size === translations.length && translations.length > 0} 
                            onChange={toggleAll}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                    </th>
                    <th className="p-4 font-medium">键名</th>
                    {projectLanguages.map(lang => (
                        <th key={lang} className="p-4 font-medium">{lang}</th>
                    ))}
                    <th className="p-4 text-right pr-6 font-medium">操作</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr><td colSpan={projectLanguages.length + 3} className="p-4 text-center text-gray-500 h-32">加载中...</td></tr>
                ) : translations.length === 0 ? (
                    <tr><td colSpan={projectLanguages.length + 3} className="p-4 text-center text-gray-500 h-32">暂无翻译数据</td></tr>
                ) : (
                    translations.map(t => (
                        <tr key={t._id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="p-4 pl-6">
                                <input type="checkbox" 
                                    checked={selectedIds.has(t._id)} 
                                    onChange={() => toggleSelection(t._id)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                            </td>
                            <td className="p-4 font-medium text-gray-900">{t.key}</td>
                            {projectLanguages.map(lang => (
                                <td key={lang} className="p-4 max-w-[200px] truncate text-gray-500" title={t.data[lang]}>
                                    {t.data[lang] || '-'}
                                </td>
                            ))}
                            <td className="p-4 text-right pr-6">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary" onClick={() => {
                                    setNewKey(t.key);
                                    setNewData({...t.data});
                                    setIsAddOpen(true);
                                }}>
                                    <span className="sr-only">Edit</span>
                                    {/* Using Edit icon here would be better, but keeping consistent with previous code structure for now, or adding Edit icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                </Button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>

      {/* Footer Pagination (Placeholder for now as we don't have server-side pagination yet) */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
        <div className="text-sm text-gray-500">
          共 {translations.length} 条记录
        </div>
      </div>
    </div>
  );
}
