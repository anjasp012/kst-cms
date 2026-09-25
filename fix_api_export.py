import re

with open("src/lib/api.js", "r") as f:
    text = f.read()

text = text.replace("async function request(url, options = {})", "export async function request(url, options = {})")

with open("src/lib/api.js", "w") as f:
    f.write(text)
