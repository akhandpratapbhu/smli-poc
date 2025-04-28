
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
// Define the structure of the API response
interface Entity {
  id: number;
  name: string;
  label: string;
  isActive: boolean;
  createdBy: number;
  createdDate: string;
  modifiedBy: number;
  modifiedDate: string;
  sectionId: number;
  formSections: any;
  attributes: any[];
}

const MaterialTableFormData = () => {
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // Define state with a type
  const [entities, setEntities] = useState<Entity[]>([]);

  useEffect(() => {

    fetch(`${baseUrl}/Home/Index`)
      .then((response) => response.json())
      .then((data) => setEntities(data))
      .catch((error) => console.error("Error fetching entities:", error));
  }, []);

  const editRow = (entity: any) => {
    navigate(`/employee/index/${entity.id}`, { state: { entityData: entity } });
  };


  const handleStatusChange = (id: number) => {
    fetch(`${baseUrl}/Home/ChangeStatus?id=${id}`, { method: "GET" })
      .then((response) => {
        if (response.ok) {
          alert("Entity modified successfully!");
          // Update state to reflect changes
          setEntities((prev) =>
            prev.map((entity) =>
              entity.id === id ? { ...entity, isActive: !entity.isActive } : entity
            )
          );
        }
      })
      .catch((error) => alert(error));
  };
  const [showNewMasterModal, setshowNewMasterModal] = useState(false);
  const handleCloseNewMasterModal = () => setshowNewMasterModal(false);
  const [newMasterName, setNewMasterName] = useState("");
  const addNewMasterModel = () => {
    setshowNewMasterModal(true);
  };
  const saveNewMasterModel = async () => {
    if (newMasterName.trim() === "") return;
    const requestBody =
    {
      id: String(0),
      formName: newMasterName,
    }
    console.log(requestBody);

    try {
      const response = await fetch(`${baseUrl}/employee/InsertMaster`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Success:", result);
      // Update sections state to trigger useEffect
      // getSectionAllData()
    } catch (error) {
      console.error("Error posting data:", error);
    }
    handleCloseNewMasterModal();
  };
  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: '30px' }}>
  <button
    onClick={() => addNewMasterModel()}
    style={{
      color: "white",
      backgroundColor: "#ea3434",
      borderRadius: "10px",
      width: "150px",
      height: "40px",
      padding: "5px"
    }}
  >
    + Add New Master
  </button>
</div>

      {/* Add New Section Modal */}
      <Modal show={showNewMasterModal} onHide={handleCloseNewMasterModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Master</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Screen Name</Form.Label>
              {/* <Form.Control type="text" value={model.Label} disabled /> */}
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Master Name</Form.Label>
              <Form.Control
                type="text"
                value={newMasterName}
                onChange={(e) => setNewMasterName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseNewMasterModal}>Close</Button>
          <Button
            variant="success"
            onClick={saveNewMasterModel}
          >
            Save
          </Button>

        </Modal.Footer>
      </Modal>
      <TableContainer component={Paper} sx={{
        maxWidth: 900, margin: "auto", marginTop: 4, height: "650px",
        overflowY: "auto"
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#333", color: "white" }}>
              <TableCell sx={{ color: "white" }}>ID</TableCell>
              <TableCell sx={{ color: "white" }}>Name</TableCell>
              <TableCell sx={{ color: "white" }}>Status</TableCell>
              <TableCell sx={{ color: "white" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entities.map((entity) => (
              <TableRow key={entity.id}>
                <TableCell>{entity.id}</TableCell>
                <TableCell>{entity.name}</TableCell>
                <TableCell>{entity.isActive ? "Active" : "Inactive"}</TableCell>
                <TableCell>
                  {entity.isActive && (
                    <Button
                      variant="contained"
                      style={{ backgroundColor: "rgb(25 135 84)", color: "white", marginRight: 1 }}
                      onClick={() => editRow(entity)}
                    >
                      EDIT
                    </Button>
                  )}

                  <Button
                    variant="contained"
                    style={{ backgroundColor: "rgb(220 53 69)", color: "white" }}
                    onClick={() => handleStatusChange(entity.id)}
                  >
                    {entity.isActive ? "DEACTIVATE" : "ACTIVATE"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default MaterialTableFormData;

