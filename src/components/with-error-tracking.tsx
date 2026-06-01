'use client';

import React, { useCallback, useRef } from 'react';
import { errorDetector } from '@/lib/error-detector';
import { Button, ButtonProps } from '@/components/ui/button';

/**
 * مكون زر مع تتبع الأخطاء التلقائي
 * Button component with automatic error tracking
 */
interface TrackedButtonProps extends ButtonProps {
  trackName?: string;
  onTrackedClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

export function TrackedButton({ 
  trackName, 
  onTrackedClick, 
  children, 
  onClick,
  ...props 
}: TrackedButtonProps) {
  const handleClick = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonName = trackName || (typeof children === 'string' ? children : 'Button');
    const startTime = Date.now();

    try {
      // تنفيذ المعالج الأصلي
      if (onTrackedClick) {
        await onTrackedClick(event);
      } else if (onClick) {
        await onClick(event);
      }

      // تسجيل نجاح الإجراء
      errorDetector.logAction({
        action: `Button: ${buttonName}`,
        component: 'TrackedButton',
        success: true,
        duration: Date.now() - startTime
      });
    } catch (error: any) {
      // تسجيل فشل الإجراء
      errorDetector.logAction({
        action: `Button: ${buttonName}`,
        component: 'TrackedButton',
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      });

      // تسجيل الخطأ
      errorDetector.logError({
        type: 'ui',
        message: error.message,
        stack: error.stack,
        component: 'TrackedButton',
        action: buttonName as string
      });

      throw error;
    }
  }, [trackName, onTrackedClick, onClick, children]);

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  );
}

/**
 * Hook لتتبع أي دالة
 */
export function useTrackedCallback<T extends (...args: any[]) => any>(
  name: string,
  component: string,
  callback: T
): T {
  return useCallback(
    (async (...args: any[]) => {
      const startTime = Date.now();
      try {
        const result = await callback(...args);
        errorDetector.logAction({
          action: name,
          component,
          success: true,
          duration: Date.now() - startTime
        });
        return result;
      } catch (error: any) {
        errorDetector.logAction({
          action: name,
          component,
          success: false,
          duration: Date.now() - startTime,
          error: error.message
        });
        errorDetector.logError({
          type: 'error',
          message: error.message,
          stack: error.stack,
          component,
          action: name
        });
        throw error;
      }
    }) as T,
    [name, component, callback]
  );
}

/**
 * Hook لتتبع حالة المكون
 */
export function useComponentTracker(componentName: string) {
  const mountTime = useRef(Date.now());

  React.useEffect(() => {
    errorDetector.logAction({
      action: 'Mount',
      component: componentName,
      success: true,
      duration: Date.now() - mountTime.current
    });

    return () => {
      errorDetector.logAction({
        action: 'Unmount',
        component: componentName,
        success: true,
        duration: Date.now() - mountTime.current
      });
    };
  }, [componentName]);

  const trackEvent = useCallback(
    (eventName: string, data?: any) => {
      errorDetector.logAction({
        action: eventName,
        component: componentName,
        success: true,
        duration: 0,
        data
      });
    },
    [componentName]
  );

  const trackError = useCallback(
    (error: Error, action?: string) => {
      errorDetector.logError({
        type: 'error',
        message: error.message,
        stack: error.stack,
        component: componentName,
        action
      });
    },
    [componentName]
  );

  return { trackEvent, trackError };
}

/**
 * مكون لتغليف أي جزء من التطبيق مع تتبع الأخطاء
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  componentName: string;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorDetector.logError({
      type: 'error',
      message: error.message,
      stack: error.stack,
      component: this.props.componentName,
      data: { componentStack: errorInfo.componentStack }
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-800">
          <p className="font-medium">حدث خطأ في {this.props.componentName}</p>
          <button 
            className="mt-2 text-sm underline"
            onClick={() => this.setState({ hasError: false })}
          >
            إعادة المحاولة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
