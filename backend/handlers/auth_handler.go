package handlers

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/models"
	"github.com/noval110/ecolink/backend/services"
	"github.com/noval110/ecolink/backend/utils"
)

type AuthHandler struct {
	service *services.AuthService
}

type RegisterRequest struct {
	FullName string `json:"full_name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authResponse struct {
	Token string       `json:"token"`
	User  *models.User `json:"user"`
}

func NewAuthHandler(service *services.AuthService) *AuthHandler {
	return &AuthHandler{
		service: service,
	}
}

func (h *AuthHandler) Register(c echo.Context) error {
	if h.service == nil {
		return utils.ErrorResponse(
			c,
			http.StatusNotImplemented,
			"Register feature is not configured",
		)
	}

	var req RegisterRequest

	if err := c.Bind(&req); err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			"Invalid request body",
		)
	}

	user, token, err := h.service.Register(
		c.Request().Context(),
		req.FullName,
		req.Email,
		req.Password,
		req.Role,
	)

	switch {
	case errors.Is(err, services.ErrInvalidInput):
		return utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			"Full name, email, and password minimum 8 characters are required",
		)

	case errors.Is(err, services.ErrInvalidRole):
		return utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			"Invalid role",
		)

	case errors.Is(err, services.ErrEmailAlreadyRegistered):
		return utils.ErrorResponse(
			c,
			http.StatusConflict,
			"Email already registered",
		)

	case err != nil:
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to register user",
		)
	}

	return utils.SuccessResponse(
		c,
		http.StatusCreated,
		"Registration successful",
		authResponse{
			Token: token,
			User:  user,
		},
	)
}

func (h *AuthHandler) Login(c echo.Context) error {
	if h.service == nil {
		return utils.ErrorResponse(
			c,
			http.StatusNotImplemented,
			"Login feature is not configured",
		)
	}

	var req LoginRequest

	if err := c.Bind(&req); err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			"Invalid request body",
		)
	}

	user, token, err := h.service.Login(
		c.Request().Context(),
		req.Email,
		req.Password,
	)

	switch {
	case errors.Is(err, services.ErrInvalidCredentials):
		return utils.ErrorResponse(
			c,
			http.StatusUnauthorized,
			"Invalid email or password",
		)

	case errors.Is(err, services.ErrInactiveUser):
		return utils.ErrorResponse(
			c,
			http.StatusForbidden,
			"User account is inactive",
		)

	case err != nil:
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to login",
		)
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Login successful",
		authResponse{
			Token: token,
			User:  user,
		},
	)
}