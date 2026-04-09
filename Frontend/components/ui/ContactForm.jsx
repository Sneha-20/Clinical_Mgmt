"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TextArea from "@/components/ui/TextArea";

const ContactForm = ({
  submitButtonText = "Send Message",
  onSubmit,
  className = "",
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    age: "",
    nearbyClinic: "",
    notes: "",
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
    console.log("Form submitted:", formData);

    if (onSubmit) {
      onSubmit(formData);
    }

    setSubmitted(true);
    setFormData({
      name: "",
      phone: "",
      age: "",
      nearbyClinic: "",
      notes: "",
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
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
          />
        </div>

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
            Age
          </label>
          <Input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="Enter your age"
            min="0"
            max="150"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-primaryText mb-2">
            Nearby Clinic
          </label>
          <select
            name="nearbyClinic"
            value={formData.nearbyClinic}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select a clinic</option>
            <option value="amritsar">Amritsar Main</option>
            <option value="chandigarh">Chandigarh</option>
            <option value="ludhiana">Ludhiana</option>
            <option value="jalandhar">Jalandhar</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-primaryText mb-2">
            Problem / Notes
          </label>
          <TextArea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Describe your concerns or problems..."
            rows={4}
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
