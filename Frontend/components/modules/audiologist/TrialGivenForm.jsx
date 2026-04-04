"use client";

import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import TextArea from "@/components/ui/TextArea";
import DropDown from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { trialGivenSchema } from "@/lib/utils/schema";
import { useEffect, useRef, useState } from "react";

// You can later move this to schema file
const earOptions = [
  { label: "Left", value: "Left" },
  { label: "Right", value: "Right" },
];

const domeSizeOptions = [
  { label: "Small", value: "Small" },
  { label: "Medium", value: "Medium" },
  { label: "Large", value: "Large" },
];

const domeTypeOptions = [
  { label: "Closed", value: "Closed" },
  { label: "Open", value: "Open" },
  { label: "Power", value: "Power" },
  { label: "Tulip", value: "Tulip" },
  { label: "Vented Dome", value: "Vented Dome" },
];
const styleTypeOption = [
  { label: "RIC", value: "RIC" },
  { label: "BTE", value: "BTE" },
  { label: "ITE", value: "ITE" },
  { label: "ITC", value: "ITC" },
  { label: "Custom", value: "Custom" },
  { label: "Cross", value: "Cross" },
  { label: "Bicross", value: "Bicross" },
  { label: "CIC", value: "CIC" },
];

const receiverLengthOptions = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
];
const receiverpowerOptions = [
  { label: "Standard", value: "Standard" },
  { label: "Medium", value: "Medium" },
  { label: "Power", value: "Power" },
  { label: "High Power", value: "High Power" },
];

const earPieceOptions = [
  { label: "Universal Eartips", value: "Universal Eartips" },
  { label: "Ear Mold", value: "Ear Mold" },
];

