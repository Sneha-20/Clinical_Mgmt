"use client";

import MedicalBanner from "@/public/icon/medicalBanner.png";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ServicesSection from "@/components/modules/services/ServicesSection";

// --- Section Components ---

const BannerSection = () => (
  <section
    id="home"
    className="relative bg-primary text-white text-center overflow-hidden min-h-[600px] flex items-center pt-20 md:pt-0"
  >
    {/* Background Layer using <img> tag */}
    <div className="absolute inset-0 w-full h-full">
      <Image
        src={MedicalBanner}
        alt="Medical Banner Background"
        className="w-full h-full object-cover opacity-60"
      />
    </div>

    {/* Content Layer: Centered and responsive */}
    <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
      <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
        Navjeevan: Beyond Hearing, Communication Redefined.
      </h2>
      <p className="text-xl md:text-2xl mb-10 opacity-90 font-light">
        Unmuting The World: Discover the Power of Clear Communication. Whether
        you're facing hearing loss or speech challenges, Navjeevan is not just a
        problem identifier, but a solution provider for clear
        communication.{" "}
      </p>
      {/* Action button */}
      <a
        href="#contact"
        className="bg-background text-primary py-4 px-10 rounded-full text-xl font-semibold hover:bg-muted transition-all duration-300 transform hover:scale-105 inline-block shadow-xl"
      >
        Book an Appointment
      </a>
    </div>
  </section>
);

const AboutUsSection = () => (
  <section id="about" className="bg-background py-20 px-6 text-center">
    <div className="max-w-4xl mx-auto">
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
  </section>
);

const TeamSection = () => (
  <section id="team" className="bg-muted py-20 px-6">
    <div className="max-w-6xl mx-auto">
      <h3 className="text-4xl font-bold text-primaryText mb-16 text-center">
        🤝 Meet Our Specialized Team
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {/* Audiologist 1 */}
        <div className="bg-card rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-8 flex flex-col items-center text-center">
          <img
            src="/audiologist.jpg"
            alt="Chief Audiologist"
            className="w-32 h-32 rounded-full object-cover mb-6 border-4 border-primary"
          />
          <h4 className="text-2xl font-semibold text-primaryText mb-2">
            Dr. Anjali Verma (Audiologist)
          </h4>
          <p className="text-primary font-medium mb-3">
            Chief Clinical Audiologist
          </p>
          <p className="text-foreground leading-relaxed">
            **Static Content:** Dr. Verma holds a Doctorate in Audiology (Au.D.)
            and is an expert in advanced hearing aid technology, diagnostic
            evaluations, and aural rehabilitation. She specializes in
            customizing solutions for complex adult hearing loss and pediatric
            cases.
          </p>
        </div>

        {/* Speech Therapist 2 */}
        <div className="bg-card rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-8 flex flex-col items-center text-center">
          <img
            src="/speech_therapist.jpg"
            alt="Lead Speech Therapist"
            className="w-32 h-32 rounded-full object-cover mb-6 border-4 border-primary"
          />
          <h4 className="text-2xl font-semibold text-primaryText mb-2">
            Mr. Karan Singh (Speech Therapist)
          </h4>
          <p className="text-primary font-medium mb-3">
            Lead Speech-Language Pathologist (SLP)
          </p>
          <p className="text-foreground leading-relaxed">
            **Static Content:** Mr. Singh is certified in numerous specialized
            speech therapies, including fluency treatment (stuttering) and voice
            modification. His passion lies in helping children and adults find
            their confidence through clear and effective communication.
          </p>
        </div>

        {/* Owner/Founder 3 */}
        <div className="bg-card rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-8 flex flex-col items-center text-center">
          <img
            src="/owner_placeholder.jpg"
            alt="Founder"
            className="w-32 h-32 rounded-full object-cover mb-6 border-4 border-primary"
          />
          <h4 className="text-2xl font-semibold text-primaryText mb-2">
            [Owner Name]
          </h4>
          <p className="text-primary font-medium mb-3">Founder & CEO</p>
          <p className="text-foreground leading-relaxed">
            **Static Content:** The visionary behind NOIS, [Owner Name] started
            the company to bridge the gap between clinical need and
            administrative technology, ensuring every medical team member is
            empowered with efficient, modern tools.
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
            [Your Clinic Full Address Here]
          </span>
        </p>
        <p>
          <strong className="font-semibold">Phone:</strong>
          <a
            href="tel:+1234567890"
            className="text-primary hover:underline block mt-1"
          >
            (123) 456-7890
          </a>
        </p>
        <p>
          <strong className="font-semibold">Email:</strong>
          <a
            href="mailto:info@yourclinic.com"
            className="text-primary hover:underline block mt-1"
          >
            info@yourclinic.com
          </a>
        </p>
      </div>
    </div>
  </section>
);

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow pt-[4.5rem] md:pt-[5rem]">
        <BannerSection />
        <AboutUsSection />
        <ServicesSection />
        <TeamSection />
        <OwnerSection />
        <ContactSection />
      </main>
    </div>
  );
}
