'use client';

import dynamic from 'next/dynamic';
import MRLoader from '@/components/analyze/MRLoader';
import UserRecord from '@/components/analyze/UserRecord';
import { useState } from 'react';

const PitchRecorder = dynamic(() => import('@/components/analyze/PitchRecorder'), { ssr: false });

export default function PitchAnalyzerPage() {
  const [ showRecorder, setShowRecorder ] = useState(false);
  const [uuid, setUuid] = useState<string | null>("a18227da-1687-45e9-bcbc-4a2eaa01aae6");
  const [audioUrl, setAudioUrl] = useState<string | null>("/downloads/a18227da-1687-45e9-bcbc-4a2eaa01aae6.mp3");
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);


  return (
    <div className="font-sans flex flex-col h-full w-full space-y-12" >
      {!showRecorder && <MRLoader 
        setShowRecorderAction={setShowRecorder}
        uuid={uuid}
        audioUrl={audioUrl}
        setUuidAction={setUuid}
        setAudioUrlAction={setAudioUrl}
      />}
      {showRecorder && 
      <>
        <PitchRecorder 
          uuid={uuid}
          audioUrl={audioUrl}
          setUserAudioUrlAction = {setUserAudioUrl}
        />
        <UserRecord
          uuid={uuid}
          audioUrl={audioUrl}
          userAudioUrl = {userAudioUrl}    
          setUserAudioUrl = {setUserAudioUrl}          
        /> 
      </>}   
    </div>
  );
}