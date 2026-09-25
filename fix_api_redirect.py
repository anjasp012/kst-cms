import re

with open("src/lib/api.js", "r") as f:
    text = f.read()

# Add a function to handle force logout
if "function forceLogout()" not in text:
    force_logout = """function forceLogout() {
  clearTokens();
  window.location.href = '/';
}"""
    text = text.replace("function authHeaders() {", force_logout + "\n\nfunction authHeaders() {")

# Replace clearTokens() in catch block with forceLogout()
text = re.sub(r'\} else \{\n\s*clearTokens\(\);\n\s*\}', '} else {\n        forceLogout();\n      }', text)
text = re.sub(r'\} catch \(e\) \{\n\s*clearTokens\(\);\n\s*\}', '} catch (e) {\n      forceLogout();\n    }', text)

# Add 401 check right before throwing Error in request()
old_error_throw = """  if (!res.ok) {
    let errorDetail = 'Permintaan gagal';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail?.responseMessage || errJson.detail || errJson.responseMessage || 'Terjadi kesalahan pada server';
    } catch (_) { }
    throw new Error(errorDetail);
  }"""

new_error_throw = """  if (!res.ok) {
    if (res.status === 401) {
      forceLogout();
      throw new Error('Sesi telah berakhir, silakan login kembali.');
    }
    let errorDetail = 'Permintaan gagal';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail?.responseMessage || errJson.detail || errJson.responseMessage || 'Terjadi kesalahan pada server';
    } catch (_) { }
    throw new Error(errorDetail);
  }"""

text = text.replace(old_error_throw, new_error_throw)

with open("src/lib/api.js", "w") as f:
    f.write(text)
