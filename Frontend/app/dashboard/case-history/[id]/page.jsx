import CaseHistoryForm from '@/components/modules/audiologist/case-history-form'
import React from 'react'

export default function page({params}) {
  const { id } = params;
  console.log("iddd",id)
  
  return (
    <div>
        <CaseHistoryForm patientId={id}/>
    </div>
  )
}
