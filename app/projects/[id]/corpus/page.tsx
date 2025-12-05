'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Trash2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';

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

  const [projectLanguages, setProjectLanguages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const fetchProjectInfo = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}`);
    if (res.ok) {
      const data = await res.json();
      setProjectLanguages(data.languages || []);
    }
  }, [projectId]);

  const fetchCorpus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/corpus?search=${search}`
      );
      if (res.ok) {
        const data = await res.json();
        setCorpus(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [projectId, search]);

  useEffect(() => {
    fetchProjectInfo();
    fetchCorpus();
  }, [fetchProjectInfo, fetchCorpus]);

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

  const handleDelete = async (selectedRows: CorpusItem[]) => {
    const idsToDelete = selectedRows.map((row) => row._id).filter(Boolean);

    if (idsToDelete.length === 0) return;
    if (!confirm(`确定删除 ${idsToDelete.length} 项吗？`)) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/corpus`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete })
      });
      if (res.ok) {
        fetchCorpus();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleExport = () => {
    const data = corpus.map((t) => ({
      key: t.key,
      ...t.data
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Corpus');
    XLSX.writeFile(wb, `project_${projectId}_corpus.xlsx`);
  };

  const columns = useMemo<ColumnDef<CorpusItem>[]>(
    () => [
      {
        id: 'key',
        accessorKey: 'key',
        header: '键名 (Source)',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('key')}</div>
        )
      },
      ...projectLanguages.map((lang) => ({
        id: lang,
        header: lang,
        accessorFn: (row: CorpusItem) => row.data[lang],
        cell: ({ row }: { row: any }) => (
          <div className="max-w-[200px] truncate" title={row.getValue(lang)}>
            {row.getValue(lang) || '-'}
          </div>
        )
      }))
    ],
    [projectLanguages]
  );

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden p-6 space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
      />
      <DataTable
        title="语料管理"
        description="管理项目的翻译语料库"
        columns={columns}
        data={corpus}
        loading={loading}
        classNames={{ table: 'max-h-[400px]' }}
        toolbars={[
          {
            label: uploading ? '上传中...' : '导入 Excel',
            icon: uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            ),
            onClick: () => fileInputRef.current?.click()
          },
          {
            label: '导出',
            icon: <Download className="h-4 w-4" />,
            onClick: handleExport
          }
        ]}
        batchAction={[
          {
            label: '删除',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: handleDelete
          }
        ]}
      />
    </div>
  );
}
