export const routes = {
  // auth
  register: "/accounts/register/",
  login: "/accounts/token/",
  changepassword: "/accounts/change-password/",

  // clinical
  patientList: "/clinical/patient/visit/",
  todayPatientList:"clinical/patient/visits/today/",
  patientRegister: "/clinical/patient/register/",
  patientVisit: "/clinical/patient/visit/create/",
  searchPatient: "/clinical/patient/flat-list/",
  doctorList: "/clinical/doctor/flat-list/",
  patientProfile: "/clinical/patient/",
  receptionistDashboard:"clinical/dashboard/stats/",
  followupList: "clinical/patient-visits/followup",
  markContacted: "clinical/patient-visits/",

  // TGA Services
  tgaServiceList: "clinical/service/visit/list",
  tgaServiceDetails: "clinical/service/visit/",
  tgaServiceUpdate: "clinical/service/visit/",
  tgaServiceCreate: "clinical/service/visit/create/",

  // Service Request Dropdown Routes
  patientServiceList: "clinical/patient/service-list/",
  serviceTypes: "clinical/service/types/",
  patientDevicePurchases: "clinical/patient",
  partsUsed: "clinical/service/parts-used/",

  // Inventory Routes
  inventoryItemList: "clinical/inventory/dropdowns/",
  inventoryItemCreate: "clinical/inventory/item/create/",
  inventoryItems: "clinical/inventory/items/",
  inventorySerialNumberCreate: "clinical/inventory/serial-number/create/",
  inventoryBrandCreate: "clinical/inventory/brands/create/",
  inventoryModelCreate: "clinical/inventory/models/create/",

  audiologist:{
   appointmentList:"clinical/audiologits/queue/",
   completedTestList:"clinical/completed-tests/",
   patientCaseHistory:"clinical/patient/visit/",
   registerCaseHistory: "clinical/audiologist/test/perform/",
   registerTrialForm: "/clinical/trials/create/",
   uploadFile: "clinical/test-uploads/",
   getTestFile: "clinical/test-results/",
   deleteTestFile: "clinical/test-upload/",
   patientVisitdetails: "clinical/completed-tests/",
   trialDeviceList : "/clinical/inventory/trial-device-serials/",
   activeTrialDevice:"clinical/trials/",
   awaitingStockTrials:"clinical/trials/awaiting-stock/",
   completeAwaitingTrial:"clinical/trials/",
   allocateSerialTrial: "clinical/trials/allocate-serial/",
   inventoryDeviceList:"/clinical/device-booking/inventory/",
   deviceSerialList:"/clinical/device-booking/serial",
   bookeddevice:"clinical/trials/",
   returnDevice:"/clinical/api/inventory/return-trial-device/",
   modalList : "/clinical/inventory/trial-available-models/",
   reportCreate: "/clinical/report-create/"
  },

   billing:{
   paidBillList:"clinical/bill/paid/",
   dueBillList:"clinical/bill/pending/",
   billingDetail:"clinical/bill/visit/",
   markBillPaid:"clinical/mark-bill-paid/"
  },
  
  // Admin Routes
  adminClinics: "accounts/clinics/manager/",
  adminDailyStatus: "clinical/admin/clinic-report/",
  adminRevenueReports: "clinical/admin/revenue-reports/",
  adminInventoryStatus: "clinical/admin/inventory-status/",

  // Accounts
  accountsReceptionists: "accounts/receptionists/",
  pendingUser: "accounts/users/pending/",
  accountsUsers: "accounts/users/",
  clinicDropdown: "accounts/clinics/",
  inventoryDropdowns:"clinical/inventory/flat-list/",

  // referal doctors
  referrals: "clinical/doctor-referrals/",
  patientreferrals: "clinical/patient-referral/",
  TransferHistory: "clinical/inventory/transfer/history/",

  // transactions
  transactions: {
    list: "clinical/clinic/transactions/",
    create: "clinical/clinic/transactions/create/",
    update: "clinical/clinic/transactions/",
    delete: "clinical/clinic/transactions/",
  },

    // pages
  pages: {
    dashboard: "/dashboard/home",
    userptofile: "/dashboard/userprofile",
    patientCaseHistory: "/dashboard/case-history",
    patientVisitdetail: "/dashboard/patient/visit-details",
    followUpList: "/dashboard/receptionist/followup-list",
    servicepage:"/dashboard/tga-service",
    transactionHistory: "/dashboard/transaction-history",
    signup: "/signup",
    login: "/login",
    home: "/",
  },
};

// Public routes - accessible without login
export const publicRoutes = [
  "/",
  "/about",
  "/login",
  "/signup",
  "/services",
  "/offers"
];

// Private routes - require authentication
export const privateRoutes = [
  "/dashboard",
  "/dashboard/home",
  "/dashboard/profile",
  "/dashboard/userprofile",
  "/dashboard/case-history",
  "/dashboard/patient/visit-details",
  "/dashboard/receptionist/followup-list",
  "/dashboard/tga-service",
  "/dashboard/pending-item",
  "/dashboard/inventory",
  "/dashboard/billing",
  "/dashboard/trials",
  "/dashboard/referal-doctor",
  "/dashboard/awaiting-device",
  "/dashboard/analytics",
  "/dashboard/transfer-products",
   "/dashboard/transaction-history",
];

// Routes to hide when user is logged in
export const notToshowForPrivate = ["/login", "/signup"];

// Role-based route access control
export const roleRoutesAccess = {
  Reception: [
    "/dashboard/home",
    "/dashboard/profile",
    "/dashboard/userprofile",
    "/dashboard/pending-item",
    "/dashboard/inventory",
    "/dashboard/billing",
    "/dashboard/trials",
    "/dashboard/referal-doctor",
    "/dashboard/awaiting-device",
    "/dashboard/receptionist/followup-list",
    "/dashboard/transaction-history",
  ],
  Audiologist: [
    "/dashboard/home",
    "/dashboard/profile",
    "/dashboard/userprofile",
    "/dashboard/case-history",
    "/dashboard/patient/visit-details",
    "/dashboard/trials",
    "/dashboard/awaiting-device",
  ],
  "Speech Therapist": [
    "/dashboard/home",
    "/dashboard/profile",
    "/dashboard/userprofile",
    "/dashboard/case-history",
    "/dashboard/patient/visit-details",
  ],
  "Clinic Manager": [
    "/dashboard/home",
    "/dashboard/profile",
    "/dashboard/userprofile",
    "/dashboard/analytics",
    "/dashboard/inventory",
    "/dashboard/referal-doctor",
    "/dashboard/pending-item",
  ],
  Admin: [
    "/dashboard/home",
    "/dashboard/profile",
    "/dashboard/userprofile",
    "/dashboard/analytics",
    "/dashboard/inventory",
    "/dashboard/referal-doctor",
    "/dashboard/transfer-products",
  ],
  "Audiologist & Speech": [
    "/dashboard/home",
    "/dashboard/profile",
    "/dashboard/userprofile",
    "/dashboard/case-history",
    "/dashboard/patient/visit-details",
    "/dashboard/trials",
    "/dashboard/awaiting-device",
  ],
};
