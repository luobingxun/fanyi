'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Loader2, CheckCircle2, XCircle, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface TranslationTask {
  _id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalCount: number;
  successCount: number;
  failCount: number;
  createdAt: string;
}

export default function TranslationTasksPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [tasks, setTasks] = useState<TranslationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State (Client-side for now)
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> 完成</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500 hover:bg-blue-600"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> 进行中</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> 失败</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> 等待中</Badge>;
    }
  };

  // Filter and Pagination Logic
  const filteredTasks = tasks.filter(task => 
    task._id.includes(searchQuery) || 
    task.status.includes(searchQuery)
  );
  
  const totalPages = Math.ceil(filteredTasks.length / pageSize);
  const paginatedTasks = filteredTasks.slice((page - 1) * pageSize, page * pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索任务 ID..."
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
            {/* Add buttons if needed */}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="w-12 pl-6">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">任务 ID</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">状态</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">进度</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">成功/失败</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-gray-500">加载中...</TableCell>
              </TableRow>
            ) : filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-gray-500">暂无翻译任务</TableCell>
              </TableRow>
            ) : (
              paginatedTasks.map((task) => (
                <TableRow key={task._id} className="hover:bg-gray-50/50 border-gray-100 group transition-colors">
                  <TableCell className="pl-6">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                    #{task._id.slice(-6)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(task.status)}
                  </TableCell>
                  <TableCell>
                    <div className="w-32">
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ width: `${task.totalCount > 0 ? ((task.successCount + task.failCount) / task.totalCount) * 100 : 0}%` }}
                            />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            {task.totalCount} 条
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                      <div className="flex items-center space-x-3 text-sm">
                          <span className="text-green-600 font-medium">{task.successCount}</span>
                          <span className="text-gray-300">/</span>
                          <span className="text-red-600 font-medium">{task.failCount}</span>
                      </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {format(new Date(task.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
        <div className="text-sm text-gray-500">
          每页行 <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded mx-1">{pageSize}</span> 
          {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredTasks.length)} 共 {filteredTasks.length}
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, i, arr) => {
                const prev = arr[i - 1];
                const showEllipsis = prev && p - prev > 1;
                return (
                  <div key={p} className="flex items-center">
                    {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                    <button
                      onClick={() => handlePageChange(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium shadow-sm transition-colors ${
                        page === p
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  </div>
                );
              })}
          </div>
          <button
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
