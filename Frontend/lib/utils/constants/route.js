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
   billingDetail:"clinical/bill/visit/"
  },
  
  // pages
  pages: {
    dashboard: "/dashboard",
    userptofile: "/dashboard/userprofile",
    patientCaseHistory: "/dashboard/case-history",
    patientVisitdetail: "/dashboard/patient/visit-details",
    signup: "/signup",
    login: "/login",
    home: "/",
  },
};
export const privateRoutes = [routes.pages.dashboard,routes.pages.userptofile,routes.pages.patientCaseHistory,routes.pages.patientCaseHistory];

export const notToshowForPrivate = [routes.pages.login, routes.pages.signup,routes.pages.home];
