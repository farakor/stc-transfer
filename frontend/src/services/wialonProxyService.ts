/**
 * Сервис для работы с Wialon API через CORS-прокси
 * Обходит проблемы с CORS, используя публичные прокси-серверы
 */

export interface WialonConfig {
  baseUrl: string;
  username?: string;
  password?: string;
  token?: string;
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

class WialonProxyService {
  private config: WialonConfig | null = null;
  private session: WialonSession | null = null;
  private baseApiUrl = '';
  private currentProxy = '';

  // Список публичных CORS прокси
  private proxies = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://corsproxy.io/?',
    'https://cors-proxy.htmldriven.com/?url='
  ];

  /**
   * Инициализация сервиса с конфигурацией Wialon
   */
  initialize(config: WialonConfig) {
    this.config = config;
    this.baseApiUrl = config.baseUrl.includes('/wialon/ajax.html')
      ? config.baseUrl
      : `${config.baseUrl}/wialon/ajax.html`;
  }

  /**
   * Поиск рабочего CORS-прокси
   */
  private async findWorkingProxy(): Promise<string> {
    console.log('Поиск рабочего CORS-прокси...');

    for (const proxy of this.proxies) {
      try {
        console.log(`Тестирование прокси: ${proxy}`);

        const testUrl = `${proxy}${encodeURIComponent(this.baseApiUrl)}?svc=core/login`;
        const response = await fetch(testUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `params=${JSON.stringify({ user: 'test', password: 'test' })}`
        });

        if (response.ok) {
          this.currentProxy = proxy;
          console.log(`✅ Найден рабочий прокси: ${proxy}`);
          return proxy;
        }
      } catch (error) {
        console.log(`❌ Прокси ${proxy} не работает:`, error);
      }
    }

