export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

**`.env.example`**
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

---

**`.gitignore`**
```
node_modules/
dist/
.env
.DS_Store
*.log