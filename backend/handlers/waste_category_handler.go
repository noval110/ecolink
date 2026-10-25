package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/mock"
	"github.com/noval110/ecolink/backend/repositories"
	"github.com/noval110/ecolink/backend/utils"
)

func GetWasteCategories(c echo.Context) error {
	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Waste categories loaded",
		mock.ListWasteCategories(),
	)
}

type WasteCategoryHandler struct {
	repository *repositories.WasteCategoryRepository
}

func NewWasteCategoryHandler(
	repository *repositories.WasteCategoryRepository,
) *WasteCategoryHandler {
	return &WasteCategoryHandler{
		repository: repository,
	}
}

func (h *WasteCategoryHandler) List(c echo.Context) error {
	categories, err := h.repository.List(
		c.Request().Context(),
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load waste categories",
		)
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Waste categories loaded",
		categories,
	)
}