    throw new Error('Ни один прокси не работает');
  }

  /**
   * Выполнение запроса через CORS-прокси
   */
  private async makeProxyRequest(svc: string, params: any = {}): Promise<any> {
    if (!this.currentProxy) {
      await this.findWorkingProxy();
    }

    let url = `${this.currentProxy}${encodeURIComponent(this.baseApiUrl)}?svc=${svc}`;
    if (this.session) {
      url += `&sid=${this.session.sid}`;
    }

    const body = new URLSearchParams();
    body.append('params', JSON.stringify(params));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Авторизация в системе Wialon
   */
  async login(): Promise<WialonSession> {
    if (!this.config) {
      throw new Error('Wialon service not initialized. Call initialize() first.');
    }

    try {
      let response;

      // Выбираем метод авторизации
      if (this.config.token) {
        response = await this.makeProxyRequest('token/login', {
          token: this.config.token
        });
      } else if (this.config.username && this.config.password) {
        response = await this.makeProxyRequest('core/login', {
          user: this.config.username,
          password: this.config.password
        });
      } else {
        throw new Error('Необходимо указать либо токен, либо логин и пароль');
      }

      if (response.error) {
        throw new Error(`Wialon login error: ${response.error}`);
      }

      this.session = {
        sid: response.eid,
        userId: response.user?.id || 0,
        userName: response.user?.nm || 'Unknown'
      };

      // Устанавливаем часовой пояс
      await this.setLocale();

      return this.session;
    } catch (error) {
      console.error('Wialon proxy login failed:', error);
      throw error;
    }
  }

  /**
   * Установка локали и часового пояса
   */
  private async setLocale() {
    if (!this.session) return;

    const tzOffset = new Date().getTimezoneOffset() * -60;

    try {
      await this.makeProxyRequest('render/set_locale', {
        tzOffset,
        language: 'ru'
      });
    } catch (error) {
      console.warn('Failed to set locale:', error);
    }
  }

  /**
   * Получение списка транспортных средств
   */
  async getVehicles(): Promise<any[]> {
    if (!this.session) {
      await this.login();
    }

    try {
      const response = await this.makeProxyRequest('core/search_items', {
        spec: {
          itemsType: 'avl_unit',
          propName: 'sys_name',
          propValueMask: '*',
          sortType: 'sys_name'
        },
        force: 1,
        flags: 0x1,
        from: 0,
        to: 0
      });

      return response.items || [];
    } catch (error) {
      console.error('Failed to get vehicles:', error);
      throw error;
    }
  }

  /**
   * Получение текущих позиций транспорта
   */
  async getVehiclePositions(): Promise<VehiclePosition[]> {
    if (!this.session) {
      await this.login();
    }

    try {
      // Получаем список транспорта
      const vehicles = await this.getVehicles();

      if (!vehicles.length) {
        return [];
      }

      // Получаем актуальные данные о позициях
      const vehicleIds = vehicles.map(v => v.id);

      await this.makeProxyRequest('core/update_data_flags', {
        spec: vehicleIds.map(id => ({
          type: 'id',
          data: id,
          flags: 0x1 | 0x2
        }))
      });

      // Преобразуем данные в удобный формат
      const positions: VehiclePosition[] = [];

      for (const vehicle of vehicles) {
        const pos = vehicle.pos;
        if (!pos) continue;

        const status = this.determineVehicleStatus(vehicle);

        positions.push({
          id: vehicle.id.toString(),
          name: vehicle.nm || `Транспорт ${vehicle.id}`,
          latitude: pos.y || 0,
          longitude: pos.x || 0,
          speed: pos.s || 0,
          course: pos.c || 0,
          timestamp: pos.t || 0,
          status,
          driver: vehicle.driver?.nm,
          fuel: vehicle.fuel?.level,
          mileage: vehicle.cnm || 0
        });
      }

      return positions;
    } catch (error) {
      console.error('Failed to get vehicle positions:', error);
      throw error;
    }
  }

  /**
   * Определение статуса транспортного средства
   */
  private determineVehicleStatus(vehicle: any): VehiclePosition['status'] {
    const now = Math.floor(Date.now() / 1000);
    const lastUpdate = vehicle.pos?.t || 0;
    const timeDiff = now - lastUpdate;

    if (timeDiff > 600) {
      return 'offline';
    }

    const speed = vehicle.pos?.s || 0;

    if (speed > 5) {
      return 'moving';
    }

    if (speed <= 5) {
      return 'stopped';
    }

    return 'online';
  }

  /**
   * Выход из системы
   */
  async logout() {
    if (!this.session) return;

    try {
      await this.makeProxyRequest('core/logout');
      this.session = null;
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  /**
   * Проверка активности сессии
   */
  isSessionActive(): boolean {
    return this.session !== null;
  }

  /**
   * Получение информации о текущей сессии
   */
  getSession(): WialonSession | null {
    return this.session;
  }

  /**
   * Получение текущего прокси
   */
  getCurrentProxy(): string {
    return this.currentProxy;
  }
}

// Создаем единственный экземпляр сервиса
export const wialonProxyService = new WialonProxyService();

// Демо-данные для тестирования (когда Wialon недоступен)
export const getDemoVehiclePositions = (): VehiclePosition[] => {
  const demoPositions: VehiclePosition[] = [
    {
      id: 'demo-1',
      name: 'Автобус №1 (А123БВ)',
      latitude: 41.2995,
      longitude: 69.2401,
      speed: 45,
      course: 90,
      timestamp: Math.floor(Date.now() / 1000),
      status: 'moving',
      driver: 'Иванов И.И.',
      fuel: 75,
      mileage: 125430
    },
    {
      id: 'demo-2',
      name: 'Автобус №2 (В456ГД)',
      latitude: 41.3111,
      longitude: 69.2797,
      speed: 0,
      course: 180,
      timestamp: Math.floor(Date.now() / 1000),
      status: 'stopped',
      driver: 'Петров П.П.',
      fuel: 60,
      mileage: 98750
    },
    {
      id: 'demo-3',
      name: 'Автобус №3 (Г789ЕЖ)',
      latitude: 41.2647,
      longitude: 69.2163,
      speed: 30,
      course: 45,
      timestamp: Math.floor(Date.now() / 1000),
      status: 'moving',
      driver: 'Сидоров С.С.',
      fuel: 40,
      mileage: 87320
    },
    {
      id: 'demo-4',
      name: 'Автобус №4 (Д012ЗИ)',
      latitude: 41.3258,
      longitude: 69.2516,
      speed: 0,
      course: 270,
      timestamp: Math.floor(Date.now() / 1000) - 1200,
      status: 'offline',
      driver: 'Козлов К.К.',
      fuel: 20,
      mileage: 156890
    }
  ];

  return demoPositions;
};

export default wialonProxyService;
