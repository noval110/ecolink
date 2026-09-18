package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/utils"
)

func RequireRole(roles ...string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			return utils.ErrorResponse(
				c,
				http.StatusForbidden,
				"Role middleware is not implemented yet",
			)
		}
	}
}
