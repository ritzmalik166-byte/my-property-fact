'use client';
import { useState, useRef, useEffect } from 'react';

export function useSlider() {
  const [activeIndex, setActiveIndex] = useState(1);
  const sliderRef = useRef(null);

  const centerCard = (index) => {
    if (!sliderRef.current) return;
    
    const slider = sliderRef.current;
    const cards = slider.children;
    const card = cards[index];
    
    if (!card) return;

    const sliderRect = slider.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    const offset = card.offsetLeft - (sliderRect.width / 2 - cardRect.width / 2);

    slider.scrollTo({
      left: offset,
      behavior: 'smooth',
    });
  };

  const next = () => {
    if (!sliderRef.current) return;
    const cards = sliderRef.current.children;
    let newIndex = activeIndex + 1;
    if (newIndex >= cards.length) newIndex = 0;
    setActiveIndex(newIndex);
    centerCard(newIndex);
  };

  const prev = () => {
    if (!sliderRef.current) return;
    const cards = sliderRef.current.children;
    let newIndex = activeIndex - 1;
    if (newIndex < 0) newIndex = cards.length - 1;
    setActiveIndex(newIndex);
    centerCard(newIndex);
  };

  useEffect(() => {
    if (sliderRef.current) {
      centerCard(activeIndex);
    }
  }, []);

  return { sliderRef, next, prev, activeIndex };
}