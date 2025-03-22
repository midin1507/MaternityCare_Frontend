
import { useState } from 'react';
import { Rate, Button, Input } from 'antd';
import './Feedback.css';
import api from '../../config/api';
const { TextArea } = Input;
const userId = localStorage.getItem('userId');
const Feedback = () => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleRatingChange = (value) => {
        setRating(value);
    };

    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    const handleSubmit = async () => {
        try {
            if (!userId) {
                alert("Vui lòng đăng nhập để gửi phản hồi!");
                return;
            }
            const response = await api.post('/feedbacks', {
                userId,
                score: rating,
                content: comment,
            });
            console.log('Feedback submitted:', response.data);
            alert('Cảm ơn phản hồi của bạn!');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Có lỗi xảy ra khi gửi phản hồi. Vui lòng thử lại!');
        }
    };

    return (
        <div className="feedback-container">
            <h2>Bạn có hài lòng về dịch vụ của chúng tôi không?</h2>
            <Rate
                className="feedback-rating"
                value={rating}
                onChange={handleRatingChange}
                count={5}
            />
            <div className="feedback-labels">
                <span>Không hài lòng</span>
                <span>Rất hài lòng</span>
            </div>
            <h3>
                Chúng tôi luôn lắng nghe để mang đến trải nghiệm tuyệt vời nhất cho bạn!
            </h3>
            <TextArea
                rows={4}
                value={comment}
                onChange={handleCommentChange}
                placeholder="Nhập phản hồi của bạn..."
            />
            <Button type="primary" onClick={handleSubmit} className="feedback-submit">
                Gửi
            </Button>
        </div>
    );
};

export default Feedback;
