package routes_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/routes"
)

type testResponse struct {
	Success bool            `json:"success"`
	Message string          `json:"message"`
	Data    json.RawMessage `json:"data"`
}

func TestHealthEndpoint(t *testing.T) {
	response := performRequest(t, http.MethodGet, "/api/health", "")
	if response.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", response.Code)
	}

	payload := decodeResponse(t, response)
	if !payload.Success || payload.Message != "EcoLink API is running" {
		t.Fatalf("unexpected health response: %+v", payload)
	}
}

func TestWasteCategoriesEndpoint(t *testing.T) {
	response := performRequest(t, http.MethodGet, "/api/waste-categories", "")
	if response.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", response.Code)
	}

	payload := decodeResponse(t, response)
	var categories []struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(payload.Data, &categories); err != nil {
		t.Fatalf("decode categories: %v", err)
	}
	if len(categories) != 5 {
		t.Fatalf("expected 5 categories, got %d", len(categories))
	}
}

func TestWasteBankPricesNotFound(t *testing.T) {
	response := performRequest(t, http.MethodGet, "/api/waste-banks/wb_999/prices", "")
	if response.Code != http.StatusNotFound {
		t.Fatalf("expected status 404, got %d", response.Code)
	}
}

func TestCreateTransactionCalculatesTotals(t *testing.T) {
	body := `{
		"user_id":"usr_001",
		"waste_bank_id":"wb_001",
		"campaign_id":"cmp_001",
		"items":[
			{"waste_category_id":"cat_pet","weight":2.8},
			{"waste_category_id":"cat_paper","weight":1.5}
		]
	}`
	response := performRequest(t, http.MethodPost, "/api/transactions", body)
	if response.Code != http.StatusCreated {
		t.Fatalf("expected status 201, got %d: %s", response.Code, response.Body.String())
	}

	payload := decodeResponse(t, response)
	var data struct {
		TotalWeight float64 `json:"total_weight"`
		TotalValue  int     `json:"total_value"`
	}
	if err := json.Unmarshal(payload.Data, &data); err != nil {
		t.Fatalf("decode transaction: %v", err)
	}
	if data.TotalWeight != 4.3 {
		t.Fatalf("expected total weight 4.3, got %v", data.TotalWeight)
	}
	if data.TotalValue != 12800 {
		t.Fatalf("expected total value 12800, got %d", data.TotalValue)
	}
}

func TestCreateTransactionRejectsInvalidWeight(t *testing.T) {
	body := `{
		"user_id":"usr_001",
		"waste_bank_id":"wb_001",
		"items":[{"waste_category_id":"cat_pet","weight":0}]
	}`
	response := performRequest(t, http.MethodPost, "/api/transactions", body)
	if response.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", response.Code)
	}
}

func TestTransactionStatusFilter(t *testing.T) {
	response := performRequest(t, http.MethodGet, "/api/me/transactions?status=pending", "")
	if response.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", response.Code)
	}

	payload := decodeResponse(t, response)
	var transactions []struct {
		Status string `json:"status"`
	}
	if err := json.Unmarshal(payload.Data, &transactions); err != nil {
		t.Fatalf("decode transactions: %v", err)
	}
	if len(transactions) == 0 {
		t.Fatal("expected at least one pending transaction")
	}
	for _, transaction := range transactions {
		if transaction.Status != "pending" {
			t.Fatalf("expected pending transaction, got %q", transaction.Status)
		}
	}
}

func TestOrganizationDashboardNotFound(t *testing.T) {
	response := performRequest(t, http.MethodGet, "/api/organizations/org_999/dashboard", "")
	if response.Code != http.StatusNotFound {
		t.Fatalf("expected status 404, got %d", response.Code)
	}
}

func TestAvailableReadEndpoints(t *testing.T) {
	tests := []struct {
		method string
		path   string
	}{
		{method: http.MethodGet, path: "/api/me/dashboard"},
		{method: http.MethodGet, path: "/api/me/passport"},
		{method: http.MethodGet, path: "/api/me/impact"},
		{method: http.MethodGet, path: "/api/me/transactions"},
		{method: http.MethodGet, path: "/api/waste-banks"},
		{method: http.MethodGet, path: "/api/waste-banks/wb_001"},
		{method: http.MethodGet, path: "/api/waste-banks/wb_001/prices"},
		{method: http.MethodGet, path: "/api/campaigns"},
		{method: http.MethodGet, path: "/api/campaigns/cmp_002"},
		{method: http.MethodGet, path: "/api/transactions/trx_001"},
		{method: http.MethodGet, path: "/api/organizations/org_001/dashboard"},
		{method: http.MethodPost, path: "/api/campaigns/cmp_001/join"},
		{method: http.MethodPut, path: "/api/transactions/trx_999/verify"},
	}

	for _, test := range tests {
		t.Run(test.method+" "+test.path, func(t *testing.T) {
			response := performRequest(t, test.method, test.path, "")
			expectedStatus := http.StatusOK
			if test.path == "/api/transactions/trx_999/verify" {
				expectedStatus = http.StatusNotFound
			}
			if response.Code != expectedStatus {
				t.Fatalf(
					"expected status %d, got %d: %s",
					expectedStatus,
					response.Code,
					response.Body.String(),
				)
			}
		})
	}
}

func performRequest(t *testing.T, method, path, body string) *httptest.ResponseRecorder {
	t.Helper()

	e := echo.New()
	routes.RegisterRoutes(e)
	request := httptest.NewRequest(method, path, strings.NewReader(body))
	if body != "" {
		request.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	}
	response := httptest.NewRecorder()
	e.ServeHTTP(response, request)
	return response
}

func decodeResponse(t *testing.T, response *httptest.ResponseRecorder) testResponse {
	t.Helper()

	var payload testResponse
	if err := json.Unmarshal(response.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	return payload
}
