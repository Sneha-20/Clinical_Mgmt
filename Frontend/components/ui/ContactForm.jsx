"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TextArea from "@/components/ui/TextArea";

const ContactForm = ({
  submitButtonText = "Send Message",
  onSubmit,
  className = "",
  clinics = [],
}) => {
  const [formData, setFormData] = useState({
    patient_name: "",
    phone: "",
    email: "",
    clinic: "",
    purpose: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      clinic: Number(formData.clinic),
    };

    console.log("Form submitted payload:", payload);

    if (onSubmit) {
      onSubmit(payload);
    }

    setSubmitted(true);
    setFormData({
      patient_name: "",
      phone: "",
      email: "",
      clinic: "",
      purpose: "",
    });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className={`bg-card rounded-xl shadow-lg p-8 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-primaryText mb-2">
            Full Name *
          </label>
          <Input
            type="text"
            name="patient_name"
            value={formData.patient_name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-primaryText mb-2">
              Phone Number *
            </label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-primaryText mb-2">
              Email *
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-primaryText mb-2">
            Select Clinic *
          </label>
          <select
            name="clinic"
            value={formData.clinic}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
            required
          >
            <option value="">Select a clinic</option>
            {clinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name} - {clinic.city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-primaryText mb-2">
            Purpose of Visit *
          </label>
          <TextArea
            name="purpose"
            value={formData.purpose}
            onChange={handleInputChange}
            placeholder="Describe the purpose of your visit..."
            rows={4}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors duration-200"
        >
          {submitButtonText}
        </button>

        {submitted && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            ✓ Thank you! We'll get back to you soon.
          </div>
        )}
      </form>
    </div>
  );
};

export default ContactForm;
