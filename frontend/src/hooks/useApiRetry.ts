import { useCallback, useState } from 'react';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
}

interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: any;
}

/**
 * Хук для повторных попыток API запросов с экспоненциальной задержкой
 */
export function useApiRetry<T extends (...args: any[]) => Promise<any>>(
  apiCall: T,
  options: RetryOptions = {}
) {
  const {
    maxRetries = 3,
    initialDelay = 2000, // Увеличиваем начальную задержку до 2 секунд
    maxDelay = 30000, // Увеличиваем максимальную задержку до 30 секунд
    backoffFactor = 3, // Увеличиваем фактор экспоненциального роста
    retryCondition = (error) => {
      // Повторяем для 429, 500, 502, 503, 504 ошибок
      const status = error?.response?.status || error?.status;
      return [429, 500, 502, 503, 504].includes(status);
    }
  } = options;

  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    retryCount: 0,
    lastError: null
  });

  const executeWithRetry = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      let attempt = 0;
      let delay = initialDelay;

      while (attempt <= maxRetries) {
        try {
          setRetryState(prev => ({
            ...prev,
            isRetrying: attempt > 0,
            retryCount: attempt
          }));

          const result = await apiCall(...args);
          
          // Успешный результат - сбрасываем состояние
          setRetryState({
            isRetrying: false,
            retryCount: 0,
            lastError: null
          });

          return result;
        } catch (error) {
          console.error(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
          
          setRetryState(prev => ({
            ...prev,
            lastError: error,
            retryCount: attempt
          }));

          // Если это последняя попытка или ошибка не подходит для повтора
          if (attempt >= maxRetries || !retryCondition(error)) {
            setRetryState(prev => ({
              ...prev,
              isRetrying: false
            }));
            throw error;
          }

          // Специальная обработка для ошибок 429 (Rate Limiting)
          const status = error?.response?.status || error?.status;
          let waitTime = delay;
          
          if (status === 429) {
            // Для ошибок rate limiting используем более длительные задержки
            waitTime = Math.min(5000 + (attempt * 10000), 60000); // От 5 до 60 секунд
            console.warn(`Rate limit exceeded, waiting ${waitTime}ms before retry...`);
          }
          
          // Ждем перед следующей попыткой
          await new Promise(resolve => setTimeout(resolve, waitTime));
          
          // Увеличиваем задержку для следующей попытки
          delay = Math.min(delay * backoffFactor, maxDelay);
          attempt++;
        }
      }

      throw new Error('Max retries exceeded');
    },
    [apiCall, maxRetries, initialDelay, maxDelay, backoffFactor, retryCondition]
  );

  return {
    executeWithRetry,
    ...retryState
  };
}

/**
 * Хук для создания устойчивого к ошибкам API клиента
 */
export function useResilientApi() {
  const [requestCount, setRequestCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const makeRequest = useCallback(
    async (url: string, options: RequestInit = {}) => {
      setRequestCount(prev => prev + 1);

      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const error = new Error(errorData.error || `HTTP ${response.status}`);
          (error as any).status = response.status;
          (error as any).response = response;
          throw error;
        }

        const data = await response.json();
        return data;
      } catch (error) {
        setErrorCount(prev => prev + 1);
        throw error;
      }
    },
    []
  );

  const { executeWithRetry, isRetrying, retryCount, lastError } = useApiRetry(makeRequest);

  return {
    makeRequest: executeWithRetry,
    isRetrying,
    retryCount,
    lastError,
    requestCount,
    errorCount,
    successRate: requestCount > 0 ? ((requestCount - errorCount) / requestCount * 100).toFixed(1) : '100'
  };
}
