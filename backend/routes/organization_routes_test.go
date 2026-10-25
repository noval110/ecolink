package routes_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/handlers"
	"github.com/noval110/ecolink/backend/repositories"
	"github.com/noval110/ecolink/backend/routes"
)

func TestOrganizationRoutesAuthorization(t *testing.T) {
	const secret = "test-secret"
	signToken := func(role, key string, expiry time.Time) string {
		t.Helper()
		token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id": 1, "role": role, "exp": expiry.Unix(),
		}).SignedString([]byte(key))
		if err != nil {
			t.Fatal(err)
		}
		return "Bearer " + token
	}

	// A closed pool exercises repository-error responses without connecting to a database.
	pool, err := pgxpool.New(context.Background(), "postgres://unused:unused@127.0.0.1:1/unused")
	if err != nil {
		t.Fatal(err)
	}
	pool.Close()
	handler := handlers.NewOrganizationDBHandler(repositories.NewOrganizationRepository(pool))
	e := echo.New()
	routes.RegisterRoutesWithAuth(
		e, handlers.NewAuthHandler(nil), nil, nil, nil, nil, nil, nil, nil, nil, handler, nil, secret,
	)

	tests := []struct {
		name   string
		header string
		status int
	}{
		{name: "missing token", status: http.StatusUnauthorized},
		{name: "malformed token", header: "Bearer invalid", status: http.StatusUnauthorized},
		{name: "wrong signature", header: signToken("organization", "wrong-secret", time.Now().Add(time.Hour)), status: http.StatusUnauthorized},
		{name: "expired token", header: signToken("organization", secret, time.Now().Add(-time.Hour)), status: http.StatusUnauthorized},
		{name: "individual role", header: signToken("user", secret, time.Now().Add(time.Hour)), status: http.StatusForbidden},
		{name: "bank role", header: signToken("waste_bank", secret, time.Now().Add(time.Hour)), status: http.StatusForbidden},
		{name: "organization reaches repository", header: signToken("organization", secret, time.Now().Add(time.Hour)), status: http.StatusInternalServerError},
	}
	for _, endpoint := range []struct{ method, path string }{
		{http.MethodGet, "/api/organization/dashboard"},
		{http.MethodGet, "/api/organization/campaigns"},
		{http.MethodPost, "/api/organization/campaigns"},
		{http.MethodPatch, "/api/organization/campaigns/1/status"},
	} {
		for _, test := range tests {
			t.Run(endpoint.method+endpoint.path+"/"+test.name, func(t *testing.T) {
				request := httptest.NewRequest(endpoint.method, endpoint.path+"?role=organization&user_id=999&organization_id=999", strings.NewReader(`{"title":"Campaign","target_kg":10,"start_date":"2026-10-25","end_date":"2026-10-26","partner_waste_bank_ids":[1],"status":"completed"}`))
				request.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
				request.Header.Set(echo.HeaderAuthorization, test.header)
				response := httptest.NewRecorder()
				e.ServeHTTP(response, request)
				if response.Code != test.status {
					t.Fatalf("expected %d, got %d: %s", test.status, response.Code, response.Body.String())
				}
				if test.status == http.StatusForbidden && decodeResponse(t, response).Message != "Only organization users can access this resource" {
					t.Fatalf("unexpected role rejection: %s", response.Body.String())
				}
			})
		}
	}
}

