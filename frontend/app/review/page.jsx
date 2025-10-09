"use client";

import { useState } from 'react';

export default function ReviewPage() {
    // --- State Management ---
    const [currentRating, setCurrentRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Event Handlers ---
    const handleStarClick = (value) => {
        setCurrentRating(currentRating === value ? 0 : value);
    };

    const handleStarMouseOver = (value) => {
        if (currentRating === 0) {
            setHoverRating(value);
        }
    };

    const handleStarMouseOut = () => {
        if (currentRating === 0) {
            setHoverRating(0);
        }
    };

    const handleFormSubmit = (event) => {
        event.preventDefault(); 
        setIsModalOpen(true);   
    };

    const closeModal = () => {
        setIsModalOpen(false); 
    };

    return (
        <>
            <div className="review-card">
                <img src="/aaaaaaaaa.jpg" alt="Co-working space banner" className="banner-image" />
                <div className="content-wrapper">
                    <h2>Share You Experience</h2>
                    <p>Thank you for using our service! Please rate and review your experience with the location you booked.</p>
                    <div className="location-section">
                        <img src="/it-pm.jpg" alt="The Meal Co-Op meeting room" className="location-image" />
                        <div className="location-details">
                            <h3>The Meal Co-Op</h3>
                            <p><i className="fa-solid fa-location-dot"></i> Samyan Mitrtown, 2nd Floor</p>
                            <p><i className="fa-regular fa-calendar"></i> Date : 13 October 2023</p>
                            <div className="details-group">
                                <p className="time-info"><i className="fa-regular fa-clock"></i> 08:00-20:00</p>
                                <p><i className="fa-solid fa-wifi"></i> WiFi support</p>
                            </div>
                        </div>
                    </div>
                    <h2 className="rating-title">Rating</h2>
                    <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((starValue) => {
                            const ratingToShow = currentRating === 0 ? hoverRating : currentRating;
                            const isFilled = starValue <= ratingToShow;
                            const isPreview = currentRating === 0 && hoverRating > 0;

                            return (
                                <span
                                    key={starValue}
                                    className={`star ${isFilled ? 'filled' : ''}`}
                                    onClick={() => handleStarClick(starValue)}
                                    onMouseOver={() => handleStarMouseOver(starValue)}
                                    onMouseOut={handleStarMouseOut}
                                >
                                    {isFilled && !isPreview ? '★' : '☆'}
                                </span>
                            );
                        })}
                    </div>
                    <form className="review-form" onSubmit={handleFormSubmit}>
                        <input type="text" placeholder="Enter your review title" />
                        <textarea placeholder="Tell us your experience"></textarea>
                        <div className="form-actions">
                            <button type="button" className="cancel-btn">Cancel</button>
                            <button type="submit" className="submit-btn">Submit Review</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* --- Success Modal --- */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="modal-close-btn" onClick={closeModal}>&times;</span>
                        <div className="modal-icon">☺</div>
                        <h3>Thank you for review and comment !</h3>
                        <button className="modal-button" onClick={closeModal}>Go to Home</button>
                    </div>
                </div>
            )}

            {/* --- STYLES --- */}
            <style jsx>{`
                .review-card {
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    max-width: 700px;
                    width: 100%;
                    overflow: hidden;
                }
                .banner-image {
                    width: 100%;
                    height: auto;
                    display: block;
                }
                .content-wrapper {
                    padding: 24px;
                }
                h2 {
                    font-size: 28px;
                    margin-top: 0;
                    color: #1c1c1e;
                }
                p {
                    color: #6c757d;
                    line-height: 1.6;
                }
                .location-section {
                    margin-top: 24px;
                    margin-bottom: 24px;
                }
                .location-image {
                    width: 100%;
                    max-width: 250px;
                    height: auto;
                    object-fit: cover;
                    border-radius: 8px;
                }
                .location-details {
                    text-align: left;
                    margin-top: 16px;
                    color: #34495e;
                }
                .location-details p {
                    margin: 12px 0;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                }
                .location-details :global(i) { /* ใช้ :global() เพื่อเข้าถึงแท็ก i */
                    width: 24px;
                    text-align: center;
                    margin-right: 12px;
                    font-size: 18px;
                    color: #566573;
                }
                .details-group {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .time-info {
                    padding-right: 15px;
                    border-right: 1px solid #bdc3c7;
                }
                .rating-title {
                    font-size: 24px;
                    margin-bottom: 12px;
                }
                .rating-stars .star {
                    font-size: 2.5rem;
                    color: #e0e0e0;
                    cursor: pointer;
                    transition: color 0.2s ease-in-out;
                }
                .rating-stars .star.filled {
                    color: #ffc107;
                }
                .review-form input,
                .review-form textarea {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ced4da;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    font-size: 16px;
                    box-sizing: border-box;
                    font-family: inherit;
                }
                .review-form textarea {
                    height: 120px;
                    resize: vertical;
                }
                .form-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 16px;
                    margin-top: 8px;
                }
                .cancel-btn {
                    background: none;
                    border: none;
                    color: #6c757d;
                    font-size: 16px;
                    cursor: pointer;
                    font-weight: 500;
                    text-decoration: underline;
                }
                .submit-btn {
                    background-color: #9b59b6;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                    font-weight: 500;
                }
                .submit-btn:hover {
                    background-color: #8e44ad;
                }
                .modal-overlay {
                    display: flex; /* Changed from none */
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.4);
                    justify-content: center;
                    align-items: center;
                }
                .modal-content {
                    background-color: #fefefe;
                    padding: 30px;
                    border-radius: 16px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    position: relative;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }
                .modal-close-btn {
                    color: #27ae60;
                    position: absolute;
                    top: 10px;
                    right: 20px;
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                }
                .modal-icon {
                    color: #27ae60;
                    font-size: 80px;
                    line-height: 1;
                    margin-bottom: 20px;
                }
                .modal-content h3 {
                    font-size: 20px;
                    margin-top: 0;
                    margin-bottom: 25px;
                    color: #333;
                }
                .modal-button {
                    background-color: #27ae60;
                    color: white;
                    padding: 14px 20px;
                    border: none;
                    cursor: pointer;
                    width: 100%;
                    border-radius: 8px;
                    font-size: 18px;
                    font-weight: 500;
                }
            `}</style>
        </>
    );
}