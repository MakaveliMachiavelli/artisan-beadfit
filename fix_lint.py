with open('src/pages/StudioPage.tsx', 'r') as f:
    content = f.read()

# Add isAuthOpen state
if 'const [isAuthOpen, setIsAuthOpen] = useState(false);' not in content:
    content = content.replace(
        'const [toastMsg, setToastMsg] = useState(\'\');',
        'const [toastMsg, setToastMsg] = useState(\'\');\n  const [isAuthOpen, setIsAuthOpen] = useState(false);'
    )

# Fix AuthModal prop
content = content.replace('<AuthModal onClose={() => setIsAuthOpen(false)} />', '<AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />')

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(content)
