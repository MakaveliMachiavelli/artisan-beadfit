with open('src/pages/StudioPage.tsx', 'r') as f:
    text = f.read()

text = text.replace("                />\n          </div>", "                />\n              </>\n            )}\n          </div>")

with open('src/pages/StudioPage.tsx', 'w') as f:
    f.write(text)
