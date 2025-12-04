import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import React from 'react'

export default function AppoinmentList({loading,handleViewProfile,filteredPatients}) {
    if(loading){
        return <div>Loading...</div>
    }
    if(filteredPatients?.length===0){
        return  <div className="text-center py-8 text-slate-500">No patients found</div>
    }
  return (
    <div>
       <div className="overflow-x-auto -mx-3 sm:mx-0">
                     <table className="w-full text-xs sm:text-sm">
                       <thead className="bg-slate-50 border-b">
                         <tr>
                           <th className="py-2 px-3 text-left">Name</th>
                           <th className="py-2 px-3 text-left hidden sm:table-cell">Phone</th>
                           <th className="py-2 px-3 text-left hidden md:table-cell">Purpose</th>
                           <th className="py-2 px-3 text-left hidden lg:table-cell">Appointment</th>
                           <th className="py-2 px-3 text-left">Status</th>
                           <th className="py-2 px-3 text-center">Action</th>
                         </tr>
                       </thead>
       
                       <tbody>
                         {filteredPatients?.map((p) => (
                           <tr key={p.visit_id} className="border-b hover:bg-slate-50">
                             <td className="py-2 px-3 font-medium">{p.name}</td>
                             <td className="py-2 px-3 hidden sm:table-cell">{p.phone}</td>
                             <td className="py-2 px-3 hidden md:table-cell text-xs">{p.visitType}</td>
                             <td className="py-2 px-3 hidden lg:table-cell text-xs">{p.appointmentDate}</td>
       
                             <td className="py-2 px-3">
                               <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs">
                                 {p.status}
                               </span>
                             </td>
       
                             <td className="py-2 px-3 text-center">
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 className="gap-1 text-xs"
                                 onClick={() => handleViewProfile(p.id)}
                               >
                                 <Eye className="w-3 h-3" />
                                 <span className="hidden sm:inline">View</span>
                               </Button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
       
                     </table>
                   </div>
    </div>
  )
}
