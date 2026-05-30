import React from "react";

/** IntersectionObserver 기반 무한스크롤 훅 */
export const useInfiniteScroll = (
  fetchNextPage: () => void,
  hasNextPage: boolean,
  isFetchingNextPage: boolean,
) => {
  const observerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!observerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { threshold: 0.1 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return observerRef;
};
