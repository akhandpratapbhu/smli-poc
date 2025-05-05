
import { useNavigate } from "react-router-dom";
import { Modal, Form } from "react-bootstrap";
import { useState, ChangeEvent, MouseEvent, useEffect } from "react";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import { Button } from '@mui/material';

import './index.css';
import {
  Box,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Checkbox,
  Menu,
  MenuItem,
  Popover,
  InputAdornment,
  FormControlLabel,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Search, KeyboardArrowDown, FilterList, TableRows } from "@mui/icons-material";
import Loader from "../../shareable/Loader";

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
  Action?: string;
}
interface Column {
  id: keyof Entity;
  label: string;
  visible: boolean;
}



const MaterialTableFormData = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selected, setSelected] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("");
  const [selectedRow, setSelectedRow] = useState<Entity | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  // Menu states
  const [manageColumnsAnchor, setManageColumnsAnchor] = useState<HTMLButtonElement | null>(null);
  const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(null);
  const [searchTermsColumnWise, setSearchTermsColumnWise] = useState<Record<keyof Entity, string>>({
    id: '',
    name: '',
    label: '',
    isActive: '',
    createdBy: '',
    createdDate: '',
    modifiedBy: '',
    modifiedDate: '',
    sectionId: '',
    formSections: '',
    attributes: '',
    Action: ''
  });
  //const [columns, setColumns] = useState<Column[]>([]);

  const [columns, setColumns] = useState<Column[]>([
    { id: 'id', label: 'ID', visible: true },
    { id: 'name', label: 'Name', visible: true },
    { id: 'label', label: 'Label', visible: true },
    { id: 'isActive', label: 'Is Active', visible: true },
    { id: 'createdDate', label: 'Created Date', visible: true },
    { id: 'modifiedDate', label: 'Modified Date', visible: true },
    { id: 'Action', label: 'Action', visible: true },
  ]);

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [showNewMasterModal, setshowNewMasterModal] = useState(false);
  const handleCloseNewMasterModal = () => setshowNewMasterModal(false);
  // Define state with a type
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState<boolean>(true); //  loading state
  const [isEditMode, setIsEditMode] = useState(false);
