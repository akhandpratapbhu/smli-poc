
import React, { useEffect, useState } from 'react';
import './AddFormData.css';
import { useLocation } from 'react-router-dom';

type Section = {
  id: number;
  sectionName: string;
  entityId: number;
  sortOrder: number;
};
interface AttributeofPartialFormData {
  id: string |undefined;
  name: string;
  dataType: string;
  isRequired: boolean | number;
  label: string;
}

const AddFormData = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [sections, setSections] = useState<Section[]>([]);
  const location = useLocation();
  const model = location.state?.entityData; // Get the passed data
  useEffect(() => {
    fetch(`${baseUrl}/employee/GetSections?screenId=${model.id}`)
      .then((response) => response.json())
      .then((data) => setSections(data))
      .catch((error) => console.error("Error fetching entities:", error));
  }, []);
  const [activeTab, setActiveTab] = useState<number>(sections[0]?.id);
console.log(activeTab);

  const [currentSection, setCurrentSection] = useState(0);

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      const nextSectionId = sections[currentSection + 1].id;
      setCurrentSection(currentSection + 1);
      getSection(nextSectionId); // Fetch and update data for the next tab
    }
  };



  const [attributesofPartialFormData, setAttributesofPartialFormData] = useState<AttributeofPartialFormData[]>([]);
  const [formData, setFormData] = useState<Record<string, {name:string; value: string; options?: any[] }>>({});
console.log(attributesofPartialFormData);


  useEffect(() => {
    if (sections.length > 0) {
      setActiveTab(sections[0].id);
      getSection(sections[0].id);
    }
  }, [sections]); // Runs when `sections` are updated

  const getSection = async (sId: number) => {
    setActiveTab(sId);
    try {
      const response = await fetch(
        `${baseUrl}/employee/PartialForm?entityId=${model.id}&sId=${sId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const PartialFormData = await response.json();
      setAttributesofPartialFormData(PartialFormData);
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };
  const fetchDropdownOptions = async (attr: any) => {
    console.log("attr",attr);
    
    try {
      const response = await fetch(`${baseUrl}/employee/addDropdown`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          screenId: String(model.id),
          controlId: String(attr.id),
          sourceField: attr.masterSource,
          valueField: attr.valueField,
           dependentField: "",
          dependentFieldValue: ""
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  console.log("data",data);
  
  setFormData((prev) => ({
    ...prev,
    [attr.id]: {
      value: prev[attr.id]?.value || "", // ✅ Keep previously selected value
      name:attr.name,
      options: data.options,             // ✅ Update options only
    },
  }));
  
    } catch (error) {
      console.error("Error fetching dropdown options", error);
    }
  };
  const[dropdowndata,setdropdowndata]=useState({})
  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>, 
    attr: AttributeofPartialFormData
  ) => {
    const { value } = e.target;
    if (!attr.id) return; // ✅ Prevent undefined key
  
    console.log(attr.name, value); // ✅ Logs only name and value

   
    setFormData((prev) => ({
      ...prev,
      [String(attr.id)]: { name: attr.name, value }, // ✅ Correct structure
    }));
  
    
      console.log(attr.name, value);
      setdropdowndata({ name: attr.name, value })
  
   
  };
  const AllfieldsDataModel = Object.values(formData).map(({ name, value }) => ({
    name,
    value,
  }));
console.log(AllfieldsDataModel,dropdowndata);
  
  //AllfieldsDataModel.push(dropdowndata)
  

  const handleSubmit = async () => {
 
    try {
      const response = await fetch(`${baseUrl}/employee/InsertFormData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({  // ✅ Correctly stringifying the body
          id: String(model.id),       // ✅ Ensure these are included if needed
          formName: model.name,
          fieldsDataModel: AllfieldsDataModel,

        }),
      });
  
      if (!response.ok) throw new Error("Failed to submit form");
  
      alert("Form submitted successfully!");
      //window.location.href = "/";
    } catch (error) {
      console.error("Error submitting form", error);
      alert("Error submitting form. Please try again.");
    }
  };
  
  return (
    <div className="dealer-master-container">
      <h1>{model.name}</h1>

      <div className="form-container">
        <div className="form-section">
          <h2>Form Section</h2>

          {/* Tab Navigation */}
          <div className="form-tabs">
            {sections.map((section) => (
              <div
                key={section.id}
                className={`tab ${activeTab === section.id ? "active" : ""}`}
                // onClick={() => getSection(section.id)}
              >
                {section.sectionName}
              </div>
            ))}
          </div>
          <div className="form-fields">
            {/* <PartialForm attributes={attributesofPartialFormData} /> */}
            <div className="col-md-10">
            <div className="tab-content">
    {attributesofPartialFormData.map((attr) => (
      <div key={attr.id} className="form-group">
        <label>{attr.label}</label>
        {attr.dataType.toLowerCase() === "dropdown" ? (
    <select
    className="form-control"
    value={formData[String(attr.id)]?.value || ""}
    onClick={() => fetchDropdownOptions(attr)}
    onChange={(e) => handleChange(e, attr)}
  >
    <option value="">-- Please Select --</option>
    {(formData[String(attr.id)]?.options ?? []).map((option) => (
      <option key={option.keyField} value={option.keyField}>
        {option.valueField}
      </option>
    ))}
  </select>
  
    
      
        ) : (
          <input
            type={attr.dataType.toLowerCase() === "int" ? "number" : "text"}
            className="form-control"
            value={formData[String(attr.id)]?.value || ""}
            onChange={(e) => handleChange(e, attr)}
          />
        )}
      </div>
    ))}
  </div>
            
          </div>
          </div>

          {/* Tab Content */}

          <div className="button-group">
            {currentSection < sections.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                Next
              </button>
            ) : (
              <button type="button" className="btn btn-save" onClick={handleSubmit}>
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>

  );
};

export default AddFormData;


