'use client';

import dynamic from 'next/dynamic';
import MRLoader from '@/components/analyze/MRLoader';
import UserRecord from '@/components/analyze/UserRecord';
import { useState } from 'react';
import { useParams } from 'next/navigation';

const PitchRecorder = dynamic(() => import('@/components/analyze/PitchRecorder'), { ssr: false });

export default function PitchAnalyzerIdPage() {
  const params = useParams();
  const id = params?.id as string | null;

  const uuid = id;
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);


  return (
    <div className="font-sans flex flex-col h-full w-full space-y-12" >
      <PitchRecorder 
        uuid={uuid}
        audioUrl={audioUrl}
        setUserAudioUrlAction = {setUserAudioUrl}
        setAudioUrlAction = {setAudioUrl}
      />
      <UserRecord
        uuid={uuid}
        audioUrl={audioUrl}
        userAudioUrl = {userAudioUrl}    
          setUserAudioUrl = {setUserAudioUrl}          
        /> 
    </div>
  );
}