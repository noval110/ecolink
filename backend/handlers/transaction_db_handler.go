package handlers

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/repositories"
	"github.com/noval110/ecolink/backend/utils"
)

type TransactionDBHandler struct {
	repository *repositories.TransactionRepository
}

func NewTransactionDBHandler(
	repository *repositories.TransactionRepository,
) *TransactionDBHandler {
	return &TransactionDBHandler{
		repository: repository,
	}
}

type createDBTransactionItemRequest struct {
	WasteCategoryID int64   `json:"waste_category_id"`
	Weight          float64 `json:"weight"`
}

type createDBTransactionRequest struct {
	WasteBankID int64                            `json:"waste_bank_id"`
	CampaignID  *int64                           `json:"campaign_id"`
	Items       []createDBTransactionItemRequest `json:"items"`
}

func (h *TransactionDBHandler) Create(
	c echo.Context,
) error {
	userID, ok := c.Get("user_id").(int64)
	if !ok {
		return utils.ErrorResponse(
			c,
			http.StatusUnauthorized,
			"Invalid authenticated user",
		)
	}

	role, ok := c.Get("role").(string)
	if !ok || role != "user" {
		return utils.ErrorResponse(
			c,
			http.StatusForbidden,
			"Only individual users can create transactions",
		)
	}

	var req createDBTransactionRequest

	if err := c.Bind(&req); err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			"Invalid request body",
		)
	}

	if req.WasteBankID <= 0 {
		return utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			"Valid waste bank ID is required",
		)
	}

	if len(req.Items) == 0 {
		return utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			"At least one item is required",
		)
	}

	seenCategories := make(map[int64]bool)

	items := make(
		[]repositories.CreateTransactionItemInput,
		0,
		len(req.Items),
	)

	for _, item := range req.Items {
		if item.WasteCategoryID <= 0 {
			return utils.ErrorResponse(
				c,
				http.StatusBadRequest,
				"Valid waste category ID is required",
			)
		}

		if item.Weight <= 0 {
			return utils.ErrorResponse(
				c,
				http.StatusBadRequest,
				"Weight must be greater than 0",
			)
		}

		if seenCategories[item.WasteCategoryID] {
			return utils.ErrorResponse(
				c,
				http.StatusBadRequest,
				"Duplicate waste category is not allowed",
			)
		}

		seenCategories[item.WasteCategoryID] = true

		items = append(
			items,
			repositories.CreateTransactionItemInput{
				WasteCategoryID: item.WasteCategoryID,
				Weight:          item.Weight,
			},
		)
	}

	transaction, err := h.repository.Create(
		c.Request().Context(),
		userID,
		req.WasteBankID,
		req.CampaignID,
		items,
	)

	switch {
	case errors.Is(
		err,
		repositories.ErrTransactionWasteBankNotFound,
	):
		return utils.NotFoundResponse(
			c,
			"Waste bank not found",
		)

	case errors.Is(
		err,
		repositories.ErrTransactionCampaignNotFound,
	):
		return utils.NotFoundResponse(
			c,
			"Active campaign not found",
		)

	case errors.Is(
		err,
		repositories.ErrTransactionNotJoinedCampaign,
	):
		return utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			"Join the campaign before contributing to it",
		)

	case errors.Is(
		err,
		repositories.ErrTransactionCategoryNotAccepted,
	):
		return utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			"Waste category is not accepted by this waste bank",
		)

	case err != nil:
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to create transaction",
		)
	}

	return utils.SuccessResponse(
		c,
		http.StatusCreated,
		"Transaction created",
		transaction,
	)
}