import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    'bg-primary-600/20',
    'bg-primary-600/10',
    'border-primary-600',
    'from-primary-400',
    'via-success-500',
    'to-primary-600',
    'from-primary-600',
    'to-primary-400',
    'from-dark-surface/70',
    'to-dark-card/90',
    'border-dark-border/80',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        gaming: ['Rajdhani', 'ui-sans-serif', 'system-ui'],
        display: ['Outfit', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          '400': "hsl(var(--primary) / 0.4)",
          '600': "hsl(var(--primary) / 0.6)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          '500': "hsl(var(--success) / 0.5)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        dark: {
          DEFAULT: "hsl(var(--dark))",
          surface: "hsl(var(--dark-surface))",
          card: "hsl(var(--dark-card))",
          border: "hsl(var(--dark-border))",
          hover: "hsl(var(--dark-hover))",
        },
        light: {
          DEFAULT: "hsl(var(--light))",
          surface: "hsl(var(--light-surface))",
          card: "hsl(var(--light-card))",
          border: "hsl(var(--light-border))",
          hover: "hsl(var(--light-hover))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "floating": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "digital-float": {
          "0%, 100%": { transform: "translateY(0) rotate(0)" },
          "33%": { transform: "translateY(-3px) rotate(1deg)" },
          "66%": { transform: "translateY(2px) rotate(-1deg)" },
        },
        "glow-intense": {
          "0%, 100%": { 
            boxShadow: "0 0 5px rgba(14, 165, 233, 0.7), 0 0 10px rgba(14, 165, 233, 0.5)",
            opacity: "0.9" // Convert to string to fix type error
          },
          "50%": { 
            boxShadow: "0 0 10px rgba(14, 165, 233, 1), 0 0 20px rgba(14, 165, 233, 0.8), 0 0 30px rgba(14, 165, 233, 0.4)",
            opacity: "1" // Convert to string to fix type error
          },
        },
        "pulse-width": {
          "0%, 100%": { width: "30%" },
          "50%": { width: "100%" },
        },
        "scan-line": {
          "0%": { transform: "translateY(0%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-100% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "border-flow": {
          "0%, 100%": { 
            borderColor: "rgba(79, 70, 229, 0.2)",
          },
          "25%": { 
            borderColor: "rgba(99, 102, 241, 0.3)",
          },
          "50%": { 
            borderColor: "rgba(129, 140, 248, 0.4)",
          },
          "75%": { 
            borderColor: "rgba(165, 180, 252, 0.3)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "floating": "floating 6s ease-in-out infinite",
        "digital-float": "digital-float 10s ease infinite",
        "glow-intense": "glow-intense 3s ease-in-out infinite",
        "pulse-width": "pulse-width 8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan-line": "scan-line 8s linear infinite",
        "shimmer": "shimmer 3s linear infinite",
        "border-flow": "border-flow 8s linear infinite",
      },
      backgroundImage: {
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      // Define color stops for gradients
      gradientColorStops: {
        primary: {
          '400': 'hsl(var(--primary) / 0.4)',
          '600': 'hsl(var(--primary) / 0.6)',
        },
        success: {
          '500': 'hsl(var(--success) / 0.5)',
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), 
    require("@tailwindcss/typography"),
    function ({ addUtilities }) {
      const newUtilities = {
        // 3D transformations
        '.perspective-400': {
          perspective: '400px',
        },
        '.perspective-800': {
          perspective: '800px',
        },
        '.perspective-1200': {
          perspective: '1200px',
        },
        '.preserve-3d': {
          transformStyle: 'preserve-3d',
        },
        '.rotate-y-10': {
          transform: 'rotateY(10deg)',
        },
        '.rotate-y-neg-10': {
          transform: 'rotateY(-10deg)',
        },
        '.translate-z-5': {
          transform: 'translateZ(5px)',
        },
        '.translate-z-10': {
          transform: 'translateZ(10px)',
        },
        
        // Futuristic UI effects
        '.shimmer-effect': {
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.05), transparent)',
            transform: 'rotate(30deg)',
            animation: 'shimmer 3s linear infinite',
          },
        },
        '.glow-border': {
          border: '1px solid rgba(99, 102, 241, 0.1)',
          boxShadow: '0 0 10px rgba(99, 102, 241, 0.1), inset 0 0 5px rgba(99, 102, 241, 0.05)',
        },
        '.tech-pattern': {
          backgroundImage: 'radial-gradient(circle at 10px 10px, rgba(99, 102, 241, 0.05) 2px, transparent 0)',
          backgroundSize: '20px 20px',
        },
        '.dot-grid': {
          backgroundImage: 'radial-gradient(circle at 10px 10px, rgba(99, 102, 241, 0.1) 1px, transparent 0)',
          backgroundSize: '20px 20px',
        },
        '.scan-line': {
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '2px',
            background: 'linear-gradient(to right, transparent, rgba(99, 102, 241, 0.5), transparent)',
            animation: 'scan-line 5s linear infinite',
          },
        },
      }
      addUtilities(newUtilities)
    },
  ],
} satisfies Config;
