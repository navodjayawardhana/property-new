import requests, json, sys, time

API_URL = "http://localhost:8000/api"
TOKEN   = sys.argv[1] if len(sys.argv) > 1 else ""

with open("scraped_properties.json", encoding="utf-8") as f:
    properties = json.load(f)

print(f"Importing {len(properties)} properties...")
success = failed = 0

for i, prop in enumerate(properties, 1):
    data = {
        "title":         prop.get("title","Property"),
        "price":         str(prop.get("price") or 1000000),
        "address":       prop.get("address",""),
        "suburb":        prop.get("suburb","Colombo"),
        "district":      prop.get("district") or prop.get("suburb","Colombo"),
        "state":         prop.get("state","Western"),
        "postcode":      prop.get("postcode") or "00100",
        "country":       "Sri Lanka",
        "beds":          str(prop.get("beds",0)),
        "baths":         str(prop.get("baths",0)),
        "cars":          "0",
        "land_size":     prop.get("land_size",""),
        "property_type": prop.get("property_type","House"),
        "condition":     prop.get("condition","used"),
        "category":      "domestic",
        "listing_type":  prop.get("listing_type","buy"),
        "description":   prop.get("description",""),
        "agent_name":    "Lanka Property Web",
        "agency_name":   "Lanka Property Web",
        "is_featured":   "0",
        "status":        "active",
    }
    headers = {"Authorization": f"Bearer {TOKEN}", "Accept": "application/json"}
    try:
        r = requests.post(f"{API_URL}/admin/properties", data=data, headers=headers, timeout=15)
        if r.status_code in (200, 201):
            success += 1
            print(f"[{i}/{len(properties)}] OK  {prop['title'][:55]}")
        else:
            failed += 1
            print(f"[{i}/{len(properties)}] ERR {r.status_code}: {r.text[:80]}")
    except Exception as e:
        failed += 1
        print(f"[{i}/{len(properties)}] ERR {e}")
    time.sleep(0.2)

print(f"\nDone. Success: {success}  Failed: {failed}")
