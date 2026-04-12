"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MedicalBanner from "@/public/StaticImage/heroBanner.jpg";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ServicesSection from "@/components/modules/services/ServicesSection";
import ContactForm from "@/components/ui/ContactForm";

// --- Section Components ---

const BannerSection = () => (
  <section id="home">
    <Image
      src={MedicalBanner}
      alt="Medical Banner Background"
      width={1640}
      height={220}
      className="max-h-[300px] object-cover"
    />
  </section>
);

const AboutUsSection = () => (
  <section id="about" className="bg-background  text-center">
    <div className="max-w-4xl mx-auto py-20 px-6">
      <h3 className="text-4xl font-bold text-primaryText mb-12">
        🌟 Navjeevan: Beyond Hearing, Communication Redefined
      </h3>
      <p className="text-lg text-foreground leading-relaxed mb-8">
        Unmuting The World: Discover the Power of Clear Communication. Whether
        you're facing hearing loss or speech challenges, Navjeevan is not just a
        problem identifier, but a solution provider for clear communication.
      </p>
      <p className="text-lg text-foreground leading-relaxed border-l-4 border-primary pl-4 py-2 bg-muted/50 rounded-md">
        **What We Treat:** From managing hearing loss, tinnitus, and balance
        disorders to addressing speech delays, voice issues, and swallowing
        difficulties, our multidisciplinary team uses state-of-the-art equipment
        and evidence-based practices to achieve measurable, life-changing
        results.
      </p>
    </div>
    <div className="bg-muted rounded-lg p-12 mb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
        <div>
          <h2 className="text-3xl font-bold text-primaryText mb-4">
            Meet Our Founder
          </h2>
          <p className="text-lg text-foreground leading-relaxed mb-4">
            Dr. Navjeevan founded our clinic with a deep commitment to quality
            care and patient-centered outcomes. Here, we blend expertise with
            compassion to transform lives through hearing and speech health.
          </p>
          <p className="text-lg text-foreground leading-relaxed">
            With over 20 years of clinical experience, he leads our team in
            setting new standards for treatment, technology, and patient trust.
          </p>
        </div>
        <div className="flex justify-center">
          <img
            src="/StaticImage/ClinicOwner.jpg"
            alt="Clinic Owner"
            className="rounded-xl max-w-full h-auto shadow-lg"
          />
        </div>
      </div>
    </div>
  </section>
);

