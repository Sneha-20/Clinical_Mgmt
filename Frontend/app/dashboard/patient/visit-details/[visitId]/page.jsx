import PatientVisitDetail from '@/components/modules/Patientvisitdetail';
import React from 'react'

export default function page({params}) {
      const { visitId } = params;
  return (
    <div>
        <PatientVisitDetail visitId={visitId} />
    </div>
  )
}
