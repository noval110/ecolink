package routes_test

import (
	"bytes"
	"io"
	"mime"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"net/textproto"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"github.com/noval110/ecolink/backend/handlers"
	"github.com/noval110/ecolink/backend/routes"
	"github.com/noval110/ecolink/backend/services"
)

func aiTestRouter(handler *handlers.AIHandler, secret string) *echo.Echo {
	e := echo.New()
	routes.RegisterRoutesWithAuth(
		e, handlers.NewAuthHandler(nil), nil, nil, nil, nil, nil, nil, nil, nil, nil, handler, secret,
	)
	return e
}

func aiTestToken(t *testing.T, role, secret string, expiry time.Time) string {
	t.Helper()
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": 1, "role": role, "exp": expiry.Unix(),
	}).SignedString([]byte(secret))
	if err != nil {
		t.Fatal(err)
	}
	return "Bearer " + token
}

func aiTestUpload(t *testing.T, field, contentType string, contents []byte) *http.Request {
	t.Helper()
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	header := make(textproto.MIMEHeader)
	header.Set("Content-Disposition", mime.FormatMediaType("form-data", map[string]string{"name": field, "filename": "waste.png"}))
	header.Set("Content-Type", contentType)
	part, err := writer.CreatePart(header)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := part.Write(contents); err != nil {
		t.Fatal(err)
	}
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}
	request := httptest.NewRequest(http.MethodPost, "/api/ai/classify", &body)
	request.Header.Set(echo.HeaderContentType, writer.FormDataContentType())
	return request
}

func TestAIClassifyAuthorizationAndPrediction(t *testing.T) {
	const prediction = `{"class":"pet_plastic","category":"PET Plastic","waste_category_id":1,"confidence":0.7316}`
	var calls atomic.Int32
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls.Add(1)
		image, header, err := r.FormFile("image")
		if err != nil {
			t.Error(err)
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		defer image.Close()
		data, err := io.ReadAll(image)
		if err != nil || string(data) != "image-content" || header.Header.Get("Content-Type") != "image/png" || header.Filename != "waste.png" || r.URL.Path != "/predict" || r.Method != http.MethodPost {
			t.Errorf("unexpected forwarded image: %s %s %+v %q, %v", r.Method, r.URL.Path, header, data, err)
		}
		w.Header().Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		_, _ = io.WriteString(w, prediction)
	}))
	defer upstream.Close()
	e := aiTestRouter(handlers.NewAIHandler(services.NewAIService(upstream.URL)), "test-secret")
	for _, test := range []struct{ name, token string }{
		{"missing", ""},
		{"malformed", "Bearer invalid"},
		{"wrong signature", aiTestToken(t, "user", "wrong-secret", time.Now().Add(time.Hour))},
		{"expired", aiTestToken(t, "user", "test-secret", time.Now().Add(-time.Hour))},
	} {
		t.Run(test.name, func(t *testing.T) {
			request := aiTestUpload(t, "image", "image/png", []byte("image-content"))
			request.Header.Set(echo.HeaderAuthorization, test.token)
			response := httptest.NewRecorder()
			e.ServeHTTP(response, request)
			if response.Code != http.StatusUnauthorized || calls.Load() != 0 {
				t.Fatalf("unauthorized request must not reach AI: %d %s; calls=%d", response.Code, response.Body.String(), calls.Load())
			}
		})
	}
	for _, role := range []string{"user", "organization", "waste_bank"} {
		t.Run(role, func(t *testing.T) {
			request := aiTestUpload(t, "image", "image/png", []byte("image-content"))
			request.Header.Set(echo.HeaderAuthorization, aiTestToken(t, role, "test-secret", time.Now().Add(time.Hour)))
			response := httptest.NewRecorder()
			e.ServeHTTP(response, request)
			if response.Code != http.StatusOK || strings.TrimSpace(response.Body.String()) != prediction {
				t.Fatalf("expected prediction JSON without an envelope: %d %s", response.Code, response.Body.String())
			}
		})
	}
}

func TestAIClassifyRejectsInvalidUploads(t *testing.T) {
	var calls atomic.Int32
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { calls.Add(1) }))
	defer upstream.Close()
	e := aiTestRouter(handlers.NewAIHandler(services.NewAIService(upstream.URL)), "test-secret")
	for _, test := range []struct {
		name, field, contentType string
		contents                 []byte
		status                   int
	}{
		{"wrong field", "file", "image/png", []byte("image"), http.StatusBadRequest},
		{"not an image", "image", "text/plain", []byte("text"), http.StatusBadRequest},
		{"empty image", "image", "image/png", nil, http.StatusBadRequest},
		{"upload too large", "image", "image/png", bytes.Repeat([]byte("x"), 11<<20), http.StatusRequestEntityTooLarge},
	} {
		t.Run(test.name, func(t *testing.T) {
			request := aiTestUpload(t, test.field, test.contentType, test.contents)
			request.Header.Set(echo.HeaderAuthorization, aiTestToken(t, "user", "test-secret", time.Now().Add(time.Hour)))
			response := httptest.NewRecorder()
			e.ServeHTTP(response, request)
			if response.Code != test.status || calls.Load() != 0 {
				t.Fatalf("expected %d without contacting AI: %d %s, calls=%d", test.status, response.Code, response.Body.String(), calls.Load())
			}
		})
	}
}

func TestAIClassifyUpstreamErrors(t *testing.T) {
	for _, test := range []struct {
		name, body string
		status     int
	}{
		{"AI rejects image", `{"detail":"Gambar tidak dapat dibaca"}`, http.StatusBadRequest},
		{"AI unavailable", "Model unavailable", http.StatusServiceUnavailable},
		{"malformed prediction", "not JSON", http.StatusOK},
	} {
		t.Run(test.name, func(t *testing.T) {
			upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(test.status)
				_, _ = io.WriteString(w, test.body)
			}))
			defer upstream.Close()
			e := aiTestRouter(handlers.NewAIHandler(services.NewAIService(upstream.URL)), "test-secret")
			request := aiTestUpload(t, "image", "image/png", []byte("image-content"))
			request.Header.Set(echo.HeaderAuthorization, aiTestToken(t, "user", "test-secret", time.Now().Add(time.Hour)))
			response := httptest.NewRecorder()
			e.ServeHTTP(response, request)
			if response.Code != http.StatusBadGateway {
				t.Fatalf("expected 502: %d %s", response.Code, response.Body.String())
			}
		})
	}
}

func TestAIClassifyUnavailableWithoutConfiguration(t *testing.T) {
	for _, e := range []*echo.Echo{
		aiTestRouter(nil, "test-secret"),
		aiTestRouter(handlers.NewAIHandler(nil), ""),
	} {
		response := httptest.NewRecorder()
		e.ServeHTTP(response, httptest.NewRequest(http.MethodPost, "/api/ai/classify", nil))
		if response.Code != http.StatusNotFound {
			t.Fatalf("AI route must not be exposed without configuration: %d %s", response.Code, response.Body.String())
		}
	}
}
