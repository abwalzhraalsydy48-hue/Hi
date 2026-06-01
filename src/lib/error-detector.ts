/**
 * أداة فحص الأخطاء الشاملة
 * Error Detection & Logging System
 */

export interface ErrorLog {
  id: string;
  timestamp: Date;
  type: 'error' | 'warning' | 'info' | 'api' | 'network' | 'ui' | 'state';
  message: string;
  stack?: string;
  component?: string;
  action?: string;
  data?: any;
  resolved: boolean;
}

export interface ActionLog {
  id: string;
  timestamp: Date;
  action: string;
  component: string;
  success: boolean;
  duration: number;
  error?: string;
  data?: any;
}

class ErrorDetector {
  private static instance: ErrorDetector;
  private errors: ErrorLog[] = [];
  private actions: ActionLog[] = [];
  private maxLogs = 500;
  private listeners: Set<(log: ErrorLog | ActionLog, type: 'error' | 'action') => void> = new Set();

  static getInstance(): ErrorDetector {
    if (!ErrorDetector.instance) {
      ErrorDetector.instance = new ErrorDetector();
    }
    return ErrorDetector.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      // التقاط الأخطاء غير المعالجة
      window.addEventListener('error', (event) => {
        this.logError({
          type: 'error',
          message: event.message,
          stack: event.error?.stack,
          data: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        });
      });

      // التقاط رفض الوعود غير المعالجة
      window.addEventListener('unhandledrejection', (event) => {
        this.logError({
          type: 'error',
          message: `Unhandled Promise Rejection: ${event.reason}`,
          stack: event.reason?.stack,
          data: { reason: event.reason }
        });
      });

      // التقاط أخطاء الشبكة
      this.interceptFetch();
    }
  }

  private interceptFetch() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        this.logAction({
          action: 'FETCH',
          component: 'Network',
          success: response.ok,
          duration,
          data: { url, status: response.status, statusText: response.statusText }
        });

        if (!response.ok) {
          this.logError({
            type: 'network',
            message: `HTTP Error: ${response.status} ${response.statusText}`,
            data: { url, status: response.status }
          });
        }
        
        return response;
      } catch (error: any) {
        const duration = Date.now() - startTime;
        
        this.logAction({
          action: 'FETCH',
          component: 'Network',
          success: false,
          duration,
          error: error.message,
          data: { url }
        });

        this.logError({
          type: 'network',
          message: `Network Error: ${error.message}`,
          stack: error.stack,
          data: { url }
        });
        
        throw error;
      }
    };
  }

  logError(error: Partial<ErrorLog>) {
    const log: ErrorLog = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: error.type || 'error',
      message: error.message || 'Unknown error',
      stack: error.stack,
      component: error.component,
      action: error.action,
      data: error.data,
      resolved: false
    };

    this.errors.unshift(log);
    if (this.errors.length > this.maxLogs) {
      this.errors.pop();
    }

    this.notifyListeners(log, 'error');
    
    // طباعة في وحدة التحكم مع تنسيق
    console.error(`🔴 [${log.type.toUpperCase()}] ${log.message}`, log);
    
    return log;
  }

  logAction(action: Partial<ActionLog>) {
    const log: ActionLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action: action.action || 'Unknown',
      component: action.component || 'Unknown',
      success: action.success ?? true,
      duration: action.duration || 0,
      error: action.error,
      data: action.data
    };

    this.actions.unshift(log);
    if (this.actions.length > this.maxLogs) {
      this.actions.pop();
    }

    this.notifyListeners(log, 'action');
    
    // طباعة في وحدة التحكم مع تنسيق
    const icon = log.success ? '✅' : '❌';
    console.log(`${icon} [${log.component}] ${log.action} (${log.duration}ms)`, log.data || '');
    
    return log;
  }

  // تتبع تنفيذ دالة معينة
  async trackAction<T>(
    actionName: string,
    component: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await fn();
      this.logAction({
        action: actionName,
        component,
        success: true,
        duration: Date.now() - startTime,
        data: result
      });
      return result;
    } catch (error: any) {
      this.logAction({
        action: actionName,
        component,
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      });
      this.logError({
        type: 'error',
        message: error.message,
        stack: error.stack,
        component,
        action: actionName
      });
      throw error;
    }
  }

  // تتبع النقر على زر
  trackButtonClick(buttonName: string, component: string, handler?: () => void) {
    return (...args: any[]) => {
      const startTime = Date.now();
      try {
        const result = handler?.(...args);
        
        // إذا كان النتيجة Promise
        if (result instanceof Promise) {
          return result
            .then((res) => {
              this.logAction({
                action: `Button: ${buttonName}`,
                component,
                success: true,
                duration: Date.now() - startTime
              });
              return res;
            })
            .catch((error) => {
              this.logAction({
                action: `Button: ${buttonName}`,
                component,
                success: false,
                duration: Date.now() - startTime,
                error: error.message
              });
              this.logError({
                type: 'ui',
                message: error.message,
                stack: error.stack,
                component,
                action: buttonName
              });
              throw error;
            });
        }
        
        this.logAction({
          action: `Button: ${buttonName}`,
          component,
          success: true,
          duration: Date.now() - startTime
        });
        
        return result;
      } catch (error: any) {
        this.logAction({
          action: `Button: ${buttonName}`,
          component,
          success: false,
          duration: Date.now() - startTime,
          error: error.message
        });
        this.logError({
          type: 'ui',
          message: error.message,
          stack: error.stack,
          component,
          action: buttonName
        });
        throw error;
      }
    };
  }

  subscribe(listener: (log: ErrorLog | ActionLog, type: 'error' | 'action') => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(log: ErrorLog | ActionLog, type: 'error' | 'action') {
    this.listeners.forEach(listener => {
      try {
        listener(log, type);
      } catch (e) {
        console.error('Error in listener:', e);
      }
    });
  }

  getErrors(type?: ErrorLog['type']): ErrorLog[] {
    if (type) {
      return this.errors.filter(e => e.type === type);
    }
    return [...this.errors];
  }

  getActions(): ActionLog[] {
    return [...this.actions];
  }

  getRecentActivity(count = 50): (ErrorLog | ActionLog)[] {
    const combined = [
      ...this.errors.map(e => ({ ...e, logType: 'error' as const })),
      ...this.actions.map(a => ({ ...a, logType: 'action' as const }))
    ];
    
    return combined
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, count);
  }

  getStats() {
    return {
      totalErrors: this.errors.length,
      unresolvedErrors: this.errors.filter(e => !e.resolved).length,
      errorsByType: {
        error: this.errors.filter(e => e.type === 'error').length,
        warning: this.errors.filter(e => e.type === 'warning').length,
        network: this.errors.filter(e => e.type === 'network').length,
        api: this.errors.filter(e => e.type === 'api').length,
        ui: this.errors.filter(e => e.type === 'ui').length,
        state: this.errors.filter(e => e.type === 'state').length,
      },
      totalActions: this.actions.length,
      failedActions: this.actions.filter(a => !a.success).length,
      averageActionDuration: this.actions.length > 0
        ? this.actions.reduce((sum, a) => sum + a.duration, 0) / this.actions.length
        : 0
    };
  }

  resolveError(errorId: string) {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }

  clearLogs() {
    this.errors = [];
    this.actions = [];
  }

  exportLogs() {
    return {
      errors: this.errors,
      actions: this.actions,
      stats: this.getStats(),
      exportedAt: new Date().toISOString()
    };
  }
}

export const errorDetector = ErrorDetector.getInstance();

// Hook لاستخدام أداة الفحص
export function useErrorDetector() {
  return errorDetector;
}
