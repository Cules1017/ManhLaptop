import os
import json
import random
import time
import requests
import re
import urllib.parse
from itertools import product

categories_data = {
    1: { # Gaming Laptops
        "prefixes": ["Laptop Gaming", "Máy tính xách tay Gaming"],
        "cores": ["ASUS ROG Strix", "Acer Nitro 5", "MSI Katana", "Lenovo Legion 5", "Dell Alienware", "HP Omen"],
        "suffixes": ["RTX 3060 144Hz", "RTX 4050 165Hz", "RTX 3050Ti", "RTX 4070 240Hz", "Core i7 16GB 512GB", "Ryzen 7 16GB 1TB"]
    },
    2: { # Business Laptops
        "prefixes": ["Laptop Doanh nhân", "Laptop cao cấp"],
        "cores": ["ThinkPad X1 Carbon", "Dell Latitude", "HP EliteBook", "MacBook Pro M2", "MacBook Pro M3", "ASUS ExpertBook"],
        "suffixes": ["Core i7 16GB 512GB", "Core i5 16GB 256GB", "M2 16GB 512GB", "M3 Pro 18GB 512GB", "Siêu nhẹ 1kg", "Bảo mật vân tay"]
    },
    3: { # Student Laptops
        "prefixes": ["Laptop sinh viên", "Laptop văn phòng", "Máy tính xách tay"],
        "cores": ["ASUS Vivobook", "Dell Vostro", "HP Pavilion", "Lenovo IdeaPad", "Acer Aspire 5", "MSI Modern 14"],
        "suffixes": ["Core i5 8GB 512GB", "Core i3 8GB 256GB", "Ryzen 5 8GB 512GB", "Ryzen 7 16GB 512GB", "Màn hình 15.6 FHD", "Mỏng nhẹ giá rẻ"]
    },
    4: { # Ultrabooks
        "prefixes": ["Ultrabook", "Laptop mỏng nhẹ"],
        "cores": ["Dell XPS 13", "MacBook Air M2", "MacBook Air M1", "ASUS Zenbook", "LG Gram 14", "HP Envy 13"],
        "suffixes": ["Core i7 16GB 1TB", "Core i5 16GB 512GB", "M1 8GB 256GB", "M2 8GB 256GB", "OLED 2.8K", "Pin 20 tiếng"]
    },
    5: { # 2-in-1 Laptops
        "prefixes": ["Laptop 2-in-1", "Laptop cảm ứng"],
        "cores": ["Microsoft Surface Pro 9", "HP Spectre x360", "Dell XPS 13 2-in-1", "Lenovo Yoga 9i", "ASUS ROG Flow Z13"],
        "suffixes": ["Core i7 16GB 512GB", "Core i5 8GB 256GB", "Xoay gập 360 độ", "Màn hình cảm ứng", "Kèm bút cảm ứng", "OLED 4K"]
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
    selected = combos[:6] # 6 per category = 30 products
    for combo in selected:
        name = f"{combo[0]} {combo[1]} {combo[2]}"
        
        desc = f"{name} với thiết kế hiện đại, cấu hình mạnh mẽ, đáp ứng hoàn hảo nhu cầu làm việc và giải trí của bạn."
        price = random.randint(10, 50) * 1000000
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

filename = f"database/data/generated_laptops.json"
with open(filename, 'w', encoding='utf-8') as f:
    json.dump(products, f, ensure_ascii=False, indent=4)

print(f"Saved {filename}")
print(f"\nDone! Found images for {success_count}/{len(products)} products.")
