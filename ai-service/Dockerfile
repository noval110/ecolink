FROM python:3.13-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip

# CPU-only PyTorch untuk inference production
RUN pip install --no-cache-dir \
    --index-url https://download.pytorch.org/whl/cpu \
    torch==2.14.1 torchvision==0.29.1

RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY models ./models

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
