import React from "react";
import { Box } from "@mui/material";

const InteractiveBackground = () => (
  <Box sx={{ 
    position: 'absolute',
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    zIndex: 0,
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #0D1117 0%, #161B22 50%, #21262D 100%)'
  }}>
    {/* Animated Grid */}
    <Box sx={{ 
      position: 'absolute', 
      width: '100%', 
      height: '100%',
      opacity: 0.08,
      backgroundImage: `
        linear-gradient(rgba(88, 166, 255, 0.15) 1px, transparent 1px),
        linear-gradient(90deg, rgba(88, 166, 255, 0.15) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
      animation: 'gridMove 25s linear infinite'
    }} />
    {/* Secondary Grid Layer */}
    <Box sx={{ 
      position: 'absolute', 
      width: '100%', 
      height: '100%',
      opacity: 0.04,
      backgroundImage: `
        linear-gradient(rgba(31, 111, 235, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(31, 111, 235, 0.1) 1px, transparent 1px)
      `,
      backgroundSize: '120px 120px',
      animation: 'gridMoveReverse 35s linear infinite'
    }} />
    {/* Floating Code Symbols */}
    {[...Array(20)].map((_, i) => (
      <Box
        key={i}
        sx={{
          position: 'absolute',
          color: `rgba(88, 166, 255, ${0.2 + (i % 3) * 0.1})`,
          fontSize: `${1.2 + (i % 4) * 0.3}rem`,
          fontWeight: 'bold',
          animation: `float ${10 + i * 0.3}s ease-in-out infinite`,
          animationDelay: `${i * 0.4}s`,
          left: `${5 + (i * 8) % 90}%`,
          top: `${10 + (i * 15) % 80}%`,
          filter: 'blur(0.2px)',
          textShadow: '0 0 8px rgba(88, 166, 255, 0.3)',
        }}
      >
        {['{}', '()', '[]', '<>', '//', '&&', '||', '=>', '++', '--', '==', '!=', '+=', '-=', '*=', 'const', 'let', 'var', 'func', 'class'][i % 20]}
      </Box>
    ))}
    {/* Glowing Orbs */}
    {[...Array(12)].map((_, i) => (
      <Box
        key={`orb-${i}`}
        sx={{
          position: 'absolute',
          width: `${80 + i * 15}px`,
          height: `${80 + i * 15}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(88, 166, 255, ${0.08 - i * 0.005}) 0%, transparent 70%)`,
          animation: `pulse ${5 + i * 0.3}s ease-in-out infinite`,
          animationDelay: `${i * 0.6}s`,
          left: `${8 + (i * 10) % 85}%`,
          top: `${5 + (i * 12) % 75}%`,
          filter: 'blur(1px)',
        }}
      />
    ))}
    {/* Animated Lines */}
    {[...Array(6)].map((_, i) => (
      <Box
        key={`line-${i}`}
        sx={{
          position: 'absolute',
          width: '2px',
          height: '100px',
          background: `linear-gradient(180deg, transparent 0%, rgba(88, 166, 255, ${0.3 - i * 0.05}) 50%, transparent 100%)`,
          animation: `lineFloat ${8 + i}s ease-in-out infinite`,
          animationDelay: `${i * 1.2}s`,
          left: `${15 + (i * 15) % 70}%`,
          top: '-100px',
          transform: 'rotate(45deg)',
        }}
      />
    ))}
    {/* Data Flow Particles */}
    {[...Array(8)].map((_, i) => (
      <Box
        key={`particle-${i}`}
        sx={{
          position: 'absolute',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: `rgba(88, 166, 255, ${0.6 - i * 0.05})`,
          animation: `particleFlow ${12 + i * 2}s linear infinite`,
          animationDelay: `${i * 1.5}s`,
          left: '-10px',
          top: `${20 + (i * 10) % 60}%`,
          boxShadow: '0 0 6px rgba(88, 166, 255, 0.8)',
        }}
      />
    ))}
    {/* Matrix Rain Effect */}
    {[...Array(15)].map((_, i) => (
      <Box
        key={`matrix-${i}`}
        sx={{
          position: 'absolute',
          color: 'rgba(88, 166, 255, 0.3)',
          fontSize: '0.9rem',
          fontFamily: 'monospace',
          animation: `matrixRain ${8 + i * 0.5}s linear infinite`,
          animationDelay: `${i * 0.3}s`,
          left: `${5 + (i * 6) % 90}%`,
          top: '-20px',
          whiteSpace: 'nowrap',
        }}
      >
        {String.fromCharCode(0x30A0 + Math.random() * 96)}
      </Box>
    ))}
    {/* Interactive Hover Areas */}
    <Box sx={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at 20% 30%, rgba(88, 166, 255, 0.02) 0%, transparent 50%)',
      animation: 'hoverGlow 15s ease-in-out infinite',
    }} />
    <Box sx={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at 80% 70%, rgba(31, 111, 235, 0.02) 0%, transparent 50%)',
      animation: 'hoverGlow 20s ease-in-out infinite reverse',
    }} />
    <style>{`
      @keyframes gridMove {
        0% { transform: translate(0, 0); }
        100% { transform: translate(60px, 60px); }
      }
      @keyframes gridMoveReverse {
        0% { transform: translate(0, 0); }
        100% { transform: translate(-120px, -120px); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
        25% { transform: translateY(-15px) rotate(90deg) scale(1.05); }
        50% { transform: translateY(-25px) rotate(180deg) scale(1.1); }
        75% { transform: translateY(-15px) rotate(270deg) scale(1.05); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.2); }
      }
      @keyframes lineFloat {
        0% { transform: translateY(-100px) rotate(45deg); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(100vh) rotate(45deg); opacity: 0; }
      }
      @keyframes particleFlow {
        0% { transform: translateX(-10px); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateX(calc(100vw + 10px)); opacity: 0; }
      }
      @keyframes matrixRain {
        0% { transform: translateY(-20px); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(calc(100vh + 20px)); opacity: 0; }
      }
      @keyframes hoverGlow {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
      }
    `}</style>
  </Box>
);

export default InteractiveBackground; 