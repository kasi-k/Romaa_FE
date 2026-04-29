import React, { useState, useEffect } from "react";
import axios from "axios";
import { TbFileInvoice } from "react-icons/tb";
import { useParams } from "react-router-dom";
import { API } from "../../../../../constant";
import UploadWorkOrder from "./UploadWorkOrder";
import Loader from "../../../../../components/Loader";

const WorkOrderAssets = () => {
  const [showModal, setShowModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const {tender_id,workOrder_id} = useParams(); 

  const handleUploadSuccess = () => {
    setShowModal(false);
    fetchDocuments();
  };

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API}/workorderdocument/alldocuments/${tender_id}/${workOrder_id}`);
      if (res.data && res.data.tender_document) {
        setDocuments(res.data.tender_document.documents || []);
        console.log(res.data.tender_document.documents);
        
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error fetching documents", error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, [tender_id]);

  if (loading) return <Loader fullScreen={false} />;

  return (
    <>
      <div className="h-11/12 overflow-auto">
        <div className="cursor-pointer flex justify-end pr-4 mb-6">
          <p
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-darkest-blue text-white px-4 py-2 rounded select-none hover:bg-blue-800 transition"
          >
            Upload Assets
          </p>
        </div>

       

        {/* Documents Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-4">
          {documents.length === 0 ? (
          
             <div className=" col-span-full flex flex-col justify-center items-center mb-8 text-darkest-blue">
          <TbFileInvoice size={52} className="stroke-1" />
          <p className="font-semibold py-2">Uploaded Files</p>
        </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc.code}
                className="bg-white dark:bg-darkest-blue dark:text-white text-darkest-blue rounded-lg shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition"
              >
                <div className="dark:text-white text-darkest-blue">
                  <h3 className="font-semibold text-lg truncate ">{doc.filename}</h3>
                  {/* <p className="mt-1 text-sm  truncate">{doc.description || "No description"}</p> */}
                </div>
                <div className="mt-4 flex justify-between items-center text-xs ">
                  <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                  <span>{(doc.file_url && <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">View</a>) || "No file"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <UploadWorkOrder onClose={() => setShowModal(false)} onUploadSuccess={handleUploadSuccess} />
      )}
    </>
  );
};

export default WorkOrderAssets;
