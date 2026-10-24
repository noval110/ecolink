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

func TestBankTransactionsAuthorizationAndStatusValidation(t *testing.T) {
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
		handlers.NewTransactionDBHandler(nil), nil, nil, secret,
	)

	validBankToken := signToken("waste_bank", secret, time.Now().Add(time.Hour))
	tests := []struct {
		name    string
		query   string
		header  string
		status  int
		message string
	}{
		{name: "missing token", status: http.StatusUnauthorized, message: "Authorization header is required"},
		{name: "malformed token", header: "Bearer invalid", status: http.StatusUnauthorized, message: "Invalid or expired token"},
		{name: "wrong signature", header: signToken("waste_bank", "wrong-secret", time.Now().Add(time.Hour)), status: http.StatusUnauthorized, message: "Invalid or expired token"},
		{name: "expired token", header: signToken("waste_bank", secret, time.Now().Add(-time.Hour)), status: http.StatusUnauthorized, message: "Invalid or expired token"},
		{name: "individual role", header: signToken("user", secret, time.Now().Add(time.Hour)), status: http.StatusForbidden, message: "Only waste bank users can access this resource"},
		{name: "organization role", header: signToken("organization", secret, time.Now().Add(time.Hour)), status: http.StatusForbidden, message: "Only waste bank users can access this resource"},
		{name: "query cannot override authenticated role", query: "?role=waste_bank&user_id=999&status=pending", header: signToken("user", secret, time.Now().Add(time.Hour)), status: http.StatusForbidden, message: "Only waste bank users can access this resource"},
		{name: "waste bank reaches status validation", query: "?status=invalid", header: validBankToken, status: http.StatusBadRequest, message: "Invalid transaction status"},
		{name: "cancelled status", query: "?status=cancelled", header: validBankToken, status: http.StatusBadRequest, message: "Invalid transaction status"},
		{name: "case sensitive status", query: "?status=Pending", header: validBankToken, status: http.StatusBadRequest, message: "Invalid transaction status"},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodGet, "/api/bank/transactions"+test.query, nil)
			request.Header.Set(echo.HeaderAuthorization, test.header)
			response := httptest.NewRecorder()
			e.ServeHTTP(response, request)
			if response.Code != test.status {
				t.Fatalf("expected status %d, got %d: %s", test.status, response.Code, response.Body.String())
			}
			payload := decodeResponse(t, response)
			if payload.Success || payload.Message != test.message {
				t.Fatalf("unexpected response: %s", response.Body.String())
			}
		})
	}
}

func TestBankTransactionsUnavailableWithoutConfiguration(t *testing.T) {
	tests := []struct {
		name    string
		handler *handlers.TransactionDBHandler
		secret  string
	}{
		{name: "missing handler", secret: "test-secret"},
		{name: "missing JWT secret", handler: handlers.NewTransactionDBHandler(nil)},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			e := echo.New()
			routes.RegisterRoutesWithAuth(
				e, handlers.NewAuthHandler(nil), nil, nil, nil, nil, nil,
				test.handler, nil, nil, test.secret,
			)
			response := httptest.NewRecorder()
			e.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/api/bank/transactions", nil))
			if response.Code != http.StatusNotFound {
				t.Fatalf("expected status 404, got %d: %s", response.Code, response.Body.String())
			}
		})
	}
}
