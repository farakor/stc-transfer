/**
 * Сервис для работы с Wialon API через JSONP
 * Обходит CORS ограничения браузера для подключения к gps.ent-en.com
 */

export interface WialonConfig {
  baseUrl: string;
  token?: string;
  username?: string;
  password?: string;
}

export interface VehiclePosition {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  timestamp: number;
  status: 'online' | 'offline' | 'moving' | 'stopped';
  driver?: string;
  fuel?: number;
  mileage?: number;
}

export interface WialonSession {
  sid: string;
  userId: number;
  userName: string;
}

class WialonJsonpService {
  private config: WialonConfig | null = null;
  private session: WialonSession | null = null;
  private baseApiUrl = '';
  private callbackCounter = 0;

  /**
   * Инициализация сервиса с конфигурацией Wialon
   */
  initialize(config: WialonConfig) {
    this.config = config;
    // Для JSONP используем базовый URL без /ajax.html
    if (config.baseUrl.includes('/wialon/ajax.html')) {
      this.baseApiUrl = config.baseUrl;
    } else {
      this.baseApiUrl = `${config.baseUrl}/ajax.html`;
    }
  }

  /**
   * Создание уникального имени callback функции
   */
  private createCallbackName(): string {
    this.callbackCounter++;
    return `wialonCallback_${Date.now()}_${this.callbackCounter}`;
  }

