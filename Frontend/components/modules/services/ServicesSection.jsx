"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { servicesData } from "@/lib/utils/constants/servicesData";
import { Button } from "@/components/ui/button";

export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState("audiology");
  const router = useRouter();

  const currentServices =
    activeTab === "audiology" ? servicesData.audiology : servicesData.speech;

  const handleServiceClick = (serviceId) => {
    router.push(`/service/${serviceId}`);
  };

  return (
    <section id="services" className="bg-background py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold text-primaryText mb-4">
            🏥 Services Offered
          </h3>
          <p className="text-lg text-foreground max-w-3xl mx-auto">
            Comprehensive audiology and speech therapy services designed to help
            you achieve clear communication and optimal hearing health.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab("audiology")}
            className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 ${
              activeTab === "audiology"
                ? "bg-primary text-white shadow-lg scale-105"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            🔊 Audiology Services
          </button>
          <button
            onClick={() => setActiveTab("speech")}
            className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 ${
              activeTab === "speech"
                ? "bg-primary text-white shadow-lg scale-105"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            🎤 Speech Therapy
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentServices.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceClick(service.id)}
              className="bg-card rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 p-6 cursor-pointer border border-border hover:border-primary"
            >
              {/* Icon */}
              <div className="text-5xl mb-4">{service.icon}</div>

              {/* Service Name */}
              <h4 className="text-2xl font-bold text-primaryText mb-3">
                {service.name}
              </h4>

              {/* Description */}
              <p className="text-foreground text-sm mb-4 line-clamp-2">
                {service.description}
              </p>

              {/* Details Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Duration: {service.duration}
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

        {/* CTA Button */}
        <div className="text-center mt-16">
          <Button
            size="lg"
            className="px-8 py-4 text-lg"
            onClick={() => document.getElementById("contact").scrollIntoView({ behavior: "smooth" })}
          >
            Book Your Service Today
          </Button>
        </div>
      </div>
    </section>
  );
}
