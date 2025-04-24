
import React from "react";

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
}

const PartialForm: React.FC<PartialFormProps> = ({ attributes }) => {
  if (!attributes || attributes.length === 0) return <p>No data available</p>;

  return (
    <div>
      {attributes.map((attr, index) =>
        index % 2 === 0 ? (
          <div className="form-row" key={attr.id}>
            {/* Left Column */}
            <div className="form-group col-md-6">
              {attr.dataType === 'grid' ? (
                <>
                  <label>{attr.label}</label>

                  {/* Dynamically generate headers from valueField */}
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        {attr.gridMaster?.gridElements
                          ?.flatMap((el: { valueField: any }) => el.valueField)
                          ?.map((field: string, i: React.Key) => {
                            const nameOnly = typeof field === 'string' ? field.split('_')[1] : field;
                            return <th key={i}>{nameOnly}</th>;
                          })}
                      </tr>

                    </thead>
                    <tbody>
                      <tr>
                        {attr.gridMaster?.gridElements?.flatMap((el: { valueField: any; }) => el.valueField)?.map((_field: any, i: React.Key | null | undefined) => (
                          <td key={i}>--</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>

                  {/* Optional: Display Custom Properties if available */}
                  {attr.gridMaster?.customProperty?.length > 0 && (
                    <div className="mt-2">
                      <strong>Custom Properties</strong>
                      <ul>
                        {attr.gridMaster.customProperty.map((prop: any, i: React.Key | null | undefined) => (
                          <li key={i}>{JSON.stringify(prop.name)}</li> // Customize display as needed
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )
                : (
                  <>
                    <label
                      data-id={attr.id}
                      data-name={attr.name}
                      data-datatype={attr.dataType}  // ✅ lowercase and hyphen
                      data-isrequired={Number(attr.isRequired)} // ✅ lowercase
                      data-label={attr.label}
                    >
                      {attr.label}
                    </label>
              <input
                type="text"
                id={`attr_${attr.id}`}
                name={`attr_${attr.id}`}
                className="form-control"
              />
            </>
                )}
          </div>

            {/* Right Column (next attribute if exists) */ }
            { index + 1 < attributes.length && (
          <div className="form-group col-md-6">
            {attributes[index + 1].dataType === 'grid' ? (
              <>
                <label>{attributes[index + 1].label}</label>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Column 1</th>
                      <th>Column 2</th>
                      <th>Column 3</th>
                      <th>Column 4</th>
                      <th>Column 5</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Value 1</td>
                      <td>Value 2</td>
                      <td>Value 3</td>
                      <td>Value 4</td>
                      <td>Value 5</td>
                    </tr>
                  </tbody>
                </table>
              </>
            ) : (
              <>
                <label
                  data-id={attributes[index + 1].id}
                  data-name={attributes[index + 1].name}
                  data-datatype={attributes[index + 1].dataType}
                  data-isrequired={Number(attributes[index + 1].isRequired)}
                  data-label={attributes[index + 1].label}
                >
                  {attributes[index + 1].label}
                </label>
                <input
                  type="text"
                  id={`attr_${attributes[index + 1].id}`}
                  name={`attr_${attributes[index + 1].id}`}
                  className="form-control"
                />
              </>
            )}
          </div>
        )}
    </div>
  ) : null
      )}
    </div >
  );
};

export default PartialForm;
