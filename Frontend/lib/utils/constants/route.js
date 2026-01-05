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
   uploadFile: "clinical/test-uploads/",
   getTestFile: "clinical/test-results/",
   deleteTestFile: "clinical/test-upload/"
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
    signup: "/signup",
    login: "/login",
    home: "/",
  },
};
export const privateRoutes = [routes.pages.dashboard,routes.pages.userptofile];

export const notToshowForPrivate = [routes.pages.login, routes.pages.signup,routes.pages.home];
