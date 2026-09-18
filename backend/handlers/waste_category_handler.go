package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/mock"
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
