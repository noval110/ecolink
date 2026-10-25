package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/repositories"
	"github.com/noval110/ecolink/backend/utils"
)

type PassportHandler struct {
	repository *repositories.PassportRepository
}

func NewPassportHandler(
	repository *repositories.PassportRepository,
) *PassportHandler {
	return &PassportHandler{
		repository: repository,
	}
}

func (h *PassportHandler) GetPassport(
	c echo.Context,
) error {
	userID, ok :=
		c.Get("user_id").(int64)

	if !ok {
		return utils.ErrorResponse(
			c,
			http.StatusUnauthorized,
			"Invalid authenticated user",
		)
	}

	passport, err :=
		h.repository.GetByUserID(
			c.Request().Context(),
			userID,
		)

	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load Eco Passport",
		)
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Eco Passport loaded",
		passport,
	)
}