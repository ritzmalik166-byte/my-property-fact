"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExpand,
  faCompress,
  faPlay,
  faPause,
  faArrowRight,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

const scenes = [
  {
    id: "step1",
    name: "Scene 1",
    image: "/static/360images/step1.jpg",
    // Navigation hotspots: [yaw in degrees, pitch in degrees, targetScene]
    hotspots: [
      { yaw: 90, pitch: 0, target: 1 }, // Forward to scene 2 (right side)
    ],
  },
  {
    id: "step2",
    name: "Scene 2",
    image: "/static/360images/step2.jpg",
    hotspots: [
      { yaw: 270, pitch: 0, target: 0 }, // Back to scene 1 (left side)
      { yaw: 90, pitch: 0, target: 2 }, // Forward to scene 3 (right side)
    ],
  },
  {
    id: "step3",
    name: "Scene 3",
    image: "/static/360images/step3.jpg",
    hotspots: [
      { yaw: 270, pitch: 0, target: 1 }, // Back to scene 2 (left side)
      { yaw: 90, pitch: 0, target: 3 }, // Forward to scene 4 (right side)
    ],
  },
  {
    id: "step4",
    name: "Scene 4",
    image: "/static/360images/step4.jpg",
    hotspots: [
      { yaw: 270, pitch: 0, target: 2 }, // Back to scene 3 (left side)
      { yaw: 90, pitch: 0, target: 4 }, // Forward to scene 5 (right side)
    ],
  },
  {
    id: "step5",
    name: "Scene 5",
    image: "/static/360images/step5.jpg",
    hotspots: [
      { yaw: 270, pitch: 0, target: 3 }, // Back to scene 4 (left side)
    ],
  },
];

