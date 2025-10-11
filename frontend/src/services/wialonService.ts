/**
 * Сервис для работы с Wialon API
 * Обеспечивает авторизацию и получение данных о транспорте в реальном времени
 * Поддерживает авторизацию как по токену, так и по логину/паролю
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

class WialonService {
  private config: WialonConfig | null = null;
  private session: WialonSession | null = null;
  private baseApiUrl = '';

  /**
   * Инициализация сервиса с конфигурацией Wialon
   */
  initialize(config: WialonConfig) {
    this.config = config;
    // Проверяем, есть ли уже /wialon/ajax.html в baseUrl
    if (config.baseUrl.includes('/wialon/ajax.html')) {
      this.baseApiUrl = config.baseUrl;
    } else {
      this.baseApiUrl = `${config.baseUrl}/wialon/ajax.html`;
    }
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

      // Выбираем метод авторизации в зависимости от доступных данных
      if (this.config.token) {
        // Авторизация по токену
        response = await this.makeRequest('token/login', {
          token: this.config.token
        });
      } else if (this.config.username && this.config.password) {
        // Авторизация по логину и паролю
        response = await this.makeRequest('core/login', {
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
      console.error('Wialon login failed:', error);
      throw error;
    }
  }

  /**
   * Установка локали и часового пояса
   */
  private async setLocale() {
    if (!this.session) return;

    const tzOffset = new Date().getTimezoneOffset() * -60; // В секундах

    await this.makeRequest('render/set_locale', {
      tzOffset,
      language: 'ru'
    });
  }

  /**
   * Получение списка транспортных средств
   */
  async getVehicles(): Promise<any[]> {
    if (!this.session) {
      await this.login();
    }

    try {
      const response = await this.makeRequest('core/search_items', {
        spec: {
          itemsType: 'avl_unit', // Тип объекта - транспортное средство
          propName: 'sys_name',
          propValueMask: '*',
          sortType: 'sys_name'
        },
        force: 1,
        flags: 0x1, // Базовая информация
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
      // Сначала получаем список транспорта
      const vehicles = await this.getVehicles();

      if (!vehicles.length) {
        return [];
      }

      // Получаем актуальные данные о позициях
      const vehicleIds = vehicles.map(v => v.id);

      const response = await this.makeRequest('core/update_data_flags', {
        spec: vehicleIds.map(id => ({
          type: 'id',
          data: id,
          flags: 0x1 | 0x2 // Базовая информация + позиция
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

    // Если данные старше 10 минут - оффлайн
    if (timeDiff > 600) {
      return 'offline';
    }

    const speed = vehicle.pos?.s || 0;

    // Если скорость больше 5 км/ч - движется
    if (speed > 5) {
      return 'moving';
    }

    // Если скорость меньше 5 км/ч - стоит
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
      await this.makeRequest('core/logout');
      this.session = null;
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  /**
   * Выполнение запроса к Wialon API
   */
  private async makeRequest(svc: string, params: any = {}): Promise<any> {
    const url = new URL(this.baseApiUrl);
    url.searchParams.set('svc', svc);

    if (this.session) {
      url.searchParams.set('sid', this.session.sid);
    }

    const body = new URLSearchParams();
    body.append('params', JSON.stringify(params));

    const response = await fetch(url.toString(), {
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
}

// Создаем единственный экземпляр сервиса
export const wialonService = new WialonService();

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
      timestamp: Math.floor(Date.now() / 1000) - 1200, // 20 минут назад
      status: 'offline',
      driver: 'Козлов К.К.',
      fuel: 20,
      mileage: 156890
    }
  ];

  return demoPositions;
};

export default wialonService;