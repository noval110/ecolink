package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/repositories"
	"github.com/noval110/ecolink/backend/utils"
)

type ProfileHandler struct {
	userRepository *repositories.UserRepository
}

func NewProfileHandler(
	userRepository *repositories.UserRepository,
) *ProfileHandler {
	return &ProfileHandler{
		userRepository: userRepository,
	}
}

func (h *ProfileHandler) GetProfile(c echo.Context) error {
	userID, ok := c.Get("user_id").(int64)
	if !ok {
		return utils.ErrorResponse(
			c,
			http.StatusUnauthorized,
			"Invalid authenticated user",
		)
	}

	user, err := h.userRepository.GetByID(
		c.Request().Context(),
		userID,
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load user profile",
		)
	}

	if user == nil {
		return utils.NotFoundResponse(
			c,
			"User not found",
		)
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Profile loaded",
		user,
	)
}