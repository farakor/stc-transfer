import { useCallback, useRef } from 'react';

interface ThrottleOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
}

/**
 * Хук для throttling API запросов
 * @param callback - функция для выполнения
 * @param options - опции throttling
 */
export function useThrottledApi<T extends (...args: any[]) => any>(
  callback: T,
  options: ThrottleOptions = {}
): T {
  const { delay = 3000, leading = true, trailing = true } = options; // Увеличиваем задержку до 3 секунд
  
  const lastCallTime = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastArgsRef = useRef<Parameters<T>>();

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime.current;

      lastArgsRef.current = args;

      // Если это первый вызов или прошло достаточно времени
      if (leading && (lastCallTime.current === 0 || timeSinceLastCall >= delay)) {
        lastCallTime.current = now;
        return callback(...args);
      }

      // Очищаем предыдущий timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Устанавливаем новый timeout для trailing вызова
      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          lastCallTime.current = Date.now();
          if (lastArgsRef.current) {
            callback(...lastArgsRef.current);
          }
        }, delay - timeSinceLastCall);
      }
    },
    [callback, delay, leading, trailing]
  ) as T;

  return throttledCallback;
}

/**
 * Хук для debouncing API запросов
 * @param callback - функция для выполнения
 * @param delay - задержка в миллисекундах
 */
export function useDebouncedApi<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Очищаем предыдущий timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Устанавливаем новый timeout
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
}

/**
 * Хук для создания очереди API запросов с ограничением одновременных вызовов
 */
export function useApiQueue(maxConcurrent: number = 3) {
  const queueRef = useRef<Array<() => Promise<any>>>([]);
  const runningRef = useRef<number>(0);

  const processQueue = useCallback(async () => {
    if (runningRef.current >= maxConcurrent || queueRef.current.length === 0) {
      return;
    }

    const task = queueRef.current.shift();
    if (!task) return;

    runningRef.current++;
    
    try {
      await task();
    } catch (error) {
      console.error('API queue task failed:', error);
    } finally {
      runningRef.current--;
      // Обрабатываем следующую задачу в очереди
      processQueue();
    }
  }, [maxConcurrent]);

  const enqueue = useCallback(
    (apiCall: () => Promise<any>) => {
      queueRef.current.push(apiCall);
      processQueue();
    },
    [processQueue]
  );

  return { enqueue };
}
