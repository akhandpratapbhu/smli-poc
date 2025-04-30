import { useState, ChangeEvent, MouseEvent, useEffect } from "react";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';

import {
    Box,
    Paper,
    TextField,
    Button,
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
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    DialogActions,
} from "@mui/material";
import { Search, KeyboardArrowDown, FilterList, TableRows, FileDownload } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx"; // Excel library
import jsPDF from "jspdf"; // PDF library
import { generatePrintHTML } from "../printreport";
import axios from "axios";
import './getform.css';
import Loader from '../../shareable/loader';
interface SpareData {
    id: string;
    invoiceNo: string;
    invoiceDate: string;
    piNumber: string;
    customerType: string;
    customerOnInvoice: string;
    customerOutstanding: string;
    billOn: string;
    grossWeight: string;
    creditLimit: string;
    address: string;
    remarks: string;
    billedToCustomer: string;
    customerGSTNo: string;
    dealerGSTNo: string;
    shippedToCustomer: string;
    dispatchThrough: string;
    transportName: string;
    Action?: string; // optional if you really need it
}


interface Column {
    id: keyof SpareData;
    label: string;
    visible: boolean;
}


const SparePartSaleInvoiceTable: React.FC = () => {
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const location = useLocation();
    const model = location.state?.entityData; // Get the passed data
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [selected, setSelected] = useState<string[]>([]);
    const [columns, setColumns] = useState<Column[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [order, setOrder] = useState<"asc" | "desc">("asc");
    const [orderBy, setOrderBy] = useState<string>("");

    // Menu states
    const [manageColumnsAnchor, setManageColumnsAnchor] = useState<HTMLButtonElement | null>(null);
    const [filterAnchor, setFilterAnchor] = useState<HTMLButtonElement | null>(null);
    const [searchTermsColumnWise, setSearchTermsColumnWise] = useState<Record<keyof SpareData, string>>({
        id: "",
        invoiceNo: "",
        invoiceDate: "",
        piNumber: "",
        customerType: "",
        customerOnInvoice: "",
        customerOutstanding: "",
        billOn: "",
        grossWeight: "",
        creditLimit: "",
        address: "",
        remarks: "",
        billedToCustomer: "",
        customerGSTNo: "",
        dealerGSTNo: "",
        shippedToCustomer: "",
        dispatchThrough: "",
        transportName: "",
        Action: "", // include only if part of `SpareData`
    });



    const [GetAllSaleInvoices, setGetAllSaleInvoices] = useState<SpareData[]>([]);
    const [loading, setLoading] = useState<boolean>(true); //  loading state
    useEffect(() => {
        setLoading(true);

        fetch(`${baseUrl}/spare/GetListView?ScreenId=${model.id}`)
            .then((response) => response.json())
            .then((data: SpareData[]) => {
                setGetAllSaleInvoices(data);
                if (data.length > 0) {
                    const dynamicColumns: Column[] = Object.keys(data[0]).map((key) => ({
                        id: key as keyof SpareData,
                        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                        visible: true,
                    }));
                    dynamicColumns.push({
                        id: "Action",
                        label: "Action",
                        visible: true
                    });
                    setColumns(dynamicColumns);
                }
                setLoading(false);
            })
            .catch((error) =>{
                console.error("Error fetching entities:", error)
                setLoading(false);
            })  
    }, []);



    const handleSelectAllClick = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = GetAllSaleInvoices.map((n) => n.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

    // const filteredData = mockData.filter((item) =>
    //   Object.values(item).some((value) =>
    //     String(value).toLowerCase().includes(searchTerm)
    //   )
    // );

    const handleClick = (event: MouseEvent<HTMLTableRowElement>, id: string) => {
        console.log(event);

        const selectedIndex = selected.indexOf(id);
        let newSelected: string[] = [];

        if (selectedIndex === -1) {
            newSelected = [...selected, id];
        } else {
            newSelected = selected.filter((selectedId) => selectedId !== id);
        }

        setSelected(newSelected);
    };

    const handleColumnVisibilityChange = (columnId: keyof SpareData) => {
        setColumns(
            columns.map((col) =>
                col.id === columnId ? { ...col, visible: !col.visible } : col
            )
        );
    };

    const isSelected = (id: string) => selected.includes(id);

    const handleChangePage = (event: unknown, newPage: number) => {
        console.log("event", event);

        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchColumnWise = (id: keyof SpareData, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSearchTermsColumnWise((prev) => ({
            ...prev,
            [id]: e.target.value.toLowerCase(),
        }));
    };


    const filteredData = GetAllSaleInvoices.filter((item) => {
        // Global Search Logic
        const isGlobalMatch = Object.values(item).some((value) =>
            String(value).toLowerCase().includes(searchTerm)
        );

        // Column-Wise Search Logic
        const isColumnMatch = Object.entries(searchTermsColumnWise).every(([key, term]) => {
            if (!term) return true; // Skip filtering for empty search fields
            return String(item[key as keyof SpareData]).toLowerCase().includes(term);
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
            const key = orderBy as keyof SpareData;

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

    const [open, setOpen] = useState(false);

    // Function to export data as Excel
    const exportAsExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData); // Convert JSON to worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        XLSX.writeFile(workbook, "export.xlsx");
        setOpen(false); // Close dialog
    };

    // Function to export data as PDF
    const exportAsPDF = () => {
        const doc = new jsPDF();
        doc.text("Exported Data", 10, 10);

        let y = 20;
        filteredData.forEach((item, index) => {
            doc.text(`${index + 1}. ${JSON.stringify(item)}`, 10, y);
            y += 10;
        });

        doc.save("export.pdf");
        setOpen(false); // Close dialog
    };
    const [selectedRow, setSelectedRow] = useState<SpareData | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleActionClick = (row: SpareData) => {
        setSelectedRow(row);
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setSelectedRow(null);
    };

    const handleViewRoutePage = (selectedRow: any) => {
        navigate(`/viewDetails/${selectedRow.ID}`, { state: { entityData: selectedRow, model: model } });
    };
    const handleGetFormRoutePage = (selectedRow: any) => {
        navigate(`/employee/addFormData/${selectedRow.ID}`, { state: { entityData: model, selectedRow: selectedRow } });
    };
    const [dynamicPrintAllData, setDynamicPrintAllData] = useState<any>({});
    const handlePrintAllData = (selectedRow: any) => {
        axios
            .get(`${baseUrl}/spare/GetItemDetail?ScreenId=${model.id}&ItemId=${selectedRow.ID}`)
            .then((res) => {
                const data = res.data;
                setDynamicPrintAllData(data); // still update state if needed elsewhere

                const htmlContent = generatePrintHTML(data); // use fresh data directly
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                    printWindow.document.open();
                    printWindow.document.write(htmlContent);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                }
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    };

    const handleAction = (type: "view" | "edit" | "print" | "cancel") => {
        if (!selectedRow) return;

        switch (type) {
            case "view":
                handleViewRoutePage(selectedRow)
                break;

            case "edit":
                handleGetFormRoutePage(selectedRow)
                break;

            case "print":
                handlePrintAllData(selectedRow); // everything handled inside now
                break;


            case "cancel":
                break;

        }
    };
    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: '30px' }}>
                <span style={{ font: "40px", padding: '5px', margin: '10px' }}>{model.label}</span>
                <button
                    onClick={() => navigate(`/employee/addFormData/${model.id}`, { state: { entityData: model } })}
                    style={{ color: "white", backgroundColor: "#ea3434", borderRadius: '10px', width: "100px", height: "40px", padding: '5px' }}
                >
                    + Add New
                </button>
            </div>
            <div className="card" style={{
                display: "flex",

                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f5f5f5", // light gray card background
                padding: "6px",
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

                            {/* Export Button */}
                            <Button
                                variant="outlined"
                                size="small"
                                endIcon={<KeyboardArrowDown />}
                                startIcon={<FileDownload />}
                                sx={{ bgcolor: "grey.50", textTransform: "none", color: "text.primary" }}
                                onClick={() => setOpen(true)}
                            >
                                Export
                            </Button>

                            {/* Dialog Popup */}
                            <Dialog open={open} onClose={() => setOpen(false)}>
                                <DialogTitle className="MuiDialogTitle-root">Select Export Format</DialogTitle>
                                <DialogContent className="dialogContent">
                                    <List>
                                        <ListItem disablePadding className="MuiListItem-root">
                                            <ListItemButton onClick={exportAsPDF} className="MuiListItemButton-root">
                                                <ListItemText primary="Export as PDF" className="MuiListItemText-primary" />
                                            </ListItemButton>
                                        </ListItem>
                                        <ListItem disablePadding className="MuiListItem-root">
                                            <ListItemButton onClick={exportAsExcel} className="MuiListItemButton-root">
                                                <ListItemText primary="Export as Excel" className="MuiListItemText-primary" />
                                            </ListItemButton>
                                        </ListItem>
                                    </List>
                                </DialogContent>

                                <DialogActions>
                                    <Button onClick={() => setOpen(false)} color="primary">Cancel</Button>
                                </DialogActions>
                            </Dialog>
                        </Box>
                    </Box>
                    {loading ? (
                        <Loader /> // loader component
                    ) : (
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
                                                            {column.label}
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
                                                <div style={{ textAlign: "center", padding: "2rem" }}>
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
                                                                {column.id === "Action" ? (
                                                                    <IconButton onClick={() => handleActionClick(row)}>
                                                                        <MoreVertIcon />
                                                                    </IconButton>
                                                                ) : (
                                                                    row[column.id]
                                                                )}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                );
                                            })
                                    )}
                                </TableBody>


                            </Table>
                        </TableContainer>
                    )

                    }

                    <Dialog open={isPopupOpen} onClose={handleClosePopup} fullWidth maxWidth="sm">
                        <DialogTitle>Actions</DialogTitle>
                        <DialogContent dividers>
                            {selectedRow && (
                                <>
                                    {Object.entries(selectedRow).map(([key, value]) => (
                                        <Typography gutterBottom key={key}>
                                            <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {String(value)}
                                        </Typography>
                                    ))}

                                    <Box mt={2} display="flex" gap={2} flexWrap="wrap">
                                        <Button variant="contained" onClick={() => handleAction("view")}>View</Button>
                                        <Button variant="contained" color="primary" onClick={() => handleAction("edit")}>Edit</Button>
                                        <Button variant="contained" color="secondary" onClick={() => handleAction("print")}>Print</Button>
                                        <Button variant="outlined" color="error" onClick={() => handleAction("cancel")}>Cancel</Button>
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
    )
};

export default SparePartSaleInvoiceTable;
