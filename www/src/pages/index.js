import React from 'react';
import { copy } from '../utils';
import styles from '../index.module.scss';

export default function Home() {
  return (
    <div className={styles.root}>
      <h1 className={styles.onboard}>
        Hover an element and hold <kbd>Option</kbd>
      </h1>
      <main className={styles.hero}>
        <h1>inspx</h1>
        <p>Pixel perfect layout inspection.</p>
        <Snippet text="npm install inspx" />
        <a
          href="https://github.com/raunofreiberg/inspx"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.github}
        >
          GitHub
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </main>
      <footer>
        Built by{' '}
        <a href="https://twitter.com/raunofreiberg" target="_blank" rel="noopener noreferrer">
          Rauno
        </a>{' '}
        ✌️
      </footer>
    </div>
  );
}

function Snippet({ text }) {
  const [hovered, setHovered] = React.useState(false);

  function copySnippet() {
    copy(text);
  }

  function handleKeyDown(e) {
    if (e.metaKey && e.key === 'c') {
      copySnippet();
    }
  }

  React.useEffect(() => {
    function onKeyDown(e) {
      if (e.metaKey && e.key === 'c') {
        copySnippet();
        setHovered(false);
      }
    }

    if (hovered) {
      document.addEventListener('keydown', onKeyDown);
    }

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [hovered]);

  return (
    <span className={styles.snippet}>
      {text}
      <button
        aria-label="Copy"
        onClick={copySnippet}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => {
          setHovered(true);
        }}
        onMouseLeave={() => {
          setHovered(false);
        }}
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path
            d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00002H5.5C4.67158 4.00002 4 4.67159 4 5.50002V12.5C4 13.3284 4.67158 14 5.5 14H12.5C13.3284 14 14 13.3284 14 12.5V5.50002C14 4.67159 13.3284 4.00002 12.5 4.00002H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50002C5 5.22388 5.22386 5.00002 5.5 5.00002H12.5C12.7761 5.00002 13 5.22388 13 5.50002V12.5C13 12.7762 12.7761 13 12.5 13H5.5C5.22386 13 5 12.7762 5 12.5V5.50002Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>
    </span>
  );
}
