'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Folder, Search, Edit, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Project {
  _id: string;
  name: string;
  description?: string;
  languages: string[];
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  pages: number;
}

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Search and Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, pages: 1 });

  const fetchProjects = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search
      });
      const res = await fetch(`/api/projects?${params.toString()}`);
      const data = await res.json();
      setProjects(data.projects);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect for search and initial load
  useEffect(() => {
    // Reset to page 1 when search changes
    fetchProjects(1, debouncedSearchQuery);
  }, [debouncedSearchQuery, fetchProjects]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchProjects(newPage, debouncedSearchQuery);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName, description: newProjectDescription }),
      });
      
      if (res.ok) {
        setNewProjectName('');
        setNewProjectDescription('');
        setIsDialogOpen(false);
        // Refresh list, keeping current search but resetting to page 1 to see new item
        fetchProjects(1, debouncedSearchQuery);
      } else {
        const error = await res.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Failed to create project', error);
    }
  };

  const deleteProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    if (!confirm('确定要删除这个项目吗？')) return;

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        // Refresh current page
        fetchProjects(pagination.page, debouncedSearchQuery);
      }
    } catch (error) {
      console.error('Failed to delete project', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="搜索项目..." 
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> 创建项目
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">创建新项目</DialogTitle>
              <DialogDescription>
                请填写以下信息以创建一个新的翻译项目。
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  项目名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="例如：公司官网多语言版"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  项目描述
                </Label>
                <Textarea
                  id="description"
                  placeholder="简要描述该项目的用途或目标..."
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="col-span-3 min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
              <Button onClick={createProject} disabled={!newProjectName.trim()}>
                创建项目
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="w-12 pl-6">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">项目名称</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">创建方式</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">语言数量</TableHead>
              <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</TableHead>
              <TableHead className="text-right pr-6 text-xs font-medium text-gray-500 uppercase tracking-wider">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                  加载中...
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                  {searchQuery ? '未找到匹配的项目' : '暂无项目。点击上方 "+" 按钮创建一个新项目。'}
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project._id} className="hover:bg-gray-50/50 border-gray-100 group transition-colors">
                  <TableCell className="pl-6">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link 
                      href={`/projects/${project._id}`}
                      className="flex items-center group-hover:text-primary transition-colors"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                        {project.description && (
                          <div className="text-xs text-gray-500 truncate max-w-[200px] mt-0.5">
                            {project.description}
                          </div>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">手动</TableCell>
                  <TableCell className="text-sm text-gray-500">{project.languages.length}</TableCell>
                  <TableCell className="text-sm text-gray-500">{new Date(project.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Link href={`/projects/${project._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-400 hover:text-destructive"
                        onClick={(e) => deleteProject(project._id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
          每页行 <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded mx-1">10</span> {(pagination.page - 1) * 10 + 1}-{Math.min(pagination.page * 10, pagination.total)} 共 {pagination.total}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter(p => {
                // Show first, last, current, and neighbors
                return p === 1 || 
                       p === pagination.pages || 
                       Math.abs(p - pagination.page) <= 1;
              })
              .map((p, i, arr) => {
                // Add ellipsis if there's a gap
                const prev = arr[i - 1];
                const showEllipsis = prev && p - prev > 1;
                
                return (
                  <div key={p} className="flex items-center">
                    {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                    <button 
                      onClick={() => handlePageChange(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium shadow-sm transition-colors ${
                        pagination.page === p 
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
            disabled={pagination.page >= pagination.pages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
