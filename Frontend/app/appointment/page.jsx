"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import TextArea from '@/components/ui/TextArea'

export default function AppointmentPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    serviceType: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you! Your appointment request has been submitted.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      serviceType: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-background py-20 px-6 pt-[6rem]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-primaryText mb-4 text-center">
          📅 Book an Appointment
        </h1>
        <p className="text-lg text-foreground text-center mb-12 max-w-2xl mx-auto">
          Schedule your consultation with our expert audiologists and speech
          therapists. Choose a time that works best for you.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
            <h2 className="text-2xl font-bold text-primaryText mb-6">
              Appointment Details
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone *
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Preferred Date *
                </label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Preferred Time *
                </label>
                <Input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Service Type *
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a service</option>
                  <option value="audiology">Audiology Service</option>
                  <option value="speech">Speech Therapy</option>
                  <option value="consultation">General Consultation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Additional Message
                </label>
                <TextArea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your concern..."
                  rows={4}
                  className="w-full p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button type="submit" className="w-full py-3 text-lg">
                Book Appointment
              </Button>
            </form>
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div className="bg-primary/10 rounded-lg p-6 border border-primary/20">
              <h3 className="text-2xl font-bold text-primary mb-4">
                📞 Contact Information
              </h3>
              <p className="text-foreground mb-4">
                <strong>Phone:</strong> (123) 456-7890
              </p>
              <p className="text-foreground mb-4">
                <strong>Email:</strong> appointments@navjeevan.com
              </p>
              <p className="text-foreground">
                <strong>Address:</strong> Clinic Location Here
              </p>
            </div>

            <div className="bg-secondary/10 rounded-lg p-6 border border-secondary/20">
              <h3 className="text-2xl font-bold text-primary mb-4">
                ⏰ Business Hours
              </h3>
              <p className="text-foreground mb-2">Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p className="text-foreground mb-2">Saturday: 10:00 AM - 4:00 PM</p>
              <p className="text-foreground">Sunday: Closed</p>
            </div>

            <div className="bg-accent/10 rounded-lg p-6 border border-accent/20">
              <h3 className="text-2xl font-bold text-primary mb-4">
                ✅ What to Expect
              </h3>
              <ul className="space-y-2">
                <li className="text-foreground flex items-start gap-2">
                  <span className="text-primary">•</span> Initial consultation
                </li>
                <li className="text-foreground flex items-start gap-2">
                  <span className="text-primary">•</span> Comprehensive assessment
                </li>
                <li className="text-foreground flex items-start gap-2">
                  <span className="text-primary">•</span> Treatment recommendations
                </li>
                <li className="text-foreground flex items-start gap-2">
                  <span className="text-primary">•</span> Personalized care plan
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}
