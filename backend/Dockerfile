# =========================
# Build stage
# =========================
FROM golang:1.25-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux \
    go build -o ecolink-backend ./cmd


# =========================
# Runtime stage
# =========================
FROM alpine:3.22

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder /app/ecolink-backend .

ENV PORT=8080

EXPOSE 8080

CMD ["./ecolink-backend"]