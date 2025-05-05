
import React from "react";
import './partialform.css'
interface Attribute {
  gridMaster: any;
  id: string | number;
  name: string;
  dataType: string;
  isRequired: boolean | number;
  label: string;
}

interface PartialFormProps {
  attributes: Attribute[];
  onRemoveAttributeField?: (id: any) => void;
}


const PartialForm: React.FC<PartialFormProps> = ({ attributes, onRemoveAttributeField }) => {
  if (!attributes || attributes.length === 0) return <p>No data available</p>;
  console.log("attributes", attributes);
  function handleRemoveAttributeField(id: any) {
    if (onRemoveAttributeField) {
      onRemoveAttributeField(id);
    }
  }
  
  return (
    <div className="field-container">
      {attributes.map((attr, index) =>
      (

          <div className="form-row mb-2 align-items-center" key={attr.id}>
            {/* Left Column */}
            <div className="form-group col-md-6">
              {attr.dataType === 'grid' ? (
                <>
                  <label>{attr.label}</label>

                  {/* Grid Table */}
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        {attr.gridMaster?.gridElements?.flatMap((el: { valueField: any; }) => el.valueField)?.map((field: string, i: React.Key) => {
                          const nameOnly = typeof field === 'string' ? field.split('_')[1] : field;
                          const idOnly = typeof field === 'string' ? field.split('_')[0] : field;
                          return (
                            <th key={i} className=" justify-content-between align-items-center">
                              <span>{nameOnly}</span>
                              <button
                                type="button" // <- IMPORTANT
                                className="btn btn-sm btn-outline-danger ms-2"
                                title="Remove column"
                               onClick={() => handleRemoveAttributeField(idOnly)} // optional handler
                              >
                                &times;
                              </button>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {attr.gridMaster?.gridElements?.flatMap((el: { valueField: any; }) => el.valueField)?.map((_field: any, i: React.Key) => (
                          <td key={i}>--</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>

                  {/* Optional: Custom Properties */}
                  {attr.gridMaster?.customProperty?.length > 0 && (
                    <div className="mt-2">
                      <strong>Custom Properties</strong>
                      <ul className="list-unstyled">
                        {attr.gridMaster.customProperty.map((prop: any, i: React.Key) => (
                          <li key={i} className="d-flex justify-content-between align-items-center">
                            <span>{prop.name}</span>
                            <button
                              type="button" // <- IMPORTANT
                              className="btn btn-sm btn-outline-danger"
                              title="Remove property"
                              onClick={() => handleRemoveAttributeField?.(prop.id)}                       >
                              &times;
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )
                : (
                  <>
                    <div key={index} className="d-flex justify-content-between align-items-center">
                      <div className="min-width">
                        <label
                          data-id={attr.id}
                          data-name={attr.name}
                          data-datatype={attr.dataType}
                          data-isrequired={Number(attr.isRequired)}
                          data-label={attr.label}
                          className="form-label"
                        >
                          {attr.label}
                        </label>
                        <input
                          type="text"
                          id={`attr_${attr.id}`}
                         // name={`attr_${attr.id}`}
                          className="form-control"
                        />

                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveAttributeField?.(attr.id)}
                      >
                        &times;
                      </button>


                    </div>


                  </>
                )}
            </div>

          </div>
 
      )
      )}
    </div >
  );
};

export default PartialForm;
