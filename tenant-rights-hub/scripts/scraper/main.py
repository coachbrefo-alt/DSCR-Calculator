"""
TenantRightsHub statute scraper — main entry point.

Usage:
    python main.py                        # scrape all implemented states
    python main.py --states TX CA FL NY GA   # scrape specific states only
    python main.py --upload               # skip scraping; upload existing JSON to Supabase
    python main.py --states TX --upload   # scrape TX then upload immediately

Setup:
    pip install -r requirements.txt
    playwright install chromium           # only needed for JS-rendered fallback pages
    cp ../../.env.local.example .env      # fill in Supabase credentials
"""

import argparse
import json
import logging
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("scraper.log"),
    ],
)
log = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent.parent.parent / "data"
OUTPUT_FILE = DATA_DIR / "statutes_raw.json"


def run_scraper(state_codes: list[str]) -> None:
    from scrape_justia import STATE_SCRAPERS

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    all_records: list[dict] = []

    for code in state_codes:
        fn = STATE_SCRAPERS.get(code.upper())
        if not fn:
            log.warning("No scraper registered for: %s — skipping", code)
            continue
        log.info("═══ Scraping %s ═══", code.upper())
        records = fn()
        log.info("═══ %s: %d records ═══", code.upper(), len(records))
        all_records.extend(records)

    log.info("Total records scraped: %d", len(all_records))

    with open(OUTPUT_FILE, "w") as f:
        json.dump(all_records, f, indent=2, ensure_ascii=False)

    log.info("Saved → %s", OUTPUT_FILE)


def run_upload() -> None:
    from upload_to_supabase import main as do_upload
    do_upload()


def main() -> None:
    from scrape_justia import STATE_SCRAPERS

    parser = argparse.ArgumentParser(description="TenantRightsHub statute scraper")
    parser.add_argument(
        "--states", nargs="+", metavar="CODE",
        help="State codes to scrape (e.g. TX CA FL). Default: all implemented states.",
    )
    parser.add_argument(
        "--upload", action="store_true",
        help="Upload existing data/statutes_raw.json to Supabase after scraping.",
    )
    args = parser.parse_args()

    state_codes = args.states or list(STATE_SCRAPERS.keys())

    # If --upload only (no states arg implies no new scrape when combined with --upload alone)
    if args.upload and not args.states:
        run_upload()
        return

    run_scraper(state_codes)

    if args.upload:
        run_upload()


if __name__ == "__main__":
    main()
