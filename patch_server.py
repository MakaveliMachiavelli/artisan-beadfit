with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace("const app = express();\nconst PORT = 3000;", "const app = express();\napp.set('trust proxy', 1);\nconst PORT = 3000;")

with open('server.ts', 'w') as f:
    f.write(content)
