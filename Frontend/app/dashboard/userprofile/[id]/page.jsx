import PatientProfile from '@/components/modules/PatientProfile/patient-profile'
import React from 'react'

export default function page({params}) {
   const { id } = params;
  return (
    <div><PatientProfile patientId={id}/></div>
  )
}
