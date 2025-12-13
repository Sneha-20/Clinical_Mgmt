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
   appointmentList:"clinical/audiologits/queue/"
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
