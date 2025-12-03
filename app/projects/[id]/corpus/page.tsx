'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Search, Trash2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface CorpusItem {
  _id: string;
  key: string;
  data: Record<string, string>;
}

export default function CorpusPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [corpus, setCorpus] = useState<CorpusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [projectLanguages, setProjectLanguages] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProjectInfo();
    fetchCorpus();
  }, [projectId]);

  const fetchProjectInfo = async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
          const data = await res.json();
          setProjectLanguages(data.languages || []);
      }
  };

  const fetchCorpus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/corpus?search=${search}`);
      if (res.ok) {
        const data = await res.json();
        setCorpus(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      fetchCorpus();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
          const res = await fetch(`/api/projects/${projectId}/corpus/upload`, {
              method: 'POST',
              body: formData
          });
          if (res.ok) {
              const result = await res.json();
              alert(`上传完成。新增: ${result.added}, 更新: ${result.updated}`);
              fetchCorpus();
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
          const res = await fetch(`/api/projects/${projectId}/corpus`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: Array.from(selectedIds) })
          });
          if (res.ok) {
              setSelectedIds(new Set());
              fetchCorpus();
          }
      } catch (error) {
          console.error(error);
      }
  };

  const handleExport = () => {
      const data = corpus.map(t => ({
          key: t.key,
          ...t.data
      }));
      
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Corpus");
      XLSX.writeFile(wb, `project_${projectId}_corpus.xlsx`);
  };

  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const toggleAll = () => {
      if (selectedIds.size === corpus.length) {
          setSelectedIds(new Set());
      } else {
          setSelectedIds(new Set(corpus.map(t => t._id)));
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">语料管理</h2>
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
          <Button variant="secondary" onClick={fetchCorpus}>搜索</Button>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase font-medium">
                    <tr>
                        <th className="p-4 w-10">
                            <input type="checkbox" 
                                checked={selectedIds.size === corpus.length && corpus.length > 0} 
                                onChange={toggleAll}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                        </th>
                        <th className="p-4">键名 (Source)</th>
                        {projectLanguages.map(lang => (
                            <th key={lang} className="p-4">{lang}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {loading ? (
                        <tr><td colSpan={projectLanguages.length + 2} className="p-4 text-center">加载中...</td></tr>
                    ) : corpus.length === 0 ? (
                        <tr><td colSpan={projectLanguages.length + 2} className="p-4 text-center text-muted-foreground">暂无语料数据</td></tr>
                    ) : (
                        corpus.map(t => (
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
