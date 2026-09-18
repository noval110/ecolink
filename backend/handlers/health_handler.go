package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/utils"
)

func GetHealth(c echo.Context) error {
	return utils.SuccessResponse(c, http.StatusOK, "EcoLink API is running", nil)
}