const [newMasterName, setNewMasterName] = useState('');
const [selectedMaster, setSelectedMaster] = useState<any>({
  name: ""
}); // optional, stores selected row

  useEffect(() => {
    setLoading(true); //  Show loader before fetch
    fetch(`${baseUrl}/Home/Index`)
      .then((response) => response.json())
      .then((data) => {
        setEntities(data)
        setLoading(false);
      }
      )
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching entities:", error)
      });
  }, []);  // Empty dependency array to call once when component mounts

  const getAllMasters = () => {
    // Fetch data and update state when called   
    setLoading(true); //  Show loader before fetch 


    fetch(`${baseUrl}/Home/Index`)
      .then((response) => response.json())
      .then((data) => {
        setEntities(data)
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching entities:", error)
      });
  };

  const editRow = (entity: any) => {
    navigate(`/employee/index/${entity.id}`, { state: { entityData: entity } });
  };

  const editRowMaster = (row: Entity) => {
    setIsEditMode(true);
    setSelectedMaster(row); // store entire row if needed
    setNewMasterName(row.label); // populate the form field
    setshowNewMasterModal(true);
    setIsPopupOpen(false)
  };
  
  const handleStatusChange = (id: number) => {
    setLoading(true);
    fetch(`${baseUrl}/Home/ChangeStatus?id=${id}`, { method: "GET" })
      .then((response) => {
        setLoading(false);
        if (response.ok) {
          alert("Entity modified successfully!");
          // Update state to reflect changes
          setIsPopupOpen(false)
          setEntities((prev) =>
            prev.map((entity) =>
              entity.id === id ? { ...entity, isActive: !entity.isActive } : entity
            )
          );
        }

      })
      .catch((error) => {
        setLoading(false);
        alert(error);
      })

  };

  // const addNewMasterModel = () => {
  //   setshowNewMasterModal(true);
  //   setIsPopupOpen(false)
  // };
  const addNewMasterModel = () => {
    setIsEditMode(false);
    setNewMasterName('');
    setshowNewMasterModal(true);
  };
  
  const saveNewMasterModel = async () => {
    if (newMasterName.trim() === "") return;
  
    let requestBody;
  
    if (isEditMode) {
      // Update Mode
      console.log("Updating master:", selectedMaster.id, newMasterName);
      requestBody = {
        id: String(selectedMaster.id),
        formName: newMasterName,
      };
    } else {
      // Add Mode
      console.log("Adding new master:", newMasterName);
      requestBody = {
        id: String(0), // ID = 0 for new entries
        formName: newMasterName,
      };
    }
  
    try {
      setLoading(true);
  
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
      alert(isEditMode ? "Master updated successfully!" : "New master created successfully!");
    } catch (error) {
      console.error("Error posting data:", error);
    } finally {
      setLoading(false);
      getAllMasters();
      handleCloseNewMasterModal();
    }
  };
  

  const handleSelectAllClick = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = entities.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleClick = (event: MouseEvent<HTMLTableRowElement>, id: number) => {
    console.log(event);

    const selectedIndex = selected.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((selectedId) => selectedId !== id);
    }

    setSelected(newSelected);
  };

  const handleColumnVisibilityChange = (columnId: keyof Entity) => {
    setColumns(
      columns.map((col) =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const isSelected = (id: number) => selected.includes(id);

  const handleChangePage = (event: unknown, newPage: number) => {
    console.log("event", event);

    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchColumnWise = (id: keyof Entity, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSearchTermsColumnWise((prev) => ({
      ...prev,
      [id]: e.target.value.toLowerCase(),
    }));
  };



  const filteredData = entities.filter((item) => {
    // Global Search Logic
    const isGlobalMatch = Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm)
    );

    // Column-Wise Search Logic
    const isColumnMatch = Object.entries(searchTermsColumnWise).every(([key, term]) => {
      if (!term) return true; // Skip filtering for empty search fields
      return String(item[key as keyof Entity]).toLowerCase().includes(term);
    });

    return isGlobalMatch && isColumnMatch; // Both filters should match
  });

  const handleRequestSort = (columnId: string) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const sortedData = [...filteredData].sort((a, b) => {
    if (orderBy) {
      const key = orderBy as keyof Entity;

      const aValue = a[key];
      const bValue = b[key];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return order === "asc" ? -1 : 1;
      if (bValue == null) return order === "asc" ? 1 : -1;

      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
    }
    return 0;
  });


  const handleActionClick = (row: Entity) => {
    setSelectedRow(row);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedRow(null);
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
            padding: "3px",
            marginBottom: '15px'
          }}
        >
          + Add New Master
        </button>
      </div>

      {/* Add New Section Modal */}
      <Modal show={showNewMasterModal} onHide={handleCloseNewMasterModal}>
  <Modal.Header closeButton>
    <Modal.Title>{isEditMode ? "Edit Master" : "Add New Master"}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
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
    <Button variant="outlined" onClick={handleCloseNewMasterModal}>
      Close
    </Button>
    <Button variant="contained" color="success" onClick={saveNewMasterModel}>
      Save
    </Button>
  </Modal.Footer>
</Modal>

      <div className="card" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f5f5f5", // light gray card background
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",

      }}>
        <Box sx={{ width: "100%", p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 2,
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

              <TextField
                size="small"
                placeholder="Search"
                sx={{
                  bgcolor: "grey.50",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "grey.300",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                onChange={handleSearch}
              />
            </Box>


            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                endIcon={<KeyboardArrowDown />}
                startIcon={<TableRows />}
                sx={{
                  bgcolor: "grey.50",
                  textTransform: "none",
                  color: "text.primary",
                }}
                onClick={(e) => setManageColumnsAnchor(e.currentTarget)}
              >
                Manage Columns
              </Button>

              <Menu
                anchorEl={manageColumnsAnchor}
                open={Boolean(manageColumnsAnchor)}
                onClose={() => setManageColumnsAnchor(null)}
                PaperProps={{
                  sx: { maxHeight: 300, width: 200 },
                }}
              >
                {columns.map((column) => (
                  <MenuItem key={column.id} dense>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={column.visible}
                          onChange={() => handleColumnVisibilityChange(column.id)}
                          size="small"
                        />
                      }
                      label={column.label}
                    />
                  </MenuItem>
                ))}
              </Menu>

              <Button
                variant="outlined"
                size="small"
                endIcon={<KeyboardArrowDown />}
                sx={{
                  bgcolor: "grey.50",
                  textTransform: "none",
                  color: "text.primary",
                }}
              >
                Default View
              </Button>

              <Button
                variant="outlined"
                size="small"
                endIcon={<KeyboardArrowDown />}
                startIcon={<FilterList />}
                sx={{
                  bgcolor: "grey.50",
                  textTransform: "none",
                  color: "text.primary",
                }}
                onClick={(e) => setFilterAnchor(e.currentTarget)}
              >
                Filter
              </Button>

              <Popover
                open={Boolean(filterAnchor)}
                anchorEl={filterAnchor}
                onClose={() => setFilterAnchor(null)}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                PaperProps={{
                  sx: { p: 2, width: 650 },
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Filters
                </Typography>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "8px" }}>
                  {columns.map((column) => (
                    <MenuItem key={column.id} dense style={{ flex: "1 1 200px" }}>
                      <TextField
                        placeholder={`Search ${column.label}`}
                        variant="outlined"
                        size="small"
                        value={searchTermsColumnWise[column.id]}
                        onChange={(e) => handleSearchColumnWise(column.id, e)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        fullWidth
                      />
                    </MenuItem>
                  ))}
                </div>

              </Popover>

            </Box>
          </Box>
          {loading ? (<Loader />) : (
            <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 280px)" }}>
              <Table stickyHeader size="small">
                {columns.some(col => col.visible) && (
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={
                            selected.length > 0 && selected.length < filteredData.length
                          }
                          checked={
                            filteredData.length > 0 &&
                            selected.length === filteredData.length
                          }
                          onChange={handleSelectAllClick}
                        />
                      </TableCell>
                      {columns
                        .filter((col) => col.visible)
                        .map((column) => (
                          <TableCell key={column.id}>
                            <TableSortLabel
                              active={orderBy === column.id}
                              direction={orderBy === column.id ? order : "asc"}
                              onClick={() => handleRequestSort(column.id)}
                            >
                              <span
                                style={{
                                  color: "rgb(33, 25, 34)",
                                  fontFamily:
                                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Helvetica, "ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", メイリオ, Meiryo, "ＭＳ Ｐゴシック", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                                  fontSize: "15px",
                                  fontWeight: "unset"
                                }}
                              >
                                {column.label}
                              </span>

                            </TableSortLabel>
                          </TableCell>
                        ))}
                    </TableRow>
                  </TableHead>
                )}

                <TableBody>
                  {sortedData.length === 0 ? (
                    <TableRow >
                      <TableCell colSpan={columns.filter(col => col.visible).length + 1} align="center">
                        <div style={{ textAlign: "center", padding: "1rem" }}>
                          <img
                            src="https://cdn.vectorstock.com/i/500p/12/22/no-data-concept-vector-47041222.jpg"
                            alt="No data"
                            style={{ maxWidth: "150px", marginBottom: "1rem" }}
                          />
                          <Typography variant="h6" color="textSecondary">
                            No data found
                          </Typography>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => {
                        const isItemSelected = isSelected(row.id);
                        return (
                          <TableRow
                            key={row.id}
                            hover
                            selected={isItemSelected}
                            onClick={(event) => handleClick(event, row.id)}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox checked={isItemSelected} />
                            </TableCell>
                            {columns.filter(col => col.visible).map((column) => (
                              <TableCell key={column.id}>
                                <span
                               style={{
                                color: "#212121", // Dark gray for good contrast
                                fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                fontSize: "13px", // Slightly smaller for dense table layout
                                fontWeight: 500, // Medium weight — cleaner than "lighter"
                                letterSpacing: "0.25px", // Slight spacing for readability
                                lineHeight: "1.5" // Helps with vertical readability
                              }}
                              
                              >
                                 {column.id === "Action" ? (
                                  <IconButton onClick={() => handleActionClick(row)}>
                                    <MoreVertIcon />
                                  </IconButton>
                                ) : column.id === "isActive" ? (
                                  <span style={{ color: row.isActive ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                                    {row.isActive ? "Yes" : "No"}
                                  </span>
                                ) : column.id.toLowerCase().includes('date') && row[column.id] ? ( // <-- Format dates
                                  new Date(row[column.id]).toLocaleString('en-GB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                ) : (
                                  row[column.id]
                                )}
                              </span>

                               
                              </TableCell>


                            ))}
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>


              </Table>
            </TableContainer>
          )}

          <Dialog open={isPopupOpen} onClose={handleClosePopup} fullWidth maxWidth="sm">
            <DialogTitle>Actions</DialogTitle>

            <DialogContent dividers>
              {selectedRow && (
                <>

                  <Typography >
                    Name- {String(selectedRow.name)}
                  </Typography>

                  {/* Your new buttons here */}
                  <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                  {selectedRow.isActive && (
                      <Button
                        variant="contained"
                        style={{ backgroundColor: "rgb(25 135 84)", color: "white" }}
                        onClick={() => editRowMaster(selectedRow)}
                      >
                        Edit Master Name
                      </Button>
                    )}
                    {selectedRow.isActive && (
                      <Button
                        variant="contained"
                        style={{ backgroundColor: "rgb(25 135 84)", color: "white" }}
                        onClick={() => editRow(selectedRow)}
                      >
                        Edit Master Form
                      </Button>
                    )}

                    <Button
                      variant="contained"
                      style={{ backgroundColor: "rgb(220 53 69)", color: "white" }}
                      onClick={() => handleStatusChange(selectedRow.id)}
                    >
                      {selectedRow.isActive ? "DEACTIVATE" : "ACTIVATE"}
                    </Button>
                  </Box>
                </>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClosePopup}>Close</Button>
            </DialogActions>
          </Dialog>

          <TablePagination
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </div>
    </>
  );
};

export default MaterialTableFormData;