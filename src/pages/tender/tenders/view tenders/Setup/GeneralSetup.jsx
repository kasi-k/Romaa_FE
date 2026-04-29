import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  Edit3, 
  Save, 
  X, 
  Building2, 
  Briefcase, 
  Layers, 
  HardHat, 
  Info,
  ChevronRight
} from "lucide-react";
import Title from "../../../../../components/Title";
import { InputField } from "../../../../../components/InputField";
import ButtonBg from "../../../../../components/Button";
import { API } from "../../../../../constant";
import { motion, AnimatePresence } from "framer-motion";

const MotionDiv = motion.div;
const MotionButton = motion.button;

const schema = yup.object().shape({
  tender_business_type: yup.string().required("Business Type is required"),
  tender_project_division: yup.string().required("Project Division is required"),
  tender_project_name: yup.string().required("Project Name is required"),
  tender_project_type: yup.string().required("Project Type is required"),
});

const InfoCard = (props) => {
  const { icon: Icon, label, value } = props;
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-sm transition-all group">
      <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform shadow-sm">
        <Icon size={22} className="text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate capitalize">{value || "---"}</p>
      </div>
      <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
    </div>
  );
};

const GeneralSetup = () => {
  const { tender_id } = useParams();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      tender_business_type: "",
      tender_project_division: "",
      tender_project_name: "",
      tender_project_type: "",
    },
  });

  const watchedData = watch();

  useEffect(() => {
    const fetchGeneralSetup = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/tender/getgenerlsetup/${tender_id}`);
        if (res.data?.status && res.data?.data) {
          reset(res.data.data);
        }
      } catch (err) {
        console.log(err);
        toast.error("Failed to fetch general setup");
      } finally {
        setLoading(false);
      }
    };
    fetchGeneralSetup();
  }, [tender_id, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.put(`${API}/tender/updategenerlsetup/${tender_id}`, data);
      toast.success("General setup updated successfully");
      setEditMode(false);
    } catch (err) {
      console.log(err);
      toast.error("Failed to update general setup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-end mb-6">
       

        <AnimatePresence mode="wait">
          {!editMode && (
            <MotionButton
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm shadow-lg shadow-slate-500/20 transition-all active:scale-95"
            >
              <Edit3 size={16} /> Edit Details
            </MotionButton>
          )}
        </AnimatePresence>
      </div>

      <MotionDiv
        layout
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden"
      >
        {/* Card Header Decoration */}
        <div className="h-2 bg-linear-to-r from-blue-600 via-blue-400 to-emerald-400" />
        
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Info size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg tracking-tight uppercase">
                {editMode ? "Modify Setup" : "Basic Information"}
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                {editMode ? "Confirm details before saving" : "Core project identification details"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {editMode ? (
                <MotionDiv
                  key="edit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InputField
                      label="Business Type"
                      name="tender_business_type"
                      register={register}
                      errors={errors}
                      placeholder="e.g. Infrastructure"
                    />

                    <InputField
                      label="Project Division"
                      name="tender_project_division"
                      register={register}
                      errors={errors}
                      placeholder="e.g. Civil Works"
                    />

                    <InputField
                      label="Project Name"
                      name="tender_project_name"
                      register={register}
                      errors={errors}
                      placeholder="Enter full project title"
                    />

                    <InputField
                      label="Project Type"
                      name="tender_project_type"
                      register={register}
                      errors={errors}
                      placeholder="e.g. Residential, Commercial"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                      <X size={16} /> Cancel
                    </button>
                    <ButtonBg
                      type="submit"
                      button_name="Update Setup"
                      button_icon={<Save size={16} />}
                      loading={loading}
                      bgColor="bg-slate-800"
                      className="shadow-lg shadow-slate-500/20"
                    />
                  </div>
                </MotionDiv>
              ) : (
                <MotionDiv
                  key="view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <InfoCard 
                    icon={Briefcase} 
                    label="Business Type" 
                    value={watchedData.tender_business_type} 
                  />
                  <InfoCard 
                    icon={Layers} 
                    label="Project Division" 
                    value={watchedData.tender_project_division} 
                  />
                  <InfoCard 
                    icon={Building2} 
                    label="Project Name" 
                    value={watchedData.tender_project_name} 
                  />
                  <InfoCard 
                    icon={HardHat} 
                    label="Project Type" 
                    value={watchedData.tender_project_type} 
                  />
                </MotionDiv>
              )}
            </AnimatePresence>
          </form>
        </div>
      </MotionDiv>
    </div>
  );
};

export default GeneralSetup;

