"""
Lanka Property Web Scraper
Scrapes property listings from lankapropertyweb.com and imports to Greenbrick API
Usage: python lpw_scraper.py
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
import sys
from urllib.parse import urljoin

BASE_URL = "https://www.lankapropertyweb.com"
API_URL  = "http://localhost:8000/api"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# ── Listing pages to scrape ────────────────────────────────────────────────────
LISTING_PAGES = [
    {"url": "/sale/index.php",    "listing_type": "buy"},
    {"url": "/rentals/index.php", "listing_type": "rent"},
]

# ── Pagination: ?pg=2, ?pg=3 ... ──────────────────────────────────────────────
MAX_PAGES     = 5   # pages per section (12 listings/page → ~60 per section)
DELAY_BETWEEN = 1.5 # seconds between requests (be polite)


def clean(text: str) -> str:
    return re.sub(r'\s+', ' ', text or '').strip()


def parse_price(text: str) -> int:
    """Convert 'Rs. 88M upwards' → 88000000"""
    text = clean(text)
    m = re.search(r'[\d,.]+\s*M', text, re.I)
    if m:
        num = float(re.sub(r'[^\d.]', '', m.group()))
        return int(num * 1_000_000)
    m = re.search(r'[\d,.]+\s*K', text, re.I)
    if m:
        num = float(re.sub(r'[^\d.]', '', m.group()))
        return int(num * 1_000)
    m = re.search(r'[\d,]+', text.replace(',', ''))
    if m:
        return int(re.sub(r'[^\d]', '', m.group()))
    return 0


def parse_listing_card(article, listing_type: str) -> dict | None:
    try:
        # URL
        header = article.select_one('a.listing-header')
        if not header:
            return None
        url = urljoin(BASE_URL, header.get('href', ''))

        # Location (city) — top right corner of card
        location_tag = article.select_one('.listing-location, .city-name, [class*="city"]')
        city = clean(location_tag.text) if location_tag else ""
        # Also check header text for city (it's in the link text)
        if not city:
            header_text = clean(header.text)
            # Header text pattern: "8 Pita Kotte Hot Deal"
            parts = re.sub(r'\d+', '', header_text).strip().split()
            city = parts[0] if parts else ""

        # Summary section: beds / sqft / type
        summary = article.select_one('.listing-summery')
        beds = baths = 0
        sqft = ""
        prop_type = "House"

        if summary:
            beds_el = summary.select_one('[class*="bed"], .beds')
            baths_el = summary.select_one('[class*="bath"], .baths')
            sqft_el  = summary.select_one('[class*="sqft"], [class*="area"], .size')
            type_el  = summary.select_one('.badge, [class*="type"], span.type')

            if beds_el:
                m = re.search(r'\d+', clean(beds_el.text))
                beds = int(m.group()) if m else 0
            if baths_el:
                m = re.search(r'\d+', clean(baths_el.text))
                baths = int(m.group()) if m else 0
            if sqft_el:
                sqft = clean(sqft_el.text)
            if type_el:
                prop_type = clean(type_el.text)

            # Fallback: parse summary text directly
            if not beds:
                m = re.search(r'(\d+)\s*(?:bed|br)', summary.text, re.I)
                beds = int(m.group(1)) if m else 0
            if not sqft:
                m = re.search(r'([\d,]+)\s*sqft', summary.text, re.I)
                sqft = m.group(0) if m else ""
            if not prop_type or prop_type == "House":
                for t in ['Apartment', 'Villa', 'House', 'Land', 'Commercial', 'Bungalow']:
                    if t.lower() in summary.text.lower():
                        prop_type = t
                        break

        # Body: price + title + address + description
        body = article.select_one('.listing-body')
        price = 0
        title = ""
        address = ""
        description = ""

        if body:
            price_el = body.select_one('.price, [class*="price"]')
            title_el = body.select_one('.listing-title, a[href*="property_details"], h2, h3')
            addr_el  = body.select_one('.location, [class*="location"], address')
            desc_el  = body.select_one('p, .description, [class*="desc"]')

            if price_el:
                price = parse_price(price_el.text)
            if title_el:
                title = clean(title_el.text)
            if addr_el:
                address = clean(addr_el.text)
            if desc_el:
                description = clean(desc_el.text)

            # Fallback title from URL
            if not title and url:
                m = re.search(r'property_details-(\d+)', url)
                title = f"Property {m.group(1)}" if m else "Property Listing"

        # Condition (footer)
        footer = article.select_one('.listing-footer')
        condition = "used"
        if footer:
            footer_text = footer.text.lower()
            if 'new' in footer_text or 'newly' in footer_text:
                condition = "new"

        # State from city
        state_map = {
            "colombo": "Western", "nugegoda": "Western", "battaramulla": "Western",
            "wattala": "Western", "dehiwala": "Western", "mount lavinia": "Western",
            "thalawathugoda": "Western", "kotte": "Western", "pita kotte": "Western",
            "malabe": "Western", "kaduwela": "Western", "homagama": "Western",
            "panadura": "Western", "negombo": "Western", "ja-ela": "Western",
            "kandy": "Central", "gampola": "Central", "matale": "Central",
            "galle": "Southern", "matara": "Southern", "hambantota": "Southern",
            "jaffna": "Northern", "trincomalee": "Eastern", "batticaloa": "Eastern",
            "kurunegala": "North Western", "anuradhapura": "North Central",
            "ratnapura": "Sabaragamuwa", "badulla": "Uva", "nuwara eliya": "Central",
        }
        state = "Western"
        city_lower = city.lower()
        for key, val in state_map.items():
            if key in city_lower:
                state = val
                break

        # Skip if no price or title
        if not price and not title:
            return None

        return {
            "source_url": url,
            "title":        title or f"{beds}BR {prop_type} in {city}",
            "price":        price,
            "address":      address or city,
            "suburb":       city,
            "district":     city,
            "state":        state,
            "postcode":     "",
            "beds":         beds,
            "baths":        baths,
            "land_size":    sqft,
            "property_type": prop_type,
            "condition":    condition,
            "category":     "domestic",
            "listing_type": listing_type,
            "description":  description or title,
            "agent_name":   "Lanka Property Web",
            "agency_name":  "Lanka Property Web",
            "is_featured":  False,
            "status":       "active",
        }
    except Exception as e:
        print(f"  ⚠ Card parse error: {e}")
        return None


def scrape_page(url: str, listing_type: str) -> list[dict]:
    print(f"  Fetching {url} ...")
    try:
        r = requests.get(url, headers=HEADERS, timeout=15, verify=False)
        r.raise_for_status()
    except Exception as e:
        print(f"  Request failed: {e}")
        return []

    soup = BeautifulSoup(r.text, 'html.parser')
    articles = soup.select('article.listing-item')
    print(f"  Found {len(articles)} listing cards")

    results = []
    for art in articles:
        item = parse_listing_card(art, listing_type)
        if item:
            results.append(item)

    return results


def get_next_page_url(soup, current_url: str) -> str | None:
    """Find next page URL from pagination"""
    next_link = soup.select_one('a[rel="next"], .pagination .next a, li.next a')
    if next_link:
        return urljoin(BASE_URL, next_link.get('href', ''))

    # Try ?pg= pattern
    m = re.search(r'[?&]pg=(\d+)', current_url)
    if m:
        pg = int(m.group(1)) + 1
        return re.sub(r'([?&])pg=\d+', f'\\1pg={pg}', current_url)

    # First page — try adding pg=2
    if '?' not in current_url:
        return current_url + '?pg=2'
    return None


def scrape_all() -> list[dict]:
    all_data = []

    for section in LISTING_PAGES:
        print(f"\n{'='*50}")
        print(f"Scraping: {section['url']} ({section['listing_type']})")
        print(f"{'='*50}")

        url = urljoin(BASE_URL, section['url'])
        pages_scraped = 0

        while url and pages_scraped < MAX_PAGES:
            items = scrape_page(url, section['listing_type'])
            all_data.extend(items)
            print(f"  → {len(items)} properties extracted (total so far: {len(all_data)})")
            pages_scraped += 1

            if pages_scraped >= MAX_PAGES:
                break

            # Get next page
            r = requests.get(url, headers=HEADERS, timeout=15, verify=False)
            soup = BeautifulSoup(r.text, 'html.parser')
            url = get_next_page_url(soup, url)
            if url:
                print(f"  Next page: {url}")
                time.sleep(DELAY_BETWEEN)
            else:
                break

    print(f"\n✓ Total scraped: {len(all_data)} properties")
    return all_data


def import_to_api(properties: list[dict], token: str) -> None:
    """POST properties to Greenbrick Laravel API"""
    print(f"\nImporting {len(properties)} properties to API...")
    success = 0
    failed  = 0

    for i, prop in enumerate(properties, 1):
        # Map to API FormData fields
        data = {
            "title":         prop["title"],
            "price":         str(prop["price"]) if prop["price"] else "1000000",
            "address":       prop["address"],
            "suburb":        prop["suburb"],
            "district":      prop["district"] or prop["suburb"],
            "state":         prop["state"],
            "postcode":      prop["postcode"] or "00100",
            "country":       "Sri Lanka",
            "beds":          str(prop["beds"]),
            "baths":         str(prop["baths"]),
            "cars":          "0",
            "land_size":     prop["land_size"],
            "property_type": prop["property_type"],
            "condition":     prop["condition"],
            "category":      prop["category"],
            "listing_type":  prop["listing_type"],
            "description":   prop["description"],
            "agent_name":    prop["agent_name"],
            "agency_name":   prop["agency_name"],
            "is_featured":   "0",
            "status":        "active",
        }

        headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}

        try:
            r = requests.post(f"{API_URL}/admin/properties", data=data, headers=headers, timeout=15)
            if r.status_code in (200, 201):
                success += 1
                print(f"  [{i}/{len(properties)}] OK {prop['title'][:50]}")
            else:
                failed += 1
                print(f"  [{i}/{len(properties)}] ✗ {r.status_code}: {r.text[:80]}")
        except Exception as e:
            failed += 1
            print(f"  [{i}/{len(properties)}] ✗ Error: {e}")

        time.sleep(0.3)

    print(f"\n✓ Success: {success}  ✗ Failed: {failed}")


def main():
    print("Lanka Property Web Scraper")
    print("=" * 50)

    # Step 1: Scrape
    properties = scrape_all()

    # Step 2: Save to JSON
    output_file = "scraped_properties.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(properties, f, ensure_ascii=False, indent=2)
    print(f"\n✓ Saved to {output_file}")

    # Step 3: Import to API (optional)
    if len(sys.argv) > 1:
        token = sys.argv[1]
        print(f"\nAPI token provided — importing to {API_URL}...")
        import_to_api(properties, token)
    else:
        print(f"\nTo import to API: python lpw_scraper.py <your_admin_token>")
        print("Or load scraped_properties.json manually.")


if __name__ == "__main__":
    main()
