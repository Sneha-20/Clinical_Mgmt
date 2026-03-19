"use client";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";

function PrintField({ label, value }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-sm text-slate-500 whitespace-nowrap">{label}:</span>
      <span className="border-b border-slate-400 pb-1 text-sm leading-none min-w-[92px] w-full">
        {value || "\u00A0"}
      </span>
    </div>
  );
}

function FormRow({ label, lines = 1 }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-[122px] whitespace-nowrap text-xs text-slate-500">
        {label}
      </div>

      <div className="flex-1">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="border-b border-slate-400 h-8"></div>
        ))}
      </div>
    </div>
  );
}

function ClientHistory() {
  return (
    <div className="flex gap-4">
      <div className="w-[122px] text-xs text-slate-500">Client History</div>

      <div className="flex-1 space-y-1">
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className="flex items-center gap-2">
            <span className="text-xs w-4">{num}.</span>
            <div className="flex-1 border-b border-slate-400 h-6"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CaseHistoryFormModal({
  isModalOpen,
  closePrintModal,
  printData,
  handlePrint,
}) {
  return (
    <Modal
      isModalOpen={isModalOpen}
      onClose={closePrintModal}
      header="Print Patient Form"
      showButton={false}
      ClassName="max-w-lg"
    >
      <div className="print-area">
        <style>
          {`@media print {
              body * { visibility: hidden; }
              .print-area, .print-area * { visibility: visible; }
              .print-area {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
              }
          }`}
        </style>

        {/* Header */}
        <div className="w-full text-center mb-6">
          <p className="text-lg">Case History Form</p>
          <h3 className="text-xl font-bold">
            NAVJEEVAN SPEECH AND HEARING CLINIC
          </h3>
        </div>

        {/* Patient Info */}
        <div>
          <div className="flex justify-between gap-4 mb-4">
            <PrintField label="Client Id" value={printData?.id} />
            <PrintField label="Date" value={printData?.date} />
          </div>

          <div className="flex w-full mb-4">
            <PrintField label="Name" value={printData?.name} />
          </div>

          <div className="flex justify-between gap-4 mb-4">
            <PrintField label="Age" value={printData?.age} />
            <PrintField label="Sex" value={printData?.gender} />
            <PrintField label="Referral" value={printData?.referral_doctor} />
          </div>

          <PrintField
            label="Address & ContactNo"
            value={printData?.addressContact}
          />
        </div>

        {/* History Section */}
        <div className="pt-6 flex flex-col gap-4">
          <ClientHistory />

          <FormRow label="Family History" lines={2} />

          <FormRow label="Previous Record" lines={2} />

          <FormRow label="Previous Hearing Aid" lines={2} />

          <FormRow label="Otoscopic Examination" lines={2} />

          <FormRow label="Audiologist Remark" lines={1} />
        </div>

        {/* Audiology Table */}
        <div className="mt-6 border border-black text-xs">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr>
                <th className="border h-[40px] p-1">RT EAR</th>
                <th className="border h-[40px] p-1">250</th>
                <th className="border h-[40px] p-1">500</th>
                <th className="border h-[40px] p-1">1K</th>
                <th className="border h-[40px] p-1">2K</th>
                <th className="border h-[40px] p-1">4K</th>
                <th className="border h-[40px] p-1">8K</th>

                <th className="border h-[40px] p-1">LT EAR</th>
                <th className="border h-[40px] p-1">250</th>
                <th className="border h-[40px] p-1">500</th>
                <th className="border h-[40px] p-1">1K</th>
                <th className="border h-[40px] p-1">2K</th>
                <th className="border h-[40px] p-1">4K</th>
                <th className="border h-[40px] p-1">8K</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="border h-[40px] p-1">AC</td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>

                <td className="border h-[40px] p-1">AC</td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>
              </tr>

              <tr>
                <td className="border h-[40px] p-1">BC</td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>

                <td className="border h-[40px] p-1">BC</td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>
                <td className="border h-[40px]"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t flex justify-end gap-2 print:hidden">
          <Button variant="outline" onClick={closePrintModal}>
            Close
          </Button>
          <Button onClick={handlePrint}>Print</Button>
        </div>
      </div>
    </Modal>
  );
}
