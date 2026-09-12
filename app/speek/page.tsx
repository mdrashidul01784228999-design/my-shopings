'use client';

import { useState, useEffect } from 'react';

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // ব্রাউজার সিকিউরিটির জন্য ভয়েস আগে থেকে রেডি করে রাখা
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const speakInBangla = () => {
    if (!text) {
      alert("দয়া করে কিছু লিখুন!");
      return;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert("দুঃখিত, আপনার ব্রাউজারটি ভয়েস সাপোর্ট করে না।");
      return;
    }

    // আগের সব স্পিচ বন্ধ করা
    window.speechSynthesis.cancel();

    // নতুন স্পিচ অবজেক্ট তৈরি
    const utterance = new SpeechSynthesisUtterance(text);
    
    // ভাষা ফোর্স করে বাংলা করে দেওয়া
    utterance.lang = 'bn-BD'; 

    // ব্রাউজারের উপলব্ধ ভয়েসগুলো চেক করা এবং সুনির্দিষ্ট বাংলা ভয়েস সেট করা
    const voices = window.speechSynthesis.getVoices();
    const banglaVoice = voices.find(voice => 
      voice.lang === 'bn-BD' || voice.lang === 'bn-IN' || voice.lang.startsWith('bn')
    );

    if (banglaVoice) {
      utterance.voice = banglaVoice;
    }

    // স্পিড এবং পিচ সেট করা (আস্তে কথা বলার জন্য ০.৮৫ বেস্ট)
    utterance.rate = 0.85; 
    utterance.pitch = 1.0; 

    // স্টেট আপডেট
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error(e);
      setIsSpeaking(false);
    };

    // প্লে করা
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div style={{ 
      width: '100vw', 
      minHeight: '100vh', 
      backgroundColor: '#f4f6f9', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      boxSizing: 'border-box',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      
      <div style={{ 
        width: '100%', 
        maxWidth: '800px', 
        backgroundColor: '#ffffff', 
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        textAlign: 'center'
      }}>
        
        <h2 style={{ 
          fontSize: '28px', 
          color: '#333', 
          marginBottom: '20px',
          fontWeight: '600'
        }}>
          বাংলা টেক্সট টু ভয়েস স্পিচ (Full Screen)
        </h2>
        
        <textarea
          rows="8"
          style={{ 
            width: '100%', 
            padding: '20px', 
            fontSize: '18px', 
            borderRadius: '10px', 
            border: '2px solid #e2e8f0', 
            marginBottom: '25px', 
            color: '#000',
            backgroundColor: '#f8fafc',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s'
          }}
          placeholder="এখানে আপনার বাংলা লেখাটি লিখুন বা পেস্ট করুন..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <button
            onClick={speakInBangla}
            disabled={isSpeaking}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: isSpeaking ? '#cbd5e1' : '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isSpeaking ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
            }}
          >
            {isSpeaking ? 'কথা বলছে...' : 'ভয়েস শুনুন'}
          </button>

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              style={{
                padding: '15px 40px',
                fontSize: '18px',
                fontWeight: 'bold',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
              }}
            >
              থামুন
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
