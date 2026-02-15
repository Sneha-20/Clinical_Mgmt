"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-background py-20 px-6 pt-[6rem]">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-primaryText mb-12 text-center">
          About Us
        </h1>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-primaryText mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-foreground leading-relaxed mb-4">
              Navjeevan is committed to providing world-class audiology and
              speech therapy services. Our mission is to improve communication
              and hearing health for every patient who walks through our doors.
            </p>
            <p className="text-lg text-foreground leading-relaxed">
              We believe that clear communication is fundamental to a fulfilling
              life. Through cutting-edge technology and compassionate care, we
              help our patients rediscover the joy of hearing and speaking.
            </p>
          </div>
          <div className="bg-primary/10 rounded-lg p-8 border border-primary/20">
            <h3 className="text-2xl font-bold text-primary mb-4">Our Values</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-lg">✓</span>
                <span className="text-foreground font-semibold">
                  Patient-Centered Care
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-lg">✓</span>
                <span className="text-foreground font-semibold">
                  Professional Excellence
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-lg">✓</span>
                <span className="text-foreground font-semibold">
                  Innovation & Technology
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-lg">✓</span>
                <span className="text-foreground font-semibold">
                  Compassion & Empathy
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold text-lg">✓</span>
                <span className="text-foreground font-semibold">
                  Community Impact
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-12 mb-16">
          <h2 className="text-3xl font-bold text-primaryText mb-6">
            Why Choose Navjeevan?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-bold text-primaryText mb-3">
                Expert Team
              </h3>
              <p className="text-foreground">
                Highly qualified audiologists and speech therapists with years
                of clinical experience.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-xl font-bold text-primaryText mb-3">
                Modern Technology
              </h3>
              <p className="text-foreground">
                State-of-the-art diagnostic and therapeutic equipment for
                accurate results.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-xl font-bold text-primaryText mb-3">
                Personalized Care
              </h3>
              <p className="text-foreground">
                Customized treatment plans tailored to each patient's unique
                needs.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-primary text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Our History</h2>
          <p className="text-lg lead-relaxed max-w-3xl mx-auto">
            Founded with a vision to revolutionize hearing healthcare and speech
            therapy, Navjeevan has grown to become a trusted name in the
            region. Over the years, we've helped thousands of patients restore
            their hearing and improve their communication abilities.
          </p>
        </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}
