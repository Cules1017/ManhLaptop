import os
import json
import random
import time
import requests
import re
import urllib.parse
from itertools import product

categories_data = {
    6: { # MacBooks
        "prefixes": ["Apple MacBook", "MacBook"],
        "cores": ["Air M1", "Air M2", "Pro M2", "Pro M3", "Pro M3 Max", "Pro 14-inch", "Pro 16-inch"],
        "suffixes": ["8GB 256GB", "16GB 512GB", "18GB 512GB", "36GB 1TB", "Màn hình Liquid Retina", "Chính hãng VN/A"]
    },
    7: { # Workstation Laptops
        "prefixes": ["Laptop Đồ hoạ", "Máy trạm Workstation"],
        "cores": ["Dell Precision", "HP ZBook", "Lenovo ThinkPad P-Series", "ASUS ProArt Studiobook", "MSI Creator"],
        "suffixes": ["Xeon 32GB 1TB", "Core i9 64GB 2TB", "RTX 4000 Ada", "Quadro RTX 3000", "Màn hình 4K", "Chuyên đồ hoạ 3D"]
    },
    8: { # Budget Laptops
        "prefixes": ["Laptop giá rẻ", "Laptop phổ thông"],
        "cores": ["Lenovo IdeaPad 1", "HP 14s", "Dell Inspiron 3520", "ASUS Vivobook Go", "Acer Aspire 3"],
        "suffixes": ["Core i3 8GB 256GB", "Celeron 4GB 128GB", "Pentium 8GB 256GB", "Ryzen 3 8GB 256GB", "Phù hợp học tập", "Dưới 10 triệu"]
    }
}

def search_bing_image(query):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(query)}&form=HDRSC3&first=1"
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        matches = re.findall(r'murl&quot;:&quot;(http.*?)&quot;', resp.text)
        if matches:
            unique = list(dict.fromkeys(matches))
            return unique[:4]
    except Exception as e:
        print(f"Bing error: {e}")
    return []

products = []
for cat_id, data in categories_data.items():
    combos = list(product(data["prefixes"], data["cores"], data["suffixes"]))
    random.shuffle(combos)
    selected = combos[:10] # 10 products per category = 30 products
    for combo in selected:
        name = f"{combo[0]} {combo[1]} {combo[2]}"
        
        desc = f"{name} với thiết kế hiện đại, cấu hình mạnh mẽ, đáp ứng hoàn hảo nhu cầu làm việc và giải trí của bạn."
        price = random.randint(5, 80) * 1000000
        discount = random.choice([0, 5, 10, 15, 20])
        
        products.append({
            "name": name,
            "description": desc,
            "price": price,
            "discount": discount if discount > 0 else None,
            "quantity": random.randint(5, 50),
            "category_id": cat_id,
            "image": "",
            "gallery": [],
        })

print(f"Generated {len(products)} products to process...")

success_count = 0
for idx, item in enumerate(products):
    real_idx = idx + 1
    name = item['name']
    print(f"[{real_idx}/{len(products)}] Searching image for: {name}...")
    
    # Extract core part of the name for better image search results
    core_name = name.split(" ")[1:5]
    search_query = " ".join(core_name) + " laptop official"
    urls = search_bing_image(search_query)
    
    if urls and len(urls) > 0:
        item['image'] = urls[0]
        if len(urls) > 1:
            item['gallery'] = urls[1:]
        success_count += 1
        print(f"  -> Found {len(urls)} images")
    else:
        print("  -> Not found.")
        
    time.sleep(0.5)

os.makedirs('database/data', exist_ok=True)

filename = f"database/data/generated_laptops_more.json"
with open(filename, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=4)

print(f"Saved {filename}")
print(f"\nDone! Found images for {success_count}/{len(products)} products.")
