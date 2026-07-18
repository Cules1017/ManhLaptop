import re
import zlib
import base64
import sys

def kroki_encode(text):
    compressed = zlib.compress(text.encode('utf-8'), level=9)
    # Kroki uses URL-safe base64
    return base64.urlsafe_b64encode(compressed).decode('utf-8')

def replace_mermaid(match):
    code = match.group(1).strip()
    encoded = kroki_encode(code)
    url = f"https://kroki.io/mermaid/png/{encoded}"
    return f"![Sơ đồ]({url})"

if __name__ == "__main__":
    with open('/Users/nguyennghia/.gemini/antigravity/brain/d75aad11-6161-482f-ae1c-bddc3ab77534/Bao_Cao_Khoa_Luan.md', 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = re.sub(r'```mermaid\n(.*?)```', replace_mermaid, content, flags=re.DOTALL)

    with open('Bao_Cao_Khoa_Luan_with_images.md', 'w', encoding='utf-8') as f:
        f.write(new_content)
