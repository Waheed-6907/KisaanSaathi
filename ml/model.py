"""
KisanSaathi 90-Crop Vision Classifier Architecture
MobileNetV3-Small with calibrated classification head and OOD rejection scoring.
"""

import math
import torch
import torch.nn as nn
import torchvision.models as models
from typing import Dict, Tuple, Optional, Any


class CropClassifier90(nn.Module):
    """
    MobileNetV3-Small transfer learning architecture for 90-crop classification
    with auxiliary out-of-distribution (OOD) reject head and temperature scaling.
    """
    def __init__(self, num_classes: int = 90, temperature: float = 1.2, pretrained: bool = False):
        super(CropClassifier90, self).__init__()
        self.num_classes = num_classes
        self.temperature = temperature
        
        # Base backbone
        weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
        backbone = models.mobilenet_v3_small(weights=weights)
        
        # Backbone features extractor (input 3x224x224 -> output 576x1x1)
        self.features = backbone.features
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        
        in_features = backbone.classifier[0].in_features  # 576
        
        # Crop classification head
        self.classifier = nn.Sequential(
            nn.Linear(in_features, 1024),
            nn.Hardswish(),
            nn.Dropout(p=0.2),
            nn.Linear(1024, num_classes)
        )
        
        # Binary produce vs non-produce (OOD rejection) head
        self.ood_head = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.Hardswish(),
            nn.Dropout(p=0.2),
            nn.Linear(256, 2)  # [non_produce_score, produce_score]
        )

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Forward pass.
        Returns:
            logits: (B, 90) crop classification logits
            ood_logits: (B, 2) binary produce vs non-produce logits
        """
        feats = self.features(x)
        feats = self.avgpool(feats)
        flattened = torch.flatten(feats, 1)
        
        crop_logits = self.classifier(flattened)
        ood_logits = self.ood_head(flattened)
        return crop_logits, ood_logits

    def predict_with_ood(self, x: torch.Tensor) -> Dict[str, Any]:
        """
        Computes calibrated probabilities, top-1 class, entropy, and produce confidence.
        """
        self.eval()
        with torch.no_grad():
            crop_logits, ood_logits = self.forward(x)
            
            # Calibrate logits with temperature
            scaled_logits = crop_logits / self.temperature
            probs = torch.softmax(scaled_logits, dim=1)
            
            # Shannon Entropy: H = -sum(p * log(p))
            log_probs = torch.log_softmax(scaled_logits, dim=1)
            entropy = -torch.sum(probs * log_probs, dim=1).item()
            
            # Top predictions
            top3_probs, top3_indices = torch.topk(probs, k=min(3, self.num_classes), dim=1)
            
            # OOD Produce score
            ood_probs = torch.softmax(ood_logits, dim=1)
            produce_score = ood_probs[0, 1].item()
            
            top_prob = top3_probs[0, 0].item()
            top_idx = top3_indices[0, 0].item()
            
            return {
                "top_index": top_idx,
                "top_confidence": top_prob,
                "entropy": entropy,
                "produce_score": produce_score,
                "top3": [
                    {"index": top3_indices[0, i].item(), "confidence": top3_probs[0, i].item()}
                    for i in range(top3_probs.shape[1])
                ]
            }


def build_model(num_classes: int = 90, pretrained: bool = False) -> CropClassifier90:
    """Helper factory function to instantiate model."""
    return CropClassifier90(num_classes=num_classes, pretrained=pretrained)
