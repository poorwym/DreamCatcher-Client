import React from 'react'
import Background from "../../components/Background/Background.jsx";
import '../../assets/style.css';

function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
        <Background/>
        
        {/* 主内容区域 */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          {/* 主标题 */}
           <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-contrast tracking-[0.2em] text-center leading-none select-none" style={{fontFamily: 'Times New Roman'}}>
             DreamCatcher 
           </h1>
           
           {/* 副标题 */}
           <p className="text-xl md:text-2xl lg:text-3xl text-secondary font-light tracking-[0.1em] text-center max-w-2xl leading-relaxed" style={{fontFamily: 'Times New Roman'}}>
             catch your dream
           </p>
          
        </div>
        
    </div>
  )
}

export default HomePage
