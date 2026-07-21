import re

with open('vite.config.ts', 'r') as f:
    content = f.read()

build_config = """    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom', 'zustand'],
            three: ['three'],
            motion: ['motion'],
            lucide: ['lucide-react']
          }
        }
      }
    },
"""

content = content.replace("server: {", f"{build_config}    server: {{")

with open('vite.config.ts', 'w') as f:
    f.write(content)
