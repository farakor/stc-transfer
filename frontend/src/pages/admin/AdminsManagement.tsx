import React, { useState, useEffect } from 'react'
import { AuthService, Admin, CreateAdminRequest } from '../../services/authService'

const ADMIN_ROLES = [
  { value: 'SUPER_ADMIN', label: 'Супер Администратор', description: 'Полный доступ ко всему' },
  { value: 'ADMIN', label: 'Администратор', description: 'Управление заказами, водителями, автомобилями' },
  { value: 'MANAGER', label: 'Менеджер', description: 'Просмотр и базовое управление заказами' },
  { value: 'OPERATOR', label: 'Оператор', description: 'Только просмотр данных' }
]

const AdminsManagement: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)

  // Форма создания/редактирования
  const [formData, setFormData] = useState<CreateAdminRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'ADMIN'
  })

  // Загрузка списка администраторов
  const loadAdmins = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await AuthService.getAllAdmins()
      setAdmins(data)
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки администраторов')
      console.error('Error loading admins:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdmins()
  }, [])

  // Открыть модальное окно создания
  const handleOpenCreate = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'ADMIN'
    })
    setShowCreateModal(true)
  }

  // Открыть модальное окно редактирования
  const handleOpenEdit = (admin: Admin) => {
    setSelectedAdmin(admin)
    setFormData({
      email: admin.email,
      password: '', // Пароль не показываем
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role
    })
    setShowEditModal(true)
  }

  // Создать администратора
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await AuthService.createAdmin(formData)
      setShowCreateModal(false)
      loadAdmins()
      alert('Администратор успешно создан')
    } catch (err: any) {
      alert(err.message || 'Ошибка создания администратора')
    }
  }

  // Обновить администратора
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedAdmin) return
    
    try {
      const updateData: any = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      }
      
      // Если пароль указан, добавляем его
      if (formData.password) {
        updateData.password = formData.password
      }
      
      await AuthService.updateAdmin(selectedAdmin.id, updateData)
      setShowEditModal(false)
      loadAdmins()
      alert('Администратор успешно обновлен')
    } catch (err: any) {
      alert(err.message || 'Ошибка обновления администратора')
    }
  }

  // Удалить администратора
  const handleDelete = async (admin: Admin) => {
    if (!confirm(`Вы уверены, что хотите удалить администратора ${admin.firstName} ${admin.lastName}?`)) {
      return
    }
    
    try {
      await AuthService.deleteAdmin(admin.id)
      loadAdmins()
      alert('Администратор успешно удален')
    } catch (err: any) {
      alert(err.message || 'Ошибка удаления администратора')
    }
  }

  // Переключить статус активности
  const handleToggleActive = async (admin: Admin) => {
    try {
      await AuthService.updateAdmin(admin.id, {
        isActive: !admin.isActive
      })
      loadAdmins()
    } catch (err: any) {
      alert(err.message || 'Ошибка обновления статуса')
    }
  }

  // Рендер статуса
  const renderStatus = (isActive: boolean) => {
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Активен' : 'Неактивен'}
      </span>
    )
  }

  // Рендер роли
  const renderRole = (role: string) => {
    const roleInfo = ADMIN_ROLES.find(r => r.value === role)
    return (
      <span className="text-sm">
        {roleInfo?.label || role}
      </span>
    )
  }

  // Модальное окно формы
  const renderModal = (isEdit: boolean) => {
    const isOpen = isEdit ? showEditModal : showCreateModal
    const onClose = () => isEdit ? setShowEditModal(false) : setShowCreateModal(false)
    const onSubmit = isEdit ? handleUpdate : handleCreate
    const title = isEdit ? 'Редактировать администратора' : 'Создать администратора'

    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isEdit ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль'}
              </label>
              <input
                type="password"
                required={!isEdit}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={isEdit ? 'Оставьте пустым, чтобы не менять' : ''}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Фамилия
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Роль
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ADMIN_ROLES.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label} - {role.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                {isEdit ? 'Сохранить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Управление администраторами</h1>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Добавить администратора
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Имя
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Роль
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Последний вход
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {admin.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {admin.firstName} {admin.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {admin.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderRole(admin.role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderStatus(admin.isActive)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {admin.lastLogin 
                    ? new Date(admin.lastLogin).toLocaleString('ru-RU')
                    : 'Никогда'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleOpenEdit(admin)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleToggleActive(admin)}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    {admin.isActive ? 'Деактивировать' : 'Активировать'}
                  </button>
                  {admin.role !== 'SUPER_ADMIN' && (
                    <button
                      onClick={() => handleDelete(admin)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Удалить
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {admins.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Администраторы не найдены
          </div>
        )}
      </div>

      {renderModal(false)}
      {renderModal(true)}
    </div>
  )
}

export default AdminsManagement

