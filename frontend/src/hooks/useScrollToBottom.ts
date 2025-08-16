export function useScrollToBottom<T extends HTMLElement>(
  scrollRef: React.RefObject<T | null>,
  delay: number = 100
) {

  const scrollToBottom = () => {
    if (scrollRef.current) {
      // Small delay to ensure new content is rendered
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, delay);
    }
  }

  return { scrollToBottom};
}
