package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/repositories"
	"github.com/noval110/ecolink/backend/utils"
)

type GamificationHandler struct {
	repository *repositories.GamificationRepository
}

func NewGamificationHandler(
	repository *repositories.GamificationRepository,
) *GamificationHandler {
	return &GamificationHandler{
		repository: repository,
	}
}

func (h *GamificationHandler) MyMissions(
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

	missions, err :=
		h.repository.ListMissionsByUser(
			c.Request().Context(),
			userID,
		)

	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load missions",
		)
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Missions loaded",
		missions,
	)
}

func (h *GamificationHandler) MyBadges(
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

	badges, err :=
		h.repository.ListBadgesByUser(
			c.Request().Context(),
			userID,
		)

	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load badges",
		)
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Badges loaded",
		badges,
	)
}