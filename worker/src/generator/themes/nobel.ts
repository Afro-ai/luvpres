export const nobelTheme = {
  name: 'nobel',
  displayName: 'Nobel (Academic)',
  css: `
    :root {
      /* Colors */
      --cream: #F9F8F4;
      --stone-white: #F5F4F0;
      --stone-900: #1c1917;
      --stone-800: #292524;
      --stone-700: #44403c;
      --stone-600: #57534e;
      --stone-500: #78716c;
      --stone-400: #a8a29e;
      --stone-300: #d6d3d1;
      --stone-200: #e7e5e4;
      --stone-100: #f5f5f4;
      --nobel-gold: #C5A059;
      --nobel-gold-light: #d4b76a;
      --success: #22c55e;
      --error: #ef4444;
      --info: #3b82f6;
      
      /* Typography */
      --font-heading: 'Playfair Display', Georgia, serif;
      --font-body: 'Inter', -apple-system, sans-serif;

      /* Spacing */
      --space-xs: 0.25rem;
      --space-sm: 0.5rem;
      --space-md: 1rem;
      --space-lg: 1.5rem;
      --space-xl: 2rem;
    }

    body {
      background-color: var(--cream);
      color: var(--stone-800);
      font-family: var(--font-body);
      margin: 0;
      padding-bottom: 4rem;
    }

    h1, h2, h3 {
      font-family: var(--font-heading);
      color: var(--stone-900);
    }

    .meta-label {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--stone-500);
      display: block;
      margin-bottom: var(--space-xs);
    }

    .glass-nav {
      background: rgba(249, 248, 244, 0.9);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(0,0,0,0.05);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand {
      font-weight: 700;
      font-size: 1.5rem;
      color: var(--stone-900);
      margin: 0;
    }
    
    .btn-primary {
      background-color: var(--stone-900);
      color: var(--cream);
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 9999px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-primary:hover {
      background-color: var(--stone-800);
      transform: translateY(-1px);
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      border: 1px solid var(--stone-200);
      margin-bottom: 2rem;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    /* Interactive Elements */
    .flip-card {
      perspective: 1000px;
      height: 300px;
      cursor: pointer;
    }
    
    .flip-card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      text-align: center;
      transition: transform 0.6s;
      transform-style: preserve-3d;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border-radius: 12px;
    }
    
    .flip-card:hover .flip-card-inner, .flip-card:focus .flip-card-inner, .flip-card.flipped .flip-card-inner {
      transform: rotateY(180deg);
    }
    
    .flip-card-front, .flip-card-back {
      position: absolute;
      width: 100%;
      height: 100%;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      border-radius: 12px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: white;
      border: 1px solid var(--stone-200);
    }
    
    .flip-card-back {
      background-color: var(--stone-900);
      color: var(--cream);
      transform: rotateY(180deg);
    }
    
    .flip-card-back .meta-label { color: var(--stone-400); }
    .flip-card-back h3, .flip-card-back p { color: var(--cream); }

    .quiz-option {
      width: 100%;
      text-align: left;
      padding: 1rem;
      margin-bottom: 0.5rem;
      border: 1px solid var(--stone-300);
      border-radius: 8px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    .quiz-option:hover {
      border-color: var(--nobel-gold);
      background: var(--stone-white);
    }

    .quiz-option.selected {
      border-color: var(--stone-900);
      background: var(--stone-100);
    }
    
    .quiz-option.correct {
      background-color: #dcfce7;
      border-color: var(--success);
      color: #14532d;
    }
    
    .quiz-option.incorrect {
      background-color: #fee2e2;
      border-color: var(--error);
      color: #7f1d1d;
    }

    .progress-bar {
      height: 8px;
      background: var(--stone-200);
      border-radius: 99px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--nobel-gold);
      width: 0%;
      transition: width 0.5s ease;
    }
  `
};
