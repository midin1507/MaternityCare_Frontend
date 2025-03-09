import React, { useState } from 'react';
import { Card, Button, Typography, message } from 'antd';
import api from '../../config/api'; 
import { useNavigate } from 'react-router-dom'; 

const { Title, Text } = Typography;

const PaymentPage = ({ pkg }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Gọi API thanh toán
      const response = await api.post('payments', {
        packageId: pkg.id,
        amount: pkg.price,
      });

      // Xử lý kết quả thanh toán
      if (response.data.success) {
        message.success('Thanh toán thành công!');
        navigate('/payment-success'); // Sử dụng navigate thay vì history.push
      } else {
        message.error('Thanh toán thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      message.error('Có lỗi xảy ra khi thanh toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <Title level={2}>Thanh Toán</Title>
      <Card className="payment-card" bordered={true}>
        <Title level={4}>Thông Tin Thanh Toán</Title>
        <div className="payment-section">
          <p><Text strong>Gói:</Text> {pkg.type}</p>
          <p><Text strong>Giá:</Text> {pkg.price}</p>
          <p><Text strong>Thời hạn:</Text> {pkg.duration}</p>
        </div>
        <Button type="primary" loading={loading} onClick={handlePayment} block>
          Thanh Toán Ngay
        </Button>
      </Card>
    </div>
  );
};

export default PaymentPage;