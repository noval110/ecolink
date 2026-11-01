from pathlib import Path
from io import BytesIO

import torch
import torch.nn as nn
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from torchvision import transforms
from torchvision.models import mobilenet_v3_small


app = FastAPI(
    title="EcoLink AI Service",
    version="1.0.0"
)

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

MODEL_PATH = (
    Path(__file__).parent
    / "models"
    / "ecolink_waste_classifier_v1.pth"
)

# LOAD CHECKPOINT

checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE
)

class_to_idx = checkpoint["class_to_idx"]

idx_to_class = {
    index: class_name
    for class_name, index in class_to_idx.items()
}

image_size = checkpoint.get(
    "image_size",
    224
)

# MODEL

model = mobilenet_v3_small(
    weights=None
)

in_features = model.classifier[3].in_features

model.classifier[3] = nn.Linear(
    in_features,
    checkpoint["num_classes"]
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model = model.to(DEVICE)
model.eval()

# TRANSFORM

transform = transforms.Compose([
    transforms.Resize(
        (image_size, image_size)
    ),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# DATABASE CATEGORY MAPPING

category_mapping = {
    "pet_plastic": {
        "name": "PET Plastic",
        "waste_category_id": 1
    },
    "paper": {
        "name": "Paper",
        "waste_category_id": 2
    },
    "metal": {
        "name": "Metal",
        "waste_category_id": 3
    },
    "cardboard": {
        "name": "Cardboard",
        "waste_category_id": 4
    },
    "glass": {
        "name": "Glass",
        "waste_category_id": 5
    }
}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "device": str(DEVICE),
        "model": "MobileNetV3-Small",
        "classes": list(class_to_idx.keys())
    }


@app.post("/predict")
async def predict(
    image: UploadFile = File(...)
):
    if not image.content_type:
        raise HTTPException(
            status_code=400,
            detail="File tidak valid"
        )

    if not image.content_type.startswith(
        "image/"
    ):
        raise HTTPException(
            status_code=400,
            detail="File harus berupa gambar"
        )

    try:
        contents = await image.read()

        pil_image = Image.open(
            BytesIO(contents)
        ).convert("RGB")

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Gambar tidak dapat dibaca"
        )

    tensor = transform(
        pil_image
    ).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        outputs = model(tensor)

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

        confidence, predicted_index = (
            torch.max(
                probabilities,
                dim=1
            )
        )

    predicted_class = idx_to_class[
        predicted_index.item()
    ]

    category = category_mapping[
        predicted_class
    ]

    return {
        "class": predicted_class,
        "category": category["name"],
        "waste_category_id": category[
            "waste_category_id"
        ],
        "confidence": round(
            confidence.item(),
            4
        )
    }