import { Translations } from './ru'

export const en: Translations = {
  // Common
  common: {
    next: 'Next',
    back: 'Back',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    search: 'Search',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    noData: 'No data',
    yes: 'Yes',
    no: 'No',
    optional: 'optional',
    required: 'required',
  },

  // Booking steps
  bookingSteps: {
    language: 'Language',
    vehicle: 'Vehicle',
    route: 'Route',
    details: 'Details',
    confirmation: 'Confirmation',
  },

  // Vehicle selection
  vehicle: {
    title: 'Choose vehicle',
    subtitle: 'Select a suitable vehicle type',
    capacity: 'Capacity',
    passengers: 'passengers',
    luggage: 'Luggage',
    pieces: 'pieces',
    features: 'Features',
    priceFrom: 'from',
    selectVehicle: 'Select vehicle',
    availableVehicles: 'Available vehicles',
  },

  // Route selection
  route: {
    title: 'Choose route',
    subtitle: 'Specify departure and destination points',
    from: 'From',
    to: 'To',
    selectFrom: 'Select departure location',
    selectTo: 'Select destination',
    other: 'Other',
    enterFromAddress: 'Enter departure address',
    enterToAddress: 'Enter destination address',
    calculatePrice: 'Calculate price',
    calculating: 'Calculating price...',
    backToVehicles: '← Back to vehicle selection',
    unavailable: 'unavailable',
    fillAllFields: 'Please fill in all fields',
    calculationError: 'Price calculation error. Please try again.',
    loadingError: 'Loading error',
    failedToLoadLocations: 'Failed to load locations list',
    tryAgain: 'Try again',
    unavailableForVehicle: 'unavailable for selected vehicle',
  },

  // Booking form
  booking: {
    title: 'Order placement',
    subtitle: 'Check details and fill in additional information',
    orderDetails: 'Order details',
    selectedVehicle: 'Selected vehicle',
    priceBreakdown: 'Price breakdown',
    total: 'Total',
    additionalInfo: 'Additional information',
    pickupTime: 'Pickup time',
    pickupTimeHint: 'If not specified, we will contact you to confirm the time',
    notes: 'Order notes',
    notesPlaceholder: 'Special requests, number of passengers, luggage...',
    submitOrder: 'Place order',
    submitting: 'Creating order...',
    backToRoute: '← Back to route selection',
    hourlyPayment: '⏱️ Hourly payment',
    calculatedAfterTrip: 'Amount calculated after trip ends',
    tariff: 'Tariff',
    perKm: 'per 1 km',
    perHour: 'per 1 hour waiting',
    loadingTariffs: 'Loading tariffs...',
    insufficientData: 'Insufficient data to create order. Check vehicle and route selection.',
    orderCreated: 'Order created successfully!',
    orderError: 'Order creation error. Please try again.',
  },

  // Booking confirmation
  confirmation: {
    title: 'Order confirmed!',
    subtitle: 'Your order has been successfully created',
    orderNumber: 'Order #',
    orderDetails: 'Order details',
    status: 'Status',
    assignedVehicle: 'Vehicle assigned',
    vehicleWillBeAssigned: 'Vehicle will be assigned',
    distance: 'Distance',
    km: 'km',
    pickupTime: 'Pickup time',
    comments: 'Comments',
    driverInfo: 'Driver information',
    tripCost: 'Trip cost',
    orderCreated: 'Order created',
    trackOrder: 'Track order',
    contactSupport: 'Contact support',
    whatsNext: 'What\'s next?',
    whatsNextSteps: [
      '• We will find the nearest driver',
      '• You will receive a notification with details',
      '• The driver will contact you',
      '• Track status in real time',
    ],
    newOrder: '← Create new order',
    orderCreatedNotification: 'Order successfully created! A driver will contact you soon.',
  },

  // Booking statuses
  bookingStatus: {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    IN_PROGRESS: 'In progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  },

  // Location types
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

  // Formatting
  formatting: {
    sum: 'sum',
    hourly: 'Hourly',
  },

  // Pricing
  pricing: {
    baseRouteCost: 'Base route cost',
    transportDistance: 'Transport',
  },

  // Date and time picker
  datePicker: {
    selectDateTime: 'Select date and time',
    date: 'Date',
    time: 'Time',
    apply: 'Apply',
    asap: 'As soon as possible',
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
  },

  // Menu
  menu: {
    dashboard: 'Home',
    newBooking: 'New Booking',
    history: 'History',
    tariffs: 'Tariffs',
    support: 'Support',
  },

  // Dashboard
  dashboard: {
    welcome: 'Welcome',
    welcomeDesc: 'Please book your transfer in advance to guarantee availability',
    quickActions: 'Quick Actions',
    recentBookings: 'Recent Bookings',
    viewAll: 'View All',
    noBookings: 'You have no bookings yet',
    createFirst: 'Create First Booking',
    tipTitle: 'Tip',
    tipText: 'Book your transfer in advance to guarantee availability',
  },

  // Quick Actions
  actions: {
    newBooking: 'New Booking',
    newBookingDesc: 'Book a transfer',
    history: 'Booking History',
    historyDesc: 'View all bookings',
    support: 'Support',
    supportDesc: 'Contact us',
    tariffs: 'Tariffs',
    tariffsDesc: 'View prices',
  },

  // Booking History
  history: {
    title: 'Booking History',
    subtitle: 'All your bookings',
    noBookings: 'No bookings found',
    noBookingsAll: 'You have no bookings yet',
    noBookingsFilter: 'No bookings with selected filter',
    createBooking: 'Create Booking',
  },

  // Filters
  filter: {
    all: 'All',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
  },

  // Statuses
  status: {
    confirmed: 'Confirmed',
    pending: 'Pending',
    cancelled: 'Cancelled',
    completed: 'Completed',
    inProgress: 'In Progress',
  },

  // Booking Details
  bookingDetails: {
    number: 'Booking',
    passengers: 'pax',
    created: 'Created',
    viewDetails: 'View Details',
  },

  // Support
  support: {
    title: 'Customer Support',
    subtitle: 'We are always ready to help you',
    contactUs: 'Contact Us',
    phone: 'Phone',
    telegram: 'Telegram',
    email: 'Email',
    whatsapp: 'WhatsApp',
    sendMessage: 'Send Message',
    phoneNumber: 'Phone Number',
    message: 'Message',
    messagePlaceholder: 'Describe your problem or question...',
    send: 'Send',
    sending: 'Sending...',
    messageSent: 'Message sent!',
    messageSentDesc: 'We will reply to you shortly',
    faq: 'Frequently Asked Questions',
    workingHours: 'Working Hours',
    available: 'We are available 24/7 for your questions',
  },

  // FAQ
  faq: {
    booking: 'Booking',
    payment: 'Payment',
    vehicles: 'Vehicles',
    other: 'Other',
    howToBook: 'How to book a transfer?',
    howToBookAnswer: 'Click the "New Booking" button on the main page, select vehicle type, route and fill out the booking form.',
    canCancel: 'Can I cancel a booking?',
    canCancelAnswer: 'Yes, you can cancel a booking 24 hours before the trip starts without a penalty.',
    howMuchAdvance: 'How far in advance should I book?',
    howMuchAdvanceAnswer: 'We recommend booking at least 2 hours before the trip.',
    paymentMethods: 'What payment methods are available?',
    paymentMethodsAnswer: 'We accept cash, cards and e-wallets.',
    whenToPay: 'When do I need to pay?',
    whenToPayAnswer: 'Payment is made to the driver after the trip is completed.',
    vehicleTypes: 'What types of vehicles are available?',
    vehicleTypesAnswer: 'We have sedans (up to 4 people), minivans (up to 7 people) and buses (up to 50 people).',
    changeSeat: 'Can I choose a seat?',
    changeSeatAnswer: 'Yes, you can specify seat preferences when booking.',
    trackVehicle: 'Can I track the vehicle?',
    trackVehicleAnswer: 'Yes, after booking confirmation you will receive a link to track the vehicle.',
    luggage: 'What about luggage?',
    luggageAnswer: 'Standard luggage (1 suitcase per person) is included in the price. Additional luggage may incur an extra charge.',
  },

  // Tariffs
  tariffs: {
    title: 'Tariffs',
    subtitle: 'Transparent prices for all routes',
    selectVehicle: 'Select vehicle type',
    capacity: 'Capacity',
    people: 'people',
    basePrice: 'Base Price',
    perKm: 'Per Km',
    popularRoutes: 'Popular Routes',
    from: 'from',
    book: 'Book',
    howCalculated: 'How is the price calculated?',
    calculation: 'Total cost = Base price + (Distance × Price per km)',
    additionalInfo: 'Additional services (child seat, luggage) are paid separately',
    startBooking: 'Start Booking',
  },

  // Vehicle Features
  features: {
    ac: 'Air Conditioning',
    comfort: 'Comfortable Seats',
    luggage: 'Trunk',
    spacious: 'Spacious Interior',
    bigLuggage: 'Large Trunk',
    toilet: 'Toilet',
    wifi: 'Wi-Fi',
    tv: 'TV/Video',
    recliningSeat: 'Reclining Seats',
  },
}

