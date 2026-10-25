package services_test

import (
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/noval110/ecolink/backend/services"
)

func TestAIServicePredictMultipart(t *testing.T) {
	const image = "image-content"
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost || r.URL.Path != "/predict" {
			t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		reader, err := r.MultipartReader()
		if err != nil {
			t.Error(err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		part, err := reader.NextPart()
		if err != nil {
			t.Error(err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		defer part.Close()
		if part.FormName() != "image" || part.FileName() != `bottle "PET".png` || part.Header.Get("Content-Type") != "image/png" {
			t.Errorf("unexpected upload metadata: %+v", part.Header)
		}
		data, err := io.ReadAll(part)
		if err != nil || string(data) != image {
			t.Errorf("image was not forwarded intact: %q, %v", data, err)
		}
		if _, err := reader.NextPart(); !errors.Is(err, io.EOF) {
			t.Errorf("expected a complete single-part multipart body: %v", err)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = io.WriteString(w, `{"class":"pet_plastic","category":"PET Plastic","waste_category_id":1,"confidence":0.9876}`)
	}))
	defer server.Close()

	service := services.NewAIService(server.URL + "/")
	got, err := service.Predict(`bottle "PET".png`, "image/png", strings.NewReader(image))
	if err != nil {
		t.Fatal(err)
	}
	want := services.PredictionResponse{Class: "pet_plastic", Category: "PET Plastic", WasteCategoryID: 1, Confidence: 0.9876}
	if got == nil || *got != want {
		t.Fatalf("prediction response: got %+v, want %+v", got, want)
	}
}

func TestAIServicePredictResponseErrors(t *testing.T) {
	for _, test := range []struct {
		name    string
		status  int
		body    string
		message string
	}{
		{"upstream rejects image", http.StatusBadRequest, `{"detail":"Gambar tidak dapat dibaca"}`, "AI service error 400"},
		{"upstream unavailable", http.StatusServiceUnavailable, "Model unavailable", "AI service error 503"},
		{"invalid JSON", http.StatusOK, "not JSON", "invalid character"},
		{"empty response", http.StatusOK, "", "EOF"},
	} {
		t.Run(test.name, func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(test.status)
				_, _ = io.WriteString(w, test.body)
			}))
			defer server.Close()
			got, err := services.NewAIService(server.URL).Predict("image.jpg", "image/jpeg", strings.NewReader("image-content"))
			if got != nil || err == nil || !strings.Contains(err.Error(), test.message) {
				t.Fatalf("expected %q error and no prediction: %+v, %v", test.message, got, err)
			}
			if test.status != http.StatusOK && !strings.Contains(err.Error(), test.body) {
				t.Fatalf("upstream error details must be retained: %v", err)
			}
		})
	}
}

type aiTestTransport func(*http.Request) (*http.Response, error)

func (transport aiTestTransport) RoundTrip(request *http.Request) (*http.Response, error) {
	return transport(request)
}

type aiTestFailingReader struct{ err error }

func (reader aiTestFailingReader) Read([]byte) (int, error) {
	return 0, reader.err
}

func TestAIServicePredictIOErrors(t *testing.T) {
	service := services.NewAIService("http://ai-service.local")
	failure := errors.New("test failure")
	requests := 0
	service.Client.Transport = aiTestTransport(func(*http.Request) (*http.Response, error) {
		requests++
		return nil, failure
	})
	got, err := service.Predict("image.png", "image/png", aiTestFailingReader{err: failure})
	if got != nil || !errors.Is(err, failure) || requests != 0 {
		t.Fatalf("a file read failure must not contact AI: %+v, %v, requests=%d", got, err, requests)
	}
	got, err = service.Predict("image.png", "image/png", strings.NewReader("image-content"))
	if got != nil || !errors.Is(err, failure) || !strings.Contains(err.Error(), "AI service tidak dapat dihubungi") || requests != 1 {
		t.Fatalf("transport failure must retain the cause: %+v, %v, requests=%d", got, err, requests)
	}
}
