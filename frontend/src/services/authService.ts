import axios from 'axios'

const API_URL = 'http://localhost:3001/api'

// Интерфейсы
export interface AdminRole {
  SUPER_ADMIN: 'SUPER_ADMIN'
  ADMIN: 'ADMIN'
  MANAGER: 'MANAGER'
  OPERATOR: 'OPERATOR'
}

export interface Admin {
  id: number
  email: string
  firstName: string
  lastName: string
  role: keyof AdminRole
  isActive: boolean
  lastLogin?: string
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  admin: Admin
}

export interface CreateAdminRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role: keyof AdminRole
}

export interface UpdateAdminRequest {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  role?: keyof AdminRole
  isActive?: boolean
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

/**
 * Сервис для работы с аутентификацией и управлением администраторами
 */
export class AuthService {
  /**
   * Получить токен из localStorage
   */
  static getToken(): string | null {
    return localStorage.getItem('adminToken')
  }

  /**
   * Сохранить токен в localStorage
   */
  static setToken(token: string): void {
    localStorage.setItem('adminToken', token)
  }

  /**
   * Удалить токен из localStorage
   */
  static removeToken(): void {
    localStorage.removeItem('adminToken')
  }

  /**
   * Получить заголовки с токеном
   */
  static getAuthHeaders() {
    const token = this.getToken()
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  }

  /**
   * Вход администратора
   */
  static async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/admin/auth/login`, data)
      
      if (response.data.success) {
        this.setToken(response.data.data.token)
        return response.data.data
      }
      
      throw new Error(response.data.error || 'Login failed')
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Login failed')
    }
  }

  /**
   * Выход из системы
   */
  static logout(): void {
    this.removeToken()
  }

  /**
   * Проверка, авторизован ли пользователь
   */
  static isAuthenticated(): boolean {
    return !!this.getToken()
  }

  /**
   * Получить профиль текущего администратора
   */
  static async getProfile(): Promise<Admin> {
    try {
      const response = await axios.get(`${API_URL}/admin/auth/profile`, this.getAuthHeaders())
      
      if (response.data.success) {
        return response.data.data
      }
      
      throw new Error(response.data.error || 'Failed to fetch profile')
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch profile')
    }
  }

  /**
   * Изменить пароль
   */
  static async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      const response = await axios.post(
        `${API_URL}/admin/auth/change-password`,
        data,
        this.getAuthHeaders()
      )
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to change password')
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to change password')
    }
  }

  /**
   * Получить всех администраторов (только для SUPER_ADMIN)
   */
  static async getAllAdmins(): Promise<Admin[]> {
    try {
      const response = await axios.get(`${API_URL}/admin/auth/admins`, this.getAuthHeaders())
      
      if (response.data.success) {
        return response.data.data
      }
      
      throw new Error(response.data.error || 'Failed to fetch admins')
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch admins')
    }
  }

  /**
   * Создать нового администратора (только для SUPER_ADMIN)
   */
  static async createAdmin(data: CreateAdminRequest): Promise<Admin> {
    try {
      const response = await axios.post(
        `${API_URL}/admin/auth/admins`,
        data,
        this.getAuthHeaders()
      )
      
      if (response.data.success) {
        return response.data.data
      }
      
      throw new Error(response.data.error || 'Failed to create admin')
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to create admin')
    }
  }

  /**
   * Обновить администратора (только для SUPER_ADMIN)
   */
  static async updateAdmin(id: number, data: UpdateAdminRequest): Promise<Admin> {
    try {
      const response = await axios.put(
        `${API_URL}/admin/auth/admins/${id}`,
        data,
        this.getAuthHeaders()
      )
      
      if (response.data.success) {
        return response.data.data
      }
      
      throw new Error(response.data.error || 'Failed to update admin')
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to update admin')
    }
  }

  /**
   * Удалить администратора (только для SUPER_ADMIN)
   */
  static async deleteAdmin(id: number): Promise<void> {
    try {
      const response = await axios.delete(
        `${API_URL}/admin/auth/admins/${id}`,
        this.getAuthHeaders()
      )
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete admin')
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to delete admin')
    }
  }
}

export default AuthService

