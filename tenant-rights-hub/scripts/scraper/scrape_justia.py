"""
Justia.com landlord-tenant statute scraper.

Full implementation: Texas, California, Florida, New York, Georgia
Stubbed (TODO):      All other 45 states

Each state scraper returns a list of dicts matching the `statutes` table schema.
"""

import re
import time
import logging
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import requests
from bs4 import BeautifulSoup

log = logging.getLogger(__name__)

REQUEST_DELAY = 2.0  # seconds between HTTP requests
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; TenantRightsHub/1.0; "
        "+https://tenantRightshub.com; public legal research aggregator)"
    )
}

_robots_cache: dict[str, RobotFileParser] = {}


# ── Utilities ─────────────────────────────────────────────────

def _robots_allowed(url: str) -> bool:
    parsed = urlparse(url)
    base = f"{parsed.scheme}://{parsed.netloc}"
    if base not in _robots_cache:
        rp = RobotFileParser()
        rp.set_url(f"{base}/robots.txt")
        try:
            rp.read()
        except Exception:
            return True
        _robots_cache[base] = rp
    return _robots_cache[base].can_fetch(HEADERS["User-Agent"], url)


def _get_html(url: str) -> str | None:
    if not _robots_allowed(url):
        log.warning("Blocked by robots.txt: %s", url)
        return None
    try:
        resp = requests.get(url, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        return resp.text
    except Exception as exc:
        log.error("Fetch failed for %s: %s", url, exc)
        return None


def _soup(html: str) -> BeautifulSoup:
    return BeautifulSoup(html, "html.parser")


def _clean(text: str) -> str:
    lines = [ln.strip() for ln in text.splitlines()]
    return "\n".join(ln for ln in lines if ln)


def _section_links(index_url: str, pattern: str) -> list[str]:
    """Return de-duplicated section URLs from a chapter index page."""
    html = _get_html(index_url)
    if not html:
        return []
    time.sleep(REQUEST_DELAY)
    seen: set[str] = set()
    links: list[str] = []
    for a in _soup(html).select("a[href]"):
        href: str = a["href"]
        if not href.startswith("http"):
            href = "https://law.justia.com" + href
        if re.search(pattern, href) and href not in seen:
            links.append(href)
            seen.add(href)
    return links


def _scrape_section(url: str, state: str, state_code: str, chapter: str) -> dict | None:
    """Scrape one Justia statute section page and return a record dict."""
    html = _get_html(url)
    if not html:
        return None
    time.sleep(REQUEST_DELAY)

    s = _soup(html)

    # Derive section number from URL slug (e.g. "section-92-001" → "92.001")
    slug = url.rstrip("/").split("/")[-1]
    section_number = re.sub(r"^section-", "", slug).replace("-", ".", 1)

    # Title from <h1>
    h1 = s.select_one("h1")
    raw_title = h1.get_text(strip=True) if h1 else section_number
    # Strip leading numeric prefix duplicated in title
    section_title = re.sub(r"^[\d\.\s:\-]+", "", raw_title).strip() or raw_title

    # Body text from .codes-content or fallback to article/main
    body_div = (
        s.select_one(".codes-content")
        or s.select_one("article")
        or s.select_one("main")
    )
    if body_div:
        for noise in body_div.select("nav,.breadcrumb,script,style,ins,.ad-slot"):
            noise.decompose()
        full_text = _clean(body_div.get_text(separator="\n"))
    else:
        full_text = ""

    if not full_text:
        log.warning("No text extracted from %s", url)
        return None

    return {
        "state": state,
        "state_code": state_code,
        "statute_title": f"{state} Landlord-Tenant Law",
        "chapter": chapter,
        "section_number": section_number,
        "section_title": section_title,
        "full_text": full_text,
        "source_url": url,
    }


def _scrape_chapters(chapters: dict[str, str], state: str, state_code: str, pattern: str) -> list[dict]:
    results: list[dict] = []
    for chapter_label, index_url in chapters.items():
        log.info("[%s] Index: %s", state_code, index_url)
        links = _section_links(index_url, pattern)
        log.info("[%s] %d sections found in %s", state_code, len(links), chapter_label)
        for url in links:
            record = _scrape_section(url, state, state_code, chapter_label)
            if record:
                results.append(record)
    return results


# ── Fully-implemented state scrapers ──────────────────────────

def scrape_texas() -> list[dict]:
    """Texas Property Code, Title 8 — Chapters 91-94."""
    return _scrape_chapters(
        chapters={
            "Chapter 91 – General Provisions":
                "https://law.justia.com/codes/texas/property-code/title-8/chapter-91/",
            "Chapter 92 – Residential Tenancies":
                "https://law.justia.com/codes/texas/property-code/title-8/chapter-92/",
            "Chapter 93 – Commercial Tenancies":
                "https://law.justia.com/codes/texas/property-code/title-8/chapter-93/",
            "Chapter 94 – Manufactured Home Tenancies":
                "https://law.justia.com/codes/texas/property-code/title-8/chapter-94/",
        },
        state="Texas",
        state_code="TX",
        pattern=r"law\.justia\.com/codes/texas/property-code/title-8/chapter-9[1-4]/section-",
    )


def scrape_california() -> list[dict]:
    """California Civil Code — Residential tenancy chapters."""
    return _scrape_chapters(
        chapters={
            "Civil Code §§ 1940–1954.1 – Hiring of Real Property":
                "https://law.justia.com/codes/california/civil-code/division-3/part-4/title-5/chapter-2/",
            "Civil Code §§ 1954.2–1954.95 – Tenant Protection Act of 2019":
                "https://law.justia.com/codes/california/civil-code/division-3/part-4/title-5/chapter-2-5/",
        },
        state="California",
        state_code="CA",
        pattern=r"law\.justia\.com/codes/california/civil-code/division-3/part-4/title-5/chapter-2",
    )


def scrape_florida() -> list[dict]:
    """Florida Statutes Chapter 83 — Landlord and Tenant."""
    return _scrape_chapters(
        chapters={
            "Chapter 83, Part I – Non-Residential Tenancies":
                "https://law.justia.com/codes/florida/chapter-83/part-i/",
            "Chapter 83, Part II – Residential Tenancies":
                "https://law.justia.com/codes/florida/chapter-83/part-ii/",
        },
        state="Florida",
        state_code="FL",
        pattern=r"law\.justia\.com/codes/florida/chapter-83/section-",
    )


def scrape_new_york() -> list[dict]:
    """New York Real Property Law, Article 7 — Landlord and Tenant."""
    return _scrape_chapters(
        chapters={
            "Real Property Law, Article 7 – Landlord and Tenant":
                "https://law.justia.com/codes/new-york/real-property-law/article-7/",
        },
        state="New York",
        state_code="NY",
        pattern=r"law\.justia\.com/codes/new-york/real-property-law/article-7/section-",
    )


def scrape_georgia() -> list[dict]:
    """Georgia Code, Title 44, Chapter 7 — Landlord and Tenant."""
    return _scrape_chapters(
        chapters={
            "Title 44, Chapter 7 – Landlord and Tenant":
                "https://law.justia.com/codes/georgia/title-44/chapter-7/",
        },
        state="Georgia",
        state_code="GA",
        pattern=r"law\.justia\.com/codes/georgia/title-44/chapter-7/section-",
    )


# ── Stubs for remaining 45 states ────────────────────────────

def _stub(state: str, code: str) -> list[dict]:
    # TODO: identify the Justia chapter URL(s) for {state} landlord-tenant law
    # and replace this stub with a _scrape_chapters() call.
    log.info("[%s] Scraper not yet implemented — skipping", code)
    return []

def scrape_alabama():       return _stub("Alabama", "AL")
def scrape_alaska():        return _stub("Alaska", "AK")
def scrape_arizona():       return _stub("Arizona", "AZ")
def scrape_arkansas():      return _stub("Arkansas", "AR")
def scrape_colorado():      return _stub("Colorado", "CO")
def scrape_connecticut():   return _stub("Connecticut", "CT")
def scrape_delaware():      return _stub("Delaware", "DE")
def scrape_hawaii():        return _stub("Hawaii", "HI")
def scrape_idaho():         return _stub("Idaho", "ID")
def scrape_illinois():      return _stub("Illinois", "IL")
def scrape_indiana():       return _stub("Indiana", "IN")
def scrape_iowa():          return _stub("Iowa", "IA")
def scrape_kansas():        return _stub("Kansas", "KS")
def scrape_kentucky():      return _stub("Kentucky", "KY")
def scrape_louisiana():     return _stub("Louisiana", "LA")
def scrape_maine():         return _stub("Maine", "ME")
def scrape_maryland():      return _stub("Maryland", "MD")
def scrape_massachusetts(): return _stub("Massachusetts", "MA")
def scrape_michigan():      return _stub("Michigan", "MI")
def scrape_minnesota():     return _stub("Minnesota", "MN")
def scrape_mississippi():   return _stub("Mississippi", "MS")
def scrape_missouri():      return _stub("Missouri", "MO")
def scrape_montana():       return _stub("Montana", "MT")
def scrape_nebraska():      return _stub("Nebraska", "NE")
def scrape_nevada():        return _stub("Nevada", "NV")
def scrape_new_hampshire(): return _stub("New Hampshire", "NH")
def scrape_new_jersey():    return _stub("New Jersey", "NJ")
def scrape_new_mexico():    return _stub("New Mexico", "NM")
def scrape_north_carolina():return _stub("North Carolina", "NC")
def scrape_north_dakota():  return _stub("North Dakota", "ND")
def scrape_ohio():          return _stub("Ohio", "OH")
def scrape_oklahoma():      return _stub("Oklahoma", "OK")
def scrape_oregon():        return _stub("Oregon", "OR")
def scrape_pennsylvania():  return _stub("Pennsylvania", "PA")
def scrape_rhode_island():  return _stub("Rhode Island", "RI")
def scrape_south_carolina():return _stub("South Carolina", "SC")
def scrape_south_dakota():  return _stub("South Dakota", "SD")
def scrape_tennessee():     return _stub("Tennessee", "TN")
def scrape_utah():          return _stub("Utah", "UT")
def scrape_vermont():       return _stub("Vermont", "VT")
def scrape_virginia():      return _stub("Virginia", "VA")
def scrape_washington():    return _stub("Washington", "WA")
def scrape_west_virginia(): return _stub("West Virginia", "WV")
def scrape_wisconsin():     return _stub("Wisconsin", "WI")
def scrape_wyoming():       return _stub("Wyoming", "WY")


# Registry — used by main.py
STATE_SCRAPERS: dict[str, callable] = {
    "TX": scrape_texas,
    "CA": scrape_california,
    "FL": scrape_florida,
    "NY": scrape_new_york,
    "GA": scrape_georgia,
    "AL": scrape_alabama,
    "AK": scrape_alaska,
    "AZ": scrape_arizona,
    "AR": scrape_arkansas,
    "CO": scrape_colorado,
    "CT": scrape_connecticut,
    "DE": scrape_delaware,
    "HI": scrape_hawaii,
    "ID": scrape_idaho,
    "IL": scrape_illinois,
    "IN": scrape_indiana,
    "IA": scrape_iowa,
    "KS": scrape_kansas,
    "KY": scrape_kentucky,
    "LA": scrape_louisiana,
    "ME": scrape_maine,
    "MD": scrape_maryland,
    "MA": scrape_massachusetts,
    "MI": scrape_michigan,
    "MN": scrape_minnesota,
    "MS": scrape_mississippi,
    "MO": scrape_missouri,
    "MT": scrape_montana,
    "NE": scrape_nebraska,
    "NV": scrape_nevada,
    "NH": scrape_new_hampshire,
    "NJ": scrape_new_jersey,
    "NM": scrape_new_mexico,
    "NC": scrape_north_carolina,
    "ND": scrape_north_dakota,
    "OH": scrape_ohio,
    "OK": scrape_oklahoma,
    "OR": scrape_oregon,
    "PA": scrape_pennsylvania,
    "RI": scrape_rhode_island,
    "SC": scrape_south_carolina,
    "SD": scrape_south_dakota,
    "TN": scrape_tennessee,
    "UT": scrape_utah,
    "VT": scrape_vermont,
    "VA": scrape_virginia,
    "WA": scrape_washington,
    "WV": scrape_west_virginia,
    "WI": scrape_wisconsin,
    "WY": scrape_wyoming,
}
