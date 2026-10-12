"use client";

import { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./videoSlider.css";
import { IoClose, IoPlayCircle } from "react-icons/io5";

export default function VideoSlider() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Since there's only one video, we'll use it 4 times
  // Update the video path to match your actual video file name
  const videoPath = "/static/social-media/video.mp4"; // Change this to your actual video filename
  
  const videos = [
    {
      id: 1,
      src: "/static/social-media/social1.mp4",
      title: "MPF Video 1",
    },
    {
      id: 2,
      src: "/static/social-media/social1.mp4",
      title: "MPF Video 2",
    },
    {
      id: 3,
      src: "/static/social-media/social1.mp4",
      title: "MPF Video 3",
    },
    {
      id: 4,
      src: "/static/social-media/social1.mp4",
      title: "MPF Video 4",
    },
  ];

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: false,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <>
      <div className="container video-slider-container">
      <h2 className="text-center my-5 plus-jakarta-sans-semi-bold">Social Feeds from MPF on Instagram</h2>
        <div className="video-slider-wrapper">
          <Slider {...settings}>
            {videos.map((video) => (
              <div key={video.id} className="video-slide-item">
                <div
                  className="video-card"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="video-thumbnail-container">
                    <video
                      className="video-thumbnail"
                      muted
                      playsInline
                      preload="metadata"
                      aria-label={`${video.title} thumbnail`}
                    >
                      <source src={video.src} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="play-overlay" aria-hidden="true">
                      <IoPlayCircle className="play-icon" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Video Modal Popup */}
      {isModalOpen && selectedVideo && (
        <div
          className="video-modal-overlay"
          onClick={handleBackdropClick}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeModal();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-modal-title"
        >
          <div className="video-modal-content">
            <button
              className="video-modal-close"
              onClick={closeModal}
              aria-label="Close video"
            >
              <IoClose />
            </button>
            <div className="video-modal-player">
              <video
                controls
                autoPlay
                className="modal-video"
                src={selectedVideo.src}
              >
                Your browser does not support the video tag.
              </video>
            </div>
              {/* <h3 id="video-modal-title" className="video-modal-title">
                {selectedVideo.title}
              </h3> */}
          </div>
        </div>
      )}
    </>
  );
}

