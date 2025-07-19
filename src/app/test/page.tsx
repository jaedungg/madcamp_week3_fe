'use client';

import { useState } from 'react';

export default function TestClient() {
  const [uuid, setUuid] = useState<string | null>(null);

  const handleSeparation = async () => {
    const res = await fetch('/api/separate', { method: 'POST' });
    const data = await res.json();
    setUuid(data.uuid);
  };

  return (
    <div>
      <button onClick={handleSeparation}>YouTube 음원 분리</button>
      {uuid && <p>분리된 UUID: {uuid}</p>}
    </div>
  );
}
