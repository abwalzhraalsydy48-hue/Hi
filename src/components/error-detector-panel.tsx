'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { errorDetector, ErrorLog, ActionLog } from '@/lib/error-detector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  Bug,
  CheckCircle,
  XCircle,
  Activity,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Wifi,
  UiIcon,
  Database,
  AlertCircle
} from 'lucide-react';

interface ErrorDetectorPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function ErrorDetectorPanel({ isOpen = true, onClose }: ErrorDetectorPanelProps) {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [actions, setActions] = useState<ActionLog[]>([]);
  const [stats, setStats] = useState(errorDetector.getStats());
  const [selectedLog, setSelectedLog] = useState<ErrorLog | ActionLog | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const unsubscribe = errorDetector.subscribe((log, type) => {
      setErrors(errorDetector.getErrors());
      setActions(errorDetector.getActions());
      setStats(errorDetector.getStats());
    });

    return unsubscribe;
  }, []);

  const getTypeIcon = (type: ErrorLog['type']) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'network': return <Wifi className="h-4 w-4 text-blue-500" />;
      case 'api': return <Database className="h-4 w-4 text-purple-500" />;
      case 'ui': return <UiIcon className="h-4 w-4 text-orange-500" />;
      case 'state': return <Activity className="h-4 w-4 text-cyan-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: ErrorLog['type']) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'network': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'api': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'ui': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'state': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleExport = useCallback(() => {
    const data = errorDetector.exportLogs();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleClear = useCallback(() => {
    errorDetector.clearLogs();
    setErrors([]);
    setActions([]);
    setStats(errorDetector.getStats());
  }, []);

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isMinimized ? 'w-80' : 'w-[500px]'}`}>
      <Card className="shadow-2xl border-2 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bug className="h-5 w-5 text-blue-500" />
              أداة فحص الأخطاء
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={stats.unresolvedErrors > 0 ? "destructive" : "default"} className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {stats.unresolvedErrors} خطأ
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="pt-0">
            <Tabs defaultValue="errors" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="errors" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  الأخطاء ({errors.length})
                </TabsTrigger>
                <TabsTrigger value="actions" className="gap-1">
                  <Zap className="h-3 w-3" />
                  الإجراءات ({actions.length})
                </TabsTrigger>
                <TabsTrigger value="stats" className="gap-1">
                  <Activity className="h-3 w-3" />
                  الإحصائيات
                </TabsTrigger>
              </TabsList>

              <TabsContent value="errors" className="mt-2">
                <ScrollArea className="h-64">
                  {errors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                      <p>لا توجد أخطاء مسجلة</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {errors.map((error) => (
                        <div
                          key={error.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                            selectedLog?.id === error.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 dark:border-gray-700'
                          }`}
                          onClick={() => setSelectedLog(selectedLog?.id === error.id ? null : error)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2">
                              {getTypeIcon(error.type)}
                              <div>
                                <p className="text-sm font-medium line-clamp-1">{error.message}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className={getTypeColor(error.type)}>
                                    {error.type}
                                  </Badge>
                                  {error.component && (
                                    <span className="text-xs text-muted-foreground">{error.component}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(error.timestamp)}
                            </span>
                          </div>
                          
                          {selectedLog?.id === error.id && (
                            <div className="mt-3 pt-3 border-t text-xs">
                              {error.stack && (
                                <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto text-[10px]">
                                  {error.stack}
                                </pre>
                              )}
                              {error.data && (
                                <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 overflow-x-auto text-[10px]">
                                  {JSON.stringify(error.data, null, 2)}
                                </pre>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="actions" className="mt-2">
                <ScrollArea className="h-64">
                  {actions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 text-gray-400 mb-2" />
                      <p>لا توجد إجراءات مسجلة</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {actions.map((action) => (
                        <div
                          key={action.id}
                          className={`p-3 rounded-lg border ${
                            action.success ? 'border-green-200 bg-green-50 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:bg-red-950'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {action.success ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <div>
                                <p className="text-sm font-medium">{action.action}</p>
                                <span className="text-xs text-muted-foreground">{action.component}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="text-xs">
                                {action.duration}ms
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">{formatTime(action.timestamp)}</p>
                            </div>
                          </div>
                          {action.error && (
                            <p className="text-xs text-red-600 mt-2">{action.error}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="stats" className="mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-red-500">{stats.totalErrors}</div>
                      <p className="text-sm text-muted-foreground">إجمالي الأخطاء</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-orange-500">{stats.unresolvedErrors}</div>
                      <p className="text-sm text-muted-foreground">أخطاء غير محلولة</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-blue-500">{stats.totalActions}</div>
                      <p className="text-sm text-muted-foreground">إجمالي الإجراءات</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-purple-500">
                        {Math.round(stats.averageActionDuration)}ms
                      </div>
                      <p className="text-sm text-muted-foreground">متوسط الاستجابة</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">الأخطاء حسب النوع:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(stats.errorsByType).map(([type, count]) => (
                      <Badge key={type} variant="outline" className="gap-1">
                        {getTypeIcon(type as ErrorLog['type'])}
                        {type}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" />
                تصدير
              </Button>
              <Button variant="outline" size="sm" onClick={handleClear}>
                <Trash2 className="h-4 w-4 mr-1" />
                مسح
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// مكون زر التبديل لإظهار/إخفاء اللوحة
export function ErrorDetectorToggle() {
  const [showPanel, setShowPanel] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    const unsubscribe = errorDetector.subscribe(() => {
      const stats = errorDetector.getStats();
      setErrorCount(stats.unresolvedErrors);
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 left-4 z-50 rounded-full h-12 w-12 shadow-lg"
        onClick={() => setShowPanel(!showPanel)}
      >
        <Bug className="h-5 w-5" />
        {errorCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {errorCount}
          </span>
        )}
      </Button>

      <ErrorDetectorPanel isOpen={showPanel} onClose={() => setShowPanel(false)} />
    </>
  );
}
