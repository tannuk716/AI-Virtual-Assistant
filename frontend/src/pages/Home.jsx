import React, { useContext, useEffect, useRef, useState } from 'react';
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiImg from "../assets/v2.gif";
import userImg from "../assets/voice.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import { motion } from 'framer-motion';

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const [ham, setHam] = useState(false);
  const isRecognizingRef = useRef(null);
  const synth = window.speechSynthesis;

  // New UI state and refs
  const containerRef = useRef(null);
  const [spotlightActive, setSpotlightActive] = useState(true);
  const [particles, setParticles] = useState([]);

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.log(error);
    }
  };

  const startRecognition = () => {
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current?.start();
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error("Start error:", error);
        }
      }
    }
  };

  const speak = (text) => {
    const utterence = new SpeechSynthesisUtterance(text);
    utterence.lang = 'hi-IN';
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang === 'hi-IN');
    if (hindiVoice) utterence.voice = hindiVoice;

    isSpeakingRef.current = true;
    utterence.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      setTimeout(() => {
        startRecognition();
      }, 800);
    };
    synth.cancel();
    synth.speak(utterence);
  };

  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    speak(response);
    const query = encodeURIComponent(userInput);

    const urlMap = {
      'google-search': `https://www.google.com/search?q=${query}`,
      'calculator-open': `https://www.google.com/search?q=calculator`,
      'instagram-open': `https://www.instagram.com/`,
      'facebook-open': `https://www.facebook.com/`,
      'weather-show': `https://www.google.com/search?q=weather`,
      'Youtube': `https://www.youtube.com/results?search_query=${query}`,
      'youtube-play': `https://www.youtube.com/results?search_query=${query}`,
    };

    if (urlMap[type]) window.open(urlMap[type], '_blank');
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognitionRef.current = recognition;
    let isMounted = true;

    const startTimeout = setTimeout(() => {
      if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
        } catch (e) {
          if (e.name !== "InvalidStateError") console.error(e);
        }
      }
    }, 1000);

    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      if (isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            if (e.name !== "InvalidStateError") console.error(e);
          }
        }, 1000);
      }
    };

    recognition.onerror = (event) => {
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            if (e.name !== "InvalidStateError") console.error(e);
          }
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
        setAiText("");
        setUserText(transcript);
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);
        const data = await getGeminiResponse(transcript);
        handleCommand(data);
        setAiText(data.response);
        setUserText("");
      }
    };

    const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`);
    greeting.lang = 'hi-IN';
    synth.speak(greeting);

    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
    };
  }, []);

  // New UI useEffects
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
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [spotlightActive]);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at bottom, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        '--spotlight-color': 'rgba(173, 216, 230, 0.12)',
        '--spotlight-size': '220px'
      }}
    >
      {/* Animated particles */}
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
            filter: 'drop-shadow(0 0 6px white)',
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

      {/* Spotlight cursor */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${spotlightActive ? 'opacity-100' : 'opacity-0'}`}
        style={{
          background: 'radial-gradient(circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), var(--spotlight-color), transparent var(--spotlight-size))',
          mixBlendMode: 'screen'
        }}
      />

      {/* Nebula glow layer */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(138,43,226,0.25) 0%, rgba(75,0,130,0.1) 40%, transparent 80%)'
        }}
      />

      {/* Main content */}
      <motion.div
        onMouseEnter={() => setSpotlightActive(false)}
        onMouseLeave={() => setSpotlightActive(true)}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full h-full flex justify-center items-center flex-col px-4 md:px-10 text-center"
      >
        {/* Menu Button */}
        <CgMenuRight className='z-20 lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => setHam(true)} />
        <div className={`absolute z-20 lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham ? "translate-x-0" : "translate-x-full"} transition-transform`}>
          <RxCross1 className='text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={() => setHam(false)} />
          <button className='min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full text-[19px]' onClick={handleLogOut}>Log Out</button>
          <button className='min-w-[150px] h-[60px] text-black font-semibold bg-white rounded-full text-[19px]' onClick={() => navigate("/customize")}>Customize your Assistant</button>
          <div className='w-full h-[2px] bg-gray-400'></div>
          <h1 className='text-white font-semibold text-[19px]'>History</h1>
          <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col'>
            {userData.history?.map((his, index) => (
              <div key={index} className='text-gray-200 text-[18px] truncate'>{his}</div>
            ))}
          </div>
        </div>

        {/* Desktop buttons */}
        <button className='z-20 min-w-[150px] h-[60px] text-black font-semibold absolute hidden lg:block top-[20px] right-[20px] bg-white rounded-full text-[19px]' onClick={handleLogOut}>Log Out</button>
        <button className='z-20 min-w-[150px] h-[60px] text-black font-semibold absolute top-[100px] right-[20px] bg-white rounded-full text-[19px] hidden lg:block' onClick={() => navigate("/customize")}>Customize your Assistant</button>

        {/* Assistant Content */}
        <div className='z-20 w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
          <img src={userData?.assistantImage} alt="" className='h-full object-cover' />
        </div>
        <h1 className='z-20 text-white text-xl md:text-2xl font-bold mt-4'>I'm {userData?.assistantName}</h1>
        {!aiText && <img src={userImg} alt="" className='z-20 w-48 mt-4' style={{ mixBlendMode: 'screen' }} />}
        {aiText && <img src={aiImg} alt="" className='z-20 w-48 mt-4' style={{ mixBlendMode: 'screen' }} />}
        <h1 className='z-20 text-white text-xl md:text-2xl font-semibold text-center px-4 mt-4'>{userText || aiText}</h1>
      </motion.div>
    </div>  
  );
}

export default Home;