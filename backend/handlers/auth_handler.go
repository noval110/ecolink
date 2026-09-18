package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/utils"
)

type AuthHandler struct{}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

func (h *AuthHandler) Register(c echo.Context) error {
	return utils.ErrorResponse(
		c,
		http.StatusNotImplemented,
		"Register feature is not implemented yet",
	)
}

func (h *AuthHandler) Login(c echo.Context) error {
	return utils.ErrorResponse(
		c,
		http.StatusNotImplemented,
		"Login feature is not implemented yet",
	)
}
