import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Facebook, Settings, PenTool, BarChart2, Activity, Save, Send, Calendar, DollarSign, TrendingUp, LogIn, RefreshCw, Check, AlertCircle } from 'lucide-react';
import styles from './FacebookPage.module.scss';
import { facebookService } from '../../services/facebook.service';
import type { FacebookPage as IFacebookPage, FacebookAppConfig } from '../../types';

export const FacebookPage = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'connect' | 'post' | 'automation' | 'ads'>('overview');
    const [pages, setPages] = useState<IFacebookPage[]>([]);
    const [config, setConfig] = useState<FacebookAppConfig | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'connected' | 'error'>('checking');

    // Post Form
    const [postForm, setPostForm] = useState({
        selectedPage: '',
        content: '',
        aiPrompt: '',
        scheduledTime: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        loadData();
        // Check for OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            handleOAuthCallback(code);
        }
    }, []);

    const loadData = async () => {
        try {
            setConnectionStatus('checking');
            const [pagesData, configData] = await Promise.all([
                facebookService.getPages(),
                facebookService.getAppConfig()
            ]);
            setPages(pagesData);
            setConfig(configData);
            setConnectionStatus(pagesData.length > 0 ? 'connected' : 'idle');
        } catch (error) {
            console.error("Failed to load data", error);
            setConnectionStatus('error');
        }
    };

    const handleUpdateConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!config) return;
            await facebookService.updateAppConfig({ appId: config.appId, appSecret: config.appSecret });
            toast.success('Đã lưu cấu hình Facebook App');
        } catch (error) {
            toast.error('Lỗi khi lưu cấu hình');
        }
    };

    const handleConnectFacebook = async () => {
        if (!config?.appId) {
            toast.error('Vui lòng nhập App ID trước');
            return;
        }

        setIsConnecting(true);
        try {
            const redirectUri = `${window.location.origin}/dakenh/facebook`;
            const { url } = await facebookService.getOAuthUrl(redirectUri);
            window.location.href = url;
        } catch (error) {
            toast.error('Không thể kết nối Facebook');
            setIsConnecting(false);
        }
    };

    const handleOAuthCallback = async (code: string) => {
        try {
            const redirectUri = `${window.location.origin}/dakenh/facebook`;
            const result = await facebookService.handleOAuthCallback(code, redirectUri);

            toast.success(`Đã kết nối thành công ${result.pagesConnected} fanpage!`);

            // Clear URL params
            window.history.replaceState({}, document.title, '/dakenh/facebook');

            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Lỗi kết nối Facebook');
            window.history.replaceState({}, document.title, '/dakenh/facebook');
        }
    };

    const handleCreatePost = async (isScheduled = false) => {
        if (!postForm.selectedPage) {
            toast.error('Vui lòng chọn Fanpage');
            return;
        }
        if (!postForm.content) {
            toast.error('Vui lòng nhập nội dung bài viết');
            return;
        }

        setIsPosting(true);
        try {
            // Use direct publish API
            await facebookService.publishPost(parseInt(postForm.selectedPage), postForm.content);
            toast.success('Đã đăng bài thành công lên Fanpage!');
            setPostForm({ ...postForm, content: '', aiPrompt: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Lỗi khi đăng bài');
        } finally {
            setIsPosting(false);
        }
    };

    const handleGenerateAI = async () => {
        if (!postForm.aiPrompt) {
            toast.error('Vui lòng nhập ý tưởng cho AI');
            return;
        }
        setIsGenerating(true);
        try {
            // Simulate AI generation - in production, call actual API
            setTimeout(() => {
                const generatedContent = `🔥 ${postForm.aiPrompt}

✨ Chúng tôi rất vui được chia sẻ tin này với các bạn! Đây là cơ hội tuyệt vời mà bạn không nên bỏ lỡ.

👉 Hãy like, share và comment để nhận nhiều ưu đãi hơn!

#Sale #CuoiTuan #KhuyenMai #HotDeal`;
                setPostForm(prev => ({ ...prev, content: generatedContent }));
                setIsGenerating(false);
                toast.success('AI đã tạo nội dung!');
            }, 1500);
        } catch (error) {
            setIsGenerating(false);
            toast.error('Lỗi khi tạo nội dung AI');
        }
    };

    return (
        <div className={styles.container}>
            <h1><Facebook size={28} style={{ marginRight: 12, verticalAlign: 'middle', color: '#1877F2' }} /> Quản lý Facebook</h1>

            <div className={styles.tabs}>
                <div className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`} onClick={() => setActiveTab('overview')}>
                    <Activity size={16} /> Tổng quan
                </div>
                <div className={`${styles.tab} ${activeTab === 'connect' ? styles.active : ''}`} onClick={() => setActiveTab('connect')}>
                    <Settings size={16} /> Kết nối
                </div>
                <div className={`${styles.tab} ${activeTab === 'post' ? styles.active : ''}`} onClick={() => setActiveTab('post')}>
                    <PenTool size={16} /> Đăng bài
                </div>
                <div className={`${styles.tab} ${activeTab === 'automation' ? styles.active : ''}`} onClick={() => setActiveTab('automation')}>
                    <BarChart2 size={16} /> Tự động hóa
                </div>
                <div className={`${styles.tab} ${activeTab === 'ads' ? styles.active : ''}`} onClick={() => setActiveTab('ads')}>
                    <DollarSign size={16} /> Quảng cáo
                </div>
            </div>

            <div className={styles.content}>
                {activeTab === 'overview' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2>Fanpages đã kết nối</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {connectionStatus === 'connected' && (
                                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Check size={16} /> Đã kết nối Facebook
                                    </span>
                                )}
                                <button className={`${styles.btn} ${styles.secondary}`} onClick={loadData}>
                                    <RefreshCw size={16} /> Làm mới
                                </button>
                            </div>
                        </div>

                        <div className={styles.pageList}>
                            {pages.map(page => (
                                <div key={page.id} className={styles.pageItem}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                            <Facebook size={24} />
                                        </div>
                                        <div>
                                            <div className={styles.info} style={{ fontWeight: 600 }}>{page.name}</div>
                                            <div style={{ fontSize: '0.85em', color: '#888' }}>ID: {page.pageId}</div>
                                        </div>
                                    </div>
                                    <div className={styles.status}>
                                        <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>Hoạt động</span>
                                    </div>
                                </div>
                            ))}
                            {pages.length === 0 && (
                                <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
                                    <AlertCircle size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                                    <p>Chưa có Fanpage nào được kết nối.</p>
                                    <button
                                        className={`${styles.btn} ${styles.primary}`}
                                        onClick={() => setActiveTab('connect')}
                                        style={{ marginTop: 16 }}
                                    >
                                        Kết nối ngay
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'connect' && (
                    <div>
                        <div style={{ maxWidth: 600, margin: '0 auto' }}>
                            {/* Step 1: App Config */}
                            <div className={styles.card} style={{ marginBottom: 24 }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ background: '#1877F2', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>1</span>
                                    Cấu hình Facebook App
                                </h3>
                                <p style={{ color: '#666', marginBottom: 16 }}>
                                    Nhập thông tin từ <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer">Facebook Developer Console</a>
                                </p>
                                <form onSubmit={handleUpdateConfig}>
                                    <div className={styles.formGroup}>
                                        <label>App ID</label>
                                        <input
                                            value={config?.appId || ''}
                                            onChange={e => setConfig(prev => prev ? { ...prev, appId: e.target.value } : { id: 0, appId: e.target.value, appSecret: '', isActive: true })}
                                            placeholder="Nhập App ID"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>App Secret</label>
                                        <input
                                            type="password"
                                            value={config?.appSecret || ''}
                                            onChange={e => setConfig(prev => prev ? { ...prev, appSecret: e.target.value } : { id: 0, appId: '', appSecret: e.target.value, isActive: true })}
                                            placeholder="Nhập App Secret"
                                        />
                                    </div>
                                    <button type="submit" className={`${styles.btn} ${styles.secondary}`}>
                                        <Save size={16} /> Lưu cấu hình
                                    </button>
                                </form>
                            </div>

                            {/* Step 2: Connect with Facebook */}
                            <div className={styles.card}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ background: '#1877F2', color: 'white', width: 28, height: 28, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>2</span>
                                    Đăng nhập & Kết nối Fanpage
                                </h3>
                                <p style={{ color: '#666', marginBottom: 16 }}>
                                    Click nút bên dưới để đăng nhập Facebook và chọn các Fanpage muốn quản lý
                                </p>
                                <button
                                    className={`${styles.btn} ${styles.primary}`}
                                    onClick={handleConnectFacebook}
                                    disabled={isConnecting || !config?.appId}
                                    style={{ background: '#1877F2', width: '100%', padding: '14px 20px', fontSize: 16 }}
                                >
                                    {isConnecting ? (
                                        <><RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Đang kết nối...</>
                                    ) : (
                                        <><LogIn size={18} /> Đăng nhập với Facebook</>
                                    )}
                                </button>

                                {!config?.appId && (
                                    <p style={{ color: '#f59e0b', marginTop: 12, fontSize: 13 }}>
                                        ⚠️ Vui lòng nhập App ID và App Secret trước khi kết nối
                                    </p>
                                )}
                            </div>

                            {/* Connected Pages */}
                            {pages.length > 0 && (
                                <div className={styles.card} style={{ marginTop: 24 }}>
                                    <h3 style={{ color: '#10b981' }}>
                                        <Check size={20} /> Đã kết nối {pages.length} Fanpage
                                    </h3>
                                    {pages.map(p => (
                                        <div key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{p.name}</span>
                                            <span style={{ color: '#10b981' }}>✓ Đã kết nối</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'post' && (
                    <div className={styles.postCreator}>
                        <h3><PenTool size={20} style={{ marginRight: 8 }} /> Tạo bài viết mới</h3>

                        <div className={styles.formGroup}>
                            <label>Chọn Fanpage</label>
                            <select
                                value={postForm.selectedPage}
                                onChange={e => setPostForm({ ...postForm, selectedPage: e.target.value })}
                            >
                                <option value="">-- Chọn Fanpage --</option>
                                {pages.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            {pages.length === 0 && (
                                <p style={{ color: '#f59e0b', fontSize: 13, marginTop: 8 }}>
                                    Chưa có Fanpage nào. <span style={{ color: '#1877F2', cursor: 'pointer' }} onClick={() => setActiveTab('connect')}>Kết nối ngay</span>
                                </p>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label>🤖 AI viết bài (tùy chọn)</label>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <input
                                    placeholder="VD: Viết bài sale cuối tuần giảm 50%..."
                                    value={postForm.aiPrompt}
                                    onChange={e => setPostForm({ ...postForm, aiPrompt: e.target.value })}
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    className={`${styles.btn} ${styles.secondary}`}
                                    onClick={handleGenerateAI}
                                    disabled={isGenerating}
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    {isGenerating ? 'Đang tạo...' : '✨ Tạo nội dung AI'}
                                </button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Nội dung bài viết</label>
                            <textarea
                                rows={8}
                                placeholder="Bạn đang nghĩ gì?"
                                value={postForm.content}
                                onChange={e => setPostForm({ ...postForm, content: e.target.value })}
                                style={{ fontSize: 15, lineHeight: 1.6 }}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>📅 Hẹn giờ đăng (tùy chọn)</label>
                            <input
                                type="datetime-local"
                                value={postForm.scheduledTime}
                                onChange={e => setPostForm({ ...postForm, scheduledTime: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                            <button
                                className={`${styles.btn} ${styles.primary}`}
                                onClick={() => handleCreatePost(false)}
                                disabled={isPosting || !postForm.selectedPage || !postForm.content}
                                style={{ flex: 1 }}
                            >
                                {isPosting ? <><RefreshCw size={16} /> Đang đăng...</> : <><Send size={16} /> Đăng ngay</>}
                            </button>
                            <button
                                className={`${styles.btn} ${styles.secondary}`}
                                onClick={() => handleCreatePost(true)}
                                disabled={!postForm.scheduledTime}
                            >
                                <Calendar size={16} /> Hẹn giờ
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'automation' && (
                    <div>
                        <h3>🔄 Tự động hóa (kiểu n8n)</h3>
                        <p style={{ color: '#666', marginBottom: 24 }}>Visual workflow builder đang được phát triển. Các workflow đang hoạt động:</p>
                        <div className={styles.workflowList}>
                            <div className={styles.workflowItem}>
                                <span><strong>Chào buổi sáng</strong> (Time Trigger - 8:00 AM)</span>
                                <span style={{ color: 'green' }}>Đang chạy</span>
                            </div>
                            <div className={styles.workflowItem}>
                                <span><strong>Tự động trả lời comment</strong> (Event Trigger)</span>
                                <span style={{ color: 'orange' }}>Tạm dừng</span>
                            </div>
                            <div className={styles.workflowItem}>
                                <span><strong>Đăng bài hàng ngày từ RSS</strong> (Time Trigger - 12:00 PM)</span>
                                <span style={{ color: 'green' }}>Đang chạy</span>
                            </div>
                        </div>
                        <br />
                        <button className={`${styles.btn} ${styles.primary}`}>+ Tạo Workflow mới</button>
                    </div>
                )}

                {activeTab === 'ads' && (
                    <div>
                        <h3><TrendingUp size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Facebook Ads Analytics</h3>
                        <p style={{ color: '#666', marginBottom: 24 }}>Xem dữ liệu quảng cáo: Campaign, Adset, Ads, Chi phí, Reach, Impression, CTR</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                            <div className={styles.card} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 32, fontWeight: 'bold', color: 'var(--primary-color)' }}>12.5K</div>
                                <div style={{ color: '#888' }}>Reach</div>
                            </div>
                            <div className={styles.card} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#10b981' }}>45.2K</div>
                                <div style={{ color: '#888' }}>Impressions</div>
                            </div>
                            <div className={styles.card} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#f59e0b' }}>3.2%</div>
                                <div style={{ color: '#888' }}>CTR</div>
                            </div>
                            <div className={styles.card} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#ef4444' }}>$1,250</div>
                                <div style={{ color: '#888' }}>Spent</div>
                            </div>
                        </div>

                        <h4>Campaigns đang chạy</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5' }}>
                                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Campaign</th>
                                    <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #eee' }}>Trạng thái</th>
                                    <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #eee' }}>Ngân sách</th>
                                    <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #eee' }}>Đã chi</th>
                                    <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #eee' }}>Reach</th>
                                    <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #eee' }}>CTR</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>Summer Sale 2026</td>
                                    <td style={{ padding: 12, borderBottom: '1px solid #eee' }}><span style={{ color: 'green' }}>Đang chạy</span></td>
                                    <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #eee' }}>$500</td>
                                    <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #eee' }}>$320</td>
                                    <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #eee' }}>5,200</td>
                                    <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #eee' }}>4.1%</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: 12, borderBottom: '1px solid #eee' }}>Ra mắt sản phẩm mới</td>
                                    <td style={{ padding: 12, borderBottom: '1px solid #eee' }}><span style={{ color: 'green' }}>Đang chạy</span></td>
                                    <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #eee' }}>$1,000</td>
                                    <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #eee' }}>$780</td>
                                    <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #eee' }}>7,300</td>
                                    <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #eee' }}>2.8%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
