"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function OffersPage() {
  const offers = [
    {
      id: 1,
      title: "New Patient Discount",
      description: "Get 20% off on your first consultation and hearing test.",
      discount: "20%",
      icon: "🎉",
      validTill: "March 31, 2026",
    },
    {
      id: 2,
      title: "Hearing Aid Bundle Package",
      description:
        "Buy 2 hearing aids and get free cleaning and maintenance for 1 year.",
      discount: "Free Service",
      icon: "👂",
      validTill: "April 30, 2026",
    },
    {
      id: 3,
      title: "Family Package",
      description:
        "Schedule 3 or more family members for a consultation and get 15% discount on each.",
      discount: "15%",
      icon: "👨‍👩‍👧‍👦",
      validTill: "May 31, 2026",
    },
    {
      id: 4,
      title: "Senior Citizens Special",
      description:
        "Exclusive 25% discount on all services for senior citizens above 60 years.",
      discount: "25%",
      icon: "👴",
      validTill: "Ongoing",
    },
    {
      id: 5,
      title: "Speech Therapy Season Pass",
      description:
        "Get 10 sessions of speech therapy at a discounted rate and save 30%.",
      discount: "30%",
      icon: "🎤",
      validTill: "June 30, 2026",
    },
    {
      id: 6,
      title: "Kids Assessment Special",
      description:
        "Complete pediatric audiology and speech assessment at just 50% of the regular price.",
      discount: "50%",
      icon: "👧",
      validTill: "May 15, 2026",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-background py-20 px-6 pt-[6rem]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primaryText mb-4">
            🎁 Special Offers & Promotions
          </h1>
          <p className="text-xl text-foreground max-w-3xl mx-auto">
            Take advantage of our exclusive offers and special promotions. Get
            the best value for your hearing and speech therapy services.
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-card rounded-lg shadow-lg border border-border hover:shadow-2xl transition-shadow p-6 relative overflow-hidden"
            >
              {/* Discount Badge */}
              <div className="absolute top-0 right-0 bg-primary text-white px-4 py-2 rounded-bl-lg text-sm font-bold">
                {offer.discount}
              </div>

              {/* Icon */}
              <div className="text-5xl mb-4">{offer.icon}</div>

              {/* Content */}
              <h3 className="text-xl font-bold text-primaryText mb-2">
                {offer.title}
              </h3>
              <p className="text-foreground mb-4 text-sm">
                {offer.description}
              </p>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-4">
                  Valid Till: <span className="font-semibold">{offer.validTill}</span>
                </p>
                <Button className="w-full" size="sm">
                  Avail Offer
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Terms & Conditions */}
        <div className="bg-muted rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-primaryText mb-4">
            📋 Terms & Conditions
          </h2>
          <ul className="space-y-2 text-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Offers are valid for a limited period only.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Discounts cannot be combined with other promotional offers.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Offer is applicable on consultation and service fees only.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Valid only at our clinic mentioned in the offer.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Proof of eligibility may be required for senior citizens.</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center bg-primary text-white rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">
            Don't Miss Out on These Great Deals!
          </h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Book your appointment today and take advantage of our special
            offers. Limited time only!
          </p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-gray-100"
            onClick={() => (window.location.href = "/appointment")}
          >
            Book Appointment Now
          </Button>
        </div>
      </div>
      </main>
    </div>
  );
}
