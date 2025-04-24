import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import React, { useEffect, useState } from 'react';
import './getform.css';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
const defaultSteps = [
    'Job Card Details', 'Vehicle Information', 'Customer Information',
    'Service Details', 'Sales & Warranty Information', 'Mechanic & Workshop Details',
    'Service & Cost Details', 'Additional Actions & Attachment', 'Final Submission Approval'
];

export default function VerticalLinearStepper() {
    const [activeStep, setActiveStep] = React.useState(0);
    const [skipped, setSkipped] = React.useState(new Set<number>());
    const isStepOptional = (step: number) => step === 1;
    const navigate = useNavigate();
    const location = useLocation();
    const model = location.state?.entityData; // Get the passed data
    const selectedRow = location.state?.selectedRow;
    console.log(model);
    const isStepSkipped = (step: number) => skipped.has(step);
    const baseUrl = import.meta.env.VITE_API_BASE_URL;


    const handleNext = () => {
        let newSkipped = skipped;
        if (isStepSkipped(activeStep)) {
            newSkipped = new Set(newSkipped.values());
            newSkipped.delete(activeStep);
        }

        setActiveStep((prev) => prev + 1);
        setSkipped(newSkipped);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSkip = () => {
        if (!isStepOptional(activeStep)) {
            throw new Error("You can't skip a step that isn't optional.");
        }

        setActiveStep((prev) => prev + 1);
        setSkipped((prevSkipped) => {
            const newSkipped = new Set(prevSkipped.values());
            newSkipped.add(activeStep);
            return newSkipped;
        });
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    const [allSectionformData, setallSectionformData] = useState<any>(null);

    const [section, setSection] = useState<any[]>([]);
    const [steps, setSteps] = useState<string[]>(defaultSteps);
    // const [formData, setFormData] = useState<{ [key: string]: { value: string } }>({});
    const [formData, setFormData] = useState<Record<string, { name: string; value: string; options?: any[] }>>({});
    //   const [autocompleteData, setAutocompleteData] = useState([]);
    const [autocompleteData, setAutocompleteData] = useState<any[]>([]);  // Type the state here
    const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
    // Use object keyed by AttributeId to manage separate values
    const [gridFormValues, setGridFormValues] = useState<Record<string, Record<string, string>>>({});
    const [gridSubmittedRows, setGridSubmittedRows] = useState<Record<string, Record<string, string>[]>>({});
    //const [formValues, setFormValues] = useState({});
    // const [formValues, setFormValues] = useState<Record<string, string>>({});

    useEffect(() => {
        const id = model?.id ?? 9; // Use model.id if available, otherwise fallback to 9
        console.log("id", id);
        fetch(`${baseUrl}/employee/GetFormData?id=${id}`)
            .then((response) => response.json())
            .then((data) => setallSectionformData(data))
            .catch((error) => console.error("Error fetching entities:", error));
    }, [model]);
    // Fetch data from the API
    const fetchAutocompleteData = async () => {
        try {
            const response = await fetch(`${baseUrl}/spare/GetPartMasterByPartNo?partno`);
            const data = await response.json();
            setAutocompleteData(data);
            setInputValues(data)
        } catch (error) {
            console.error('Error fetching autocomplete data:', error);
        }
    };

    // const fetchAutocompleteDataByOnChange = async (partNo: string) => {
    //     try {
    //         const response = await fetch(`${baseUrl}/spare/GetPartMasterByPartNo?partno=${partNo}`);
    //         const data = await response.json();
    //         console.log("datra", data);

    //         setAutocompleteData(data);
    //     } catch (error) {
    //         console.error('Error fetching autocomplete data:', error);
    //     }
    // };
    // Fetch data when component mounts
    useEffect(() => {
        fetchAutocompleteData();
    }, []);

    const [attributes, setAttributes] = useState<any[]>([]);
    const [dynamicData, setDynamicData] = useState<any>({});
    const [gridsData, setGridsData] = useState<any[]>([]);

    useEffect(() => {
        if (model && selectedRow) {
            axios
                .get(`${baseUrl}/spare/GetItemDetail?ScreenId=${model.id}&ItemId=${selectedRow.ID}`)
                .then((res) => {
                    setAttributes(res.data.attributes || []);
                    setDynamicData(res.data.dynamicItemDetail?.[0] || {});
                    setGridsData(res.data.gridsData || []);
                });
        }
    }, [selectedRow]
    );


    console.log(attributes, dynamicData, gridsData);

    console.log(allSectionformData);

    useEffect(() => {
        if (!allSectionformData) return; // wait for data

        const entityData = allSectionformData;
        console.log("entityData", entityData.formSections);

        const sectionData = entityData.formSections.map((section: any) => ({
            ...section,
            attributes: entityData.attributes
                .filter((attr: any) => attr.sectionId === section.id)
                .sort((a: { sortOrder: number; }, b: { sortOrder: number; }) => a.sortOrder - b.sortOrder)
        }));

        setSection(sectionData);
    }, [allSectionformData]);
    console.log("sectionData", section);
    // This runs when section data is updated
    useEffect(() => {
        if (section.length > 0) {
            const sectionSteps = section.map(s => s.sectionName); // or use any other property
            setSteps(sectionSteps);
        } else {
            setSteps(defaultSteps);
        }
    }, [section]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, attr: any) => {
        const { value } = e.target;
        console.log("intstringchangefield", attr.name, value);

        setFormData(prev => ({
            ...prev,
            [attr.id]: {
                ...prev[attr.id],
                name: attr.name,
                value: value,
            },
        }));
    };
    useEffect(() => {
        const initialData: any = {};
        section.forEach(sec => {
            sec.attributes.forEach((attr: { id: string | number; }) => {
                initialData[attr.id] = { value: "" };
            });
        });
        setFormData(initialData);
    }, [section]);
    useEffect(() => {
        const initialData: any = {};
        section.forEach(sec => {
            sec.attributes.forEach((attr: { id: string | number; name: string; dataType?: string }) => {
                if (attr.dataType !== 'grid') {
                    initialData[attr.id] = {
                        name: attr.name,
                        value: dynamicData?.[attr.name] ?? '',
                    };
                }
            });
        });
        setFormData(initialData);


        // Submitted rows for the grid
        const initialGridRows: { [key: string]: any[] } = {};
        gridsData?.forEach((gridItem: any) => {
            if (gridItem.attributeId) {
                initialGridRows[gridItem.attributeId] = gridItem.gridItems ?? [];
            }
        });
        setGridSubmittedRows(initialGridRows);

        // Top row input values for each grid
        const initialFormValues: { [key: string]: any } = {};
        gridsData?.forEach((gridItem: any) => {
            if (gridItem.attributeId) {
                const firstRow = gridItem.gridItems?.[0] ?? {};
                initialFormValues[gridItem.attributeId] = { ...firstRow };
            }
        });
        setGridFormValues(initialFormValues);

    }, [section, dynamicData, gridsData]);


    const fetchDropdownOptions = async (attr: any) => {
        console.log("attr", attr);

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
            console.log("data", data);

            setFormData((prev) => ({
                ...prev,
                [attr.id]: {
                    value: prev[attr.id]?.value || "", // ✅ Keep previously selected value
                    name: attr.name,
                    options: data.options,             // ✅ Update options only
                },
            }));

        } catch (error) {
            console.error("Error fetching dropdown options", error);
        }
    };




    const handleInputChangedatagrid = (
        e: React.ChangeEvent<HTMLInputElement>,
        attrId: string
    ) => {
        const { name, value } = e.target;

        // Update form values for this specific grid (by attrId)
        setGridFormValues(prev => ({
            ...prev,
            [attrId]: {
                ...prev[attrId],
                [name]: value
            }
        }));

        const selectedPart = autocompleteData.find(item => item.partno === value);
        console.log("selectedPartcheck", selectedPart, attrId, section);
        console.log("section", section);
        const gridElements = section
            .flatMap(sec =>
                sec.attributes
                    .filter((attr: { dataType: string; gridMaster: { gridElements: any; }; }) => attr.dataType === 'grid' && attr.gridMaster?.gridElements)
                    .flatMap((attr: { gridMaster: { gridElements: any; }; }) => attr.gridMaster.gridElements)
            );

        console.log("gridElements", gridElements);
        const cleanedFieldsMap: Record<string, string[]> = {};

        section.forEach(sec => {
            sec.attributes
                .filter((attr: { dataType: string; gridMaster: { gridElements: any; }; }) => attr.dataType === 'grid' && attr.gridMaster?.gridElements)
                .forEach((attr: { id: string; gridMaster: { gridElements: any[]; }; }) => {
                    const fieldGroup = attr.gridMaster.gridElements.flatMap(el =>
                        el.valueField.map((field: string) => field.split('_')[1])
                    );
                    cleanedFieldsMap[attr.id] = fieldGroup;
                });
        });

        console.log("cleanedFieldsMap", cleanedFieldsMap);

        if (selectedPart && cleanedFieldsMap[attrId]) {
            const fieldGroup = cleanedFieldsMap[attrId];

            const updated = fieldGroup.reduce((acc: any, field: string) => {
                if (field in selectedPart) {
                    acc[field] = selectedPart[field];
                }
                return acc;
            }, {});

            setGridFormValues(prev => ({
                ...prev,
                [attrId]: {
                    ...prev[attrId],
                    ...updated
                }
            }));
        }




    };
    console.log("selectedPartcheckaftergbbgb", gridFormValues);
    const handleGridInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        attrId: string
    ) => {
        const { name, value } = e.target;
        setGridFormValues(prev => ({
            ...prev,
            [attrId]: {
                ...prev[attrId],
                [name]: value
            }
        }));
    };
    console.log("selectedPartcheckafter", gridFormValues);

    console.log("autocompleteData", autocompleteData, inputValues);

    // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const { name, value } = e.target;
    //     console.log(name, value);
    //     setFormValues(prev => ({ ...prev, [name]: value }));
    //     console.log(formData, formValues);
    // };
    // console.log(formValues);
    const handleAddRow = (attrId: string) => {
        const currentForm = gridFormValues[attrId] || {};
        console.log("handleAddRow", currentForm);

        setGridSubmittedRows(prev => ({
            ...prev,
            [attrId]: [...(prev[attrId] || []), currentForm]
        }));

        // Reset grid input fields
        setGridFormValues(prev => ({
            ...prev,
            [attrId]: {}
        }));
    };
    const handleDeleteRow = (attrId: string, indexToDelete: number) => {
        setGridSubmittedRows(prev => ({
            ...prev,
            [attrId]: prev[attrId].filter((_, index) => index !== indexToDelete)
        }));
    };


    // Map your regular form fields
    const AllfieldsDataModel = Object.values(formData)
        .filter((field: any) => field?.name)
        .map(({ name, value }) => ({
            name,
            value
        }));

    if (selectedRow) {
        AllfieldsDataModel.push({
            name: "id",
            value: String(selectedRow.ID) || "13" // or just "13" if it's always constant
        });
    }


    type TransformedEntry = {
        name: string;
        value: string;
        AttributeId: string;
        GridDatas: any[];
    };


    const transformedData: TransformedEntry[] = Object.entries(gridSubmittedRows).map(
        ([attributeId, rows]) => ({
            name: "datagrid",
            value: "",
            AttributeId: attributeId,
            GridDatas: rows.map(item => ({
                RowData: Object.entries(item).map(([key, value]) => ({
                    Name: key,
                    Value: String(value)
                }))
            }))
        })
    );


    const completeData = [
        ...AllfieldsDataModel,  // Spread to include AllfieldsDataModel
        ...transformedData      // Spread to include transformedData
    ];


    console.log("completeData", completeData);


    const handleSubmit = async () => {

        try {
            const requestBody = selectedRow
                ? {
                    // If selectedRow exists (i.e., update mode)
                    id: String(model.id),
                    formName: model?.label ?? 'sale-Invoice',
                    fieldsDataModel: completeData,
                    // Include anything else required for update
                }
                : {
                    // If no selectedRow (i.e., insert mode)
                    id: String(model.id),
                    formName: model?.label ?? 'sale-Invoice',
                    fieldsDataModel: completeData,
                };
            console.log(requestBody);

            const response = await fetch(`${baseUrl}/employee/InsertFormData`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });


            if (!response.ok) throw new Error("Failed to submit form");

            alert("Form submitted successfully!");

            navigate(`/allGrid/${model.id}`, { state: { entityData: model } });
        } catch (error) {
            console.error("Error submitting form", error);
            alert("Error submitting form. Please try again.");
        }
    };
    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: '30px' }}>
                <span style={{ font: "40px", padding: '5px', margin: '10px' }}>{model.label}</span>
                <button
                    onClick={() => navigate(`/allGrid/${model.id}`, { state: { entityData: model } })}
                    style={{ color: "white", backgroundColor: "blue", borderRadius: '10px', width: "100px", height: "40px", padding: '5px' }}
                >
                    BACK
                </button>
            </div>
            <Box sx={{ display: 'flex', flexDirection: 'row', p: 2 }}>
                {/* Stepper Section */}
                <Box sx={{ width: '25%', pr: 2 }}>
                    <Stepper activeStep={activeStep} orientation="vertical">
                        {steps.map((label, index) => {
                            const stepProps: { completed?: boolean } = {};
                            const labelProps: {
                                optional?: React.ReactNode;
                            } = {};
                            if (isStepOptional(index)) {
                                labelProps.optional = (
                                    <Typography variant="caption">Optional</Typography>
                                );
                            }
                            if (isStepSkipped(index)) {
                                stepProps.completed = false;
                            }
                            return (
                                <Step key={label} {...stepProps}>
                                    <StepLabel {...labelProps}>{label}</StepLabel>
                                </Step>
                            );
                        })}
                    </Stepper>
                </Box>

                {/* Form/Card Section */}
                <Box sx={{ flexGrow: 1 }}>
                    <Card sx={{ p: 2 }}>
                        <CardContent>
                            {activeStep === steps.length ? (
                                <React.Fragment>
                                    <Typography variant="h6" gutterBottom>
                                        All steps completed - you're finished
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                        <Button variant="contained" onClick={handleReset}>Reset</Button>
                                    </Box>
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    <Typography variant="h6" gutterBottom>
                                        Step {activeStep + 1}: {steps[activeStep]}
                                    </Typography>

                                    <Typography sx={{ mt: 1, mb: 3 }}>
                                        <div className="col-md-10">
                                            <div className="tab-content">
                                                {section
                                                    .filter((_, index) => index === activeStep) // 👈 Only show the active section
                                                    .map((section, sectionIndex) => (
                                                        <div key={sectionIndex} className="mb-4">
                                                            {/* <h5>{section.sectionName}</h5> */}

                                                            {section.attributes.map((attr: {
                                                                id: string | number;
                                                                options: any;
                                                                label: React.ReactNode;
                                                                dataType: string;
                                                            }, attrIndex: React.Key | null | undefined) => (
                                                                <div key={attrIndex} className="form-group">
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

                                                                    ) : attr.dataType.toLowerCase() === "grid" && (attr as any).gridMaster ? (
                                                                        <div className="grid-block mb-3">
                                                                            <table className="table table-striped table-hover table-bordered shadow-sm rounded">
                                                                                <thead className="thead-dark">
                                                                                    <tr>
                                                                                        {(attr as any).gridMaster.gridElements
                                                                                            .flatMap((gridItem: { valueField: string[] }) =>

                                                                                                gridItem.valueField.map(field => field.includes("_") ? field.split("_")[1] : field) // extract name only
                                                                                            )
                                                                                            .map((name: string, index: number) => (
                                                                                                <th key={index} className="text-center align-middle">{name}</th>
                                                                                            ))}

                                                                                        {/* customProperty fields */}
                                                                                        {(attr as any).gridMaster.customProperty?.map((prop: any, index: number) => (
                                                                                            <th key={index}>{prop.name}</th>
                                                                                        ))}

                                                                                        <th className="text-center align-middle">Action</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    <tr>
                                                                                        {/* gridElements.valueField columns */}
                                                                                        {(attr as any).gridMaster.gridElements
                                                                                            .flatMap((gridItem: { valueField: string[] }) => gridItem.valueField)
                                                                                            .map((field: string, index: number) => {
                                                                                                const [idPart, namePart] = field.split('_'); // Split to get name
                                                                                                console.log(idPart);

                                                                                                return (
                                                                                                    <>

                                                                                                        <td key={`field-${index}`}>
                                                                                                            {namePart === 'partno' ? (
                                                                                                                <div>
                                                                                                                    <input
                                                                                                                        type="text"
                                                                                                                        name={namePart}
                                                                                                                        className="form-control"
                                                                                                                        value={gridFormValues[attr.id]?.[namePart] || ''}
                                                                                                                        onChange={(e) => handleInputChangedatagrid(e, String(attr.id))}
                                                                                                                        placeholder={`Enter ${namePart}`}
                                                                                                                        list={`autocomplete-${namePart}`}
                                                                                                                    />
                                                                                                                    <datalist id={`autocomplete-${namePart}`}>
                                                                                                                        {autocompleteData
                                                                                                                            .filter(item =>
                                                                                                                                item.partno.toLowerCase().includes((inputValues[namePart] || '').toLowerCase())
                                                                                                                            )
                                                                                                                            .map(item => (
                                                                                                                                <option key={item.ID} value={item.partno}>
                                                                                                                                    {item.partdescription}
                                                                                                                                </option>
                                                                                                                            ))}
                                                                                                                    </datalist>
                                                                                                                </div>
                                                                                                            ) : (
                                                                                                                <input
                                                                                                                    type="text"
                                                                                                                    name={namePart}
                                                                                                                    className="form-control"
                                                                                                                    value={gridFormValues[attr.id]?.[namePart] || ''}
                                                                                                                    onChange={(e) => handleGridInputChange(e, String(attr.id))}
                                                                                                                    placeholder={`Enter ${namePart}`}
                                                                                                                />
                                                                                                            )}
                                                                                                        </td>
                                                                                                    </>
                                                                                                );
                                                                                            })}

                                                                                        {(attr as any).gridMaster.customProperty?.map((prop: any, index: number) => (
                                                                                            <td key={`custom-${index}`}>
                                                                                                <input
                                                                                                    type="text"
                                                                                                    name={prop.name}
                                                                                                    className="form-control"
                                                                                                    value={gridFormValues[attr.id]?.[prop.name] || ''}
                                                                                                    onChange={(e) => handleGridInputChange(e, String(attr.id))}
                                                                                                    placeholder={`Enter ${prop.label || prop.name}`}
                                                                                                />
                                                                                            </td>
                                                                                        ))}

                                                                                        {/* Add button */}
                                                                                        <td className="text-center">
                                                                                            <button
                                                                                                onClick={() => handleAddRow(String(attr.id))}
                                                                                                className="btn btn-sm btn-success px-3"
                                                                                            >
                                                                                                Add
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>

                                                                            </table>
                                                                            {gridSubmittedRows[attr.id]?.length > 0 && (() => {
                                                                                const fieldNames = [
                                                                                    // From gridElements.valueField (strip ID prefix)
                                                                                    ...(attr as any)?.gridMaster?.gridElements?.flatMap(
                                                                                        (gridItem: { valueField: string[] }) =>
                                                                                            gridItem.valueField.map((field: string) => field.includes('_') ? field.split('_')[1] : field)
                                                                                    ) || [],

                                                                                    // From customProperty.name (use directly)
                                                                                    ...(attr as any)?.gridMaster?.customProperty?.map(
                                                                                        (customItem: { name: string }) => customItem.name
                                                                                    ) || []
                                                                                ];


                                                                                console.log("fieldNames", fieldNames);


                                                                                return (
                                                                                    <table className="addtable table-bordered" style={{ border: '2px solid green', width: '100%', marginTop: '10px' }}>
                                                                                        <thead>
                                                                                            <tr>
                                                                                                {fieldNames.map((field: string, index: number) => (
                                                                                                    <th key={index}>{field}</th>
                                                                                                ))}
                                                                                                <th>Action</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            {gridSubmittedRows[attr.id]?.map((row: any, rowIndex: number) => (
                                                                                                <tr key={rowIndex}>
                                                                                                    {fieldNames.map((col: string, colIndex: number) => (
                                                                                                        <td key={colIndex}>{row[col] ?? ''}</td>
                                                                                                    ))}
                                                                                                    <td>
                                                                                                        <button
                                                                                                            onClick={() =>
                                                                                                                handleDeleteRow(String(attr.id), rowIndex)
                                                                                                            }
                                                                                                            className="btn btn-danger"
                                                                                                        >
                                                                                                            Delete
                                                                                                        </button>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            ))}
                                                                                        </tbody>
                                                                                    </table>
                                                                                );
                                                                            })()}



                                                                        </div>

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
                                                    ))}
                                            </div>
                                        </div>
                                    </Typography>


                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Button
                                            disabled={activeStep === 0}
                                            onClick={handleBack}
                                            variant="outlined"
                                        >
                                            Back
                                        </Button>

                                        <Box>
                                            {isStepOptional(activeStep) && (
                                                <Button
                                                    color="inherit"
                                                    onClick={handleSkip}
                                                    sx={{ mr: 1 }}
                                                >
                                                    Skip
                                                </Button>
                                            )}
                                            <Button variant="contained" onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}>
                                                {activeStep === steps.length - 1
                                                    ? selectedRow
                                                        ? 'Update'
                                                        : 'Submit'
                                                    : 'Proceed'}

                                            </Button>

                                        </Box>
                                    </Box>
                                </React.Fragment>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </>

    );
}
