import {useEffect, useState } from 'react';
import api from '../../../config/api';
import { Table } from 'antd';

export default function ManageFeedbackPage() {
    const [feedbacks, setFeedbacks] = useState([]);

    // Fetch danh sách feedback từ API
    const fetchData = async () => {
        try {
            const response = await api.get("feedbacks");
            console.log(response.data);
            setFeedbacks(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = [
        {
            title: 'Người dùng',
            dataIndex: 'userId',
            key: 'userId',
        },
        {
            title: 'Điểm đánh giá',
            dataIndex: 'score',
            key: 'score',
            render: (text) => `${text}/5`,
        },
        {
            title: 'Nội dung',
            dataIndex: 'content',
            key: 'content',
        },
    ];

    return (
        <div>
            <h2>Danh sách phản hồi</h2>
            <Table
                columns={columns}
                dataSource={feedbacks}
                rowKey="id"
                pagination={{ pageSize: 5 }} 
            />
        </div>
    );
}