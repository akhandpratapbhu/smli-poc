import  { useEffect, useState } from 'react';
import { useLocation, useNavigate} from 'react-router-dom';
import { Typography, Card, CardContent, Grid, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import axios from 'axios';

const ViewDetails = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const location = useLocation();
    const selectedRow = location.state?.entityData; // Get the passed data
    const model = location.state?.model;
    const [attributes, setAttributes] = useState<any[]>([]);
    const [dynamicData, setDynamicData] = useState<any>({});
    const [gridsData, setGridsData] = useState<any[]>([]);

    useEffect(() => {
        axios
            .get(`${baseUrl}/spare/GetItemDetail?ScreenId=${model.id}&ItemId=${selectedRow.ID}`)
            .then((res) => {
                setAttributes(res.data.attributes || []);
                setDynamicData(res.data.dynamicItemDetail?.[0] || {});
                setGridsData(res.data.gridsData || []);
            });
    }, [selectedRow.ID]);

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
        <Card sx={{ margin: 4 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Item Details
                </Typography>

                <Grid container spacing={2}>
                    {attributes
                        .filter(attr => attr.dataType !== 'grid')
                        .map((attr) => (
                            <Grid key={attr.id}>
                                <Typography variant="subtitle2">{attr.label}</Typography>
                                <Typography variant="body1">
                                    {dynamicData[attr.name] ?? 'N/A'}
                                </Typography>
                            </Grid>
                        ))}
                </Grid>

                {gridsData.map((grid) => (
                    <div key={grid.attributeId} style={{ marginTop: '2rem' }}>
                        <Typography variant="h6" gutterBottom>{grid.name}</Typography>

                        {grid.gridItems && grid.gridItems.length > 0 ? (
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {Object.keys(grid.gridItems[0])
                                            .filter(key => key !== 'ID' && key !== 'ScreenRecordId') // optional filter
                                            .map((key) => (
                                                <TableCell key={key}>
                                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                                </TableCell>
                                            ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {grid.gridItems.map((item: any, index: number) => (
                                        <TableRow key={index}>
                                            {Object.entries(item)
                                                .filter(([key]) => key !== 'ID' && key !== 'ScreenRecordId') // same filter
                                                .map(([_, val], i) => (
                                                    <TableCell key={i}>{String(val)}</TableCell>
                                                ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <Typography variant="body2" color="text.secondary">No grid items available.</Typography>
                        )}
                    </div>
                ))}

            </CardContent>
        </Card>
        </>
    );
};

export default ViewDetails;
