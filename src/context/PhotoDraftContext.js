import React, { createContext, useCallback, useContext, useState } from 'react';

const PhotoDraftContext = createContext(null);

export function PhotoDraftProvider({ children }) {
  const [draftPhoto, setDraftPhotoState] = useState(null);
  const setDraftPhoto = useCallback((uri) => setDraftPhotoState(uri || null), []);
  const value = React.useMemo(() => ({ draftPhoto, setDraftPhoto }), [draftPhoto, setDraftPhoto]);
  return <PhotoDraftContext.Provider value={value}>{children}</PhotoDraftContext.Provider>;
}

export function usePhotoDraft() {
  const value = useContext(PhotoDraftContext);
  if (!value) throw new Error('usePhotoDraft must be used inside PhotoDraftProvider');
  return value;
}
