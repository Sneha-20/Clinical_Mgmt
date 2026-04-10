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
  // dob: Yup.string().required("Date of birth is required"),

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
    is: (val) => val === "doctor", // <-- MUST be a function
    then: (schema) => schema.required("Doctor name is required"),
    otherwise: (schema) => schema.nullable(),
  }),

  visit_details: Yup.array()
    .of(
      Yup.object({
        visit_type: Yup.string().required("Visit type is required"),
      }),
    )
    .min(1, "At least one visit detail is required"),
});

export const visitPatientSchema = Yup.object({
  service_type: Yup.string().required("Service type is required"),
  appointment_date: Yup.string().required("Appointment date is required"),
});

export const CaseHistorySchema = Yup.object({
  medical_history: Yup.string().required("Medical history is required"),
  family_history: Yup.string().required("Family history is required"),
  noise_exposure: Yup.string().required("This firld is required"),
  previous_ha_experience: Yup.string().required("This firld is required"),
  red_flags: Yup.string("This firld is required"),
  test_requested: Yup.array().min(1, "Select at least one test"),
});

export const trialGivenSchema = Yup.object({
  visit: Yup.string().required("Visit is required"),
  devices: Yup.array()
    .of(
      Yup.object({
        ear_fitted: Yup.string().required("Ear fitted is required"),
        serial_number: Yup.string().required("Serial number is required"),
        style_type: Yup.string().required("Style type is required"),

        receiver_power: Yup.string().when("style_type", {
          is: "RIC",
          then: (schema) => schema.required("Receiver power is required"),
        }),
        receiver_length: Yup.string().when("style_type", {
          is: "RIC",
          then: (schema) => schema.required("Receiver length is required"),
        }),
        dome_type: Yup.string().when("style_type", {
          is: "RIC",
          then: (schema) => schema.required("Dome type is required"),
        }),
        dome_size: Yup.string().when("style_type", {
          is: "RIC",
          then: (schema) => schema.required("Dome size is required"),
        }),

        ear_piece: Yup.string().when("style_type", {
          is: "BTE",
          then: (schema) => schema.required("Ear piece is required"),
        }),
        size: Yup.string().when(["style_type", "ear_piece"], {
          is: (style_type, ear_piece) =>
            style_type === "BTE" && ear_piece === "Universal Eartips",
          then: (schema) => schema.required("Size is required"),
        }),
        venting_type: Yup.string().when(["style_type", "ear_piece"], {
          is: (style_type, ear_piece) =>
            style_type === "BTE" && ear_piece === "Ear Mold",
          then: (schema) => schema.required("Venting type is required"),
          otherwise: (schema) =>
            schema.when("style_type", {
              is: (style_type) =>
                ["ITE", "ITC", "Custom", "CIC"].includes(style_type),
              then: (schema) => schema.required("Venting type is required"),
            }),
        }),
        vent_size: Yup.string().when(
          ["style_type", "ear_piece", "venting_type"],
          {
            is: (style_type, ear_piece, venting_type) =>
              (style_type === "BTE" &&
                ear_piece === "Ear Mold" &&
                venting_type === "Open") ||
              (["ITE", "ITC", "Custom", "CIC"].includes(style_type) &&
                venting_type === "Open"),
            then: (schema) => schema.required("Vent size is required"),
          },
        ),
        rechargeable: Yup.string().when("style_type", {
          is: (style_type) =>
            ["ITE", "ITC", "Custom", "CIC"].includes(style_type),
          then: (schema) => schema.required("Rechargable is required"),
        }),
        battery_number: Yup.string().when(["style_type", "rechargeable"], {
          is: (style_type, rechargeable) =>
            ["ITE", "ITC", "Custom", "CIC"].includes(style_type) &&
            rechargeable === "No",
          then: (schema) => schema.required("Battery no is required"),
        }),
        wireless: Yup.string().when("style_type", {
          is: (style_type) =>
            ["ITE", "ITC", "Custom", "CIC"].includes(style_type),
          then: (schema) => schema.required("Wireless is required"),
        }),
        better_ear_device: Yup.string().when("style_type", {
          is: (style_type) => ["Cross", "Bicross"].includes(style_type),
          then: (schema) => schema.required("Better ear device is required"),
        }),
        routing_device: Yup.string().when("style_type", {
          is: (style_type) => ["Cross", "Bicross"].includes(style_type),
          then: (schema) => schema.required("Routing side is required"),
        }),
      }),
    )
    .min(1, "At least one device trial is required"),

  patient_response: Yup.string().required("Patient response is required"),
  trial_start_date: Yup.date().required("Trial start date is required"),
  trial_end_date: Yup.date()
    .min(Yup.ref("trial_start_date"), "End date must be after start date")
    .required("Trial end date is required"),
  cost: Yup.number()
    .typeError("Cost must be a number")
    .required("Cost is required"),

  // gain_settings: Yup.string().required("Gain settings are required"),
});

export const transactionSchema = Yup.object({
  transaction_type: Yup.string()
    .oneOf(["Income", "Expense"], "Invalid transaction type")
    .required("Transaction type is required"),
  person_name: Yup.string().required("Person name is required"),
  category: Yup.string().required("Category is required"),
  amount: Yup.number()
    .positive("Amount must be positive")
    .required("Amount is required"),
});
