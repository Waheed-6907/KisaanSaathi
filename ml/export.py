"""
KisanSaathi 90-Crop Model Export Script
Exports trained PyTorch model to TorchScript and ONNX formats.
"""

import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import torch

from ml.catalogue import get_total_classes
from ml.model import CropClassifier90

CURRENT_DIR = Path(__file__).resolve().parent
MODELS_DIR = CURRENT_DIR / "models"
CHECKPOINT_PATH = MODELS_DIR / "crop_classifier_90.pt"
TORCHSCRIPT_PATH = MODELS_DIR / "crop_classifier_90_traced.pt"
ONNX_PATH = MODELS_DIR / "crop_classifier_90.onnx"


def export_models():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    num_classes = get_total_classes()
    
    model = CropClassifier90(num_classes=num_classes, pretrained=False)
    if CHECKPOINT_PATH.exists():
        state = torch.load(CHECKPOINT_PATH, map_location="cpu")
        if "model_state_dict" in state:
            model.load_state_dict(state["model_state_dict"])
        else:
            model.load_state_dict(state)
        print(f"Loaded weights from {CHECKPOINT_PATH}")
    else:
        print("Note: Checkpoint not found; exporting architecture with initialized weights.")
        
    model.eval()
    dummy_input = torch.randn(1, 3, 224, 224)
    
    # 1. Export TorchScript
    try:
        traced_model = torch.jit.trace(model, dummy_input)
        traced_model.save(str(TORCHSCRIPT_PATH))
        print(f"✔ Successfully exported TorchScript model to: {TORCHSCRIPT_PATH}")
    except Exception as e:
        print(f"✖ TorchScript export failed: {e}")
        
    # 2. Export ONNX
    try:
        torch.onnx.export(
            model,
            dummy_input,
            str(ONNX_PATH),
            export_params=True,
            opset_version=14,
            do_constant_folding=True,
            input_names=["input"],
            output_names=["crop_logits", "ood_logits"],
            dynamic_axes={"input": {0: "batch_size"}, "crop_logits": {0: "batch_size"}, "ood_logits": {0: "batch_size"}}
        )
        print(f"✔ Successfully exported ONNX model to: {ONNX_PATH}")
    except Exception as e:
        print(f"✖ ONNX export failed: {e}")


if __name__ == "__main__":
    export_models()
