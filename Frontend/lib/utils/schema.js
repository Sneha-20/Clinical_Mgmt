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
  referral_doctor: Yup.string().when("referral_type", {
    is: "Doctor",
    then: Yup.string().required("Doctor name is required"),
  }),

  visit_details: Yup.object({
    visit_type: Yup.string().required("Visit type is required"),
    present_complaint: Yup.string().required("Select complaint"),
    test_requested: Yup.array().required("Test required"),
    notes: Yup.string().nullable(),
    appointment_date: Yup.string().required("Select date"),
  }),
});

