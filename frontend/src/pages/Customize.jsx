import React, { useContext, useRef, useState, useEffect } from 'react'
import Card from '../components/Card'
import image1 from "../assets/image1.png"
import image2 from "../assets/image2.jpg"
import image3 from "../assets/authBg.png"
import image4 from "../assets/image4.png"
import image5 from "../assets/image5.png"
import image6 from "../assets/image6.jpeg"
import image7 from "../assets/image7.jpeg"
import { RiImageAddLine } from "react-icons/ri";
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { MdKeyboardBackspace } from "react-icons/md";
import { motion } from "framer-motion";

function Customize() {
  const {
    serverUrl,
    userData,
    setUserData,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage
  } = useContext(userDataContext);

  const navigate = useNavigate();
  const inputImage = useRef();
  const containerRef = useRef(null);
  const [spotlightActive, setSpotlightActive] = useState(true);
  const [particles, setParticles] = useState([]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  // Particle generation
  useEffect(() => {
    const temp = [];
    for (let i = 0; i < 50; i++) {
      temp.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.4 + 0.3,
        speed: Math.random() * 0.3 + 0.1,
      });
    }
    setParticles(temp);
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

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
        '--spotlight-color': 'rgba(100, 255, 255, 0.1)',
        '--spotlight-size': '200px'
      }}
    >
      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, particle.y + (particle.speed * 100)],
            x: [0, particle.x + (particle.speed * 50)],
            opacity: [particle.opacity, particle.opacity * 0.2]
          }}
          transition={{
            duration: 6,
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
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, rgba(138,43,226,0.2) 0%, rgba(0,0,255,0.05) 40%, transparent 70%)'
      }} />

      {/* Form Content */}
      <motion.div
        onMouseEnter={() => setSpotlightActive(false)}
        onMouseLeave={() => setSpotlightActive(true)}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className='relative z-10 w-full h-full flex justify-center items-center flex-col p-[20px]'
      >
        <MdKeyboardBackspace
          className='absolute top-[30px] left-[30px] text-white cursor-pointer w-[25px] h-[25px]'
          onClick={() => navigate("/")}
        />
        <h1 className='text-white mb-[40px] text-[30px] text-center '>
          Select your <span className='text-blue-200'>Assistant Image</span>
        </h1>
        <div className='w-full max-w-[900px] flex justify-center items-center flex-wrap gap-[15px]'>
          <Card image={image1} />
          <Card image={image2} />
          <Card image={image3} />
          <Card image={image4} />
          <Card image={image5} />
          <Card image={image6} />
          <Card image={image7} />

          {/* Upload Option */}
          <div
            className={`w-[70px] h-[140px] lg:w-[150px] lg:h-[250px] bg-[#020220] border-2 border-[#0000ff66] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-white flex items-center justify-center ${selectedImage === "input" ? "border-4 border-white shadow-2xl shadow-blue-950 " : ""}`}
            onClick={() => {
              inputImage.current.click();
              setSelectedImage("input");
            }}
          >
            {!frontendImage && <RiImageAddLine className='text-white w-[25px] h-[25px]' />}
            {frontendImage && <img src={frontendImage} className='h-full object-cover' />}
          </div>
          <input type="file" accept='image/*' ref={inputImage} hidden onChange={handleImage} />
        </div>

        {selectedImage && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold bg-white rounded-full text-[19px]'
            onClick={() => navigate("/customize2")}
          >
            Next
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}

export default Customize;
