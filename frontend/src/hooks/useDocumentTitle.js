import { useEffect } from 'react';

/**
 * src/hooks/useDocumentTitle.js
 *
 * Sets document.title while the calling component is mounted (and whenever
 * `title` changes), restoring whatever title was in place before it on
 * unmount.
 *
 * @param {string} title
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) document.title = title;
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}

export default useDocumentTitle;
