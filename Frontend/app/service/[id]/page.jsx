"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ServiceDetail from "@/components/modules/services/ServiceDetail";

export default function ServicePage({ params }) {
  const { id } = params;

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}
      <main className="flex-grow pt-[4.5rem] md:pt-[5rem]">
        <ServiceDetail serviceId={id} />
      </main>
    </div>
  );
}
