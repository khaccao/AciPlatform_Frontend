import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertCircle, User, LogIn, LogOut } from 'lucide-react';
import { hrService } from '../../services/hr.service';
import { toast } from 'sonner';
import styles from './FaceAttendancePage.module.scss';
import { useAppSelector } from '../../../../app/hooks';
import type { RootState } from '../../../../store/store';

const FaceAttendancePage = () => {
    const { user } = useAppSelector((state: RootState) => state.auth);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastRecord, setLastRecord] = useState<any>(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480, facingMode: 'user' } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
                setIsCameraReady(true);
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            toast.error("Không thể truy cập Camera. Vui lòng cấp quyền.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const captureAndProcess = async () => {
        if (!videoRef.current || !canvasRef.current || !user || isProcessing) return;

        setIsProcessing(true);
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64Image = canvas.toDataURL('image/jpeg', 0.82);

            try {
                const res = await hrService.timekeeping.processFaceAttendance({
                    userId: user.id,
                    capturedImage: base64Image,
                    note: "Chấm công qua Web Camera"
                });

                if (res.data) {
                    setLastRecord(res.data);
                    toast.success(res.data.checkOut ? "Check-out thành công!" : "Check-in thành công!");
                }
            } catch (err: any) {
                toast.error(err.response?.data?.message || "Lỗi xử lý chấm công");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Chấm công Khuôn mặt</h1>
                <p>Hệ thống nhận diện AI giúp ghi nhận giờ công tự động</p>
            </div>

            <div className={styles.mainLayout}>
                <div className={styles.cameraSection}>
                    <div className={styles.cameraWrapper}>
                        <video ref={videoRef} autoPlay playsInline muted className={styles.video} />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                        
                        <div className={styles.scannerOverlay}>
                            <div className={styles.scanLine} />
                            <div className={styles.cornerTopLeft} />
                            <div className={styles.cornerTopRight} />
                            <div className={styles.cornerBottomLeft} />
                            <div className={styles.cornerBottomRight} />
                        </div>

                        {!isCameraReady && (
                            <div className={styles.cameraLoading}>
                                <RefreshCw className={styles.spinner} />
                                <span>Đang khởi động Camera...</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.controls}>
                        <button 
                            className={styles.captureBtn} 
                            onClick={captureAndProcess}
                            disabled={!isCameraReady || isProcessing}
                        >
                            {isProcessing ? (
                                <><RefreshCw className={styles.spinner} /> Đang nhận diện...</>
                            ) : (
                                <><Camera /> Xác nhận khuôn mặt</>
                            )}
                        </button>
                    </div>
                </div>

                <div className={styles.infoSection}>
                    <div className={styles.userCard}>
                        <div className={styles.avatar}>
                            {user?.avatar ? <img src={user.avatar} alt="Avatar" /> : <User size={40} />}
                        </div>
                        <div className={styles.userDetails}>
                            <h3>{user?.fullName || 'Nhân viên'}</h3>
                            <p>{user?.username}</p>
                            <span className={styles.roleBadge}>Nhân viên</span>
                        </div>
                    </div>

                    <div className={styles.historyCard}>
                        <h4>Ghi nhận gần nhất</h4>
                        {lastRecord ? (
                            <div className={styles.recordItem}>
                                <div className={styles.recordIcon}>
                                    {lastRecord.checkOut ? <LogOut color="#f59e0b" /> : <LogIn color="#10b981" />}
                                </div>
                                <div className={styles.recordInfo}>
                                    <span className={styles.recordType}>
                                        {lastRecord.checkOut ? 'Check-out' : 'Check-in'}
                                    </span>
                                    <span className={styles.recordTime}>
                                        {new Date(lastRecord.checkOut || lastRecord.checkIn).toLocaleTimeString()}
                                    </span>
                                </div>
                                <CheckCircle2 className={styles.successIcon} />
                            </div>
                        ) : (
                            <div className={styles.noRecord}>
                                <AlertCircle size={20} />
                                <span>Chưa có ghi nhận trong phiên này</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.guideCard}>
                        <h4>Hướng dẫn</h4>
                        <ul>
                            <li>Đảm bảo đủ ánh sáng khuôn mặt</li>
                            <li>Đứng thẳng so với Camera</li>
                            <li>Không đeo kính râm hoặc khẩu trang</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaceAttendancePage;
