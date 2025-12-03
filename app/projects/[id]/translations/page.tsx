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
      
      // Determine texts to translate
      // If selection, translate selected. Else, translate all (or filter those missing target lang?)
      // Requirement: "Translate specified language" "Batch translate all"
      // Here we support translating selected or all visible.
      
      const itemsToProcess = selectedIds.size > 0 
        ? translations.filter(t => selectedIds.has(t._id))
        : translations; // Or filter those missing the target lang? 
        
      // Let's just send keys/texts of items to process.
      // DeepSeek integration needs source text. What is source? 'key' or a specific language?
      // Usually 'key' is the identifier, but source text might be in 'en' or 'zh'.
      // Let's assume 'key' is the source text for simplicity or user selects source.
      // If sourceLang is provided, use that column. If not, use key.
      
      const texts = itemsToProcess.map(t => {
          if (sourceLang && t.data[sourceLang]) return t.data[sourceLang];
          return t.key;
      });

      try {
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
              // Update local state and save to DB
              // We need to update each translation item with the new result
              
              // Batch update optimization: We could create a bulk update API.
              // For now, let's update one by one or use a new endpoint?
              // Or just reuse upload endpoint? No.
              // Let's just loop update for now or create a bulk update endpoint.
              // Updating state locally first for feedback.
              
              const updatedTranslations = [...translations];
              const updates = [];

              for (const t of updatedTranslations) {
                  const sourceText = sourceLang && t.data[sourceLang] ? t.data[sourceLang] : t.key;
                  if (results[sourceText]) {
                      if (!t.data) t.data = {};
                      t.data[targetLang] = results[sourceText];
                      
                      updates.push({
                          _id: t._id,
                          key: t.key,
                          data: t.data
                      });
                  }
              }
              
              setTranslations(updatedTranslations); // Optimistic update

              // Save to DB (We should probably have a bulk update endpoint)
              // For now, we can just call PUT for each or implement bulk update.
              // Let's implement a quick loop, it might be slow for many items.
              // Ideally, backend should handle the translation result saving if we passed IDs.
              // But /api/translate is generic.
              // Let's do client side save for now.
              
              await Promise.all(updates.map(u => 
                 fetch(`/api/projects/${projectId}/translations`, {
                     method: 'PUT',
                     body: JSON.stringify(u)
                 })
              ));
              
              setIsTranslateOpen(false);
              alert('翻译完成');
              fetchTranslations(); // Refresh to be sure
          } else {
              alert('翻译失败');
          }
      } catch (error) {
          console.error(error);
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">文本翻译</h2>
        <div className="flex flex-wrap gap-2">
           <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
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
           
           <Button variant="outline" onClick={handleExport}>
               <Download className="mr-2 h-4 w-4" /> 导出
           </Button>

           <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
               <DialogTrigger asChild>
                   <Button variant="outline">
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
                   <Button disabled={selectedIds.size === 0 && translations.length === 0}>
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
               <Button variant="destructive" onClick={handleDelete}>
                   <Trash2 className="mr-2 h-4 w-4" /> 删除 ({selectedIds.size})
               </Button>
           )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="搜索键名..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8" onKeyDown={e => e.key === 'Enter' && handleSearch(e)} />
          </div>
          <Button variant="secondary" onClick={fetchTranslations}>搜索</Button>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase font-medium">
                    <tr>
                        <th className="p-4 w-10">
                            <input type="checkbox" 
                                checked={selectedIds.size === translations.length && translations.length > 0} 
                                onChange={toggleAll}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                        </th>
                        <th className="p-4">键名</th>
                        {projectLanguages.map(lang => (
                            <th key={lang} className="p-4">{lang}</th>
                        ))}
                        <th className="p-4 text-right">操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {loading ? (
                        <tr><td colSpan={projectLanguages.length + 3} className="p-4 text-center">加载中...</td></tr>
                    ) : translations.length === 0 ? (
                        <tr><td colSpan={projectLanguages.length + 3} className="p-4 text-center text-muted-foreground">暂无翻译数据</td></tr>
                    ) : (
                        translations.map(t => (
                            <tr key={t._id} className="hover:bg-muted/50">
                                <td className="p-4">
                                    <input type="checkbox" 
                                        checked={selectedIds.has(t._id)} 
                                        onChange={() => toggleSelection(t._id)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                </td>
                                <td className="p-4 font-medium">{t.key}</td>
                                {projectLanguages.map(lang => (
                                    <td key={lang} className="p-4 max-w-[200px] truncate" title={t.data[lang]}>
                                        {t.data[lang] || '-'}
                                    </td>
                                ))}
                                <td className="p-4 text-right">
                                    {/* Inline edit or delete specific item could go here */}
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                                        setNewKey(t.key);
                                        setNewData({...t.data});
                                        // We'd need a separate edit dialog or reuse add dialog with 'edit' mode
                                        // For simplicity, skipping individual edit button implementation in this turn
                                    }}>
                                        <span className="sr-only">Edit</span>
                                        {/* Edit Icon */}
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
