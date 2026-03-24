import { useEffect, useState } from "react";
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, Paper, Skeleton, Typography,
  TablePagination, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Button, TextField, Stack,
} from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useNavigate }    from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../app/hooks";
import { deleteCar, fetchCars }      from "../store/cars.slice";
import type { CarResponse } from "../services/cars.type";
import type { RootState } from "../../../store/store";
const ROWS_OPTIONS = [10, 25, 50];

export const ListCars = () => {
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();

  const cars        = useAppSelector((s: RootState) => s.cars?.cars);
  const totalItems  = useAppSelector((s: RootState) => s.cars.totalItems);
  const loadingCars = useAppSelector((s: RootState) => s.cars.loadingCars);

  // ── Pagination & search (server-side) ──────────────────────────────────────
  const [page, setPage]           = useState(0);          
  const [rowsPerPage, setRows]    = useState(10);
  const [searchText, setSearch]   = useState("");

  const load = (p = page, size = rowsPerPage, text = searchText) => {
    dispatch(fetchCars({ page: p + 1, pageSize: size, searchText: text || undefined }));
  };

  // Fetch lần đầu
  useEffect(() => { load(); }, []);

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
    load(0, rowsPerPage, e.target.value);
  };

  // ── Delete modal ───────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<CarResponse | null>(null);
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    dispatch(deleteCar(deleteTarget.id));
    setDeleteTarget(null);
  };

  // ── Edit modal ─────────────────────────────────────────────────────────────
  const [editTarget, setEditTarget] = useState<CarResponse | null>(null);
  const [editForm, setEditForm]     = useState({ licensePlates: "", note: "", mileageAllowance: "", fuelAmount: "" });

  const handleEditOpen = (car: CarResponse) => {
    setEditTarget(car);
    setEditForm({
      licensePlates:    car.licensePlates,
      note:             car.note            ?? "",
      mileageAllowance: car.mileageAllowance?.toString() ?? "",
      fuelAmount:       car.fuelAmount?.toString()       ?? "",
    });
  };

  const handleEditConfirm = () => {
    if (!editTarget) return;
    // TODO: dispatch(updateCar({ id: editTarget.id, ...editForm })).then(() => load())
    setEditTarget(null);
  };

  // ── Skeleton rows ──────────────────────────────────────────────────────────
  if (loadingCars && !cars?.length) {
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
              {["ID", "Biển số", "Ghi chú", "Định mức Km", "Lượng xăng", "Thao tác"].map((h) => (
                <TableCell key={h}><strong>{h}</strong></TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rowsPerPage }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j}><Skeleton variant="text" /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <>
      {/* Search */}
      <TextField
        size="small"
        placeholder="Tìm biển số, ghi chú..."
        value={searchText}
        onChange={handleSearch}
        sx={{ mb: 1.5, width: 300 }}
      />

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Biển số</strong></TableCell>
              <TableCell><strong>Ghi chú</strong></TableCell>
              <TableCell><strong>Định mức Km</strong></TableCell>
              <TableCell><strong>Lượng xăng</strong></TableCell>
              <TableCell align="center"><strong>Thao tác</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!cars?.length? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    Không có dữ liệu xe.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              cars.map((car) => (
                <TableRow key={car.id} hover>
                  <TableCell>{car.id}</TableCell>
                  <TableCell>{car.licensePlates}</TableCell>
                  <TableCell>{car.note || "—"}</TableCell>
                  <TableCell>{car.mileageAllowance ?? "—"}</TableCell>
                  <TableCell>{car.fuelAmount ?? "—"}</TableCell>
                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <Tooltip title="Chi tiết">
                      <IconButton size="small" onClick={() => navigate(`/cars/${car.id}`)}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sửa">
                      <IconButton size="small" color="primary" onClick={() => handleEditOpen(car)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(car)}>
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={totalItems}                        // tổng từ server
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

      {/* Modal Sửa */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>Sửa thông tin xe</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Biển số"
              value={editForm.licensePlates}
              onChange={(e) => setEditForm((f) => ({ ...f, licensePlates: e.target.value }))}
              fullWidth size="small"
            />
            <TextField
              label="Ghi chú"
              value={editForm.note}
              onChange={(e) => setEditForm((f) => ({ ...f, note: e.target.value }))}
              fullWidth size="small" multiline rows={2}
            />
            <TextField
              label="Định mức Km"
              value={editForm.mileageAllowance}
              onChange={(e) => setEditForm((f) => ({ ...f, mileageAllowance: e.target.value }))}
              fullWidth size="small" type="number"
            />
            <TextField
              label="Lượng xăng"
              value={editForm.fuelAmount}
              onChange={(e) => setEditForm((f) => ({ ...f, fuelAmount: e.target.value }))}
              fullWidth size="small" type="number"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditTarget(null)}>Hủy</Button>
          <Button variant="contained" onClick={handleEditConfirm}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};