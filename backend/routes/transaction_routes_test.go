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
		handlers.NewTransactionDBHandler(nil), secret,
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
