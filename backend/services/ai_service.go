package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime"
	"mime/multipart"
	"net/http"
	"net/textproto"
	"strings"
	"time"
)

type AIService struct {
	BaseURL string
	Client  *http.Client
}

type PredictionResponse struct {
	Class           string  `json:"class"`
	Category        string  `json:"category"`
	WasteCategoryID int64   `json:"waste_category_id"`
	Confidence      float64 `json:"confidence"`
}

func NewAIService(baseURL string) *AIService {
	return &AIService{
		BaseURL: baseURL,
		Client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (s *AIService) Predict(
	filename string,
	contentType string,
	file io.Reader,
) (*PredictionResponse, error) {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	if contentType == "" {
		contentType = "application/octet-stream"
	}
	headers := make(textproto.MIMEHeader)
	headers.Set("Content-Disposition", mime.FormatMediaType("form-data", map[string]string{
		"name": "image", "filename": filename,
	}))
	headers.Set("Content-Type", contentType)
	part, err := writer.CreatePart(headers)
	if err != nil {
		return nil, err
	}
	if _, err := io.Copy(part, file); err != nil {
		return nil, err
	}
	if err := writer.Close(); err != nil {
		return nil, err
	}

	req, err := http.NewRequest(http.MethodPost, strings.TrimRight(s.BaseURL, "/")+"/predict", &body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())
	resp, err := s.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("AI service tidak dapat dihubungi: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		data, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("AI service error %d: %s", resp.StatusCode, string(data))
	}

	var prediction PredictionResponse
	if err := json.NewDecoder(resp.Body).Decode(&prediction); err != nil {
		return nil, err
	}
	return &prediction, nil
}
