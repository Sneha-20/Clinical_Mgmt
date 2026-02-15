"use client";

import { useRouter } from "next/navigation";
import { servicesData } from "@/lib/utils/constants/servicesData";
import { Button } from "@/components/ui/button";

export default function SpeechServicesPage() {
  const router = useRouter();
  const services = servicesData.speech;

  const handleServiceClick = (serviceId) => {
    router.push(`/service/${serviceId}`);
  };

  return (
    <div className="min-h-screen bg-background py-20 px-6 pt-[6rem]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primaryText mb-4">
            🎤 Speech Therapy Services
          </h1>
          <p className="text-xl text-foreground max-w-3xl mx-auto">
            Professional speech and language treatment for children and adults.
            Our certified speech therapists provide personalized treatment plans
            to help you achieve clear and confident communication.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceClick(service.id)}
              className="bg-card rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 p-6 cursor-pointer border border-border hover:border-primary"
            >
              <div className="text-5xl mb-4">{service.icon}</div>

              <h3 className="text-xl font-bold text-primaryText mb-2">
                {service.name}
              </h3>

              <p className="text-foreground text-sm mb-4 line-clamp-2">
                {service.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {service.duration}
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {service.price}
                  </p>
                </div>
                <button className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-lg transition-colors">
                  →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-primary text-white rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">
            Start Your Speech Therapy Journey
          </h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Connect with our experienced speech therapists to develop your
            communication skills.
          </p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-gray-100"
            onClick={() => (window.location.href = "/appointment")}
          >
            Schedule Your Session
          </Button>
        </div>
      </div>
    </div>
  );
}
