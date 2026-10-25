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

func TestUpdateProfileAuthorizationAndValidation(t *testing.T) {
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
		e, handlers.NewAuthHandler(nil), handlers.NewProfileHandler(nil),
		nil, nil, nil, nil, nil, nil, nil, nil, nil, secret,
	)

	validToken := signToken("user", secret, time.Now().Add(time.Hour))
	tests := []struct {
		name    string
		header  string
		body    string
		status  int
		message string
	}{
		{name: "missing token", status: http.StatusUnauthorized, message: "Authorization header is required"},
		{name: "malformed token", header: "Bearer invalid", status: http.StatusUnauthorized, message: "Invalid or expired token"},
		{name: "wrong signature", header: signToken("user", "wrong-secret", time.Now().Add(time.Hour)), status: http.StatusUnauthorized, message: "Invalid or expired token"},
		{name: "expired token", header: signToken("user", secret, time.Now().Add(-time.Hour)), status: http.StatusUnauthorized, message: "Invalid or expired token"},
		{name: "invalid JSON", header: validToken, body: `{`, status: http.StatusBadRequest, message: "Invalid request body"},
		{name: "missing name", header: validToken, body: `{"email":"user@example.com"}`, status: http.StatusBadRequest, message: "Full name is required"},
		{name: "blank name", header: validToken, body: `{"full_name":" \t ","email":"user@example.com"}`, status: http.StatusBadRequest, message: "Full name is required"},
		{name: "missing email", header: validToken, body: `{"full_name":"Test User"}`, status: http.StatusBadRequest, message: "Valid email is required"},
		{name: "blank email", header: validToken, body: `{"full_name":"Test User","email":" \t "}`, status: http.StatusBadRequest, message: "Valid email is required"},
		{name: "invalid email", header: validToken, body: `{"full_name":"Test User","email":"invalid"}`, status: http.StatusBadRequest, message: "Valid email is required"},
		{name: "phone must be a string", header: validToken, body: `{"full_name":"Test User","email":"user@example.com","phone":123}`, status: http.StatusBadRequest, message: "Invalid request body"},
		{name: "bank role reaches validation", header: signToken("waste_bank", secret, time.Now().Add(time.Hour)), body: `{}`, status: http.StatusBadRequest, message: "Full name is required"},
		{name: "organization role reaches validation", header: signToken("organization", secret, time.Now().Add(time.Hour)), body: `{}`, status: http.StatusBadRequest, message: "Full name is required"},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodPut, "/api/me/profile", strings.NewReader(test.body))
			request.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
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

func TestUpdateProfileRejectsInvalidAuthenticatedUser(t *testing.T) {
	for _, userID := range []any{nil, "1"} {
		response := httptest.NewRecorder()
		c := echo.New().NewContext(httptest.NewRequest(http.MethodPut, "/api/me/profile", nil), response)
		c.Set("user_id", userID)
		if err := handlers.NewProfileHandler(nil).Update(c); err != nil {
			t.Fatal(err)
		}
		if response.Code != http.StatusUnauthorized || decodeResponse(t, response).Message != "Invalid authenticated user" {
			t.Fatalf("unexpected response: %s", response.Body.String())
		}
	}
}
