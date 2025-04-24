import  { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import { Tooltip } from "@mui/material";

import Grid from "@mui/material/Grid"; // ✅ Correct way to import Grid
import { useNavigate } from "react-router-dom";

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

const MaterialCardFormData = () => {
  const navigate = useNavigate();
  const [entities, setEntities] = useState<Entity[]>([]);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
console.log(baseUrl);
  useEffect(() => {
    fetch(`${baseUrl}/Home/Index`)
      .then((response) => response.json())
      .then((data) => setEntities(data))
      .catch((error) => console.error("Error fetching entities:", error));
  }, []);

  const addData = (entity: Entity) => {
    navigate(`/allGrid/${entity.id}`, { state: { entityData: entity } });
  };

  // const handleStatusChange = (id: number) => {
  //   fetch(`/api/changeStatus/${id}`, { method: "POST" })
  //     .then((response) => {
  //       if (response.ok) {
  //         alert("Entity modified successfully!");
  //         setEntities((prev) =>
  //           prev.map((entity) =>
  //             entity.id === id ? { ...entity, isActive: !entity.isActive } : entity
  //           )
  //         );
  //       }
  //     })
  //     .catch((error) => alert("Error submitting form. Please try again."));
  // };

  return (

   <div style={{height: "inherit", overflowY: "auto"}}>
     <Grid container spacing={3} sx={{ padding: 4 }}>
      {entities.map((entity) => (
        <Grid  key={entity.id}>
          <Tooltip
            title={entity.isActive ? entity.name : "This entity is Inactive"}
            arrow
            placement="top"
          >
            <Card
              sx={{
                height: "100%",
                width: "320px",
                backgroundColor: entity.isActive ? "#f6f6f6" : "#f6f6f6",
                padding: 2,
                transition: "0.3s",
                '&:hover': {
                  backgroundColor: entity.isActive ? "#dad7d7" : "#dad7d7",
                  boxShadow: 4,
                  cursor: "pointer",
                },
              }}
            >


              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {entity.name}
                </Typography>
                <Typography variant="body2">
                  <strong>ID:</strong> {entity.id}
                </Typography>
                <Typography variant="body2">
                  <strong>Status:</strong> {entity.isActive ? "Active" : "Inactive"}
                </Typography>
                <Typography variant="body2">
                  <strong>Created:</strong>{" "}
                  {new Date(entity.createdDate).toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Modified:</strong>{" "}
                  {new Date(entity.modifiedDate).toLocaleString()}
                </Typography>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: "#ea3434", color: "white", marginRight: 1 }}
                  onClick={() => addData(entity)}
                >
                  Add Data
                </Button>
              </CardContent>
            </Card>
          </Tooltip>
        </Grid>
      ))}
    </Grid>
   </div>
    
  );
};

export default MaterialCardFormData;