func TestCreateOrganizationCampaignValidation(t *testing.T) {
	const secret = "test-secret"
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": 1, "role": "organization", "exp": time.Now().Add(time.Hour).Unix(),
	}).SignedString([]byte(secret))
	if err != nil {
		t.Fatal(err)
	}
	e := echo.New()
	routes.RegisterRoutesWithAuth(
		e, handlers.NewAuthHandler(nil), nil, nil, nil, nil, nil, nil, nil, nil,
		handlers.NewOrganizationDBHandler(nil), nil, secret,
	)
	for _, test := range []struct{ name, body, message string }{
		{"malformed body", `{`, "Invalid request body"},
		{"wrong field type", `{"target_kg":"ten"}`, "Invalid request body"},
		{"blank title", `{"title":"  "}`, "Campaign title is required"},
		{"zero target", `{"title":"Campaign","target_kg":0}`, "Target must be greater than zero"},
		{"negative target", `{"title":"Campaign","target_kg":-1}`, "Target must be greater than zero"},
		{"missing partners", `{"title":"Campaign","target_kg":10}`, "At least one partner waste bank is required"},
		{"missing start", `{"title":"Campaign","target_kg":10,"partner_waste_bank_ids":[1]}`, "Invalid start date"},
		{"invalid start", `{"title":"Campaign","target_kg":10,"partner_waste_bank_ids":[1],"start_date":"2026-02-30"}`, "Invalid start date"},
		{"missing end", `{"title":"Campaign","target_kg":10,"partner_waste_bank_ids":[1],"start_date":"2026-10-25"}`, "Invalid end date"},
		{"invalid end", `{"title":"Campaign","target_kg":10,"partner_waste_bank_ids":[1],"start_date":"2026-10-25","end_date":"tomorrow"}`, "Invalid end date"},
		{"reversed dates", `{"title":"Campaign","target_kg":10,"partner_waste_bank_ids":[1],"start_date":"2026-10-25","end_date":"2026-10-24"}`, "End date cannot be before start date"},
	} {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodPost, "/api/organization/campaigns", strings.NewReader(test.body))
			request.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			request.Header.Set(echo.HeaderAuthorization, "Bearer "+token)
			response := httptest.NewRecorder()
			e.ServeHTTP(response, request)
			if response.Code != http.StatusBadRequest || decodeResponse(t, response).Message != test.message {
				t.Fatalf("expected 400 %q, got %d: %s", test.message, response.Code, response.Body.String())
			}
		})
	}
}

func TestUpdateOrganizationCampaignStatusValidation(t *testing.T) {
	const secret = "test-secret"
	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": 1, "role": "organization", "exp": time.Now().Add(time.Hour).Unix(),
	}).SignedString([]byte(secret))
	if err != nil {
		t.Fatal(err)
	}
	e := echo.New()
	routes.RegisterRoutesWithAuth(
		e, handlers.NewAuthHandler(nil), nil, nil, nil, nil, nil, nil, nil, nil,
		handlers.NewOrganizationDBHandler(nil), nil, secret,
	)
	for _, test := range []struct{ name, id, body, message string }{
		{"non-numeric ID", "invalid", `{"status":"completed"}`, "Invalid campaign ID"},
		{"overflow ID", "9223372036854775808", `{"status":"completed"}`, "Invalid campaign ID"},
		{"zero ID", "0", `{"status":"completed"}`, "Invalid campaign ID"},
		{"negative ID", "-1", `{"status":"completed"}`, "Invalid campaign ID"},
		{"malformed body", "1", `{`, "Invalid request body"},
		{"wrong field type", "1", `{"status":123}`, "Invalid request body"},
		{"missing status", "1", `{}`, "Invalid campaign status"},
		{"empty status", "1", `{"status":""}`, "Invalid campaign status"},
		{"unknown status", "1", `{"status":"draft"}`, "Invalid campaign status"},
		{"wrong case", "1", `{"status":"Active"}`, "Invalid campaign status"},
	} {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodPatch, "/api/organization/campaigns/"+test.id+"/status", strings.NewReader(test.body))
			request.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			request.Header.Set(echo.HeaderAuthorization, "Bearer "+token)
			response := httptest.NewRecorder()
			e.ServeHTTP(response, request)
			if response.Code != http.StatusBadRequest || decodeResponse(t, response).Message != test.message {
				t.Fatalf("expected 400 %q, got %d: %s", test.message, response.Code, response.Body.String())
			}
		})
	}
}

func TestOrganizationRoutesUnavailableWithoutConfiguration(t *testing.T) {
	for _, test := range []struct {
		name    string
		handler *handlers.OrganizationDBHandler
		secret  string
	}{
		{name: "missing handler", secret: "test-secret"},
		{name: "missing JWT secret", handler: handlers.NewOrganizationDBHandler(nil)},
	} {
		t.Run(test.name, func(t *testing.T) {
			e := echo.New()
			routes.RegisterRoutesWithAuth(
				e, handlers.NewAuthHandler(nil), nil, nil, nil, nil, nil, nil, nil, nil, test.handler, nil, test.secret,
			)
			for _, endpoint := range []struct{ method, path string }{
				{http.MethodGet, "/api/organization/dashboard"},
				{http.MethodGet, "/api/organization/campaigns"},
				{http.MethodPost, "/api/organization/campaigns"},
				{http.MethodPatch, "/api/organization/campaigns/1/status"},
			} {
				response := httptest.NewRecorder()
				e.ServeHTTP(response, httptest.NewRequest(endpoint.method, endpoint.path, nil))
				if response.Code != http.StatusNotFound {
					t.Fatalf("expected 404, got %d: %s", response.Code, response.Body.String())
				}
			}
		})
	}
}
