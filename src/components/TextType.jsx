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

    const handleAction = () => {
      if (!isDeleting) {
        // Typing
        setDisplayText(text.substring(0, displayText.length + 1));
        
        if (displayText === text) {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else {
        // Deleting
        setDisplayText(text.substring(0, displayText.length - 1));
        
        if (displayText === '') {
          setIsDeleting(false);
          // Optional: add a small delay before restarting
        }
      }
    };

    const speed = isDeleting ? deletingSpeed : typingSpeed;
    const timeout = setTimeout(handleAction, (displayText === text && !isDeleting) ? pauseDuration : speed);
    
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, text, typingSpeed, deletingSpeed, pauseDuration, started]);

  return <>{displayText || '\u00A0'}</>;
};

export default TextType;
