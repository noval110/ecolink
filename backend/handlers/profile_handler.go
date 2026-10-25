package handlers

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/repositories"
	"github.com/noval110/ecolink/backend/utils"
)

type ProfileHandler struct {
	userRepository *repositories.UserRepository
}

type updateProfileRequest struct {
	FullName string  `json:"full_name"`
	Email    string  `json:"email"`
	Phone    *string `json:"phone"`
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

func (h *ProfileHandler) Update(c echo.Context) error {
	userID, ok := c.Get("user_id").(int64)
	if !ok {
		return utils.ErrorResponse(
			c,
			http.StatusUnauthorized,
			"Invalid authenticated user",
		)
	}

	var req updateProfileRequest
	if err := c.Bind(&req); err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			"Invalid request body",
		)
	}

	req.FullName = strings.TrimSpace(req.FullName)
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	if req.FullName == "" {
		return utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			"Full name is required",
		)
	}

	if req.Email == "" || !strings.Contains(req.Email, "@") {
		return utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			"Valid email is required",
		)
	}

	if req.Phone != nil {
		phone := strings.TrimSpace(*req.Phone)
		if phone == "" {
			req.Phone = nil
		} else {
			req.Phone = &phone
		}
	}

	user, err := h.userRepository.UpdateProfile(
		c.Request().Context(),
		userID,
		req.FullName,
		req.Email,
		req.Phone,
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to update profile",
		)
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Profile updated",
		user,
	)
}
