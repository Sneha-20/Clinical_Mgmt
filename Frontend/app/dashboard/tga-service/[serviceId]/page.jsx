import ServiceDetails from "@/components/modules/receptionist/component/ServiceDetails";
import React from "react";

export default function page({ params }) {
  const { serviceId } = params;

  return (
    <div>
      <ServiceDetails serviceId={serviceId} />
    </div>
  );
}
