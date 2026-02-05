import React from 'react';

export const TestPage: React.FC = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Test Demo Page</h1>
            <p>Đây là trang demo để kiểm tra luồng tạo menu và routing.</p>
            <div style={{ marginTop: '20px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
                <h3>Quy trình hoạt động:</h3>
                <ol>
                    <li><strong>Backend & DB:</strong> Tạo Menu "Test Demo" với Code = <code>test/demo</code></li>
                    <li><strong>Frontend Route:</strong> Đăng ký Route <code>path="/test/demo"</code> trỏ đến Component này</li>
                    <li><strong>Phân quyền:</strong> Gán quyền cho User truy cập menu này</li>
                    <li><strong>Kết quả:</strong> Menu hiển thị và click vào sẽ ra trang này</li>
                </ol>
            </div>
        </div>
    );
};
