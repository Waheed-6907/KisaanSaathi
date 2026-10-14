"""
KisanSaathi 90-Crop Model Evaluation Script
Computes Precision, Recall, F1-score, Confusion Matrix, and OOD Rejection Metrics.
"""

import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import numpy as np
import torch
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

from ml.catalogue import get_total_classes, CLASS_SLUGS, get_crop_by_slug
from ml.model import CropClassifier90
from ml.dataset_loader import build_dataloaders


def evaluate_model(checkpoint_path: str = "ml/models/crop_classifier_90.pt", report_out: str = "ml/evaluation_report.json"):
    num_classes = get_total_classes()
    ckpt = Path(checkpoint_path)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = CropClassifier90(num_classes=num_classes, pretrained=False)
    
    if ckpt.exists():
        state = torch.load(ckpt, map_location=device)
        model.load_state_dict(state["model_state_dict"])
        print(f"Loaded checkpoint from {ckpt} (trained epoch {state.get('epoch', 'N/A')})")
    else:
        print(f"Warning: Checkpoint {ckpt} not found. Running with initialized weights for baseline check.")
        
    model.to(device)
    model.eval()
    
    _, val_loader = build_dataloaders(samples_per_class=10, batch_size=32)
    
    y_true_crop = []
    y_pred_crop = []
    y_true_ood = []
    y_pred_ood = []
    
    with torch.no_grad():
        for images, class_idxs, is_produce in val_loader:
            images = images.to(device)
            crop_logits, ood_logits = model(images)
            
            # Crop predictions
            _, crop_preds = torch.max(crop_logits, 1)
            # OOD predictions
            _, ood_preds = torch.max(ood_logits, 1)
            
            for i in range(len(is_produce)):
                is_prod = is_produce[i].item()
                y_true_ood.append(is_prod)
                y_pred_ood.append(ood_preds[i].item())
                
                if is_prod == 1 and class_idxs[i].item() >= 0:
                    y_true_crop.append(class_idxs[i].item())
                    y_pred_crop.append(crop_preds[i].item())

    # Crop classification metrics
    crop_acc = accuracy_score(y_true_crop, y_pred_crop)
    ood_acc = accuracy_score(y_true_ood, y_pred_ood)
    
    # Per-class metrics
    present_classes = sorted(list(set(y_true_crop)))
    target_names = [CLASS_SLUGS[i] for i in present_classes]
    
    report_dict = classification_report(
        y_true_crop,
        y_pred_crop,
        labels=present_classes,
        target_names=target_names,
        output_dict=True,
        zero_division=0
    )
    
    conf_mat = confusion_matrix(y_true_crop, y_pred_crop, labels=present_classes).tolist()
    
    results = {
        "model": "MobileNetV3-Small-90Crop",
        "num_classes": num_classes,
        "overall_crop_accuracy": round(float(crop_acc), 4),
        "ood_rejection_accuracy": round(float(ood_acc), 4),
        "macro_f1": round(float(report_dict.get("macro avg", {}).get("f1-score", 0.0)), 4),
        "weighted_f1": round(float(report_dict.get("weighted avg", {}).get("f1-score", 0.0)), 4),
        "total_test_samples": len(y_true_crop),
        "total_ood_samples": len(y_true_ood) - len(y_true_crop),
        "per_class_summary": {
            slug: {
                "precision": round(float(report_dict[slug]["precision"]), 4),
                "recall": round(float(report_dict[slug]["recall"]), 4),
                "f1_score": round(float(report_dict[slug]["f1-score"]), 4),
                "support": int(report_dict[slug]["support"])
            }
            for slug in target_names if slug in report_dict
        },
        "confusion_matrix_shape": [len(present_classes), len(present_classes)]
    }
    
    out_file = Path(report_out)
    out_file.parent.mkdir(parents=True, exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)
        
    print("\n==========================================")
    print("🌾 KisanSaathi 90-Crop Evaluation Report")
    print("==========================================")
    print(f"Total Produce Classes: {num_classes}")
    print(f"Overall Crop Accuracy: {results['overall_crop_accuracy'] * 100:.2f}%")
    print(f"OOD Rejection Accuracy: {results['ood_rejection_accuracy'] * 100:.2f}%")
    print(f"Macro F1-Score: {results['macro_f1']:.4f}")
    print(f"Weighted F1-Score: {results['weighted_f1']:.4f}")
    print(f"Full report saved to: {out_file}")
    print("==========================================")
    
    return results


if __name__ == "__main__":
    evaluate_model()
