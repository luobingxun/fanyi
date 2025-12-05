"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Copy, ChevronDown, Check, Eye, EyeOff } from "lucide-react";
import { languageConfig } from "@/lib/constants";


interface Project {
  _id: string;
  name: string;
  description?: string;
  languages: string[];
  sourceLanguage: string;
  deepseekApiEndpoint?: string;
  deepseekApiSecret?: string;
  systemPrompt?: string;
}

export default function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectId, setProjectId] = useState<string>("");

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("zh");
  const [targetLanguages, setTargetLanguages] = useState<string[]>([]);
  const [deepseekApiEndpoint, setDeepseekApiEndpoint] = useState("");
  const [deepseekApiSecret, setDeepseekApiSecret] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  // Visibility State
  const [showSdkKey, setShowSdkKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);

  useEffect(() => {
    const fetchProject = async (id: string) => {
      try {
        const res = await fetch(`/api/projects/${id}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setProject(data);
          setName(data.name);
          setDescription(data.description || "");
          setSourceLanguage(data.sourceLanguage || "zh");
          setTargetLanguages(data.languages || []);
          setDeepseekApiEndpoint(data.deepseekApiEndpoint || "");
          setDeepseekApiSecret(data.deepseekApiSecret || "");
          setSystemPrompt(data.systemPrompt || "");
        }
      } catch (error) {
        console.error("Failed to fetch project", error);
      } finally {
        setLoading(false);
      }
    };

    const loadData = async () => {
      const resolvedParams = await params;
      setProjectId(resolvedParams.id);
      fetchProject(resolvedParams.id);
    };
    loadData();
  }, [params]);

  const handleSave = async () => {
    if (!projectId) return;
    
    // Validation
    if (!name.trim()) {
      alert("请输入项目名称");
      return;
    }
    if (!sourceLanguage) {
      alert("请选择开发语言");
      return;
    }
    if (targetLanguages.length === 0) {
      alert("请至少选择一个目标语言");
      return;
    }
    if (!deepseekApiEndpoint.trim()) {
      alert("请输入 API Endpoint");
      return;
    }
    if (!deepseekApiSecret.trim()) {
      alert("请输入 API Secret");
      return;
    }
    if (!systemPrompt.trim()) {
      alert("请输入系统提示词");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          sourceLanguage,
          languages: targetLanguages,
          deepseekApiEndpoint,
          deepseekApiSecret,
          systemPrompt,
        }),
      });

      if (res.ok) {
        alert("保存成功");
        router.refresh();
      } else {
        alert("保存失败");
      }
    } catch (error) {
      console.error("Failed to update project", error);
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!projectId) return;
    if (!confirm("确定要删除这个项目吗？此操作不可恢复。")) return;

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/");
      } else {
        alert("删除失败");
      }
    } catch (error) {
      console.error("Failed to delete project", error);
      alert("删除失败");
    }
  };

  const handleCopyId = () => {
    if (project?._id) {
      navigator.clipboard.writeText(project._id);
      alert("已复制 SDK Key");
    }
  };

  const toggleTargetLanguage = (code: string) => {
    setTargetLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">加载中...</div>;
  }

  if (!project) {
    return <div className="p-8 text-center text-gray-500">项目未找到</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">项目配置</h1>
        <div className="flex items-center gap-3">
          <Button variant="destructive" onClick={handleDelete}>
            删除
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : "保存配置"}
          </Button>
        </div>
      </div>

      {/* Project Information Section */}
      <Card className="border-none">
        <CardHeader>
          <CardTitle className="text-base font-medium">项目信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-600 font-normal inline-block">
              项目名称 <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {name.length}/80
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-600 font-normal inline-block">SDK Key</Label>
            <div className="relative">
              <Input
                value={project._id}
                readOnly
                type={showSdkKey ? "text" : "password"}
                className="bg-gray-50 font-mono text-gray-500 pr-20"
              />
              <div className="absolute right-0 top-0 h-full flex items-center px-2 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSdkKey(!showSdkKey)}
                  title={showSdkKey ? "隐藏 SDK Key" : "显示 SDK Key"}
                  className="h-full px-2 hover:bg-transparent text-gray-400 hover:text-gray-600"
                >
                  {showSdkKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyId}
                  title="复制 SDK Key"
                  className="h-full px-2 hover:bg-transparent text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              用于在SDK工具的使用，请谨慎保管。
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-600 font-normal inline-block">
              项目描述
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入项目描述..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Configuration Section */}
      <Card className="border-none">
        <CardHeader>
          <CardTitle className="text-base font-medium">语言配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-600 font-normal inline-block">
                开发语言 <span className="text-red-500">*</span>
              </Label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择开发语言" />
                </SelectTrigger>
                <SelectContent
                  className="min-w-[--radix-select-trigger-width]"
                  style={{ width: "var(--radix-select-trigger-width)" }}
                >
                  {languageConfig.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name} ({lang.desc})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                开发语言主要是用于调用 API 翻译的源语言。
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-600 font-normal inline-block">
                目标语言 <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger className="block w-full">
                  <Button
                    variant="outline"
                    className="w-full justify-between font-normal"
                  >
                    <span>已选择 {targetLanguages.length} 个语言</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 w-[var(--radix-popover-trigger-width)] max-h-[300px] overflow-y-auto"
                  align="start"
                >
                  <div className="p-1">
                    {languageConfig.map((lang) => {
                      const isSelected = targetLanguages.includes(lang.code);
                      return (
                        <div
                          key={lang.code}
                          className="relative flex justify-between cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                          onClick={() => toggleTargetLanguage(lang.code)}
                        >
                          <div className="flex items-center">
                            <div className="mr-2 flex h-4 w-4 items-center justify-center">
                              {isSelected && <Check className="h-4 w-4" />}
                            </div>
                            <span>
                              {lang.name} ({lang.desc})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-gray-400">
                目标语言是调用 AI 将源语言翻译成目标语言。
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {targetLanguages.map((code) => {
                  const lang = languageConfig.find((l) => l.code === code);
                  return (
                    <span
                      key={code}
                      className="px-2 py-1 bg-blue-50 border border-blue-100 text-blue-600 rounded text-xs"
                    >
                      {lang?.name || code}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Configuration Section */}
      <Card className="border-none">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            AI 配置 (DeepSeek)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="deepseekApiEndpoint"
              className="text-gray-600 font-normal inline-block"
            >
              API Endpoint <span className="text-red-500">*</span>
            </Label>
            <Input
              id="deepseekApiEndpoint"
              value={deepseekApiEndpoint}
              onChange={(e) => setDeepseekApiEndpoint(e.target.value)}
              placeholder="https://api.deepseek.com"
            />
            <p className="text-xs text-gray-400">
              DeepSeek API 的调用地址。
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="deepseekApiSecret"
              className="text-gray-600 font-normal inline-block"
            >
              API Secret <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="deepseekApiSecret"
                type={showApiSecret ? "text" : "password"}
                value={deepseekApiSecret}
                onChange={(e) => setDeepseekApiSecret(e.target.value)}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowApiSecret(!showApiSecret)}
                title={showApiSecret ? "隐藏 API Secret" : "显示 API Secret"}
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-400 hover:text-gray-600"
              >
                {showApiSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              用于签名请求的密钥，确保通信安全。
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemPrompt" className="text-gray-600 font-normal inline-block">
              系统提示词 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a professional translator..."
              className="min-h-[250px]"
            />
            <p className="text-xs text-gray-400">
              此提示词将作为翻译模型的系统指令，定义 AI 的行为和角色。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