const sizeOptions = [
  { label: "S", value: "S" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
];

const ventingOptions = [
  { label: "3.1 - 4.55 mm", value: "3.1 - 4.55 mm" },
  { label: "2.3 - 3.0 mm", value: "2.3 - 3.0 mm" },
  { label: "1.7 - 2.2 mm", value: "1.7 - 2.2 mm" },
  { label: "1.2 - 1.6 mm", value: "1.2 - 1.6 mm" },
  { label: "0.9 - 1.1 mm", value: "0.9 - 1.1 mm" },
  { label: "0.6 - 0.8 mm", value: "0.6 - 0.8 mm" },
];

const ventingTypeOptions = [
  { label: "Open", value: "Open" },
  { label: "Closed", value: "Closed" },
];

const ventingSizeOptions = [
  { label: "3.1 - 4.55 mm", value: "3.1 - 4.55 mm" },
  { label: "2.3 - 3.0 mm", value: "2.3 - 3.0 mm" },
  { label: "1.7 - 2.2 mm", value: "1.7 - 2.2 mm" },
  { label: "1.2 - 1.6 mm", value: "1.2 - 1.6 mm" },
  { label: "0.9 - 1.1 mm", value: "0.9 - 1.1 mm" },
  { label: "0.6 - 0.8 mm", value: "0.6 - 0.8 mm" },
];

const rechargableOptions = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

const batteryNoOptions = [
  { label: "10 no", value: "10 no" },
  { label: "312 no", value: "312 no" },
  { label: "13 no", value: "13 no" },
];

const wirelessOptions = [
  { label: "Wireless", value: "Wireless" },
  { label: "Non Wireless", value: "Non Wireless" },
];

const betterEarDeviceOptions = [
  { label: "RIC", value: "RIC" },
  { label: "BTE", value: "BTE" },
  { label: "CIC", value: "CIC" },
];

const routingSideOptions = [
  { label: "Right -> Left", value: "Right -> Left" },
  { label: "Left -> Right", value: "Left -> Right" },
];

const defaultDevice = {
  ear_fitted: "",
  serial_number: "",
  style_type: "",
  receiver_power: "",
  receiver_length: "",
  dome_type: "",
  dome_size: "",
  ear_piece: "",
  size: "",
  venting_type: "",
  vent_size: "",
  rechargeable: "",
  battery_number: "",
  wireless: "",
  better_ear_device: "",
  routing_device: "",
  srt_before: "",
  sds_before: "",
  ucl_before: "",
  gain_settings: "",
};

export default function TrialGivenForm({
  visitId,
  onSubmitSuccess,
  trialDeviceList,
  searchTerm,
  setSearchTerm,
  registerTrialForm,
  goToDashboard,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedSerialIndex, setFocusedSerialIndex] = useState(0);
  const wrapperRef = useRef(null);

  const getDeviceError = (index, field) =>
    formik.errors?.devices?.[index]?.[field];

  const updateDeviceField = (index, field, value) => {
    formik.setFieldValue(`devices[${index}].${field}`, value);

    if (field === "style_type") {
      [
        "receiver_power",
        "receiver_length",
        "dome_type",
        "dome_size",
        "ear_piece",
        "size",
        "venting_type",
        "vent_size",
        "rechargeable",
        "battery_number",
        "wireless",
        "better_ear_device",
        "routing_device",
      ].forEach((resetField) => {
        formik.setFieldValue(`devices[${index}].${resetField}`, "");
      });
    }

    if (field === "ear_piece") {
      formik.setFieldValue(`devices[${index}].size`, "");
      formik.setFieldValue(`devices[${index}].venting_type`, "");
      formik.setFieldValue(`devices[${index}].vent_size`, "");
    }

    if (field === "venting_type") {
      formik.setFieldValue(`devices[${index}].vent_size`, "");
    }
  };

  const addDevice = () => {
    if (formik.values.devices.length >= 2) return;
    formik.setFieldValue("devices", [
      ...formik.values.devices,
      { ...defaultDevice },
    ]);
    setFocusedSerialIndex(formik.values.devices.length);
  };

  const removeDevice = (index) => {
    const devices = formik.values.devices.filter((_, idx) => idx !== index);
    formik.setFieldValue(
      "devices",
      devices.length > 0 ? devices : [{ ...defaultDevice }],
    );
    setFocusedSerialIndex(Math.max(0, Math.min(index - 1, devices.length - 1)));
  };

  const buildDevicePayload = (device) => {
    const payload = {
      ear_side: device.ear_fitted?.toUpperCase(),
      serial_number: device.serial_number,
      style_type: device.style_type,
      device_inventory_id: null,
      srt_before: device.srt_before,
      sds_before: device.sds_before,
      ucl_before: device.ucl_before,
    };

    if (device.style_type === "RIC") {
      payload.receiver_power = device.receiver_power;
      payload.receiver_length = Number(device.receiver_length);
      payload.dome_type = device.dome_type;
      payload.dome_size = device.dome_size;
    } else if (device.style_type === "BTE") {
      payload.ear_piece = device.ear_piece;
      if (device.ear_piece === "Universal Eartips") {
        payload.universal_eartip_size = device.size;
      } else if (device.ear_piece === "Ear Mold") {
        payload.vent = device.venting_type;
        if (device.venting_type === "Open") {
          payload.vent_size = device.vent_size;
        }
      }
    } else if (["ITE", "ITC", "Custom", "CIC"].includes(device.style_type)) {
      payload.vent = device.venting_type;
      if (device.venting_type === "Open") {
        payload.vent_size = device.vent_size;
      }
      payload.rechargeable = device.rechargeable === "Yes";
      if (device.rechargeable === "No") {
        payload.battery_number = device.battery_number;
      }
      payload.wireless = device.wireless === "Wireless";
    } else if (["Cross", "Bicross"].includes(device.style_type)) {
      payload.better_ear_device = device.better_ear_device;
      payload.routing_device = device.routing_device;
    }

    return payload;
  };

  const formik = useFormik({
    initialValues: {
      visit: visitId,
      patient_response: "",
      counselling_notes: "",
      trial_start_date: "",
      trial_end_date: "",
      cost: "",
      devices: [{ ...defaultDevice }],
    },
    // validationSchema: trialGivenSchema,
    onSubmit: async (values) => {
      const payload = {
        visit: values.visit,
        patient_response: values.patient_response,
        counselling_notes: values.counselling_notes,
        cost: values.cost,
        trial_start_date: values.trial_start_date,
        trial_end_date: values.trial_end_date,
        devices: values.devices.map(buildDevicePayload),
      };

      console.log("Payload:", payload);
      await registerTrialForm(payload);
      goToDashboard();
      onSubmitSuccess?.();
    },
  });
  const selectTrialDevice = (device) => {
    const index = focusedSerialIndex ?? 0;
    formik.setFieldValue(`devices[${index}].serial_number`, device);
    setSearchTerm(device);
    setShowDropdown(false);
  };

  const getEarOptionsForIndex = (currentIndex) =>
    earOptions.map((option) => ({
      ...option,
      isDisabled: formik.values.devices.some(
        (device, idx) =>
          idx !== currentIndex && device.ear_fitted === option.value,
      ),
    }));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <form ref={wrapperRef} onSubmit={formik.handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-semibold text-primary mb-3">Device Information</h3>
        <div className="space-y-8">
          {formik.values.devices.map((device, index) => (
            <div
              key={index}
              className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <h4 className="text-xl font-semibold text-primary">
                  {device.ear_fitted
                    ? `${device.ear_fitted} Ear`
                    : `Trial ${index + 1}`}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DropDown
                  label="Ear Fitted"
                  options={getEarOptionsForIndex(index)}
                  value={device.ear_fitted}
                  onChange={(n, v) => updateDeviceField(index, "ear_fitted", v)}
                  error={getDeviceError(index, "ear_fitted")}
                  important
                />

                <div className="relative">
                  <Input
                    label="Serial Number"
                    name={`serial_number_${index}`}
                    value={device.serial_number}
                    error={getDeviceError(index, "serial_number")}
                    onFocus={() => {
                      setFocusedSerialIndex(index);
                      setShowDropdown(true);
                      setSearchTerm(device.serial_number);
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTerm(value);
                      updateDeviceField(index, "serial_number", value);
                    }}
                    important
                  />

                  {showDropdown && focusedSerialIndex === index && (
                    <ul className="absolute bg-white w-full z-[5] max-h-40 overflow-y-auto border border-slate-200 rounded-md mt-1">
                      {trialDeviceList.length > 0 ? (
                        trialDeviceList.map((deviceValue) => (
                          <li
                            key={deviceValue}
                            className="px-3 py-2 cursor-pointer hover:bg-slate-100"
                            onClick={() => selectTrialDevice(deviceValue)}
                          >
                            {deviceValue}
                          </li>
                        ))
                      ) : (
                        <li className="px-3 py-2 text-sm text-slate-500">
                          No serial numbers found
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                <DropDown
                  label="Select Style Type"
                  options={styleTypeOption}
                  value={device.style_type}
                  onChange={(n, v) => updateDeviceField(index, "style_type", v)}
                  error={getDeviceError(index, "style_type")}
                  important
                />

                {device.style_type === "RIC" && (
                  <>
                    <DropDown
                      label="Receiver Power"
                      options={receiverpowerOptions}
                      value={device.receiver_power}
                      onChange={(n, v) =>
                        updateDeviceField(index, "receiver_power", v)
                      }
                      error={getDeviceError(index, "receiver_power")}
                      important
                    />
                    <DropDown
                      label="Receiver Length"
                      options={receiverLengthOptions}
                      value={device.receiver_length}
                      onChange={(n, v) =>
                        updateDeviceField(index, "receiver_length", v)
                      }
                      error={getDeviceError(index, "receiver_length")}
                      important
                    />
                    <DropDown
                      label="Dome Type"
                      options={domeTypeOptions}
                      value={device.dome_type}
                      onChange={(n, v) =>
                        updateDeviceField(index, "dome_type", v)
                      }
                      error={getDeviceError(index, "dome_type")}
                      important
                    />
                    <DropDown
                      label="Dome Size"
                      options={domeSizeOptions}
                      value={device.dome_size}
                      onChange={(n, v) =>
                        updateDeviceField(index, "dome_size", v)
                      }
                      error={getDeviceError(index, "dome_size")}
                      important
                    />
                  </>
                )}

                {device.style_type === "BTE" && (
                  <>
                    <DropDown
                      label="Ear Piece"
                      options={earPieceOptions}
                      value={device.ear_piece}
                      onChange={(n, v) =>
                        updateDeviceField(index, "ear_piece", v)
                      }
                      error={getDeviceError(index, "ear_piece")}
                      important
                    />
                    {device.ear_piece === "Universal Eartips" && (
                      <DropDown
                        label="Size"
                        options={sizeOptions}
                        value={device.size}
                        onChange={(n, v) => updateDeviceField(index, "size", v)}
                        error={getDeviceError(index, "size")}
                        important
                      />
                    )}
                    {device.ear_piece === "Ear Mold" && (
                      <>
                        <DropDown
                          label="Venting Type"
                          options={ventingTypeOptions}
                          value={device.venting_type}
                          onChange={(n, v) =>
                            updateDeviceField(index, "venting_type", v)
                          }
                          error={getDeviceError(index, "venting_type")}
                          important
                        />
                        {device.venting_type === "Open" && (
                          <DropDown
                            label="Vent Size"
                            options={ventingSizeOptions}
                            value={device.vent_size}
                            onChange={(n, v) =>
                              updateDeviceField(index, "vent_size", v)
                            }
                            error={getDeviceError(index, "vent_size")}
                            important
                          />
                        )}
                      </>
                    )}
                  </>
                )}

                {["ITE", "ITC", "Custom", "CIC"].includes(
                  device.style_type,
                ) && (
                  <>
                    <DropDown
                      label="Rechargable"
                      options={rechargableOptions}
                      value={device.rechargeable}
                      onChange={(n, v) =>
                        updateDeviceField(index, "rechargeable", v)
                      }
                      error={getDeviceError(index, "rechargeable")}
                      important
                    />
                    {device.rechargeable === "No" && (
                      <DropDown
                        label="Battery No"
                        options={batteryNoOptions}
                        value={device.battery_number}
                        onChange={(n, v) =>
                          updateDeviceField(index, "battery_number", v)
                        }
                        error={getDeviceError(index, "battery_number")}
                        important
                      />
                    )}
                    <DropDown
                      label="Venting Type"
                      options={ventingTypeOptions}
                      value={device.venting_type}
                      onChange={(n, v) =>
                        updateDeviceField(index, "venting_type", v)
                      }
                      error={getDeviceError(index, "venting_type")}
                      important
                    />
                    {device.venting_type === "Open" && (
                      <DropDown
                        label="Vent Size"
                        options={ventingSizeOptions}
                        value={device.vent_size}
                        onChange={(n, v) =>
                          updateDeviceField(index, "vent_size", v)
                        }
                        error={getDeviceError(index, "vent_size")}
                        important
                      />
                    )}
                    <DropDown
                      label="Wireless"
                      options={wirelessOptions}
                      value={device.wireless}
                      onChange={(n, v) =>
                        updateDeviceField(index, "wireless", v)
                      }
                      error={getDeviceError(index, "wireless")}
                      important
                    />
                  </>
                )}

                {["Cross", "Bicross"].includes(device.style_type) && (
                  <>
                    <DropDown
                      label="Better Ear Device"
                      options={betterEarDeviceOptions}
                      value={device.better_ear_device}
                      onChange={(n, v) =>
                        updateDeviceField(index, "better_ear_device", v)
                      }
                      error={getDeviceError(index, "better_ear_device")}
                      important
                    />
                    <DropDown
                      label="Routing Side"
                      options={routingSideOptions}
                      value={device.routing_device}
                      onChange={(n, v) =>
                        updateDeviceField(index, "routing_device", v)
                      }
                      error={getDeviceError(index, "routing_device")}
                      important
                    />
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <Input
                  label="SRT Before"
                  name={`srt_before_${index}`}
                  value={device.srt_before}
                  onChange={(e) =>
                    updateDeviceField(index, "srt_before", e.target.value)
                  }
                  error={getDeviceError(index, "srt_before")}
                />

                <Input
                  label="SDS Before"
                  name={`sds_before_${index}`}
                  value={device.sds_before}
                  onChange={(e) =>
                    updateDeviceField(index, "sds_before", e.target.value)
                  }
                  error={getDeviceError(index, "sds_before")}
                />

                <Input
                  label="UCL Before"
                  name={`ucl_before_${index}`}
                  value={device.ucl_before}
                  onChange={(e) =>
                    updateDeviceField(index, "ucl_before", e.target.value)
                  }
                  error={getDeviceError(index, "ucl_before")}
                />
              </div>

              {index > 0 && (
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeDevice(index)}
                  >
                    Remove Trial
                  </Button>
                </div>
              )}

              {index === 0 && formik.values.devices.length < 2 && (
                <div className="mt-4">
                  <Button type="button" variant="secondary" onClick={addDevice}>
                    Add more trial
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4">
        <TextArea label="Gain Settings" name="gain_settings" formik={formik} />

        <TextArea
          label="Patient Response*"
          name="patient_response"
          formik={formik}
        />

        <TextArea
          label="Counselling Notes"
          name="counselling_notes"
          formik={formik}
        />
      </div>

      {/* Trial & Cost */}
      <div>
        <h3 className="font-semibold text-primary mb-3">Trial & Pricing</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            type="date"
            label="Trial Start Date"
            name="trial_start_date"
            value={formik.values.trial_start_date}
            onChange={formik.handleChange}
            error={formik.errors.trial_start_date}
            important
          />

          <Input
            type="date"
            label="Trial End Date"
            name="trial_end_date"
            value={formik.values.trial_end_date}
            onChange={formik.handleChange}
            error={formik.errors.trial_end_date}
            important
          />

          <Input
            label="Cost"
            name="cost"
            value={formik.values.cost}
            onChange={formik.handleChange}
            error={formik.errors.cost}
            important
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="submit">Save Trial & Continue</Button>
      </div>
    </form>
  );
}
