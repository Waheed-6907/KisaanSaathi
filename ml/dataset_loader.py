"""
KisanSaathi 90-Crop Dataset Loader & Augmentation Pipeline
Handles data transforms, dataset loading, and synthetic calibration generation for offline training/testing.
"""

import os
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from typing import Tuple, List, Optional, Dict, Any

import torch
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as T

from ml.catalogue import CLASS_SLUGS, SLUG_TO_IDX, get_crop_by_slug

# Standard ImageNet normalization for MobileNetV3
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


def get_train_transforms(image_size: int = 224) -> T.Compose:
    return T.Compose([
        T.Resize((image_size, image_size)),
        T.RandomResizedCrop(image_size, scale=(0.8, 1.0)),
        T.RandomHorizontalFlip(),
        T.RandomRotation(degrees=15),
        T.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        T.ToTensor(),
        T.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
    ])


def get_val_transforms(image_size: int = 224) -> T.Compose:
    return T.Compose([
        T.Resize((image_size, image_size)),
        T.CenterCrop(image_size),
        T.ToTensor(),
        T.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
    ])


class SyntheticCropDataset(Dataset):
    """
    Synthetic / benchmark dataset representing the 90 canonical produce classes
    and negative out-of-distribution (OOD) rejection classes (person, phone, vehicle, document).
    Generates distinct visual archetypes (colors, shapes, textures) matching the catalogue.
    """
    def __init__(self, samples_per_class: int = 20, transform=None, include_ood: bool = True):
        self.samples_per_class = samples_per_class
        self.transform = transform or get_val_transforms()
        self.include_ood = include_ood
        
        self.samples: List[Tuple[Any, int, int]] = []  # (meta, class_idx, is_produce)
        
        # Color & shape signatures for key agricultural classes
        for slug in CLASS_SLUGS:
            crop = get_crop_by_slug(slug)
            idx = SLUG_TO_IDX[slug]
            cat = crop.get("category", "vegetable")
            for i in range(samples_per_class):
                self.samples.append(({
                    "type": "produce",
                    "slug": slug,
                    "category": cat,
                    "seed": idx * 1000 + i
                }, idx, 1))
                
        if self.include_ood:
            # Negative OOD categories: person, phone, vehicle, document, noise
            ood_types = ["person", "phone", "vehicle", "document", "random_noise"]
            for ood_type in ood_types:
                for i in range(samples_per_class):
                    self.samples.append(({
                        "type": "ood",
                        "ood_type": ood_type,
                        "seed": 9999 + i * 17
                    }, -1, 0))

    def __len__(self) -> int:
        return len(self.samples)

    def _render_image(self, meta: Dict[str, Any]) -> Image.Image:
        """Render deterministic synthetic image representative of the produce or OOD item."""
        random.seed(meta["seed"])
        img = Image.new("RGB", (224, 224), color=(240, 240, 240))
        draw = ImageDraw.Draw(img)
        
        if meta["type"] == "produce":
            slug = meta["slug"]
            cat = meta["category"]
            
            # Distinct color palettes for produce types
            if "mango" in slug:
                color = (255, 190 + random.randint(-15, 15), 30)
            elif "tomato" in slug:
                color = (230 + random.randint(-20, 20), 40, 30)
            elif "onion" in slug:
                color = (190, 80 + random.randint(-10, 10), 120)
            elif "potato" in slug:
                color = (205, 175, 130 + random.randint(-20, 20))
            elif "paddy" in slug or "rice" in slug:
                color = (220, 200, 140)
            elif "chilli" in slug or "pepper" in slug:
                color = (30, 180 + random.randint(-20, 20), 40) if "green" in slug else (220, 30, 20)
            elif "orange" in slug or "mosambi" in slug:
                color = (255, 160 + random.randint(-15, 15), 0)
            elif cat == "fruit":
                color = (random.randint(180, 240), random.randint(100, 200), random.randint(30, 100))
            elif cat == "vegetable":
                color = (random.randint(40, 120), random.randint(140, 220), random.randint(40, 100))
            else:  # Grains & commodities
                color = (random.randint(180, 230), random.randint(160, 200), random.randint(110, 150))
                
            # Draw produce-like rounded shape
            cx, cy = 112 + random.randint(-10, 10), 112 + random.randint(-10, 10)
            rx, ry = 70 + random.randint(-15, 15), 70 + random.randint(-15, 15)
            draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=color, outline=(40, 40, 40))
            # Produce texture / speckles
            for _ in range(30):
                px = cx + random.randint(-rx + 10, rx - 10)
                py = cy + random.randint(-ry + 10, ry - 10)
                draw.point((px, py), fill=(color[0] // 2, color[1] // 2, color[2] // 2))
                
        else:
            # Negative OOD item
            ood = meta.get("ood_type", "document")
            if ood == "document":
                # White paper with text lines
                draw.rectangle([40, 30, 184, 194], fill=(255, 255, 255), outline=(100, 100, 100))
                for line_y in range(50, 180, 12):
                    draw.line([55, line_y, 169, line_y], fill=(80, 80, 80), width=2)
            elif ood == "phone":
                # Dark smartphone rectangle with screen
                draw.rounded_rectangle([60, 20, 164, 204], radius=15, fill=(30, 30, 30))
                draw.rectangle([70, 40, 154, 184], fill=(40, 80, 160))
            elif ood == "vehicle":
                # Car shape (wheels + body)
                draw.rectangle([30, 100, 194, 160], fill=(50, 80, 200))
                draw.polygon([(60, 100), (90, 60), (140, 60), (170, 100)], fill=(120, 160, 240))
                draw.ellipse([50, 145, 85, 180], fill=(20, 20, 20))
                draw.ellipse([140, 145, 175, 180], fill=(20, 20, 20))
            elif ood == "person":
                # Stick figure / avatar
                draw.ellipse([92, 40, 132, 80], fill=(240, 190, 150))
                draw.line([112, 80, 112, 160], fill=(50, 50, 50), width=5)
                draw.line([70, 110, 154, 110], fill=(50, 50, 50), width=4)
                draw.line([112, 160, 80, 210], fill=(50, 50, 50), width=4)
                draw.line([112, 160, 144, 210], fill=(50, 50, 50), width=4)
            else:
                # Random noise
                arr = np.random.randint(0, 256, (224, 224, 3), dtype=np.uint8)
                return Image.fromarray(arr)

        return img

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int, int]:
        meta, class_idx, is_produce = self.samples[idx]
        img = self._render_image(meta)
        tensor = self.transform(img)
        return tensor, class_idx, is_produce


def build_dataloaders(samples_per_class: int = 15, batch_size: int = 32) -> Tuple[DataLoader, DataLoader]:
    """Builds training and validation DataLoaders."""
    train_ds = SyntheticCropDataset(samples_per_class=samples_per_class, transform=get_train_transforms(), include_ood=True)
    val_ds = SyntheticCropDataset(samples_per_class=max(5, samples_per_class // 3), transform=get_val_transforms(), include_ood=True)
    
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)
    return train_loader, val_loader
