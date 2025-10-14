export const ru = {
  // Общие
  common: {
    next: 'Далее',
    back: 'Назад',
    cancel: 'Отмена',
    confirm: 'Подтвердить',
    save: 'Сохранить',
    delete: 'Удалить',
    edit: 'Редактировать',
    close: 'Закрыть',
    search: 'Поиск',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    noData: 'Нет данных',
    yes: 'Да',
    no: 'Нет',
    optional: 'опционально',
    required: 'обязательно',
  },

  // Шаги бронирования
  bookingSteps: {
    language: 'Язык',
    vehicle: 'Транспорт',
    route: 'Маршрут',
    details: 'Данные',
    confirmation: 'Подтверждение',
  },

  // Выбор транспорта
  vehicle: {
    title: 'Выберите транспорт',
    subtitle: 'Выберите подходящий тип транспорта',
    capacity: 'Вместимость',
    passengers: 'пассажиров',
    luggage: 'Багаж',
    pieces: 'мест',
    features: 'Особенности',
    priceFrom: 'от',
    selectVehicle: 'Выбрать транспорт',
    availableVehicles: 'Доступные транспорты',
  },

  // Выбор маршрута
  route: {
    title: 'Выберите маршрут',
    subtitle: 'Укажите точки отправления и назначения',
    from: 'Откуда',
    to: 'Куда',
    selectFrom: 'Выберите место отправления',
    selectTo: 'Выберите место назначения',
    other: 'Другое',
    enterFromAddress: 'Введите адрес отправления',
    enterToAddress: 'Введите адрес назначения',
    calculatePrice: 'Рассчитать стоимость',
    calculating: 'Расчет стоимости...',
    backToVehicles: '← Назад к выбору транспорта',
    unavailable: 'недоступно',
    fillAllFields: 'Пожалуйста, заполните все поля',
    calculationError: 'Ошибка расчета стоимости. Попробуйте снова.',
    loadingError: 'Ошибка загрузки',
    failedToLoadLocations: 'Не удалось загрузить список локаций',
    tryAgain: 'Попробовать снова',
    unavailableForVehicle: 'недоступно для выбранного транспорта',
  },

  // Форма бронирования
  booking: {
    title: 'Оформление заказа',
    subtitle: 'Проверьте детали и заполните дополнительную информацию',
    orderDetails: 'Детали заказа',
    selectedVehicle: 'Выбранный транспорт',
    priceBreakdown: 'Расчет стоимости',
    total: 'Итого',
    additionalInfo: 'Дополнительная информация',
    pickupTime: 'Время подачи',
    pickupTimeHint: 'Если не указано, мы свяжемся с вами для уточнения времени',
    notes: 'Комментарии к заказу',
    notesPlaceholder: 'Особые пожелания, количество пассажиров, багаж...',
    submitOrder: 'Оформить заказ',
    submitting: 'Создание заказа...',
    backToRoute: '← Назад к выбору маршрута',
    hourlyPayment: '⏱️ Почасовая оплата',
    calculatedAfterTrip: 'Сумма вычисляется после окончания поездки',
    tariff: 'Тариф',
    perKm: 'за 1 км',
    perHour: 'за 1 час ожидания',
    loadingTariffs: 'Загрузка тарифов...',
    insufficientData: 'Недостаточно данных для создания заказа. Проверьте выбор транспорта и маршрута.',
    orderCreated: 'Заказ успешно создан!',
    orderError: 'Ошибка создания заказа. Попробуйте снова.',
  },

  // Подтверждение бронирования
  confirmation: {
    title: 'Заказ подтвержден!',
    subtitle: 'Ваш заказ успешно создан',
    orderNumber: 'Заказ №',
    orderDetails: 'Детали заказа',
    status: 'Статус',
    assignedVehicle: 'Назначен автомобиль',
    vehicleWillBeAssigned: 'Автомобиль будет назначен',
    distance: 'Расстояние',
    km: 'км',
    pickupTime: 'Время подачи',
    comments: 'Комментарии',
    driverInfo: 'Информация о водителе',
    tripCost: 'Стоимость поездки',
    orderCreated: 'Заказ создан',
    trackOrder: 'Отследить заказ',
    contactSupport: 'Связаться с поддержкой',
    whatsNext: 'Что дальше?',
    whatsNextSteps: [
      '• Мы найдем ближайшего водителя',
      '• Вы получите уведомление с деталями',
      '• Водитель свяжется с вами',
      '• Отслеживайте статус в реальном времени',
    ],
    newOrder: '← Создать новый заказ',
    orderCreatedNotification: 'Заказ успешно создан! Скоро с вами свяжется водитель.',
  },

  // Статусы заказа
  bookingStatus: {
    PENDING: 'Ожидание',
    CONFIRMED: 'Подтвержден',
    IN_PROGRESS: 'В пути',
    COMPLETED: 'Завершен',
    CANCELLED: 'Отменен',
  },

  // Типы локаций
  locationType: {
    city: '🏙️',
    airport: '✈️',
    station: '🚉',
    attraction: '🏛️',
    other: '📍',
  },

  // Футер
  footer: {
    developedBy: 'Developed by',
  },

  // Форматирование
  formatting: {
    sum: 'сум',
    hourly: 'Почасовая',
  },

  // Ценообразование
  pricing: {
    baseRouteCost: 'Базовая стоимость маршрута',
    transportDistance: 'Транспорт',
  },

  // Выбор даты и времени
  datePicker: {
    selectDateTime: 'Выберите дату и время',
    date: 'Дата',
    time: 'Время',
    apply: 'Применить',
    asap: 'В ближайшее время',
    months: [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ],
  },

  // Меню
  menu: {
    dashboard: 'Главная',
    newBooking: 'Заявка',
    history: 'История',
    tariffs: 'Тарифы',
    support: 'Поддержка',
  },

  // Дашборд
  dashboard: {
    welcome: 'Добро пожаловать',
    welcomeDesc: 'Забронируйте пожалуйста трансфер заранее, чтобы гарантировать доступность',
    quickActions: 'Быстрые действия',
    recentBookings: 'Последние заявки',
    viewAll: 'Все заявки',
    noBookings: 'У вас пока нет заявок',
    createFirst: 'Создать первую заявку',
    tipTitle: 'Совет',
    tipText: 'Забронируйте трансфер заранее, чтобы гарантировать доступность',
  },

  // Быстрые действия
  actions: {
    newBooking: 'Новая заявка',
    newBookingDesc: 'Забронировать трансфер',
    history: 'История заявок',
    historyDesc: 'Просмотр всех заявок',
    support: 'Поддержка',
    supportDesc: 'Связаться с нами',
    tariffs: 'Тарифы',
    tariffsDesc: 'Посмотреть цены',
  },

  // История заявок
  history: {
    title: 'История заявок',
    subtitle: 'Все ваши бронирования',
    noBookings: 'Заявок не найдено',
    noBookingsAll: 'У вас пока нет заявок',
    noBookingsFilter: 'Нет заявок с выбранным фильтром',
    createBooking: 'Создать заявку',
  },

  // Фильтры
  filter: {
    all: 'Все',
    active: 'Активные',
    completed: 'Завершенные',
    cancelled: 'Отмененные',
  },

  // Статусы
  status: {
    confirmed: 'Подтверждено',
    pending: 'Ожидание',
    cancelled: 'Отменено',
    completed: 'Завершено',
    inProgress: 'В пути',
  },

  // Детали заявки
  bookingDetails: {
    number: 'Заявка',
    passengers: 'пас.',
    created: 'Создано',
    viewDetails: 'Подробнее',
  },

  // Поддержка
  support: {
    title: 'Служба поддержки',
    subtitle: 'Мы всегда готовы помочь вам',
    contactUs: 'Связаться с нами',
    phone: 'Телефон',
    telegram: 'Telegram',
    email: 'Email',
    whatsapp: 'WhatsApp',
    sendMessage: 'Отправить сообщение',
    phoneNumber: 'Телефон',
    message: 'Сообщение',
    messagePlaceholder: 'Опишите вашу проблему или вопрос...',
    send: 'Отправить',
    sending: 'Отправка...',
    messageSent: 'Сообщение отправлено!',
    messageSentDesc: 'Мы ответим вам в ближайшее время',
    faq: 'Часто задаваемые вопросы',
    workingHours: 'Часы работы',
    available: 'Мы доступны 24/7 для ваших вопросов',
  },

  // FAQ
  faq: {
    booking: 'Бронирование',
    payment: 'Оплата',
    vehicles: 'Транспорт',
    other: 'Другое',
    howToBook: 'Как забронировать трансфер?',
    howToBookAnswer: 'Нажмите на кнопку "Новая заявка" на главной странице, выберите тип транспорта, маршрут и заполните форму бронирования.',
    canCancel: 'Можно ли отменить бронирование?',
    canCancelAnswer: 'Да, вы можете отменить бронирование за 24 часа до начала поездки без штрафа.',
    howMuchAdvance: 'За сколько нужно бронировать?',
    howMuchAdvanceAnswer: 'Рекомендуем бронировать минимум за 2 часа до поездки.',
    paymentMethods: 'Какие способы оплаты доступны?',
    paymentMethodsAnswer: 'Мы принимаем наличные, карты и электронные кошельки.',
    whenToPay: 'Когда нужно платить?',
    whenToPayAnswer: 'Оплата производится водителю после завершения поездки.',
    vehicleTypes: 'Какие типы транспорта доступны?',
    vehicleTypesAnswer: 'У нас есть седаны (до 4 человек), минивэны (до 7 человек) и автобусы (до 50 человек).',
    changeSeat: 'Можно ли выбрать место?',
    changeSeatAnswer: 'Да, при бронировании вы можете указать пожелания по месту.',
    trackVehicle: 'Можно ли отследить машину?',
    trackVehicleAnswer: 'Да, после подтверждения заявки вы получите ссылку для отслеживания транспорта.',
    luggage: 'Как насчет багажа?',
    luggageAnswer: 'В стоимость входит стандартный багаж (1 чемодан на человека). За дополнительный багаж может взиматься доплата.',
  },

  // Тарифы
  tariffs: {
    title: 'Тарифы',
    subtitle: 'Прозрачные цены на все маршруты',
    selectVehicle: 'Выберите тип транспорта',
    capacity: 'Вместимость',
    people: 'чел.',
    basePrice: 'Базовая цена',
    perKm: 'За км',
    popularRoutes: 'Популярные маршруты',
    from: 'от',
    book: 'Забронировать',
    howCalculated: 'Как рассчитывается цена?',
    calculation: 'Итоговая стоимость = Базовая цена + (Расстояние × Цена за км)',
    additionalInfo: 'Дополнительные услуги (детское кресло, багаж) оплачиваются отдельно',
    startBooking: 'Начать бронирование',
  },

  // Особенности транспорта
  features: {
    ac: 'Кондиционер',
    comfort: 'Комфортные сиденья',
    luggage: 'Багажник',
    spacious: 'Просторный салон',
    bigLuggage: 'Большой багажник',
    toilet: 'Туалет',
    wifi: 'Wi-Fi',
    tv: 'ТВ/Видео',
    recliningSeat: 'Откидные сиденья',
  },
}

export type Translations = typeof ru

