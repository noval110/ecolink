package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"

	"github.com/noval110/ecolink/backend/repositories"
	"github.com/noval110/ecolink/backend/utils"
)

type CampaignDBHandler struct {
	repository *repositories.CampaignRepository
}

type campaignJoinDBResponse struct {
	CampaignID int64  `json:"campaign_id"`
	UserID     int64  `json:"user_id"`
	Status     string `json:"status"`
	JoinedAt   string `json:"joined_at"`
}

func NewCampaignDBHandler(
	repository *repositories.CampaignRepository,
) *CampaignDBHandler {
	return &CampaignDBHandler{
		repository: repository,
	}
}

func (h *CampaignDBHandler) List(
	c echo.Context,
) error {
	campaigns, err := h.repository.List(
		c.Request().Context(),
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load campaigns",
		)
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Campaigns loaded",
		campaigns,
	)
}

func (h *CampaignDBHandler) Detail(
	c echo.Context,
) error {
	id, err := strconv.ParseInt(
		c.Param("id"),
		10,
		64,
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			"Invalid campaign ID",
		)
	}

	campaign, err := h.repository.GetByID(
		c.Request().Context(),
		id,
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load campaign",
		)
	}

	if campaign == nil {
		return utils.NotFoundResponse(
			c,
			"Campaign not found",
		)
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Campaign detail loaded",
		campaign,
	)
}

func (h *CampaignDBHandler) Join(c echo.Context) error {
	userID, ok := c.Get("user_id").(int64)
	if !ok {
		return utils.ErrorResponse(
			c,
			http.StatusUnauthorized,
			"Invalid authenticated user",
		)
	}

	role, ok := c.Get("role").(string)
	if !ok || role != "user" {
		return utils.ErrorResponse(
			c,
			http.StatusForbidden,
			"Only individual users can join campaigns",
		)
	}

	campaignID, err := strconv.ParseInt(
		c.Param("id"),
		10,
		64,
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			"Invalid campaign ID",
		)
	}

	campaign, err := h.repository.GetByID(
		c.Request().Context(),
		campaignID,
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to load campaign",
		)
	}

	if campaign == nil {
		return utils.NotFoundResponse(
			c,
			"Campaign not found",
		)
	}

	if campaign.Status == nil || *campaign.Status != "active" {
		return utils.ErrorResponse(
			c,
			http.StatusBadRequest,
			"Campaign is not active",
		)
	}

	joinedAt, created, err := h.repository.Join(
		c.Request().Context(),
		campaignID,
		userID,
	)
	if err != nil {
		return utils.ErrorResponse(
			c,
			http.StatusInternalServerError,
			"Failed to join campaign",
		)
	}

	if !created {
		return utils.ErrorResponse(
			c,
			http.StatusConflict,
			"User already joined this campaign",
		)
	}

	return utils.SuccessResponse(
		c,
		http.StatusOK,
		"Successfully joined campaign",
		campaignJoinDBResponse{
			CampaignID: campaignID,
			UserID:     userID,
			Status:     "joined",
			JoinedAt:   joinedAt.Format(time.RFC3339),
		},
	)
}
