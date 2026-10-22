package routes_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/handlers"
	"github.com/noval110/ecolink/backend/routes"
)

func TestCampaignJoinAuthorization(t *testing.T) {
	const secret = "test-secret"
	signToken := func(role, key string, expiry time.Time) string {
		t.Helper()
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id": int64(1),
			"role":    role,
			"exp":     expiry.Unix(),
		})
		signed, err := token.SignedString([]byte(key))
		if err != nil {
			t.Fatal(err)
		}
		return "Bearer " + signed
	}

	e := echo.New()
	routes.RegisterRoutesWithAuth(
		e, handlers.NewAuthHandler(nil), nil, nil, nil, nil,
		handlers.NewCampaignDBHandler(nil), nil, nil, secret,
	)

	tests := []struct {
		name   string
		path   string
		header string
		status int
	}{
		{name: "missing token", path: "/api/campaigns/1/join", status: http.StatusUnauthorized},
		{name: "malformed token", path: "/api/campaigns/1/join", header: "Bearer invalid", status: http.StatusUnauthorized},
		{name: "wrong signature", path: "/api/campaigns/1/join", header: signToken("user", "wrong-secret", time.Now().Add(time.Hour)), status: http.StatusUnauthorized},
		{name: "expired token", path: "/api/campaigns/1/join", header: signToken("user", secret, time.Now().Add(-time.Hour)), status: http.StatusUnauthorized},
		{name: "organization role", path: "/api/campaigns/1/join", header: signToken("organization", secret, time.Now().Add(time.Hour)), status: http.StatusForbidden},
		{name: "waste bank role", path: "/api/campaigns/1/join", header: signToken("waste_bank", secret, time.Now().Add(time.Hour)), status: http.StatusForbidden},
		{name: "individual user reaches ID validation", path: "/api/campaigns/invalid/join", header: signToken("user", secret, time.Now().Add(time.Hour)), status: http.StatusBadRequest},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			// Request-body identity must not override the signed JWT identity or role.
			request := httptest.NewRequest(http.MethodPost, test.path, strings.NewReader(`{"user_id":999,"role":"user"}`))
			request.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			request.Header.Set(echo.HeaderAuthorization, test.header)
			response := httptest.NewRecorder()
			e.ServeHTTP(response, request)
			if response.Code != test.status {
				t.Fatalf("expected status %d, got %d: %s", test.status, response.Code, response.Body.String())
			}
		})
	}
}

func TestCampaignJoinUnavailableWithoutJWTSecret(t *testing.T) {
	e := echo.New()
	routes.RegisterRoutesWithAuth(
		e, handlers.NewAuthHandler(nil), nil, nil, nil, nil,
		handlers.NewCampaignDBHandler(nil), nil, nil, "",
	)
	response := httptest.NewRecorder()
	e.ServeHTTP(response, httptest.NewRequest(http.MethodPost, "/api/campaigns/1/join", nil))
	if response.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected status 405, got %d: %s", response.Code, response.Body.String())
	}
}

func TestCampaignDetailRemainsPublic(t *testing.T) {
	e := echo.New()
	routes.RegisterRoutesWithAuth(
		e, handlers.NewAuthHandler(nil), nil, nil, nil, nil,
		handlers.NewCampaignDBHandler(nil), nil, nil, "test-secret",
	)
	response := httptest.NewRecorder()
	e.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/api/campaigns/invalid", nil))
	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected public ID validation with status 400, got %d: %s", response.Code, response.Body.String())
	}
}
