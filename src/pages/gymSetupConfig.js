export const STEP_FIELD_GROUPS = {
  business: [
    { key: 'gymName', label: 'Gym name', type: 'text', required: true, placeholder: 'IronForge Fitness' },
    { key: 'legalName', label: 'Legal business name', type: 'text' },
    { key: 'ownerName', label: 'Owner name', type: 'text', required: true },
    {
      key: 'businessType',
      label: 'Business type',
      type: 'select',
      options: ['Gym', 'Fitness Center', 'CrossFit Box', 'Yoga Studio', 'Martial Arts', 'Other'],
    },
    { key: 'establishedYear', label: 'Year established', type: 'text', placeholder: '2015' },
    { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'Transform your body' },
    { key: 'about', label: 'About your gym', type: 'textarea' },
    { key: 'registrationNumber', label: 'Registration number', type: 'text' },
    { key: 'gstNumber', label: 'GST number', type: 'text' },
    { key: 'panNumber', label: 'PAN number', type: 'text' },
  ],

  contact: [
    { key: 'phones', label: 'Phone numbers', type: 'phoneList', required: true },
    { key: 'whatsapp', label: 'WhatsApp number', type: 'text' },
    { key: 'emergencyContact', label: 'Emergency contact', type: 'text' },
    { key: 'email', label: 'Email', type: 'text', required: true },
    { key: 'supportEmail', label: 'Support email', type: 'text' },
    { key: 'website', label: 'Website', type: 'text' },
    {
      key: 'socials',
      label: 'Social profiles',
      type: 'group',
      fields: [
        { key: 'instagram', label: 'Instagram', type: 'text' },
        { key: 'facebook', label: 'Facebook', type: 'text' },
        { key: 'linkedin', label: 'LinkedIn', type: 'text' },
        { key: 'youtube', label: 'YouTube', type: 'text' },
        { key: 'telegram', label: 'Telegram', type: 'text' },
        { key: 'twitter', label: 'Twitter / X', type: 'text' },
        { key: 'googleBusiness', label: 'Google Business', type: 'text' },
      ],
    },
  ],

  location: [
    { key: 'country', label: 'Country', type: 'text', required: true },
    { key: 'state', label: 'State', type: 'text', required: true },
    { key: 'city', label: 'City', type: 'text', required: true },
    { key: 'district', label: 'District', type: 'text' },
    { key: 'area', label: 'Area / locality', type: 'text' },
    { key: 'pincode', label: 'PIN code', type: 'text' },
    { key: 'street', label: 'Street address', type: 'text' },
    { key: 'landmark', label: 'Landmark', type: 'text' },
    { key: 'address', label: 'Full address', type: 'textarea' },
  ],

  hours: [
    { key: 'openTime', label: 'Opening time', type: 'time', required: true },
    { key: 'closeTime', label: 'Closing time', type: 'time', required: true },
    {
      key: 'openClosedStatus',
      label: 'Hours status',
      type: 'select',
      options: ['Open 24x7', 'Open 24h Mon-Sat', 'Open 6 AM - 10 PM', 'Open 5 AM - 11 PM', 'Custom'],
    },
    { key: 'holidays', label: 'Closed days / holidays', type: 'tags', help: 'e.g. Sunday, Diwali' },
  ],

  gymDetails: [
    { key: 'categories', label: 'Categories', type: 'tags', required: true, help: 'e.g. Gym, CrossFit, Zumba' },
    { key: 'facilitySize', label: 'Facility size (sq ft)', type: 'text' },
    { key: 'floors', label: 'Number of floors', type: 'number' },
    {
      key: 'amenities',
      label: 'Amenities',
      type: 'checkGroup',
      options: [
        'parking',
        'lockers',
        'shower',
        'steam',
        'sauna',
        'swimmingPool',
        'wifi',
        'ac',
        'music',
        'juiceBar',
        'cafe',
        'retailShop',
        'dietConsultation',
        'personalTraining',
        'groupClasses',
        'physiotherapy',
        'massage',
      ],
    },
  ],

  equipment: [
    {
      key: 'cardio',
      label: 'Cardio equipment',
      type: 'checkGroup',
      options: ['treadmills', 'cycles', 'crossTrainers', 'machines'],
    },
    {
      key: 'entrySystems',
      label: 'Entry systems',
      type: 'checkGroup',
      options: ['rfidEntry', 'biometricEntry', 'qrEntry', 'faceRecognition'],
    },
    { key: 'freeWeights', label: 'Free weights zone', type: 'checkbox' },
    { key: 'functionalArea', label: 'Functional area', type: 'checkbox' },
    { key: 'stretchingArea', label: 'Stretching area', type: 'checkbox' },
    { key: 'recoveryZone', label: 'Recovery zone', type: 'checkbox' },
    { key: 'yogaHall', label: 'Yoga hall', type: 'checkbox' },
    { key: 'danceHall', label: 'Dance hall', type: 'checkbox' },
    { key: 'crossFitZone', label: 'CrossFit zone', type: 'checkbox' },
    { key: 'reception', label: 'Reception', type: 'checkbox' },
    { key: 'waitingArea', label: 'Waiting area', type: 'checkbox' },
    { key: 'changingRoom', label: 'Changing room', type: 'checkbox' },
    { key: 'washroom', label: 'Washroom', type: 'checkbox' },
    { key: 'firstAid', label: 'First aid', type: 'checkbox' },
    { key: 'cctv', label: 'CCTV', type: 'checkbox' },
  ],

  branding: [
    { key: 'logo', label: 'Gym logo', type: 'image', folder: 'branding/logo', required: true },
    { key: 'brandColors.primary', label: 'Primary brand color', type: 'color', required: true },
    { key: 'brandColors.secondary', label: 'Secondary brand color', type: 'color' },
    { key: 'brandColors.accent', label: 'Accent color', type: 'color' },
    { key: 'brandFont', label: 'Brand font', type: 'select', options: ['Poppins', 'Inter', 'Montserrat', 'Roboto', 'Playfair Display'] },
  ],

  communication: [
    { key: 'senderName', label: 'Sender name', type: 'text', required: true, help: 'Shown as sender on SMS / WhatsApp' },
    { key: 'gymName', label: 'Gym display name', type: 'text' },
    { key: 'whatsappName', label: 'WhatsApp profile name', type: 'text' },
    { key: 'supportContact', label: 'Support contact', type: 'text' },
    { key: 'emailFooter', label: 'Email footer text', type: 'textarea' },
  ],

  billing: [
    { key: 'currency', label: 'Currency', type: 'select', required: true, options: ['INR', 'USD', 'EUR', 'GBP', 'AED'] },
    {
      key: 'timezone',
      label: 'Timezone',
      type: 'select',
      required: true,
      options: ['Asia/Kolkata', 'Asia/Dubai', 'America/New_York', 'Europe/London', 'UTC'],
    },
    {
      key: 'dateFormat',
      label: 'Date format',
      type: 'select',
      options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
    },
    { key: 'taxPercentage', label: 'Tax percentage (%)', type: 'number', required: true },
    { key: 'invoicePrefix', label: 'Invoice prefix', type: 'text', placeholder: 'INV-' },
    { key: 'receiptPrefix', label: 'Receipt prefix', type: 'text', placeholder: 'RCT-' },
    { key: 'terms', label: 'Terms & conditions', type: 'textarea' },
    { key: 'paymentMethods', label: 'Accepted payment methods', type: 'tags', help: 'cash, card, upi, bank' },
  ],

  membershipSettings: [
    { key: 'renewalReminderDays', label: 'Renewal reminder (days before)', type: 'number', required: true },
    { key: 'gracePeriod', label: 'Grace period (days)', type: 'number' },
    { key: 'lateFee', label: 'Late fee', type: 'number' },
    { key: 'autoExpire', label: 'Auto-expire memberships', type: 'checkbox' },
    { key: 'autoRenew', label: 'Auto-renew memberships', type: 'checkbox' },
    { key: 'allowFreeze', label: 'Allow membership freeze', type: 'checkbox' },
    { key: 'allowPause', label: 'Allow membership pause', type: 'checkbox' },
    { key: 'allowTransfer', label: 'Allow membership transfer', type: 'checkbox' },
    { key: 'cancellationPolicy', label: 'Cancellation policy', type: 'textarea' },
    { key: 'refundPolicy', label: 'Refund policy', type: 'textarea' },
  ],

  staff: [
    {
      key: 'roles',
      label: 'Staff roles',
      type: 'objectList',
      help: 'Add roles like Manager, Receptionist, Trainer',
      subfields: [
        { key: 'name', label: 'Role name', type: 'text' },
        { key: 'permissions', label: 'Permissions', type: 'tags' },
      ],
    },
    { key: 'allowAttendance', label: 'Enable attendance tracking', type: 'checkbox' },
    { key: 'payrollReady', label: 'Payroll-ready exports', type: 'checkbox' },
  ],

  branches: [
    {
      key: 'branches',
      label: 'Branches',
      type: 'objectList',
      subfields: [
        { key: 'name', label: 'Branch name', type: 'text' },
        { key: 'manager', label: 'Manager', type: 'text' },
        { key: 'phone', label: 'Phone', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'city', label: 'City', type: 'text' },
        { key: 'openTime', label: 'Open time', type: 'time' },
        { key: 'closeTime', label: 'Close time', type: 'time' },
        { key: 'address', label: 'Address', type: 'text' },
      ],
    },
  ],

  dashboardPrefs: [
    {
      key: 'defaultLandingPage',
      label: 'Default landing page',
      type: 'select',
      options: ['Dashboard', 'Members', 'Memberships', 'Analytics', 'Payments'],
    },
    { key: 'compactMode', label: 'Compact mode', type: 'checkbox' },
    { key: 'favoriteModules', label: 'Favorite modules', type: 'tags' },
    { key: 'quickActions', label: 'Quick actions', type: 'tags' },
  ],

  notificationSettings: [
    { key: 'desktop', label: 'Desktop notifications', type: 'checkbox' },
    { key: 'push', label: 'Push notifications', type: 'checkbox' },
    { key: 'email', label: 'Email notifications', type: 'checkbox' },
    { key: 'sms', label: 'SMS notifications', type: 'checkbox' },
    { key: 'whatsapp', label: 'WhatsApp notifications', type: 'checkbox' },
    { key: 'sound', label: 'Sound alerts', type: 'checkbox' },
    { key: 'reminderDays', label: 'Reminder days before expiry', type: 'number' },
    {
      key: 'digestFrequency',
      label: 'Digest frequency',
      type: 'select',
      options: ['Daily', 'Weekly', 'Monthly'],
    },
  ],

  security: [
    { key: 'passwordPolicy.minLength', label: 'Minimum password length', type: 'number' },
    { key: 'passwordPolicy.requireNumbers', label: 'Require numbers in password', type: 'checkbox' },
    { key: 'passwordPolicy.requireSymbols', label: 'Require symbols in password', type: 'checkbox' },
    { key: 'loginAlerts', label: 'Login alerts', type: 'checkbox' },
    { key: 'deviceHistory', label: 'Track device history', type: 'checkbox' },
    { key: 'sessionManagement', label: 'Session management', type: 'checkbox' },
    { key: 'auditLogs', label: 'Audit logs', type: 'checkbox' },
    { key: 'twoFA', label: 'Two-factor authentication', type: 'checkbox' },
  ],

  documents: [
    {
      key: 'documents',
      label: 'Documents',
      type: 'objectList',
      subfields: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'type', label: 'Type', type: 'text' },
        { key: 'fileUrl', label: 'File URL', type: 'text' },
        { key: 'expiryDate', label: 'Expiry date', type: 'date' },
      ],
    },
  ],

  website: [
    { key: 'slug', label: 'Website slug', type: 'text', required: true, help: 'Your public URL will be /g/<slug>' },
    { key: 'enabledSections', label: 'Enabled sections', type: 'tags', help: 'Home, About, Services, Trainers, Gallery, Testimonials, Contact' },
    { key: 'hero.headline', label: 'Hero headline', type: 'text' },
    { key: 'hero.subheadline', label: 'Hero subheadline', type: 'text' },
    { key: 'about.text', label: 'About text', type: 'textarea' },
    { key: 'footer.text', label: 'Footer text', type: 'text' },
    { key: 'seo.title', label: 'SEO title', type: 'text' },
    { key: 'seo.description', label: 'SEO description', type: 'textarea' },
    { key: 'seo.keywords', label: 'SEO keywords', type: 'tags' },
  ],
}

export const OPTIONAL_STEP_LABELS = new Set([
  'staff',
  'branches',
  'dashboardPrefs',
  'notificationSettings',
  'security',
  'documents',
  'website',
])
