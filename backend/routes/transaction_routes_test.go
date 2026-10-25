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

func TestCreateTransactionAuthorization(t *testing.T) {
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
		e, handlers.NewAuthHandler(nil), nil, nil, nil, nil, nil,
		handlers.NewTransactionDBHandler(nil), nil, nil, nil, nil, secret,
	)

	tests := []struct {
		name   string
		header string
		status int
	}{
		{name: "missing token", status: http.StatusUnauthorized},
		{name: "malformed token", header: "Bearer invalid", status: http.StatusUnauthorized},
		{name: "wrong signature", header: signToken("user", "wrong-secret", time.Now().Add(time.Hour)), status: http.StatusUnauthorized},
		{name: "expired token", header: signToken("user", secret, time.Now().Add(-time.Hour)), status: http.StatusUnauthorized},
		{name: "organization role", header: signToken("organization", secret, time.Now().Add(time.Hour)), status: http.StatusForbidden},
		{name: "waste bank role", header: signToken("waste_bank", secret, time.Now().Add(time.Hour)), status: http.StatusForbidden},
		{name: "individual user reaches body validation", header: signToken("user", secret, time.Now().Add(time.Hour)), status: http.StatusBadRequest},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodPost, "/api/transactions", strings.NewReader(`{"user_id":999,"role":"user"}`))
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

func TestVerifyTransactionAuthorization(t *testing.T) {
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
		e, handlers.NewAuthHandler(nil), nil, nil, nil, nil, nil,
		handlers.NewTransactionDBHandler(nil), nil, nil, nil, nil, secret,
	)

	tests := []struct {
		name   string
		path   string
		header string
		status int
	}{
		{name: "missing token", path: "/api/transactions/1/verify", status: http.StatusUnauthorized},
		{name: "malformed token", path: "/api/transactions/1/verify", header: "Bearer invalid", status: http.StatusUnauthorized},
		{name: "wrong signature", path: "/api/transactions/1/verify", header: signToken("waste_bank", "wrong-secret", time.Now().Add(time.Hour)), status: http.StatusUnauthorized},
		{name: "expired token", path: "/api/transactions/1/verify", header: signToken("waste_bank", secret, time.Now().Add(-time.Hour)), status: http.StatusUnauthorized},
		{name: "individual role", path: "/api/transactions/1/verify", header: signToken("user", secret, time.Now().Add(time.Hour)), status: http.StatusForbidden},
		{name: "organization role", path: "/api/transactions/1/verify", header: signToken("organization", secret, time.Now().Add(time.Hour)), status: http.StatusForbidden},
		{name: "waste bank reaches ID validation", path: "/api/transactions/invalid/verify", header: signToken("waste_bank", secret, time.Now().Add(time.Hour)), status: http.StatusBadRequest},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodPut, test.path, strings.NewReader(`{"user_id":999,"role":"waste_bank"}`))
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

func TestTransactionReadRoutesRequireJWT(t *testing.T) {
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
		e, handlers.NewAuthHandler(nil), nil, nil, nil, nil, nil,
		handlers.NewTransactionDBHandler(nil), nil, nil, nil, nil, secret,
	)

	tests := []struct {
		name   string
		header string
		status int
	}{
		{name: "missing token", status: http.StatusUnauthorized},
		{name: "malformed token", header: "Bearer invalid", status: http.StatusUnauthorized},
		{name: "wrong signature", header: signToken("wrong-secret", time.Now().Add(time.Hour)), status: http.StatusUnauthorized},
		{name: "expired token", header: signToken(secret, time.Now().Add(-time.Hour)), status: http.StatusUnauthorized},
		{name: "valid token reaches input validation", header: signToken(secret, time.Now().Add(time.Hour)), status: http.StatusBadRequest},
	}
	for _, endpoint := range []struct {
		path    string
		message string
	}{
		{path: "/api/me/transactions?status=invalid", message: "Status must be pending or verified"},
		{path: "/api/transactions/invalid", message: "Invalid transaction ID"},
	} {
		for _, test := range tests {
			t.Run(endpoint.path+"/"+test.name, func(t *testing.T) {
				request := httptest.NewRequest(http.MethodGet, endpoint.path, nil)
				request.Header.Set(echo.HeaderAuthorization, test.header)
				response := httptest.NewRecorder()
				e.ServeHTTP(response, request)
				if response.Code != test.status {
					t.Fatalf("expected status %d, got %d: %s", test.status, response.Code, response.Body.String())
				}
				if test.status == http.StatusBadRequest && decodeResponse(t, response).Message != endpoint.message {
					t.Fatalf("unexpected validation response: %s", response.Body.String())
				}
			})
		}
	}
}
