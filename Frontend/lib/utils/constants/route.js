import ReceptionistDashboard from "@/components/modules/receptionist/Receptionistdashboard";

export const routes = {
  // auth
  register: "/accounts/register/",
  login: "/accounts/token/",

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
  inventoryDropdowns: "clinical/inventory/dropdowns/",
  inventoryItemCreate: "clinical/inventory/item/create/",
  inventoryItems: "clinical/inventory/items/",
  inventorySerialNumberCreate: "clinical/inventory/serial-number/create/",

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
   inventoryDeviceList:"/clinical/device-booking/inventory/",
   deviceSerialList:"/clinical/device-booking/serial",
   bookeddevice:"clinical/trials/"
  },

   billing:{
   paidBillList:"clinical/bill/paid/",
   dueBillList:"clinical/bill/pending/",
   billingDetail:"clinical/bill/visit/",
   markBillPaid:"clinical/mark-bill-paid/"
  },
  
  // pages
  pages: {
    dashboard: "/dashboard",
    userptofile: "/dashboard/userprofile",
    patientCaseHistory: "/dashboard/case-history",
    patientVisitdetail: "/dashboard/patient/visit-details",
    followUpList: "/dashboard/receptionist/followup-list",
    signup: "/signup",
    login: "/login",
    home: "/",
    servicepage:"/dashboard/tga-service"
  },

  // Admin Routes
  adminClinics: "clinical/admin/clinics/",
  adminDailyStatus: "clinical/admin/clinic-report/",
  adminRevenueReports: "clinical/admin/revenue-reports/",
  adminInventoryStatus: "clinical/admin/inventory-status/",

  // Accounts
  accountsReceptionists: "accounts/receptionists/",
  accountsUsers: "accounts/users/",
};
export const privateRoutes = [routes.pages.dashboard,routes.pages.userptofile,routes.pages.patientCaseHistory,routes.pages.followUpList,routes.pages.servicepage];

export const notToshowForPrivate = [routes.pages.login, routes.pages.signup,routes.pages.home];
