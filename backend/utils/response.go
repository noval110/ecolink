package utils

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func SuccessResponse(c echo.Context, status int, message string, data interface{}) error {
	return c.JSON(status, APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func ErrorResponse(c echo.Context, status int, message string) error {
	return c.JSON(status, APIResponse{
		Success: false,
		Message: message,
	})
}

func NotFoundResponse(c echo.Context, message string) error {
	return ErrorResponse(c, http.StatusNotFound, message)
}
