import React from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../../../../components/Button";


const getValue = (obj, path) => path.split(".").reduce((acc, part) => acc && acc[part], obj);


const kycFields = [
  { label: "GST", key: "gstin" },
  { label: "PAN", key: "pan_no" },
  { label: "RC", key: "documents.RC" },  // handled manually
  { label: "IPR", key: "documents.IPR" }, // handled manually
  { label: "Account Details", key: "bank_details" }, // handled manually
];

const KYCDocuments = ({ vendor }) => {
  const navigate = useNavigate();


  const getDocumentValue = (vendor, docType) => {
    if (!vendor?.documents) return "-";
    const doc = vendor.documents.find(d => d.doc_type?.toLowerCase() === docType.toLowerCase());
    return doc ? (doc.doc_url || "Uploaded") : "-";
  };


  const getAccountDetails = (bank) => {
    if (!bank) return "-";
    return `${bank.account_name || ""}, ${bank.account_number || ""}, ${bank.bank_name || ""}, ${bank.ifsc_code || ""}, ${bank.branch || ""}`;
  };

  return (
    <>
      <div className="h-full">
        <div className="dark:bg-layout-dark bg-white rounded-md px-6 py-6">
          <p className="text-xl text-center font-semibold pb-4">
            KYC Documents
          </p>

          <div className="flex flex-col sm:grid grid-cols-7 w-full space-y-2">
            {kycFields.map(field => {
              let value = "-";
              if (field.key === "documents.RC") {
                value = getDocumentValue(vendor, "RC");
              } else if (field.key === "documents.IPR") {
                value = getDocumentValue(vendor, "IPR");
              } else if (field.key === "bank_details") {
                value = getAccountDetails(vendor?.bank_details);
              } else {
                value = getValue(vendor, field.key) || "-";
              }

              return (
                <React.Fragment key={field.key}>
                  <p className="text-sm col-span-3 font-bold dark:text-gray-200 text-gray-800">
                    {field.label}
                  </p>
                  <p className="text-sm col-span-2 dark:text-gray-400 text-gray-600">
                    {value}
                  </p>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="my-4 flex justify-end">
        <Button
          button_name="Back"
          button_icon={<ChevronLeft />}
          onClick={() => navigate("..")}
        />
      </div>
    </>
  );
};

export default KYCDocuments;