  /**
   * Выполнение JSONP запроса к Wialon API
   */
  private makeJsonpRequest(service: string, params: any, sid?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const callbackName = this.createCallbackName();
      
      // Создаем глобальную callback функцию
      (window as any)[callbackName] = (data: any) => {
        try {
          if (data.error) {
            reject(new Error(`Wialon API Error: ${data.error}`));
          } else {
            resolve(data);
          }
        } catch (error) {
          reject(error);
        } finally {
          // Очищаем callback функцию и script тег
          delete (window as any)[callbackName];
          const script = document.getElementById(`jsonp-${callbackName}`);
          if (script) {
            script.remove();
          }
        }
      };

      // Формируем URL для JSONP запроса
      let url = `${this.baseApiUrl}?svc=${service}`;
      if (sid) {
        url += `&sid=${sid}`;
      }
      url += `&params=${encodeURIComponent(JSON.stringify(params))}`;
      url += `&callback=${callbackName}`;

      // Создаем script тег для JSONP запроса
      const script = document.createElement('script');
      script.id = `jsonp-${callbackName}`;
      script.src = url;
      
      // Обработка ошибок загрузки
      script.onerror = () => {
        delete (window as any)[callbackName];
        reject(new Error('JSONP request failed to load'));
      };

      // Таймаут для JSONP запроса
      const timeout = setTimeout(() => {
        if ((window as any)[callbackName]) {
          delete (window as any)[callbackName];
          if (script) script.remove();
          reject(new Error('JSONP request timeout'));
        }
      }, 15000); // 15 секунд таймаут

      // Очищаем таймаут при успешном выполнении
      const originalCallback = (window as any)[callbackName];
      (window as any)[callbackName] = (data: any) => {
        clearTimeout(timeout);
        originalCallback(data);
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Авторизация в Wialon
   */
  async login(): Promise<WialonSession> {
    if (!this.config) {
      throw new Error('Wialon JSONP service not initialized. Call initialize() first.');
    }

    try {
      let response: any;
      
      if (this.config.token) {
        response = await this.makeJsonpRequest('token/login', { token: this.config.token });
      } else if (this.config.username && this.config.password) {
        response = await this.makeJsonpRequest('core/login', {
          user: this.config.username,
          password: this.config.password,
        });
      } else {
        throw new Error('No Wialon token or login/password provided in config for JSONP service.');
      }

      this.session = {
        sid: response.eid,
        userId: response.user?.id || 0,
        userName: response.user?.nm || 'Unknown',
      };

      // Установка локали после успешной авторизации
      const tzOffset = new Date().getTimezoneOffset() * -60; // Конвертируем минуты в секунды
      await this.makeJsonpRequest('render/set_locale', { tzOffset, language: 'ru' }, this.session.sid);

      return this.session;
    } catch (error: any) {
      console.error('Error during Wialon JSONP login:', error);
      throw new Error(`Wialon JSONP login failed: ${error.message}`);
    }
  }

  /**
   * Получение списка транспортных средств
   */
  async getVehicles(): Promise<any[]> {
    if (!this.session) {
      throw new Error('Not authenticated. Call login() first.');
    }

    try {
      const response = await this.makeJsonpRequest('core/search_items', {
        spec: {
          itemsType: 'avl_unit',
          propName: 'sys_name',
          propValueMask: '*',
          sortType: 'sys_name'
        },
        force: 1,
        flags: 1025, // 0x1 + 0x400 (базовые данные + позиции)
        from: 0,
        to: 0
      }, this.session.sid);

      return response.items || [];
    } catch (error: any) {
      // Если ошибка 4 (Invalid session), пытаемся переавторизоваться
      if (error.message.includes('Wialon API Error: 4')) {
        console.log('Session expired while getting vehicles, attempting to re-login...');
        try {
          await this.login();
          // Повторяем запрос с новой сессией
          const retryResponse = await this.makeJsonpRequest('core/search_items', {
            spec: {
              itemsType: 'avl_unit',
              propName: 'sys_name',
              propValueMask: '*',
              sortType: 'sys_name'
            },
            force: 1,
            flags: 1025, // 0x1 + 0x400 (базовые данные + позиции)
            from: 0,
            to: 0
          }, this.session!.sid);
          
          return retryResponse.items || [];
        } catch (retryError: any) {
          console.error('Error after re-login while getting vehicles:', retryError);
          throw new Error(`Failed to get vehicles after re-login: ${retryError.message}`);
        }
      } else {
        console.error('Error getting vehicles via JSONP:', error);
        throw new Error(`Failed to get vehicles: ${error.message}`);
      }
    }
  }

  /**
   * Обновление данных транспортных средств
   */
  async updateVehicleData(vehicleIds: number[]): Promise<void> {
    if (!this.session) {
      throw new Error('Not authenticated. Call login() first.');
    }

    if (vehicleIds.length === 0) {
      return;
    }

    try {
      await this.makeJsonpRequest('core/update_data_flags', {
        spec: vehicleIds.map(id => ({
          type: 'id',
          data: id,
          flags: 3 // 1 + 2 = базовые свойства + позиции
        }))
      }, this.session.sid);
    } catch (error: any) {
      // Если ошибка 4 (Invalid session), пытаемся переавторизоваться
      if (error.message.includes('Wialon API Error: 4')) {
        console.log('Session expired, attempting to re-login...');
        try {
          await this.login();
          // Повторяем запрос с новой сессией
          await this.makeJsonpRequest('core/update_data_flags', {
            spec: vehicleIds.map(id => ({
              type: 'id',
              data: id,
              flags: 3
            }))
          }, this.session!.sid);
        } catch (retryError: any) {
          console.error('Error after re-login:', retryError);
          throw new Error(`Failed to update vehicle data after re-login: ${retryError.message}`);
        }
      } else {
        console.error('Error updating vehicle data via JSONP:', error);
        throw new Error(`Failed to update vehicle data: ${error.message}`);
      }
    }
  }

  /**
   * Получение позиций транспортных средств с автоматическим восстановлением сессии
   */
  async getVehiclePositions(): Promise<VehiclePosition[]> {
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (!this.session) {
          console.log(`Attempt ${attempt}: No session, logging in...`);
          await this.login();
        }

        // Сначала получаем список транспорта
        const vehicles = await this.getVehicles();
        
        if (vehicles.length === 0) {
          return [];
        }

        // Пропускаем обновление данных - токен не имеет прав на update_data_flags
        // const vehicleIds = vehicles.map(v => v.id);
        // await this.updateVehicleData(vehicleIds);
        console.log('Skipping update_data_flags - using existing vehicle data');

        // Преобразуем данные в формат VehiclePosition
        const positions: VehiclePosition[] = vehicles.map(vehicle => {
          const pos = vehicle.pos;
          const now = Math.floor(Date.now() / 1000);
          
          let status: 'online' | 'offline' | 'moving' | 'stopped' = 'offline';
          
          if (pos && (now - pos.t) < 600) { // 10 минут
            const speed = pos.s || 0;
            status = speed > 5 ? 'moving' : 'stopped';
          }

          return {
            id: vehicle.id.toString(),
            name: vehicle.nm || `Транспорт ${vehicle.id}`,
            latitude: pos?.y || 0,
            longitude: pos?.x || 0,
            speed: pos?.s || 0,
            course: pos?.c || 0,
            timestamp: pos?.t || 0,
            status,
            driver: vehicle.driver?.nm || undefined,
            fuel: vehicle.fuel || undefined,
            mileage: vehicle.mileage || undefined,
          };
        });

        console.log(`Successfully got ${positions.length} vehicle positions on attempt ${attempt}`);
        return positions;
        
      } catch (error: any) {
        console.error(`Attempt ${attempt} failed:`, error);
        
        // Если ошибка 4 (Invalid session), сбрасываем сессию и пробуем снова
        if (error.message.includes('Wialon API Error: 4')) {
          console.log(`Session expired on attempt ${attempt}, clearing session...`);
          this.session = null;
          
          if (attempt < maxRetries) {
            console.log(`Retrying in 1 second... (attempt ${attempt + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        }
        
        // Если это последняя попытка или другая ошибка
        if (attempt === maxRetries) {
          console.error('All retry attempts failed');
          throw new Error(`Failed to get vehicle positions after ${maxRetries} attempts: ${error.message}`);
        }
      }
    }
    
    // Этот код никогда не должен выполниться, но TypeScript требует return
    throw new Error('Unexpected error in getVehiclePositions');
  }

  /**
   * Выход из системы
   */
  async logout(): Promise<void> {
    if (!this.session) {
      return;
    }

    try {
      await this.makeJsonpRequest('core/logout', {}, this.session.sid);
    } catch (error) {
      console.error('Error during JSONP logout:', error);
    } finally {
      this.session = null;
    }
  }

  /**
   * Получение текущей сессии
   */
  getSession(): WialonSession | null {
    return this.session;
  }

  /**
   * Проверка активности сессии
   */
  isAuthenticated(): boolean {
    return this.session !== null;
  }
}

export const wialonJsonpService = new WialonJsonpService();