import { useState, useEffect } from 'react';

const TextType = ({ 
  text = "", 
  typingSpeed = 100, 
  deletingSpeed = 50,
  pauseDuration = 3000,
  delay = 0,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    let timer;
    if (!isDeleting) {
      if (displayText !== text) {
        timer = setTimeout(() => {
          setDisplayText(text.substring(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      if (displayText !== '') {
        timer = setTimeout(() => {
          setDisplayText(text.substring(0, displayText.length - 1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, text, typingSpeed, deletingSpeed, pauseDuration, started]);

  return <>{displayText || '\u00A0'}</>;
};

export default TextType;
