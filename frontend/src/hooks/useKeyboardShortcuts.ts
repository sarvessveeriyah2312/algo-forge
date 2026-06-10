import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '../store/useToastStore';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  
  // Track details of the 'G' prefix key
  const gKeyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcut sequences if the user is typing in interactive form elements
      const target = event.target as HTMLElement | null;
      if (
        !target ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const now = Date.now();

      // Check if 'g' was pressed within the allowed interval (1000ms chord window)
      const isGActive = gKeyTimerRef.current !== null && (now - gKeyTimerRef.current <= 1000);

      if (key === 'g') {
        // Record 'G' prefix key and set timestamp
        gKeyTimerRef.current = now;
        return;
      }

      if (isGActive) {
        let route = '';
        let routeName = '';

        switch (key) {
          case 'd':
            route = '/';
            routeName = 'Dashboard Terminal';
            break;
          case 'b':
            route = '/builder';
            routeName = 'Strategy Builder';
            break;
          case 'r':
            route = '/results';
            routeName = 'Results Matrix';
            break;
          case 'i':
            route = '/indicator-lab';
            routeName = 'Indicator Research Lab';
            break;
          case 'a':
          case 't':
            route = '/backtest';
            routeName = 'Backtester Control';
            break;
          case 's':
            route = '/settings';
            routeName = 'Terminal Settings';
            break;
          default:
            // Non-nav key pressed, reset chord
            gKeyTimerRef.current = null;
            return;
        }

        if (route) {
          event.preventDefault();
          
          // Clear prefix state
          gKeyTimerRef.current = null;
          
          // Trigger transition
          navigate(route);
          
          // Technical stylized toast confirmation fits AlgoForge theme
          addToast(`Handshake success: Diverting subsystem to ${routeName} [G+${key.toUpperCase()}]`, 'success');
        }
      } else {
        // Handle help helper cheat sheet when typing '?' or 'h'
        if (key === '?' || (key === 'h' && !event.ctrlKey && !event.metaKey)) {
          event.preventDefault();
          addToast(
            '⌨️ Terminal Shortcuts loaded: Press G then D (or hold G+D) for Dashboard, G+B for Builder, G+R for Results, G+S for Settings.',
            'info'
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, addToast]);
};
