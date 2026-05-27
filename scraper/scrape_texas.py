"""
Scrapes Texas landlord-tenant statutes from Justia and upserts them into Supabase.

Covers Texas Property Code chapters relevant to landlord-tenant law:
  91 – Provisions Generally Applicable to Landlords and Tenants
  92 – Residential Tenancies
  93 – Commercial Tenancies
  94 – Manufactured Home Tenancies

Usage:
  pip install -r requirements.txt
  cp ../.env.local.example .env        # fill in your Supabase credentials
  python scrape_texas.py
"""

import os
import time
import logging
from datetime import datetime, timezone
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

# Justia Texas Property Code chapter index URLs
CHAPTER_URLS: dict[str, str] = {
    "Chapter 91 – General Provisions": "https://law.justia.com/codes/texas/property-code/title-8/chapter-91/",
    "Chapter 92 – Residential Tenancies": "https://law.justia.com/codes/texas/property-code/title-8/chapter-92/",
    "Chapter 93 – Commercial Tenancies": "https://law.justia.com/codes/texas/property-code/title-8/chapter-93/",
    "Chapter 94 – Manufactured Home Tenancies": "https://law.justia.com/codes/texas/property-code/title-8/chapter-94/",
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; TenantLandlordAggregator/1.0; "
        "research scraper for educational purposes)"
    )
}

REQUEST_DELAY = 1.5  # seconds between requests — be a polite scraper


def get_soup(url: str) -> BeautifulSoup:
    resp = requests.get(url, headers=HEADERS, timeout=20)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def scrape_section(url: str) -> tuple[str, str]:
    """Return (title, body) for a single statute section page."""
    soup = get_soup(url)

    # Justia section pages have the statute text inside .codes-content
    content_div = soup.select_one(".codes-content")
    if not content_div:
        # Fallback: grab all paragraph text from the main article area
        content_div = soup.select_one("article") or soup.select_one("main")

    title_tag = soup.select_one("h1.codes-title") or soup.select_one("h1")
    title = title_tag.get_text(strip=True) if title_tag else "Untitled"

    # Strip nav / breadcrumb noise inside content_div
    for tag in (content_div or soup).select("nav, .breadcrumb, script, style"):
        tag.decompose()

    body = (content_div or soup).get_text(separator="\n", strip=True)
    return title, body


def section_number_from_url(url: str) -> str:
    """Extract a section identifier like '92.001' from the Justia URL path."""
    # URL pattern: .../chapter-92/section-92-001/
    slug = url.rstrip("/").split("/")[-1]          # e.g. "section-92-001"
    slug = slug.replace("section-", "")            # "92-001"
    return slug.replace("-", ".", 1)               # "92.001"


def scrape_chapter(chapter_label: str, index_url: str) -> list[dict]:
    """Scrape all section links from a chapter index page."""
    log.info("Fetching chapter index: %s", index_url)
    soup = get_soup(index_url)
    time.sleep(REQUEST_DELAY)

    # Section links live in a <ul> with class "codes-listing" or similar
    section_links = []
    for a in soup.select("a[href]"):
        href = a["href"]
        # Keep only links that look like section pages within this chapter
        if "/section-" in href and href.startswith("https://law.justia.com"):
            section_links.append(href)

    # De-duplicate while preserving order
    seen: set[str] = set()
    unique_links = []
    for link in section_links:
        if link not in seen:
            seen.add(link)
            unique_links.append(link)

    log.info("  Found %d sections", len(unique_links))
    records = []

    for url in unique_links:
        section_num = section_number_from_url(url)
        log.info("  Scraping § %s — %s", section_num, url)
        try:
            title, body = scrape_section(url)
            records.append(
                {
                    "state": "texas",
                    "chapter": chapter_label,
                    "section_number": section_num,
                    "title": title,
                    "body": body,
                    "url": url,
                    "scraped_at": datetime.now(timezone.utc).isoformat(),
                }
            )
        except Exception as exc:
            log.warning("  Failed § %s: %s", section_num, exc)
        time.sleep(REQUEST_DELAY)

    return records


def upsert_records(client: Client, records: list[dict]) -> None:
    if not records:
        return
    # Upsert in batches of 50 to stay within Supabase request-size limits
    batch_size = 50
    for i in range(0, len(records), batch_size):
        batch = records[i : i + batch_size]
        resp = (
            client.table("statutes")
            .upsert(batch, on_conflict="state,section_number")
            .execute()
        )
        log.info("Upserted batch %d-%d (%d rows)", i, i + len(batch) - 1, len(batch))


def main() -> None:
    client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    all_records: list[dict] = []

    for chapter_label, index_url in CHAPTER_URLS.items():
        records = scrape_chapter(chapter_label, index_url)
        all_records.extend(records)

    log.info("Total sections scraped: %d", len(all_records))
    upsert_records(client, all_records)
    log.info("Done.")


if __name__ == "__main__":
    main()
