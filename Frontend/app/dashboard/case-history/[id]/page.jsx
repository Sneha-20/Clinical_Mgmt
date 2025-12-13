import CaseHistoryForm from '@/components/modules/audiologist/case-history-form'
import React from 'react'

export default function page({params}) {
 const { id } = params;
  return (
    <div>
        <CaseHistoryForm patientId={id}/>
    </div>
  )
}
