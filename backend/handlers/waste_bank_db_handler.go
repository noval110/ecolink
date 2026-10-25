package handlers

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/repositories"
	"github.com/noval110/ecolink/backend/utils"
)

type WasteBankDBHandler struct {
	repository *repositories.WasteBankRepository
}

func NewWasteBankDBHandler(
	repository *repositories.WasteBankRepository,
) *WasteBankDBHandler {
	return &WasteBankDBHandler{
		repository: repository,
	}
}

func (h *WasteBankDBHandler) List(c echo.Context) error {
	wasteBanks, err := h.repository.List(
		c.Request().Context(),
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load waste banks",
		)
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Waste banks loaded",
		wasteBanks,
	)
}

func (h *WasteBankDBHandler) Detail(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			"Invalid waste bank ID",
		)
	}

	wasteBank, err := h.repository.GetByID(
		c.Request().Context(),
		id,
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load waste bank",
		)
	}

	if wasteBank == nil {
		return utils.NotFoundResponse(
			c,
			"Waste bank not found",
		)
	}

	prices, err := h.repository.GetPrices(
		c.Request().Context(),
		id,
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load waste bank prices",
		)
	}

	data := struct {
		*repositories.WasteBank
		AcceptedMaterials []repositories.WasteBankPrice `json:"accepted_materials"`
	}{
		WasteBank:        wasteBank,
		AcceptedMaterials: prices,
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Waste bank detail loaded",
		data,
	)
}

func (h *WasteBankDBHandler) Prices(c echo.Context) error {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			"Invalid waste bank ID",
		)
	}

	wasteBank, err := h.repository.GetByID(
		c.Request().Context(),
		id,
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load waste bank",
		)
	}

	if wasteBank == nil {
		return utils.NotFoundResponse(
			c,
			"Waste bank not found",
		)
	}

	prices, err := h.repository.GetPrices(
		c.Request().Context(),
		id,
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load waste bank prices",
		)
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Waste bank prices loaded",
		prices,
	)
}