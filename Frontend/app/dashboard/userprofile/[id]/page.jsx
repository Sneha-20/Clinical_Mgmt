import PatientProfile from '@/components/modules/reception/patient-profile'
import React from 'react'

export default function page({params}) {
   const { id } = params;
  return (
    <div><PatientProfile patientId={id}/></div>
  )
}
