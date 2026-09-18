package handlers

import (
	"errors"
	"math"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/mock"
	"github.com/noval110/ecolink/backend/utils"
)

type TransactionItemRequest struct {
	WasteCategoryID string  `json:"waste_category_id"`
	Weight          float64 `json:"weight"`
}

type CreateTransactionRequest struct {
	UserID      string                   `json:"user_id"`
	WasteBankID string                   `json:"waste_bank_id"`
	CampaignID  string                   `json:"campaign_id"`
	Items       []TransactionItemRequest `json:"items"`
}

type transactionUserResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type transactionWasteBankResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type transactionCampaignResponse struct {
	ID    string `json:"id"`
	Title string `json:"title"`
}

type transactionItemResponse struct {
	WasteCategoryID   string  `json:"waste_category_id"`
	WasteCategoryName string  `json:"waste_category_name"`
	Weight            float64 `json:"weight"`
	UnitPrice         int     `json:"unit_price"`
	Subtotal          int     `json:"subtotal"`
}

type transactionImpactResponse struct {
	ImpactAdded   float64 `json:"impact_added"`
	EcoScoreAdded int     `json:"eco_score_added"`
	CO2Avoided    float64 `json:"co2_avoided"`
}

type createTransactionResponse struct {
	TransactionID string                    `json:"transaction_id"`
	UserID        string                    `json:"user_id"`
	WasteBankID   string                    `json:"waste_bank_id"`
	CampaignID    *string                   `json:"campaign_id"`
	Status        string                    `json:"status"`
	TotalWeight   float64                   `json:"total_weight"`
	TotalValue    int                       `json:"total_value"`
	Items         []transactionItemResponse `json:"items"`
	CreatedAt     string                    `json:"created_at"`
}

type transactionHistoryResponse struct {
	ID          string                       `json:"id"`
	WasteBank   transactionWasteBankResponse `json:"waste_bank"`
	Campaign    *transactionCampaignResponse `json:"campaign"`
	Items       []transactionItemResponse    `json:"items"`
	TotalWeight float64                      `json:"total_weight"`
	TotalValue  int                          `json:"total_value"`
	Status      string                       `json:"status"`
	CreatedAt   string                       `json:"created_at"`
	VerifiedAt  *string                      `json:"verified_at"`
}

type transactionDetailResponse struct {
	TransactionID string                       `json:"transaction_id"`
	User          transactionUserResponse      `json:"user"`
	WasteBank     transactionWasteBankResponse `json:"waste_bank"`
	Campaign      *transactionCampaignResponse `json:"campaign"`
	Items         []transactionItemResponse    `json:"items"`
	TotalWeight   float64                      `json:"total_weight"`
	TotalValue    int                          `json:"total_value"`
	Status        string                       `json:"status"`
	CreatedAt     string                       `json:"created_at"`
	VerifiedAt    *string                      `json:"verified_at"`
	Impact        transactionImpactResponse    `json:"impact"`
}

type verifyTransactionResponse struct {
	TransactionID         string  `json:"transaction_id"`
	Status                string  `json:"status"`
	TotalWeight           float64 `json:"total_weight"`
	TotalValue            int     `json:"total_value"`
	ImpactAdded           float64 `json:"impact_added"`
	EcoScoreAdded         int     `json:"eco_score_added"`
	CampaignProgressAdded float64 `json:"campaign_progress_added"`
	VerifiedAt            string  `json:"verified_at"`
}

func CreateTransaction(c echo.Context) error {
	var req CreateTransactionRequest
	if err := c.Bind(&req); err != nil {
		return utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
	}

	if req.UserID == "" {
		return utils.ErrorResponse(c, http.StatusBadRequest, "User ID is required")
	}
	if req.WasteBankID == "" {
		return utils.ErrorResponse(c, http.StatusBadRequest, "Waste bank ID is required")
	}
	if len(req.Items) == 0 {
		return utils.ErrorResponse(c, http.StatusBadRequest, "At least one item is required")
	}
	for _, item := range req.Items {
		if item.WasteCategoryID == "" {
			return utils.ErrorResponse(c, http.StatusBadRequest, "Waste category ID is required")
		}
		if item.Weight <= 0 {
			return utils.ErrorResponse(c, http.StatusBadRequest, "Weight must be greater than 0")
		}
	}

	if _, found := mock.GetUser(req.UserID); !found {
		return utils.NotFoundResponse(c, "User not found")
	}
	if _, found := mock.GetWasteBank(req.WasteBankID); !found {
		return utils.NotFoundResponse(c, "Waste bank not found")
	}
	if req.CampaignID != "" {
		if _, found := mock.GetCampaign(req.CampaignID); !found {
			return utils.NotFoundResponse(c, "Campaign not found")
		}
	}

	items := make([]transactionItemResponse, 0, len(req.Items))
	var totalWeight float64
	var totalValue int
	for _, item := range req.Items {
		category, found := mock.GetWasteCategory(item.WasteCategoryID)
		if !found {
			return utils.NotFoundResponse(c, "Waste category not found")
		}

		unitPrice, found := mock.GetWasteBankPrice(req.WasteBankID, item.WasteCategoryID)
		if !found {
			return utils.ErrorResponse(
				c,
				http.StatusBadRequest,
				"Waste category is not accepted by this waste bank",
			)
		}

		subtotal := int(math.Round(float64(unitPrice) * item.Weight))
		totalWeight += item.Weight
		totalValue += subtotal
		items = append(items, transactionItemResponse{
			WasteCategoryID:   category.ID,
			WasteCategoryName: category.Name,
			Weight:            item.Weight,
			UnitPrice:         unitPrice,
			Subtotal:          subtotal,
		})
	}

	data := createTransactionResponse{
		TransactionID: "trx_005",
		UserID:        req.UserID,
		WasteBankID:   req.WasteBankID,
		CampaignID:    optionalString(req.CampaignID),
		Status:        "pending",
		TotalWeight:   totalWeight,
		TotalValue:    totalValue,
		Items:         items,
		CreatedAt:     time.Now().Format(time.RFC3339),
	}

	return utils.SuccessResponse(c, http.StatusCreated, "Transaction created", data)
}

