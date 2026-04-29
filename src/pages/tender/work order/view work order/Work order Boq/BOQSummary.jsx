import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const BOQSummary = ({ summary }) => {
  const [isOpen, setIsOpen] = useState(false);

  const entries = Object.entries(summary);
  const leftItem = entries[0]; // Total Weightage %
  const rightItem = entries[1]; // Wastage Amount
  const otherItems = entries.slice(2); // Rest

  return (
    <div className="p-2 font-poppins">
      <div className="grid grid-cols-12 text-sm dark:text-white text-black">
  
        <div className="col-span-8 flex justify-center">
          <p className="flex gap-4 font-medium">
            {leftItem[0]}{" "}
            <span className="opacity-70">₹{leftItem[1].toLocaleString()}</span>
          </p>
        </div>

        
        <div className="col-span-4">
          <div className="flex justify-between">
            <span className="font-medium">{rightItem[0]}</span>
            <span className="flex items-center gap-1 opacity-70">
              ₹{rightItem[1].toLocaleString()}
              <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </span>
          </div>

      
          {isOpen && (
            <div className="mt-2 space-y-1 px-4">
              {otherItems.map(([label, value], idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="font-medium">{label}</span>
                  <span className="opacity-70">₹{value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BOQSummary;
