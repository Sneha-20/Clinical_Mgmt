"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ContactForm from "@/components/ui/ContactForm";

export default function AppointmentPage() {
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
            <ContactForm
              submitButtonText="Book Appointment"
              onSubmit={(data) => {
                alert(
                  "Thank you! Your appointment request has been submitted.",
                );
                console.log("Appointment form submitted:", data);
              }}
            />

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
                <p className="text-foreground mb-2">
                  Monday - Friday: 9:00 AM - 6:00 PM
                </p>
                <p className="text-foreground mb-2">
                  Saturday: 10:00 AM - 4:00 PM
                </p>
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
                    <span className="text-primary">•</span> Comprehensive
                    assessment
                  </li>
                  <li className="text-foreground flex items-start gap-2">
                    <span className="text-primary">•</span> Treatment
                    recommendations
                  </li>
                  <li className="text-foreground flex items-start gap-2">
                    <span className="text-primary">•</span> Personalized care
                    plan
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
