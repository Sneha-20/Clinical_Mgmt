import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { getInventorySerialList } from "@/lib/services/inventory";

export default function ProductDetailModal({ isOpen, onClose, product }) {
  const [serials, setSerials] = useState([]);
  const [loadingSerials, setLoadingSerials] = useState(false);

  useEffect(() => {
    if (isOpen && product?.id && product?.stock_type === "Serialized") {
      const fetchSerials = async () => {
        setLoadingSerials(true);
        try {
          const res = await getInventorySerialList({ inventory_item: product.id });
          const list = res?.data || res?.results || [];
          setSerials(list);
        } catch (err) {
          console.error("Error fetching serials:", err);
        } finally {
          setLoadingSerials(false);
        }
      };
      fetchSerials();
    } else {
      setSerials([]);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const category = product.category || "";
  const isHearingAidsAcc = category === "Hearing Aids Accessories";
  const isDiagnostic = category === "Diagnostic Equipment";
  const isCochlearAcc = category === "Cochlear Implant Accessories";
  const isSpeechTherapy = category === "Speech & Therapy Materials";
  
  // Default (Hearing Aid, Consumables, etc.)
  const isDefault = !isHearingAidsAcc && !isDiagnostic && !isCochlearAcc && !isSpeechTherapy;

  const DetailItem = ({ label, value, fullWidth = false }) => (
    <div className={`${fullWidth ? "col-span-2" : "col-span-1"} space-y-1`}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-medium text-slate-700">{value || "-"}</p>
    </div>
  );

  return (
    <Modal
      isModalOpen={isOpen}
      onClose={onClose}
      header="Product Details"
      showButton={false}
      width="max-w-2xl"
    >
      <div className="space-y-6 py-2 px-1">
        {/* Top Header section */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
              {product.display_name || product.product_name}
            </h3>
            {product.subtitle && (
              <p className="text-sm text-slate-500 font-medium">
                {product.subtitle}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium border border-slate-200">
                {category}
              </span>
              {product.use_in_trial && (
                <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md font-medium border border-purple-100">
                  Trial Item
                </span>
              )}
              {product.sku && (
                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-medium border border-blue-100">
                  {product.sku}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
             <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm ${
                  product.status === "In Stock" || product.status === "Good"
                    ? "bg-emerald-500"
                    : product.status === "Low"
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
              >
                {product.status}
              </span>
          </div>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-8">
          {/* Brand/Model Logic based on category matrix */}
          {(isHearingAidsAcc || isCochlearAcc || isDefault) && (
            <DetailItem label="Brand" value={product.brand_name} />
          )}
          {(isDiagnostic || isDefault) && (
            <DetailItem label="Model" value={product.model_type_name} />
          )}

          {/* Category specific fields */}
          {isCochlearAcc && (
            <>
              <DetailItem label="Implant System" value={product.implant_systems} />
              <DetailItem label="Cochlear Accessory" value={product.cochlear_accessory} />
            </>
          )}

          {isSpeechTherapy && (
            <DetailItem label="Age Groups" value={product.age_groups} />
          )}

          {(isHearingAidsAcc || isSpeechTherapy) && (
            <DetailItem label="Accessories Type" value={product.accessories_type} />
          )}
          
          <DetailItem 
            label="Unit Price" 
            value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(product.unit_price || 0)} 
          />
          <DetailItem label="GST Value" value={product.gst_value ? `${product.gst_value}%` : "0%"} />
          
          <DetailItem label="Stock Type" value={product.stock_type} />
          <DetailItem label="Quantity in Stock" value={product.quantity_in_stock} />
          
          <DetailItem label="Clinic Location" value={product.clinic_name} />
          {product.location && <DetailItem label="Storage Location" value={product.location} />}
          
          <DetailItem label="Product Description" value={product.description} fullWidth />
          
          {product.notes && (
            <div className="col-span-2 bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">
              <p className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest mb-1">Internal Notes</p>
              <p className="text-sm text-slate-600 italic">"{product.notes}"</p>
            </div>
          )}
        </div>

        {/* Serial Numbers section for Serialized inventory */}
        {product.stock_type === "Serialized" && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Registered Serial Numbers
              </p>
              <span className="text-xs bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-500 font-medium font-mono">
                {serials.length} units
              </span>
            </div>
            
            {loadingSerials ? (
              <div className="flex items-center justify-center py-4">
                 <div className="animate-pulse text-sm text-slate-400">Fetching serials...</div>
              </div>
            ) : serials.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {serials.map((s, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 text-slate-600 text-center text-xs py-1.5 px-2 rounded-md shadow-sm font-mono hover:border-sky-300 transition-colors">
                    {s.serial_number || s.serial}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-slate-400 italic">
                No individual serial records found.
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-95"
          >
            Close Details
          </button>
        </div>
      </div>
    </Modal>
  );
}