func GetMyTransactions(c echo.Context) error {
	status := c.QueryParam("status")
	if status != "" && status != "pending" && status != "verified" {
		return utils.ErrorResponse(c, http.StatusBadRequest, "Status must be pending or verified")
	}

	transactions := mock.ListUserTransactions("usr_001", status)
	data := make([]transactionHistoryResponse, 0, len(transactions))
	for _, transaction := range transactions {
		data = append(data, buildTransactionHistory(transaction))
	}

	return utils.SuccessResponse(c, http.StatusOK, "Transactions loaded", data)
}

func GetTransactionByID(c echo.Context) error {
	transaction, found := mock.GetTransaction(c.Param("id"))
	if !found {
		return utils.NotFoundResponse(c, "Transaction not found")
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Transaction detail loaded",
		buildTransactionDetail(transaction),
	)
}

func VerifyTransaction(c echo.Context) error {
	verifiedAt := time.Now().Format(time.RFC3339)
	transaction, err := mock.VerifyTransaction(c.Param("id"), verifiedAt)
	if errors.Is(err, mock.ErrTransactionNotFound) {
		return utils.NotFoundResponse(c, "Transaction not found")
	}
	if errors.Is(err, mock.ErrTransactionAlreadyVerified) {
		return utils.ErrorResponse(c, http.StatusBadRequest, "Transaction already verified")
	}
	if err != nil {
		return utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to verify transaction")
	}

	campaignProgressAdded := 0.0
	if transaction.CampaignID != "" {
		campaignProgressAdded = transaction.TotalWeight
	}

	data := verifyTransactionResponse{
		TransactionID:         transaction.ID,
		Status:                transaction.Status,
		TotalWeight:           transaction.TotalWeight,
		TotalValue:            transaction.TotalValue,
		ImpactAdded:           transaction.TotalWeight,
		EcoScoreAdded:         int(math.Round(transaction.TotalWeight * 10)),
		CampaignProgressAdded: campaignProgressAdded,
		VerifiedAt:            transaction.VerifiedAt,
	}

	return utils.SuccessResponse(c, http.StatusOK, "Transaction verified", data)
}

func buildTransactionHistory(transaction mock.Transaction) transactionHistoryResponse {
	wasteBank, _ := mock.GetWasteBank(transaction.WasteBankID)
	return transactionHistoryResponse{
		ID: transaction.ID,
		WasteBank: transactionWasteBankResponse{
			ID:   wasteBank.ID,
			Name: wasteBank.Name,
		},
		Campaign:    buildTransactionCampaign(transaction.CampaignID),
		Items:       buildTransactionItems(transaction.Items),
		TotalWeight: transaction.TotalWeight,
		TotalValue:  transaction.TotalValue,
		Status:      transaction.Status,
		CreatedAt:   transaction.CreatedAt,
		VerifiedAt:  optionalString(transaction.VerifiedAt),
	}
}

func buildTransactionDetail(transaction mock.Transaction) transactionDetailResponse {
	user, _ := mock.GetUser(transaction.UserID)
	wasteBank, _ := mock.GetWasteBank(transaction.WasteBankID)

	return transactionDetailResponse{
		TransactionID: transaction.ID,
		User: transactionUserResponse{
			ID:   user.ID,
			Name: user.Name,
		},
		WasteBank: transactionWasteBankResponse{
			ID:   wasteBank.ID,
			Name: wasteBank.Name,
		},
		Campaign:    buildTransactionCampaign(transaction.CampaignID),
		Items:       buildTransactionItems(transaction.Items),
		TotalWeight: transaction.TotalWeight,
		TotalValue:  transaction.TotalValue,
		Status:      transaction.Status,
		CreatedAt:   transaction.CreatedAt,
		VerifiedAt:  optionalString(transaction.VerifiedAt),
		Impact: transactionImpactResponse{
			ImpactAdded:   transactionImpact(transaction),
			EcoScoreAdded: transactionEcoScore(transaction),
			CO2Avoided:    transactionCO2Avoided(transaction),
		},
	}
}

func buildTransactionItems(items []mock.TransactionItem) []transactionItemResponse {
	result := make([]transactionItemResponse, 0, len(items))
	for _, item := range items {
		category, _ := mock.GetWasteCategory(item.WasteCategoryID)
		result = append(result, transactionItemResponse{
			WasteCategoryID:   category.ID,
			WasteCategoryName: category.Name,
			Weight:            item.Weight,
			UnitPrice:         item.UnitPrice,
			Subtotal:          item.Subtotal,
		})
	}
	return result
}

func buildTransactionCampaign(campaignID string) *transactionCampaignResponse {
	if campaignID == "" {
		return nil
	}
	campaign, found := mock.GetCampaign(campaignID)
	if !found {
		return nil
	}
	return &transactionCampaignResponse{ID: campaign.ID, Title: campaign.Title}
}

func transactionImpact(transaction mock.Transaction) float64 {
	if transaction.Status != "verified" {
		return 0
	}
	return transaction.TotalWeight
}

func transactionEcoScore(transaction mock.Transaction) int {
	return int(math.Round(transactionImpact(transaction) * 10))
}

func transactionCO2Avoided(transaction mock.Transaction) float64 {
	return transactionImpact(transaction) * 0.6
}

func optionalString(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}
