import React from 'react';

export const SellPage: React.FC = () => {
    // URL của subdomain độc lập chứa Frontend Bán hàng
    const sellModuleUrl = 'https://sit.sell.nguyenbinh.info.vn';

    return (
        <div style={{ width: '100%', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            <iframe 
                src={sellModuleUrl} 
                title="Bán hàng (Independent Module)"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
            />
        </div>
    );
};