const TeamSection = () => (
  <section id="team" className="bg-muted py-20 px-6">
    <div className="max-w-6xl mx-auto">
      <h3 className="text-4xl font-bold text-primaryText mb-16 text-center">
        🤝 Meet Our Specialized Team
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {/* Ritik Chohan - Audiologist */}
        <div className="bg-card rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-8 flex flex-col items-center text-center">
          <img
            src="/StaticImage/ritik-chohan.jpg"
            alt="Ritik Chohan"
            className="w-32 h-32 rounded-full object-cover mb-6 border-4 border-primary"
          />
          <h4 className="text-2xl font-semibold text-primaryText mb-2">
            Ritik Chohan
          </h4>
          <p className="text-primary font-medium mb-3">Audiologist</p>
          <p className="text-foreground leading-relaxed">
            Ritik specializes in comprehensive hearing assessments, hearing aid
            fittings, and rehabilitation programs. With expertise in both adult
            and pediatric audiology, he ensures personalized care for optimal
            hearing outcomes.
          </p>
        </div>

        {/* Sandeep Sharma - Audiologist */}
        <div className="bg-card rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-8 flex flex-col items-center text-center">
          <img
            src="/StaticImage/sandeep-sharma.jpg"
            alt="Sandeep Sharma"
            className="w-32 h-32 rounded-full object-cover mb-6 border-4 border-primary"
          />
          <h4 className="text-2xl font-semibold text-primaryText mb-2">
            Sandeep Sharma
          </h4>
          <p className="text-primary font-medium mb-3">Audiologist</p>
          <p className="text-foreground leading-relaxed">
            Sandeep brings extensive experience in diagnostic audiology and
            tinnitus management. He is dedicated to providing advanced hearing
            solutions and counseling services to improve patients' quality of
            life through better hearing.
          </p>
        </div>

        {/* Shaveta Verma - Speech Therapist */}
        <div className="bg-card rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-8 flex flex-col items-center text-center">
          <img
            src="/StaticImage/shaveta-sharma.jpg"
            alt="Shaveta Verma"
            className="w-32 h-32 rounded-full object-cover mb-6 border-4 border-primary"
          />
          <h4 className="text-2xl font-semibold text-primaryText mb-2">
            Shaveta Verma
          </h4>
          <p className="text-primary font-medium mb-3">Speech Therapist</p>
          <p className="text-foreground leading-relaxed">
            Shaveta specializes in speech and language therapy, working with
            patients of all ages to address communication disorders, swallowing
            difficulties, and voice rehabilitation. Her compassionate approach
            helps patients regain confidence in their communication abilities.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const OwnerSection = () => (
  <section className="bg-secondary py-20 px-6 text-white text-center">
    <div className="max-w-4xl mx-auto">
      <h3 className="text-4xl font-bold mb-12">
        💡 Our Commitment to Navjeevan
      </h3>
      <p className="text-xl leading-relaxed italic mb-8 font-light">
        "Navjeevan means 'New Life.' Our management system, NOIS, is built to
        support that promise. By simplifying the daily tasks of our doctors,
        receptionists, and administrators, we ensure that the focus remains
        entirely on delivering restorative, life-enhancing care to our patients.
        Our commitment is to technology that truly serves healthcare."
      </p>
      <p className="text-lg font-semibold">- [Owner's Name/Founder's Title]</p>
    </div>
  </section>
);

const ContactSection = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
        const response = await fetch(`${baseUrl}/clinical/clinics/`);
        const data = await response.json();
        // Adjust based on typical API response structure { data: [...] } or [...]
        setClinics(data?.data || data || []);
      } catch (error) {
        console.error("Error fetching clinics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  const mainClinic = clinics.length > 0 ? clinics[0] : null;

  return (
    <section id="contact" className="bg-background py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-4xl font-bold text-primaryText mb-16 text-center">
          📞 Get In Touch
        </h3>
        <p className="text-lg text-foreground mb-12 text-center">
          Ready to take the next step towards better hearing or speech? Contact
          us to schedule your comprehensive evaluation or consultation.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Contact Details */}
          <div className="bg-card rounded-xl shadow-lg p-8 space-y-8 h-fit">
            <div>
              <h4 className="text-2xl font-semibold text-primaryText mb-6">
                Our Locations
              </h4>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-10 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : clinics.length > 0 ? (
              <div className="space-y-10">
                {clinics.map((clinic) => (
                  <div key={clinic.id} className="border-b border-muted pb-8 last:border-0 last:pb-0">
                    <h5 className="text-xl font-bold text-primary mb-4 uppercase tracking-wide">
                      {clinic.name}
                    </h5>
                    
                    <div className="space-y-6">
                      <div className="flex flex-col">
                        <p className="text-xs text-muted-foreground font-bold mb-1 uppercase tracking-tighter">
                          Address
                        </p>
                        <p className="text-lg text-foreground leading-snug">
                          {clinic.address}, {clinic.city}, {clinic.state} {clinic.zip_code}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col">
                          <p className="text-xs text-muted-foreground font-bold mb-1 uppercase tracking-tighter">
                            Phone
                          </p>
                          <a
                            href={`tel:${clinic.phone}`}
                            className="text-lg text-primary hover:underline font-medium"
                          >
                            {clinic.phone}
                          </a>
                        </div>

                        <div className="flex flex-col">
                          <p className="text-xs text-muted-foreground font-bold mb-1 uppercase tracking-tighter">
                            Email
                          </p>
                          <a
                            href={`mailto:${clinic.email}`}
                            className="text-lg text-primary hover:underline font-medium break-all"
                          >
                            {clinic.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-destructive font-medium">Contact information currently unavailable.</p>
            )}

            <div className="bg-primary/5 rounded-lg p-6 border-l-4 border-primary mt-4">
              <p className="text-sm text-muted-foreground font-bold mb-3 uppercase tracking-tighter">
                General Operating Hours
              </p>
              <div className="space-y-1 text-foreground font-medium">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 9:00 AM - 5:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <ContactForm
            submitButtonText="Send Appointment Request"
            clinics={clinics}
            onSubmit={async (payload) => {
              try {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
                const response = await fetch(`${baseUrl}/clinical/clinic-forms/`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(payload),
                });

                if (!response.ok) {
                  throw new Error("Failed to submit appointment request");
                }

                console.log("Appointment request submitted successfully");
              } catch (error) {
                console.error("Error submitting appointment request:", error);
                // The ContactForm manages its own success state, 
                // but we log the error here for debugging.
              }
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));
    const userRole = localStorage.getItem("userRole");

    if (token && userRole) {
      router.push("/dashboard/home");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-[4.5rem] md:pt-[5rem]">
        <BannerSection />
        <AboutUsSection />
        <ServicesSection />
        <TeamSection />
        <OwnerSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
