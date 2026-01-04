import React, { useEffect, useState, useMemo, useRef } from 'react';
import FlipCard from './FlipCard';

interface UIOverlayProps {
  floorCount: number;
  setFloorCount: React.Dispatch<React.SetStateAction<number>>;
  isAutoBuilding: boolean;
  setIsAutoBuilding: React.Dispatch<React.SetStateAction<boolean>>;
  setCameraPreset: (preset: string) => void;
  cameraPreset: string;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  isNight: boolean;
  setIsNight: (val: boolean) => void;
  isFinished: boolean;
  setIsFinished: (val: boolean) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  floorCount, setFloorCount, isAutoBuilding, setIsAutoBuilding,
  setCameraPreset, cameraPreset, language, setLanguage, isNight, setIsNight,
  isFinished, setIsFinished
}) => {
  const TARGET_FLOORS = 167;
  // ~4.02m per floor based on 338m @ 84 floors. 167 floors = ~672m. Spire adds ~328m.
  const METERS_PER_FLOOR = 4.0238; 

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showUI, setShowUI] = useState(true);
  const [displayedHeight, setDisplayedHeight] = useState(0);

  // Smoothly update displayed height based on construction status
  useEffect(() => {
    let animationFrameId: number;
    let targetHeight = isFinished ? 1000.0 : floorCount * METERS_PER_FLOOR;
    
    const animate = () => {
      setDisplayedHeight(prev => {
        const diff = targetHeight - prev;
        // If finished, animate faster to represent spire deploying
        const speed = isFinished ? diff * 0.05 : diff * 0.1;
        
        if (Math.abs(diff) < 0.1) return targetHeight;
        return prev + speed;
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [floorCount, isFinished]);

  const translations = useMemo(() => ({
    ar: {
      title: "برج جدة",
      approx: "الافتتاح التقريبي",
      currentFloor: "الطابق الحالي",
      height: "الارتفاع",
      progress: "الإنجاز",
      constructionControl: "نظام التحكم بالبناء",
      addFloor: "بناء طابق إضافي",
      autoBuild: "بناء مستمر",
      stopAuto: "إيقاف التلقائي",
      finish: "تشطيب البرج بالكامل",
      completed: "مكتمل",
      viewMode: "وضع العرض",
      overview: "البرج كاملاً",
      construction: "منطقة البناء",
      ground: "القاعدة والموقع",
      countdownTitle: "افتتاح برج جدة",
      addToCalendar: "إضافة للتقويم",
      day: "يوم",
      hour: "ساعة",
      min: "دقيقة",
      sec: "ثانية",
      nightMode: "وضع الليل",
      dayMode: "وضع النهار",
      showUI: "عرض الواجهة",
      hideUI: "إخفاء الواجهة"
    },
    en: {
      title: "Jeddah Tower",
      approx: "Approximate opening",
      currentFloor: "CURRENT FLOOR",
      height: "HEIGHT",
      progress: "PROGRESS",
      constructionControl: "CONSTRUCTION CONTROL",
      addFloor: "ADD FLOOR",
      autoBuild: "START AUTO",
      stopAuto: "STOP AUTO",
      finish: "FULL TOWER FINISH",
      completed: "COMPLETED • 1000M",
      viewMode: "VIEW MODE",
      overview: "Full Tower",
      construction: "Construction Zone",
      ground: "Base & Site",
      countdownTitle: "JEDDAH TOWER OPENING",
      addToCalendar: "Add to Calendar",
      day: "DAYS",
      hour: "HRS",
      min: "MIN",
      sec: "SEC",
      nightMode: "NIGHT",
      dayMode: "DAY",
      showUI: "Show UI",
      hideUI: "Hide UI"
    }
  }), []);

  const t = translations[language];

  const handleFinish = () => {
    setFloorCount(TARGET_FLOORS);
    setIsAutoBuilding(false);
    setIsFinished(true);
  };

  const handleAddToCalendar = () => {
    const event = {
      title: language === 'ar' ? 'افتتاح برج جدة' : 'Jeddah Tower Grand Opening',
      details: language === 'ar' ? 'الافتتاح الرسمي لأطول برج في العالم' : 'The official opening of the world\'s tallest tower.',
      location: 'Jeddah, Saudi Arabia',
      start: '20280101T080000Z',
      end: '20280101T120000Z'
    };
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.details)}&location=${encodeURIComponent(event.location)}&sf=true&output=xml`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    let interval: any;
    if (isAutoBuilding) {
      interval = setInterval(() => setFloorCount(prev => Math.min(TARGET_FLOORS, prev + 1)), 800);
    }
    return () => clearInterval(interval);
  }, [isAutoBuilding, setFloorCount, TARGET_FLOORS]);

  useEffect(() => {
    const targetDate = new Date('January 1, 2028 00:00:00').getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) return clearInterval(timer);
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const progress = isFinished ? 100 : ((floorCount / TARGET_FLOORS) * 100).toFixed(1);
  const floorStr = floorCount.toString().padStart(3, '0');

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none text-white font-bold p-3 md:p-10 flex flex-col justify-between overflow-x-hidden">
      
      {/* PERSISTENT UI TOGGLE */}
      <div className="absolute top-3 right-3 md:top-10 md:right-10 pointer-events-auto z-50 flex flex-col gap-2 items-end">
        <button 
          onClick={() => setShowUI(!showUI)}
          className={`glass-panel p-3 md:p-4 rounded-full transition-all active:scale-95 shadow-2xl border-white/20 flex items-center justify-center ${!showUI ? 'bg-yellow-500 text-black border-yellow-400' : 'text-white hover:bg-white/10'}`}
          title={showUI ? t.hideUI : t.showUI}
        >
          {showUI ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          )}
        </button>

        <button 
          onClick={() => setIsNight(!isNight)}
          className={`flex items-center justify-center p-3 md:p-4 rounded-full transition-all glass-panel border-white/20 shadow-2xl pointer-events-auto transform duration-500 ${showUI ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'} ${isNight ? 'text-indigo-400 bg-indigo-950/40' : 'text-yellow-500 bg-white/5'}`}
        >
          {isNight ? '🌙' : '☀️'}
        </button>
      </div>

      {/* HEADER */}
      <div className={`flex flex-col md:flex-row justify-between items-center md:items-start w-full gap-4 transition-all duration-700 transform ${showUI ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
        <div className="pointer-events-auto w-full md:w-auto">
          <div className="glass-panel px-4 md:px-6 py-2.5 md:py-4 rounded-2xl md:rounded-3xl border-white/20 flex items-center justify-between md:justify-start gap-4 md:gap-6 shadow-2xl">
            <h1 className="text-base md:text-xl font-black text-yellow-500 tracking-tighter uppercase whitespace-nowrap">{t.title}</h1>
            <div className="hidden md:block w-[1px] h-6 bg-white/20"></div>
            <button 
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-3 md:px-4 py-1 md:py-2 bg-white/10 rounded-xl text-[10px] md:text-xs hover:bg-white/20 transition-all border border-white/10 font-black uppercase"
            >
              {language === 'ar' ? 'EN' : 'AR'}
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className={`flex flex-col md:flex-row justify-between items-center md:items-end w-full gap-3 md:gap-8 mt-4 md:mt-0 transition-all duration-700 transform ${showUI ? 'translate-y-0 opacity-100' : 'translate-y-[200%] opacity-0'}`}>
        
        {/* LEFT PANEL */}
        <div className="flex flex-col gap-3 md:gap-6 pointer-events-auto w-full md:w-[340px]" style={{ direction: 'ltr' }}>
          
          <div className="glass-panel p-4 md:p-8 rounded-[25px] md:rounded-[40px] border-white/20 shadow-2xl flex flex-col items-center">
            <p className="text-[8px] md:text-[10px] font-black text-yellow-500 uppercase mb-2 md:mb-4 tracking-[0.2em] md:tracking-[0.3em]">{t.currentFloor}</p>
            <div className="flip-container mb-3 md:mb-6">
              {floorStr.split('').map((d, i) => <FlipCard key={i} digit={d} />)}
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:gap-8 w-full mt-2">
              <div className="text-center border-r border-white/10 pr-2">
                <p className="text-[7px] md:text-[9px] uppercase opacity-40 mb-1 tracking-widest">{t.height}</p>
                <p className="text-base md:text-xl font-black text-white">{displayedHeight.toFixed(1)}<span className="text-[10px] ml-1 opacity-50">M</span></p>
              </div>
              <div className="text-center pl-2">
                <p className="text-[7px] md:text-[9px] uppercase opacity-40 mb-1 tracking-widest">{t.progress}</p>
                <p className="text-base md:text-xl font-black text-yellow-500">{progress}%</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-3 md:p-6 rounded-[20px] md:rounded-[35px] border-white/20 shadow-2xl flex flex-col gap-2 md:gap-4">
            <h2 className="text-yellow-500 font-black text-[7px] md:text-[9px] tracking-[0.2em] md:tracking-[0.3em] uppercase mb-0.5 border-b border-white/10 pb-1.5 md:pb-3 text-center opacity-70">{t.constructionControl}</h2>
            
            <div className="flex flex-col gap-2 md:gap-3">
              {/* Construction Buttons */}
              <div className="flex gap-2 md:gap-4">
                <button 
                  disabled={isFinished}
                  onClick={() => setFloorCount(p => Math.min(TARGET_FLOORS, p + 1))}
                  className={`flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-2 md:py-3 rounded-xl transition-all active:scale-95 text-[9px] md:text-[11px] uppercase ${isFinished ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t.addFloor}
                </button>
                <button 
                  disabled={isFinished}
                  onClick={() => setIsAutoBuilding(!isAutoBuilding)}
                  className={`flex-1 py-2 md:py-3 rounded-xl font-black transition-all active:scale-95 border-2 text-[9px] md:text-[11px] uppercase ${isAutoBuilding ? 'bg-red-500/80 border-red-500 text-white shadow-lg' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'} ${isFinished ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isAutoBuilding ? t.stopAuto : t.autoBuild}
                </button>
              </div>

              {/* Finish Button - ALWAYS VISIBLE if not finished */}
              {!isFinished ? (
                <button 
                  onClick={handleFinish}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-2.5 md:py-3.5 rounded-xl transition-all active:scale-95 text-[10px] md:text-xs uppercase shadow-lg border border-blue-400/30 flex items-center justify-center gap-2"
                >
                  {t.finish}
                </button>
              ) : (
                <div className="w-full text-center py-2.5 md:py-3.5 text-white/70 text-[9px] md:text-[11px] font-bold uppercase tracking-widest border border-white/10 rounded-xl bg-green-500/10 shadow-inner">
                  {t.completed}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="w-full md:flex-1 flex flex-col items-center px-0 md:px-6">
          <div className="glass-panel px-4 md:px-12 py-4 md:py-8 rounded-[25px] md:rounded-[50px] border-white/10 shadow-2xl w-full max-w-2xl flex flex-col items-center relative overflow-hidden group pointer-events-auto">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
            <p className="text-yellow-500 font-black text-[8px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.5em] mb-1.5 md:mb-3">{t.countdownTitle}</p>
            <p className="text-[7px] md:text-[9px] font-bold text-white/30 mb-2.5 md:mb-4 text-center uppercase tracking-widest">{t.approx} - 2028</p>
            
            <div className="flex gap-2 md:gap-10 mb-4 md:mb-6" style={{ direction: 'ltr' }}>
              {[
                { val: timeLeft.days, label: t.day },
                { val: timeLeft.hours, label: t.hour },
                { val: timeLeft.minutes, label: t.min },
                { val: timeLeft.seconds, label: t.sec }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="bg-black/40 backdrop-blur-3xl rounded-lg md:rounded-2xl text-sm md:text-4xl font-black px-2 md:px-6 py-2 md:py-5 min-w-[35px] md:min-w-[100px] border border-white/10 text-white flex items-center justify-center shadow-xl">
                    {String(item.val).padStart(item.label === t.day ? 4 : 2, '0')}
                  </div>
                  <span className="text-[6px] md:text-[9px] mt-1 opacity-30 font-black tracking-tighter md:tracking-[0.2em] uppercase">{item.label}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={handleAddToCalendar}
              className="group/btn flex items-center gap-1.5 px-4 md:px-6 py-1.5 md:py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all text-[8px] md:text-[11px] font-black uppercase text-yellow-500/80 hover:text-yellow-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover/btn:opacity-100"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              {t.addToCalendar}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="pointer-events-auto w-full md:w-[280px]">
          <div className="glass-panel p-3 md:p-6 rounded-[25px] md:rounded-[40px] border-white/20 shadow-2xl flex flex-col gap-1.5 md:gap-3">
            <p className="text-[7px] md:text-[10px] font-black text-white/30 uppercase text-center tracking-[0.2em] md:tracking-[0.3em] mb-0.5 md:mb-2">{t.viewMode}</p>
            <div className="grid grid-cols-3 md:grid-cols-1 gap-1.5">
              {[
                { id: 'overview', label: t.overview },
                { id: 'construction', label: t.construction },
                { id: 'ground', label: t.ground }
              ].map((m) => (
                <button 
                  key={m.id}
                  onClick={() => setCameraPreset(m.id)}
                  className={`px-2 md:px-6 py-2 md:py-4 rounded-lg md:rounded-2xl text-[7px] md:text-[11px] font-black transition-all border-2 text-center uppercase ${cameraPreset === m.id ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UIOverlay;