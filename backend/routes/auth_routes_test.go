package routes_test

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/handlers"
	"github.com/noval110/ecolink/backend/routes"
)

func TestMeRoutesRequireJWT(t *testing.T) {
	const secret = "test-secret"
	signToken := func(key string, expiry time.Time) string {
		t.Helper()
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id": int64(1),
			"role":    "user",
			"exp":     expiry.Unix(),
		})
		signed, err := token.SignedString([]byte(key))
		if err != nil {
			t.Fatal(err)
		}
		return "Bearer " + signed
	}

	e := echo.New()
	routes.RegisterRoutesWithAuth(e, handlers.NewAuthHandler(nil), nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, secret)

	tests := []struct {
		name   string
		header string
		status int
	}{
		{name: "missing token", status: http.StatusUnauthorized},
		{name: "malformed token", header: "Bearer invalid", status: http.StatusUnauthorized},
		{name: "wrong signature", header: signToken("wrong-secret", time.Now().Add(time.Hour)), status: http.StatusUnauthorized},
		{name: "expired token", header: signToken(secret, time.Now().Add(-time.Hour)), status: http.StatusUnauthorized},
		{name: "valid token", header: signToken(secret, time.Now().Add(time.Hour)), status: http.StatusOK},
	}
	for _, path := range []string{"/api/me/dashboard", "/api/me/passport", "/api/me/impact", "/api/me/transactions"} {
		for _, test := range tests {
			t.Run(path+"/"+test.name, func(t *testing.T) {
				request := httptest.NewRequest(http.MethodGet, path, nil)
				request.Header.Set(echo.HeaderAuthorization, test.header)
				response := httptest.NewRecorder()
				e.ServeHTTP(response, request)
				if response.Code != test.status {
					t.Fatalf("expected status %d, got %d: %s", test.status, response.Code, response.Body.String())
				}
			})
		}
	}
}

func TestAuthRoutesRemainPublicWithJWT(t *testing.T) {
	e := echo.New()
	routes.RegisterRoutesWithAuth(e, handlers.NewAuthHandler(nil), nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, "test-secret")

	for _, path := range []string{"/api/auth/register", "/api/auth/login"} {
		t.Run(path, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodPost, path, nil)
			response := httptest.NewRecorder()
			e.ServeHTTP(response, request)
			// A nil service returns 501, confirming the request reaches the public handler.
			if response.Code != http.StatusNotImplemented {
				t.Fatalf("expected status 501, got %d: %s", response.Code, response.Body.String())
			}
		})
	}
}

func TestGamificationRoutesRequireJWT(t *testing.T) {
	const secret = "test-secret"
	signToken := func(key string, expiry time.Time) string {
		t.Helper()
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id": int64(1),
			"role":    "user",
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
		e, handlers.NewAuthHandler(nil), nil, nil, nil, nil, nil, nil, nil,
		handlers.NewGamificationHandler(nil), nil, nil, secret,
	)

	tests := []struct {
		name   string
		header string
	}{
		{name: "missing token"},
		{name: "malformed token", header: "Bearer invalid"},
		{name: "wrong signature", header: signToken("wrong-secret", time.Now().Add(time.Hour))},
		{name: "expired token", header: signToken(secret, time.Now().Add(-time.Hour))},
	}
	for _, path := range []string{"/api/me/missions", "/api/me/badges"} {
		registered := false
		for _, route := range e.Routes() {
			if route.Method == http.MethodGet && route.Path == path {
				registered = true
				break
			}
		}
		if !registered {
			t.Fatalf("GET %s is not registered", path)
		}
		for _, test := range tests {
			t.Run(path+"/"+test.name, func(t *testing.T) {
				request := httptest.NewRequest(http.MethodGet, path, nil)
				request.Header.Set(echo.HeaderAuthorization, test.header)
				response := httptest.NewRecorder()
				e.ServeHTTP(response, request)
				if response.Code != http.StatusUnauthorized {
					t.Fatalf("expected status 401, got %d: %s", response.Code, response.Body.String())
				}
			})
		}
	}
}

func TestGamificationRoutesUnavailableWithoutJWTSecret(t *testing.T) {
	e := echo.New()
	routes.RegisterRoutesWithAuth(
		e, handlers.NewAuthHandler(nil), nil, nil, nil, nil, nil, nil, nil,
		handlers.NewGamificationHandler(nil), nil, nil, "",
	)

	for _, path := range []string{"/api/me/missions", "/api/me/badges"} {
		t.Run(path, func(t *testing.T) {
			response := httptest.NewRecorder()
			e.ServeHTTP(response, httptest.NewRequest(http.MethodGet, path, nil))
			if response.Code != http.StatusNotFound {
				t.Fatalf("expected status 404, got %d: %s", response.Code, response.Body.String())
			}
		})
	}
}
