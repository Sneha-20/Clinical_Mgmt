"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { apiClient } from "@/lib/api";
import CommonBadge from "@/components/ui/badge";
import { User, Phone, Stethoscope, Calendar, FileText, Activity, ClipboardList, Download, ShoppingCart, Wrench } from "lucide-react";

export default function FullVisitModal({ visitId, open, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && visitId) {
      setLoading(true);
      apiClient.get(`clinical/patient/visit/${visitId}/full/`)
        .then(res => setData(res?.data?.data || res?.data || res))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setData(null);
    }
  }, [open, visitId]);

  return (
    <Modal 
      isModalOpen={open} 
      onClose={onClose} 
      header={`Full Visit Record: #${visitId}`}
      showButton={false}
      ClassName="max-w-4xl max-h-[90vh] overflow-y-auto"
    >

        {loading ? (
          <div className="py-8 text-center text-slate-500">Loading visit details...</div>
        ) : data ? (
          <div className="space-y-6 mt-4">
            {/* Top Cards: Patient & Visit Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 space-y-3 bg-slate-50">
                <div className="flex items-center gap-2 font-semibold border-b pb-2">
                  <User className="w-4 h-4 text-blue-600" /> Patient Info
                </div>
                <div><span className="text-slate-500 text-sm">Name:</span> {data.patient_name}</div>
                <div><span className="text-slate-500 text-sm">Age/Gender:</span> {data.patient_age} / {data.patient_gender}</div>
                <div><span className="text-slate-500 text-sm">Phone:</span> {data.patient_phone}</div>
                <div><span className="text-slate-500 text-sm">Location:</span> {data.patient_city} - {data.patient_address}</div>
              </div>

              <div className="border rounded-lg p-4 space-y-3 bg-slate-50">
                <div className="flex items-center gap-2 font-semibold border-b pb-2">
                  <Calendar className="w-4 h-4 text-emerald-600" /> Visit Context
                </div>
                <div><span className="text-slate-500 text-sm">Date:</span> {data.appointment_date}</div>
                <div><span className="text-slate-500 text-sm">Type:</span> <CommonBadge title={data.visit_type} /></div>
                <div><span className="text-slate-500 text-sm">Seen By:</span> {data.seen_by_name}</div>
                <div><span className="text-slate-500 text-sm">Status:</span> {data.status}</div>
              </div>
            </div>

            {/* Case History & Tests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 font-semibold border-b pb-2">
                  <Activity className="w-4 h-4 text-purple-600" /> Case History
                </div>
                {data.case_history ? (
                  <div className="text-sm space-y-1">
                    <p><span className="text-slate-500">Medical:</span> {data.case_history.medical_history}</p>
                    <p><span className="text-slate-500">Family:</span> {data.case_history.family_history}</p>
                    <p><span className="text-slate-500">Noise Exposure:</span> {data.case_history.noise_exposure}</p>
                    <p><span className="text-slate-500">HA Experience:</span> {data.case_history.previous_ha_experience}</p>
                    <p><span className="text-slate-500">Red Flags:</span> {data.case_history.red_flags || "None"}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No case history recorded.</p>
                )}
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 font-semibold border-b pb-2">
                  <Stethoscope className="w-4 h-4 text-indigo-600" /> Tests Performed
                </div>
                {data.tests_performed ? (
                  <div className="text-sm space-y-1">
                    <p><span className="text-slate-500">Symptoms:</span> {data.tests_performed.hearing_symptoms?.join(", ") || "None"}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(data.tests_performed)
                           .filter(([key, val]) => val === true && key !== "id" && key !== "visit")
                           .map(([key]) => (
                             <CommonBadge key={key} title={key.replace("_", " ").toUpperCase()} status="Completed" />
                           ))
                        }
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No tests performed.</p>
                )}
              </div>
            </div>

            {/* Test Uploads */}
            {data.test_uploads && data.test_uploads.length > 0 && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 font-semibold border-b pb-2">
                  <ClipboardList className="w-4 h-4 text-orange-600" /> Test Reports Documented
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.test_uploads.map(report => (
                    <div key={report.id} className="flex flex-col p-3 bg-slate-50 rounded-lg border">
                      <div className="flex items-center gap-3 border-b border-slate-200 pb-2 mb-2">
                        <div className="p-2 bg-blue-100/50 rounded-lg shadow-sm">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-slate-800">
                            {report.report_type}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 italic">
                          "{report.report_description || "No description provided."}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trials */}
            {data.trials && data.trials.length > 0 && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 font-semibold border-b pb-2">
                  <FileText className="w-4 h-4 text-blue-600" /> Trial Details
                </div>
                <div className="overflow-x-auto text-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                         <th className="p-2 border">Device</th>
                         <th className="p-2 border">Serial</th>
                         <th className="p-2 border">Ear</th>
                         <th className="p-2 border">Duration</th>
                         <th className="p-2 border">Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.trials.map(t => (
                        <tr key={t.id}>
                          <td className="p-2 border">{t.device_details?.brand} {t.device_details?.model_type}</td>
                          <td className="p-2 border">{t.serial_number}</td>
                          <td className="p-2 border">{t.ear_fitted}</td>
                          <td className="p-2 border">{t.trial_start_date} to {t.trial_end_date}</td>
                          <td className="p-2 border"><CommonBadge title={t.trial_decision} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Service Visit */}
            {data.service_visit && (!Array.isArray(data.service_visit) || data.service_visit.length > 0) && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 font-semibold border-b pb-2">
                  <Wrench className="w-4 h-4 text-orange-500" /> Service Visit Details
                </div>
                
                {Array.isArray(data.service_visit) ? (
                   // If it's an array, list them
                   <div className="space-y-4">
                     {data.service_visit.map((sv, idx) => (
                       <ServiceVisitBlock key={sv.id || idx} sv={sv} />
                     ))}
                   </div>
                ) : (
                   <ServiceVisitBlock sv={data.service_visit} />
                )}
              </div>
            )}

            {/* Purchase Records */}
            {data.purchase_records && data.purchase_records.length > 0 && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 font-semibold border-b pb-2">
                  <ShoppingCart className="w-4 h-4 text-green-600" /> Purchased Items
                </div>
                <div className="overflow-x-auto text-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                         <th className="p-2 border">Item</th>
                         <th className="p-2 border">Model</th>
                         <th className="p-2 border">Serial</th>
                         <th className="p-2 border text-center">Qty</th>
                         <th className="p-2 border">Unit Price</th>
                         <th className="p-2 border text-right">Total Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.purchase_records.map(p => (
                        <tr key={p.id}>
                          <td className="p-2 border font-medium">{p.item_name}</td>
                          <td className="p-2 border text-slate-600">{p.item_brand} {p.item_model}</td>
                          <td className="p-2 border">{p.serial_number || "-"}</td>
                          <td className="p-2 border text-center">{p.quantity}</td>
                          <td className="p-2 border">₹{p.unit_price}</td>
                          <td className="p-2 border font-semibold text-right">₹{p.total_price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bill Details */}
            {data.bill_details && (
              <div className="border rounded-lg p-4 bg-slate-50 flex flex-col sm:flex-row justify-between items-center">
                <div className="space-y-1">
                   <div className="font-semibold text-lg flex items-center gap-2">Billing <CommonBadge title={data.bill_details.payment_status} /></div>
                   <div className="text-sm text-slate-500">Bill ID: {data.bill_details.bill_number}</div>
                </div>
                <div className="text-right mt-2 sm:mt-0">
                   <div className="text-2xl font-bold text-slate-800">₹{data.bill_details.total_amount}</div>
                   {data.bill_details.final_amount > 0 && <div className="text-sm text-slate-500">Final: ₹{data.bill_details.final_amount}</div>}
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                 className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition"
                 onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500">Failed to load data.</div>
        )}
    </Modal>
  );
}

// Subcomponent for Service Visit Details
function ServiceVisitBlock({ sv }) {
  if (!sv || Object.keys(sv).length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded border">
      <div className="space-y-2">
         <div><span className="text-slate-500">Service Type:</span> <span className="capitalize">{sv.service_type || "N/A"}</span></div>
         <div><span className="text-slate-500">Status:</span> <CommonBadge title={sv.status || "N/A"} /></div>
         <div><span className="text-slate-500">Complaint:</span> {sv.complaint || "None"}</div>
         <div>
           <span className="text-slate-500">Action Taken:</span> {sv.action_taken || "Pending"} 
           {sv.action_taken_on && <span className="text-xs text-slate-400 ml-1">({new Date(sv.action_taken_on).toLocaleDateString()})</span>}
         </div>
      </div>
      <div className="space-y-2">
         <div><span className="text-slate-500">Device:</span> {sv.device?.inventory_item || "N/A"}</div>
         <div><span className="text-slate-500">Purchased:</span> {sv.device?.purchased_at ? new Date(sv.device.purchased_at).toLocaleDateString() : "N/A"}</div>
         <div><span className="text-slate-500">Charges Collected:</span> ₹{sv.charges_collected || 0}</div>
         {sv.rtc_date && <div><span className="text-slate-500">RTC Date:</span> {new Date(sv.rtc_date).toLocaleDateString()}</div>}
         {sv.parts_used && sv.parts_used.length > 0 && (
           <div>
             <span className="text-slate-500">Parts Used:</span> {sv.parts_used.length} item(s)
           </div>
         )}
      </div>
    </div>
  );
}
