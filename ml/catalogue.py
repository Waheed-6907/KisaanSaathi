"""
KisanSaathi 90-Crop Master Catalogue Interface
Provides index mapping, slug resolution, and metadata lookup for ML pipelines.
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Any

# Resolve path to crop_catalogue_90.json
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
CATALOGUE_PATH = PROJECT_ROOT / "assets" / "data" / "crop_catalogue_90.json"


def _load_catalogue() -> Dict[str, Any]:
    if not CATALOGUE_PATH.exists():
        raise FileNotFoundError(f"Crop catalogue not found at {CATALOGUE_PATH}")
    with open(CATALOGUE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


_CATALOGUE_DATA = _load_catalogue()
CROPS_LIST = _CATALOGUE_DATA.get("crops", [])

if len(CROPS_LIST) != 90:
    raise ValueError(f"Expected exactly 90 crops in catalogue, found {len(CROPS_LIST)}")

# Build indices
CLASS_SLUGS: List[str] = [c["slug"] for c in CROPS_LIST]
SLUG_TO_IDX: Dict[str, int] = {slug: idx for idx, slug in enumerate(CLASS_SLUGS)}
IDX_TO_SLUG: Dict[int, str] = {idx: slug for idx, slug in enumerate(CLASS_SLUGS)}

ID_TO_CROP: Dict[str, Dict[str, Any]] = {c["id"]: c for c in CROPS_LIST}
SLUG_TO_CROP: Dict[str, Dict[str, Any]] = {c["slug"]: c for c in CROPS_LIST}

ALIAS_TO_SLUG: Dict[str, str] = {}
for c in CROPS_LIST:
    slug = c["slug"]
    ALIAS_TO_SLUG[slug.lower()] = slug
    ALIAS_TO_SLUG[c["canonicalName"].lower()] = slug
    if "aliases" in c:
        for alias in c["aliases"]:
            ALIAS_TO_SLUG[alias.lower().strip()] = slug


def get_total_classes() -> int:
    """Returns total number of supported crop classes (90)."""
    return len(CROPS_LIST)


def get_all_crops() -> List[Dict[str, Any]]:
    """Returns list of all 90 crop definitions."""
    return CROPS_LIST


def get_crop_by_index(idx: int) -> Optional[Dict[str, Any]]:
    """Get crop definition by class index (0-89)."""
    slug = IDX_TO_SLUG.get(idx)
    return SLUG_TO_CROP.get(slug) if slug else None


def get_crop_by_slug(slug: str) -> Optional[Dict[str, Any]]:
    """Get crop definition by slug."""
    return SLUG_TO_CROP.get(slug)


def get_crop_by_id(crop_id: str) -> Optional[Dict[str, Any]]:
    """Get crop definition by unique ID."""
    return ID_TO_CROP.get(crop_id)


def match_crop_name(name: str) -> Optional[Dict[str, Any]]:
    """Fuzzy match crop name against aliases, canonical names, and slugs."""
    if not name:
        return None
    cleaned = name.lower().strip()
    slug = ALIAS_TO_SLUG.get(cleaned)
    if slug:
        return SLUG_TO_CROP.get(slug)
    # Check partial match
    for alias, s in ALIAS_TO_SLUG.items():
        if alias in cleaned or cleaned in alias:
            return SLUG_TO_CROP.get(s)
    return None


def get_crops_by_category(category: str) -> List[Dict[str, Any]]:
    """Get crops filtered by category (fruit, vegetable, grain_dry_commodity)."""
    return [c for c in CROPS_LIST if c.get("category") == category]


if __name__ == "__main__":
    print(f"Loaded {get_total_classes()} crops from catalogue.")
    print("Fruits:", len(get_crops_by_category("fruit")))
    print("Vegetables:", len(get_crops_by_category("vegetable")))
    print("Grains & Commodities:", len(get_crops_by_category("grain_dry_commodity")))
