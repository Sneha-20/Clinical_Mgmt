import * as Yup from "yup";

export const loginSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),

  clinicId: Yup.number().required("Clinic is required"),
});

export const registerSchema = Yup.object({
  fullName: Yup.string().trim().required("Full name is required"),

  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),

  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .required("Phone is required"),

  clinic_id: Yup.number().required("Clinic is required"),

  role_id: Yup.number().required("Role is required"),
});

// patient registration form validation schema

export const patientSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  age: Yup.number().required("Age is required"),
  dob: Yup.string().required("Date of birth is required"),

  gender: Yup.string().required("Gender is required"),

  phone_primary: Yup.string()
    .matches(/^[0-9]{10}$/, "Enter valid 10-digit number")
    .required("Primary phone is required"),

  phone_secondary: Yup.string().nullable(),

  city: Yup.string().required("City is required"),
  address: Yup.string().required("Address is required"),

  referral_type: Yup.string().required("Referral type is required"),
  service_type: Yup.string().required("Service type is required"),
  appointment_date: Yup.string().required("Appointment date is required"),

  referral_doctor: Yup.string().when("referral_type", {
    is: (val) => val === "doctor",   // <-- MUST be a function
    then: (schema) => schema.required("Doctor name is required"),
    otherwise: (schema) => schema.nullable(),
  }),

     visit_details: Yup.array()
    .of(
      Yup.object({
        visit_type: Yup.string().required("Visit type is required"),
      })
    )
    .min(1, "At least one visit detail is required"),
});

export const visitPatientSchema = Yup.object({
  service_type: Yup.string().required("Service type is required"),
  appointment_date: Yup.string().required("Appointment date is required"),

});

export const CaseHistorySchema = Yup.object({
  medical_history: Yup.string().required('Medical history is required'),
  family_history: Yup.string().required('Family history is required'),
  noise_exposure: Yup.string().required('This firld is required'),
  previous_ha_experience: Yup.string().required('This firld is required'),
  red_flags: Yup.string('This firld is required'),
  test_requested: Yup.array().min(1, 'Select at least one test'),
  srtValue: Yup.number().nullable(),
  sdsValue: Yup.number().nullable(),
  uclValue: Yup.number().nullable(),
})

