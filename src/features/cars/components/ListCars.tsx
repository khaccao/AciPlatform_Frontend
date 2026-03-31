import { useEffect, useState } from "react";
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper, Skeleton, Typography,
  TablePagination,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Button, Box,
} from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import { deleteCar, fetchCars } from "../store/cars.slice";
import type { CarResponse } from "../services/cars.type";
import type { RootState } from "../../../store/store";

const ROWS_OPTIONS = [10, 25, 50];
const COLUMNS = ["Biển số", "Định mức Km", "Lượng xăng", "Ghi chú", "Thao tác"];

const HeaderRow = () => (
  <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
    {COLUMNS.map((h) => (
      <TableCell key={h} align="center"><strong>{h}</strong></TableCell>
    ))}
  </TableRow>
);

type ListCarsProps = {
  searchText? : string;
};

export const ListCars = ({  searchText }: ListCarsProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const cars        = useAppSelector((s: RootState) => s.cars?.cars);
  const totalItems  = useAppSelector((s: RootState) => s.cars.totalItems);
  const loadingCars = useAppSelector((s: RootState) => s.cars.loadingCars);

  const [page, setPage]         = useState(0);
  const [rowsPerPage, setRows]  = useState(10);

  const load = (p = page, size = rowsPerPage, text = searchText) => {
    dispatch(fetchCars({ page: p + 1, pageSize: size, searchText: text || undefined }));
  };

  useEffect(() => {
    load(0, rowsPerPage, searchText);
  }, [searchText, rowsPerPage, dispatch]);

  useEffect(() => {
  console.log("Cars updated:", cars);
}, [cars]);

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
    load(newPage);
  };

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10);
    setRows(size);
    setPage(0);
    load(0, size);
  };

  // ── Delete modal ──────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<CarResponse | null>(null);
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    dispatch(deleteCar(deleteTarget.id));
    setDeleteTarget(null);
  };

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loadingCars && !cars?.length) {
    return (
      <Box sx={{ p: 3 }}>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead><HeaderRow /></TableHead>
            <TableBody>
              {Array.from({ length: rowsPerPage }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: COLUMNS.length }).map((_, j) => (
                    <TableCell key={j}><Skeleton variant="text" /></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>

      <TableContainer component={Paper} variant="outlined">
        <Table size="medium">
          <TableHead><HeaderRow /></TableHead>
          <TableBody>
            {!cars?.length ? (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    Không có dữ liệu xe.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              cars.map((car) => (
                <TableRow key={car.id} hover>
                  <TableCell align="center">{car.licensePlates}</TableCell>
                  <TableCell align="center">{car.mileageAllowance ?? "—"}</TableCell>
                  <TableCell align="center">{car.fuelAmount ?? "—"}</TableCell>
                  <TableCell align="center">{car.note || "—"}</TableCell>
                  <TableCell align="center" sx={{ whiteSpace: "nowrap", display: "flex", flexDirection: "row", justifyContent: "center",alignContent:"center", gap: "5px"}}>
                      <Button size="small" variant="contained" onClick={() => navigate(`/cars/${car.id}`)} sx = {{display: "flex", flexDirection: "row", justifyContent: "flex-start", gap: "10px", alignContent: "center"}}>
                        <InfoOutlinedIcon fontSize="small" />
                        Chi tiết
                      </Button>
                      <Button size="small" color="error" variant="contained" onClick={() => setDeleteTarget(car)} sx={{display: "flex", flexDirection: "row", justifyContent: "flex-start", gap: "5px", alignContent: "center"}}>
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                        Xóa
                      </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={ROWS_OPTIONS}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsChange}
          labelRowsPerPage="Số dòng:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
        />
      </TableContainer>

      {/* Modal Xóa */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Xác nhận xóa xe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc muốn xóa xe <strong>{deleteTarget?.licensePlates}</strong>?
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>Xóa</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};