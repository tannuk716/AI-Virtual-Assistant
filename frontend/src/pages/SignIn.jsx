import React, { useContext, useState, useRef, useEffect } from 'react';
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from "axios";
import { motion } from "framer-motion";

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const { serverUrl, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const [spotlightActive, setSpotlightActive] = useState(true);
  const containerRef = useRef(null);
  const particlesRef = useRef([]);

  // Generate space particles
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

  // Spotlight tracking
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

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      let result = await axios.post(`${serverUrl}/api/auth/signin`, {
        email, password
      }, { withCredentials: true });
      setUserData(result.data);
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.log(error);
      setUserData(null);
      setLoading(false);
      setErr(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
        '--spotlight-color': 'rgba(100, 255, 255, 0.2)',
        '--spotlight-size': '200px'
      }}
    >
      {/* Space Particles */}
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
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${spotlightActive ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'radial-gradient(circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), var(--spotlight-color), transparent var(--spotlight-size))',
          mixBlendMode: 'screen'
        }}
      />

      {/* Nebula Gradient */}
      <div className="absolute inset-0 opacity-20" style={{
        background: 'radial-gradient(ellipse at center, rgba(138,43,226,0.2) 0%, rgba(0,0,255,0.05) 40%, transparent 70%)'
      }} />

      {/* Form */}
      <motion.form
        onSubmit={handleSignIn}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-auto bg-gradient-to-b from-gray-900/80 to-gray-900/40 backdrop-blur-lg border border-gray-700 rounded-xl shadow-xl p-8 my-16 flex flex-col gap-5 items-center"
        onMouseEnter={() => setSpotlightActive(false)}
        onMouseLeave={() => setSpotlightActive(true)}
      >
        <motion.h1 
          className="text-3xl font-bold text-center text-white mb-6"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          Sign In to <span className="text-cyan-300">Virtual Assistant</span>
        </motion.h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded-lg bg-gray-800/70 border border-gray-600 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
          required
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-3 pr-10 rounded-lg bg-gray-800/70 border border-gray-600 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-300"
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-300 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
          </button>
        </div>

        {err && <p className="w-full text-red-400 text-sm text-left animate-pulse">* {err}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          className="w-full p-3 mt-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-medium shadow-lg transition-all duration-300 disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              Signing In...
            </span>
          ) : (
            "Sign In"
          )}
        </motion.button>

        <p className="text-gray-400 text-sm mt-4">
          Don’t have an account?{" "}
          <button
            type="button"
            className="text-cyan-300 hover:text-cyan-200 underline transition-colors"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </p>
      </motion.form>
    </div>
  );
}

export default SignIn;
