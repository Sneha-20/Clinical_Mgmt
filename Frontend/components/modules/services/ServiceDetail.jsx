"use client";

import { useRouter } from "next/navigation";
import { servicesData } from "@/lib/utils/constants/servicesData";
import { Button } from "@/components/ui/button";

export default function ServiceDetail({ serviceId }) {
  const router = useRouter();

  // Find the service from both audiology and speech services
  const allServices = [...servicesData.audiology, ...servicesData.speech];
  const service = allServices.find((s) => s.id === serviceId);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primaryText mb-4">
            Service Not Found
          </h1>
          <Button onClick={() => router.push("/")} className="mt-6">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const categoryLabel =
    service.category === "audiology"
      ? "🔊 Audiology Service"
      : "🎤 Speech Therapy Service";

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2"
        >
          ← Back
        </Button>

        {/* Main Card */}
        <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-8 md:p-12">
            <div className="text-6xl mb-4">{service.icon}</div>
            <p className="text-lg font-semibold opacity-90 mb-2">
              {categoryLabel}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold">{service.name}</h1>
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-12">
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primaryText mb-3">
                Overview
              </h2>
              <p className="text-lg text-foreground leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Detailed Description */}
            <div className="mb-8 p-6 bg-muted/50 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-primaryText mb-3">
                About This Service
              </h2>
              <p className="text-foreground leading-relaxed">{service.details}</p>
            </div>

            {/* Key Information Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Duration Card */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">⏱️</div>
                <p className="text-muted-foreground text-sm font-medium">
                  Session Duration
                </p>
                <p className="text-2xl font-bold text-primary">
                  {service.duration}
                </p>
              </div>

              {/* Price Card */}
              <div className="bg-success/5 border border-success/20 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">💳</div>
                <p className="text-muted-foreground text-sm font-medium">
                  Service Fee
                </p>
                <p className="text-2xl font-bold text-primary">
                  {service.price}
                </p>
              </div>

              {/* Category Card */}
              <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">🏷️</div>
                <p className="text-muted-foreground text-sm font-medium">
                  Category
                </p>
                <p className="text-2xl font-bold text-primary capitalize">
                  {service.category}
                </p>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primaryText mb-4">
                Why Choose This Service?
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold text-lg">✓</span>
                  <span className="text-foreground">
                    Expert clinicians with specialized training
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold text-lg">✓</span>
                  <span className="text-foreground">
                    State-of-the-art equipment and technology
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold text-lg">✓</span>
                  <span className="text-foreground">
                    Personalized treatment plans
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold text-lg">✓</span>
                  <span className="text-foreground">
                    Evidence-based therapeutic approaches
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold text-lg">✓</span>
                  <span className="text-foreground">
                    Comprehensive follow-up and support
                  </span>
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-border">
              <Button
                size="lg"
                className="flex-1 py-6 text-lg"
                onClick={() =>
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Book This Service
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 py-6 text-lg"
                onClick={() => router.back()}
              >
                View Other Services
              </Button>
            </div>
          </div>
        </div>

        {/* Related Services Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-primaryText mb-8">
            Related Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allServices
              .filter((s) => s.id !== serviceId && s.category === service.category)
              .slice(0, 3)
              .map((relatedService) => (
                <div
                  key={relatedService.id}
                  onClick={() =>
                    router.push(`/service/${relatedService.id}`)
                  }
                  className="bg-card rounded-lg shadow-md hover:shadow-lg transition-all p-6 cursor-pointer border border-border hover:border-primary"
                >
                  <div className="text-4xl mb-3">{relatedService.icon}</div>
                  <h4 className="text-xl font-bold text-primaryText mb-2">
                    {relatedService.name}
                  </h4>
                  <p className="text-sm text-foreground mb-4">
                    {relatedService.description}
                  </p>
                  <p className="text-primary font-bold">{relatedService.price}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
