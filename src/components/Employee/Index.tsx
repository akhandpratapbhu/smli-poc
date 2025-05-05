import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import PartialForm from "./partial-Form/PartialForm";
import { all } from "axios";

interface AttributeofPartialFormData {
  gridMaster: any;
  id: string | number;
  name: string;
  dataType: string;
  isRequired: boolean | number;
  label: string;
  sortOrder: number
}
type Section = {
  id: number;
  sectionName: string;
  entityId: number;
  sortOrder: number;
};

const EntityForm = () => {

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const model = location.state?.entityData; // Get the passed data
  const [sections, setSections] = useState<Section[]>([]);
  const [masters, setMasters] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [allcolumndata, setallcolumndata] = useState<Record<string, string[]>>({});
  const [activeTab, setActiveTab] = useState<number | undefined>(undefined);
  const [itemName, setitemName] = useState("");
  const [droppedLocation, setDroppedLocation] = useState<"form" | "table" | null>(null);

  // State to store form data
  const [formData, setFormData] = useState({
    fieldType: "",
    fieldName: "",
    fieldLabel: "",
    isDependent: false,
    dependentField: "",
    isRequired: false,
    defaultValue: "",
    mastersource: "",
    valuefield: ""
  });
  const [getAttributeData, setGetAttributeData] = useState([]);
  const [sectionName, setSectionName] = useState("");

  const [showFieldModal, setShowFieldModal] = useState(false);
  const [ShowaddpartfieldFieldModal, setShowaddpartfieldFieldModal] = useState(false);

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showDependentField, setShowDependentField] = useState(false);
  const [showDefaultValue, setShowDefaultValue] = useState(false);
  const [tableCustomFields, setTableCustomFields] = useState<any[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<null | undefined | number>(sections[0]?.id);
  const [sectionAttributes, setSectionAttributes] = useState<{
    [key: string]: { id: number; label: string }[];
  }>({
    activeSectionId: [],
  });

  const [sectionAttributestabularForm, setsectionAttributestabularForm] = useState<{
    [key: string]: { id: number; label: string }[];
  }>({
    activeSectionId: [],
  });
  const [attributesofPartialFormData, setAttributesofPartialFormData] = useState<AttributeofPartialFormData[]>([]);
  const [fieldAllAttributes, setFieldAllAttributes] = useState<
    {
      id: number;
      label: string;
      name: string;
      datatype: string;
      mastersource: string;
      valuefield: string;
      isrequired: boolean;
      defaultvalue: string;
      isdependent: boolean;
      dependentfield: string;
      sortOrder: number;
    }[]
  >([]);
  const [allcolumndataWithName, setAllcolumndataWithName] = useState<{
    [sectionId: number]: {
      [entityName: string]: string[];
    };
  }>({});
  useEffect(() => {
    getSectionAllData();
    getAllMasterData();
  }, []);

  function getSectionAllData() {
    fetch(`${baseUrl}/employee/GetSections?screenId=${model.id}`)
      .then((response) => response.json())
      .then((data) => setSections(data))
      .catch((error) => console.error("Error fetching entities:", error));
  }
  function getAllMasterData() {
    fetch(`${baseUrl}/Home/GetMasters`)
      .then((response) => response.json())
      .then((data) => setMasters(data))
      .catch((error) => console.error("Error fetching entities:", error));
  }

  useEffect(() => {
    if (sections.length > 0) {
      setActiveTab(sections[0].id);
    }
  }, [sections]);
  useEffect(() => {
    if (sections.length > 0) {
      setActiveTab(sections[0].id);
      getSection(sections[0].id);
    }
  }, [sections]); // Runs when `sections` are updated

  function getAttribute(master: any) {

    fetch(`${baseUrl}/employee/GetAttributes?masterId=${master.id}`)
      .then((response) => response.json())
      .then((data) => setGetAttributeData(data))
      .catch((error) => console.error("Error fetching entities:", error));
  }
  // Handle change for text inputs
  const handleInputChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    const selectedMaster = masters.find((master: { id: number; name: string }) => master.id == (value));
    if (name === "mastersource" && selectedMaster) {
      getAttribute(selectedMaster);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  // Handle dependent field dropdown change
  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === "Yes"; // Convert to boolean
    setFormData((prev) => ({ ...prev, isDependent: value }));

    // Show dependent field input if "Yes" is selected
    setShowDependentField(value);
  };

  // Handle required field dropdown change
  const handleIsRequiredChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === "1"; // Convert to boolean
    setFormData((prev) => ({ ...prev, isRequired: value }));

    // Show default value input if "Yes" is selected
    setShowDefaultValue(value);
  };


  const handleDragStart = (event: React.DragEvent<HTMLLIElement>, item: string) => {
    event.dataTransfer.setData("text/plain", item);
    setitemName(item)
    setFormData((prev) => ({
      ...prev, // Preserve existing state
      fieldType: item, // Update only fieldType
    }));
  };


  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const targetElement = event.target as HTMLElement;

    if (targetElement.closest(".table-drop-zone")) {
      setDroppedLocation("table");
      if (itemName == "AddGrid") {
        setShowaddpartfieldFieldModal(true)
      } else {
        setShowFieldModal(true)
      }
    } else if (targetElement.closest(".form-drop-zone")) {
      setDroppedLocation("form");
      if (itemName == "AddGrid") {
        setShowaddpartfieldFieldModal(true)
      } else {
        setShowFieldModal(true)
      }
    }
  };


  const getSection = async (sId: React.Key | null | undefined) => {
    setActiveSectionId((prev) => {
      const newId = sId as number;
      return newId;
    });
    try {
      const response = await fetch(`${baseUrl}/employee/PartialForm?entityId=${model.id}&sId=${sId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const PartialFormData = await response.json();  // Convert response to JSON
      setAttributesofPartialFormData(PartialFormData)
    } catch (error) {
      console.error("Error posting data:", error);
    }
  }

  const addSectionModel = () => {
    setShowSectionModal(true);
  };

  const handleCloseFieldModal = () => {
    setShowFieldModal(false)
    setShowaddpartfieldFieldModal(false)
    setShowDefaultValue(false)
    setShowDependentField(false);
    setFormData({
      fieldType: "",
      fieldName: "",
      fieldLabel: "",
      isDependent: false,
      dependentField: "",
      isRequired: false,
      defaultValue: "",
      mastersource: "",
      valuefield: ""
    })
    setSelectedEntity("");
    setSelectedColumns([]);
    setGetAttributeData([]);
    setitemName("");
    setDroppedLocation(null);
  };
  const handleCloseSectionModal = () => setShowSectionModal(false);

  const saveSection = async () => {
    if (sectionName.trim() === "") return;
    //setSections([...sections, { Id: sections.length + 1, SectionName: sectionName }]);

    try {
      const response = await fetch(`${baseUrl}/employee/SaveSection?screenId=${model.id}&sectionName=${sectionName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Success:", result);
      // Update sections state to trigger useEffect
      getSectionAllData()
    } catch (error) {
      console.error("Error posting data:", error);
    }
    handleCloseSectionModal();
  };

  const saveField = () => {

    let maxSortOrder = 0;
    if (attributesofPartialFormData.length > 0) {
      maxSortOrder = Math.max(...attributesofPartialFormData.map(item => item.sortOrder));
    }

    const newField = {
      id: 0,
      label: formData.fieldLabel,
      name: formData.fieldName,
      datatype: formData.fieldType,
      mastersource: formData.mastersource,
      valuefield: formData.valuefield,
      isrequired: formData.isRequired,
      defaultvalue: formData.defaultValue,
      isdependent: formData.isDependent,
      dependentfield: formData.dependentField,
      sortOrder: maxSortOrder + 1,
    };

    // Always update fieldAllAttributes (optional)

    if (droppedLocation === "form") {
      // Only add to form attributes
      // setAttributes(prev => [...prev, { id: prev.length + 1, label: formData.fieldLabel }]);
      setSectionAttributes((prev) => {
        const sectionId = activeSectionId as number;
        const existingAttributes = prev[sectionId] || [];

        return {
          ...prev,
          [sectionId]: [
            ...existingAttributes,
            {
              id: existingAttributes.length + 1, // Proper ID within the section
              label: formData.fieldLabel,
            },
          ],
        };
      });

      setFieldAllAttributes(prev => [...prev, newField]);
    } else if (droppedLocation === "table") {
      // Custom table field logic
      setsectionAttributestabularForm((prev) => {
        const sectionId = activeSectionId as number;
        const existingAttributes = prev[sectionId] || [];

        return {
          ...prev,
          [sectionId]: [
            ...existingAttributes,
            {
              id: existingAttributes.length + 1, // Proper ID within the section
              label: formData.fieldLabel,
            },
          ],
        };
      });
      setTableCustomFields(prev => [...prev, newField]); // You need to define `setTableCustomFields`
    }

    handleCloseFieldModal();
  };

  const handleEntityChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    // Reset selected checkboxes
    setSelectedColumns([]);
    const selectedMaster = masters.find((master: { id: number; name: string }) => master.id == (value));
    if (selectedMaster) {
      getAttribute(selectedMaster);
    }
    setSelectedEntity(value)
  };



  const handleSubmittablecolumn = (e: React.FormEvent) => {
    e.preventDefault();

    type Attribute = { id: number; name: string };

    const selectedColumnIds = getAttributeData
      .filter((attr: Attribute) => selectedColumns.includes(attr.name))
      .map((attr: Attribute) => attr.id.toString());

    const selectedColumnNames = getAttributeData
      .filter((attr: Attribute) => selectedColumns.includes(attr.name))
      .map((attr: Attribute) => attr.name);

    // ID-based: used for submission
    setallcolumndata(prevData => {
      const prevColumns = prevData[selectedEntity] || [];
      const mergedColumns = [...new Set([...prevColumns, ...selectedColumnIds])];

      const updatedData = {
        ...prevData,
        [selectedEntity]: mergedColumns,
      };

      return updatedData;
    });

    // Name-based: used for display section-wise
    setAllcolumndataWithName(prev => ({
      ...prev,
      [activeSectionId as number]: {
        ...(prev[activeSectionId as number] || {}),
        [selectedEntity]: selectedColumnNames,
      }
    }));

    setShowaddpartfieldFieldModal(false);
    handleCloseFieldModal();

  };

  const formAttributes = attributesofPartialFormData.filter(attr => attr.dataType !== 'grid');
  const gridAttributes = attributesofPartialFormData.filter(attr => attr.dataType === 'grid');
  // Construct updated grid attribute
  const finalgrid = {
    id: 0,
    label: "grid",
    name: "grid",
    datatype: "grid",
    mastersource: "",
    valuefield: "",
    isrequired: false,
    defaultvalue: "",
    isdependent: false,
    dependentfield: "",
    sortOrder: 1,
    gridMaster: {
      gridElements: Object.entries(allcolumndata).map(([entity, fields]) => ({
        masterSource: entity,
        valueField: fields
      })),
      customProperty: tableCustomFields
    }
  };



  let updatefinalgrid = { ...gridAttributes[0] };

  const existingGridElements = gridAttributes[0]?.gridMaster?.gridElements || [];
  const existingCustomFields = gridAttributes[0]?.gridMaster?.customProperty || [];

  const newGridElements = Object.entries(allcolumndata).map(([entity, fields]) => ({
    masterSource: entity,
    valueField: fields
  }));

  const transformedGridElements = existingGridElements.map((element: any) => {
    const masterSourceId = element.masterSource.split("_")[0];
    const valueFieldIds = element.valueField.map((field: string) => field.split("_")[0]);

    return {
      masterSource: masterSourceId,
      valueField: valueFieldIds
    };
  });

  updatefinalgrid = {
    ...gridAttributes[0],
    gridMaster: {
      gridElements: [...transformedGridElements, ...newGridElements],
      customProperty: [...existingCustomFields, ...tableCustomFields]
    }
  } as any;



  // If there are no attributes at all
  let updatedformsection: any[] = [];

  const hasFormAttributes = formAttributes.length > 0;
  const hasGridAttributes = gridAttributes.length > 0;

  // Case 1: Only field/form attributes are present
  if (!hasFormAttributes && !hasGridAttributes) {

    if (fieldAllAttributes && fieldAllAttributes.length > 0) {
      const hasGridData = finalgrid.gridMaster.gridElements.length > 0;

      if (hasGridData) {
        updatedformsection = [...fieldAllAttributes, finalgrid];

      } else {
        updatedformsection = [...fieldAllAttributes];

      }
    }
    else if (finalgrid && fieldAllAttributes.length <= 0) {
      const hasGridData = finalgrid.gridMaster.gridElements.length > 0;

      if (hasGridData) {
        updatedformsection = [finalgrid];

      }
    }

    // Case 2: Only grid attributes are present
  } else if (!hasFormAttributes && hasGridAttributes) {


    const updatedGridAttributes = updatefinalgrid;

    if (updatedGridAttributes && !fieldAllAttributes) {
      updatedformsection = [updatedGridAttributes];
    } else if (updatedGridAttributes && fieldAllAttributes) {
      updatedformsection = [...fieldAllAttributes, updatedGridAttributes];
    }


    // Case 3: Only form attributes are present
  }
  else if (hasFormAttributes && !hasGridAttributes) {
    const hasGridData = finalgrid.gridMaster.gridElements.length > 0;

    if (hasGridData) {
      updatedformsection = [...fieldAllAttributes, finalgrid];
    } else {
      updatedformsection = [...fieldAllAttributes];
    }

    // Case 4: Both form and grid attributes are present
  } else {
    const updatedGridAttributes = updatefinalgrid;
    updatedformsection = [
      ...fieldAllAttributes,
      ...formAttributes,
      updatedGridAttributes
    ];
  }
  const handleDeleteEntity = (entity: string) => {
    // Remove from ID-based data
    setallcolumndata(prev => {
      const updated = { ...prev };
      delete updated[entity];
      return updated;
    });

    // Remove from Name-based section data
    setAllcolumndataWithName(prev => {
      const updatedSectionData = { ...prev[activeSectionId || 0] };
      delete updatedSectionData[entity];

      return {
        ...prev,
        [activeSectionId || 0]: updatedSectionData,
      };
    });
  };
  const handleRemoveSectionField = (indexToRemove: number) => {
    const sectionId = activeSectionId || 0;

    setSectionAttributes(prev => {
      const updatedSection = [...(prev[sectionId] || [])];
      const [removedField] = updatedSection.splice(indexToRemove, 1); // Store removed

      // Also remove from fieldAllAttributes
      setFieldAllAttributes(prevFields =>
        prevFields.filter(field => field.label !== removedField.label)
      );

      return {
        ...prev,
        [sectionId]: updatedSection,
      };
    });
  };
  const handleRemovesectionAttributestabularForm = (indexToRemove: number) => {
    const sectionId = activeSectionId || 0;

    setsectionAttributestabularForm(prev => {
      const updatedSection = [...(prev[sectionId] || [])];
      const [removedField] = updatedSection.splice(indexToRemove, 1); // Store removed

      // Also remove from customfieldAllAttributesintable
      setTableCustomFields(prevFields =>
        prevFields.filter(field => field.label !== removedField.label)
      );

      return {
        ...prev,
        [sectionId]: updatedSection,
      };
    });
  };

  const saveForm = async () => {
    const currentSectionId = activeSectionId; // ✅ Save current section ID before resetting

    const newField = {
      id: String(model.id),
      sId: String(currentSectionId),
      formName: model.name,
      fieldsData: updatedformsection,
    };

    try {
      const response = await fetch(`${baseUrl}/employee/submit-form`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newField),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Success:", result);
      alert("section Form submitted successfully!");

      setFieldAllAttributes([]);
      setSectionAttributes(prev => ({
        ...prev,
        [currentSectionId as number]: [],
      }));
      setsectionAttributestabularForm(prev => ({
        ...prev,
        [currentSectionId as number]: [],
      }));
      setallcolumndata({});
      setAllcolumndataWithName({});
      setTableCustomFields([]);
      getSection(String(activeSectionId))
      // Find current index and move to next
      const currentIndex = sections.findIndex(s => s.id === currentSectionId);
      if (currentIndex !== -1 && currentIndex + 1 < sections.length) {
        // Go to next section
        const nextSectionId = sections[currentIndex + 1].id;
        setActiveSectionId(nextSectionId); // Optional if needed
        getSection(nextSectionId);
      } else {
        // No more sections, redirect
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error posting data:", error);
    }

    handleCloseFieldModal();
  };

  const cancelForm = () => {
    handleCloseFieldModal()
    navigate(`/`);
    console.log("Form cancelled");
  };

  const handleRemoveAttributeField = async (id: any) => {
    console.log("handleRemoveAttributeField", id, fieldAllAttributes, formAttributes);

    try {
      const response = await fetch(`${baseUrl}/Home/ChangeAttributeStatus?Id=${id}`, {
        method: 'GET', // or 'PUT' or 'DELETE' based on API spec
        headers: {
          'Content-Type': 'application/json'
        }
        // body: JSON.stringify({ id }) // only needed for POST with body
      });

      if (!response.ok) {
        throw new Error(`Failed to change status for id ${id}`);
      }
      alert(`Attribute with id ${id} status changed successfully.`);
      getSectionAllData();
    } catch (error) {
      console.error('Error updating attribute status:', error);
    }
  };


  return (
    <>
      <div className="container mt-4">
        <h3>{model.label}</h3>
        <input id="EntityId" type="hidden" value={model.id} />
        <input id="EntityName" type="hidden" value={model.name} />
        <input id="SectionId" type="hidden" value={model.sectionId} />

        <div className="row border p-3 rounded" style={{
          borderColor: "black",
          height: "600px", // Set your desired height
        }}>
          <div className="col-md-4">
            <div className="row">
              <div className="col-md-6">
                <h5>Draggable Items</h5>
                <ul className="list-group">
                  {["String", "Number", "Dropdown", "Date", "AddGrid"].map((item, index) => (
                    <li
                      key={index}
                      className="list-group-item"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-md-6">
                <h5>Form Section</h5>
                <ul className="list-group">
                  <div>
                    {sections.map((section: { id: number; sectionName: string }) => (
                      <div key={section.id}>

                        <button
                          className={`list-group-item ${activeSectionId == section.id ? "active" : ""}`}
                          onClick={() => getSection(section.id)}

                        >
                          <span style={{ textTransform: 'capitalize' }}>{section.sectionName}</span>
                        </button>

                      </div>
                    ))}
                  </div>
                </ul>
                <ul className="list-group mt-2">
                  <li className="list-group-item" onClick={addSectionModel}>+ Add Section</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-md-8">
            <form>
              <div className="border p-3 rounded" style={{
                borderColor: "red",
                maxHeight: "500px", // Set your desired height
                overflowY: "auto", // Enables vertical scrolling
              }}>

                {/* === FORM AREA === */}
                <div

                  className="p-3 mb-4 form-drop-zone"
                  style={{ border: "2px dashed #ccc", minHeight: "100px" }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <h5>Drop in Form Area</h5>
                  <PartialForm
                    attributes={formAttributes}
                    onRemoveAttributeField={handleRemoveAttributeField}
                  />

                  {(sectionAttributes[activeSectionId || 0] || []).map((attr, index) => (
                    <div key={index} className="row mb-2 align-items-center">
                      <div className="col-md-6">
                        <label>{attr.label}</label>
                        <input type="text" className="form-control" readOnly value={attr.label} />
                      </div>
                      <div className="col-md-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveSectionField(index)}
                          title="Remove field"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}


                </div>

                {/* === TABLE AREA === */}
                <div
                  className="table-drop-zone p-3"
                  style={{ border: "2px dashed blue", minHeight: "100px" }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <h5>Drop in Table Area</h5>
                  <PartialForm attributes={gridAttributes as any}
                    onRemoveAttributeField={handleRemoveAttributeField} />


                  {/* Render attributes dropped for table area for active section */}
                  {(sectionAttributestabularForm[activeSectionId || 0] || []).map((attr, index) => (
                    <div key={index} className="row mb-2 align-items-center">
                      <div className="col-md-6">
                        <label>{attr.label}</label>
                        <input type="text" className="form-control" readOnly value={attr.label} />
                      </div>
                      <div className="col-md-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemovesectionAttributestabularForm(index)}
                          title="Remove field"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Section-wise rendering of allcolumndataWithName */}
                  {Object.entries(allcolumndataWithName[activeSectionId || 0] || {}).map(([entity, columns]) => (
                    <div key={entity} className="mb-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <h6>{entity}</h6>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteEntity(entity)}
                        >
                          Delete
                        </button>
                      </div>
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Column</th>
                            <th>Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {columns.map((col) => (
                            <tr key={col}>
                              <td>{col}</td>
                              <td>
                                <input type="text" className="form-control" readOnly />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}

                </div>


              </div>

              <div className="text-center mt-3">
                <button type="button" className="btn btn-secondary me-2" onClick={cancelForm}>Close</button>
                <button type="button" className="btn btn-success" onClick={saveForm}
                  disabled={updatedformsection.length == 0}
                >Save</button>

              </div>
            </form>
          </div>

        </div>
      </div>

      {/* Add New Field Modal */}
      <Modal show={showFieldModal} onHide={handleCloseFieldModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Field</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Field Type</Form.Label>
              <Form.Control
                type="text"
                name="fieldType"
                value={itemName}
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Field Name</Form.Label>
              <Form.Control
                type="text"
                name="fieldName"
                value={formData.fieldName}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Field Label</Form.Label>
              <Form.Control
                type="text"
                name="fieldLabel"
                value={formData.fieldLabel}
                onChange={handleInputChange}
              />
            </Form.Group>
            {itemName === "Dropdown" && (
              <>
                <Form.Group className="mb-2">
                  <Form.Label>Master Source</Form.Label>
                  <select
                    className="form-control"
                    name="mastersource"
                    value={formData.mastersource}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Master...</option> {/* This is your placeholder option */}
                    {masters.map((master: { id: number; name: string }) => (
                      <option key={master.id} value={master.id}>
                        {master.name}
                      </option>
                    ))}
                  </select>
                </Form.Group>



                <Form.Group className="mb-2">
                  <Form.Label>Value field</Form.Label>
                  <select
                    className="form-control"
                    name="valuefield"
                    value={formData.valuefield}
                    onChange={handleInputChange}
                  >
                    <option value="">Select value....</option>
                    {getAttributeData.map((attr: { id: number; name: string }) => (
                      <option key={attr.id} value={attr.id}>
                        {attr.name}
                      </option>
                    ))}
                  </select>
                </Form.Group>
              </>
            )}
            <Form.Group className="mb-2">
              <Form.Label>Is Dependent Field</Form.Label>
              <select
                className="form-control"
                name="isDependent"
                value={formData.isDependent ? "Yes" : "No"} // Convert boolean back to string for UI
                onChange={handleDropdownChange}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>

              {showDependentField && (
                <div className="mb-2">
                  <label className="form-label">Dependent Field</label>
                  <select
                    className="form-control"
                    name="dependentField"
                    value={formData.dependentField}
                    onChange={handleInputChange}
                  >
                    <option value="">Select dependent value....</option>
                    {attributesofPartialFormData.map((attr) => (
                      <option key={attr.id} value={attr.id}>
                        {attr.name}
                      </option>
                    ))}
                    {fieldAllAttributes.map((attr) => (
                      <option key={attr.id} value={attr.id}>
                        {attr.name}
                      </option>
                    ))}

                  </select>
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Required Field</Form.Label>
              <select
                className="form-control"
                name="isRequired"
                value={formData.isRequired ? "1" : "0"} // Convert boolean back to string for UI
                onChange={handleIsRequiredChange}
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
              {showDefaultValue && (
                <div className="mb-2">
                  <label className="form-label">Default Value</label>
                  <input
                    type="text"
                    className="form-control"
                    name="defaultValue"
                    value={formData.defaultValue}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseFieldModal}>Close</Button>
          <Button variant="success" onClick={saveField}>Save</Button>
        </Modal.Footer>
      </Modal>
      {/* Add New Field to make table */}
      <Modal show={ShowaddpartfieldFieldModal} onHide={handleCloseFieldModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Grid Columns</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>

            <Form.Group className="mb-2">
              <Form.Label>Master Source</Form.Label>
              <select
                className="form-control"
                name="mastersource"
                value={selectedEntity}
                onChange={handleEntityChange}
              >
                <option value="">Select Master...</option>
                {masters.map((master: { id: number; name: string }) => (
                  <option key={master.id} value={master.id}>
                    {master.name}
                  </option>
                ))}
              </select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Add Column</Form.Label>
              <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {getAttributeData.map((attr: { id: number; name: string }) => (
                  <Form.Check
                    key={attr.id}
                    type="checkbox"
                    label={attr.name}
                    value={attr.name}
                    checked={selectedColumns.includes(attr.name)}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSelectedColumns((prev) => [...prev, value]);
                      } else {
                        setSelectedColumns((prev) => prev.filter((c) => c !== value));
                      }
                    }}
                  />
                ))}
              </div>
            </Form.Group>

            {selectedEntity && selectedColumns.length > 0 && (
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseFieldModal}>Close</Button>
                <Button variant="success" onClick={handleSubmittablecolumn}>Save</Button>
              </Modal.Footer>
            )}

          </Form>
        </Modal.Body>
      </Modal>
      {/* Add New Section Modal */}
      <Modal show={showSectionModal} onHide={handleCloseSectionModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Section</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Screen Name</Form.Label>
              {/* <Form.Control type="text" value={model.Label} disabled /> */}
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Section Name</Form.Label>
              <Form.Control
                type="text"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSectionModal}>Close</Button>
          <Button
            variant="success"
            onClick={saveSection}
          >
            Save
          </Button>

        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EntityForm;
