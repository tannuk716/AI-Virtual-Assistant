import React, { useContext, useState, useEffect, useRef } from 'react';
import { userDataContext } from '../context/UserContext';
import axios from 'axios';
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Customize2() {
  const { userData, backendImage, selectedImage, serverUrl, setUserData } = useContext(userDataContext);
  const [assistantName, setAssistantName] = useState(userData?.AssistantName || "");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const particlesRef = useRef([]);
  const [spotlightActive, setSpotlightActive] = useState(true);

  // Particle generation
  useEffect(() => {
    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        speed: Math.random() * 0.2 + 0.05
      });
    }
    particlesRef.current = particles;
  }, []);

  // Spotlight effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!spotlightActive || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      containerRef.current.style.setProperty('--spotlight-x', `${x}px`);
      containerRef.current.style.setProperty('--spotlight-y', `${y}px`);
    };

    if (spotlightActive) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [spotlightActive]);

  const handleUpdateAssistant = async () => {
    setLoading(true);
    try {
      let formData = new FormData();
      formData.append("assistantName", assistantName);
      if (backendImage) {
        formData.append("assistantImage", backendImage);
      } else {
        formData.append("imageUrl", selectedImage);
      }

      const result = await axios.post(`${serverUrl}/api/user/update`, formData, { withCredentials: true });
      setUserData(result.data);
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center flex-col p-5"
      style={{
        background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
        '--spotlight-color': 'rgba(100, 255, 255, 0.15)',
        '--spotlight-size': '200px',
      }}
    >
      {/* Back button */}
      <MdKeyboardBackspace
        className="absolute top-6 left-6 text-white w-6 h-6 cursor-pointer z-20"
        onClick={() => navigate("/customize")}
      />

      {/* Particles */}
      {particlesRef.current.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            filter: 'blur(1px)'
          }}
          animate={{
            y: [0, particle.y + (particle.speed * 100)],
            x: [0, particle.x + (particle.speed * 50)],
            opacity: [particle.opacity, particle.opacity * 0.2]
          }}
          transition={{
            duration: Math.random() * 5 + 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
        />
      ))}

      {/* Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), var(--spotlight-color), transparent var(--spotlight-size))',
          mixBlendMode: 'screen'
        }}
      />

      {/* Nebula */}
      <div className="absolute inset-0 opacity-20" style={{
        background: 'radial-gradient(ellipse at center, rgba(138,43,226,0.2) 0%, rgba(0,0,255,0.05) 40%, transparent 70%)'
      }} />

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl bg-gradient-to-b from-gray-900/80 to-gray-900/50 backdrop-blur-lg border border-gray-700 rounded-xl shadow-xl p-10 flex flex-col items-center gap-5"
        onMouseEnter={() => setSpotlightActive(false)}
        onMouseLeave={() => setSpotlightActive(true)}
      >
        <motion.h1
          className="text-3xl font-bold text-white text-center mb-6"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          Enter Your <span className="text-cyan-300">Assistant Name</span>
        </motion.h1>

        <input
          type="text"
          placeholder="e.g. Shifra"
          className="w-full p-3 rounded-full bg-gray-800/70 border border-gray-600 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300 text-lg"
          value={assistantName}
          onChange={(e) => setAssistantName(e.target.value)}
          required
        />

        {assistantName && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            onClick={handleUpdateAssistant}
            className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Finally Create Your Assistant"}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

export default Customize2;
