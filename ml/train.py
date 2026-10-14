"""
KisanSaathi 90-Crop Training & Fine-Tuning Pipeline
Trains MobileNetV3-Small classifier on 90 crop classes with OOD rejection head.
"""

import os
import argparse
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR

from ml.catalogue import get_total_classes
from ml.model import CropClassifier90
from ml.dataset_loader import build_dataloaders


def train_model(epochs: int = 5, batch_size: int = 32, lr: float = 1e-3, save_dir: str = "ml/models"):
    save_path = Path(save_dir)
    save_path.mkdir(parents=True, exist_ok=True)
    
    num_classes = get_total_classes()
    print(f"🌾 Initializing KisanSaathi 90-Crop Classifier ({num_classes} classes)...")
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    model = CropClassifier90(num_classes=num_classes, pretrained=False)
    model.to(device)
    
    train_loader, val_loader = build_dataloaders(samples_per_class=12, batch_size=batch_size)
    print(f"Dataset ready: {len(train_loader.dataset)} training samples, {len(val_loader.dataset)} validation samples.")
    
    crop_criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
    ood_criterion = nn.CrossEntropyLoss()
    
    optimizer = AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = CosineAnnealingLR(optimizer, T_max=epochs)
    
    best_val_acc = 0.0
    checkpoint_file = save_path / "crop_classifier_90.pt"
    
    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        correct_crops = 0
        total_crops = 0
        
        for images, class_idxs, is_produce in train_loader:
            images = images.to(device)
            class_idxs = class_idxs.to(device)
            is_produce = is_produce.to(device)
            
            optimizer.zero_grad()
            crop_logits, ood_logits = model(images)
            
            # OOD loss across all samples
            loss_ood = ood_criterion(ood_logits, is_produce)
            
            # Crop classification loss only for genuine produce (class_idx >= 0)
            produce_mask = (is_produce == 1) & (class_idxs >= 0)
            if produce_mask.sum() > 0:
                loss_crop = crop_criterion(crop_logits[produce_mask], class_idxs[produce_mask])
                _, preds = torch.max(crop_logits[produce_mask], 1)
                correct_crops += (preds == class_idxs[produce_mask]).sum().item()
                total_crops += produce_mask.sum().item()
            else:
                loss_crop = 0.0
                
            loss = loss_crop + 0.5 * loss_ood
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
            
        scheduler.step()
        train_acc = (correct_crops / total_crops) * 100 if total_crops > 0 else 0
        
        # Validation
        model.eval()
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for images, class_idxs, is_produce in val_loader:
                images = images.to(device)
                class_idxs = class_idxs.to(device)
                is_produce = is_produce.to(device)
                
                crop_logits, _ = model(images)
                produce_mask = (is_produce == 1) & (class_idxs >= 0)
                if produce_mask.sum() > 0:
                    _, preds = torch.max(crop_logits[produce_mask], 1)
                    val_correct += (preds == class_idxs[produce_mask]).sum().item()
                    val_total += produce_mask.sum().item()
                    
        val_acc = (val_correct / val_total) * 100 if val_total > 0 else 0
        print(f"Epoch [{epoch}/{epochs}] - Loss: {total_loss/len(train_loader):.4f} - Train Acc: {train_acc:.2f}% - Val Acc: {val_acc:.2f}%")
        
        # Save best checkpoint
        if val_acc >= best_val_acc or epoch == epochs:
            best_val_acc = val_acc
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "num_classes": num_classes,
                "val_accuracy": val_acc
            }, checkpoint_file)
            print(f"  ✔ Saved model checkpoint to {checkpoint_file}")

    print(f"\n✅ Training complete! Final best validation accuracy: {best_val_acc:.2f}%")
    return checkpoint_file


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train KisanSaathi 90-crop classifier")
    parser.add_argument("--epochs", type=int, default=5, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size")
    parser.add_argument("--lr", type=float, default=1e-3, help="Learning rate")
    args = parser.parse_args()
    
    train_model(epochs=args.epochs, batch_size=args.batch_size, lr=args.lr)
