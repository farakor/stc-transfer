import { Translations } from './ru'

export const uz: Translations = {
  // Umumiy
  common: {
    next: 'Keyingi',
    back: 'Orqaga',
    cancel: 'Bekor qilish',
    confirm: 'Tasdiqlash',
    save: 'Saqlash',
    delete: 'O\'chirish',
    edit: 'Tahrirlash',
    close: 'Yopish',
    search: 'Qidirish',
    loading: 'Yuklanmoqda...',
    error: 'Xato',
    success: 'Muvaffaqiyatli',
    noData: 'Ma\'lumot yo\'q',
    yes: 'Ha',
    no: 'Yo\'q',
    optional: 'ixtiyoriy',
    required: 'majburiy',
  },

  // Buyurtma qadamlari
  bookingSteps: {
    language: 'Til',
    vehicle: 'Transport',
    route: 'Marshrut',
    details: 'Ma\'lumotlar',
    confirmation: 'Tasdiqlash',
  },

  // Transport tanlash
  vehicle: {
    title: 'Transportni tanlang',
    subtitle: 'Mos transport turini tanlang',
    capacity: 'Sig\'imi',
    passengers: 'yo\'lovchi',
    luggage: 'Yuk',
    pieces: 'joy',
    features: 'Xususiyatlar',
    priceFrom: 'dan',
    selectVehicle: 'Transportni tanlash',
    availableVehicles: 'Mavjud transportlar',
  },

  // Marshrut tanlash
  route: {
    title: 'Marshrutni tanlang',
    subtitle: 'Jo\'nash va borish joylarini belgilang',
    from: 'Qayerdan',
    to: 'Qayerga',
    selectFrom: 'Jo\'nash joyini tanlang',
    selectTo: 'Borish joyini tanlang',
    other: 'Boshqa',
    enterFromAddress: 'Jo\'nash manzilini kiriting',
    enterToAddress: 'Borish manzilini kiriting',
    calculatePrice: 'Narxni hisoblash',
    calculating: 'Narx hisoblanmoqda...',
    backToVehicles: '← Transport tanloviga qaytish',
    unavailable: 'mavjud emas',
    fillAllFields: 'Iltimos, barcha maydonlarni to\'ldiring',
    calculationError: 'Narxni hisoblashda xato. Qaytadan urinib ko\'ring.',
    loadingError: 'Yuklashda xato',
    failedToLoadLocations: 'Joylar ro\'yxatini yuklash amalga oshmadi',
    tryAgain: 'Qaytadan urinib ko\'ring',
    unavailableForVehicle: 'tanlangan transport uchun mavjud emas',
  },

  // Buyurtma shakli
  booking: {
    title: 'Buyurtmani rasmiylashtirish',
    subtitle: 'Tafsilotlarni tekshiring va qo\'shimcha ma\'lumotlarni to\'ldiring',
    orderDetails: 'Buyurtma tafsilotlari',
    selectedVehicle: 'Tanlangan transport',
    priceBreakdown: 'Narx hisob-kitobi',
    total: 'Jami',
    additionalInfo: 'Qo\'shimcha ma\'lumot',
    pickupTime: 'Olish vaqti',
    pickupTimeHint: 'Agar ko\'rsatilmagan bo\'lsa, biz vaqtni aniqlashtirish uchun siz bilan bog\'lanamiz',
    notes: 'Buyurtma izohlari',
    notesPlaceholder: 'Maxsus xohishlar, yo\'lovchilar soni, yuk...',
    submitOrder: 'Buyurtmani rasmiylashtirish',
    submitting: 'Buyurtma yaratilmoqda...',
    backToRoute: '← Marshrut tanloviga qaytish',
    hourlyPayment: '⏱️ Soatlik to\'lov',
    calculatedAfterTrip: 'Summa sayohat tugagandan keyin hisoblanadi',
    tariff: 'Tarif',
    perKm: '1 km uchun',
    perHour: '1 soat kutish uchun',
    loadingTariffs: 'Tariflar yuklanmoqda...',
    insufficientData: 'Buyurtma yaratish uchun ma\'lumot yetarli emas. Transport va marshrut tanlovini tekshiring.',
    orderCreated: 'Buyurtma muvaffaqiyatli yaratildi!',
    orderError: 'Buyurtma yaratishda xato. Qaytadan urinib ko\'ring.',
  },

  // Buyurtma tasdiqlanishi
  confirmation: {
    title: 'Buyurtma tasdiqlandi!',
    subtitle: 'Sizning buyurtmangiz muvaffaqiyatli yaratildi',
    orderNumber: 'Buyurtma №',
    orderDetails: 'Buyurtma tafsilotlari',
    status: 'Holat',
    assignedVehicle: 'Avtomobil tayinlandi',
    vehicleWillBeAssigned: 'Avtomobil tayinlanadi',
    distance: 'Masofa',
    km: 'km',
    pickupTime: 'Olish vaqti',
    comments: 'Izohlar',
    driverInfo: 'Haydovchi haqida ma\'lumot',
    tripCost: 'Sayohat narxi',
    orderCreated: 'Buyurtma yaratildi',
    trackOrder: 'Buyurtmani kuzatish',
    contactSupport: 'Qo\'llab-quvvatlash bilan bog\'lanish',
    whatsNext: 'Keyingi qadam?',
    whatsNextSteps: [
      '• Biz eng yaqin haydovchini topamiz',
      '• Siz tafsilotlar bilan bildirishnoma olasiz',
      '• Haydovchi siz bilan bog\'lanadi',
      '• Holatni real vaqtda kuzating',
    ],
    newOrder: '← Yangi buyurtma yaratish',
    orderCreatedNotification: 'Buyurtma muvaffaqiyatli yaratildi! Tez orada haydovchi siz bilan bog\'lanadi.',
  },

  // Buyurtma holatlari
  bookingStatus: {
    PENDING: 'Kutilmoqda',
    CONFIRMED: 'Tasdiqlangan',
    IN_PROGRESS: 'Yo\'lda',
    COMPLETED: 'Tugallangan',
    CANCELLED: 'Bekor qilingan',
  },

  // Joy turlari
  locationType: {
    city: '🏙️',
    airport: '✈️',
    station: '🚉',
    attraction: '🏛️',
    other: '📍',
  },

  // Footer
  footer: {
    developedBy: 'Developed by',
  },

  // Formatlash
  formatting: {
    sum: 'so\'m',
    hourly: 'Soatlik',
  },

  // Narxlar
  pricing: {
    baseRouteCost: 'Marshrut bazaviy narxi',
    transportDistance: 'Transport',
  },

  // Sana va vaqt tanlash
  datePicker: {
    selectDateTime: 'Sana va vaqtni tanlang',
    date: 'Sana',
    time: 'Vaqt',
    apply: 'Qo\'llash',
    asap: 'Eng yaqin vaqtda',
    months: [
      'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
      'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
    ],
  },

  // Menyu
  menu: {
    dashboard: 'Asosiy',
    newBooking: 'Yangi ariza',
    history: 'Tarix',
    tariffs: 'Tariflar',
    support: 'Yordam',
  },

  // Dashboard
  dashboard: {
    welcome: 'Xush kelibsiz',
    welcomeDesc: 'Mavjudlikni kafolatlash uchun transferni oldindan iltimos band qiling',
    quickActions: 'Tezkor harakatlar',
    recentBookings: 'Oxirgi arizalar',
    viewAll: 'Barcha arizalar',
    noBookings: 'Sizda hali arizalar yo\'q',
    createFirst: 'Birinchi arizani yaratish',
    tipTitle: 'Maslahat',
    tipText: 'Mavjudlikni kafolatlash uchun transferni oldindan band qiling',
  },

  // Tezkor harakatlar
  actions: {
    newBooking: 'Yangi ariza',
    newBookingDesc: 'Transfer band qilish',
    history: 'Arizalar tarixi',
    historyDesc: 'Barcha arizalarni ko\'rish',
    support: 'Yordam',
    supportDesc: 'Biz bilan bog\'lanish',
    tariffs: 'Tariflar',
    tariffsDesc: 'Narxlarni ko\'rish',
  },

  // Arizalar tarixi
  history: {
    title: 'Arizalar tarixi',
    subtitle: 'Barcha bronlaringiz',
    noBookings: 'Arizalar topilmadi',
    noBookingsAll: 'Sizda hali arizalar yo\'q',
    noBookingsFilter: 'Tanlangan filtr bilan arizalar yo\'q',
    createBooking: 'Ariza yaratish',
  },

  // Filtrlar
  filter: {
    all: 'Barchasi',
    active: 'Faol',
    completed: 'Tugallangan',
    cancelled: 'Bekor qilingan',
  },

  // Holatlar
  status: {
    confirmed: 'Tasdiqlangan',
    pending: 'Kutilmoqda',
    cancelled: 'Bekor qilingan',
    completed: 'Tugallangan',
    inProgress: 'Yo\'lda',
  },

  // Ariza tafsilotlari
  bookingDetails: {
    number: 'Ariza',
    passengers: 'yo\'l.',
    created: 'Yaratilgan',
    viewDetails: 'Tafsilotlar',
  },

  // Yordam
  support: {
    title: 'Qo\'llab-quvvatlash xizmati',
    subtitle: 'Biz har doim sizga yordam berishga tayyormiz',
    contactUs: 'Biz bilan bog\'lanish',
    phone: 'Telefon',
    telegram: 'Telegram',
    email: 'Email',
    whatsapp: 'WhatsApp',
    sendMessage: 'Xabar yuborish',
    phoneNumber: 'Telefon',
    message: 'Xabar',
    messagePlaceholder: 'Muammoyingiz yoki savolingizni tasvirlab bering...',
    send: 'Yuborish',
    sending: 'Yuborilmoqda...',
    messageSent: 'Xabar yuborildi!',
    messageSentDesc: 'Tez orada sizga javob beramiz',
    faq: 'Ko\'p so\'raladigan savollar',
    workingHours: 'Ish vaqti',
    available: 'Biz sizning savollaringiz uchun 24/7 mavjudmiz',
  },

  // FAQ
  faq: {
    booking: 'Bron qilish',
    payment: 'To\'lov',
    vehicles: 'Transport',
    other: 'Boshqa',
    howToBook: 'Transferni qanday band qilish mumkin?',
    howToBookAnswer: 'Asosiy sahifadagi "Yangi ariza" tugmasini bosing, transport turini, marshrutni tanlang va bron qilish shaklini to\'ldiring.',
    canCancel: 'Bronni bekor qilish mumkinmi?',
    canCancelAnswer: 'Ha, sayohat boshlanishidan 24 soat oldin jarima to\'lamasdan bronni bekor qilishingiz mumkin.',
    howMuchAdvance: 'Qancha oldindan bron qilish kerak?',
    howMuchAdvanceAnswer: 'Sayohatdan kamida 2 soat oldin bron qilishni tavsiya qilamiz.',
    paymentMethods: 'Qanday to\'lov usullari mavjud?',
    paymentMethodsAnswer: 'Biz naqd pul, kartalar va elektron hamyonlarni qabul qilamiz.',
    whenToPay: 'Qachon to\'lash kerak?',
    whenToPayAnswer: 'To\'lov sayohat tugagandan keyin haydovchiga amalga oshiriladi.',
    vehicleTypes: 'Qanday transport turlari mavjud?',
    vehicleTypesAnswer: 'Bizda sedanlar (4 kishigacha), minivenlar (7 kishigacha) va avtobuslar (50 kishigacha) bor.',
    changeSeat: 'O\'rindiqni tanlash mumkinmi?',
    changeSeatAnswer: 'Ha, bron qilishda o\'rindiq bo\'yicha istaklaringizni ko\'rsatishingiz mumkin.',
    trackVehicle: 'Mashinani kuzatish mumkinmi?',
    trackVehicleAnswer: 'Ha, ariza tasdiqlangandan keyin transportni kuzatish uchun havola olasiz.',
    luggage: 'Yuk haqida nima deysiz?',
    luggageAnswer: 'Standart yuk (1 kishi uchun 1 chamadon) narxga kiradi. Qo\'shimcha yuk uchun qo\'shimcha to\'lov talab qilinishi mumkin.',
  },

  // Tariflar
  tariffs: {
    title: 'Tariflar',
    subtitle: 'Barcha marshrutlar uchun shaffof narxlar',
    selectVehicle: 'Transport turini tanlang',
    capacity: 'Sig\'imi',
    people: 'kishi',
    basePrice: 'Bazaviy narx',
    perKm: 'Km uchun',
    popularRoutes: 'Ommabop marshrutlar',
    from: 'dan',
    book: 'Band qilish',
    howCalculated: 'Narx qanday hisoblanadi?',
    calculation: 'Jami narx = Bazaviy narx + (Masofa × Km uchun narx)',
    additionalInfo: 'Qo\'shimcha xizmatlar (bolalar o\'rindig\'i, yuk) alohida to\'lanadi',
    startBooking: 'Bronni boshlash',
  },

  // Transport xususiyatlari
  features: {
    ac: 'Konditsioner',
    comfort: 'Qulay o\'rindiqlar',
    luggage: 'Yukxona',
    spacious: 'Keng salon',
    bigLuggage: 'Katta yukxona',
    toilet: 'Tualet',
    wifi: 'Wi-Fi',
    tv: 'TV/Video',
    recliningSeat: 'Yotadigan o\'rindiqlar',
  },
}