function VirtualTourComponent() {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const hotspotsContainerRef = useRef(null);
  const [currentScene, setCurrentScene] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutorotating, setIsAutorotating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerLoaded, setViewerLoaded] = useState(false);
  const [viewerPosition, setViewerPosition] = useState({ yaw: 0, pitch: 0 });

  // Switch scene function
  const switchScene = useCallback((sceneIndex) => {
    if (!viewerRef.current || sceneIndex < 0 || sceneIndex >= scenes.length) return;

    const scene = scenes[sceneIndex];
    setIsLoading(true);

    try {
      viewerRef.current.setPanorama(scene.image, {
        caption: scene.name,
        showLoader: true,
      });

      setCurrentScene(sceneIndex);
      
      // Update hotspots after panorama loads
      setTimeout(() => {
        setIsLoading(false);
        updateHotspots(sceneIndex);
      }, 800);
    } catch (error) {
      console.error("Error switching scene:", error);
      setIsLoading(false);
    }
  }, []);

  // Convert 3D sphere coordinates to 2D screen coordinates
  const sphereToScreen = (yaw, pitch, viewerYaw, viewerPitch, viewerFov) => {
    // Normalize angles to -180 to 180 range
    const normalizeAngle = (angle) => {
      angle = angle % 360;
      if (angle > 180) angle -= 360;
      if (angle < -180) angle += 360;
      return angle;
    };

    // Calculate relative angles
    let relativeYaw = normalizeAngle(yaw - viewerYaw);
    let relativePitch = normalizeAngle(pitch - viewerPitch);

    // Convert to radians
    const yawRad = (relativeYaw * Math.PI) / 180;
    const pitchRad = (relativePitch * Math.PI) / 180;
    const fovRad = (viewerFov * Math.PI) / 180;

    // Simple perspective projection
    // Use field of view to scale the projection
    const aspectRatio = 1; // Assuming square viewport
    const scale = Math.tan(fovRad / 2);
    
    const x = Math.tan(yawRad) / scale;
    const y = -Math.tan(pitchRad) / scale; // Negative for correct Y direction

    // Convert to percentage (0-100%), clamped to visible area
    const xPercent = Math.max(0, Math.min(100, 50 + (x * 50 * aspectRatio)));
    const yPercent = Math.max(0, Math.min(100, 50 + (y * 50)));

    return { x: xPercent, y: yPercent, visible: Math.abs(relativeYaw) < 90 && Math.abs(relativePitch) < 90 };
  };

  // Update hotspots position based on current viewer position
  const updateHotspots = useCallback((sceneIndex) => {
    if (!hotspotsContainerRef.current || !viewerRef.current) return;

    const scene = scenes[sceneIndex];
    const container = hotspotsContainerRef.current;
    
    // Clear existing hotspots
    container.innerHTML = '';

    // Get current viewer position and FOV
    const position = viewerRef.current.getPosition();
    const currentYaw = (position.yaw * 180) / Math.PI;
    const currentPitch = (position.pitch * 180) / Math.PI;
    const fov = viewerRef.current.getFov();

    scene.hotspots.forEach((hotspot, index) => {
      const isForward = hotspot.target > sceneIndex;
      const targetScene = scenes[hotspot.target];
      
      // Calculate screen position
      const screenPos = sphereToScreen(
        hotspot.yaw,
        hotspot.pitch,
        currentYaw,
        currentPitch,
        fov
      );

      // Only show hotspot if it's visible
      if (!screenPos.visible || screenPos.x < -5 || screenPos.x > 105 || screenPos.y < -5 || screenPos.y > 105) {
        return; // Hotspot is outside view
      }
      
      // Create hotspot element
      const hotspotEl = document.createElement('div');
      hotspotEl.className = `navigation-pointer ${isForward ? 'forward' : 'backward'}`;
      hotspotEl.setAttribute('data-target', hotspot.target);
      hotspotEl.setAttribute('data-yaw', hotspot.yaw);
      hotspotEl.setAttribute('data-pitch', hotspot.pitch);
      hotspotEl.title = `Go to ${targetScene.name}`;
      
      hotspotEl.innerHTML = `
        <div class="pointer-circle">
          <div class="pointer-icon">
            ${isForward ? 
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>' :
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"/></svg>'
            }
          </div>
          <div class="pointer-pulse"></div>
        </div>
      `;
      
      // Position hotspot
      hotspotEl.style.left = `${screenPos.x}%`;
      hotspotEl.style.top = `${screenPos.y}%`;
      
      // Add click handler
      hotspotEl.addEventListener('click', (e) => {
        e.stopPropagation();
        switchScene(hotspot.target);
      });
      
      container.appendChild(hotspotEl);
    });
  }, [switchScene]);

  // Initialize viewer
  useEffect(() => {
    if (!containerRef.current || viewerLoaded) return;

    const initViewer = async () => {
      try {
        // Dynamic import to ensure it only loads on client
        const { Viewer } = await import("photo-sphere-viewer");
        await import("photo-sphere-viewer/dist/photo-sphere-viewer.css");

        setIsLoading(true);
        
        const viewer = new Viewer({
          container: containerRef.current,
          panorama: scenes[0].image,
          caption: scenes[0].name,
          navbar: [
            "zoom",
            "move",
            "fullscreen",
            "caption",
          ],
          defaultZoomLvl: 50,
          minFov: 30,
          maxFov: 90,
          autorotateDelay: 3000,
          autorotateSpeed: "1rpm",
        });

        viewerRef.current = viewer;
        setViewerLoaded(true);

        // Listen to position changes to update hotspots
        let positionUpdateTimer;
        const handlePositionUpdate = () => {
          if (viewerRef.current) {
            const pos = viewerRef.current.getPosition();
            setViewerPosition({
              yaw: pos.yaw * 180 / Math.PI,
              pitch: pos.pitch * 180 / Math.PI,
            });
            
            // Throttle hotspot updates
            clearTimeout(positionUpdateTimer);
            positionUpdateTimer = setTimeout(() => {
              updateHotspots(currentScene);
            }, 50);
          }
        };

        viewer.addEventListener('position-updated', handlePositionUpdate);

        // Add initial hotspots after viewer is ready
        setTimeout(() => {
          setIsLoading(false);
          updateHotspots(0);
        }, 1000);
      } catch (error) {
        console.error("Error initializing viewer:", error);
        setIsLoading(false);
      }
    };

    initViewer();

    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (err) {
          console.warn("Error destroying viewer:", err);
        }
        viewerRef.current = null;
      }
    };
  }, [viewerLoaded, currentScene, updateHotspots]);

  // Update hotspots when position changes
  useEffect(() => {
    if (viewerLoaded && viewerRef.current) {
      updateHotspots(currentScene);
    }
  }, [viewerPosition, viewerLoaded, currentScene, updateHotspots]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!viewerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current && containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current && containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current && containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
        )
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Toggle autorotate
  const toggleAutorotate = () => {
    if (!viewerRef.current) return;

    try {
      const autorotate = viewerRef.current.getAutorotate();
      if (autorotate) {
        viewerRef.current.stopAutorotate();
        setIsAutorotating(false);
      } else {
        viewerRef.current.startAutorotate();
        setIsAutorotating(true);
      }
    } catch (err) {
      console.warn("Autorotate not available:", err);
    }
  };

  return (
    <div className="virtual-tour-container">
      <div className="virtual-tour-wrapper-street-view">
        {/* Viewer Container - Full Width */}
        <div className="virtual-tour-viewer-wrapper">
          <div
            ref={containerRef}
            className="virtual-tour-viewer"
            style={{ width: "100%", height: "600px", position: "relative" }}
          />
          
          {/* Hotspots Overlay Container */}
          <div 
            ref={hotspotsContainerRef}
            className="hotspots-overlay"
          />
          
          {isLoading && (
            <div className="viewer-loading">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* Custom Controls */}
          <div className="virtual-tour-controls">
            <button
              className="control-btn"
              onClick={toggleAutorotate}
              title="Toggle Autorotate"
            >
              <FontAwesomeIcon icon={isAutorotating ? faPause : faPlay} />
            </button>
            <button
              className="control-btn"
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
            >
              <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
            </button>
          </div>

          {/* Scene Indicator */}
          <div className="scene-indicator">
            <span>{scenes[currentScene].name}</span>
            <span className="scene-counter">
              {currentScene + 1} / {scenes.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export with dynamic import to prevent SSR issues
const VirtualTour = dynamic(() => Promise.resolve(VirtualTourComponent), {
  ssr: false,
});

export default VirtualTour;
