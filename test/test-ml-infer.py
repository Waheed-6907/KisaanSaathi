"""
Verification script for ml/infer.py on valid produce, OOD items, and blurry images.
"""
import sys
from pathlib import Path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from ml.infer import run_inference

def create_sample_produce():
    img = Image.new("RGB", (224, 224), (240, 240, 240))
    draw = ImageDraw.Draw(img)
    # Ripe red tomato
    draw.ellipse([40, 40, 184, 184], fill=(225, 45, 30), outline=(150, 20, 10))
    # Green calyx stem
    draw.polygon([(112, 30), (100, 50), (124, 50)], fill=(30, 140, 30))
    return img

def create_sample_document():
    img = Image.new("RGB", (224, 224), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.rectangle([30, 20, 194, 204], fill=(255, 255, 255), outline=(120, 120, 120))
    for y in range(40, 190, 12):
        draw.line([45, y, 179, y], fill=(80, 80, 80), width=2)
    return img

def create_sample_blurry():
    img = create_sample_produce()
    # Apply severe Gaussian blur
    for _ in range(4):
        img = img.filter(ImageFilter.GaussianBlur(radius=8))
    return img

print("Testing Valid Produce...")
prod_img = create_sample_produce()
res1 = run_inference(prod_img)
print("Produce status:", res1.get("status"))
print("Crop:", res1.get("crop", {}).get("canonical_name"))
print("Confidence:", res1.get("confidence"))

print("\nTesting Document (OOD Rejection)...")
doc_img = create_sample_document()
res2 = run_inference(doc_img)
print("Document status:", res2.get("status"))
print("Reason:", res2.get("reason"))

print("\nTesting Blurry Image (Quality Check)...")
blur_img = create_sample_blurry()
res3 = run_inference(blur_img)
print("Blur status:", res3.get("status"))
print("Reason:", res3.get("reason"))
