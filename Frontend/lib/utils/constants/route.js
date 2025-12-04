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
  
  // pages
  pages: {
    dashboard: "/dashboard",
    signup: "/signup",
    login: "/login",
    home: "/",
  },
};
export const privateRoutes = [routes.pages.dashboard];

export const notToshowForPrivate = [routes.pages.login, routes.pages.signup,routes.pages.home];
