"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MedicalBanner from "@/public/StaticImage/heroBanner.jpg";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ServicesSection from "@/components/modules/services/ServicesSection";

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

const ContactSection = () => (
  <section id="contact" className="bg-background py-20 px-6 text-center">
    <div className="max-w-3xl mx-auto">
      <h3 className="text-4xl font-bold text-primaryText mb-12">
        📞 Get In Touch
      </h3>
      <p className="text-lg text-foreground mb-10">
        Ready to take the next step towards better hearing or speech? Contact us
        to schedule your comprehensive evaluation or consultation.
      </p>
      <div className="space-y-6 text-xl text-primaryText">
        <p>
          <strong className="font-semibold">Address:</strong>
          <span className="block text-foreground mt-1">
            Shop No. 7, Rd, Opp. ENT Hospital, Sehaj Avenue, Majitha, Amritsar,
            Punjab 143001
          </span>
        </p>
        <p>
          <strong className="font-semibold">Phone:</strong>
          <a
            href="tel:+1234567890"
            className="text-primary hover:underline block mt-1"
          >
            098145 64444
          </a>
        </p>
        <p>
          <strong className="font-semibold">Email:</strong>
          <a
            href="mailto:info@yourclinic.com"
            className="text-primary hover:underline block mt-1"
          >
            hello@navjeevan.com
          </a>
        </p>
      </div>
    </div>
  </section>
);

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
