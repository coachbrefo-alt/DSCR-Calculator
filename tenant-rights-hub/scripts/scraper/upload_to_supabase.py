"""
Reads data/statutes_raw.json and upserts records into the Supabase statutes table.

Usage:
    python upload_to_supabase.py

Env vars required (in .env or exported):
    NEXT_PUBLIC_SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY
"""

import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
log = logging.getLogger(__name__)

DATA_FILE = Path(__file__).parent.parent.parent / "data" / "statutes_raw.json"
BATCH_SIZE = 50


def main() -> None:
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_key:
        print(
            "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n"
            "Copy .env.local.example to .env and fill in your credentials."
        )
        sys.exit(1)

    if not DATA_FILE.exists():
        print(f"Error: {DATA_FILE} not found. Run main.py first to scrape data.")
        sys.exit(1)

    client = create_client(supabase_url, service_key)

    with open(DATA_FILE) as f:
        records: list[dict] = json.load(f)

    now = datetime.now(timezone.utc).isoformat()
    for r in records:
        r["last_scraped"] = now

    total = len(records)
    upserted = 0
    errors = 0

    print(f"Uploading {total} records in batches of {BATCH_SIZE}…\n")

    for i in range(0, total, BATCH_SIZE):
        batch = records[i : i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        try:
            resp = (
                client.table("statutes")
                .upsert(batch, on_conflict="state_code,section_number")
                .execute()
            )
            count = len(resp.data) if resp.data else len(batch)
            upserted += count
            print(f"  Batch {batch_num}: {count} rows upserted")
        except Exception as exc:
            errors += len(batch)
            print(f"  Batch {batch_num} ERROR: {exc}")

    print(f"\n── Summary ──────────────────────────")
    print(f"  Total records : {total}")
    print(f"  Upserted      : {upserted}")
    print(f"  Errors        : {errors}")
    print(f"─────────────────────────────────────")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    main()
